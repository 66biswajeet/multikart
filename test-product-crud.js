/**
 * Product CRUD Test Script
 * Test the dynamic product API endpoints
 */

// Test Product Data
const testProduct = {
  name: "Test Product",
  short_description: "A test product for CRUD operations",
  description: "This is a detailed description of the test product used to verify our CRUD operations are working properly.",
  price: 99.99,
  sale_price: 79.99,
  quantity: 100,
  sku: `TEST-SKU-${Date.now()}`,
  product_type: "physical",
  type: "simple",
  status: 1,
  store_id: 1,
  weight: 0.5,
  unit: "kg",
  is_featured: 1,
  is_trending: 0,
  stock_status: "in_stock"
};

async function testProductCRUD() {
  const baseUrl = "http://localhost:3001/api/product";
  
  console.log("🧪 Starting Product CRUD Tests...\n");

  try {
    // Test 1: Create Product
    console.log("1️⃣ Testing CREATE Product...");
    const createResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    });
    
    const createResult = await createResponse.json();
    console.log("✅ CREATE Result:", createResult.success ? "SUCCESS" : "FAILED");
    
    if (!createResult.success) {
      console.log("❌ CREATE Error:", createResult.message);
      return;
    }
    
    const createdProductId = createResult.data._id;
    console.log("📝 Created Product ID:", createdProductId);
    
    // Test 2: Get Single Product
    console.log("\n2️⃣ Testing READ Single Product...");
    const getResponse = await fetch(`${baseUrl}/${createdProductId}`);
    const getResult = await getResponse.json();
    console.log("✅ READ Result:", getResult.success ? "SUCCESS" : "FAILED");
    
    if (getResult.success) {
      console.log("📄 Product Name:", getResult.data.name);
      console.log("💰 Product Price:", getResult.data.price);
    }
    
    // Test 3: Get All Products
    console.log("\n3️⃣ Testing READ All Products...");
    const getAllResponse = await fetch(`${baseUrl}?page=1&paginate=10`);
    const getAllResult = await getAllResponse.json();
    console.log("✅ READ ALL Result:", getAllResult.data ? "SUCCESS" : "FAILED");
    console.log("📊 Total Products:", getAllResult.total);
    console.log("📄 Current Page Products:", getAllResult.data?.length);
    
    // Test 4: Update Product
    console.log("\n4️⃣ Testing UPDATE Product...");
    const updateData = {
      name: "Updated Test Product",
      price: 149.99,
      description: "This product has been updated via our CRUD test"
    };
    
    const updateResponse = await fetch(`${baseUrl}/${createdProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const updateResult = await updateResponse.json();
    console.log("✅ UPDATE Result:", updateResult.success ? "SUCCESS" : "FAILED");
    
    if (updateResult.success) {
      console.log("📝 Updated Name:", updateResult.data.name);
      console.log("💰 Updated Price:", updateResult.data.price);
    }
    
    // Test 5: Search Products
    console.log("\n5️⃣ Testing SEARCH Products...");
    const searchResponse = await fetch(`${baseUrl}?search=Updated&page=1&paginate=10`);
    const searchResult = await searchResponse.json();
    console.log("✅ SEARCH Result:", searchResult.data ? "SUCCESS" : "FAILED");
    console.log("🔍 Search Results:", searchResult.data?.length);
    
    // Test 6: Filter Products
    console.log("\n6️⃣ Testing FILTER Products...");
    const filterResponse = await fetch(`${baseUrl}?product_type=physical&status=1&page=1&paginate=10`);
    const filterResult = await filterResponse.json();
    console.log("✅ FILTER Result:", filterResult.data ? "SUCCESS" : "FAILED");
    console.log("🎯 Filtered Results:", filterResult.data?.length);
    
    // Test 7: Replicate Product
    console.log("\n7️⃣ Testing REPLICATE Product...");
    const replicateResponse = await fetch(`${baseUrl}/replicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: createdProductId })
    });
    
    const replicateResult = await replicateResponse.json();
    console.log("✅ REPLICATE Result:", replicateResult.success ? "SUCCESS" : "FAILED");
    
    let replicatedProductId;
    if (replicateResult.success) {
      replicatedProductId = replicateResult.data._id;
      console.log("📋 Replicated Product ID:", replicatedProductId);
      console.log("📝 Replicated Name:", replicateResult.data.name);
    }
    
    // Test 8: Delete Product
    console.log("\n8️⃣ Testing DELETE Product...");
    const deleteResponse = await fetch(`${baseUrl}/${createdProductId}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    console.log("✅ DELETE Result:", deleteResult.success ? "SUCCESS" : "FAILED");
    
    // Clean up replicated product if it was created
    if (replicatedProductId) {
      console.log("\n🧹 Cleaning up replicated product...");
      const cleanupResponse = await fetch(`${baseUrl}/${replicatedProductId}`, {
        method: 'DELETE'
      });
      const cleanupResult = await cleanupResponse.json();
      console.log("🗑️ Cleanup Result:", cleanupResult.success ? "SUCCESS" : "FAILED");
    }
    
    console.log("\n🎉 All Product CRUD Tests Completed!");
    
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testProductCRUD };
} else {
  // For browser environment
  window.testProductCRUD = testProductCRUD;
}

console.log("📋 Product CRUD Test Ready!");
console.log("🚀 Run: testProductCRUD() to start tests");