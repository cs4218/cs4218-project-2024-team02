import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import axios from "axios";
import { useAuth } from "../context/auth.js";
import { useCart } from "../context/cart.js";
import useCategory from "../hooks/useCategory";
import '@testing-library/jest-dom';


// Mock the auth and cart context
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth.js", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart.js", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory.js", () => ({
  __esModule: true,
  default: jest.fn(), 
}));

jest.mock("../context/search.js", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(), // Mock useNavigate
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: ({ onInstance }) => {
    setTimeout(() => {
      const mockInstance = {
        requestPaymentMethod: jest
          .fn()
          .mockResolvedValue({ nonce: "mock-nonce" }),
      };

      onInstance(mockInstance); // Call onInstance with the mock instance
    }, 0);
    return null; // Return a mock component
  },
}));

describe("CategoryProduct", () => {
  let mockAuth, mockCart;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuth = null;
    mockCart = [];

    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([mockCart, jest.fn()]);
    useCategory.mockReturnValue([{ name: "Mock Category" }]);
  });

  it("renders products for a valid category", async () => {
    const products = [
      {
        _id: "1",
        name: "Product 1",
        price: 100,
        description: "Description 1",
        slug: "product-1",
      },
      {
        _id: "2",
        name: "Product 2",
        price: 200,
        description: "Description 2",
        slug: "product-2",
      },
    ];
    const category = { name: "Category 1" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/product-category"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Category - Category 1/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/2 result found/i)).toBeInTheDocument();
    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
  });
});