import React, { useState } from 'react';
import {
  DimensionalGlass,
  FrostedGlass,
  HeatGlass,
  WidgetGlass,
  PageGlassContainer,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TreeView,
  TreeItem,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  KpiCard,
  PerformanceMetricCard,
  InteractiveKpiCard,
  GlassNavigation,
  ResponsiveNavigation,
  PageTransition,
  ZSpaceAppLayout,
  GlassThemeSwitcher,
  AtmosphericBackground,
  ParticleBackground,
  VisualFeedback,
  RippleButton
} from 'galileo-glass-ui';
import { zSpaceLayer , createThemeContext } from 'galileo-glass-ui/core';
import { type ThemeVariant } from '../src/hooks/useGlassTheme';

// Custom ZSpaceLayerComponent using the zSpaceLayer utility
const ZSpaceLayerComponent: React.FC<{ name: string; depth: number; children: React.ReactNode }> = ({ 
  name, 
  depth, 
  children 
}) => {
  // Use the zSpaceLayer utility to create a layer div
  const layerProps = zSpaceLayer({ 
    layer: name, // Use name as the layer value
    depth,
    createStackingContext: true 
  });
  return <div {...layerProps}>{children}</div>;
};

// Icons (placeholders, would be imported from an icon library)
const AddIcon = () => <span>+</span>;
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const ShareIcon = () => <span>🔗</span>;
const ExpandMoreIcon = () => <span>▼</span>;
const ChevronRightIcon = () => <span>▶</span>;
const HomeIcon = () => <span>🏠</span>;
const DashboardIcon = () => <span>📊</span>;
const ReportsIcon = () => <span>📋</span>;
const FormatBoldIcon = () => <span>B</span>;
const FormatItalicIcon = () => <span>I</span>;
const FormatUnderlinedIcon = () => <span>U</span>;
const InfoIcon = () => <span>ℹ️</span>;
const RevenueIcon = () => <span>💰</span>;

// Sample components for ZSpaceAppLayout
const MainNavigation = () => <div>Navigation</div>;
const PageContent = () => <div>Page Content</div>;
const Notifications = () => <div>Notifications</div>;
const DashboardWidgets = () => <div>Dashboard Widgets</div>;

// Sample chart for KPI Card
const SparklineChart = ({ data }) => (
  <div style={{ width: '100%', height: '40px', background: 'rgba(100, 200, 255, 0.2)' }}>
    Sparkline Chart
  </div>
);

/**
 * Demo of Advanced Components from Galileo Glass UI
 */
export const AdvancedComponentsDemo: React.FC = () => {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | false>('panel1');
  const [formats, setFormats] = useState(() => ['bold', 'italic']);
  const [rating, setRating] = useState<number | null>(3);
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState<ThemeVariant>('nebula' as ThemeVariant);

  // Sample data
  const navigationItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, path: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { 
      id: 'reports',
      label: 'Reports', 
      icon: <ReportsIcon />, 
      path: '/reports',
      children: [
        { id: 'annual', label: 'Annual', path: '/reports/annual' },
        { id: 'monthly', label: 'Monthly', path: '/reports/monthly' }
      ]
    }
  ];

  const imageItems = [
    { id: 1, img: 'https://via.placeholder.com/150/92c952', title: 'Image 1', author: 'Author A' },
    { id: 2, img: 'https://via.placeholder.com/150/771796', title: 'Image 2', author: 'Author B' },
    { id: 3, img: 'https://via.placeholder.com/150/24f355', title: 'Image 3', author: 'Author C' },
    { id: 4, img: 'https://via.placeholder.com/150/d32776', title: 'Image 4', author: 'Author D' },
    { id: 5, img: 'https://via.placeholder.com/150/f66b97', title: 'Image 5', author: 'Author E' },
    { id: 6, img: 'https://via.placeholder.com/150/56a8c2', title: 'Image 6', author: 'Author F' }
  ];

  const revenueData = [10, 20, 15, 25, 30, 20, 35];
  const engagementMetrics = [
    { label: 'Daily Active Users', value: '12.5k', trend: +3.2 },
    { label: 'Session Duration', value: '4m 35s', trend: +1.7 },
    { label: 'Bounce Rate', value: '24.8%', trend: -2.1 }
  ];

  // Handle format changes
  const handleFormatChange = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    setFormats(newFormats);
  };

  // Handle panel changes
  const handlePanelChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    setCurrentRoute(path);
    // Set the current view based on the path
    const view = path === '/' ? 'home' : path.substring(1);
    setCurrentView(view);
  };

  return (
    <PageGlassContainer>
      <h1>Galileo Glass UI - Advanced Components</h1>

      <section>
        <h2>Glass Surface Variants</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <FrostedGlass elevation={2} style={{ padding: '20px', minWidth: '200px' }}>
            <h3>Frosted Glass</h3>
            <p>Standard frosted glass surface with medium blur</p>
          </FrostedGlass>

          <DimensionalGlass 
            elevation={3} 
            depth={2}
            style={{ padding: '20px', minWidth: '200px' }}
          >
            <h3>Dimensional Glass</h3>
            <p>Enhanced 3D depth and parallax effects</p>
          </DimensionalGlass>

          <HeatGlass 
            intensity="medium"
            heatSource="center"
            animate={true}
            style={{ padding: '20px', minWidth: '200px' }}
          >
            <h3>Heat Glass</h3>
            <p>Animated thermal distortion effects</p>
          </HeatGlass>

          <WidgetGlass
            elevation={2}
            dataHighlight="primary"
            style={{ padding: '20px', minWidth: '200px' }}
          >
            <h3>Widget Glass</h3>
            <p>Optimized surface for data display</p>
          </WidgetGlass>
        </div>
      </section>

      <section>
        <h2>Interactive Components</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <FrostedGlass style={{ padding: '20px', minWidth: '300px', maxWidth: '500px' }}>
            <h3>Accordion</h3>
            <Accordion
              expanded={expandedPanel === 'panel1'}
              onChange={handlePanelChange('panel1')}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                First Panel
              </AccordionSummary>
              <AccordionDetails>
                Content for the first panel goes here.
              </AccordionDetails>
            </Accordion>
            
            <Accordion
              expanded={expandedPanel === 'panel2'}
              onChange={handlePanelChange('panel2')}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                Second Panel
              </AccordionSummary>
              <AccordionDetails>
                Content for the second panel goes here.
              </AccordionDetails>
            </Accordion>
          </FrostedGlass>

          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>TreeView</h3>
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              defaultExpanded={['1']}
            >
              <TreeItem nodeId="1" label="Main Category">
                <TreeItem nodeId="2" label="Subcategory 1" />
                <TreeItem nodeId="3" label="Subcategory 2">
                  <TreeItem nodeId="4" label="Item 1" />
                  <TreeItem nodeId="5" label="Item 2" />
                </TreeItem>
              </TreeItem>
              <TreeItem nodeId="6" label="Another Category">
                <TreeItem nodeId="7" label="Another Item" />
              </TreeItem>
            </TreeView>
          </FrostedGlass>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>ToggleButton</h3>
            <ToggleButtonGroup
              value={formats}
              onChange={handleFormatChange}
              aria-label="text formatting"
            >
              <ToggleButton value="bold" aria-label="bold">
                <FormatBoldIcon />
              </ToggleButton>
              <ToggleButton value="italic" aria-label="italic">
                <FormatItalicIcon />
              </ToggleButton>
              <ToggleButton value="underlined" aria-label="underlined">
                <FormatUnderlinedIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </FrostedGlass>

          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>Rating</h3>
            <Rating
              name="simple-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              precision={0.5}
            />
          </FrostedGlass>
        </div>

        <div style={{ position: 'relative', height: '80px', width: '100%' }}>
          <SpeedDial
            ariaLabel="Speed Dial Actions"
            icon={<SpeedDialIcon />}
            open={speedDialOpen}
            onOpen={() => setSpeedDialOpen(true)}
            onClose={() => setSpeedDialOpen(false)}
            direction="up"
            style={{ position: 'absolute', bottom: 16, right: 16 }}
          >
            <SpeedDialAction
              icon={<EditIcon />}
              tooltipTitle="Edit"
              onClick={() => console.log('Edit clicked')}
            />
            <SpeedDialAction
              icon={<ShareIcon />}
              tooltipTitle="Share"
              onClick={() => console.log('Share clicked')}
            />
            <SpeedDialAction
              icon={<DeleteIcon />}
              tooltipTitle="Delete"
              onClick={() => console.log('Delete clicked')}
            />
          </SpeedDial>
        </div>
      </section>

      <section>
        <h2>Data Display Components</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <FrostedGlass style={{ padding: '20px' }}>
            <h3>ImageList</h3>
            <ImageList cols={3} gap={8}>
              {imageItems.map((item) => (
                <ImageListItem key={item.id}>
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                  />
                  <ImageListItemBar
                    title={item.title}
                    subtitle={item.author}
                    actionIcon={
                      <button>
                        <InfoIcon />
                      </button>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </FrostedGlass>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <KpiCard
            title="Total Revenue"
            value="$1,234,567"
            trend={+12.3}
            trendLabel="vs Last Month"
            icon={<RevenueIcon />}
            chart={<SparklineChart data={revenueData} />}
          />

          <PerformanceMetricCard
            title="System Performance"
            value={89}
            maxValue={100}
            status="healthy"
            details={[
              { label: "CPU", value: "23%" },
              { label: "Memory", value: "45%" },
              { label: "Disk", value: "32%" }
            ]}
          />

          <InteractiveKpiCard
            title="User Engagement"
            value="78%"
            trend={+5.2}
            detailMetrics={engagementMetrics}
          />
        </div>
      </section>

      <section>
        <h2>Navigation & Layout Components</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <FrostedGlass style={{ padding: '20px' }}>
            <h3>GlassNavigation</h3>
            <GlassNavigation
              items={navigationItems}
              activeItem={currentRoute}
              onItemClick={handleNavigation}
              variant="standard"
            />
          </FrostedGlass>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <FrostedGlass style={{ padding: '20px' }}>
            <h3>Z-Space Layout</h3>
            <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
              <ZSpaceAppLayout
                backgroundComponent={<AtmosphericBackground />}
                navigation={<MainNavigation />}
                sidebar={<Notifications />}
              >
                <PageContent />
                <ZSpaceLayerComponent name="widget" depth={2}>
                  <DashboardWidgets />
                </ZSpaceLayerComponent>
              </ZSpaceAppLayout>
            </div>
          </FrostedGlass>
        </div>
      </section>

      <section>
        <h2>Theme & Performance Components</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>GlassThemeSwitcher</h3>
            <GlassThemeSwitcher
              showColorModes={true}
            />
          </FrostedGlass>

          <PageGlassContainer
            style={{ padding: '20px', minWidth: '300px' }}
          >
            <h3>Page Glass Container</h3>
            <p>This container uses performance optimization techniques.</p>
          </PageGlassContainer>
        </div>
      </section>

      <section>
        <h2>Background Effects</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', height: '200px', width: '300px', overflow: 'hidden' }}>
            <AtmosphericBackground
              intensity="medium"
              colorTheme="primary"
              particles={true}
              particleDensity="low"
              interactive={true}
              lightSources={[
                { x: '10%', y: '20%', intensity: 0.7, color: 'primary' },
                { x: '80%', y: '70%', intensity: 0.5, color: 'secondary' }
              ]}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
              Atmospheric Background
            </div>
          </div>

          <div style={{ position: 'relative', height: '200px', width: '300px', overflow: 'hidden' }}>
            <ParticleBackground
              particleCount={50}
              particleSize={3}
              particleColor="primary"
              flowField="circular"
              flowIntensity={0.3}
              interactiveRadius={150}
              interactionForce={0.5}
              velocityDecay={0.95}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>
              Particle Background
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Visual Feedback Components</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>Visual Feedback</h3>
            <VisualFeedback
              type="success"
              message="Operation completed successfully"
              autoHide={5000}
            />
            <VisualFeedback
              type="error"
              message="An error occurred"
              autoHide={5000}
            />
          </FrostedGlass>

          <FrostedGlass style={{ padding: '20px', minWidth: '300px' }}>
            <h3>Ripple Button</h3>
            <RippleButton 
              onClick={() => console.log('Clicked')}
              rippleColor="rgba(255, 255, 255, 0.3)"
              rippleOrigin="center"
              style={{ padding: '10px 20px', background: 'rgba(100, 100, 255, 0.2)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Click Me
            </RippleButton>
          </FrostedGlass>
        </div>
      </section>
    </PageGlassContainer>
  );
};

export default AdvancedComponentsDemo;