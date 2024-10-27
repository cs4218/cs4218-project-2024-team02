import { test, expect } from '@playwright/test';
require('dotenv').config();


test('display login form to users', async ({ page }) => {

  await page.goto('http://localhost:3000/login');
  await expect(page.getByPlaceholder('Enter Your Email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();
});


test('allow user to login', async ({ page }) => {
  // Intercept and mock the login API request
  await page.route('**/api/v1/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: "Login successful",
        user: { id: "123", name: "John Doe", email: "john@gmail.com" },
        token: "mockToken",
      }),
    });
  });

  await page.goto('http://localhost:3000/login');

  await page.getByPlaceholder('Enter Your Email').fill('john@gmail.com');
  await page.getByPlaceholder('Enter Your Password').fill('password');

  await page.getByRole('button', { name: 'LOGIN' }).click();

  await expect(page).toHaveURL('http://localhost:3000/'); // directed to home page
});


test('allow user to reset password', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.getByRole('button', { name: 'Forgot password' }).click();

  await expect(page).toHaveURL('http://localhost:3000/forgot-password');

});
