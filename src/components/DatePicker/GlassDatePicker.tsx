/**
 * GlassDatePicker Component
 *
 * A date picker component with Glass UI styling.
 */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Import from our theme
import { useTheme, useGlassEffects } from '../../theme/ThemeProvider';
import { useAccessibility } from '../../components/AccessibilityProvider';

// Define the DatePicker Props
interface DatePickerProps {
  /**
   * Initial date
   */
  initialDate?: Date;
  
  /**
   * Callback when date changes
   */
  onChange?: (date: Date) => void;
  
  /**
   * Whether the datepicker is disabled
   */
  disabled?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Label for the date picker
   */
  label?: string;
  
  /**
   * Format for displaying the date
   */
  dateFormat?: string;
}

/**
 * GlassDatePicker component
 */
export const GlassDatePicker: React.FC<DatePickerProps> = ({
  initialDate,
    onChange,
  disabled = false,
    placeholder = 'Select date',
  className = '',
  label = 'Date',
  dateFormat = 'MM/DD/YYYY',
}) => {
    const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [displayValue, setDisplayValue] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);
  
  // Get theme utilities
  const theme = useTheme();
  const { GlassSurface } = useGlassEffects();
  const { reducedMotion } = useAccessibility();
  
  // Format date to display value
  useEffect(() => {
    if (selectedDate) {
      const formatted = formatDate(selectedDate, dateFormat);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [selectedDate, dateFormat]);
  
  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
    
    // Handle date selection
    const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) {
      onChange(date);
    }
  };
  
  // Toggle calendar
  const toggleCalendar = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Format date helper
  const formatDate = (date: Date, format: string): string => {
    // Simple formatting implementation
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('MM', month)
      .replace('DD', day)
      .replace('YYYY', String(year));
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate ? selectedDate.getMonth() : today.getMonth();
    const currentYear = selectedDate ? selectedDate.getFullYear() : today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<CalendarDay key={`empty-${i}`} empty />);
    }
    
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isSelectedDate = selectedDate && 
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      
      const isToday = 
        today.getDate() === i &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;
      
      days.push(
        <CalendarDay 
          key={`day-${i}`}
          onClick={() => handleDateSelect(date)}
          isSelected={isSelectedDate}
          isToday={isToday}
        >
          {i}
        </CalendarDay>
      );
    }
    
    return days;
  };
  
    return (
    <DatePickerContainer ref={pickerRef} className={className}>
      {label && <DatePickerLabel>{label}</DatePickerLabel>}
      
      <DatePickerInput onClick={toggleCalendar} disabled={disabled}>
        <GlassSurface 
          variant="standard"
          blurStrength="light" 
          backgroundOpacity={0.2}
          borderOpacity="minimal"
          interactive
          elevation={1}
        >
          <DatePickerInputInner>
            {displayValue || placeholder}
            <CalendarIcon />
          </DatePickerInputInner>
        </GlassSurface>
      </DatePickerInput>
      
      {isOpen && (
        <CalendarContainer>
          <GlassSurface 
            variant="frosted"
            blurStrength="medium" 
            backgroundOpacity={0.3}
            borderOpacity="minimal"
            elevation={2}
          >
            <CalendarHeader>
              <MonthYearSelector>
                {selectedDate ? formatDate(selectedDate, 'MMMM YYYY') : formatDate(new Date(), 'MMMM YYYY')}
              </MonthYearSelector>
            </CalendarHeader>
            
            <WeekDaysRow>
              <WeekDay>Su</WeekDay>
              <WeekDay>Mo</WeekDay>
              <WeekDay>Tu</WeekDay>
              <WeekDay>We</WeekDay>
              <WeekDay>Th</WeekDay>
              <WeekDay>Fr</WeekDay>
              <WeekDay>Sa</WeekDay>
            </WeekDaysRow>
            
            <CalendarGrid>
              {generateCalendarDays()}
            </CalendarGrid>
          </GlassSurface>
        </CalendarContainer>
      )}
      </DatePickerContainer>
    );
};

// Styled components
const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  font-family: var(--font-family, 'Inter', sans-serif);
`;

const DatePickerLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color, rgba(255, 255, 255, 0.9));
`;

const DatePickerInput = styled.div<{ disabled?: boolean }>`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const DatePickerInputInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 48px;
  width: 100%;
  font-size: 14px;
`;

const CalendarIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 2px;
    left: 2px;
    top: 2px;
  }
  
  &:after {
    content: '';
    position: absolute;
    width: 2px;
    height: 4px;
    background: currentColor;
    left: 5px;
    top: 0;
    box-shadow: 9px 0 0 0 currentColor;
  }
`;

const CalendarContainer = styled.div`
  position: absolute;
  width: 280px;
  margin-top: 8px;
  z-index: 10;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MonthYearSelector = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const WeekDaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const WeekDay = styled.div`
  color: rgba(255, 255, 255, 0.6);
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px;
`;

const CalendarDay = styled.div<{ empty?: boolean; isSelected?: boolean; isToday?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 13px;
  cursor: ${props => props.empty ? 'default' : 'pointer'};
  border-radius: 50%;
  color: ${props => {
    if (props.empty) return 'transparent';
    if (props.isSelected) return '#FFFFFF';
    return 'inherit';
  }};
  background: ${props => props.isSelected ? 'rgba(100, 100, 255, 0.6)' : 'transparent'};
  border: ${props => props.isToday ? '1px solid rgba(255, 255, 255, 0.5)' : 'none'};
  
  &:hover {
    background: ${props => (!props.empty && !props.isSelected) ? 'rgba(255, 255, 255, 0.1)' : props.isSelected ? 'rgba(100, 100, 255, 0.6)' : 'transparent'};
  }
`;

export default GlassDatePicker; 