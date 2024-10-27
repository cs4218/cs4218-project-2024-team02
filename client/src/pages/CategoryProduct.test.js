import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import axios from "axios";
import { useAuth } from "../context/auth.js";
import { useCart } from "../context/cart.js";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom";

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

describe("CategoryProduct integration with backend", () => {
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

  it("renders no products message when category has no products", async () => {
    const products = [];
    const category = { name: "Empty Category" };

    // Mock API response for an empty product list
    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/empty-category"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the empty category name is displayed
    expect(
      await screen.findByText(/Category - Empty Category/i)
    ).toBeInTheDocument();
    // Check for the "0 results found" message
    expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
    // Ensure no product cards are rendered
    expect(screen.queryByText(/Product/i)).not.toBeInTheDocument();
  });

  it("navigates to the product details page when 'More Details' is clicked", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    const products = [
      {
        _id: "1",
        name: "Navigable Product",
        price: 100,
        description: "Description for navigable product",
        slug: "navigable-product",
      },
    ];
    const category = { name: "Navigable Category" };

    axios.get.mockResolvedValueOnce({ data: { products, category } });

    render(
      <MemoryRouter initialEntries={["/category/navigable-category"]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for product data to load
    expect(
      await screen.findByText("Navigable Product", { exact: true })
    ).toBeInTheDocument();

    // Click on "More Details" button
    const moreDetailsButton = screen.getByText(/More Details/i);
    moreDetailsButton.click();

    // Assert navigation
    expect(mockNavigate).toHaveBeenCalledWith("/product/navigable-product");
  });
});
