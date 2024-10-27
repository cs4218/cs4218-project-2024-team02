import { test, expect } from '@playwright/test';
require('dotenv').config();


test('display login form to users', async ({ page }) => {

  await page.goto('http://localhost:3000/login');
  await expect(page.getByPlaceholder('Enter Your Email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();
});

test('user can fill in login details', async ({ page }) => {


    await page.goto('http://localhost:3000/login');
  
    page.getByPlaceholder('Enter Your Email').fill('john@gmail.com');
    page.getByPlaceholder('Enter Your Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page).toHaveURL('http://localhost:3000/login');
    
});


test('user can reset password', async ({ page }) => {

    await page.goto('http://localhost:3000/login');

    await page.getByRole('button', { name: 'Forgot Password' }).click();
    await expect(page).toHaveURL('http://localhost:3000/forgot-password');
    
});


// test('allow user to login', async ({ page }) => {
//   // Intercept and mock the login API request
//   await page.route('/api/v1/auth/login', (route) => {
//     route.fulfill({
//       status: 200,
//       contentType: 'application/json',
//       body: JSON.stringify({
//         success: true,
//         message: "Login successful",
//         user: { id: "123", name: "John Doe", email: "john@gmail.com" },
//         token: "mockToken",
//       }),
//     });
//   });

//   // Go to the login page
//   await page.goto('http://localhost:3000/login');

//   // Fill in the email and password fields
//   await page.getByPlaceholder('Enter Your Email').fill('john@gmail.com');
//   await page.getByPlaceholder('Enter Your Password').fill('password');

//   // Click the login button
//   await page.getByRole('button', { name: 'LOGIN' }).click();

//   // Check for navigation or a successful login indicator
//   await expect(page).toHaveURL('http://localhost:3000/'); // assuming successful login redirects here
// });
