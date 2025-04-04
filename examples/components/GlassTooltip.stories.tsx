import React, { useState, ReactNode, RefAttributes } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
import type { Placement } from '@popperjs/core';

import { GlassTooltip, GlassTooltipContent, GlassTooltipProps } from '../../src/components/GlassTooltip';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Typography } from '../../src/components/Typography';
import { ThemeProvider as AppThemeProvider } from '../../src/theme';
import { Box } from '../../src/components/Box';

type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
type GlassStyle = 'clear' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
type BlurStrength = 'light' | 'standard' | 'strong';
type AnimationStyle = 'spring' | 'inertial' | 'magnetic' | 'fade' | 'scale' | 'none';

// --- Styled Components ---
const DemoContainer = styled.div` /* ... styles ... */ `;
const Title = styled(Typography)` /* ... styles ... */ `;
const Section = styled.div` /* ... styles ... */ `;
const SectionTitle = styled(Typography)` /* ... styles ... */ `;
const DemoGrid = styled.div` /* ... styles ... */ `;
const DemoCard = styled(Card)` /* ... styles ... */ `;
const ControlPanel = styled.div` /* ... styles ... */ `;
const ControlGroup = styled.div` /* ... styles ... */ `;
const ControlLabel = styled.label` /* ... styles ... */ `;
const Select = styled.select` /* ... styles ... */ `;
const Checkbox = styled.input` /* ... styles ... */ `;

// --- Storybook Setup ---

export default {
  title: 'Components/GlassTooltip',
  component: GlassTooltip,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AppThemeProvider forceColorMode="dark">
        <DemoContainer>
          <Story />
        </DemoContainer>
      </AppThemeProvider>
    ),
  ],
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'default'] },
    glassStyle: { control: 'select', options: ['clear', 'frosted', 'tinted', 'luminous', 'dynamic'] },
    blurStrength: { control: 'select', options: ['light', 'standard', 'strong'] },
    animationStyle: { control: 'select', options: ['spring', 'inertial', 'magnetic', 'fade', 'scale', 'none'] },
    arrow: { control: 'boolean' },
    interactive: { control: 'boolean' },
    followCursor: { control: 'boolean' },
    contextAware: { control: 'boolean' },
    richContent: { control: 'boolean' },
  },
} as Meta<typeof GlassTooltip>;

// --- Interactive Template ---

const InteractiveTemplate: StoryFn<typeof GlassTooltip> = (args) => {
  const { 
    placement, color, glassStyle, blurStrength, animationStyle, 
    arrow, interactive, followCursor, contextAware, richContent 
  } = args;

  const tooltipTitle = richContent ? (
      <GlassTooltipContent
        title="Custom Configuration"
        titleColor={`var(--color-${color})`}
        items={[
          { label: "Glass Style", value: args.glassStyle ?? 'frosted' },
          { label: "Animation", value: args.animationStyle ?? 'fade' },
          { label: "Blur", value: args.blurStrength ?? 'medium' }
        ]}
      />
    ) : "Customizable tooltip via Args";

  const items = [
    { label: 'Glass Style', value: args.glassStyle ?? 'frosted' },
    { label: 'Animation', value: args.animationStyle ?? 'fade' },
    { label: 'Blur', value: args.blurStrength ?? 'medium' }
  ];

  return (
    <Section>
      <SectionTitle variant={'h2'}>Interactive Demo</SectionTitle>
      <Typography variant={'body1'} style={{marginBottom: '1.5rem'}}>
          Use the Storybook Controls (Args table below) to customize the tooltip in real-time.
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <GlassTooltip 
          title={tooltipTitle}
          placement={placement}
          color={color}
          glassStyle={glassStyle}
          blurStrength={blurStrength}
          animationStyle={animationStyle}
          arrow={arrow}
          interactive={interactive}
          followCursor={followCursor}
          contextAware={contextAware}
          maxWidth={300}
        >
          <Button 
            variant="contained" 
            color={color as ColorVariant}
            size="large"
          >
            Hover Me (Customized)
          </Button>
        </GlassTooltip>
      </div>
    </Section>
  );
};

// --- Export Interactive Story ---

export const Interactive = InteractiveTemplate.bind({});
Interactive.args = {
  placement: 'top',
  color: 'primary',
  glassStyle: 'frosted',
  blurStrength: 'standard',
  animationStyle: 'spring',
  arrow: true,
  interactive: false,
  followCursor: false,
  contextAware: false,
  richContent: true,
};

// --- Template and Props for Static Examples ---

type ExampleProps = Partial<Omit<GlassTooltipProps, 'title'>> & Required<Pick<GlassTooltipProps, 'title'>>;

interface Example {
  props: ExampleProps;
  buttonLabel: string;
  description: string;
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  color?: ColorVariant;
}

interface ExamplesTemplateProps {
  title: string;
  examples: Example[];
}

const ExamplesTemplate: StoryFn<ExamplesTemplateProps> = ({ title, examples }) => (
  <Section>
    <SectionTitle variant="h2">{title}</SectionTitle>
    <DemoGrid>
      {examples.map((example, index) => (
        <DemoCard key={index}>
          <GlassTooltip {...(example.props as GlassTooltipProps)}>
            <Button 
              variant={example.buttonVariant || "contained"} 
              color={example.color || example.props.color || "primary"}
            >
              {example.buttonLabel}
            </Button>
          </GlassTooltip>
          <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
            {example.description}
          </Typography>
        </DemoCard>
      ))}
    </DemoGrid>
  </Section>
);

// --- Static Examples Data ---

const styleExamples: Example[] = [
  { props: { title: "Basic tooltip" }, buttonLabel: "Basic", description: "Default style" },
  { props: { title: "Clear glass", glassStyle: "clear", blurStrength: "strong" }, buttonLabel: "Clear", description: "Clear glass, strong blur", color: "secondary" },
  { props: { title: "Frosted glass", glassStyle: "frosted", blurStrength: "standard" }, buttonLabel: "Frosted", description: "Frosted glass, standard blur", color: "success" },
  { props: { title: "Tinted glass", glassStyle: "tinted", color: "error", blurStrength: "light" }, buttonLabel: "Tinted", description: "Tinted glass (error)", color: "error" },
  { props: { title: "Luminous glass", glassStyle: "luminous", color: "info" }, buttonLabel: "Luminous", description: "Luminous glass (info)", color: "info" },
  { props: { title: "Dynamic glass", glassStyle: "dynamic", contextAware: true }, buttonLabel: "Dynamic", description: "Dynamic context-aware", color: "warning" },
];

const animationExamples: Example[] = [
  { props: { title: "Spring physics", animationStyle: "spring", physics: { tension: 300, friction: 20, mass: 1 } }, buttonLabel: "Spring", description: "Spring physics animation", buttonVariant: "outlined" },
  { props: { title: "Inertial motion", animationStyle: "inertial", physics: { friction: 30, mass: 1.5 } }, buttonLabel: "Inertial", description: "Inertial movement", buttonVariant: "outlined", color: "secondary" },
  { props: { title: "Magnetic effect", animationStyle: "magnetic", physics: { tension: 400, friction: 40 } }, buttonLabel: "Magnetic", description: "Magnetic animation", buttonVariant: "outlined", color: "success" },
  { props: { title: "Follow cursor", followCursor: true, animationStyle: "inertial" }, buttonLabel: "Follow Cursor", description: "Cursor-following tooltip", buttonVariant: "outlined", color: "error" },
];

const richContentExamples: Example[] = [
  { 
    props: { 
      title: "Sales Performance", 
      richContent: { title: "Sales Performance", items: [{ label: "Revenue", value: "$12,345", color: "#10B981" }, { label: "Growth", value: "+15%", color: "#10B981" }, { label: "Customers", value: "1,234" }] }, 
      maxWidth: 220, interactive: true 
    }, 
    buttonLabel: "Rich Content", description: "Rich content with items"
  },
  { 
    props: { 
      title: ( <div> <Typography variant="h6">Interactive</Typography> <Typography variant="body2">Hover me.</Typography> <Button size="small" variant="outlined">Click</Button> </div> ), 
      interactive: true, maxWidth: 250 
    }, 
    buttonLabel: "Interactive", description: "Interactive with button", color: "secondary"
  },
  { 
    props: { 
      title: ( <GlassTooltipContent title="Server Status" titleColor="#6366F1" items={[{ label: "CPU", value: "32%", color: "#10B981" }, { label: "Memory", value: "2.4GB / 8GB", color: "#F59E0B" }, { label: "Uptime", value: "12d 5h" }]} /> ), 
      maxWidth: 250, interactive: true 
    }, 
    buttonLabel: "Custom Comp", description: "Using GlassTooltipContent", color: "info"
  },
];

// --- Export Static Example Stories ---

export const Styles = ExamplesTemplate.bind({});
Styles.args = { title: "Tooltip Styles", examples: styleExamples };

export const Animations = ExamplesTemplate.bind({});
Animations.args = { title: "Animation Types", examples: animationExamples };

export const RichContent = ExamplesTemplate.bind({});
RichContent.args = { title: "Rich Content Examples", examples: richContentExamples }; 