/**
 * GlassTabBarDemo Component
 * 
 * Demonstrates the GlassTabBar component with various styles and configurations.
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { GlassTabBar, TabItem } from '../components/GlassTabBar';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';

// Define local types for props based on GlassTabBarProps definition
type GlassTabBarVariant = 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
type GlassTabOrientation = 'horizontal' | 'vertical';
type GlassVariant = 'clear' | 'frosted' | 'tinted';
type AnimationStyle = 'spring' | 'magnetic' | 'inertial' | 'none';
type TabBarColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

// Demo container
const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled(Typography)`
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ExampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  margin-right: 0.5rem;
`;

const ExampleCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

// Styled cards with specific layouts
const VerticalExampleCard = styled(ExampleCard)`
  display: flex;
  height: 300px;
`;

// Define a type for our flexible card props
interface FlexibleCardProps {
  $flexDirection?: 'row' | 'column';
}

// Update the FlexibleExampleCard component to use the $ prefix for transient props
const FlexibleExampleCard = styled(ExampleCard)<FlexibleCardProps>`
  display: flex;
  flex-direction: ${props => props.$flexDirection || 'column'};
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

// Make the tab content fill the remaining space in vertical layout
const FlexTabContent = styled(TabContent)`
  flex: 1;
`;

const ControlsCard = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ControlItem = styled.div`
  margin-bottom: 1rem;
`;

const ControlLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: inherit;
  
  &:focus {
    outline: none;
    border-color: #6366F1;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

// Create sample tabs
const simpleTabs: TabItem[] = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Help', value: 'help' },
];

const tabsWithIcons: TabItem[] = [
  { 
    label: 'Dashboard', 
    value: 'dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  { 
    label: 'Profile', 
    value: 'profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  },
  { 
    label: 'Analytics', 
    value: 'analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  },
  { 
    label: 'Settings', 
    value: 'settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  },
];

const tabsWithBadges: TabItem[] = [
  { label: 'Inbox', value: 'inbox', badge: 5 },
  { label: 'Sent', value: 'sent' },
  { label: 'Drafts', value: 'drafts', badge: 2 },
  { label: 'Trash', value: 'trash' },
];

const longTabs: TabItem[] = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Analytics', value: 'analytics' },
  { label: 'Reports', value: 'reports' },
  { label: 'Customers', value: 'customers' },
  { label: 'Products', value: 'products' },
  { label: 'Orders', value: 'orders' },
  { label: 'Payments', value: 'payments' },
  { label: 'Help', value: 'help' },
];

/**
 * GlassTabBarDemo Component
 */
export const GlassTabBarDemo: React.FC = () => {
  // State for basic examples
  const [activeTab1, setActiveTab1] = useState(0);
  const [activeTab2, setActiveTab2] = useState(0);
  const [activeTab3, setActiveTab3] = useState(0);
  const [_activeTab4, setActiveTab4] = useState(0);
  const [_activeTab5, setActiveTab5] = useState(0);
  
  // State for customizable example
  const [customActiveTab, setCustomActiveTab] = useState(0);
  const [variant, setVariant] = useState<GlassTabBarVariant>('pills');
  const [orientation, setOrientation] = useState<GlassTabOrientation>('horizontal');
  const [glassVariant, setGlassVariant] = useState<GlassVariant>('frosted');
  const [color, setColor] = useState<TabBarColor>('primary');
  const [animation, setAnimation] = useState<AnimationStyle>('spring');
  const [fullWidth, setFullWidth] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const [elevated, setElevated] = useState(true);
  const [_physicsSettings, setPhysicsSettings] = useState({
    tension: 280,
    friction: 26,
    mass: 1.0
  });
  
  // Helper function to get tab content
  const getTabContent = (tab: TabItem) => {
    switch (tab.value) {
      case 'dashboard':
        return (
          <div>
            <Typography variant="h4">Dashboard</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              Welcome to your dashboard. Here you can see an overview of your account.
            </Typography>
          </div>
        );
      case 'profile':
        return (
          <div>
            <Typography variant="h4">Profile</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              Edit your profile information and privacy settings.
            </Typography>
          </div>
        );
      case 'settings':
        return (
          <div>
            <Typography variant="h4">Settings</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              Manage your account settings and preferences.
            </Typography>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <Typography variant="h4">Analytics</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              View your performance metrics and analytics data.
            </Typography>
          </div>
        );
      case 'help':
        return (
          <div>
            <Typography variant="h4">Help & Support</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              Find answers to common questions and contact support.
            </Typography>
          </div>
        );
      case 'inbox':
        return (
          <div>
            <Typography variant="h4">Inbox (5)</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              You have 5 unread messages in your inbox.
            </Typography>
          </div>
        );
      default:
        return (
          <div>
            <Typography variant="h4">{tab.label}</Typography>
            <Typography variant="body1" style={{ marginTop: '1rem' }}>
              Content for {tab.label} tab.
            </Typography>
          </div>
        );
    }
  };
  
  return (
    <DemoContainer>
      <Title variant="h1">Glass Tab Bar Component</Title>
      
      <Section>
        <SectionTitle variant="h2">Tab Bar Variants</SectionTitle>
        <ExampleGrid>
          {/* Default Variant */}
          <ExampleCard>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={activeTab1}
              onChange={(_e, _index) => setActiveTab1(_index)}
              variant="default"
            />
            <TabContent>
              {getTabContent(simpleTabs[activeTab1])}
            </TabContent>
          </ExampleCard>
          
          {/* Pills Variant */}
          <ExampleCard>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={activeTab2}
              onChange={(_e, _index) => setActiveTab2(_index)}
              variant="pills"
              color="secondary"
            />
            <TabContent>
              {getTabContent(simpleTabs[activeTab2])}
            </TabContent>
          </ExampleCard>
          
          {/* Buttons Variant */}
          <ExampleCard>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={activeTab3}
              onChange={(_e, _index) => setActiveTab3(_index)}
              variant="buttons"
              color="success"
            />
            <TabContent>
              {getTabContent(simpleTabs[activeTab3])}
            </TabContent>
          </ExampleCard>
          
          {/* Underlined Variant */}
          <ExampleCard>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={_activeTab4}
              onChange={(_e, _index) => setActiveTab4(_index)}
              variant="underlined"
              color="info"
            />
            <TabContent>
              {getTabContent(simpleTabs[_activeTab4])}
            </TabContent>
          </ExampleCard>
          
          {/* Enclosed Variant */}
          <ExampleCard>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={_activeTab5}
              onChange={(_e, _index) => setActiveTab5(_index)}
              variant="enclosed"
              color="warning"
            />
            <TabContent>
              {getTabContent(simpleTabs[_activeTab5])}
            </TabContent>
          </ExampleCard>
        </ExampleGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Physics-Based Scrolling</SectionTitle>
        <Typography variant="body1" style={{ marginBottom: '2rem' }}>
          The GlassTabBar component now features physics-based momentum scrolling for overflow tabs.
          Try these examples by scrolling horizontally with your mouse or touch, then releasing to see
          the momentum effects.
        </Typography>
        
        <ExampleGrid>
          {/* Inertial Scrolling */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Inertial Scrolling</Typography>
            <GlassTabBar
              tabs={longTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="primary"
              scrollable={true}
              animationStyle="inertial"
              physics={{
                tension: 120,  // Low tension
                friction: 14,  // Low friction
                mass: 1.5      // Higher mass for more momentum
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Low friction, high mass configuration creates longer scrolling with more inertia.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Magnetic Tab Selection */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Magnetic Tab Selection</Typography>
            <GlassTabBar
              tabs={longTabs.slice(0, 5)}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="secondary"
              scrollable={true}
              animationStyle="magnetic"
              physics={{
                tension: 280,   // Medium tension
                friction: 22,   // Medium friction
                mass: 1.2       // Slightly higher mass
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                <strong>Try this:</strong> Hover between tabs and watch how they attract your cursor. 
                Pause on a non-active tab to see the magnetic selection build up - the tab will 
                automatically activate when the magnetic attraction reaches a threshold.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Bouncy Scrolling */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Bouncy Scrolling</Typography>
            <GlassTabBar
              tabs={longTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="buttons"
              color="success"
              scrollable={true}
              animationStyle="spring"
              physics={{
                tension: 200,   // Medium tension
                friction: 10,   // Very low friction
                mass: 0.8       // Low mass
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Low friction and low mass creates bouncy, playful scrolling.
              </Typography>
            </TabContent>
          </ExampleCard>
        </ExampleGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Magnetic Tab Selection</SectionTitle>
        <Typography variant="body1" style={{ marginBottom: '2rem' }}>
          The GlassTabBar component now features a magnetic tab selection system. Tabs attract your cursor and 
          provide visual feedback as you navigate, creating a natural, intuitive tab selection experience.
        </Typography>
        
        <ExampleGrid>
          {/* Pills Variant */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Pills Variant</Typography>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="primary"
              scrollable={false}
              animationStyle="magnetic"
              physics={{
                tension: 260,
                friction: 22,
                mass: 1.2
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Pill tabs create a strong magnetic attraction with visual feedback as you hover.
                Hover near tabs to feel the magnetic pull, and linger on a tab to activate it.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Underlined Variant */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Underlined Variant</Typography>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="underlined"
              color="info"
              scrollable={false}
              animationStyle="magnetic"
              physics={{
                tension: 300,
                friction: 24,
                mass: 1
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                The underlined variant shows a more subtle magnetic effect with the indicator
                line, creating a refined interaction experience.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Button Variant */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Button Variant</Typography>
            <GlassTabBar
              tabs={simpleTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="buttons"
              color="success"
              scrollable={false}
              animationStyle="magnetic"
              physics={{
                tension: 280,
                friction: 20,
                mass: 1.1
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Button tabs provide strong visual feedback with magnetic attraction, creating
                an engaging and intuitive selection experience.
              </Typography>
            </TabContent>
          </ExampleCard>
        </ExampleGrid>
      </Section>
    
      <Section>
        <SectionTitle variant="h2">Vertical & Horizontal Orientation</SectionTitle>
        <Typography variant="body1" style={{ marginBottom: '2rem' }}>
          The GlassTabBar component now supports both vertical and horizontal orientations with 
          advanced layout options and responsive behavior.
        </Typography>
        
        <ExampleGrid>
          {/* Vertical Orientation - Left Icon */}
          <VerticalExampleCard>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="primary"
              orientation="vertical"
              iconPosition="left"
              verticalDisplayMode="expanded"
              width={180}
            />
            <FlexTabContent>
              <Typography variant="h6">Vertical Orientation - Left Icons</Typography>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Vertical tabs with icons positioned to the left of labels. This layout is ideal for 
                sidebar navigation with descriptive labels.
              </Typography>
            </FlexTabContent>
          </VerticalExampleCard>
          
          {/* Vertical Orientation - Top Icon */}
          <VerticalExampleCard>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="secondary"
              orientation="vertical"
              iconPosition="top"
              verticalDisplayMode="expanded"
              width={120}
            />
            <FlexTabContent>
              <Typography variant="h6">Vertical Orientation - Top Icons</Typography>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Vertical tabs with icons positioned above labels. This creates a tile-like appearance 
                that works well for dashboard navigation.
              </Typography>
            </FlexTabContent>
          </VerticalExampleCard>
          
          {/* Vertical Orientation - Compact */}
          <VerticalExampleCard>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="buttons"
              color="success"
              orientation="vertical"
              iconPosition="left"
              verticalDisplayMode="compact"
            />
            <FlexTabContent>
              <Typography variant="h6">Compact Vertical Tabs</Typography>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                Compact vertical tabs take up minimal space while still showing both icons and labels.
                Perfect for space-constrained layouts.
              </Typography>
            </FlexTabContent>
          </VerticalExampleCard>
          
          {/* Responsive Tabs */}
          <ExampleCard>
            <Typography variant="h6" style={{ padding: '1rem', opacity: 0.7 }}>Responsive Orientation</Typography>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="info"
              responsiveOrientation={{
                base: 'horizontal',
                breakpoint: 'md',
                belowBreakpoint: 'vertical'
              }}
            />
            <TabContent>
              <Typography variant="body2" style={{ marginTop: '1rem', opacity: 0.8 }}>
                <strong>Try this:</strong> Resize your browser window to see how the tab bar automatically
                switches between horizontal and vertical orientation based on screen size.
              </Typography>
            </TabContent>
          </ExampleCard>
        </ExampleGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Special Features</SectionTitle>
        <ExampleGrid>
          {/* Tabs with Icons */}
          <ExampleCard>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="primary"
            />
            <TabContent>
              <Typography variant="h4">Tabs with Icons</Typography>
              <Typography variant="body1" style={{ marginTop: '1rem' }}>
                Tabs can include both icons and text labels.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Tabs with Badges */}
          <ExampleCard>
            <GlassTabBar
              tabs={tabsWithBadges}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="buttons"
              color="error"
            />
            <TabContent>
              <Typography variant="h4">Tabs with Badges</Typography>
              <Typography variant="body1" style={{ marginTop: '1rem' }}>
                Tabs can display badges for notifications or counts.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Scrollable Tabs with Momentum */}
          <ExampleCard>
            <GlassTabBar
              tabs={longTabs}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="secondary"
              scrollable={true}
              animationStyle="inertial"
              physics={{
                tension: 150,
                friction: 15,
                mass: 1.2
              }}
            />
            <TabContent>
              <Typography variant="h4">Physics-Based Scrolling</Typography>
              <Typography variant="body1" style={{ marginTop: '1rem' }}>
                Try dragging the tab bar and releasing with momentum - the tabs will scroll with
                realistic inertia and snap to positions. The physics simulation gives a natural feel.
              </Typography>
            </TabContent>
          </ExampleCard>
          
          {/* Vertical Tabs */}
          <VerticalExampleCard>
            <GlassTabBar
              tabs={tabsWithIcons}
              activeTab={0}
              onChange={(_e, _index) => { /* Placeholder for demo */ }}
              variant="pills"
              color="info"
              orientation="vertical"
              height={240}
            />
            <FlexTabContent>
              <Typography variant="h4">Vertical Tabs</Typography>
              <Typography variant="body1" style={{ marginTop: '1rem' }}>
                Tabs can be arranged vertically for different layouts.
              </Typography>
            </FlexTabContent>
          </VerticalExampleCard>
        </ExampleGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Customizable Tab Bar</SectionTitle>
        
        <ControlsCard>
          <Typography variant="h4" style={{ marginBottom: '1rem' }}>Tab Bar Configuration</Typography>
          
          <ControlGrid>
            <ControlItem>
              <ControlLabel>Variant</ControlLabel>
              <Select
                value={variant}
                onChange={e => setVariant(e.target.value as GlassTabBarVariant)}
              >
                <option value="default">Default</option>
                <option value="pills">Pills</option>
                <option value="buttons">Buttons</option>
                <option value="underlined">Underlined</option>
                <option value="enclosed">Enclosed</option>
              </Select>
            </ControlItem>
            
            <ControlItem>
              <ControlLabel>Orientation</ControlLabel>
              <Select
                value={orientation}
                onChange={e => setOrientation(e.target.value as GlassTabOrientation)}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </Select>
            </ControlItem>
            
            <ControlItem>
              <ControlLabel>Glass Style</ControlLabel>
              <Select
                value={glassVariant}
                onChange={e => setGlassVariant(e.target.value as GlassVariant)}
              >
                <option value="clear">Clear</option>
                <option value="frosted">Frosted</option>
                <option value="tinted">Tinted</option>
              </Select>
            </ControlItem>
            
            <ControlItem>
              <ControlLabel>Color</ControlLabel>
              <Select
                value={color}
                onChange={e => setColor(e.target.value as TabBarColor)}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="default">Default</option>
              </Select>
            </ControlItem>
            
            <ControlItem>
              <ControlLabel>Animation</ControlLabel>
              <Select
                value={animation}
                onChange={e => setAnimation(e.target.value as AnimationStyle)}
              >
                <option value="spring">Spring</option>
                <option value="magnetic">Magnetic</option>
                <option value="inertial">Inertial</option>
                <option value="none">None</option>
              </Select>
              {animation === 'magnetic' && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                  Hover around the active tab to see the magnetic effect
                </div>
              )}
            </ControlItem>
          </ControlGrid>
          
          {/* Physics Parameters */}
          {animation !== 'none' && (
            <div style={{ marginTop: '1rem' }}>
              <ControlLabel style={{ display: 'block', marginBottom: '0.75rem' }}>
                Physics Settings
              </ControlLabel>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '0.25rem' }}>Tension: {_physicsSettings.tension}</small>
                  <input 
                    type="range" 
                    min="50" 
                    max="500" 
                    value={_physicsSettings.tension} 
                    onChange={e => setPhysicsSettings({
                      ..._physicsSettings,
                      tension: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '0.25rem' }}>Friction: {_physicsSettings.friction}</small>
                  <input 
                    type="range" 
                    min="5" 
                    max="40" 
                    value={_physicsSettings.friction} 
                    onChange={e => setPhysicsSettings({
                      ..._physicsSettings,
                      friction: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '0.25rem' }}>Mass: {_physicsSettings.mass.toFixed(1)}</small>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1"
                    value={_physicsSettings.mass} 
                    onChange={e => setPhysicsSettings({
                      ..._physicsSettings,
                      mass: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <ControlLabel>
              <Checkbox
                type="checkbox"
                checked={fullWidth}
                onChange={e => setFullWidth(e.target.checked)}
              />
              Full Width
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox
                type="checkbox"
                checked={scrollable}
                onChange={e => setScrollable(e.target.checked)}
              />
              Scrollable
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox
                type="checkbox"
                checked={elevated}
                onChange={e => setElevated(e.target.checked)}
              />
              Elevated
            </ControlLabel>
          </div>
        </ControlsCard>
        
        <FlexibleExampleCard $flexDirection={orientation === 'horizontal' ? 'column' : 'row'}>
          <GlassTabBar
            tabs={scrollable ? longTabs : simpleTabs}
            activeTab={customActiveTab}
            onChange={(_e, _index) => setCustomActiveTab(_index)}
            variant={variant}
            orientation={orientation}
            glassVariant={glassVariant}
            color={color}
            animationStyle={animation}
            physics={{
              tension: _physicsSettings.tension,
              friction: _physicsSettings.friction,
              mass: _physicsSettings.mass
            }}
            fullWidth={fullWidth}
            scrollable={scrollable}
            elevated={elevated}
            background={true}
            height={orientation === 'vertical' ? 300 : undefined}
          />
          <FlexTabContent>
            {getTabContent(scrollable ? longTabs[_activeTab4] : simpleTabs[customActiveTab])}
          </FlexTabContent>
        </FlexibleExampleCard>
      </Section>
    </DemoContainer>
  );
};

export default GlassTabBarDemo;