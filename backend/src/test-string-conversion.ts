// Test file for string conversion fix
class StringConversionTestHelper {
  /**
   * Safely convert value to string
   */
  private toStringSafe(value: any): string | null {
    if (value === null || value === undefined) return null;
    
    try {
      const stringValue = String(value).trim();
      return stringValue === '' ? null : stringValue;
    } catch (error: any) {
      console.warn(`Failed to convert to string: '${value}' - ${error.message}`);
      return null;
    }
  }

  /**
   * Safely convert array or object to proper format
   */
  private toArraySafe(value: any): any[] | null {
    if (!value) return null;
    
    try {
      if (Array.isArray(value)) {
        return value;
      }
      
      if (typeof value === 'string') {
        // Try to parse as JSON if it's a string
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // If not JSON, return as single-item array
          return [value];
        }
      }
      
      // For other types, convert to array
      return [value];
    } catch (error: any) {
      console.warn(`Failed to convert to array: '${value}' - ${error.message}`);
      return null;
    }
  }

  /**
   * Test the string conversion with various inputs
   */
  testStringConversion() {
    const testCases = [
      1,              // Integer (the problematic case for tchat)
      0,              // Zero integer
      '1',            // String number
      'Hộp',          // Normal string
      '',             // Empty string
      null,           // Null
      undefined,      // Undefined
      true,           // Boolean
      false,          // Boolean false
      [],             // Empty array
      {},             // Empty object
      'BEL PM CON BÒ CƯỜI 16M 224GX32 DISNEY25', // Long string
    ];

    console.log('Testing String Conversion Fix:');
    console.log('=================================');

    testCases.forEach(testCase => {
      try {
        const result = this.toStringSafe(testCase);
        console.log(`Input: ${JSON.stringify(testCase)} (${typeof testCase}) => Output: ${JSON.stringify(result)}`);
      } catch (error) {
        console.log(`Input: ${JSON.stringify(testCase)} => ERROR: ${error.message}`);
      }
    });

    console.log('\nTesting Array Conversion:');
    console.log('========================');

    const arrayTestCases = [
      [],                     // Empty array
      [1, 2, 3],             // Number array
      ['a', 'b'],            // String array
      '[]',                  // JSON string array
      '[1,2,3]',             // JSON string with numbers
      'not-json',            // Non-JSON string
      null,                  // Null
      undefined,             // Undefined
      1,                     // Single number
      'single-item',         // Single string
    ];

    arrayTestCases.forEach(testCase => {
      try {
        const result = this.toArraySafe(testCase);
        console.log(`Input: ${JSON.stringify(testCase)} (${typeof testCase}) => Output: ${JSON.stringify(result)}`);
      } catch (error) {
        console.log(`Input: ${JSON.stringify(testCase)} => ERROR: ${error.message}`);
      }
    });
  }
}

// Run the test
const tester = new StringConversionTestHelper();
tester.testStringConversion();

export default StringConversionTestHelper;