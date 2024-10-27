import { test, expect } from '@playwright/test';

require('dotenv').config();

test('display login form to users', async ({ page }) => {
 
  await page.goto('http://localhost:3000/login');

  await expect(page.getByPlaceholder('Enter Your Email')).toBeVisible();
  await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();

});
