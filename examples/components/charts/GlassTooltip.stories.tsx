import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../../src/theme/ThemeProvider';
import {
  GlassTooltip,
  GlassTooltipContent,
} from '../../../src/components/Charts'; // Updated path
import { Typography } from '../../../src/components/Typography';

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 4rem; // More padding to see tooltip positioning
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center; // Center trigger element
  gap: 2rem;
`;

const TriggerArea = styled.div`
  position: relative; // Needed for tooltip positioning relative to this
  width: 200px;
  height: 100px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Charts/GlassTooltip',
  component: GlassTooltip,
  subcomponents: { GlassTooltipContent }, // Include content component
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <StoryContainer>
          <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    notes: 'Enhanced tooltip with glass styling, often used for chart data.',
  },
  argTypes: {
    // GlassTooltip Props
    x: { control: 'number' },
    y: { control: 'number' },
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    glow: { control: 'boolean' },
    accentColor: { control: 'select', options: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] },
    blurIntensity: { control: 'radio', options: ['light', 'medium', 'strong'] },
    // GlassTooltipContent Props (can be controlled via a single 'content' arg)
    content: { control: 'object', name: 'Tooltip Content (Props for GlassTooltipContent)' },
  },
} as Meta<typeof GlassTooltip>;

// --- Template ---
// Combine args for both Tooltip and Content
interface TooltipStoryArgs extends React.ComponentProps<typeof GlassTooltip> {
    content: React.ComponentProps<typeof GlassTooltipContent>;
}

const Template: StoryFn<TooltipStoryArgs> = ({ content, ...args }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          // Calculate position relative to the top-left of the trigger area
          setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Typography variant="body1">Hover over the area below:</Typography>
        <TriggerArea
            ref={triggerRef}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onMouseMove={handleMouseMove}
        >
            Hover Area
            {visible && (
                <GlassTooltip
                    {...args} // Pass tooltip args
                    x={position.x}
                    y={position.y}
                >
                    {/* Pass content args */} 
                    <GlassTooltipContent {...content} />
                </GlassTooltip>
            )}
        </TriggerArea>
        <Typography variant="caption">Tooltip position updates relative to hover area.</Typography>
    </div>

  );
};

// --- Stories ---
export const Default = Template.bind({});
Default.args = {
  position: 'top',
  glow: true,
  accentColor: 'primary',
  blurIntensity: 'medium',
  content: {
    title: 'Default Tooltip',
    items: [
      { label: 'Data Point', value: '123' },
      { label: 'Category', value: 'Alpha', color: '#4B66EA' },
    ],
  },
};

export const RightPositionNoGlow = Template.bind({});
RightPositionNoGlow.args = {
  ...Default.args,
  position: 'right',
  glow: false,
  accentColor: 'secondary',
  content: {
    title: 'Right Position',
    items: [
      { label: 'Metric', value: '45.6%' },
      { label: 'Status', value: 'Active', color: '#10B981' },
    ],
  },
};

export const BottomStrongBlur = Template.bind({});
BottomStrongBlur.args = {
  ...Default.args,
  position: 'bottom',
  glow: true,
  accentColor: 'info',
  blurIntensity: 'strong',
  content: {
    title: 'Bottom - Strong Blur',
    items: [
      { label: 'ID', value: 'XYZ-789' },
    ],
  },
};

export const LeftLightBlur = Template.bind({});
LeftLightBlur.args = {
  ...Default.args,
  position: 'left',
  glow: false,
  accentColor: 'warning',
  blurIntensity: 'light',
  content: {
    title: 'Left - Light Blur',
    items: [
        { label: 'User', value: 'Jane Doe' },
        { label: 'Action', value: 'Update', color: '#F59E0B' },
    ],
  },
}; 