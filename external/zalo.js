const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Để xử lý CORS nếu frontend gọi từ domain khác
const zlib = require('zlib');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 3999; // Có thể thay đổi port nếu cần

// Cấu hình rate limiting
const RATE_LIMIT_CONFIG = {
    requestsPerSecond: 5,        // Số request tối đa mỗi giây
    delayBetweenRequests: 250,   // Delay giữa các request (ms) - 250ms = 4 req/s
    batchSize: 50,                // Xử lý theo lô, mỗi lô 50 request
    delayBetweenBatches: 2000,   // Delay giữa các lô (ms)
    maxRetries: 3,                // Số lần retry khi gặp lỗi
    retryDelay: 1000,             // Delay giữa các lần retry (ms)
    concurrentRequests: 3         // Số request đồng thời tối đa
};

// Cấu hình multer để upload file
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Sử dụng CORS middleware
app.use(cors());

// Middleware để parse JSON body
app.use(express.json());

// Queue management
class RequestQueue {
    constructor(config) {
        this.config = config;
        this.queue = [];
        this.isProcessing = false;
        this.results = [];
    }

    async add(item) {
        this.queue.push(item);
    }

    async processWithRetry(requestFn, retries = RATE_LIMIT_CONFIG.maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const result = await requestFn();
                
                // Kiểm tra nếu response có error code từ Zalo
                if (result.error && result.error !== 0) {
                    // Nếu là lỗi rate limit (429), retry
                    if (result.error === -429 || result.error === 429) {
                        if (attempt < retries) {
                            console.log(`Rate limit hit, retrying... (${attempt}/${retries})`);
                            await this.delay(RATE_LIMIT_CONFIG.retryDelay * attempt); // Exponential backoff
                            continue;
                        }
                    }
                    // Các lỗi khác không retry
                    return result;
                }
                
                return result;
            } catch (error) {
                // Nếu là lỗi 429 từ HTTP status
                if (error.response?.status === 429 && attempt < retries) {
                    console.log(`429 error, retrying... (${attempt}/${retries})`);
                    await this.delay(RATE_LIMIT_CONFIG.retryDelay * attempt * 2); // Longer wait for 429
                    continue;
                }
                
                // Lỗi khác hoặc hết retry
                if (attempt === retries) {
                    throw error;
                }
                
                await this.delay(RATE_LIMIT_CONFIG.retryDelay * attempt);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async processBatch(batch, template_id, access_token) {
        const results = [];
        
        // Xử lý concurrent requests trong batch
        for (let i = 0; i < batch.length; i += this.config.concurrentRequests) {
            const chunk = batch.slice(i, i + this.config.concurrentRequests);
            
            const chunkPromises = chunk.map(async (item) => {
                const { row, phone, customer_name, customer_id, tracking_id } = item;
                
                try {
                    const requestFn = async () => {
                        let data = JSON.stringify({
                            "phone": phone.toString(),
                            "template_id": template_id,
                            "template_data": {
                                "customer_name": customer_name,
                                "customer_id": customer_id.toString()
                            },
                            "tracking_id": tracking_id
                        });

                        let config = {
                            method: 'post',
                            maxBodyLength: Infinity,
                            url: 'https://business.openapi.zalo.me/message/template',
                            headers: { 
                                'access_token': access_token,
                                'Content-Type': 'application/json'
                            },
                            data: data,
                            timeout: 10000 // 10 second timeout
                        };

                        const response = await axios.request(config);
                        return response.data;
                    };

                    const zaloResponse = await this.processWithRetry(requestFn);
                    
                    if (zaloResponse.error && zaloResponse.error !== 0) {
                        return {
                            row: row,
                            phone: phone,
                            customer_name: customer_name,
                            customer_id: customer_id,
                            status: 'failed',
                            error: getZaloErrorMessage(zaloResponse.error),
                            errorCode: zaloResponse.error,
                            response: zaloResponse
                        };
                    } else {
                        return {
                            row: row,
                            phone: phone,
                            customer_name: customer_name,
                            customer_id: customer_id,
                            status: 'success',
                            response: zaloResponse
                        };
                    }
                } catch (error) {
                    return {
                        row: row,
                        phone: phone,
                        customer_name: customer_name,
                        customer_id: customer_id,
                        status: 'failed',
                        error: error.message,
                        errorCode: error.response?.status,
                        details: error.response?.data
                    };
                }
            });

            // Đợi chunk hoàn thành
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
            
            // Delay giữa các chunk trong batch
            if (i + this.config.concurrentRequests < batch.length) {
                await this.delay(this.config.delayBetweenRequests);
            }
        }
        
        return results;
    }

    async processQueue(template_id, access_token, progressCallback) {
        this.isProcessing = true;
        this.results = [];
        
        const totalItems = this.queue.length;
        let processedItems = 0;
        
        // Chia thành các batch
        for (let i = 0; i < this.queue.length; i += this.config.batchSize) {
            const batch = this.queue.slice(i, i + this.config.batchSize);
            const batchNumber = Math.floor(i / this.config.batchSize) + 1;
            const totalBatches = Math.ceil(this.queue.length / this.config.batchSize);
            
            console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
            
            // Xử lý batch
            const batchResults = await this.processBatch(batch, template_id, access_token);
            this.results.push(...batchResults);
            
            processedItems += batch.length;
            
            // Callback để update progress
            if (progressCallback) {
                progressCallback({
                    total: totalItems,
                    processed: processedItems,
                    current_batch: batchNumber,
                    total_batches: totalBatches,
                    percentage: ((processedItems / totalItems) * 100).toFixed(2)
                });
            }
            
            // Delay giữa các batch (trừ batch cuối)
            if (i + this.config.batchSize < this.queue.length) {
                console.log(`Waiting ${this.config.delayBetweenBatches}ms before next batch...`);
                await this.delay(this.config.delayBetweenBatches);
            }
        }
        
        this.isProcessing = false;
        return this.results;
    }
}

// Helper function để map error code Zalo sang message
function getZaloErrorMessage(errorCode) {
    const errorMessages = {
        0: 'Thành công',
        [-108]: 'Số điện thoại không hợp lệ',
        [-118]: 'Tài khoản Zalo không tồn tại',
        [-124]: 'Access token không hợp lệ hoặc đã hết hạn',
        [-131]: 'Template ZNS chưa được duyệt',
        [-132]: 'Template ZNS không tồn tại',
        [-201]: 'Thiếu tham số bắt buộc',
        [-216]: 'Quota ZNS đã hết',
        [-217]: 'Template data không hợp lệ',
        [-218]: 'Template data thiếu tham số',
        [-429]: 'Quá nhiều request - Rate limit exceeded',
        [429]: 'Quá nhiều request - Rate limit exceeded',
    };
    
    return errorMessages[errorCode] || `Lỗi Zalo API: ${errorCode}`;
}

// Endpoint để gửi ZNS
app.post('/sendzns', async (req, res) => {
    try {
        const { phone, template_id, customer_name, customer_id, tracking_id,access_token } = req.body;

        // Validate required fields
        if (!phone || !template_id || !customer_name || !customer_id || !tracking_id) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['phone', 'template_id', 'customer_name', 'customer_id', 'tracking_id']
            });
        }

        let data = JSON.stringify({
            // "mode": "development",
            "phone": phone,
            "template_id": template_id,
            "template_data": {
                "customer_name": customer_name,
                "customer_id": customer_id
            },
            "tracking_id": tracking_id
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://business.openapi.zalo.me/message/template',
            headers: { 
                'access_token': access_token,
                'Content-Type': 'application/json'
            },
            data: data
        };

        
        const response = await axios.request(config);
        
        // Kiểm tra response từ Zalo API
        const zaloResponse = response.data;
        
        // Zalo trả về error code trong response.data
        if (zaloResponse.error && zaloResponse.error !== 0) {
            return res.status(400).json({
                success: false,
                error: getZaloErrorMessage(zaloResponse.error),
                errorCode: zaloResponse.error,
                details: zaloResponse
            });
        }
        
        res.json({
            success: true,
            data: zaloResponse
        });

    } catch (error) {
        console.error('Error sending ZNS:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});

// Endpoint để gửi ZNS hàng loạt từ file Excel
app.post('/sendzns/bulk', upload.single('file'), async (req, res) => {
    try {
        const { template_id, access_token } = req.body;

        // Validate required fields
        if (!template_id || !access_token) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['template_id', 'access_token', 'file']
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                required: ['file (Excel file)']
            });
        }

        // Đọc file Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validate data structure
        if (data.length === 0) {
            return res.status(400).json({
                error: 'Excel file is empty',
                hint: 'File phải có ít nhất 1 dòng dữ liệu'
            });
        }

        // Kiểm tra các cột bắt buộc
        const requiredColumns = ['phone', 'customer_name', 'customer_id'];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({
                error: 'Missing required columns in Excel',
                missing: missingColumns,
                hint: 'File Excel cần có các cột: phone, customer_name, customer_id'
            });
        }

        // Tạo queue và thêm items
        const queue = new RequestQueue(RATE_LIMIT_CONFIG);
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const tracking_id = `BULK_${Date.now()}_${i}`;
            
            await queue.add({
                row: i + 1,
                phone: row.phone,
                customer_name: row.customer_name,
                customer_id: row.customer_id,
                tracking_id: tracking_id
            });
        }

        console.log(`Starting bulk send: ${data.length} items in queue`);
        console.log(`Rate limit config:`, {
            batchSize: RATE_LIMIT_CONFIG.batchSize,
            delayBetweenRequests: RATE_LIMIT_CONFIG.delayBetweenRequests,
            delayBetweenBatches: RATE_LIMIT_CONFIG.delayBetweenBatches,
            concurrentRequests: RATE_LIMIT_CONFIG.concurrentRequests
        });

        // Xử lý queue với progress tracking
        const results = await queue.processQueue(template_id, access_token, (progress) => {
            console.log(`Progress: ${progress.percentage}% (${progress.processed}/${progress.total}) - Batch ${progress.current_batch}/${progress.total_batches}`);
        });

        // Tính toán kết quả
        const successCount = results.filter(r => r.status === 'success').length;
        const failCount = results.filter(r => r.status === 'failed').length;

        // Phân tích lỗi
        const errorBreakdown = {};
        results.forEach(result => {
            if (result.status === 'failed' && result.errorCode) {
                errorBreakdown[result.errorCode] = (errorBreakdown[result.errorCode] || 0) + 1;
            }
        });

        // Xóa file đã upload
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            summary: {
                total: data.length,
                success: successCount,
                failed: failCount,
                successRate: ((successCount / data.length) * 100).toFixed(2) + '%',
                errorBreakdown: errorBreakdown
            },
            config: {
                batchSize: RATE_LIMIT_CONFIG.batchSize,
                totalBatches: Math.ceil(data.length / RATE_LIMIT_CONFIG.batchSize),
                delayBetweenRequests: RATE_LIMIT_CONFIG.delayBetweenRequests,
                delayBetweenBatches: RATE_LIMIT_CONFIG.delayBetweenBatches
            },
            results: results
        });

    } catch (error) {
        console.error('Error processing bulk ZNS:', error);
        
        // Xóa file nếu có lỗi
        if (req.file) {
            const fs = require('fs');
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        }

        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});


// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});