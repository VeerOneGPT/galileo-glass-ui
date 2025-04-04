/**
 * GlassDateRangePicker Component Tests
 * 
 * This file contains tests for the GlassDateRangePicker component to ensure it renders correctly
 * with different props and handles user interactions properly.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils';
import { within } from '@testing-library/dom';
import { GlassDateRangePicker, GlassDateRangePickerRef } from '../GlassDateRangePicker';
import { GlassLocalizationProvider } from '../../DatePicker/GlassLocalizationProvider';
import { createDateFnsAdapter } from '../../DatePicker/adapters/dateFnsAdapter';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { AnimationProvider } from '../../../contexts/AnimationContext';
import 'jest-styled-components';

// --- Mocking the date adapter --- 
jest.mock('../../DatePicker/adapters/dateFnsAdapter', () => ({
  createDateFnsAdapter: jest.fn(() => ({
    locale: 'en-US',
    format: jest.fn((date, formatString) => date ? `${formatString}-${date.toISOString()}` : ''), // Basic mock
    parse: jest.fn((value) => value ? new Date(value) : null), // Basic mock
    isValid: jest.fn((date) => date instanceof Date && !isNaN(date.getTime())), // Basic mock
    isSameDay: jest.fn((date1, date2) => date1?.toDateString() === date2?.toDateString()), // Basic mock
    getMonthData: jest.fn(() => []), // Crucial: Mock getMonthData
    // Add other functions if needed by the component, mocking basic behavior
    addDays: jest.fn((date, amount) => { const newDate = new Date(date); newDate.setDate(date.getDate() + amount); return newDate; }),
    isToday: jest.fn((date) => new Date().toDateString() === date?.toDateString()),
    isSameMonth: jest.fn((date1, date2) => date1?.getMonth() === date2?.getMonth() && date1?.getFullYear() === date2?.getFullYear()),
    getDaysInMonth: jest.fn(() => 30),
    getWeekdays: jest.fn(() => ['S', 'M', 'T', 'W', 'T', 'F', 'S']),
    getMonthNames: jest.fn(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
  }))
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <GlassLocalizationProvider adapter={createDateFnsAdapter()}>
        {ui}
      </GlassLocalizationProvider>
    </LocalizationProvider>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <GlassLocalizationProvider adapter={createDateFnsAdapter()}>
      {children}
    </GlassLocalizationProvider>
  </LocalizationProvider>
);

describe('GlassDateRangePicker Component', () => {
  beforeEach(() => {
    // Clear any mocks between tests
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
      />
    );
    
    // Check if component is rendered
    expect(screen.getByTestId('glass-date-range-picker')).toBeInTheDocument();
    
    // Input should show formatted date range
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(expect.stringMatching(/01\/01\/2023.*01\/07\/2023/));
  });

  it('opens calendar when input is clicked', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
      />
    );
    
    // Calendar should initially be closed
    expect(screen.queryByTestId('date-range-calendar')).not.toBeInTheDocument();
    
    // Click the input
    fireEvent.click(screen.getByRole('textbox'));
    
    // Calendar should be open
    expect(screen.getByTestId('date-range-calendar')).toBeInTheDocument();
  });

  it('calls onChange when dates are selected', () => {
    const onChange = jest.fn();
    
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={onChange}
      />
    );
    
    // Open calendar
    fireEvent.click(screen.getByRole('textbox'));
    
    // Find and click a date (this is a simplified test - actual implementation may differ)
    const dateElements = screen.getAllByRole('button', { name: /\d+/ });
    // Click the 15th of the month
    const date15 = dateElements.find(el => el.textContent === '15');
    if (date15) fireEvent.click(date15);
    
    // onChange should be called (this is a simplified expectation)
    expect(onChange).toHaveBeenCalled();
  });

  it('applies glass styling based on variant', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        glassVariant="frosted"
      />
    );
    
    const component = screen.getByTestId('glass-date-range-picker');
    expect(component).toHaveStyleRule('backdrop-filter', expect.stringContaining('blur'));
  });

  it('shows preset options when presets prop is true', () => {
    const testPresets = [
      {
        id: 'today',
        label: 'Today',
        getRangeFunction: (now: Date) => ({
          startDate: now,
          endDate: now
        })
      },
      {
        id: 'yesterday',
        label: 'Yesterday',
        getRangeFunction: (now: Date) => {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return {
            startDate: yesterday,
            endDate: yesterday
          };
        }
      },
      {
        id: 'last7days',
        label: 'Last 7 Days',
        getRangeFunction: (now: Date) => {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          return {
            startDate: sevenDaysAgo,
            endDate: now
          };
        }
      }
    ];

    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        presets={testPresets}
      />
    );
    
    // Open calendar
    fireEvent.click(screen.getByRole('textbox'));
    
    // Preset options should be visible
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
  });

  it('enables comparison mode when comparisonMode is true', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        comparisonMode={true}
      />
    );
    
    // Open calendar
    fireEvent.click(screen.getByRole('textbox'));
    
    // Comparison mode toggle should be visible
    expect(screen.getByText(/comparison/i)).toBeInTheDocument();
    
    // Toggle comparison mode
    fireEvent.click(screen.getByText(/comparison/i));
    
    // Debug to see comparison inputs
    screen.debug();

    // Comparison inputs should appear
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1);
  });

  it('supports different date formats', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        dateFormat="yyyy-MM-dd"
      />
    );
    
    // Input should show formatted date range with the specified format
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(expect.stringMatching(/2023-01-01.*2023-01-07/));
  });

  it('disables the component when disabled prop is true', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        disabled={true}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Input should be disabled
    expect(input).toBeDisabled();
    
    // Click should not open calendar
    fireEvent.click(input);
    expect(screen.queryByTestId('date-range-calendar')).not.toBeInTheDocument();
  });

  it('applies animation when animation prop is provided', async () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        animate={true}
        physics={{ animationPreset: 'bouncy' }}
      />
    );
    
    // Open calendar
    fireEvent.click(screen.getByRole('textbox'));
    
    // Wrap assertions in waitFor
    await waitFor(() => {
      // Animation should be enabled (adjust assertion based on implementation)
      // Query by role for the dialog, then find header within it
      const calendarDialog = screen.getByRole('dialog', { name: /date range selection calendar/i });
      const header = within(calendarDialog).getByText(/select date range/i).closest('div'); // Find header by title
      expect(header).toHaveAttribute('data-animate', 'true');
    });
  });

  it('allows selecting time when showTime is true', () => {
    renderWithProviders(
      <GlassDateRangePicker 
        value={{
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 0, 7)
        }}
        onChange={() => { /* No-op */ }}
        enableTimeSelection={true}
      />
    );
    
    // Open calendar
    fireEvent.click(screen.getByRole('textbox'));
    
    // Time inputs should be visible
    const timeInputs = screen.getAllByRole('textbox', { name: /time/i });
    expect(timeInputs.length).toBeGreaterThan(0);
  });

  test('renders correctly', () => {
    render(
      <TestWrapper>
        <GlassDateRangePicker label="Date Range" />
      </TestWrapper>
    );
    expect(screen.getByRole('textbox', { name: /start date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /end date/i })).toBeInTheDocument();
  });

  test('forwards ref correctly with imperative handle methods', () => {
    const ref = React.createRef<GlassDateRangePickerRef>();
    render(
      <TestWrapper>
        <GlassDateRangePicker ref={ref} label="Date Range" />
      </TestWrapper>
    );
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.openPicker).toBe('function');
    expect(typeof ref.current?.closePicker).toBe('function');
    expect(typeof ref.current?.getSelectedRange).toBe('function');
  });
});