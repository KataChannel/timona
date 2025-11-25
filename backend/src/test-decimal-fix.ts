// Test file for Decimal conversion fix
import { Decimal } from '@prisma/client/runtime/library';

class DecimalTestHelper {
  /**
   * Safely convert value to Decimal, handling percentage strings and invalid formats
   */
  private toDecimalSafe(value: any): Decimal | null {
    if (!value) return null;
    
    try {
      // Convert to string first
      let stringValue = String(value).trim();
      
      // Handle empty or null values
      if (!stringValue || stringValue === 'null' || stringValue === 'undefined') {
        return null;
      }
      
      // Remove percentage signs and other non-numeric characters except decimal point and minus
      stringValue = stringValue.replace(/%/g, '').replace(/[^0-9.-]/g, '');
      
      // Handle empty string after cleaning
      if (!stringValue) {
        return null;
      }
      
      // Validate that it's a valid number format
      if (!/^-?\\d*\\.?\\d+$/.test(stringValue)) {
        console.warn(`Invalid numeric format after cleaning: '${stringValue}' (original: '${value}')`);
        return null;
      }
      
      return new Decimal(stringValue);
    } catch (error: any) {
      console.warn(`Failed to convert to Decimal: '${value}' - ${error.message}`);
      return null;
    }
  }

  /**
   * Test the decimal conversion with various inputs
   */
  testDecimalConversion() {
    const testCases = [
      '8%',           // The problematic case
      '10%',
      '15.5%',
      '0%',
      '100%',
      '8',            // Normal number
      '10.5',         // Decimal number
      '',             // Empty string
      null,           // Null
      undefined,      // Undefined
      'abc',          // Invalid string
      '8.5%abc',      // Mixed content
      '-5%',          // Negative percentage
      '12.34',        // Normal decimal
      '0',            // Zero
    ];

    console.log('Testing Decimal Conversion Fix:');
    console.log('=================================');

    testCases.forEach(testCase => {
      try {
        const result = this.toDecimalSafe(testCase);
        console.log(`Input: "${testCase}" => Output: ${result ? result.toString() : 'null'}`);
      } catch (error) {
        console.log(`Input: "${testCase}" => ERROR: ${error.message}`);
      }
    });
  }
}

// Run the test
const tester = new DecimalTestHelper();
tester.testDecimalConversion();

export default DecimalTestHelper;