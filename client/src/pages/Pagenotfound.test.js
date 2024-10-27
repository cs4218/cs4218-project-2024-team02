import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import { useAuth } from '../context/auth.js';
import { useCart } from '../context/cart.js';
import { useSearch } from "../context/search";
import { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { title } from "process";
import Pagenotfound from "./Pagenotfound.js";

jest.mock('../context/auth.js', () => ({
    useAuth: jest.fn()
  }));

jest.mock('../context/cart.js', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../context/search.js', () => ({
    useSearch: jest.fn(() => [[], jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

describe('Pagenotfound Integration tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([null, jest.fn()]);
        useCart.mockReturnValue([[], jest.fn()]);
        useSearch.mockReturnValue([[], jest.fn()]);
        document.title = 'o';
      });

    test('renders Layout component correctly, which renders Header and Footer', () => {

        render(
            <BrowserRouter>
                <Pagenotfound title={"title"}/>
            </BrowserRouter>
        );
      
        expect(screen.getByText(/go back/i)).toBeInTheDocument();
        expect(screen.getByText(/page not found/i)).toBeInTheDocument();
        expect(screen.getByText(/404/i)).toBeInTheDocument();

        expect(screen.getByText(/home/i)).toBeInTheDocument();
        expect(screen.getByText(/virtual vault/i)).toBeInTheDocument();
        expect(screen.getByText(/all categories/i)).toBeInTheDocument();

        expect(screen.getByText(/go back/i)).toBeInTheDocument();
        expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
        
        const links = screen.getAllByRole("link");
        expect(links.length).toBe(11);
        
      });
});