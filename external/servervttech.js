const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const zlib = require('zlib');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function to decompress VTTECH response (Base64 + Gzip)
// VTTECH returns data as: Base64 Encoded + Gzip Compressed
function decompressVTTECHData(encodedData) {
    try {
        if (!encodedData || typeof encodedData !== 'string') return encodedData;
        // Convert Base64 string to Buffer
        const buffer = Buffer.from(encodedData, 'base64');
        // Decompress using gzip
        const decompressed = zlib.gunzipSync(buffer);
        // Parse JSON
        return JSON.parse(decompressed.toString('utf8'));
    } catch (error) {
        console.warn('Could not decompress VTTECH data:', error.message);
        // Fallback: try parsing as plain JSON
        try {
            return JSON.parse(encodedData);
        } catch {
            // Return as-is if all parsing fails
            return encodedData;
        }
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML)
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'VTTECH Server is running' });
});

/**
 * Fetch customers from VTTECH API
 * POST /api/customers
 * Body: { cookie, xsrfToken }
 */
app.post('/api/customers', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Marketing/FilterCustomer/?handler=LoadataCustomer&Cust_DFrom=1900-01-01&Cust_DTo=1900-01-01&App_DFrom=1900-01-01&App_DTo=1900-01-01&App_TimeDFrom=0&App_TimeDTo=0&App_Status=0&Tab_DFrom=1900-01-01&Tab_DTo=1900-01-01&Tab_service=&Tab_serviceType=&Tab_IsChoose=1&Tab_Insurance=0&TabStatus=2&Treat_DFrom=1900-01-01&Treat_DTo=1900-01-01&Treat_Service=&Treat_ServiceType=&Treat_LastDFrom=1900-01-01&Treat_LastDTo=1900-01-01&TreatStatus=0&PaidCreated_DFrom=1900-01-01&PaidCreated_DTo=1900-01-01&PaidTotalFrom=199000&PaidTotalTo=700000000&PaidStatus=0&CusBranch=%2C3%2C&CusGroup=&CusGender=0&CusAgeFrom=0&CusAgeTo=0&CustBirthF=00-00&CustBirthT=00-00&CusSource=&CusBroker=0&CusCity=0&CusDistrict=NaN&CusCommune=0&CustCarrer=&CustTele=0&CustCareID=0&CustNation=0&CustDFromDef=1900-01-01&CustDToDef=1900-01-01&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 // 30 seconds timeout
        };

        console.log('Fetching customers from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching customers:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Verify credentials
 * POST /api/verify-credentials
 * Body: { cookie, xsrfToken }
 */
app.post('/api/verify-credentials', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Cookie and Xsrf-Token are required'
            });
        }

        // Simple test request to verify credentials
        const config = {
            method: 'post',
            url: 'https://tmtaza.vttechsolution.com/Marketing/FilterCustomer/?handler=LoadataCustomer&limit=1',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        };

        try {
            const response = await axios.request(config);
            const decodedData = decompressVTTECHData(response.data);
            res.json({
                success: true,
                valid: true,
                message: 'Credentials are valid',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.json({
                success: false,
                valid: false,
                message: error.response?.status === 401 ? 'Unauthorized - Invalid credentials' : error.message,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            valid: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Fetch employees from VTTECH API
 * POST /api/employees
 * Body: { cookie, xsrfToken }
 */
app.post('/api/employees', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Employee/EmployeeList/?handler=LoadataEmployee',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching employees from VTTECH API...');
        const response = await axios.request(config);
        console.log('response',response);
        
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching employees:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch employee groups from VTTECH API
 * POST /api/employee-groups
 * Body: { cookie, xsrfToken }
 */
app.post('/api/employee-groups', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/UserGroup/?handler=LoadUserGroup&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching employee groups from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching employee groups:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch user types from VTTECH API
 * POST /api/user-types
 * Body: { cookie, xsrfToken }
 */
app.post('/api/user-types', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/TypeUser/?handler=LoadTypeUser&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching user types from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching user types:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch users from VTTECH API
 * POST /api/users
 * Body: { cookie, xsrfToken }
 */
app.post('/api/users', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/UserAccount/?handler=LoadUserAccount&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching users from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching users:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch permissions menu from VTTECH API
 * POST /api/permissions-menu
 * Body: { cookie, xsrfToken }
 */
app.post('/api/permissions-menu', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/Programmenu/?handler=LoadMenuProgram&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching permissions menu from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching permissions menu:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch permission functions from VTTECH API
 * POST /api/permission-functions
 * Body: { cookie, xsrfToken }
 */
app.post('/api/permission-functions', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/MenuFunction/?handler=LoadMenuFunction&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching permission functions from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching permission functions:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

/**
 * Fetch menu allow group from VTTECH API
 * POST /api/menu-allow-group
 * Body: { cookie, xsrfToken }
 */
app.post('/api/menu-allow-group', async (req, res) => {
    try {
        const { cookie, xsrfToken } = req.body;

        if (!cookie || !xsrfToken) {
            return res.status(400).json({
                success: false,
                error: 'Cookie and Xsrf-Token are required'
            });
        }

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://tmtaza.vttechsolution.com/Admin/AllowGroup/?handler=LoadAllowGroup&limit=10000',
            headers: {
                'Cookie': cookie,
                'Xsrf-Token': xsrfToken,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        };

        console.log('Fetching menu allow group from VTTECH API...');
        const response = await axios.request(config);
        const decodedData = decompressVTTECHData(response.data);

        res.json({
            success: true,
            data: decodedData || response.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching menu allow group:', error.message);

        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        path: req.path
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         VTTECH API Server Started Successfully            ║
╠════════════════════════════════════════════════════════════╣
║ 🚀 Server: http://localhost:${PORT}                        ║
║ 📋 Available Endpoints:                                   ║
║   ✅ GET /api/health                                       ║
║   🔑 POST /api/verify-credentials                         ║
║   👥 POST /api/customers                                  ║
║   👔 POST /api/employees                                  ║
║   🏢 POST /api/employee-groups                            ║
║   🎯 POST /api/user-types                                 ║
║   � POST /api/users                                      ║
║   📋 POST /api/permissions-menu                           ║
║   ⚙️  POST /api/permission-functions                      ║
║   📍 POST /api/menu-allow-group                           ║
║ 🌐 Static: Serving HTML from ${__dirname}                ║
║ 🔐 All responses are decompressed (Base64 + Gzip)        ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
