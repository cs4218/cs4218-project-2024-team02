import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import axios from "axios";
import { useAuth } from "../context/auth.js";
import { useCart } from "../context/cart.js";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Categories from "./Categories.js";

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

describe("Categories integration tests", () => {
  let mockAuth, mockCart;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = null;
    mockCart = [];

    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([mockCart, jest.fn()]);
  });

  it("renders categories correctly", () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Books", slug: "books" },
    ];

    // Mock the useCategory hook to return sample categories
    useCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    // Check if category buttons are rendered with the correct text
    expect(screen.getAllByText("Electronics")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Electronics")[1]).toBeInTheDocument();
    expect(screen.getAllByText("Books")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Books")[1]).toBeInTheDocument();
  });

  it("navigates to the correct category page on click", async () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Books", slug: "books" },
    ];

    useCategory.mockReturnValue(mockCategories);

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/category/:slug"
            element={<div>Category Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    // Click on the "Electronics" category link
    const electronicsLink = screen.getAllByText("Electronics")[0];
    userEvent.click(electronicsLink);

    // Check if redirected to the correct category page
    expect(await screen.findByText("Category Page")).toBeInTheDocument();
  });

});
