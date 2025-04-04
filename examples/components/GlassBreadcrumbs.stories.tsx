import React, { useState } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

import { GlassBreadcrumbs, BreadcrumbsProps } from '../../src/components/Breadcrumbs'; // Updated type import
import { DimensionalGlass } from '../../src/components/surfaces';
import { Card } from '../../src/components/Card';
import { Typography } from '../../src/components/Typography';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

// --- Icons for Demo ---
const HomeIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3 9.5L12 2L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const CategoryIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M2 6H6V2H2V6ZM10 22H14V18H10V22ZM2 22H6V18H2V22ZM2 14H6V10H2V14ZM10 14H14V10H10V14ZM18 6H22V2H18V6ZM10 6H14V2H10V6ZM18 14H22V10H18V14ZM18 22H22V18H18V22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const FileIcon = () => ( <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );

// --- Styled Components for Demo Layout ---
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 1200px;
  margin: 20px auto;
  color: #e2e8f0; /* Light text */
  background: rgba(30, 41, 59, 0.7); /* Darker bg */
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px; /* Adjust width */
  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #cbd5e1;
  }
  select, input[type="checkbox"] {
     padding: 8px; 
     border-radius: 4px; 
     background: #374151; 
     color: white; 
     border: 1px solid #4b5563;
  }
  input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-top: 4px;
  }
`;

const BackgroundContainer = styled(DimensionalGlass)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: rgba(15, 23, 42, 0.7); /* Darker preview bg */
`;

// --- Storybook Setup ---

export default {
  title: 'Components/GlassBreadcrumbs',
  component: GlassBreadcrumbs,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: { // Define controls reflected in Storybook UI
    variant: { control: 'select', options: ['glass', 'dimensional', 'elevated', 'flat', 'standard'] },
    color: { control: 'select', options: ['primary', 'secondary', 'info', 'success', 'warning', 'error'] },
    physicsEnabled: { control: 'boolean' },
    zSpaceDepth: { control: 'boolean' },
    collapsible: { control: 'boolean' },
    showExpandIcon: { control: 'boolean' },
    animated: { control: 'boolean' },
    maxItems: { control: 'number' },
    itemsBeforeCollapse: { control: 'number' },
    itemsAfterCollapse: { control: 'number' },
  },
} as Meta<typeof GlassBreadcrumbs>;

// --- Template for Interactive Demo ---

const InteractiveTemplate: StoryFn<typeof GlassBreadcrumbs> = (args) => {
  // Use state within the template to manage controls not directly mapped by args
  const [showIcons, setShowIcons] = useState(true);

  // Prepare items array
  const items = [
    { href: '#home', children: 'Home', icon: showIcons ? <HomeIcon /> : undefined },
    { href: '#dashboard', children: 'Dashboard', icon: showIcons ? <CategoryIcon /> : undefined },
    { href: '#analytics', children: 'Analytics', icon: showIcons ? <CategoryIcon /> : undefined },
    { href: '#reports', children: 'Reports', icon: showIcons ? <CategoryIcon /> : undefined },
    { href: '#performance', children: 'Performance', icon: showIcons ? <FileIcon /> : undefined },
  ];

  return (
    <DemoContainer>
      <Section>
        <Typography variant="h2">GlassBreadcrumbs</Typography>
        <Typography variant="body1">
          Interactive demo. Use Storybook controls (Args table) to change props.
        </Typography>
        
        {/* Keep internal controls for things not easily mapped to args, like icon toggle */}
        <ControlsContainer>
          <ControlGroup>
            <label>Show Icons (Internal Control)</label>
            <input 
              type="checkbox" 
              checked={showIcons} 
              onChange={() => setShowIcons(!showIcons)} 
            />
          </ControlGroup>
           {/* Add more internal controls here if needed */}
        </ControlsContainer>

        <BackgroundContainer intensity={0.1} color={args.color || 'primary'}>
          <Typography variant="h5" style={{ color: 'white', marginBottom: '16px' }}>
            Interactive Preview
          </Typography>
          {/* Pass Storybook args and derived props */}
          <GlassBreadcrumbs 
            {...args} 
            // Override itemIcon based on internal state
            itemIcon={showIcons ? <CategoryIcon /> : undefined} 
          >
            {/* Render items from the array */}
            {items.map((item, index) => (
              <a key={index} href={item.href}>
                {item.icon}
                {item.children}
              </a>
            ))}
          </GlassBreadcrumbs>
        </BackgroundContainer>
      </Section>
      {/* Add sections for other static examples later if needed */}
    </DemoContainer>
  );
};

// --- Export Stories ---

export const Interactive = InteractiveTemplate.bind({});
Interactive.args = {
  // Default args for the interactive story
  variant: 'glass',
  color: 'primary',
  physicsEnabled: true,
  zSpaceDepth: true,
  collapsible: true,
  showExpandIcon: true,
  animated: true,
  maxItems: 5, 
  itemsBeforeCollapse: 1,
  itemsAfterCollapse: 1,
};

// --- Basic Example Story (Optional) ---
export const Basic: StoryFn<typeof GlassBreadcrumbs> = (args) => (
  <DemoContainer>
     <GlassBreadcrumbs {...args}>
        <a href="#home">Home</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#settings">Settings</a>
      </GlassBreadcrumbs>
  </DemoContainer>
);
Basic.args = { variant: 'standard' };

// --- With Icons Example Story (Optional) ---
export const WithIcons: StoryFn<typeof GlassBreadcrumbs> = (args) => (
  <DemoContainer>
    <GlassBreadcrumbs {...args}>
      <a href="#home"> <HomeIcon /> Home </a>
      <a href="#products"> <CategoryIcon /> Products </a>
      <a href="#document"> <FileIcon /> Document </a>
    </GlassBreadcrumbs>
  </DemoContainer>
);
WithIcons.args = { variant: 'glass', itemIcon: <CategoryIcon />, physicsEnabled: false }; // Default icon

// --- Collapsible Example Story (Optional) ---
export const Collapsible: StoryFn<typeof GlassBreadcrumbs> = (args) => (
   <DemoContainer>
      <GlassBreadcrumbs {...args}>
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#projects">Projects</a>
          <a href="#2023">2023</a>
          <a href="#q2">Q2</a>
          <a href="#client">Client</a>
          <a href="#project">Project Name</a>
      </GlassBreadcrumbs>
   </DemoContainer>
);
Collapsible.args = {
  variant: 'dimensional',
  maxItems: 4,
  itemsBeforeCollapse: 2,
  itemsAfterCollapse: 1,
  showExpandIcon: true,
  animated: true,
}; 