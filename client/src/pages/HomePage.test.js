import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/cart";
import '@testing-library/jest-dom/extend-expect';
import HomePage from "./HomePage";
import toast from "react-hot-toast";

jest.mock('axios');
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(),
}));

jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);

// Mock Prices component
jest.mock("../components/Prices", () => ({
    Prices: [
        { _id: '1', name: '$0 - $10', array: [0, 10] },
        { _id: '2', name: '$10 - $20', array: [11, 20] },
    ],
}));

jest.mock('react-router-dom', () => ({
    __esModule: true,
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn() // Mock useNavigate
  }));

  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

const getCategoriesUrl = "/api/v1/category/get-category";
const getProductsUrl = "/api/v1/product/product-list/1"
const getProductsCountUrl = "/api/v1/product/product-count";

const mockCategories = {
    data: {
        success: true,
        category:
            [
                { _id: '1', name: 'Food', slug: 'food' },
                { _id: '2', name: 'Clothes', slug: 'clothes' },
            ]
    }
};

const mockProducts = {
    data: {
        success: true,
        products:
            [
                { _id: '1', name: 'Donut', price: 3, description: 'glazed donut', category: '1', slug: "donut" },
                { _id: '2', name: 'Shoes', price: 15, description: 'shoes lor', category: '2', slug: "shoes" }
            ]
    }
}

const mockProductCount = { data: { total: 2 }};

const mockEmptyCategories = {
    data: {
        success: true,
        category: []
    }
};

const mockEmptyProducts = {
    data: {
        success: true,
        products: []
    }
};

const mockEmptyProductCount = { data: { total: 0 }};

describe('HomePage Component Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
    });

    test('renders correctly with no categories or products', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockEmptyCategories);
                case getProductsUrl:
                    return Promise.resolve(mockEmptyProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockEmptyProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [],
            },
        });
        
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(screen.getByText("All Products")).toBeInTheDocument();
        expect(screen.queryByText("More Details")).not.toBeInTheDocument();
        expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();
    });

    test('shows all categories and products as expected', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: '1', name: 'Donut', price: 3, description: 'glazed donut', category: '1' },
                ],
            },
        });
        
        
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Clothes")).toBeInTheDocument();
            expect(screen.getByText("Food")).toBeInTheDocument();
            expect(screen.getByText("Donut")).toBeInTheDocument();
            expect(screen.getByText("Shoes")).toBeInTheDocument();
            expect(screen.getAllByText("More Details").length).toBe(2);
        })
        
    })

    test('successfully filters products by categories', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: '1', name: 'Donut', price: 3, description: 'glazed donut', category: '1' },
                ],
            },
        });
        
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            var foodCategoryButton = screen.getByText("Food");
            fireEvent.click(foodCategoryButton);

            expect(screen.getByRole('checkbox', { name: /Food/i})).toBeChecked();
            expect(screen.getByText("Donut")).toBeInTheDocument();
            expect(screen.queryByText("Shoes")).not.toBeInTheDocument();
        });
    })

    test('successfully filters products by price', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: '2', name: 'Shoes', price: 15, description: 'shoes lor', category: '2' },
                ],
            },
        });
        
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            var priceButton = screen.getByText("$10 - $20");
            fireEvent.click(priceButton);

            expect(screen.getByRole('radio', { name: "$10 - $20"})).toBeChecked();
            expect(screen.getByText("Shoes")).toBeInTheDocument();
            expect(screen.queryByText("Donut")).not.toBeInTheDocument();
        });
    })

    // test('successfully resets filters', async () => {
    //     axios.get.mockImplementation((url) => {
    //         switch (url){
    //             case getCategoriesUrl:
    //                 return Promise.resolve(mockCategories);
    //             case getProductsUrl:
    //                 return Promise.resolve(mockProducts);
    //             case getProductsCountUrl:
    //                 return Promise.resolve(mockProductCount);
    //         }          
    //     });
    //     axios.post.mockResolvedValueOnce({
    //         data: {
    //             products: [
    //                 { _id: '2', name: 'Shoes', price: 15, description: 'shoes lor', category: '2' },
    //             ],
    //         },
    //     });
        
    //     render(
    //         <BrowserRouter>
    //             <HomePage />
    //         </BrowserRouter>
    //     );

    //     await waitFor(() => {
    //         var priceButton = screen.getByText("$10 - $20");
    //         var clothesButton = screen.getByText("Clothes");
    //         var resetFiltersButton = screen.getByText("RESET FILTERS");

    //         fireEvent.click(priceButton);
    //         fireEvent.click(clothesButton);    
    //     });

    //     //fireEvent.click(resetFiltersButton);

    //     expect(screen.getByRole('radio', { name: "$10 - $20"})).not.toBeChecked();
    //     expect(screen.getByRole('checkbox', { name: "Clothes"})).not.toBeChecked();
    //     expect(screen.getByText("Shoes")).toBeInTheDocument();
    //     expect(screen.queryByText("Donut")).toBeInTheDocument();
    // });

    test('successfully filters by both price and category', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            var priceButton = screen.getByText("$10 - $20");
            var foodButton = screen.getByText("Food");
            fireEvent.click(priceButton);
            fireEvent.click(foodButton);

            expect(screen.getByRole('radio', { name: "$10 - $20"})).toBeChecked();
            expect(screen.getByRole('checkbox', { name: "Food"})).toBeChecked();
            expect(screen.queryByText("Shoes")).not.toBeInTheDocument();
            expect(screen.queryByText("Donut")).not.toBeInTheDocument();
        });
    });

    test('successfully navigates to product when more details is clicked', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: '1', name: 'Donut', price: 3, description: 'glazed donut', category: '1', slug: "donut" }
                ],
            },
        });

        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            var moreDetailsButton = screen.getAllByRole("button", {name: /More Details/i})[0];
            fireEvent.click(moreDetailsButton);

            expect(mockNavigate).toHaveBeenCalledWith('/product/donut');
        });
    });

    test('successfully adds to cart when add to cart is clicked', async () => {
        axios.get.mockImplementation((url) => {
            switch (url){
                case getCategoriesUrl:
                    return Promise.resolve(mockCategories);
                case getProductsUrl:
                    return Promise.resolve(mockProducts);
                case getProductsCountUrl:
                    return Promise.resolve(mockProductCount);
            }          
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: '1', name: 'Donut', price: 3, description: 'glazed donut', category: '1', slug: "donut" }
                ],
            },
        });

        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        let addButton;
        await waitFor(() => {
            addButton = screen.getAllByRole("button", {name: /ADD TO CART/i})[0];
        });

        fireEvent.click(addButton);

        expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([mockProducts.data.products[0]]));
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
});

describe("HomePage Integration Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
    });

    test("HomePage successfully renders Layout component", async () => {

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        const bannerImage = screen.getByRole('img', {name: /bannerimage/i});
        expect(bannerImage).toBeInTheDocument(); 
        expect(bannerImage).toHaveAttribute('alt', 'bannerimage');
        expect(bannerImage).toHaveAttribute('src', '/images/Virtual.png');
        expect(bannerImage).toHaveAttribute('width', '100%');

    });

});