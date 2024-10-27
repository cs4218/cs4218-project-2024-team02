import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from 'react-router-dom'; 


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

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();
  Object.defineProperty(window, "localStorage", { value: localStorageMock });


describe("Profile Page Integration Tests", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([{ user: { name: "John Doe", email: "john@example.com", phone: "1234567890", address: "123 Street" } }, jest.fn()]);
    });

    test("Updates profile successfully on form submission", async () => {
        axios.put.mockResolvedValue({ data: { updatedUser: { name: "John Doe Updated", phone: "0987654321" } } });

        window.localStorage.setItem("auth", JSON.stringify({ user: { name: "John Doe", email: "john@example.com", phone: "1234567890", address: "123 Street" } }));
        render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>);

        fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "John Doe Updated" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: "0987654321" } });
        fireEvent.click(screen.getByText("UPDATE"));

        expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile", expect.objectContaining({
            name: "John Doe Updated",
            phone: "0987654321"
        }));

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully"));
    });

    test("Displays error message if an error is thrown during profile update", async () => {
        axios.put.mockRejectedValue(new Error("Update failed"));

        window.localStorage.setItem("auth", JSON.stringify({ user: { name: "John Doe", email: "john@example.com", phone: "1234567890", address: "123 Street" } }));
        
        render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>);
    
        fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "New Name" } });
        fireEvent.click(screen.getByText("UPDATE"));
    
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
    });


    test("Displays error message if user details provided are wrong", async () => {
        axios.put.mockResolvedValue({ data: { error: "error" } });

        window.localStorage.setItem("auth", JSON.stringify({ user: { name: "John Doe", email: "john@example.com", phone: "1234567890", address: "123 Street" } }));
        render(
            <MemoryRouter initialEntries={['/dashboard/user/profile']}>
                <Routes>
                    <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>);

        fireEvent.click(screen.getByText("UPDATE"));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
    });
    


});
