"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShareToken = generateShareToken;
const crypto_1 = require("crypto");
function generateShareToken() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
//# sourceMappingURL=share-token.js.map