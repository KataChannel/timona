"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockTypeScalar = void 0;
const graphql_1 = require("@nestjs/graphql");
const blockTypeConverter_1 = require("../../utils/blockTypeConverter");
let BlockTypeScalar = class BlockTypeScalar {
    constructor() {
        this.description = 'Block type enum - handles conversion between numeric (frontend) and string (backend) values';
    }
    serialize(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'number') {
            return blockTypeConverter_1.BLOCK_TYPE_NUMERIC_TO_STRING[value] || 'UNKNOWN';
        }
        return String(value);
    }
    parseValue(value) {
        if (typeof value === 'number') {
            const stringValue = blockTypeConverter_1.BLOCK_TYPE_NUMERIC_TO_STRING[value];
            if (!stringValue) {
                throw new Error(`Invalid BlockType numeric value: ${value}`);
            }
            return stringValue;
        }
        if (typeof value === 'string') {
            if (!blockTypeConverter_1.BLOCK_TYPE_STRING_TO_NUMERIC[value.toUpperCase()]) {
                throw new Error(`Invalid BlockType string value: ${value}`);
            }
            return value.toUpperCase();
        }
        throw new Error(`BlockType must be a number or string, received ${typeof value}`);
    }
    parseLiteral(valueNode) {
        if (valueNode.kind === 'IntValue') {
            const numValue = parseInt(valueNode.value, 10);
            const stringValue = blockTypeConverter_1.BLOCK_TYPE_NUMERIC_TO_STRING[numValue];
            if (!stringValue) {
                throw new Error(`Invalid BlockType numeric value: ${numValue}`);
            }
            return stringValue;
        }
        if (valueNode.kind === 'StringValue') {
            const upperValue = valueNode.value.toUpperCase();
            if (!blockTypeConverter_1.BLOCK_TYPE_STRING_TO_NUMERIC[upperValue]) {
                throw new Error(`Invalid BlockType string value: ${valueNode.value}`);
            }
            return upperValue;
        }
        throw new Error(`BlockType must be a number or string literal`);
    }
};
exports.BlockTypeScalar = BlockTypeScalar;
exports.BlockTypeScalar = BlockTypeScalar = __decorate([
    (0, graphql_1.Scalar)('BlockType', () => String)
], BlockTypeScalar);
//# sourceMappingURL=blockType.scalar.js.map