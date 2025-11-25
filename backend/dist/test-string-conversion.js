"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringConversionTestHelper {
    toStringSafe(value) {
        if (value === null || value === undefined)
            return null;
        try {
            const stringValue = String(value).trim();
            return stringValue === '' ? null : stringValue;
        }
        catch (error) {
            console.warn(`Failed to convert to string: '${value}' - ${error.message}`);
            return null;
        }
    }
    toArraySafe(value) {
        if (!value)
            return null;
        try {
            if (Array.isArray(value)) {
                return value;
            }
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed : [parsed];
                }
                catch {
                    return [value];
                }
            }
            return [value];
        }
        catch (error) {
            console.warn(`Failed to convert to array: '${value}' - ${error.message}`);
            return null;
        }
    }
    testStringConversion() {
        const testCases = [
            1,
            0,
            '1',
            'Hộp',
            '',
            null,
            undefined,
            true,
            false,
            [],
            {},
            'BEL PM CON BÒ CƯỜI 16M 224GX32 DISNEY25',
        ];
        console.log('Testing String Conversion Fix:');
        console.log('=================================');
        testCases.forEach(testCase => {
            try {
                const result = this.toStringSafe(testCase);
                console.log(`Input: ${JSON.stringify(testCase)} (${typeof testCase}) => Output: ${JSON.stringify(result)}`);
            }
            catch (error) {
                console.log(`Input: ${JSON.stringify(testCase)} => ERROR: ${error.message}`);
            }
        });
        console.log('\nTesting Array Conversion:');
        console.log('========================');
        const arrayTestCases = [
            [],
            [1, 2, 3],
            ['a', 'b'],
            '[]',
            '[1,2,3]',
            'not-json',
            null,
            undefined,
            1,
            'single-item',
        ];
        arrayTestCases.forEach(testCase => {
            try {
                const result = this.toArraySafe(testCase);
                console.log(`Input: ${JSON.stringify(testCase)} (${typeof testCase}) => Output: ${JSON.stringify(result)}`);
            }
            catch (error) {
                console.log(`Input: ${JSON.stringify(testCase)} => ERROR: ${error.message}`);
            }
        });
    }
}
const tester = new StringConversionTestHelper();
tester.testStringConversion();
exports.default = StringConversionTestHelper;
//# sourceMappingURL=test-string-conversion.js.map