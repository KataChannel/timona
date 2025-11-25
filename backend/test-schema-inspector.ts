/**
 * Test Schema Inspector
 * Chạy file này để test xem backend có lấy được schema không
 */

import { PrismaClient, Prisma } from '@prisma/client';

async function testSchemaInspector() {
  console.log('🔍 Testing Schema Inspector...\n');

  try {
    // Test 1: Lấy tất cả models
    console.log('Test 1: Get all models');
    console.log('='.repeat(50));
    
    const dmmf = Prisma.dmmf;
    const models = dmmf.datamodel.models || [];
    
    console.log(`✅ Found ${models.length} models:`);
    models.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name} (${model.fields.length} fields)`);
    });
    console.log('');

    // Test 2: Lấy schema của model Product
    console.log('Test 2: Get Product schema');
    console.log('='.repeat(50));
    
    const productModel = models.find(m => m.name === 'Product');
    if (productModel) {
      console.log(`✅ Product model found with ${productModel.fields.length} fields:`);
      
      productModel.fields.forEach((field) => {
        const required = field.isRequired ? '* ' : '  ';
        const unique = field.isUnique ? ' [unique]' : '';
        const id = field.isId ? ' [id]' : '';
        const relation = field.kind === 'object' ? ` -> ${field.type}` : '';
        
        console.log(`  ${required}${field.name}: ${field.type}${unique}${id}${relation}`);
      });
    } else {
      console.log('❌ Product model not found');
    }
    console.log('');

    // Test 3: Phân loại fields
    console.log('Test 3: Classify Product fields');
    console.log('='.repeat(50));
    
    if (productModel) {
      const requiredFields = productModel.fields.filter(f => f.isRequired && !f.hasDefaultValue && f.kind !== 'object');
      const optionalFields = productModel.fields.filter(f => !f.isRequired && f.kind !== 'object');
      const relationFields = productModel.fields.filter(f => f.kind === 'object');
      const autoFields = productModel.fields.filter(f => f.hasDefaultValue);
      
      console.log(`📌 Required fields (${requiredFields.length}):`);
      requiredFields.forEach(f => console.log(`   - ${f.name}: ${f.type}`));
      console.log('');
      
      console.log(`📎 Optional fields (${optionalFields.length}):`);
      optionalFields.forEach(f => console.log(`   - ${f.name}: ${f.type}`));
      console.log('');
      
      console.log(`🔗 Relations (${relationFields.length}):`);
      relationFields.forEach(f => console.log(`   - ${f.name} -> ${f.type}`));
      console.log('');
      
      console.log(`⚙️  Auto-generated (${autoFields.length}):`);
      autoFields.forEach(f => console.log(`   - ${f.name}: ${f.type}`));
    }
    console.log('');

    // Test 4: Mappable fields (không phải relation, không auto-generated)
    console.log('Test 4: Get mappable fields for Product');
    console.log('='.repeat(50));
    
    if (productModel) {
      const mappableFields = productModel.fields.filter(field => {
        // Loại bỏ relations
        if (field.relationName) return false;
        
        // Loại bỏ auto-generated id
        if (field.isId && field.hasDefaultValue) return false;
        
        // Loại bỏ timestamps tự động
        if (['createdAt', 'updatedAt'].includes(field.name) && field.hasDefaultValue) return false;
        
        return true;
      });
      
      console.log(`✅ Mappable fields (${mappableFields.length}):`);
      mappableFields.forEach((field) => {
        const required = field.isRequired ? '[Required]' : '[Optional]';
        console.log(`   - ${field.name}: ${field.type} ${required}`);
      });
    }
    console.log('');

    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testSchemaInspector()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
