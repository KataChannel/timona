"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const library_1 = require("@prisma/client/runtime/library");
class DecimalTestHelper {
    toDecimalSafe(value) {
        if (!value)
            return null;
        try {
            let stringValue = String(value).trim();
            if (!stringValue || stringValue === 'null' || stringValue === 'undefined') {
                return null;
            }
            stringValue = stringValue.replace(/%/g, '').replace(/[^0-9.-]/g, '');
            if (!stringValue) {
                return null;
            }
            if (!/^-?\\d*\\.?\\d+$/.test(stringValue)) {
                console.warn(`Invalid numeric format after cleaning: '${stringValue}' (original: '${value}')`);
                return null;
            }
            return new library_1.Decimal(stringValue);
        }
        catch (error) {
            console.warn(`Failed to convert to Decimal: '${value}' - ${error.message}`);
            return null;
        }
    }
    testDecimalConversion() {
        const testCases = [
            '8%',
            '10%',
            '15.5%',
            '0%',
            '100%',
            '8',
            '10.5',
            '',
            null,
            undefined,
            'abc',
            '8.5%abc',
            '-5%',
            '12.34',
            '0',
        ];
        console.log('Testing Decimal Conversion Fix:');
        console.log('=================================');
        testCases.forEach(testCase => {
            try {
                const result = this.toDecimalSafe(testCase);
                console.log(`Input: "${testCase}" => Output: ${result ? result.toString() : 'null'}`);
            }
            catch (error) {
                console.log(`Input: "${testCase}" => ERROR: ${error.message}`);
            }
        });
    }
}
const tester = new DecimalTestHelper();
tester.testDecimalConversion();
exports.default = DecimalTestHelper;
//# sourceMappingURL=test-decimal-fix.js.map