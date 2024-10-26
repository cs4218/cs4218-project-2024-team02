import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Layout from "./Layout";
import { useAuth } from '../context/auth.js';
import { useCart } from '../context/cart.js';
import { useSearch } from "../context/search";
import { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { title } from "process";

jest.mock('../context/auth.js', () => ({
    useAuth: jest.fn()
  }));

jest.mock('../context/cart.js', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../context/search.js', () => ({
    useSearch: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));


describe('Layout Integration tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([null, jest.fn()]);
        useCart.mockReturnValue([[], jest.fn()]);
        useSearch.mockReturnValue([[], jest.fn()]);
        document.title = 'o';
      });

    test('renders Header component correctly', () => {

        render(
            <BrowserRouter>
                <Layout title={"title"}/>
            </BrowserRouter>
        );
      
        expect(screen.getByText(/Virtual Vault/i)).toBeInTheDocument();
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/all categories/i)).toBeInTheDocument();
        
      });


      test('renders Footer component correctly', () => {
        render(
            <BrowserRouter>
                <Layout title={"title"}/>
            </BrowserRouter>
        );
      
        expect(screen.getByText(/About/i)).toBeInTheDocument();
        expect(screen.getByText(/Contact/i)).toBeInTheDocument();
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
        expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
        
      });

      test('renders both Header and Footer components together correctly', () => {
        render(
            <BrowserRouter>
                <Layout title={"title"}/>
            </BrowserRouter>
        );
      
        const links = screen.getAllByRole('link');
        expect(links.length).toBe(10);
        
      });

});


