import React from 'react';
import { render, screen } from '@testing-library/react';
import Users from '../../pages/admin/Users'; // Adjust the import path as needed
import '@testing-library/jest-dom/extend-expect';

// Mocking the Layout and AdminMenu components
jest.mock('../../components/Layout', () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

jest.mock('../../components/AdminMenu', () => () => (
  <div data-testid="admin-menu">Admin Menu</div>
));

describe('Users Component', () => {
  it('renders correctly', () => {
    render(<Users />);

    // Check if the Layout is rendered with the correct title
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Dashboard - All Users')).toBeInTheDocument();

    // Check if the AdminMenu is rendered
    expect(screen.getByTestId('admin-menu')).toBeInTheDocument();

    // Check if the "All Users" heading is present
    expect(screen.getAllByRole('heading', { name: /All Users/i })[1]).toBeInTheDocument();
  });
});
