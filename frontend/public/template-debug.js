// Template Library Debug Script - Run in Browser Console
console.log('🔍 Template Library Debug Starting...');

// 1. Check if templates are loaded
console.log('📋 1. Checking template data...');
try {
  // Check if there are any templates in the context
  const templates = document.querySelector('[data-testid="template-count"]');
  console.log('Template count element:', templates);
  
  // Check localStorage for custom templates
  const customTemplates = localStorage.getItem('kata_custom_templates');
  console.log('Custom templates in localStorage:', customTemplates ? JSON.parse(customTemplates).length : 0);
  
  // Check if template tab is visible
  const templateTab = document.querySelector('[value="templates"]');
  console.log('Template tab element:', templateTab);
  
  // Check if template cards are rendered
  const templateCards = document.querySelectorAll('[data-template-id]');
  console.log('Template cards found:', templateCards.length);
  
} catch (error) {
  console.error('Error checking template data:', error);
}

// 2. Check for template-related errors
console.log('🚨 2. Checking for errors...');
window.addEventListener('error', (e) => {
  if (e.message.includes('template') || e.filename.includes('template')) {
    console.error('Template-related error:', e);
  }
});

// 3. Test template functionality
console.log('⚡ 3. Testing template functions...');
try {
  // Try to access template search
  const searchInput = document.querySelector('input[placeholder*="template"]');
  if (searchInput) {
    console.log('✅ Template search input found');
  } else {
    console.log('❌ Template search input not found');
  }
  
  // Try to access template category filter
  const categorySelect = document.querySelector('select');
  if (categorySelect) {
    console.log('✅ Category select found');
  } else {
    console.log('❌ Category select not found');
  }
  
} catch (error) {
  console.error('Error testing template functionality:', error);
}

// 4. Check PageBuilder context
console.log('🔧 4. Checking PageBuilder context...');
try {
  // Look for React DevTools hook
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available');
  }
  
  // Check if PageBuilder components are mounted
  const pageBuilder = document.querySelector('[class*="pagebuilder"]');
  if (pageBuilder) {
    console.log('✅ PageBuilder component mounted');
  } else {
    console.log('❌ PageBuilder component not found');
  }
  
} catch (error) {
  console.error('Error checking PageBuilder context:', error);
}

// 5. Template Library specific checks
console.log('📚 5. Template Library specific checks...');
try {
  // Check if template thumbnails are loading
  const thumbnails = document.querySelectorAll('img[src*="data:image/svg"]');
  console.log('Template thumbnails found:', thumbnails.length);
  
  // Check if template preview buttons exist
  const previewButtons = document.querySelectorAll('button:contains("Preview")');
  console.log('Preview buttons found:', previewButtons.length);
  
  // Check if apply buttons exist
  const applyButtons = document.querySelectorAll('button:contains("Apply")');
  console.log('Apply buttons found:', applyButtons.length);
  
} catch (error) {
  console.error('Error checking Template Library specifics:', error);
}

console.log('✅ Template Library Debug Complete');
console.log('📊 Run this in your browser console when PageBuilder is open');

// Export for manual testing
window.templateDebug = {
  checkTemplates: () => {
    const custom = localStorage.getItem('kata_custom_templates');
    console.log('Custom templates:', custom ? JSON.parse(custom) : []);
  },
  clearTemplates: () => {
    localStorage.removeItem('kata_custom_templates');
    console.log('Templates cleared');
  },
  addTestTemplate: () => {
    const testTemplate = {
      id: 'debug-test-' + Date.now(),
      name: 'Debug Test Template',
      description: 'A test template for debugging',
      category: 'custom',
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: [{
        type: 'text',
        content: { text: 'Test content' },
        style: {},
        order: 0,
        depth: 0
      }]
    };
    
    const existing = JSON.parse(localStorage.getItem('kata_custom_templates') || '[]');
    existing.push(testTemplate);
    localStorage.setItem('kata_custom_templates', JSON.stringify(existing));
    console.log('Test template added');
    window.location.reload();
  }
};

console.log('🔧 Debug tools available: window.templateDebug.checkTemplates(), window.templateDebug.clearTemplates(), window.templateDebug.addTestTemplate()');