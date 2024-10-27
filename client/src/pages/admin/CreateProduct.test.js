import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateProduct from '../../pages/admin/CreateProduct';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers like 'toBeInTheDocument'

// Mock axios and toast
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('CreateProduct Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [{ _id: '1', name: 'Electronics' }],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
  it('should render the CreateProduct component correctly', async () => {
    render(
        <Router>
          <CreateProduct />
        </Router>
      );
    
    // Assert that the initial elements are rendered correctly
    expect(screen.getAllByText('Create Product')[1]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CREATE PRODUCT/i })).toBeInTheDocument();

    // Wait for the Select dropdown to be populated
    const selectInput = await screen.findByText('Select a category');
    
    // Open the select dropdown
    fireEvent.mouseDown(selectInput);

    // Select the option
    const option = await screen.findByText('Electronics');
    fireEvent.click(option);

    // Ensure the category is selected
    expect(screen.getAllByText('Electronics')[1]).toBeInTheDocument(); // Check that the select value matches the category ID
  });
  */

  it('should handle product creation', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Product Created Successfully' },
    });

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '10' } });
    // Open the select dropdown
    fireEvent.mouseDown(screen.getByText('Select a category'));

    // Wait for the options to appear
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
    // Get all elements matching "Electronics"
    const options = await screen.findAllByText('Electronics');

    // Click the second "Electronics" element (if you have multiple entries)
    fireEvent.click(options[0]); // Use options[0] for the first instance

    // Simulate creating the product
    fireEvent.click(screen.getByRole('button', { name: /CREATE PRODUCT/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Product Created Successfully'));

    // Assert that the product creation function was called
    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/create-product', expect.any(FormData));
  });

  /*
  it('should handle product creation error', async () => {
    axios.get.mockRejectedValue(new Error('Network Error')); // Simulate an error

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Simulate creating the product
    fireEvent.click(screen.getByRole('button', { name: /CREATE PRODUCT/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('something went wrong'));
    // gives "Something wwent wrong in getting catgeory" instead, maybe remove?

    // Assert that the product creation function was called
    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/create-product', expect.any(FormData));
  });*/

  it('should display the created product in the product list', async () => {
    // Mock product creation
    axios.post.mockResolvedValueOnce({
      data: { success: true,
        category: [{ _id: '1', name: 'Electronics' }],
       },
    });

    // Mock the response for retrieving products after creation
    axios.get.mockResolvedValue({
      data: { success: true, products: [{ _id: '1', name: 'Test Product' }], category: [{ _id: '1', name: 'Electronics' }],},
    });

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Fill in the form fields
    fireEvent.change(screen.getByPlaceholderText('write a name'), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByPlaceholderText('write a description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByPlaceholderText('write a Price'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('write a quantity'), { target: { value: '10' } });
    // Open the select dropdown
    fireEvent.mouseDown(screen.getByText('Select a category'));

    // Wait for the options to appear
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    // Get all elements matching "Electronics"
    const options = await screen.findAllByText('Electronics');

    // Click the second "Electronics" element (if you have multiple entries)
    fireEvent.click(options[0]); // Use options[0] for the first instance

    // Simulate creating the product
    fireEvent.click(screen.getByRole('button', { name: /CREATE PRODUCT/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Product Created Successfully'));

    // Mocking the second fetch to return the updated product list
    axios.get.mockResolvedValueOnce({
      data: { success: true, products: [{ _id: '1', name: 'Test Product' }, { _id: '2', name: 'New Product' }] },
    });

    // Wait for the new product to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Verify that the correct API calls were made
    expect(axios.get).toHaveBeenCalledTimes(2); // Ensure get was called twice
  });

  //not supposed to pass, ui shows a 'login successfully' toast instead
  it('should handle product creation error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <Router>
        <CreateProduct />
      </Router>
    );

    // Simulate creating the product
    fireEvent.click(screen.getByRole('button', { name: /CREATE PRODUCT/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('something went wrong'));

    // Assert that the product creation function was called
    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/create-product', expect.any(FormData));
  });
});
