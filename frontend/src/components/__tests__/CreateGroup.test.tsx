// import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateGroup from '../CreateGroup';
import { mockApi } from '../../api/mockApi';

// Mock the mockApi
jest.mock('../../api/mockApi');

describe('CreateGroup Component', () => {
  const mockOnSuccess = jest.fn();
  const currentUserId = "1";
  const mockUser = { id: "1", name: "Current User" };
  const mockSearchResults = [
    { id: "2", name: "John Doe" },
    { id: "3", name: "Jane Smith" }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mockApi methods
    (mockApi.getUser as jest.Mock).mockResolvedValue(mockUser);
    (mockApi.searchUsers as jest.Mock).mockResolvedValue(mockSearchResults);
    (mockApi.createGroup as jest.Mock).mockResolvedValue({ id: "1", name: "Test Group" });
  });

  test('renders create group form with all required fields', () => {
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Check for form elements
    expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search members/i)).toBeInTheDocument();
  });

  test('automatically includes creator and prevents removal', async () => {
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Wait for creator to be added
    await waitFor(() => {
      expect(screen.getByText("Current User")).toBeInTheDocument();
    });
    
    // Try to remove creator (should not be possible)
    const removeButtons = screen.queryAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(0);
  });

  test('shows real-time search results', async () => {
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Type in search
    const searchInput = screen.getByPlaceholderText(/search members/i);
    await userEvent.type(searchInput, 'jo');
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  test('allows adding and removing members', async () => {
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Search and add a member
    const searchInput = screen.getByPlaceholderText(/search members/i);
    await userEvent.type(searchInput, 'jo');
    
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
    
    // Click to add member
    fireEvent.click(screen.getByText("John Doe"));
    
    // Verify member is added
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    
    // Remove the added member
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    // Verify member is removed
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  test('shows "No results" when search returns empty', async () => {
    (mockApi.searchUsers as jest.Mock).mockResolvedValueOnce([]);
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Search with no results
    const searchInput = screen.getByPlaceholderText(/search members/i);
    await userEvent.type(searchInput, 'xyz');
    
    // Wait for "No results" message
    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  test('successfully creates a group', async () => {
    render(<CreateGroup currentUserId={currentUserId} onSuccess={mockOnSuccess} />);
    
    // Fill in form
    await userEvent.type(screen.getByLabelText(/group name/i), 'Test Group');
    await userEvent.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Add a member
    const searchInput = screen.getByPlaceholderText(/search members/i);
    await userEvent.type(searchInput, 'jo');
    await waitFor(() => {
      fireEvent.click(screen.getByText("John Doe"));
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    
    // Verify group creation
    await waitFor(() => {
      expect(mockApi.createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        description: 'Test Description',
        members: expect.arrayContaining([currentUserId, "2"])
      });
      expect(mockOnSuccess).toHaveBeenCalledWith('Test Group', 2);
    });
  });
}); 