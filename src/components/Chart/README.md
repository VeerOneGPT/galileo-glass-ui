# ChartWrapper Component

A simple, lightweight container component that provides consistent glass styling for chart components. Perfect for wrapping chart libraries or the GlassDataChart component in a standardized container.

## Features

- Consistent glass-styled container for charts
- Optional title with styling
- Configurable height
- Clean, minimal design
- Compatible with any chart component or library

## Usage

```jsx
import { ChartWrapper } from '@veerone/galileo-glass-ui';
import { LineChart } from 'your-chart-library';

function MyChart() {
  return (
    <ChartWrapper title="Monthly Revenue" height={400}>
      <LineChart data={revenueData} />
    </ChartWrapper>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Chart component to render inside the wrapper |
| `title` | string | - | Optional title for the chart |
| `height` | number \| string | 'auto' | Height of the chart container (number for pixels, string for other units) |
| `className` | string | - | Additional CSS class name |

## Examples

### Basic Usage

```jsx
<ChartWrapper title="Performance Metrics">
  <BarChart data={performanceData} />
</ChartWrapper>
```

### With GlassDataChart

```jsx
<ChartWrapper title="User Activity" height={350}>
  <GlassDataChart
    variant="area"
    datasets={activityData}
    glassVariant="clear"
  />
</ChartWrapper>
```

### With Custom Height

```jsx
<ChartWrapper 
  title="Sales by Region" 
  height="50vh" 
  className="dashboard-chart"
>
  <PieChart data={salesData} />
</ChartWrapper>
```

### In a Grid Layout

```jsx
<div className="dashboard-grid">
  <ChartWrapper title="Revenue">
    <LineChart data={revenueData} />
  </ChartWrapper>
  
  <ChartWrapper title="Users">
    <BarChart data={userData} />
  </ChartWrapper>
  
  <ChartWrapper title="Conversion">
    <DonutChart data={conversionData} />
  </ChartWrapper>
</div>
```

## Styling

The ChartWrapper uses a minimal glass-styled container with:

- Semi-transparent background with backdrop blur
- Subtle border for definition
- Clean title area with separator
- Properly padded content area
- Rounded corners and overflow protection

You can extend the styling by applying additional CSS classes through the `className` prop.

## Design Considerations

- The container adapts to the width of its parent element
- Height can be controlled via the height prop
- Content area adjusts based on whether a title is present
- The component is designed to be visually cohesive with other Glass UI components

## Compatibility

Works with any chart library including:
- Chart.js
- D3.js
- Recharts
- ApexCharts
- And any other chart library or custom visualization 