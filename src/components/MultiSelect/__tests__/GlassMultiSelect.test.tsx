/**
 * GlassMultiSelect Component Tests
 * 
 * This file contains tests for the GlassMultiSelect component to ensure it renders correctly
 * with different props and handles user interactions properly.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils/test-utils';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme';
import { GlassMultiSelect } from '../GlassMultiSelect';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import { MultiSelectOption } from '../types';

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

// Helper function to render with theme AND ANIMATION PROVIDER
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <AnimationProvider>
      {ui}
      </AnimationProvider>
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
    renderWithProviders(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => { /* No-op */ }}
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
    
    renderWithProviders(
      <GlassMultiSelect 
        options={mockOptions}
        value={selectedValues}
        onChange={() => { /* No-op */ }}
      />
    );
    
    // Check if tokens are rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('opens dropdown on click and closes on click outside', async () => {
    renderWithProviders(
      <GlassMultiSelect options={mockOptions} value={[]} onChange={() => {}} />
    );
    const input = screen.getByRole('textbox');

    // Initially closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Click input to open
    await act(async () => {
      fireEvent.click(input);
    });
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Click outside (on body) to close
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
     await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('calls onChange when option is selected', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <GlassMultiSelect options={mockOptions} value={[]} onChange={onChange} />
    );
    const input = screen.getByRole('textbox');

    // Open dropdown
    await act(async () => {
      fireEvent.click(input);
    });
    const listbox = await screen.findByRole('listbox'); // Wait for listbox

    // Select an option
    await act(async () => {
      const option = screen.getByText('React');
      fireEvent.click(option);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([getOptionById('react')]);
    // Dropdown should close after selection
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('removes token when remove button is clicked', async () => {
    const onChange = jest.fn();
    const initialValue = [getOptionById('react'), getOptionById('vue')].filter(Boolean) as MultiSelectOption<string>[];
    renderWithProviders(
      <GlassMultiSelect options={mockOptions} value={initialValue} onChange={onChange} />
    );
    
    // Wait for tokens to be rendered
    const removeButtons = await screen.findAllByRole('button', { name: /remove/i });
    expect(removeButtons.length).toBe(2);

    // Click the first remove button (React)
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([getOptionById('vue')].filter(Boolean));
  });

  it('applies glass styling based on variant', () => {
    renderWithProviders(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => { /* No-op */ }}
      />
    );
    
    const component = screen.getByTestId('glass-multi-select');
    expect(component).toHaveStyleRule('backdrop-filter', expect.stringContaining('blur'));
  });

  it('filters options based on input', async () => {
    renderWithProviders(
      <GlassMultiSelect options={mockOptions} value={[]} onChange={() => {}} />
    );
    const input = screen.getByRole('textbox');

    // Open dropdown by focusing and typing (more realistic)
    await act(async () => {
        fireEvent.change(input, { target: { value: 'v' } });
    });
    
    // Wait for dropdown and filtering
    await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Vue')).toBeInTheDocument();
        expect(screen.queryByText('React')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Clear input
     await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
    });
     await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Vue')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('groups options by category when groupBy is provided', () => {
    // Prepare options with the group property set
    const groupedOptions = mockOptions.map(option => ({
      ...option,
      group: option.category // Use the category as the group property
    }));

    renderWithProviders(
      <GlassMultiSelect 
        options={groupedOptions}
        value={[]}
        onChange={() => { /* No-op */ }}
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

  it('supports keyboard navigation', async () => {
    const onChange = jest.fn();
    renderWithProviders(
      <GlassMultiSelect options={mockOptions} value={[]} onChange={onChange} />
    );
    const input = screen.getByRole('textbox'); // Target the input

    // Press ArrowDown to open and focus first item
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    let listbox = await screen.findByRole('listbox');
    let options = await screen.findAllByRole('option');
    expect(listbox).toBeInTheDocument();
    await waitFor(() => {
      expect(options[0]).toHaveAttribute('aria-selected', 'true'); // Or check focus/highlight class
      expect(options[0]).toHaveTextContent('React');
    }, { timeout: 1000 });

    // Press ArrowDown again to focus second item
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
     await waitFor(() => {
      expect(options[0]).not.toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveTextContent('Vue');
    }, { timeout: 1000 });

    // Press Enter to select focused item (Vue)
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([getOptionById('vue')]);
    // Listbox should close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Re-open with ArrowDown
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    listbox = await screen.findByRole('listbox'); // Wait again
    expect(listbox).toBeInTheDocument();

    // Press Escape to close dropdown
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('disables the component when disabled prop is true', () => {
    renderWithProviders(
      <GlassMultiSelect 
        options={mockOptions}
        value={[]}
        onChange={() => { /* No-op */ }}
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