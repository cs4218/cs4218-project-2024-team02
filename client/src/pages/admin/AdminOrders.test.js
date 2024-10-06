/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminOrders from '../../pages/admin/AdminOrders';
import { useAuth } from '../../context/auth';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers like 'toBeInTheDocument'
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the necessary modules
jest.mock('axios');
jest.mock('../../context/auth');
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu Component</div>);
jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('AdminOrders Component', () => {
  beforeEach(() => {
    // Mock the auth context with a fake token and user
    useAuth.mockReturnValue([{ token: 'fake-token' }, jest.fn()]);

    // Mock axios GET response for fetching orders
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 'order-1',
          status: 'Processing',
          buyer: { name: 'John Doe' },
          createAt: '2023-10-01T12:00:00Z',
          payment: { success: true },
          products: [
            {
              _id: 'product-1',
              name: 'Product 1',
              description: 'This is product 1',
              price: 100,
            },
          ],
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('renders AdminOrders with orders', async () => {
    render(
        <Router>
          <AdminOrders />
        </Router>
      );

    // Check that the AdminMenu component is rendered
    expect(screen.getByText('AdminMenu Component')).toBeInTheDocument();

    // Check that the title is rendered
    expect(screen.getByText('All Orders')).toBeInTheDocument();

    // Wait for orders to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Price : 100')).toBeInTheDocument();
    });
  });

  it('updates order status when changed', async () => {
    render(
        <Router>
          <AdminOrders />
        </Router>
      );

    // Wait for orders to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    // Mock axios PUT response for updating order status
    axios.put.mockResolvedValue({
      data: { success: true },
    });

    // Simulate changing the order status by opening the dropdown and selecting a new value
    fireEvent.mouseDown(screen.getByText('Processing')); // Open the dropdown
    fireEvent.click(screen.getByText('Shipped')); // Select the new status

    // Check if axios.put was called with the correct parameters
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/order-status/order-1', {
        status: 'Shipped',
      });
    });

    // Verify that the status is updated (in this case, we assume orders are re-fetched)
    expect(axios.get).toHaveBeenCalled();
  });
});
