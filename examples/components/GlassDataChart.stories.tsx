import React, { useState } from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

import { 
  DataChart
} from '../../src/components'; // Use direct import from components index
import { TabBar as GlassTabBar } from '../../src/components'; // Use direct import from components index
import { Typography } from '../../src/components/Typography';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

// Define local types for chart components (Reverted - types not yet available from build)
type ChartVariant = 'line' | 'bar' | 'area' | 'pie' | 'doughnut' | 'bubble';

interface DataPoint {
  x: string | number;
  y: number | null;
  label?: string;
  color?: string;
  extra?: Record<string, any>;
}

interface DatasetStyle {
  lineColor?: string;
  fillColor?: string | string[];
  pointColor?: string;
  fillOpacity?: number;
  lineWidth?: number;
  pointSize?: number;
  pointStyle?: 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';
  glowEffect?: boolean;
  glowIntensity?: 'subtle' | 'medium' | 'strong';
}

interface ChartDataset {
  id: string;
  label: string;
  data: DataPoint[];
  style?: DatasetStyle;
}

interface GlassDataChartProps {
  title?: string;
  subtitle?: string;
  variant: ChartVariant;
  datasets: ChartDataset[]; // Use local type
  glassVariant?: 'clear' | 'frosted' | 'tinted' | 'luminous';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  animation?: {
    physicsEnabled?: boolean;
    tension?: number;
    friction?: number;
    mass?: number;
    staggerDelay?: number;
  };
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    style?: 'default' | 'glass' | 'pills';
    glassEffect?: boolean;
  };
  height?: number;
  interaction?: {
    showTooltips?: boolean;
    tooltipStyle?: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
    tooltipFollowCursor?: boolean;
    physicsHoverEffects?: boolean;
    zoomPanEnabled?: boolean;
    zoomMode?: 'x' | 'y' | 'xy';
    physics?: Record<string, any>;
  };
  axis?: {
    showXGrid?: boolean;
    showYGrid?: boolean;
    showXLabels?: boolean;
    showYLabels?: boolean;
    xTitle?: string;
    yTitle?: string;
    xTicksCount?: number;
    yTicksCount?: number;
    axisColor?: string;
    gridColor?: string;
    gridStyle?: 'solid' | 'dashed' | 'dotted';
  };
  onDataPointClick?: (datasetIndex: number, dataIndex: number, data: DataPoint) => void;
  onZoomPan?: (chart: any) => void;
}

// --- Data Generation Functions (from original demo) ---
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
        extra: { quarter: Math.floor(i / 3) + 1, year: 2022 }
      })),
      style: { lineColor: '#6366F1', fillColor: 'rgba(99, 102, 241, 0.2)', fillOpacity: 0.2, lineWidth: 2, pointSize: 4 }
    },
    {
      id: 'sales-2023',
      label: 'Sales 2023',
      data: months.map((month, i) => ({
        x: month,
        y: Math.floor(Math.random() * 150000) + 70000,
        label: month,
        extra: { quarter: Math.floor(i / 3) + 1, year: 2023 }
      })),
      style: { lineColor: '#10B981', fillColor: 'rgba(16, 185, 129, 0.2)', fillOpacity: 0.2, lineWidth: 2, pointSize: 4 }
    }
  ];
};

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
      extra: { department: ['Electronics', 'Home', 'Beauty', 'Food', 'Sports'][i], inStock: Math.random() > 0.2 }
    }))
  };
};

const createMultiDataset = (count: number): ChartDataset[] => {
  const datasets: ChartDataset[] = [];
  const colors = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  for (let i = 0; i < count; i++) {
    datasets.push({
      id: `dataset-${i}`,
      label: `Dataset ${i + 1}`,
      data: generateRandomData(12, 100, 1000),
      style: { lineColor: colors[i % colors.length], fillOpacity: 0.1, lineWidth: 2, pointSize: 3, glowEffect: true }
    });
  }
  return datasets;
};

const generateDenseData = (): ChartDataset[] => {
  const points = 200;
  const sineData: DataPoint[] = [];
  const cosineData: DataPoint[] = [];
  const complexData: DataPoint[] = [];
  for (let i = 0; i < points; i++) {
    const x = i / 10;
    const sineY = Math.sin(x) * 50 + 50;
    const cosineY = Math.cos(x) * 40 + 60;
    const complexY = Math.sin(x) * Math.cos(x * 0.5) * 30 + 70;
    sineData.push({ x, y: sineY, label: `x: ${x.toFixed(1)}, y: ${sineY.toFixed(1)}`, extra: { type: 'sine', magnitude: Math.abs(sineY - 50).toFixed(2) } });
    cosineData.push({ x, y: cosineY, label: `x: ${x.toFixed(1)}, y: ${cosineY.toFixed(1)}`, extra: { type: 'cosine', magnitude: Math.abs(cosineY - 60).toFixed(2) } });
    complexData.push({ x, y: complexY, label: `x: ${x.toFixed(1)}, y: ${complexY.toFixed(1)}`, extra: { type: 'complex', magnitude: Math.abs(complexY - 70).toFixed(2) } });
  }
  return [
    { id: 'sine-wave', label: 'Sine Wave', data: sineData, style: { lineColor: '#6366F1', pointSize: 2, pointStyle: 'circle', lineWidth: 1.5, fillOpacity: 0.2, glowEffect: true, glowIntensity: 'subtle' } },
    { id: 'cosine-wave', label: 'Cosine Wave', data: cosineData, style: { lineColor: '#10B981', pointSize: 2, pointStyle: 'circle', lineWidth: 1.5, fillOpacity: 0.2, glowEffect: true, glowIntensity: 'subtle' } },
    { id: 'complex-wave', label: 'Complex Wave', data: complexData, style: { lineColor: '#8B5CF6', pointSize: 2, pointStyle: 'circle', lineWidth: 1.5, fillOpacity: 0.2, glowEffect: true, glowIntensity: 'subtle' } }
  ];
};

// --- Sample Data Instances ---
const salesData = generateSalesData();
const productData = generateProductData();
const multiDataset = createMultiDataset(5);
const stockDatasets: ChartDataset[] = [{ id: 'glas-stock', label: 'GLAS Stock Price', data: generateStockData(30, 150, 0.05), style: { lineColor: '#6366F1', fillColor: 'rgba(99, 102, 241, 0.2)', fillOpacity: 0.2, glowEffect: true } }];
const denseData = generateDenseData();
const areaGradientStyle: ChartDataset['style'] = { fillColor: ['rgba(99, 102, 241, 0.1)', 'rgba(99, 102, 241, 0.4)'], lineColor: '#6366F1', pointColor: '#6366F1', lineWidth: 3, pointSize: 4, glowEffect: true };

// --- Styled Components for Story Layout ---
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); /* Adjust minmax for smaller charts */
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ChartContainer = styled.div`
  height: 300px; /* Adjust height */
`;

const ControlsCard = styled(Card)`
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 800px; /* Limit width of controls */
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
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

const CheckboxLabel = styled.label` // Use label for checkbox
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

// Mock Theme (similar to MousePhysics story)
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof DataChart> = {
  title: 'Components/DataChart',
  component: DataChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The GlassDataChart component renders various chart types with glass styling, animations, and interactivity.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// --- Individual Stories ---

// Base Template for Stories
const Template: Story = {
  args: {
    datasets: [],
  } as Partial<GlassDataChartProps>,
  render: (args) => (
    <ChartContainer>
      <DataChart {...args as GlassDataChartProps} />
    </ChartContainer>
  ),
};

// Basic Chart Types
export const LineChart: Story = {
  ...Template,
  args: {
    title: "Line Chart",
    subtitle: "Monthly Sales Data",
    variant: "line",
    datasets: salesData,
    height: 300,
  },
};

export const BarChart: Story = {
  ...Template,
  args: {
    title: "Bar Chart",
    subtitle: "Monthly Sales Data",
    variant: "bar",
    datasets: salesData,
    height: 300,
  },
};

export const AreaChart: Story = {
  ...Template,
  args: {
    title: "Area Chart",
    subtitle: "Monthly Sales Data",
    variant: "area",
    datasets: salesData,
    height: 300,
  },
};

export const PieChart: Story = {
  ...Template,
  args: {
    title: "Pie Chart",
    subtitle: "Product Distribution",
    variant: "pie",
    datasets: [productData],
    height: 300,
  },
};

export const DoughnutChart: Story = {
  ...Template,
  args: {
    title: "Doughnut Chart",
    subtitle: "Product Distribution",
    variant: "doughnut",
    datasets: [productData],
    height: 300,
  },
};

export const BubbleChart: Story = {
  ...Template,
  args: {
    title: "Bubble Chart",
    subtitle: "Data Correlation",
    variant: "bubble",
    datasets: [{
      id: 'bubble-data',
      label: 'Bubble Data',
      data: Array.from({ length: 10 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        extra: { size: Math.random() * 20 + 5 }
      }))
    }],
    height: 300,
  },
};

// Glass Styling
export const ClearGlass: Story = {
  ...Template,
  args: {
    title: "Clear Glass Style",
    variant: "line",
    datasets: stockDatasets,
    glassVariant: "clear",
    height: 300,
  },
};

export const FrostedGlass: Story = {
  ...Template,
  args: {
    title: "Frosted Glass Style",
    variant: "line",
    datasets: stockDatasets,
    glassVariant: "frosted",
    height: 300,
  },
};

export const TintedGlass: Story = {
  ...Template,
  args: {
    title: "Tinted Glass Style",
    variant: "line",
    datasets: stockDatasets,
    glassVariant: "tinted",
    color: "primary",
    height: 300,
  },
};

export const LuminousGlass: Story = {
  ...Template,
  args: {
    title: "Luminous Glass Style",
    variant: "line",
    datasets: stockDatasets,
    glassVariant: "luminous",
    color: "info",
    height: 300,
  },
};

// Animations & Interactivity
export const PhysicsAnimations: Story = {
  ...Template,
  args: {
    title: "Physics-Based Animations",
    variant: "area",
    datasets: stockDatasets.map(dataset => ({ ...dataset, style: { ...dataset.style, ...areaGradientStyle } })),
    animation: { physicsEnabled: true, tension: 300, friction: 30, mass: 1 },
    height: 300,
  },
};

export const StaggeredAnimations: Story = {
  ...Template,
  args: {
    title: "Staggered Animations",
    variant: "line",
    datasets: multiDataset,
    animation: { physicsEnabled: true, staggerDelay: 150 },
    height: 300,
  },
};

export const InteractiveHover: Story = {
  ...Template,
  args: {
    title: "Interactive Data Points",
    subtitle: "Hover and click to interact",
    variant: "line",
    datasets: stockDatasets,
    animation: { physicsEnabled: true },
    interaction: {
      physicsHoverEffects: true,
      showTooltips: true,
      tooltipStyle: 'glass',
      tooltipFollowCursor: true,
    },
    onDataPointClick: (datasetIndex: number, dataIndex: number, data: DataPoint) => { console.log(`Clicked ${data.x}: ${data.y}`); },
    height: 300,
  },
};

export const PhysicsZoomPan: Story = {
  ...Template,
  args: {
    title: "Physics-Based Zoom & Pan",
    subtitle: "Wheel to zoom, middle-click/shift+drag to pan",
    variant: "line",
    datasets: denseData,
    glassVariant: "frosted",
    color: "info",
    animation: { physicsEnabled: true },
    interaction: {
      zoomPanEnabled: true,
      zoomMode: 'xy',
      showTooltips: true,
      tooltipStyle: 'glass',
      physics: { tension: 160, friction: 15, mass: 1, minZoom: 0.5, maxZoom: 8, wheelSensitivity: 0.05, inertiaDuration: 600 }
    },
    onZoomPan: (chart: any) => { console.log('Chart zoom/pan updated'); },
    height: 300,
  },
};

// --- Add Story for Physics Zoom/Pan Configuration (Task 9) ---
export const ConfigurablePhysicsZoomPan: Story = {
  args: {
    datasets: denseData,
    variant: 'line',
    title: 'Chart with Custom Zoom/Pan Physics',
    subtitle: 'Zoom with mouse wheel, pan with middle-click drag',
    height: 500,
    glassVariant: 'frosted',
    interaction: {
      zoomPanEnabled: true,
      tooltipStyle: 'glass',
      physics: {
        tension: 500, // Higher tension for snappier zoom
        friction: 20,  // Less friction for more overshoot
        mass: 0.8,     // Lighter mass
        minZoom: 0.5,
        maxZoom: 6,
        wheelSensitivity: 0.08, // More sensitive wheel zoom
        inertiaDuration: 800 // Longer pan inertia
      }
    },
    axis: {
      showXGrid: true,
      showYGrid: true,
    }
  },
};
// --- End Task 9 Story ---

// --- Story for Small Pie Segment Aggregation (Fix 1) ---

// Data specifically for showcasing the aggregation
const pieDataWithSmallSegments: ChartDataset[] = [
  {
    id: 'smallPieData',
    label: 'Market Share',
    data: [
      { label: 'Company A', x: 'A', y: 450, color: '#6366F1' }, // 45%
      { label: 'Company B', x: 'B', y: 350, color: '#10B981' }, // 35%
      { label: 'Company C', x: 'C', y: 180, color: '#F59E0B' }, // 18%
      { label: 'Startup X', x: 'X', y: 9, color: '#EF4444' },  // 0.9% (<1% threshold, usually 0.5% used in code)
      { label: 'Startup Y', x: 'Y', y: 7, color: '#EC4899' },  // 0.7%
      { label: 'Startup Z', x: 'Z', y: 4, color: '#8B5CF6' },  // 0.4%
    ],
    // Total: 1000
  }
];

export const PieWithSmallSegments: Story = {
  ...Template,
  args: {
    title: "Pie Chart with Small Segment Aggregation",
    subtitle: "Segments <0.5% are grouped into 'Other'",
    variant: "pie",
    datasets: pieDataWithSmallSegments,
    height: 350, // Slightly taller for better visibility
    legend: {
      show: true,
      position: 'right', // Move legend to the side
      style: 'default',
    },
    interaction: {
        showTooltips: true,
        tooltipStyle: 'glass'
    }
  },
};

// ---

// Customizable Story
const CustomizableChartStory: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<ChartVariant>('line');
  const [glassStyle, setGlassStyle] = useState<GlassDataChartProps['glassVariant']>('frosted');
  const [color, setColor] = useState<GlassDataChartProps['color']>('primary');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [usePhysics, setUsePhysics] = useState(true);
  // @ts-ignore
  const [tooltipStyle, setTooltipStyle] = useState<GlassDataChartProps['interaction']['tooltipStyle']>('dynamic');

  const datasets = selectedVariant === 'pie' || selectedVariant === 'doughnut' ? [productData] : salesData;

  return (
    <div>
      <Typography variant="h2" style={{ marginBottom: '2rem' }}>Customizable Chart</Typography>
      <ControlsCard>
        <Typography variant="h4" style={{ marginBottom: '1rem' }}>Chart Configuration</Typography>
        <ControlGrid>
          <ControlItem>
            <ControlLabel htmlFor="chart-type-select">Chart Type</ControlLabel>
            <Select 
                id="chart-type-select"
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
            <ControlLabel htmlFor="glass-style-select">Glass Style</ControlLabel>
            <Select 
                id="glass-style-select"
                value={glassStyle}
                onChange={e => setGlassStyle(e.target.value as any)}
            >
              <option value="clear">Clear</option>
              <option value="frosted">Frosted</option>
              <option value="tinted">Tinted</option>
              <option value="luminous">Luminous</option>
            </Select>
          </ControlItem>
          <ControlItem>
            <ControlLabel htmlFor="color-select">Color Theme</ControlLabel>
            <Select 
                id="color-select"
                value={color} 
                onChange={e => setColor(e.target.value as any)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
          </ControlItem>
            <ControlItem>
            <ControlLabel htmlFor="tooltip-style-select">Tooltip Style</ControlLabel>
            <Select 
                id="tooltip-style-select"
                value={tooltipStyle} 
                onChange={e => setTooltipStyle(e.target.value as any)}
            >
                <option value="default">Default</option>
                <option value="glass">Glass</option>
                <option value="dynamic">Dynamic</option>
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
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={showLegend}
              onChange={e => setShowLegend(e.target.checked)}
            />
            Show Legend
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={showGrid}
              onChange={e => setShowGrid(e.target.checked)}
            />
            Show Grid
          </CheckboxLabel>
        </div>
      </ControlsCard>

      <ChartContainer>
        <DataChart
          title="Customized Chart"
          subtitle="Configure using the controls above"
          variant={selectedVariant}
          datasets={datasets}
          glassVariant={glassStyle}
          color={color}
          animation={{ physicsEnabled: usePhysics, tension: 300, friction: 30, mass: 1 }}
          legend={{ show: showLegend, position: 'top', style: 'pills', glassEffect: true }}
          axis={{ 
              showXGrid: showGrid,
              showYGrid: showGrid,
              showXLabels: true,
              showYLabels: true,
              xTitle: 'X-Axis',
              yTitle: 'Y-Axis'
          }}
          interaction={{ 
              showTooltips: true, 
              // @ts-ignore - tooltipStyle includes 'dynamic' which may not be in the type definition
              tooltipStyle, 
              tooltipFollowCursor: true,
              physicsHoverEffects: usePhysics,
              zoomPanEnabled: true
          }}
          height={300}
        />
      </ChartContainer>
    </div>
  );
};

export const Customizable: Story = {
  render: () => <CustomizableChartStory />,
}; 