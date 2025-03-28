/**
 * GlassMultiSelect Component Tests
 * 
 * This file contains tests for the GlassMultiSelect component to ensure it renders correctly
 * with different props and handles user interactions properly.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme';
import { GlassMultiSelect } from '../GlassMultiSelect';

// Sample options for testing
const mockOptions = [
  { id: 'react', value: 'react', label: 'React', category: 'frontend' },
  { id: 'vue', value: 'vue', label: 'Vue', category: 'frontend' },
  { id: 'angular', value: 'angular', label: 'Angular', category: 'frontend' },
  { id: 'node', value: 'node', label: 'Node.js', category: 'backend' },
  { id: 'express', value: 'express', label: 'Express', category: 'backend' }
];

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

// Helper function to convert string values to MultiSelectOption objects
const getOptionById = (id: string) => mockOptions.find(opt => opt.id === id);

describe('GlassMultiSelect Component', () => {
  beforeEach(() => {
    // Clear any mocks between tests
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
        placeholder="Select options"
      />
    );
    
    // Check if component is rendered
    expect(screen.getByTestId('glass-multi-select')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select options')).toBeInTheDocument();
  });

  it('shows selected items as tokens', () => {
    const selectedValues = [
      getOptionById('react'),
      getOptionById('node')
    ].filter(Boolean); // Filter out any undefined values
    
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={selectedValues}
        onChange={() => {}}
      />
    );
    
    // Check if tokens are rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );
    
    // Dropdown should initially be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(screen.getByTestId('glass-multi-select'));
    
    // Dropdown should be open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Options should be visible
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = jest.fn();
    
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={onChange}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('glass-multi-select'));
    
    // Select an option
    fireEvent.click(screen.getByText('React'));
    
    // onChange should be called with the selected value
    expect(onChange).toHaveBeenCalledWith([getOptionById('react')]);
  });

  it('removes token when remove button is clicked', () => {
    const onChange = jest.fn();
    const initialValue = [getOptionById('react'), getOptionById('vue')].filter(Boolean);
    
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={initialValue}
        onChange={onChange}
      />
    );
    
    // Find remove buttons
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    
    // Click the first remove button (React)
    fireEvent.click(removeButtons[0]);
    
    // onChange should be called with the remaining value
    expect(onChange).toHaveBeenCalledWith([getOptionById('vue')].filter(Boolean));
  });

  it('applies glass styling based on variant', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );
    
    const component = screen.getByTestId('glass-multi-select');
    expect(component).toHaveStyleRule('backdrop-filter', expect.stringContaining('blur'));
  });

  it('filters options based on input', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('glass-multi-select'));
    
    // Type in search input
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'react' } });
    
    // Only React should be visible, Vue and Angular should not
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();
    expect(screen.queryByText('Angular')).not.toBeInTheDocument();
  });

  it('groups options by category when groupBy is provided', () => {
    // Prepare options with the group property set
    const groupedOptions = mockOptions.map(option => ({
      ...option,
      group: option.category // Use the category as the group property
    }));

    renderWithTheme(
      <GlassMultiSelect 
        options={groupedOptions}
        value={[]}
        onChange={() => {}}
        withGroups={true} // Use withGroups instead of groupBy
        groups={[
          { id: 'frontend', label: 'Frontend' },
          { id: 'backend', label: 'Backend' }
        ]}
      />
    );
    
    // Open dropdown
    fireEvent.click(screen.getByTestId('glass-multi-select'));
    
    // Group headers should be visible
    expect(screen.getByText('FRONTEND')).toBeInTheDocument(); // Group headers are uppercase
    expect(screen.getByText('BACKEND')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );
    
    // Focus the component
    const component = screen.getByTestId('glass-multi-select');
    component.focus();
    
    // Press down arrow to open dropdown
    fireEvent.keyDown(component, { key: 'ArrowDown' });
    
    // Dropdown should be open
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Press down arrow to navigate options
    fireEvent.keyDown(component, { key: 'ArrowDown' });
    
    // Press Enter to select option
    fireEvent.keyDown(component, { key: 'Enter' });
    
    // Press Escape to close dropdown
    fireEvent.keyDown(component, { key: 'Escape' });
    
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disables the component when disabled prop is true', () => {
    renderWithTheme(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => {}}
        disabled={true}
      />
    );
    
    const component = screen.getByTestId('glass-multi-select');
    
    // Should have disabled attribute or class
    expect(component).toHaveAttribute('aria-disabled', 'true');
    
    // Click should not open dropdown
    fireEvent.click(component);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});