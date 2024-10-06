/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Products from '../../pages/admin/Products';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers like 'toBeInTheDocument'

// Mock axios and toast
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('Products Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        products: [
          { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
          { _id: '2', name: 'Product 2', description: 'Description 2', slug: 'product-2' },
        ],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the Products component correctly and display products', async () => {
    render(
      <Router>
        <Products />
      </Router>
    );

    // Assert that the title is rendered
    expect(screen.getByText('All Products List')).toBeInTheDocument();

    // Wait for products to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching products', async () => {
    axios.get.mockRejectedValue(new Error('Network Error')); // Simulate an error

    render(
      <Router>
        <Products />
      </Router>
    );

    // Wait for error toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong');
    });
  });
});
