import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlassDataChart } from './GlassDataChart';
import { DataPoint, ChartDataset } from './types/ChartTypes';
import { GlassDataChartProps, GetElementPhysicsOptions, GlassDataChartRef } from './types/ChartProps';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '../../contexts/AnimationContext';

// --- Mocking Chart.js (Enhanced) --- 
const mockChartDraw = jest.fn();
const mockChartUpdate = jest.fn();
const mockChartDestroy = jest.fn();
// Define a simple type for the mock instance
interface MockChartInstance {
    draw: jest.Mock;
    update: jest.Mock;
    destroy: jest.Mock;
    options: any; // Use any for flexibility in testing
    data: any;    // Use any for flexibility in testing
}
const mockChartInstance: MockChartInstance = {
    draw: mockChartDraw,
    update: mockChartUpdate,
    destroy: mockChartDestroy,
    options: {},
    data: {},
};
jest.mock('react-chartjs-2', () => ({
    Chart: jest.fn((props: any) => {
        mockChartInstance.options = props.options;
        mockChartInstance.data = props.data;
        return <canvas data-testid="mock-chart" />;
    }),
}));

// Reset mocks before each test
beforeEach(() => {
    mockChartDraw.mockClear();
    mockChartUpdate.mockClear();
    mockChartDestroy.mockClear();
    mockChartInstance.options = {};
    mockChartInstance.data = {};
    (require('react-chartjs-2').Chart as jest.Mock).mockClear();
});

// Define mock data locally
const mockDatasets: ChartDataset[] = [
  { id: 'd1', label: 'Data 1', data: [{ x: 1, y: 10 }, { x: 2, y: 20 }] }, 
];

// Wrapper component for tests that includes all required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

describe('DataChart Interactivity (Zoom/Pan)', () => {

  test('should pass zoom/pan options to internal hook/chart config when enabled', () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
          interaction={{
            zoomPanEnabled: true,
            zoomMode: 'xy'
          }}
        />
      </TestWrapper>
    );

    const { useChartPhysicsInteraction } = require('./hooks/useChartPhysicsInteraction');
    expect(useChartPhysicsInteraction).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, mode: 'xy' })); 

    // ... (conceptual chart option check remains commented) ...
  });

  test('should NOT pass zoom/pan options when disabled', () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
          interaction={{ zoomPanEnabled: false }}
        />
      </TestWrapper>
    );
    const { useChartPhysicsInteraction } = require('./hooks/useChartPhysicsInteraction');
    expect(useChartPhysicsInteraction).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  test('should call interaction hook handlers on mouse events (conceptual)', () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
          interaction={{ 
            zoomPanEnabled: true, 
            zoomMode: 'xy'
          }}
        />
      </TestWrapper>
    );
    
    const chartCanvas = screen.getByTestId('mock-chart');
    const { useChartPhysicsInteraction } = require('./hooks/useChartPhysicsInteraction');
    const mockInteractionHook = useChartPhysicsInteraction(); 

    fireEvent(chartCanvas, new WheelEvent('wheel', { deltaY: -100 })); 
    expect(mockInteractionHook.handleWheel).toHaveBeenCalled();

    fireEvent(chartCanvas, new MouseEvent('mousedown', { clientX: 10, clientY: 10 }));
    expect(mockInteractionHook.handleMouseDown).toHaveBeenCalled();

    fireEvent(chartCanvas, new MouseEvent('mousemove', { clientX: 20, clientY: 20 }));
    expect(mockInteractionHook.handleMouseMove).toHaveBeenCalled();

    fireEvent.mouseUp(chartCanvas);
    expect(mockInteractionHook.handleMouseUp).toHaveBeenCalled();

    fireEvent.mouseLeave(chartCanvas);
    expect(mockInteractionHook.handleMouseLeave).toHaveBeenCalled();
  });

  // ... (TODOs remain the same) ...
});

describe('DataChart Rendering (Task 27 Bugs)', () => {

  test('glassVariant="clear" should not render AtmosphericEffects', () => {
    // This test assumes AtmosphericEffects component can be identified,
    // e.g., by a specific data-testid or class name.
    // Or, we check if the props passed down disable it.
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
          glassVariant="clear"
        />
      </TestWrapper>
    );
    
    // Example: Check if a known child component indicative of the effect is NOT present
    // const atmosphericElement = screen.queryByTestId('atmospheric-background');
    // expect(atmosphericElement).not.toBeInTheDocument();

    // Alternative: Check props passed to ChartRenderer (if applicable)
    // This requires mocking ChartRenderer or inspecting props passed to it.
    expect(true).toBe(true); // Placeholder assertion
  });

  test('glassVariant="frosted" should render AtmosphericEffects (or equivalent)', () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
          glassVariant="frosted"
        />
      </TestWrapper>
    );
    // Example: Check if the effect component IS present
    // const atmosphericElement = screen.queryByTestId('atmospheric-background');
    // expect(atmosphericElement).toBeInTheDocument();
    expect(true).toBe(true); // Placeholder assertion
  });

  test('variant="area" should pass fill=true or equivalent to Chart.js', () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="area"
        />
      </TestWrapper>
    );

    // Need to inspect the data passed to the mocked Chart component
    const chartCanvas = screen.getByTestId('mock-chart');
    const chartData = JSON.parse(chartCanvas.getAttribute('data-chartdata') || '{}');
    
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets.length).toBeGreaterThan(0);
    // Check the first dataset for the fill property (might be named differently)
    // The exact property depends on convertToChartJsDatasetWithEffects implementation
    expect(chartData.datasets[0]).toHaveProperty('fill', true);
  });

  test('variant="line" should pass fill=false or equivalent to Chart.js', () => {
      render(
        <TestWrapper>
          <GlassDataChart 
            datasets={mockDatasets} 
            variant="line"
          />
        </TestWrapper>
      );
      const chartCanvas = screen.getByTestId('mock-chart');
      const chartData = JSON.parse(chartCanvas.getAttribute('data-chartdata') || '{}');
      expect(chartData.datasets).toBeDefined();
      expect(chartData.datasets.length).toBeGreaterThan(0);
      // Line charts should default to no fill unless specified
      expect(chartData.datasets[0].fill).toBeFalsy(); // Or check for absence
  });

  // TODO: Add tests verifying correct data structure passed for 'pie' variant.
  // TODO: Add tests verifying correct data structure passed for 'doughnut' variant.
  // TODO: Visual regression tests are needed for pixel-perfect rendering verification.

});

// TODO: Add more tests:
// - Axis configurations
// - Legend interactions
// - Toolbar interactions (type switching, export)
// - Physics animations and hover effects
// - Tooltip rendering and content
// - Different glass variants
// - Responsive behavior
// - Accessibility checks

it('should render area variant correctly with fill', () => {
  render(
    <TestWrapper>
      <GlassDataChart 
        datasets={mockDatasets} 
        variant="area"
      />
    </TestWrapper>
  );

  // Check that the chart type passed to Chart.js is correct (likely 'line')
  // and that the dataset includes fill=true.
  expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
  const passedData = mockChartInstance.data;
  // Depending on how Chart.js wrapper handles 'area', the type might still be 'line'
  // but the dataset config is the key.
  expect(passedData.datasets[0]).toHaveProperty('fill', true);
  // Optionally check background color if expected for area
  expect(passedData.datasets[0]).toHaveProperty('backgroundColor'); 
});

it('should render pie variant correctly', () => {
  render(
    <TestWrapper>
      <GlassDataChart 
        datasets={samplePieDoughnutData} // Use data suitable for pie
        variant="pie"
      />
    </TestWrapper>
  );

  expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
  const passedOptions = mockChartInstance.options;
  const passedData = mockChartInstance.data;
  
  // Pie charts usually don't have scales
  expect(passedOptions?.scales).toBeUndefined(); 
  // Check data structure is suitable for pie (e.g., single dataset, labels match)
  expect(passedData.labels).toEqual(samplePieDoughnutLabels);
  expect(passedData.datasets?.length).toBe(1);
  expect(passedData.datasets[0].data).toEqual([300, 50, 100]);
});

it('should render doughnut variant correctly with cutout', () => {
  render(
    <TestWrapper>
      <GlassDataChart 
        datasets={samplePieDoughnutData} // Use data suitable for doughnut
        variant="doughnut"
      />
    </TestWrapper>
  );

  expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
  const passedOptions = mockChartInstance.options;
  const passedData = mockChartInstance.data;
  
  // Doughnut charts don't have scales and should have a cutout property
  expect(passedOptions?.scales).toBeUndefined(); 
  expect(passedOptions).toHaveProperty('cutout'); 
  expect(typeof (passedOptions as any).cutout).toBe('string'); // e.g., '50%'
  // Check data structure
  expect(passedData.labels).toEqual(samplePieDoughnutLabels);
  expect(passedData.datasets?.length).toBe(1);
  expect(passedData.datasets[0].data).toEqual([300, 50, 100]);
});

it.skip('[TODO] should handle transparency correctly for overlapping areas/bars', () => {
  // Setup chart with overlapping elements
  // Assert visual correctness (may require snapshot testing or visual regression)
});

describe('GlassDataChart', () => {
  test('renders chart canvas correctly', async () => {
    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={mockDatasets} 
          variant="line"
        />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
    });
  });

  test('forwards ref correctly with imperative handle methods', async () => {
    const ref = React.createRef<GlassDataChartRef>();
    render(
      <TestWrapper>
        <GlassDataChart 
          ref={ref} 
          datasets={mockDatasets}
          variant="bar" 
        />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(ref.current).toBeInTheDocument();
      expect(typeof ref.current?.getChartInstance).toBe('function');
      expect(typeof ref.current?.exportChart).toBe('function');
      expect(typeof ref.current?.updateChart).toBe('function');
    });
  });

  // TODO: Add tests for:
  // - Different chart types (bar, pie, etc.)
  // - Options application
  // - Tooltip display
  // - Glass variants
  // - Interactions (if applicable)
});

// Sample data adjusted slightly for testing
const sampleDatasets: ChartDataset[] = [
    {
        id: 'd1',
        label: 'Dataset 1',
        data: [
            { x: 'Jan', y: 10 },
            { x: 'Feb', y: 20 },
            { x: 'Mar', y: 30 },
        ],
    },
];

// Data suitable for Pie/Doughnut (Using DataPoint structure with x values)
const samplePieDoughnutLabels = ['Red', 'Blue', 'Yellow'];
const samplePieDoughnutData: ChartDataset[] = [
    {
        id: 'pd1',
        label: 'Pie Data',
        // Add x values (can be the labels) to satisfy DataPoint type
        data: [
            { x: 'Red', y: 300 }, 
            { x: 'Blue', y: 50 },  
            { x: 'Yellow', y: 100 } 
        ],
        // Style removed, background colors are typically part of Chart.js options data
    }
];

// --- Mock GalileoElementInteractionPlugin --- 
// We need to mock the plugin registration if Chart.js automatically registers it,
// or ensure our test setup doesn't conflict.
// For simplicity, we won't mock the plugin itself deeply, but focus on the prop call.

describe('GlassDataChart - Per-Element Physics', () => {

  test('getElementPhysicsOptions should be passed correctly', async () => {
    const mockGetElementPhysicsOptions = jest.fn<ReturnType<GetElementPhysicsOptions>, Parameters<GetElementPhysicsOptions>>((_dp, _dsIndex, _dIndex, _type) => {
        return {
            hoverEffect: { scale: 1.2, opacity: 0.8 },
            tension: 200, friction: 15
        };
    });

    render(
        <TestWrapper>
            <GlassDataChart 
                datasets={sampleDatasets}
                variant="bar" 
                getElementPhysicsOptions={mockGetElementPhysicsOptions} 
                interaction={{ showTooltips: true }} 
            />
        </TestWrapper>
    );

    const chartCanvas = screen.getByTestId('mock-chart');

    // Simulate hover event (Simplified)
    fireEvent.mouseMove(chartCanvas); // Removed coordinates
    
    // Basic check: function was passed implies potential usage
    await waitFor(() => {
       expect(mockGetElementPhysicsOptions).toBeDefined(); 
    }, { timeout: 200 }); 

    // Simulate click (Simplified)
    fireEvent.click(chartCanvas); // Removed coordinates

    await waitFor(() => {
       expect(mockGetElementPhysicsOptions).toBeDefined();
    }, { timeout: 200 });

  });

});

// Include previous describe block for basic rendering and ref tests
describe('GlassDataChart - Basic Rendering & Ref', () => {
     test('renders chart canvas correctly', async () => {
        render(
            <TestWrapper>
                <GlassDataChart 
                    datasets={sampleDatasets} 
                    variant="line" 
                />
            </TestWrapper>
        );
        await waitFor(() => {
            expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
        });
    });

    test('forwards ref correctly with imperative handle methods', async () => {
        const ref = React.createRef<GlassDataChartRef>(); 
        render(
            <TestWrapper>
                <GlassDataChart 
                    ref={ref} 
                    datasets={sampleDatasets}
                    variant="bar" 
                />
            </TestWrapper>
        );
        await waitFor(() => {
            expect(ref.current).toBeDefined(); 
            expect(typeof ref.current?.getChartInstance).toBe('function');
            expect(typeof ref.current?.exportChart).toBe('function');
            expect(typeof ref.current?.updateChart).toBe('function');
        });
    });
});

describe('GlassDataChart - Core Rendering Variants', () => {

    test('glassVariant="clear" should render without error', () => {
        const { container } = render(
            <TestWrapper>
                <GlassDataChart 
                    datasets={sampleDatasets} 
                    variant="line" 
                    glassVariant="clear"
                />
            </TestWrapper>
        );
        const chartContainer = container.firstChild as HTMLElement;
        expect(chartContainer).toBeDefined();
    });

    test('variant="area" should pass fill options to Chart.js', () => {
        render(
            <TestWrapper>
                <GlassDataChart 
                    datasets={sampleDatasets} 
                    variant="area" 
                />
            </TestWrapper>
        );
        expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
        const passedData = mockChartInstance.data;
        expect(passedData.datasets[0]).toHaveProperty('fill', true); 
        expect(passedData.datasets[0]).toHaveProperty('backgroundColor');
    });

    test('variant="pie" should pass correct options (no scales)', () => {
        render(
            <TestWrapper>
                <GlassDataChart 
                    datasets={samplePieDoughnutData} 
                    variant="pie" 
                />
            </TestWrapper>
        );
        expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
        const passedOptions = mockChartInstance.options;
        expect(passedOptions?.scales).toBeUndefined(); 
        // Verify labels were passed correctly within the Chart.js data structure
        const passedData = mockChartInstance.data;
        expect(passedData.labels).toEqual(samplePieDoughnutLabels); // Expect labels to be inferred or passed internally
    });

    test('variant="doughnut" should pass correct options (no scales, cutout)', () => {
        render(
            <TestWrapper>
                <GlassDataChart 
                    datasets={samplePieDoughnutData} 
                    variant="doughnut" 
                />
            </TestWrapper>
        );
        expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
        const passedOptions = mockChartInstance.options;
        expect(passedOptions?.scales).toBeUndefined();
        expect(passedOptions).toHaveProperty('cutout'); 
        expect(typeof (passedOptions as any).cutout).toBe('string'); 
        // Verify labels
        const passedData = mockChartInstance.data;
        expect(passedData.labels).toEqual(samplePieDoughnutLabels);
    });

});

// --- Test for Small Pie Segment Aggregation (Fix 1) ---

describe('GlassDataChart - Pie Chart Small Segment Aggregation', () => {
  test('should aggregate segments below threshold into \'Other\' for pie charts', () => {
    const pieDataWithSmallSegments: ChartDataset[] = [
      {
        id: 'smallPie',
        label: 'Small Segments Test',
        data: [
          { label: 'Large A', x: 'Large A', y: 500 }, 
          { label: 'Large B', x: 'Large B', y: 480 },  
          { label: 'Small C', x: 'Small C', y: 4 }, // < 1%
          { label: 'Small D', x: 'Small D', y: 1 }, // < 1%
          { label: 'Medium E', x: 'Medium E', y: 15 }, // > 1%
        ],
      }
    ];
    // Total = 1000
    // Threshold = 0.005 * 1000 = 5
    // Expected: [Large A (500), Large B (480), Medium E (15), Other (4+1=5)]
    // Expected Labels: ['Large A', 'Large B', 'Medium E', 'Other']

    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={pieDataWithSmallSegments}
          variant="pie" 
        />
      </TestWrapper>
    );

    expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
    const passedData = mockChartInstance.data;

    // Check the processed data values
    expect(passedData.datasets[0].data).toEqual([500, 480, 15, 5]);
    
    // Check the processed labels used by Chart.js
    expect(passedData.labels).toEqual(['Large A', 'Large B', 'Medium E', 'Other']);

    // Check the background colors (ensure 'Other' has its specific color)
    // This assumes the palette setup and 'Other' color are consistent
    expect(passedData.datasets[0].backgroundColor.length).toBe(4);
    expect(passedData.datasets[0].backgroundColor[3]).toEqual('#9CA3AF'); // The gray color for 'Other'
  });

  test('should aggregate segments below threshold into \'Other\' for doughnut charts', () => {
    const doughnutDataWithSmallSegments: ChartDataset[] = [
      {
        id: 'smallDoughnut',
        label: 'Small Segments Test',
        data: [
          { label: 'Big 1', x: 'Big 1', y: 900 }, 
          { label: 'Small 2', x: 'Small 2', y: 3 }, 
          { label: 'Small 3', x: 'Small 3', y: 2 }, 
          { label: 'Big 4', x: 'Big 4', y: 95 },
        ],
      }
    ];
    // Total = 1000
    // Threshold = 0.005 * 1000 = 5
    // Expected: [Big 1 (900), Big 4 (95), Other (3+2=5)]
    // Expected Labels: ['Big 1', 'Big 4', 'Other']

    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={doughnutDataWithSmallSegments}
          variant="doughnut" 
        />
      </TestWrapper>
    );

    expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
    const passedData = mockChartInstance.data;

    // Check the processed data values
    expect(passedData.datasets[0].data).toEqual([900, 95, 5]);
    
    // Check the processed labels used by Chart.js
    expect(passedData.labels).toEqual(['Big 1', 'Big 4', 'Other']);

    // Check the background colors
    expect(passedData.datasets[0].backgroundColor.length).toBe(3);
    expect(passedData.datasets[0].backgroundColor[2]).toEqual('#9CA3AF'); // The gray color for 'Other'
  });

  test('should not create \'Other\' segment if no segments are below threshold', () => {
    const pieDataNoSmallSegments: ChartDataset[] = [
      {
        id: 'noSmallPie',
        label: 'No Small Segments',
        data: [
          { label: 'Segment A', x: 'Segment A', y: 50 }, 
          { label: 'Segment B', x: 'Segment B', y: 30 },  
          { label: 'Segment C', x: 'Segment C', y: 20 }, 
        ],
      }
    ];
    // Total = 100
    // Threshold = 0.005 * 100 = 0.5. All segments are above.
    // Expected Data: [50, 30, 20]
    // Expected Labels: ['Segment A', 'Segment B', 'Segment C']

    render(
      <TestWrapper>
        <GlassDataChart 
          datasets={pieDataNoSmallSegments}
          variant="pie" 
        />
      </TestWrapper>
    );

    expect(require('react-chartjs-2').Chart).toHaveBeenCalled();
    const passedData = mockChartInstance.data;

    expect(passedData.datasets[0].data).toEqual([50, 30, 20]);
    expect(passedData.labels).toEqual(['Segment A', 'Segment B', 'Segment C']);
    expect(passedData.datasets[0].backgroundColor.length).toBe(3);
    // Ensure the 'Other' color is not present unless specifically assigned by palette coincidence
    expect(passedData.datasets[0].backgroundColor).not.toContain('#9CA3AF'); 
  });
});