import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen, within, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';  // Required for `useNavigate`
import axios from 'axios';
import CartPage from './CartPage';
import { useAuth } from '../context/auth.js';
import { useCart } from '../context/cart.js';

// Mock the auth and cart context
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../context/auth.js', () => ({
    useAuth: jest.fn()
  }));

  jest.mock('../context/cart.js', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../context/search.js', () => ({
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

  Object.defineProperty(window, 'localStorage', {
    value: {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };  


describe('CartPage Component', () => {
  let mockAuth, mockCart;


  beforeEach(() => {
    jest.clearAllMocks();

    mockAuth = null;
    mockCart = [];

    useAuth.mockReturnValue([mockAuth, jest.fn()]);
    useCart.mockReturnValue([mockCart, jest.fn()]);
  });

  describe("CartPage header", () => {
    it('header renders correctly when cart is empty and user is not logged in', () => {
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText('Hello Guest')).toBeInTheDocument();
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
    });

    it('header renders correctly when cart is not empty and user is not logged in', () => {
      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: 10 },
        { _id: 2, name: 'item2', description: 'item2 description', price: 69 },
      ];
      useCart.mockReturnValue([mockCart, jest.fn()]);
      
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText('Hello Guest')).toBeInTheDocument();
      expect(screen.getByText(`You Have ${mockCart.length} items in your cart please login to checkout !`)).toBeInTheDocument();
    });

    it('header renders correctly when cart is empty and user is logged in', () => {
      const mockUser_name = "Elon Musk";
      const mockAuth = { user: { name: mockUser_name }, token: "mockToken" };
      useAuth.mockReturnValue([mockAuth, jest.fn()]);

      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText(`Hello ${mockUser_name}`)).toBeInTheDocument();
      expect(screen.getByText('Your Cart Is Empty')).toBeInTheDocument();
    });

    it('header renders correctly when cart is not empty and user is logged in', () => {
      const mockUser_name = "Lucas Johnson Skywalker";
      const mockAuth = { user: { name: mockUser_name }, token: "mockToken" };

      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: 10 },
        { _id: 2, name: 'item2', description: 'item2 description', price: 69 },
      ];

      useCart.mockReturnValue([mockCart, jest.fn()]);
      useAuth.mockReturnValue([mockAuth, jest.fn()]);

      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText(`Hello ${mockUser_name}`)).toBeInTheDocument();
      expect(screen.getByText(`You Have ${mockCart.length} items in your cart`)).toBeInTheDocument();
    });
  });
  
  describe("CartPage Total Price", () => {

    it('shows correct total price when cart is not empty', () => {
      const prices = [10, 69];
      const totalPrice = prices.reduce((a, b) => a + b).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
  
      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: prices[0] },
        { _id: 2, name: 'item2', description: 'item2 description', price: prices[1] },
      ];
      useCart.mockReturnValue([mockCart, jest.fn()]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText(`Total : ${totalPrice}`)).toBeInTheDocument();
    });
  
    it('shows correct total price when cart is empty', () => {
      const price = 0;
      const totalPrice = price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText(`Total : ${totalPrice}`)).toBeInTheDocument();
    });
  });

  describe("CartPage cart items", () => {
    it('shows the correct items when cart is not empty', () => {
      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: 69 },
        { _id: 2, name: 'item2', description: 'item2 description', price: 690 },
      ];
      useCart.mockReturnValue([mockCart, jest.fn()]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText("item1")).toBeInTheDocument();
      expect(screen.getByText("item1 description")).toBeInTheDocument();
      expect(screen.getByText("Price : 69")).toBeInTheDocument();
  
      expect(screen.getByText("item2")).toBeInTheDocument();
      expect(screen.getByText("item2 description")).toBeInTheDocument();
      expect(screen.getByText("Price : 690")).toBeInTheDocument();

      const removeButtons = screen.getAllByRole("button", { name: "Remove" });
      expect(removeButtons.length).toBe(2);
  
    });

    it('shows non items when cart is empty', () => {
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );

      const removeButton = screen.queryByText('Remove')
      expect(removeButton).not.toBeInTheDocument();
  
    });

    it('successfully removes items from cart when remove is clicked', () => {
      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: 69 },
        { _id: 2, name: 'item2', description: 'item2 description', price: 690 },
      ];

      const mockSetCart = jest.fn();
      useCart.mockReturnValue([mockCart, mockSetCart]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText("item1")).toBeInTheDocument();
      expect(screen.getByText("item1 description")).toBeInTheDocument();
      expect(screen.getByText("Price : 69")).toBeInTheDocument();
      expect(screen.getByText("You Have 2 items in your cart please login to checkout !"));
  
      const removeButton = screen.getAllByRole("button", { name: "Remove" })[1];
      fireEvent.click(removeButton);

      expect(mockSetCart).toHaveBeenCalledWith([mockCart[0]]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([mockCart[0]]
      ));
    });
  })
  
  describe("CartPage checkout portion", () => {
    it('address should render correctly if user is logged in', () => {
      const mockUser_address= "123 NUS Road";
      const mockAuth = { user: { name: "Jonny Mcwings", address: mockUser_address }, token: "mockToken" };
  
      mockCart = [
        { _id: 1, name: 'item1', description: 'item1 description', price: 69 },
        { _id: 2, name: 'item2', description: 'item2 description', price: 690 },
      ];
  
      useCart.mockReturnValue([mockCart, jest.fn()]);
      useAuth.mockReturnValue([mockAuth, jest.fn()]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
    
      expect(screen.getByText("Current Address")).toBeInTheDocument();
      expect(screen.getByText(`${mockUser_address}`)).toBeInTheDocument();
    });
  
    it('update address button renders if user is logged in and redirects to user profile page when clicked', async () => {
      const mockNav = jest.fn();
      const urlToNavigate = '/dashboard/user/profile';
      useNavigate.mockReturnValue(mockNav);
  
      const mockUser_address= "123 NUS Road";
      const mockAuth = { user: { name: "Jonny Mcwings", address: mockUser_address }, token: "mockToken" };
  
      useAuth.mockReturnValue([mockAuth, jest.fn()]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
      const updateAddressButton = screen.getByRole("button", { name : "Update Address" });
      expect(updateAddressButton).toBeDefined();
  
      fireEvent.click(updateAddressButton);
  
      await waitFor(() => {
        expect(mockNav).toHaveBeenCalledTimes(1);
        expect(mockNav).toHaveBeenCalledWith(urlToNavigate);
      });
      
    });
  
    it('plase login button renders if user is not logged in, directs to login page when clicked', async () => {
      const mockNav = jest.fn();
      const urlToNavigate = '/login';
      const state = "/cart";
      useNavigate.mockReturnValue(mockNav);
  
      useAuth.mockReturnValue([mockAuth, jest.fn()]);
  
      render(
      <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      );
      
      const updateAddressButton = screen.getByRole("button", { name : "Plase Login to checkout" });
      expect(updateAddressButton).toBeDefined();
  
      fireEvent.click(updateAddressButton);
  
      await waitFor(() => {
        expect(mockNav).toHaveBeenCalledTimes(1);
        expect(mockNav).toHaveBeenCalledWith(urlToNavigate, { state : state });
      });
      
    });
  });

});