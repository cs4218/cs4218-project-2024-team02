import { test, expect } from '@playwright/test';
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import { ObjectId } from "mongodb";
import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import { hashPassword } from '../helpers/authHelper.js';
import categoryModel from '../models/categoryModel.js';


test.beforeAll( async () => {

    await mongoose.connect(process.env.MONGO_URL);

    const userId = new ObjectId();
    const password = "password";
    const hashedPassword = hashPassword(password);

    let user = new userModel({
        name: "John",
        email: "john@gmail.com",
        password: hashedPassword,
        phone: "91234567",
        address: "NUS",
        answer: "LOL",
        role: 0
    });

    let category = new categoryModel({
        name: "category",
        slug: "category"
    });

    await category.save();

    let product = new productModel({
        name: "product",
        slug: "product",
        description: "product description",
        price: 69,
        category: category._id,
        shipping: false
    });


    await product.save();
    await user.save();

    // await page.addInitScript(() => {
    //     localStorage.setItem('cart', JSON.stringify([
    //       product
    //     ]));
    // });

});

test.afterAll( async () => {
    await productModel.deleteOne({slug: "product"});
    await categoryModel.deleteOne({slug: "category"});
    await userModel.deleteOne({email: "john@gmail.com"});
    mongoose.disconnect();
});

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/'); 
    await page.evaluate(() => localStorage.clear());
  });

test('log in at cartpage when user is not logged in', async ({ page }) => {

    await page.goto('http://localhost:3000/cart');
    await expect(page.getByText(/Hello Guest/i)).toBeVisible();
    await expect(page.getByText(/Cart Summary/i)).toBeVisible();
    await expect(page.getByText(/Plase Login to checkout/i)).toBeVisible();

    await page.getByText(/Plase Login to checkout/i).first().click();
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.getByText(/Login Form/i)).toBeVisible();

    await page.getByPlaceholder(/Enter Your Email /i).fill("john@gmail.com");
    await page.getByPlaceholder(/Enter Your Password/i).click();
    await page.getByPlaceholder(/Enter Your Password/i).fill("password");
    await page.getByRole("button", { name: /LOGIN/i }).click();

    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText(/Hello John/i)).toBeVisible();

});

test('add and remove items', async ({ page }) => {

    await page.goto('http://localhost:3000/');
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByText(/All products/i)).toBeVisible();

    await page.getByText(/ADD TO CART/i).first().click();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText(/product/i)).toBeVisible();
    await expect(page.getByText(/product description/i)).toBeVisible();
    await expect(page.getByText(/you have 1 items in your cart/i)).toBeVisible();
    await expect(page.getByText(/Hello/i)).toBeVisible();
    await expect(page.getByText(/Cart Summary/i)).toBeVisible();

    await page.getByText(/REMOVE/i).first().click();
    await expect(page.getByText(/Your cart is empty/i)).first().toBeVisible();
    await expect(page.getByText(/Cart Summary/i)).toBeVisible();

});

test('log in and update address from cartpage', async ({ page }) => {
    
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByText(/All products/i)).toBeVisible();

    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.getByText(/Login Form/i)).toBeVisible();

    await page.getByPlaceholder(/Enter Your Email /i).fill("john@gmail.com");
    await page.getByPlaceholder(/Enter Your Password/i).click();
    await page.getByPlaceholder(/Enter Your Password/i).fill("password");
    await page.getByRole("button", { name: /LOGIN/i }).click();

    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.getByText(/All products/i)).toBeVisible();
    await page.getByRole('link', { name: 'Cart' }).click();

    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText(/Update Address/i)).toBeVisible();
    await expect(page.getByText(/NUS/i)).toBeVisible();
    await page.getByRole("button", { name: /Update Address/i }).click();

    await expect(page).toHaveURL('http://http://localhost:3000/dashboard/user/profile');
    await expect(page.getByText(/USER PROFILE/i)).toBeVisible();
    await page.getByPlaceholder(/Enter Your Address/i).click();
    await page.getByPlaceholder(/Enter Your Address/i).fill("69th Road");
    await page.getByRole('button', { name: /UPDATE/i }).click();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('http://localhost:3000/cart');
    await expect(page.getByText(/Current Address/i)).toBeVisible();
    await expect(page.getByText(/69th Road/i)).toBeVisible();

});