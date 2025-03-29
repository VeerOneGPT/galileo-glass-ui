/**
 * GlassDataChartDemo component
 * 
 * Demonstrates the GlassDataChart component with various chart types and options.
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { 
  GlassDataChart,
  ChartVariant,
  DataPoint, 
  ChartDataset,
  DatasetStyle
} from '../components/DataChart';
import { GlassTabBar } from '../components/GlassTabBar';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

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

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  height: 400px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

/**
 * Generate random data for demo
 */
const generateRandomData = (count: number, min: number, max: number): DataPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    x: i,
    y: Math.floor(Math.random() * (max - min + 1)) + min,
    label: `Point ${i}`,
    extra: {
      timestamp: new Date(Date.now() - (count - i) * 86400000).toLocaleDateString(),
      change: Math.random() > 0.5 ? `+${(Math.random() * 5).toFixed(2)}%` : `-${(Math.random() * 5).toFixed(2)}%`
    }
  }));
};

/**
 * Generate demo stock price data
 */
const generateStockData = (count: number, baseValue: number, volatility: number): DataPoint[] => {
  let currentValue = baseValue;
  const data: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * volatility * currentValue;
    currentValue = Math.max(currentValue + change, 1);
    
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    
    data.push({
      x: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: parseFloat(currentValue.toFixed(2)),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      extra: {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        change: change >= 0 ? `+${change.toFixed(2)}` : `${change.toFixed(2)}`,
        percentChange: `${(change / (currentValue - change) * 100).toFixed(2)}%`
      }
    });
  }
  
  return data;
};

/**
 * Generate sales data for demo
 */
const generateSalesData = (): ChartDataset[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return [
    {
      id: 'sales-2022',
      label: 'Sales 2022',
      data: months.map((month, i) => ({
        x: month,
        y: Math.floor(Math.random() * 100000) + 50000,
        label: month,
        extra: {
          quarter: Math.floor(i / 3) + 1,
          year: 2022
        }
      })),
      style: {
        lineColor: '#6366F1',
        fillColor: 'rgba(99, 102, 241, 0.2)',
        fillOpacity: 0.2,
        lineWidth: 2,
        pointSize: 4,
      }
    },
    {
      id: 'sales-2023',
      label: 'Sales 2023',
      data: months.map((month, i) => ({
        x: month,
        y: Math.floor(Math.random() * 150000) + 70000,
        label: month,
        extra: {
          quarter: Math.floor(i / 3) + 1,
          year: 2023
        }
      })),
      style: {
        lineColor: '#10B981',
        fillColor: 'rgba(16, 185, 129, 0.2)',
        fillOpacity: 0.2,
        lineWidth: 2,
        pointSize: 4,
      }
    }
  ];
};

/**
 * Generate product distribution data for pie charts
 */
const generateProductData = (): ChartDataset => {
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const colors = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  
  return {
    id: 'products',
    label: 'Product Distribution',
    data: products.map((product, i) => ({
      x: product,
      y: Math.floor(Math.random() * 1000) + 100,
      label: product,
      color: colors[i],
      extra: {
        department: ['Electronics', 'Home', 'Beauty', 'Food', 'Sports'][i],
        inStock: Math.random() > 0.2
      }
    }))
  };
};

/**
 * Create multiple datasets for demo
 */
const createMultiDataset = (count: number): ChartDataset[] => {
  const datasets: ChartDataset[] = [];
  const colors = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  for (let i = 0; i < count; i++) {
    datasets.push({
      id: `dataset-${i}`,
      label: `Dataset ${i + 1}`,
      data: generateRandomData(12, 100, 1000),
      style: {
        lineColor: colors[i % colors.length],
        fillOpacity: 0.1,
        lineWidth: 2,
        pointSize: 3,
        glowEffect: true,
      }
    });
  }
  
  return datasets;
};

/**
 * Stock data for demonstration
 */
const stockDatasets: ChartDataset[] = [
  {
    id: 'glas-stock',
    label: 'GLAS Stock Price',
    data: generateStockData(30, 150, 0.05),
    style: {
      lineColor: '#6366F1',
      fillColor: 'rgba(99, 102, 241, 0.2)',
      fillOpacity: 0.2,
      glowEffect: true,
    }
  }
];

/**
 * Custom dataset styles
 */
const areaGradientStyle: DatasetStyle = {
  fillColor: ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.4)'],
  lineColor: '#6366F1',
  pointColor: '#6366F1',
  lineWidth: 3,
  pointSize: 4,
  glowEffect: true,
};

/**
 * GlassDataChartDemo component
 */
export const GlassDataChartDemo: React.FC = () => {
  // State for demo configuration
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ChartVariant>('line');
  const [glassStyle, setGlassStyle] = useState('frosted');
  const [color, setColor] = useState('primary');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [usePhysics, setUsePhysics] = useState(true);
  
  // Sample data for different chart types
  const salesData = generateSalesData();
  const productData = generateProductData();
  const multiDataset = createMultiDataset(5);
  
  // State for chart options
  const [tooltipStyle, setTooltipStyle] = useState<'frosted' | 'dynamic'>('dynamic');
  
  // Tab content based on active tab
  const tabContent = [
    // Basic Charts Tab
    <Section key="basic">
      <SectionTitle variant="h3">Basic Chart Types</SectionTitle>
      
      <ChartGrid>
        {/* Line Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Line Chart"
            subtitle="Monthly Sales Data"
            variant="line"
            datasets={salesData}
            height={400}
          />
        </ChartContainer>
        
        {/* Bar Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Bar Chart"
            subtitle="Monthly Sales Data"
            variant="bar"
            datasets={salesData}
            height={400}
          />
        </ChartContainer>
        
        {/* Area Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Area Chart"
            subtitle="Monthly Sales Data"
            variant="area"
            datasets={salesData}
            height={400}
          />
        </ChartContainer>
        
        {/* Pie Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Pie Chart"
            subtitle="Product Distribution"
            variant="pie"
            datasets={[productData]}
            height={400}
          />
        </ChartContainer>
        
        {/* Doughnut Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Doughnut Chart"
            subtitle="Product Distribution"
            variant="doughnut"
            datasets={[productData]}
            height={400}
          />
        </ChartContainer>
        
        {/* Bubble Chart */}
        <ChartContainer>
          <GlassDataChart
            title="Bubble Chart"
            subtitle="Data Correlation"
            variant="bubble"
            datasets={[{
              id: 'bubble-data',
              label: 'Bubble Data',
              data: Array.from({ length: 10 }, (_, i) => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                extra: { size: Math.random() * 20 + 5 }
              }))
            }]}
            height={400}
          />
        </ChartContainer>
      </ChartGrid>
    </Section>,
    
    // Glass Styling Tab
    <Section key="styling">
      <SectionTitle variant="h3">Glass Styling Options</SectionTitle>
      
      <ChartGrid>
        {/* Clear Glass */}
        <ChartContainer>
          <GlassDataChart
            title="Clear Glass Style"
            subtitle="High transparency with subtle blur"
            variant="line"
            datasets={stockDatasets}
            glassVariant="clear"
            height={400}
          />
        </ChartContainer>
        
        {/* Frosted Glass */}
        <ChartContainer>
          <GlassDataChart
            title="Frosted Glass Style"
            subtitle="Medium opacity with standard blur"
            variant="line"
            datasets={stockDatasets}
            glassVariant="frosted"
            height={400}
          />
        </ChartContainer>
        
        {/* Tinted Glass */}
        <ChartContainer>
          <GlassDataChart
            title="Tinted Glass Style"
            subtitle="Color-tinted background with blur"
            variant="line"
            datasets={stockDatasets}
            glassVariant="tinted"
            color="primary"
            height={400}
          />
        </ChartContainer>
        
        {/* Luminous Glass */}
        <ChartContainer>
          <GlassDataChart
            title="Luminous Glass Style"
            subtitle="Glowing effect with emphasis"
            variant="line"
            datasets={stockDatasets}
            glassVariant="luminous"
            color="info"
            height={400}
          />
        </ChartContainer>
      </ChartGrid>
    </Section>,
    
    // Animations & Interactivity Tab
    <Section key="interactive">
      <SectionTitle variant="h3">Animations & Interactions</SectionTitle>
      
      <ChartGrid>
        {/* Physics-based animations */}
        <ChartContainer>
          <GlassDataChart
            title="Physics-Based Animations"
            subtitle="Spring animations with natural feel"
            variant="area"
            datasets={stockDatasets.map(dataset => ({
              ...dataset,
              style: {
                ...dataset.style,
                ...areaGradientStyle
              }
            }))}
            animation={{
              physicsEnabled: true,
              tension: 300,
              friction: 30,
              mass: 1,
            }}
            height={400}
          />
        </ChartContainer>
        
        {/* Staggered animations */}
        <ChartContainer>
          <GlassDataChart
            title="Staggered Animations"
            subtitle="Datasets animate in sequence"
            variant="line"
            datasets={multiDataset}
            animation={{
              physicsEnabled: true,
              staggerDelay: 150,
            }}
            height={400}
          />
        </ChartContainer>
        
        {/* Interactive hover */}
        <ChartContainer>
          <GlassDataChart
            title="Enhanced Tooltips"
            subtitle="Interactive data exploration"
            variant="line"
            datasets={stockDatasets}
            interaction={{
              showTooltips: true,
              tooltipStyle: tooltipStyle,
              physicsHoverEffects: true,
            }}
            height={400}
          />
        </ChartContainer>
        
        {/* Zoom/Pan enabled */}
        <ChartContainer>
          <GlassDataChart
            title="Zoom & Pan Capabilities"
            subtitle="Scroll to zoom, drag to pan"
            variant="line"
            datasets={generateSalesData()}
            interaction={{
              zoomPanEnabled: true,
              zoomMode: 'xy',
            }}
            height={400}
          />
        </ChartContainer>
      </ChartGrid>
    </Section>,
    
    // Customization Tab
    <Section key="custom">
      <SectionTitle variant="h3">Customizable Chart</SectionTitle>
      
      <ControlsCard>
        <Typography variant="h4" style={{ marginBottom: '1rem' }}>Chart Configuration</Typography>
        
        <ControlGrid>
          <ControlItem>
            <ControlLabel>Chart Type</ControlLabel>
            <Select
              value={selectedVariant}
              onChange={e => setSelectedVariant(e.target.value as ChartVariant)}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="area">Area</option>
              <option value="pie">Pie</option>
              <option value="doughnut">Doughnut</option>
            </Select>
          </ControlItem>
          
          <ControlItem>
            <ControlLabel>Glass Style</ControlLabel>
            <Select
              value={glassStyle}
              onChange={e => setGlassStyle(e.target.value)}
            >
              <option value="clear">Clear</option>
              <option value="frosted">Frosted</option>
              <option value="tinted">Tinted</option>
              <option value="luminous">Luminous</option>
            </Select>
          </ControlItem>
          
          <ControlItem>
            <ControlLabel>Color Theme</ControlLabel>
            <Select
              value={color}
              onChange={e => setColor(e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </ControlItem>
        </ControlGrid>
        
        <ButtonGroup>
          <Button 
            size="small" 
            variant={usePhysics ? "contained" : "outlined"}
            onClick={() => setUsePhysics(true)}
          >
            Physics Animations
          </Button>
          <Button
            size="small"
            variant={!usePhysics ? "contained" : "outlined"}
            onClick={() => setUsePhysics(false)}
          >
            Standard Animations
          </Button>
        </ButtonGroup>
        
        <div>
          <ControlLabel>
            <Checkbox
              type="checkbox"
              checked={showLegend}
              onChange={e => setShowLegend(e.target.checked)}
            />
            Show Legend
          </ControlLabel>
          
          <ControlLabel>
            <Checkbox
              type="checkbox"
              checked={showGrid}
              onChange={e => setShowGrid(e.target.checked)}
            />
            Show Grid
          </ControlLabel>
        </div>
        
        <div className="control-group">
          <label>Tooltip Style:</label>
          <select value={tooltipStyle} onChange={(e) => setTooltipStyle(e.target.value as any)}>
            <option value="frosted">Frosted</option>
            <option value="dynamic">Dynamic</option>
          </select>
        </div>
      </ControlsCard>
      
      <ChartContainer>
        <GlassDataChart
          title="Customized Chart"
          subtitle="Configure using the controls above"
          variant={selectedVariant}
          datasets={selectedVariant === 'pie' || selectedVariant === 'doughnut' 
            ? [productData] 
            : salesData
          }
          glassVariant={glassStyle as any}
          color={color as any}
          animation={{
            physicsEnabled: usePhysics,
            tension: 300,
            friction: 30,
            mass: 1,
          }}
          legend={{
            show: showLegend,
            position: 'top',
            style: 'pills',
            glassEffect: true,
          }}
          axis={{
            showXGrid: showGrid,
            showYGrid: showGrid,
          }}
          interaction={{
            showTooltips: true,
            tooltipStyle: tooltipStyle,
            tooltipFollowCursor: false,
          }}
          height={400}
        />
      </ChartContainer>
    </Section>
  ];
  
  return (
    <DemoContainer>
      <Title variant="h1">Glass Data Chart Component</Title>
      
      <GlassTabBar
        tabs={[
          { label: 'Basic Charts', value: 'basic' },
          { label: 'Glass Styling', value: 'styling' },
          { label: 'Animations', value: 'interactive' },
          { label: 'Customization', value: 'custom' },
        ]}
        activeTab={activeTab}
        onChange={(_, index) => setActiveTab(index)}
      />
      
      {tabContent[activeTab]}
    </DemoContainer>
  );
};

export default GlassDataChartDemo;