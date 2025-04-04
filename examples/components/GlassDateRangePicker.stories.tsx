import React, { useState, useEffect } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import {
  GlassDateRangePicker,
  StandardDateRangePresets,
  AllDateRangePresets,
} from '../../src/components/DateRangePicker';
import { DateRangePickerProps } from '../../src/components/DateRangePicker/types';
import {
  GlassLocalizationProvider,
  createDateFnsAdapter,
} from '../../src/components/DatePicker';
import { Typography } from '../../src/components/Typography';

// Define any missing types
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// --- Styled Components (Migrated) ---
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  background: ${({ theme }) => theme.colors.backgroundVariant}; // Use theme variable
  color: ${({ theme }) => theme.colors.text};
  border-radius: 12px;
  min-height: 400px;
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DemoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const SectionTitle = styled(Typography).attrs({ variant: 'h2' })` // Use Typography
  margin: 0;
`;

const DemoTitle = styled(Typography).attrs({ variant: 'h5' })` // Use Typography
  margin: 0 0 8px;
  font-weight: 500; // Make title slightly bolder
`;

const ResultDisplay = styled.div`
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  max-width: 100%;
  overflow-x: auto;
  margin-top: 16px;
`;

// --- Helper Functions (Migrated) ---
const formatDate = (date: Date | null): string => {
  if (!date) return 'null';
  // Simple date format for story display
  try {
    return date.toLocaleDateString('en-US'); // Use locale string
  } catch (e) {
      return 'Invalid Date';
  }
};

const formatRange = (range: DateRange | undefined | null): string => {
  if (!range) return '{ startDate: null, endDate: null }';
  return `{ startDate: ${formatDate(range.startDate)}, endDate: ${formatDate(range.endDate)} }`;
};

// --- Storybook Configuration ---
const dateFnsAdapter = createDateFnsAdapter();

export default {
  title: 'Components/GlassDateRangePicker',
  component: GlassDateRangePicker,
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <GlassLocalizationProvider
          adapter={dateFnsAdapter}
          locale="en-US" // Example locale
          dateFormat="MM/dd/yyyy" // Example format
        >
            <DemoContainer>
                 <Story />
            </DemoContainer>
        </GlassLocalizationProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    value: { 
      control: { type: 'object' }, // Use object control instead of 'none'
      description: 'DateRange value (controlled internally)'
    },
    onChange: { action: 'onChange', control: { type: 'object' } },
    comparisonValue: { 
      control: { type: 'object' }, // Use object control instead of 'none'
      description: 'Comparison DateRange value (controlled internally)'
    },
    onComparisonChange: { action: 'onComparisonChange', control: { type: 'object' } },
    label: { control: 'text' },
    helperText: { control: 'text' },
    placeholder: { control: 'text' },
    comparisonMode: { control: 'boolean' },
    enableTimeSelection: { control: 'boolean' },
    animate: { control: 'boolean' },
    presets: { control: { type: 'select' }, options: ['Standard', 'All', 'None'] , mapping: { Standard: StandardDateRangePresets, All: AllDateRangePresets, None: undefined } },
    physics: { control: 'object' },
    glassVariant: { control: 'radio', options: ['default', 'tinted', 'clear'] },
    blurStrength: { control: 'radio', options: ['weak', 'medium', 'strong'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'] },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    errorMessage: { control: 'text', if: { arg: 'error' } },
    required: { control: 'boolean' },
  },
} as Meta<typeof GlassDateRangePicker>;

// --- Template ---
interface PickerArgs extends Partial<DateRangePickerProps> {
  comparisonMode?: boolean;
  onComparisonChange?: (range: DateRange) => void;
}

const Template: StoryFn<PickerArgs> = (args) => {
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [compareRange, setCompareRange] = useState<DateRange>({ startDate: null, endDate: null });

  // Reset state if comparisonMode arg changes
  useEffect(() => {
      setRange({ startDate: null, endDate: null });
      setCompareRange({ startDate: null, endDate: null });
  }, [args.comparisonMode]);

  return (
    <div>
      <GlassDateRangePicker
        {...args}
        value={range}
        onChange={(newRange) => {
            setRange(newRange);
            args.onChange?.(newRange); // Call action logger
        }}
        // Only pass comparison props if mode is enabled
        comparisonValue={args.comparisonMode ? compareRange : undefined}
        onComparisonChange={args.comparisonMode ? (newCompareRange) => {
            setCompareRange(newCompareRange);
            args.onComparisonChange?.(newCompareRange); // Call action logger
        } : undefined}
      />
      <ResultDisplay>
        Primary Range: {formatRange(range)}
        {args.comparisonMode && <><br />Comparison Range: {formatRange(compareRange)}</>}</ResultDisplay>
    </div>
  );
};

// --- Stories ---
export const Basic = Template.bind({});
Basic.args = {
  label: 'Select Date Range',
  helperText: 'Click to select start and end dates',
  presets: StandardDateRangePresets,
  animate: true,
  comparisonMode: false,
};

export const ComparisonMode = Template.bind({});
ComparisonMode.args = {
  label: 'Date Range with Comparison',
  helperText: 'Select primary and comparison date ranges',
  presets: AllDateRangePresets,
  comparisonMode: true,
};

export const TimeSelection = Template.bind({});
TimeSelection.args = {
  label: 'Select Date and Time Range',
  helperText: 'Includes time selection',
  enableTimeSelection: true,
  presets: StandardDateRangePresets,
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Basic.args,
    label: 'Disabled Picker',
    disabled: true,
};

export const Error = Template.bind({});
Error.args = {
    ...Basic.args,
    label: 'Error State Picker',
    error: true,
    errorMessage: 'Invalid date range selected.',
};

export const Required = Template.bind({});
Required.args = {
    ...Basic.args,
    label: 'Required Date Range',
    required: true,
};

export const PhysicsBouncy = Template.bind({});
PhysicsBouncy.args = {
    ...Basic.args,
    label: 'Bouncy Physics Preset',
    physics: { animationPreset: 'bouncy' },
};

export const StyleTinted = Template.bind({});
StyleTinted.args = {
    ...Basic.args,
    label: 'Tinted Style Variant',
    glassVariant: 'tinted',
    color: 'secondary',
};

export const StyleClear = Template.bind({});
StyleClear.args = {
    ...Basic.args,
    label: 'Clear Style Variant',
    glassVariant: 'clear',
    blurStrength: 'strong',
    color: 'info',
}; 