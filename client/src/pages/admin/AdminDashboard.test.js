import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import AdminDashboard from './AdminDashboard'; // Adjust the path as needed
import { useAuth } from '../../context/auth';

// Mock the useAuth context
jest.mock('../../context/auth');

// Mock the AdminMenu component
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu Component</div>);

jest.mock('../../components/Header', () => () => <div>Header Component</div>);

describe('AdminDashboard', () => {
  beforeEach(() => {
    // Mocking the auth context to return a test user
    useAuth.mockReturnValue([
      {
        user: {
          name: 'Admin Test',
          email: 'admin@test.com',
          phone: '1234567890',
        },
      },
    ]);
  });

  it('should render the AdminDashboard correctly with user details', () => {
    // Render the component
    render(
        <Router>
          <AdminDashboard />
        </Router>
      );

    // Assert that the AdminMenu component is rendered
    expect(screen.getByText('AdminMenu Component')).toBeInTheDocument();

    // Assert that the user's details are rendered correctly
    expect(screen.getByText(/Admin Name : Admin Test/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Email : admin@test.com/)).toBeInTheDocument();
    expect(screen.getByText(/Admin Contact : 1234567890/)).toBeInTheDocument();
  });
});
