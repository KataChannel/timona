"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AIAssistantService = class AIAssistantService {
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('OPENAI_API_KEY') || '';
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    }
    async generateResponse(message, context) {
        try {
            const systemPrompt = this.buildSystemPrompt(context);
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.formatConversationHistory(context?.conversationHistory || []),
                        { role: 'user', content: message },
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });
            if (!response.ok) {
                throw new Error(`AI API error: ${response.statusText}`);
            }
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || '';
            return {
                response: aiResponse,
                confidence: 0.85,
                suggestions: await this.generateSuggestions(message, context),
                intent: await this.detectIntent(message),
            };
        }
        catch (error) {
            console.error('AI Assistant Error:', error);
            return this.getFallbackResponse(message);
        }
    }
    async generateSuggestions(message, context) {
        const suggestions = [];
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('giá') || lowerMessage.includes('price')) {
            suggestions.push('Bạn muốn biết giá của sản phẩm nào?');
            suggestions.push('Hiện tại chúng tôi đang có chương trình khuyến mãi');
        }
        if (lowerMessage.includes('đặt hàng') || lowerMessage.includes('order')) {
            suggestions.push('Hướng dẫn đặt hàng');
            suggestions.push('Kiểm tra đơn hàng của bạn');
        }
        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('shipping')) {
            suggestions.push('Thông tin về vận chuyển');
            suggestions.push('Theo dõi đơn hàng');
        }
        return suggestions;
    }
    async detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('giá') || lowerMessage.includes('price'))
            return 'pricing_inquiry';
        if (lowerMessage.includes('đặt hàng') || lowerMessage.includes('order'))
            return 'order_placement';
        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('shipping'))
            return 'shipping_inquiry';
        if (lowerMessage.includes('trả hàng') || lowerMessage.includes('return'))
            return 'return_request';
        if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment'))
            return 'payment_inquiry';
        if (lowerMessage.includes('khuyến mãi') || lowerMessage.includes('discount'))
            return 'promotion_inquiry';
        return 'general_inquiry';
    }
    async analyzeCustomerSentiment(message) {
        const positiveWords = ['tốt', 'hay', 'ok', 'được', 'cảm ơn', 'thanks', 'good'];
        const negativeWords = ['tệ', 'kém', 'không tốt', 'bad', 'poor', 'khó chịu'];
        const lowerMessage = message.toLowerCase();
        let score = 0;
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word))
                score += 1;
        });
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word))
                score -= 1;
        });
        if (score > 0)
            return { sentiment: 'positive', score };
        if (score < 0)
            return { sentiment: 'negative', score: Math.abs(score) };
        return { sentiment: 'neutral', score: 0 };
    }
    async suggestProducts(customerMessage, customerHistory) {
        return [];
    }
    buildSystemPrompt(context) {
        return `Bạn là trợ lý ảo chăm sóc khách hàng chuyên nghiệp cho một cửa hàng thương mại điện tử.

Nhiệm vụ của bạn:
- Trả lời câu hỏi của khách hàng một cách lịch sự, chuyên nghiệp
- Cung cấp thông tin chính xác về sản phẩm, giá cả, vận chuyển
- Hỗ trợ khách hàng đặt hàng và theo dõi đơn hàng
- Xử lý khiếu nại và yêu cầu hoàn trả một cách hiệu quả
- Luôn thân thiện và tạo trải nghiệm tích cực

Hướng dẫn:
- Sử dụng ngôn ngữ thân thiện, dễ hiểu
- Nếu không chắc chắn, đề xuất chuyển cho nhân viên hỗ trợ
- Luôn kết thúc với câu hỏi để tiếp tục cuộc hội thoại
- Không đưa ra thông tin sai lệch hoặc hứa hẹn không thực hiện được

${context?.customerInfo ? `Thông tin khách hàng: ${JSON.stringify(context.customerInfo)}` : ''}
${context?.productContext ? `Bối cảnh sản phẩm: ${JSON.stringify(context.productContext)}` : ''}
`;
    }
    formatConversationHistory(history) {
        return history.slice(-5).map(msg => ({
            role: msg.senderType === 'CUSTOMER' ? 'user' : 'assistant',
            content: msg.content,
        }));
    }
    getFallbackResponse(message) {
        const responses = [
            'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ hỗ trợ bạn ngay.',
            'Tôi đã nhận được tin nhắn của bạn. Vui lòng chờ trong giây lát.',
            'Cảm ơn bạn. Để được hỗ trợ tốt hơn, bạn có thể cung cấp thêm thông tin không?',
        ];
        return {
            response: responses[Math.floor(Math.random() * responses.length)],
            confidence: 0.5,
            suggestions: [
                'Tôi muốn đặt hàng',
                'Kiểm tra đơn hàng',
                'Hỗ trợ thanh toán',
            ],
        };
    }
};
exports.AIAssistantService = AIAssistantService;
exports.AIAssistantService = AIAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AIAssistantService);
//# sourceMappingURL=ai-assistant.service.js.map