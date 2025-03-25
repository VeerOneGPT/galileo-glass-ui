/**
 * ChartsDemo Component
 * 
 * Demonstrates the enhanced chart components with Glass UI styling,
 * physics-based interactions, and Z-Space layering.
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  GlassChart, 
  SimpleChart, 
  EnhancedGlassTabs, 
  GlassTooltip, 
  GlassTooltipContent 
} from '../components/Charts';
import { usePhysicsInteraction, useMouseMagneticEffect } from '../animations/hooks';
import { useReducedMotion } from '../hooks';

// Styled container for the demo
const DemoContainer = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 600;
`;

const Description = styled.p`
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'};
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
`;

const DemoCard = styled.div`
  margin-bottom: 48px;
`;

const DemoHeader = styled.h3`
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 500;
`;

const DemoDescription = styled.p`
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
`;

const FeatureList = styled.ul`
  margin-bottom: 24px;
  padding-left: 24px;
  
  li {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.5;
    color: ${props => props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  }
`;

const TabsContainer = styled.div`
  margin-bottom: 24px;
  max-width: 500px;
`;

// Sample data for charts
const barChartData = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 56 },
  { label: 'Jun', value: 55 },
  { label: 'Jul', value: 40 },
];

const lineChartData = [
  { 
    name: 'Series 1',
    color: '#4B66EA',
    data: [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 55 },
      { label: 'Jul', value: 40 },
    ]
  },
  {
    name: 'Series 2',
    color: '#EC4899',
    data: [
      { label: 'Jan', value: 28 },
      { label: 'Feb', value: 48 },
      { label: 'Mar', value: 40 },
      { label: 'Apr', value: 19 },
      { label: 'May', value: 86 },
      { label: 'Jun', value: 27 },
      { label: 'Jul', value: 90 },
    ]
  }
];

const pieChartData = [
  { label: 'Category A', value: 30, color: '#4B66EA' },
  { label: 'Category B', value: 50, color: '#EC4899' },
  { label: 'Category C', value: 20, color: '#10B981' },
  { label: 'Category D', value: 15, color: '#F59E0B' },
];

/**
 * ChartsDemo Component
 */
const ChartsDemo: React.FC = () => {
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for tooltip demo
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Tabs for the demo
  const demoTabs = [
    { id: 'overview', label: 'Overview', badgeCount: 3 },
    { id: 'details', label: 'Details' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'settings', label: 'Settings', disabled: true }
  ];
  
  // Tabs for chart
  const chartTabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' }
  ];
  
  // Handle mouse move for tooltip demo
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  return (
    <DemoContainer>
      <SectionTitle>Glass UI Charts Demo</SectionTitle>
      <Description>
        This demo showcases the enhanced chart components with Glass UI styling,
        physics-based interactions, and Z-Space layering.
      </Description>
      
      {/* Main charts showcase */}
      <ChartGrid>
        <GlassChart
          type="bar"
          data={barChartData}
          title="Sales Performance"
          description="Monthly sales performance for the current year"
          height={400}
          magneticEffect={!prefersReducedMotion}
          magneticStrength={0.3}
          zElevation={2}
          tabs={chartTabs}
          allowTypeSwitch={true}
          chartProps={{
            showValues: true,
            cornerRadius: 4
          }}
        />
        
        <GlassChart
          type="line"
          data={lineChartData}
          title="Revenue Trends"
          description="Comparison of revenue streams over time"
          height={400}
          magneticEffect={!prefersReducedMotion}
          magneticStrength={0.3}
          zElevation={2}
          depthAnimation={!prefersReducedMotion}
          focusMode={true}
          allowDownload={true}
          chartProps={{
            showPoints: true,
            curve: 'smooth'
          }}
        />
        
        <GlassChart
          type="area"
          data={lineChartData}
          title="Market Share"
          description="Market share evolution over time"
          height={400}
          magneticEffect={!prefersReducedMotion}
          magneticStrength={0.3}
          zElevation={2}
          chartProps={{
            fillArea: true,
            showPoints: true,
            gradient: true
          }}
        />
        
        <GlassChart
          type="pie"
          data={pieChartData}
          title="Revenue Distribution"
          description="Breakdown of revenue by product category"
          height={400}
          magneticEffect={!prefersReducedMotion}
          magneticStrength={0.3}
          zElevation={2}
          chartProps={{
            innerRadius: 60,
            showLabels: true,
            labelType: 'percent'
          }}
        />
      </ChartGrid>
      
      {/* SimpleChart Demo */}
      <DemoCard>
        <DemoHeader>SimpleChart Component</DemoHeader>
        <DemoDescription>
          The SimpleChart component provides a lightweight rendering option for performance-constrained environments
          or as a fallback when main chart rendering fails.
        </DemoDescription>
        <FeatureList>
          <li>Optimized for performance with minimal DOM elements</li>
          <li>Maintains Glass UI styling consistency</li>
          <li>Supports all chart types with simplified rendering</li>
          <li>Minimal JavaScript execution for better performance</li>
        </FeatureList>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <SimpleChart
            type="bar"
            data={barChartData}
            title="Simple Bar Chart"
            width={400}
            height={300}
          />
          
          <SimpleChart
            type="line"
            data={lineChartData}
            title="Simple Line Chart"
            width={400}
            height={300}
            showPoints={true}
          />
          
          <SimpleChart
            type="area"
            data={lineChartData}
            title="Simple Area Chart"
            width={400}
            height={300}
            fillArea={true}
          />
          
          <SimpleChart
            type="pie"
            data={pieChartData}
            title="Simple Pie Chart"
            width={400}
            height={300}
            innerRadius={50} // Donut chart
          />
        </div>
      </DemoCard>
      
      {/* EnhancedGlassTabs Demo */}
      <DemoCard>
        <DemoHeader>EnhancedGlassTabs Component</DemoHeader>
        <DemoDescription>
          High-contrast, accessibility-focused tab component for chart navigation with glass morphism styling
          and physics-based interaction effects.
        </DemoDescription>
        <FeatureList>
          <li>Physics-based interaction with subtle magnetic effect</li>
          <li>High contrast mode for better accessibility</li>
          <li>Support for badges, icons, and disabled states</li>
          <li>Customizable animation and styling options</li>
        </FeatureList>
        
        <TabsContainer>
          <EnhancedGlassTabs
            tabs={demoTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="default"
            size="medium"
            color="primary"
            physicsEnabled={!prefersReducedMotion}
          />
        </TabsContainer>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
          <div>
            <DemoDescription>Default Style</DemoDescription>
            <EnhancedGlassTabs
              tabs={demoTabs.slice(0, 3)}
              variant="default"
              size="medium"
              color="primary"
            />
          </div>
          
          <div>
            <DemoDescription>Elevated Style</DemoDescription>
            <EnhancedGlassTabs
              tabs={demoTabs.slice(0, 3)}
              variant="elevated"
              size="medium"
              color="secondary"
            />
          </div>
          
          <div>
            <DemoDescription>Text Style</DemoDescription>
            <EnhancedGlassTabs
              tabs={demoTabs.slice(0, 3)}
              variant="text"
              size="medium"
              color="accent"
            />
          </div>
          
          <div>
            <DemoDescription>High Contrast</DemoDescription>
            <EnhancedGlassTabs
              tabs={demoTabs.slice(0, 3)}
              variant="default"
              size="medium"
              color="primary"
              highContrast={true}
            />
          </div>
        </div>
      </DemoCard>
      
      {/* GlassTooltip Demo */}
      <DemoCard>
        <DemoHeader>GlassTooltip Component</DemoHeader>
        <DemoDescription>
          Enhanced tooltip component with glass morphism styling for chart visualizations.
        </DemoDescription>
        <FeatureList>
          <li>Glass morphism styling with blur, glow, and edge highlight effects</li>
          <li>Customizable positioning and pointer direction</li>
          <li>Structured content formatting with title and data points</li>
          <li>Smooth fade-in animation with accessibility support</li>
        </FeatureList>
        
        <div 
          style={{ 
            position: 'relative', 
            height: '300px', 
            border: '1px dashed rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          onMouseMove={handleMouseMove}
        >
          <div>Move mouse to see the tooltip follow your cursor</div>
          
          {tooltipVisible && (
            <GlassTooltip
              x={tooltipPosition.x}
              y={tooltipPosition.y}
              position="top"
              glow={true}
              accentColor="primary"
              blurIntensity="medium"
            >
              <GlassTooltipContent
                title="Sales Performance"
                titleColor="#4B66EA"
                items={[
                  { label: 'Value', value: '$12,345', color: '#4B66EA' },
                  { label: 'Change', value: '+15%', color: '#10B981' },
                  { label: 'Period', value: 'Last 30 days' }
                ]}
              />
            </GlassTooltip>
          )}
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ position: 'relative', padding: '24px' }}>
            <GlassTooltip
              x={100}
              y={50}
              position="top"
              glow={true}
              accentColor="primary"
            >
              <GlassTooltipContent
                title="Top Position"
                items={[{ label: 'Value', value: 87 }]}
              />
            </GlassTooltip>
          </div>
          
          <div style={{ position: 'relative', padding: '24px' }}>
            <GlassTooltip
              x={100}
              y={50}
              position="right"
              glow={false}
              accentColor="secondary"
            >
              <GlassTooltipContent
                title="Right Position"
                items={[{ label: 'Value', value: 65 }]}
              />
            </GlassTooltip>
          </div>
          
          <div style={{ position: 'relative', padding: '24px' }}>
            <GlassTooltip
              x={100}
              y={50}
              position="bottom"
              glow={true}
              accentColor="accent"
              blurIntensity="strong"
            >
              <GlassTooltipContent
                title="Bottom Position"
                items={[{ label: 'Value', value: 42 }]}
              />
            </GlassTooltip>
          </div>
          
          <div style={{ position: 'relative', padding: '24px' }}>
            <GlassTooltip
              x={100}
              y={50}
              position="left"
              glow={false}
              accentColor="primary"
              blurIntensity="light"
            >
              <GlassTooltipContent
                title="Left Position"
                items={[{ label: 'Value', value: 23 }]}
              />
            </GlassTooltip>
          </div>
        </div>
      </DemoCard>
    </DemoContainer>
  );
};

export default ChartsDemo;