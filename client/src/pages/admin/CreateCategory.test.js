import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateCategory from '../../pages/admin/CreateCategory';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers like 'toBeInTheDocument'

// Mock axios and toast
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('CreateCategory Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        category: [{ _id: '1', name: 'Category 1' }],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  
  it('should render the CreateCategory component correctly', async () => {
    render(
        <Router>
          <CreateCategory />
        </Router>
      );
    
    // Assert that the initial elements are rendered correctly
    expect(screen.getByText('Manage Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();

    // Wait for categories to be fetched and displayed
    await screen.findByText('Category 1');
  });

  it('should handle category creation', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Category created' },
    });

    render(
        <Router>
          <CreateCategory />
        </Router>
      );
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(input, { target: { value: 'New Category' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('New Category is created'));

    // Assert that the category creation function was called
    expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', { name: 'New Category' });
  });

  it('should handle category update', async () => {
    axios.put.mockResolvedValue({
      data: { success: true, message: 'Category updated' },
    });

    render(
        <Router>
          <CreateCategory />
        </Router>
      );
    
    // Wait for the "Edit" button to be displayed after categories are fetched
    await screen.findByText('Edit');
    
    // Open edit modal
    fireEvent.click(screen.getByText('Edit'));
    
    // Update category name
    const inputs = screen.getAllByRole('textbox');
    const input = inputs[1]; // Assuming the second textbox is in the modal

    fireEvent.change(input, { target: { value: 'Updated Category' } });

    fireEvent.click(screen.getAllByRole('button', { name: /Submit/i })[1]);
    
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Updated Category is updated'));

    // Assert that the update function was called
    expect(axios.put).toHaveBeenCalledWith('/api/v1/category/update-category/1', { name: 'Updated Category' });
  });

  it('should handle category deletion', async () => {
    axios.delete.mockResolvedValue({
      data: { success: true, message: 'Category deleted' },
    });

    render(
        <Router>
          <CreateCategory />
        </Router>
      );

    // Wait for the "Delete" button to be displayed
    await screen.findByText('Delete');
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('category is deleted'));

    // Assert that the delete function was called
    expect(axios.delete).toHaveBeenCalledWith('/api/v1/category/delete-category/1');
  });


  // Integration Tests
  it('should create a new category and display it in the list', async () => {
    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });
    

    render(
      <Router>
        <CreateCategory />
      </Router>
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Category' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('New Category is created');
    });
    // Mock the retrieval of categories after a new category is created
    
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', { name: 'New Category' });
    
    await waitFor(() => {
      expect(screen.getByText('New Category')).toBeInTheDocument();
    });
  });

  it('should delete a category and update the list', async () => {
    const categoryData = [{ _id: '1', name: 'Existing Category' }];
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: categoryData },
    });

    axios.delete.mockResolvedValueOnce({
      data: { success: true },
    });

    render(
      <Router>
        <CreateCategory />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Existing Category')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('category is deleted');
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(screen.queryByText('Existing Category')).not.toBeInTheDocument();
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/category/delete-category/1');
  });
});