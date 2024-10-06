/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UpdateProduct from '../../pages/admin/UpdateProduct';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('UpdateProduct Component', () => {
  const mockProduct = {
    _id: '123',
    name: 'Product 1',
    description: 'Description 1',
    price: 100,
    quantity: 10,
    shipping: '0',
    category: { _id: 'cat1', name: 'Category 1' },
  };

  const mockCategories = [
    { _id: 'cat1', name: 'Category 1' },
    { _id: 'cat2', name: 'Category 2' },
  ];

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct, _id: '123' } });
      }
      if (url.includes('/get-category')) {
        return Promise.resolve({ data: { success: true, category: mockCategories } });
      }
    });

    axios.put.mockResolvedValue({
      data: { success: true, message: 'Product Updated Successfully' },
    });

    axios.delete.mockResolvedValue({
      data: { success: true, message: 'Product Deleted Successfully' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the UpdateProduct component and fetch product details', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin/product/Product-1']}>
        <UpdateProduct />
      </MemoryRouter>
    );

    // Wait for product details to be fetched
    await screen.findByText('Update Product');
    await waitFor(() => {
      // Use a more flexible matcher
      expect(screen.getByPlaceholderText('write a name')).toHaveValue(mockProduct.name);
      expect(screen.getByPlaceholderText('write a description')).toHaveValue(mockProduct.description);
      expect(screen.getByPlaceholderText('write a Price')).toHaveValue(mockProduct.price);
      expect(screen.getByPlaceholderText('write a quantity')).toHaveValue(mockProduct.quantity);
    });
  });

  it('should update the product successfully', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin/product/Product-1']}>
        <UpdateProduct />
      </MemoryRouter>
    );

    // Change product details
    fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: 'Updated Product' } });
    fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: 150 } });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: 20 } });

    // Submit the update
    fireEvent.click(screen.getByText('UPDATE PRODUCT'));

    // Wait for the success toast to be called
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Product Updated Successfully'));
    expect(axios.put).toHaveBeenCalled();//With('/api/v1/product/update-product/1', expect.any(FormData));
  });

  it('should delete the product successfully', async () => {
    window.prompt = jest.fn().mockReturnValue('yes'); // Mock the prompt function

    render(
      <MemoryRouter initialEntries={['/dashboard/admin/product/Product-1']}>
        <UpdateProduct />
      </MemoryRouter>
    );

    // Click the delete button
    fireEvent.click(screen.getByText('DELETE PRODUCT'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();//.toHaveBeenCalledWith('/api/v1/product/delete-product/123'); // Ensure correct ID is used
      expect(toast.success).toHaveBeenCalledWith('Product DEleted Succfully');
    });
  });

  it('should handle error when fetching categories', async () => {
    axios.get.mockRejectedValue(new Error('Network Error')); // Simulate an error

    render(
      <MemoryRouter initialEntries={['/dashboard/admin/product/1']}>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Something wwent wrong in getting catgeory'));
  });
});
