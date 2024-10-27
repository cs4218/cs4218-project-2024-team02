import React from 'react'
import { render, screen, waitFor } from "@testing-library/react";
import Orders from "./Orders";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import toast from "react-hot-toast";



// Mock the auth and cart context
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth.js', () => ({
    useAuth: jest.fn()
}));

jest.mock('../../context/cart.js', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search.js', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

jest.mock('react-router-dom', () => ({
    __esModule: true,
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn() // Mock useNavigate
}));

jest.mock('braintree-web-drop-in-react', () => ({
    __esModule: true,
    default: ({ onInstance }) => {
        setTimeout(() => {
            const mockInstance = {
                requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: 'mock-nonce' }),
            };

            onInstance(mockInstance); // Call onInstance with the mock instance
        }, 0);
        return null; // Return a mock component
    },
}));


//test orders
describe("Orders Page Integration Tests", () => {
  beforeEach(() => {
    useAuth.mockReturnValue([
      { token: "test-token", user: { name: "John Doe" } }, // Mocked auth state
      jest.fn()
    ]);
  });

  test("Displays orders fetched from the API", async () => {
    const mockOrders = [
      {
        status: "Delivered",
        buyer: { name: "Alice" },
        createAt: moment().subtract(1, "days").toISOString(),
        payment: { success: true },
        products: [{ _id: "product1", name: "Product 1", description: "Description 1", price: 10 }],
      },
    ];

    axios.get.mockResolvedValue({ data: mockOrders });

    render(
        <MemoryRouter initialEntries={['/dashboard/user/orders']}>
            <Routes>
                <Route path="/dashboard/user/orders" element={<Orders/>} />
            </Routes>
        </MemoryRouter>);

    expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");


  });

  test("Display error if unable to fetch orders from API", async () => {
    axios.get.mockRejectedValue(new Error("Get orders failed"));

    render(
        <MemoryRouter initialEntries={['/dashboard/user/orders']}>
            <Routes>
                <Route path="/dashboard/user/orders" element={<Orders/>} />
            </Routes>
        </MemoryRouter>);

    await waitFor(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

  });

});
