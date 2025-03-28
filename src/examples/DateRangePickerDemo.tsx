/**
 * GlassDateRangePicker Demo Component
 *
 * Demonstrates the physics-based GlassDateRangePicker component with various configurations
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { 
  GlassDateRangePicker, 
  DateRange, 
  ComparisonDateRange,
  StandardDateRangePresets, 
  ComparisonDateRangePresets,
  AllDateRangePresets
} from '../components/DateRangePicker';
import { GlassLocalizationProvider, createDateFnsAdapter } from '../components/DatePicker';

// Demo container
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
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
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
`;

const DemoTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.8);
`;

const ResultDisplay = styled.div`
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 100%;
  overflow-x: auto;
  margin-top: 8px;
`;

// Format date for display
const formatDate = (date: Date | null): string => {
  if (!date) return 'null';
  return date.toISOString().split('T')[0];
};

// Format range for display
const formatRange = (range: DateRange): string => {
  return `{ startDate: ${formatDate(range.startDate)}, endDate: ${formatDate(range.endDate)} }`;
};

/**
 * GlassDateRangePicker Demo Component
 */
export const DateRangePickerDemo: React.FC = () => {
  // Standard date range picker state
  const [basicRange, setBasicRange] = useState<DateRange>({ startDate: null, endDate: null });
  
  // Comparison mode state
  const [comparisonRange, setComparisonRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [comparisonSecondRange, setComparisonSecondRange] = useState<DateRange>({ startDate: null, endDate: null });
  
  // Physics variations state
  const [bouncyRange, setBouncyRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [snappyRange, setSnappyRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [gentleRange, setGentleRange] = useState<DateRange>({ startDate: null, endDate: null });
  
  // Style variations state
  const [tintedRange, setTintedRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [clearRange, setClearRange] = useState<DateRange>({ startDate: null, endDate: null });
  
  return (
    <GlassLocalizationProvider
      adapter={createDateFnsAdapter()}
      locale="en-US"
      dateFormat="MM/dd/yyyy"
    >
      <DemoContainer>
        <SectionTitle>GlassDateRangePicker Component</SectionTitle>
        
        <DemoSection>
          <DemoTitle>Basic Date Range Picker</DemoTitle>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                value={basicRange}
                onChange={setBasicRange}
                label="Select Date Range"
                helperText="Click to select a start and end date"
                presets={StandardDateRangePresets}
                animate={true}
              />
              <ResultDisplay>
                Selected Range: {formatRange(basicRange)}
              </ResultDisplay>
            </div>
          </DemoRow>
        </DemoSection>
        
        <DemoSection>
          <DemoTitle>Comparison Mode</DemoTitle>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                value={comparisonRange}
                onChange={setComparisonRange}
                comparisonMode={true}
                comparisonValue={comparisonSecondRange}
                onComparisonChange={setComparisonSecondRange}
                label="Date Range with Comparison"
                helperText="Enable comparison to select two ranges"
                presets={AllDateRangePresets}
              />
              <ResultDisplay>
                Primary Range: {formatRange(comparisonRange)}<br />
                Comparison Range: {formatRange(comparisonSecondRange)}
              </ResultDisplay>
            </div>
          </DemoRow>
        </DemoSection>
        
        <DemoSection>
          <DemoTitle>Physics Animation Variants</DemoTitle>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                value={bouncyRange}
                onChange={setBouncyRange}
                label="Bouncy Physics"
                physics={{
                  animationPreset: 'bouncy'
                }}
                presets={StandardDateRangePresets.slice(0, 3)}
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                value={snappyRange}
                onChange={setSnappyRange}
                label="Snappy Physics"
                physics={{
                  animationPreset: 'snappy'
                }}
                presets={StandardDateRangePresets.slice(0, 3)}
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                value={gentleRange}
                onChange={setGentleRange}
                label="Gentle Physics"
                physics={{
                  animationPreset: 'gentle'
                }}
                presets={StandardDateRangePresets.slice(0, 3)}
              />
            </div>
          </DemoRow>
        </DemoSection>
        
        <DemoSection>
          <DemoTitle>Style Variants</DemoTitle>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                value={tintedRange}
                onChange={setTintedRange}
                label="Tinted Variant"
                glassVariant="tinted"
                color="secondary"
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                value={clearRange}
                onChange={setClearRange}
                label="Clear Variant"
                glassVariant="clear"
                blurStrength="strong"
                color="info"
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                label="Time Selection Enabled"
                enableTimeSelection={true}
                placeholder="Select dates with time"
              />
            </div>
          </DemoRow>
        </DemoSection>
        
        <DemoSection>
          <DemoTitle>Responsive Variations</DemoTitle>
          <DemoRow>
            <div style={{ width: '100%' }}>
              <GlassDateRangePicker
                label="Full Width"
                fullWidth={true}
                size="large"
              />
            </div>
          </DemoRow>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                label="Small Size"
                size="small"
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                label="Medium Size (Default)"
                size="medium"
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                label="Large Size"
                size="large"
              />
            </div>
          </DemoRow>
        </DemoSection>
        
        <DemoSection>
          <DemoTitle>State Variations</DemoTitle>
          <DemoRow>
            <div>
              <GlassDateRangePicker
                label="Disabled State"
                disabled={true}
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                label="Error State"
                error={true}
                errorMessage="Please select a valid date range"
              />
            </div>
            
            <div>
              <GlassDateRangePicker
                label="Required Field"
                required={true}
                helperText="This field is required"
              />
            </div>
          </DemoRow>
        </DemoSection>
      </DemoContainer>
    </GlassLocalizationProvider>
  );
};

export default DateRangePickerDemo;