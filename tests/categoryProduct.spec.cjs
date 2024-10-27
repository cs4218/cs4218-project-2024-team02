import { test, expect } from "@playwright/test";

test.describe("Category tests", () => {
  test("CategoryProduct component does not display anything when there are no products", async ({
    page,
  }) => {
    // Navigate to the category page
    await page.goto("http://localhost:3000/category/electronics"); // Update this with the actual category slug

    // Check that the category title is displayed
    const categoryTitle = page.locator(".category h4");
    await expect(categoryTitle).toBeVisible();

    // Check that the product count is displayed
    const productCount = page.locator(".category h6");
    await expect(productCount).toContainText("0 result found");
  });

  test("CategoryProduct page populates and displays products", async ({
    page,
  }) => {
    // Mock the API response for product retrieval
    await page.route(
      "**/api/v1/product/product-category/electronics",
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            products: [
              {
                _id: "1",
                name: "Product 1",
                price: 29.99,
                description: "Description for product 1",
                slug: "product-1",
              },
              {
                _id: "2",
                name: "Product 2",
                price: 49.99,
                description: "Description for product 2",
                slug: "product-2",
              },
            ],
            category: {
              name: "Electronics",
            },
          }),
        });
      }
    );

    // Navigate to the category page
    await page.goto("http://localhost:3000/category/electronics");

    // Verify that the category title is displayed
    const categoryTitle = page.locator(".category h4");
    await expect(categoryTitle).toBeVisible();
    await expect(categoryTitle).toContainText("Category - Electronics");

    // Verify that the product count is displayed
    const productCount = page.locator(".category h6");
    await expect(productCount).toBeVisible();
    await expect(productCount).toContainText("2 result found");

    // Check that the product cards are displayed
    const productCards = page.locator(".card");
    await expect(productCards).toHaveCount(2); // Ensure there are 2 products

    // Check details of the first product
    const firstProductCard = productCards.first();
    const productName = firstProductCard.locator(".card-title").first();
    await expect(productName).toBeVisible();
    await expect(productName).toContainText("Product 1");

    const productPrice = firstProductCard.locator(".card-price").first();
    await expect(productPrice).toBeVisible();
    await expect(productPrice).toContainText("$29.99");
  });

  test("Navigate to product detail page from CategoryProduct page", async ({
    page,
  }) => {
    // Mock the API response for product retrieval
    await page.route(
      "**/api/v1/product/product-category/electronics",
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            products: [
              {
                _id: "1",
                name: "Product 1",
                price: 29.99,
                description: "Description for product 1",
                slug: "product-1",
              },
              {
                _id: "2",
                name: "Product 2",
                price: 49.99,
                description: "Description for product 2",
                slug: "product-2",
              },
            ],
            category: {
              name: "Electronics",
            },
          }),
        });
      }
    );

    // Navigate to the category page
    await page.goto("http://localhost:3000/category/electronics");

    // Click on the "More Details" button of the first product
    const firstProductCard = page.locator(".card").first();
    const moreDetailsButton = firstProductCard.locator(
      'button:has-text("More Details")'
    );
    await expect(moreDetailsButton).toBeVisible();
    await moreDetailsButton.click();

    // Verify that the URL has changed to the product detail page
    await expect(page).toHaveURL("http://localhost:3000/product/product-1"); // Update based on the slug of the product

    // Check that the product details are displayed on the product detail page
    const productName = page.locator("h1");
    await expect(productName).toBeVisible();
    await expect(productName).toContainText("Product Details");
  });
});
