import React, { useState, useEffect } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { TabBar as GlassTabBar } from '../../src/components';
import { Typography } from '../../src/components/Typography';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Define TabItem interface locally
interface TabItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
  badgeAnimation?: any;
  badgeHidden?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Local type aliases
type GlassTabBarProps = {
  tabs: TabItem[];
  activeTab?: number;
  onChange?: (event: any, index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  animationStyle?: 'spring' | 'magnetic' | 'inertial' | 'none';
  fullWidth?: boolean;
  scrollable?: boolean;
  elevated?: boolean;
  physics?: Record<string, any>;
  height?: string | number;
  width?: string | number;
  iconPosition?: 'left' | 'top' | 'right';
  verticalDisplayMode?: 'expanded' | 'compact' | 'icon-only';
};

// Define the type aliases needed for the customizable component
type GlassTabBarVariant = GlassTabBarProps['variant'];
type GlassTabOrientation = GlassTabBarProps['orientation'];
type GlassVariant = GlassTabBarProps['glassVariant'];
type AnimationStyle = GlassTabBarProps['animationStyle'];
type TabBarColor = GlassTabBarProps['color'];

// ButtonGroup styled component
const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

// Sample tabs data
const sampleTabs: TabItem[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
  { label: 'Analytics', value: 'analytics', disabled: true },
  { label: 'Settings', value: 'settings' },
  { label: 'More Options', value: 'more' },
];

const tabsWithIcons: TabItem[] = [
  { label: 'Dashboard', value: 'dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
  { label: 'Profile', value: 'profile', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
  { label: 'Analytics', value: 'analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> },
  { label: 'Settings', value: 'settings', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
];

const tabsWithBadges: TabItem[] = [
  { label: 'Inbox', value: 'inbox', badge: 5 },
  { label: 'Sent', value: 'sent' },
  { label: 'Drafts', value: 'drafts', badge: 2 },
  { label: 'Trash', value: 'trash' },
];

const longTabs: TabItem[] = [
  { label: 'Dashboard', value: 'dashboard' }, { label: 'Profile', value: 'profile' }, { label: 'Settings', value: 'settings' },
  { label: 'Analytics', value: 'analytics' }, { label: 'Reports', value: 'reports' }, { label: 'Customers', value: 'customers' },
  { label: 'Products', value: 'products' }, { label: 'Orders', value: 'orders' }, { label: 'Payments', value: 'payments' }, { label: 'Help', value: 'help' },
];

// --- Helper Components (from original demo) ---
const TabContent = styled.div`
  padding: 1.5rem;
  min-height: 100px; /* Ensure content area has some height */
`;

const VerticalExampleCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  display: flex;
  min-height: 300px; /* Ensure card has height */
`;

const FlexTabContent = styled(TabContent)`
  flex: 1;
`;

const StoryContainer = styled.div`
  max-width: 600px;
  margin: 1rem auto;
`;

const ControlsCard = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 800px;
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
  &:focus { outline: none; border-color: #6366F1; }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

// Mock Theme (similar to previous stories)
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// Helper function to get tab content
const getTabContent = (tab: TabItem) => {
    return (
        <div>
        <Typography variant="h4">{tab.label}{tab.badge ? ` (${tab.badge})` : ''}</Typography>
        <Typography variant="body1" style={{ marginTop: '1rem' }}>
            Content for {tab.label} tab.
        </Typography>
        </div>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof GlassTabBar> = {
  title: 'Components/GlassTabBar',
  component: GlassTabBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A versatile tab bar component with glass styling, physics animations, and multiple variants.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={mockTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    tabs: { control: 'object', description: 'Array of TabItem objects' },
    activeTab: { control: 'number', description: 'Index of the active tab' },
    onChange: { action: 'changed', description: 'Callback when tab changes' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['default', 'underlined', 'pills'] },
    color: { control: 'select', options: ['primary', 'secondary', 'accent', 'neutral', 'default'] },
    // ... other relevant argTypes
  },
};

export default meta;
type Story = StoryObj<typeof GlassTabBar>;

// --- Base Story Template with State ---
const BaseStory: React.FC<GlassTabBarProps> = (args) => {
  const [activeTab, setActiveTab] = useState(0);
  const CurrentTabContent = () => <TabContent>{getTabContent((args.tabs as TabItem[])[activeTab])}</TabContent>;

  return (
    <Card>
      <GlassTabBar 
        {...args} 
        activeTab={activeTab} 
        onChange={(_e, index) => setActiveTab(index)} 
      />
      <CurrentTabContent />
    </Card>
  );
};

const VerticalStory: React.FC<GlassTabBarProps> = (args) => {
  const [activeTab, setActiveTab] = useState(0);
  const CurrentTabContent = () => <FlexTabContent>{getTabContent((args.tabs as TabItem[])[activeTab])}</FlexTabContent>;

  return (
    <VerticalExampleCard>
      <GlassTabBar 
        {...args} 
        activeTab={activeTab} 
        onChange={(_e, index) => setActiveTab(index)} 
      />
      <CurrentTabContent />
    </VerticalExampleCard>
  );
};

// --- Individual Stories ---

// Variants
export const DefaultVariant: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs,
    variant: 'default',
  },
};

export const PillsVariant: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs,
    variant: 'pills',
    color: 'secondary',
  },
};

export const ButtonsVariant: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs,
    variant: 'buttons',
    color: 'success',
  },
};

export const UnderlinedVariant: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs,
    variant: 'underlined',
    color: 'info',
  },
};

export const EnclosedVariant: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs,
    variant: 'enclosed',
    color: 'warning',
  },
};

// Orientation
export const VerticalLeftIcon: Story = {
  render: (args) => <VerticalStory {...args} />,
  args: {
    tabs: tabsWithIcons,
    variant: 'pills',
    color: 'primary',
    orientation: 'vertical',
    iconPosition: 'left',
    verticalDisplayMode: 'expanded',
    width: 180,
  },
};

export const VerticalTopIcon: Story = {
  render: (args) => <VerticalStory {...args} />,
  args: {
    tabs: tabsWithIcons,
    variant: 'pills',
    color: 'secondary',
    orientation: 'vertical',
    iconPosition: 'top',
    verticalDisplayMode: 'expanded',
    width: 120,
  },
};

export const VerticalCompact: Story = {
  render: (args) => <VerticalStory {...args} />,
  args: {
    tabs: tabsWithIcons,
    variant: 'buttons',
    color: 'success',
    orientation: 'vertical',
    iconPosition: 'left',
    verticalDisplayMode: 'compact',
  },
};

// Features
export const WithIcons: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: tabsWithIcons,
    variant: 'pills',
    color: 'primary',
  },
};

export const WithBadges: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: tabsWithBadges,
    variant: 'buttons',
    color: 'error',
  },
};

export const InertialScrolling: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: longTabs,
    variant: 'pills',
    color: 'primary',
    scrollable: true,
    animationStyle: 'inertial',
    physics: { tension: 120, friction: 14, mass: 1.5 },
  },
};

export const MagneticSelection: Story = {
  render: (args) => <BaseStory {...args} />,
  args: {
    tabs: sampleTabs, // Use fewer tabs for better demo
    variant: 'pills',
    color: 'secondary',
    scrollable: false,
    animationStyle: 'magnetic',
    physics: { tension: 260, friction: 22, mass: 1.2 },
  },
};

// Customizable Story
const CustomizableTabBarStory: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [variant, setVariant] = useState<GlassTabBarVariant>('pills');
  const [orientation, setOrientation] = useState<GlassTabOrientation>('horizontal');
  const [glassVariant, setGlassVariant] = useState<GlassVariant>('frosted');
  const [color, setColor] = useState<TabBarColor>('primary');
  const [animation, setAnimation] = useState<AnimationStyle>('spring');
  const [fullWidth, setFullWidth] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const [elevated, setElevated] = useState(true);
  const [physicsSettings, setPhysicsSettings] = useState({ tension: 280, friction: 26, mass: 1.0 });

  const currentTabs = scrollable ? longTabs : sampleTabs; // Use appropriate tabs based on scrollable state

  return (
    <StoryContainer>
      <Typography variant="h2" style={{ marginBottom: '2rem' }}>Customizable Tab Bar</Typography>
      <ControlsCard>
        <Typography variant="h4" style={{ marginBottom: '1rem' }}>Configuration</Typography>
        <ControlGrid>
          <ControlItem>
            <ControlLabel htmlFor="variant-select">Variant</ControlLabel>
            <Select id="variant-select" value={variant} onChange={e => setVariant(e.target.value as GlassTabBarVariant)}>
              <option value="default">Default</option>
              <option value="pills">Pills</option>
              <option value="buttons">Buttons</option>
              <option value="underlined">Underlined</option>
              <option value="enclosed">Enclosed</option>
            </Select>
          </ControlItem>
          <ControlItem>
            <ControlLabel htmlFor="orientation-select">Orientation</ControlLabel>
            <Select id="orientation-select" value={orientation} onChange={e => setOrientation(e.target.value as GlassTabOrientation)}>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </Select>
          </ControlItem>
          <ControlItem>
            <ControlLabel htmlFor="glass-variant-select">Glass Variant</ControlLabel>
            <Select id="glass-variant-select" value={glassVariant} onChange={e => setGlassVariant(e.target.value as GlassVariant)}>
              <option value="clear">Clear</option>
              <option value="frosted">Frosted</option>
              <option value="tinted">Tinted</option>
            </Select>
          </ControlItem>
          <ControlItem>
            <ControlLabel htmlFor="color-select">Color</ControlLabel>
            <Select id="color-select" value={color} onChange={e => setColor(e.target.value as TabBarColor)}>
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
            <ControlLabel htmlFor="animation-select">Animation Style</ControlLabel>
            <Select id="animation-select" value={animation} onChange={e => setAnimation(e.target.value as AnimationStyle)}>
              <option value="spring">Spring</option>
              <option value="magnetic">Magnetic</option>
              <option value="inertial">Inertial (for scrolling)</option>
              <option value="none">None</option>
            </Select>
          </ControlItem>
        </ControlGrid>
         <div>
          <CheckboxLabel>
            <Checkbox type="checkbox" checked={fullWidth} onChange={e => setFullWidth(e.target.checked)} />
            Full Width
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox type="checkbox" checked={scrollable} onChange={e => setScrollable(e.target.checked)} />
            Scrollable (uses long tab list if checked)
          </CheckboxLabel>
           <CheckboxLabel>
            <Checkbox type="checkbox" checked={elevated} onChange={e => setElevated(e.target.checked)} />
            Elevated
          </CheckboxLabel>
        </div>
      </ControlsCard>

      {/* Render the customizable TabBar */}
      <Card style={{ flexDirection: orientation === 'vertical' ? 'row' : 'column', minHeight: orientation === 'vertical' ? '300px' : 'auto' }}>
        <GlassTabBar
          tabs={currentTabs}
          activeTab={activeTab}
          onChange={(_e, index) => setActiveTab(index)}
          variant={variant}
          orientation={orientation}
          glassVariant={glassVariant}
          color={color}
          animationStyle={animation}
          fullWidth={fullWidth}
          scrollable={scrollable}
          elevated={elevated}
          physics={physicsSettings}
          height={orientation === 'vertical' ? '100%' : undefined}
          width={orientation === 'vertical' ? 180 : undefined}
        />
        {orientation === 'vertical' ? (
            <FlexTabContent>{getTabContent(currentTabs[activeTab])}</FlexTabContent>
        ) : (
            <TabContent>{getTabContent(currentTabs[activeTab])}</TabContent>
        )}
      </Card>
    </StoryContainer>
  );
};

export const Customizable: Story = {
  render: () => <CustomizableTabBarStory />,
}; 