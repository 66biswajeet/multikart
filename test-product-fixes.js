// Product CRUD Issues Fix Test

/**
 * Test Cases for Fixed Issues:
 * 
 * 1. Single Delete Issue:
 *    - Delete a product via single delete button
 *    - Verify product disappears from frontend list
 *    - Verify product status is set to 0 in database
 * 
 * 2. Toggle Page Reload:
 *    - Toggle any status switch (featured, approved, etc.)
 *    - Verify page doesn't reload
 *    - Verify status updates in database
 * 
 * 3. Category Multi-Select:
 *    - Select multiple categories
 *    - Verify only selected categories are marked as selected
 *    - Verify categories array doesn't contain null values
 * 
 * 4. Tag Multi-Select:
 *    - Select multiple tags
 *    - Verify only selected tags are marked as selected  
 *    - Verify tags array doesn't contain null values
 * 
 * 5. Brand ID Storage:
 *    - Select a brand when creating/editing product
 *    - Verify brand_id is stored in database
 *    - Verify brand information is populated in responses
 * 
 * 6. Edit Page Loading:
 *    - Navigate to edit page for existing product
 *    - Verify all form fields are populated with existing data
 *    - Verify categories, tags, and brand are pre-selected
 */

// Helper function to test API endpoints
async function testProductAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('Testing Product CRUD API...');
  
  try {
    // Test 1: Create a product with categories, tags, and brand
    const createData = {
      name: "Test Product",
      short_description: "Test Description", 
      description: "<p>Test HTML Description</p>",
      type: "simple",
      sku: "TEST-SKU-" + Date.now(),
      quantity: 10,
      price: 99.99,
      sale_price: 89.99,
      categories: ["category-id-1", "category-id-2"], // Replace with actual IDs
      tags: ["tag-id-1", "tag-id-2"], // Replace with actual IDs
      brand_id: "brand-id-1", // Replace with actual ID
      stock_status: "in_stock",
      status: 1
    };
    
    const createResponse = await fetch(`${baseURL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log('✅ Product created successfully:', created.data._id);
      
      // Test 2: Get the created product
      const getResponse = await fetch(`${baseURL}/product/${created.data._id}`);
      if (getResponse.ok) {
        const product = await getResponse.json();
        console.log('✅ Product retrieved successfully');
        
        // Verify data integrity
        console.log('Categories:', product.data.categories);
        console.log('Tags:', product.data.tags);
        console.log('Brand ID:', product.data.brand_id);
        
        // Test 3: Update product status
        const updateResponse = await fetch(`${baseURL}/product/${created.data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_featured: 1 })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Product status updated successfully');
        }
        
        // Test 4: Soft delete product
        const deleteResponse = await fetch(`${baseURL}/product/${created.data._id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Product deleted successfully');
          
          // Test 5: Verify product is not in list
          const listResponse = await fetch(`${baseURL}/product`);
          if (listResponse.ok) {
            const list = await listResponse.json();
            const deletedProduct = list.data.find(p => p._id === created.data._id);
            if (!deletedProduct) {
              console.log('✅ Deleted product not in list');
            } else {
              console.log('❌ Deleted product still in list');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testProductAPI = testProductAPI;
}

console.log('Product CRUD fix verification ready. Run testProductAPI() in browser console to test.');