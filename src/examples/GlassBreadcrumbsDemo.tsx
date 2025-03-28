import React, { useState } from 'react';
import styled from 'styled-components';

import { GlassBreadcrumbs } from '../components/Breadcrumbs';
import { DimensionalGlass } from '../components/surfaces';
import { Card } from '../components/Card';
import { Typography } from '../components/Typography';

// Icons for demo
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 2L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CategoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6H6V2H2V6ZM10 22H14V18H10V22ZM2 22H6V18H2V22ZM2 14H6V10H2V14ZM10 14H14V10H10V14ZM18 6H22V2H18V6ZM10 6H14V2H10V6ZM18 14H22V10H18V14ZM18 22H22V18H18V22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Container for the demo
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExampleRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

const ExampleCard = styled(Card)`
  flex: 1;
  min-width: 300px;
  padding: 24px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const BackgroundContainer = styled(DimensionalGlass)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

/**
 * GlassBreadcrumbs Demo Component
 *
 * Demonstrates the GlassBreadcrumbs component with various configurations and options
 */
const GlassBreadcrumbsDemo: React.FC = () => {
  // State for controls
  const [variant, setVariant] = useState<'glass' | 'dimensional' | 'elevated' | 'flat' | 'standard'>('glass');
  const [color, setColor] = useState<'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'>('primary');
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [zSpaceDepth, setZSpaceDepth] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [collapsible, setCollapsible] = useState(true);
  const [showExpandIcon, setShowExpandIcon] = useState(true);
  const [animated, setAnimated] = useState(true);
  
  // Common props for controlled examples
  const controlledProps = {
    variant,
    color,
    physicsEnabled,
    zSpaceDepth,
    itemIcon: showIcons ? <CategoryIcon /> : undefined,
    collapsible,
    showExpandIcon,
    animated,
  };

  return (
    <DemoContainer>
      <Section>
        <Typography variant="h2">GlassBreadcrumbs Component</Typography>
        <Typography variant="body1">
          An enhanced breadcrumbs component with glass morphism styling, z-space depth, physics-based interactions,
          and customizable options.
        </Typography>
        
        <ControlsContainer>
          <ControlGroup>
            <label>Variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as any)}>
              <option value="glass">Glass</option>
              <option value="dimensional">Dimensional</option>
              <option value="elevated">Elevated</option>
              <option value="flat">Flat</option>
              <option value="standard">Standard</option>
            </select>
          </ControlGroup>
          
          <ControlGroup>
            <label>Color</label>
            <select value={color} onChange={(e) => setColor(e.target.value as any)}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </ControlGroup>
          
          <ControlGroup>
            <label>Physics Enabled</label>
            <input 
              type="checkbox" 
              checked={physicsEnabled} 
              onChange={() => setPhysicsEnabled(!physicsEnabled)} 
            />
          </ControlGroup>
          
          <ControlGroup>
            <label>Z-Space Depth</label>
            <input 
              type="checkbox" 
              checked={zSpaceDepth} 
              onChange={() => setZSpaceDepth(!zSpaceDepth)} 
            />
          </ControlGroup>
          
          <ControlGroup>
            <label>Show Icons</label>
            <input 
              type="checkbox" 
              checked={showIcons} 
              onChange={() => setShowIcons(!showIcons)} 
            />
          </ControlGroup>
          
          <ControlGroup>
            <label>Collapsible</label>
            <input 
              type="checkbox" 
              checked={collapsible} 
              onChange={() => setCollapsible(!collapsible)} 
            />
          </ControlGroup>
          
          <ControlGroup>
            <label>Show Expand Icon</label>
            <input 
              type="checkbox" 
              checked={showExpandIcon} 
              onChange={() => setShowExpandIcon(!showExpandIcon)} 
            />
          </ControlGroup>
          
          <ControlGroup>
            <label>Animated</label>
            <input 
              type="checkbox" 
              checked={animated} 
              onChange={() => setAnimated(!animated)} 
            />
          </ControlGroup>
        </ControlsContainer>
        
        <BackgroundContainer intensity={0.1} color={color}>
          <Typography variant="h5" style={{ color: 'white', marginBottom: '16px' }}>
            Interactive Preview
          </Typography>
          <GlassBreadcrumbs {...controlledProps}>
            <a href="#home">Home</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#analytics">Analytics</a>
            <a href="#reports">Reports</a>
            <a href="#performance">Performance</a>
          </GlassBreadcrumbs>
        </BackgroundContainer>
      </Section>
      
      <Section>
        <Typography variant="h3">Examples</Typography>
        
        <ExampleRow>
          <ExampleCard>
            <h3>Basic Usage</h3>
            <GlassBreadcrumbs>
              <a href="#home">Home</a>
              <a href="#dashboard">Dashboard</a>
              <a href="#settings">Settings</a>
            </GlassBreadcrumbs>
          </ExampleCard>
          
          <ExampleCard>
            <h3>With Custom Separator</h3>
            <GlassBreadcrumbs 
              separator={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            >
              <a href="#home">Home</a>
              <a href="#products">Products</a>
              <a href="#category">Category</a>
              <a href="#item">Item</a>
            </GlassBreadcrumbs>
          </ExampleCard>
          
          <ExampleCard>
            <h3>With Icons</h3>
            <GlassBreadcrumbs>
              <a href="#home">
                <HomeIcon /> Home
              </a>
              <a href="#products">
                <CategoryIcon /> Products
              </a>
              <a href="#document">
                <FileIcon /> Document
              </a>
            </GlassBreadcrumbs>
          </ExampleCard>
        </ExampleRow>
        
        <ExampleRow>
          <ExampleCard>
            <h3>Dimensional Variant</h3>
            <BackgroundContainer intensity={0.05}>
              <GlassBreadcrumbs 
                variant="dimensional"
                zSpaceDepth={true}
              >
                <a href="#home">Home</a>
                <a href="#products">Products</a>
                <a href="#category">Electronics</a>
                <a href="#subcategory">Computers</a>
                <a href="#item">Laptops</a>
              </GlassBreadcrumbs>
            </BackgroundContainer>
          </ExampleCard>
          
          <ExampleCard>
            <h3>Elevated Variant</h3>
            <BackgroundContainer intensity={0.05}>
              <GlassBreadcrumbs 
                variant="elevated"
                color="secondary"
              >
                <a href="#home">Home</a>
                <a href="#blog">Blog</a>
                <a href="#category">Technology</a>
                <a href="#article">Latest Article</a>
              </GlassBreadcrumbs>
            </BackgroundContainer>
          </ExampleCard>
        </ExampleRow>
        
        <ExampleRow>
          <ExampleCard>
            <h3>Long Path with Collapse</h3>
            <GlassBreadcrumbs 
              maxItems={4}
              itemsBeforeCollapse={2}
              itemsAfterCollapse={1}
              showExpandIcon={true}
            >
              <a href="#home">Home</a>
              <a href="#dashboard">Dashboard</a>
              <a href="#projects">Projects</a>
              <a href="#2023">2023</a>
              <a href="#q2">Q2</a>
              <a href="#client">Client</a>
              <a href="#project">Project Name</a>
            </GlassBreadcrumbs>
          </ExampleCard>
          
          <ExampleCard>
            <h3>Flat Variant</h3>
            <GlassBreadcrumbs 
              variant="flat"
              color="info"
              withBackground={true}
              physicsEnabled={true}
            >
              <a href="#home">Home</a>
              <a href="#user">User</a>
              <a href="#profile">Profile</a>
              <a href="#settings">Settings</a>
            </GlassBreadcrumbs>
          </ExampleCard>
        </ExampleRow>
      </Section>
    </DemoContainer>
  );
};

export default GlassBreadcrumbsDemo;