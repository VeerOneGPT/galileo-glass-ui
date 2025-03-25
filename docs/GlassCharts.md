# GlassCharts: Enhancing Chart Components with the Galileo Glass UI System

**Version 1.2**  |  **Updated: March 2025**

A comprehensive guide to implementing beautiful chart components using the Galileo Glass UI system.

---

## Table of Contents
1. [Overview](mdc:#overview)
2. [Goals & Benefits](mdc:#goals--benefits)
3. [Implementation Notes (May 2024 Update)](mdc:#implementation-notes-may-2024-update)
   - [1. Dynamic Rescaling](mdc:#1-dynamic-rescaling)
   - [2. Aspect Ratio Maintenance](mdc:#2-aspect-ratio-maintenance)
   - [3. Proportional Bar Heights](mdc:#3-proportional-bar-heights)
   - [4. Responsive Adaptability](mdc:#4-responsive-adaptability)
   - [5. Glass UI Integration](mdc:#5-glass-ui-integration)
   - [6. Performance Optimizations](mdc:#6-performance-optimizations)
4. [Implementation Strategy](mdc:#implementation-strategy)
5. [Implementation Best Practices](mdc:#implementation-best-practices)
   - [Coding Patterns](mdc:#coding-patterns)
     - [1. Theme Context Pattern](mdc:#1-theme-context-pattern)
     - [2. CSS Property Handling](mdc:#2-css-property-handling)
     - [3. Modern Animation Pattern](mdc:#3-modern-animation-pattern)
     - [4. Modern Interactive Glass Pattern](mdc:#4-modern-interactive-glass-pattern)
     - [5. Glass Surface Pattern](mdc:#5-glass-surface-pattern)
6. [Animation Implementation Guidelines](mdc:#animation-implementation-guidelines)
   - [1. Accessible Animations for Charts](mdc:#1-accessible-animations-for-charts)
   - [2. Staggered Data Element Animations](mdc:#2-staggered-data-element-animations)
   - [3. Physics-Based Interactions](mdc:#3-physics-based-interactions)
   - [4. Data Transition Animations](mdc:#4-data-transition-animations)
   - [5. Z-Space and Depth Animations](mdc:#5-z-space-and-depth-animations)
   - [6. Animation Performance Optimization](mdc:#6-animation-performance-optimization)
   - [7. Animation Timing Guidelines for Charts](mdc:#7-animation-timing-guidelines-for-charts)
7. [Theme Integration Guidelines](mdc:#theme-integration-guidelines)
   - [1. Theme Context Usage](mdc:#1-theme-context-usage)
   - [2. Theme-Aware Styled Components](mdc:#2-theme-aware-styled-components)
   - [3. Chart Color Palettes](mdc:#3-chart-color-palettes)
   - [4. Theme-Aware Chart Data Elements](mdc:#4-theme-aware-chart-data-elements)
   - [5. Dynamic Theme Switching Support](mdc:#5-dynamic-theme-switching-support)
   - [6. Theme-Aware Typography](mdc:#6-theme-aware-typography)
   - [7. Theme Variant-Specific Customizations](mdc:#7-theme-variant-specific-customizations)
8. [Glass Styling Implementation](mdc:#glass-styling-implementation)
   - [1. Glass Surface for Chart Containers](mdc:#1-glass-surface-for-chart-containers)
   - [2. Interactive Glass Elements](mdc:#2-interactive-glass-elements)
   - [3. Glass Tooltip Implementation](mdc:#3-glass-tooltip-implementation)
   - [4. Glass Axis and Grid Lines](mdc:#4-glass-axis-and-grid-lines)
   - [5. Glass Chart Title Components](mdc:#5-glass-chart-title-components)
   - [6. Glass Line Chart Path](mdc:#6-glass-line-chart-path)
   - [7. Glass Bar Chart Elements](mdc:#7-glass-bar-chart-elements)
   - [8. Implementing Glass Icons in Charts](mdc:#8-implementing-glass-icons-in-charts)
   - [9. Glass Card for Chart Legend](mdc:#9-glass-card-for-chart-legend)
   - [10. Best Practices for Implementing Glass in Charts](mdc:#10-best-practices-for-implementing-glass-in-charts)
9. [Timeline and Resources](mdc:#timeline-and-resources)
   - [Resource Requirements](mdc:#resource-requirements)
   - [Implementation Approach](mdc:#implementation-approach)
   - [Key Success Metrics](mdc:#key-success-metrics)
   - [Required Knowledge and Training](mdc:#required-knowledge-and-training)
   - [Additional Resources](mdc:#additional-resources)
10. [Usage Examples](mdc:#usage-examples)
    - [Basic Chart with GlassChart Component](mdc:#basic-chart-with-glasschart-component)
    - [Responsive Chart with Proper Container](mdc:#responsive-chart-with-proper-container)
    - [Chart with Enhanced Tooltip and Theme Integration](mdc:#chart-with-enhanced-tooltip-and-theme-integration)
    - [Using SimpleChart for Fallback and Simplified Rendering](mdc:#using-simplechart-for-fallback-and-simplified-rendering)
11. [Best Practices for Chart Implementation](mdc:#best-practices-for-chart-implementation)
12. [Troubleshooting Common Issues](mdc:#troubleshooting-common-issues)
    - [Chart Not Rendering Properly](mdc:#chart-not-rendering-properly)
    - [Chart Size Issues](mdc:#chart-size-issues)
    - [Performance Issues](mdc:#performance-issues)
13. [Conclusion](mdc:#conclusion)

---

## Overview
This document presents a comprehensive plan to **update all chart components** in order to fully leverage the Galileo Glass UI/UX system. The goals include achieving visual consistency, enhancing interactivity, ensuring smooth animations, and providing proper theming throughout the chart library.

---

## Goals & Benefits
1. **Visual Consistency**  
   Apply glass morphism styling uniformly across all chart components.

2. **Enhanced Interactivity**  
   Ensure proper glass hover and active states for all interactive elements.

3. **Smooth Animations**  
   Integrate physics-based, accessible animations for every transition within the charts.

4. **Theme Integration**  
   Guarantee consistent behavior and appearance in different theme variants and color modes.

5. **Accessibility**  
   Respect user preferences for reduced motion and improve overall accessibility compliance.

6. **Performance**  
   Optimize glass effects based on device capabilities, ensuring smooth rendering.

7. **Z-Space Layering**  
   Provide depth perception with a consistent z-index hierarchy across components.

---

## Implementation Notes (March 2025 Update)

### Recent Enhancements (March 2025)
- **Full Glass UI Compliance**: All chart components now fully implement the Galileo Glass UI system using the options-based API pattern.
- **Improved Theme Context**: Added proper theme context propagation to all Glass mixins for consistent styling.
- **Enhanced Accessibility**: All animations now properly respect user preferences for reduced motion.
- **Z-Space Layering**: Implemented consistent z-space layering for proper depth perception.
- **Performance Optimizations**: Added React.memo and useMemo for better rendering performance.
- **Fixed CSS Property Handling**: All styled-components now use kebab-case for CSS properties.
- **SimpleChart Fallback**: Enhanced fallback component for performance-constrained scenarios.
- **EnhancedGlassTabs**: Added high-contrast, accessibility-focused tab component for chart navigation.

## Implementation Notes

### 1. Dynamic Rescaling
- **Automatic Axis Scaling**: Charts automatically adjust scale based on data range to remove manual configuration.  
- **Vertical Space Optimization**: The Y-axis adapts to the highest value while maintaining clarity for smaller values.  
- **Graceful Spacing**: A 10% padding ensures data points are not cut off.  
- **Intelligent Tick Counting**: Automatic tick counts based on vertical space.  
- **Numeric Value Formatting**: Large numbers are now formatted with suffixes (K, M, etc.).

### 2. Aspect Ratio Maintenance
- **maintainAspectRatio: false**  
  Ensures charts respect container dimensions without distortion.  
- **ResizeObserver Integration**  
  Automatically refreshes charts on container dimension changes.  
- **Responsive Rebuilding**  
  Charts completely rebuild with optimal proportions upon resizing.  
- **Window Resize Handling**  
  Global resize event handling with debouncing for performance.  
- **Container-Based Sizing**  
  Charts use 100% of the container’s width and height.

### 3. Proportional Bar Heights
- **Data-Driven Scaling**  
  Bar heights are proportionate to their data values for clear visual accuracy.  
- **Minimum Bar Visibility**  
  Even small values have a visible minimum height.  
- **Proper Spacing Control**  
  Implemented `barPercentage` and `categoryPercentage` for optimal spacing.  
- **Equal Distribution**  
  Bars are evenly spaced across the chart width.  
- **Consistent Border Radius**  
  A 4px border radius aligns bars with the Glass UI aesthetic.

### 4. Responsive Adaptability
- **Container-Aware Rendering**  
  Charts seamlessly resize for different screen sizes and container dimensions.  
- **Dynamic Font Sizing**  
  Labels and tick marks scale with available space.  
- **Mobile Optimization**  
  Larger touch targets, minimized visual noise on smaller screens.  
- **Viewport-Aware Layout**  
  Chart elements reposition based on available space.  
- **Quality-Tiered Rendering**  
  Adjusts visual complexity based on device capabilities.

### 5. Glass UI Integration
- **GlassChart Component**  
  A dedicated component ensuring proper theme integration.  
- **Dynamic Theme Context**  
  Charts inherit and apply theme context for consistent styling.  
- **Theme-Aware Colors**  
  Automatic adaptation to the current theme variant/color mode.  
- **Glass Tooltip**  
  New morphism-based tooltips with proper backdrop-filter and transparency.  
- **Accessible Animations**  
  Animations respect user preferences for reduced motion.

### 6. Performance Optimizations
- **Device Capability Detection**  
  Dynamically adjusts rendering quality to the device’s specifications.  
- **Quality Tiers**  
  Offers high, medium, low, and minimal quality tiers.  
- **Battery Optimization**  
  Reduced animation complexity on battery-constrained devices.  
- **Render Optimization**  
  Efficient rendering paths for charts with large data sets.  
- **Memory Management**  
  Improved chart instance cleanup to prevent memory leaks.

---

## Implementation Strategy
1. **Start with a Proof of Concept**  
   - Implement in a single component (e.g., `ChartContent.tsx`)  
   - Validate design, performance, and theming  
   - Document approach for future components

2. **Incremental Implementation**  
   - Tackle one component category at a time  
   - Create reusable glass styling hooks and utilities  
   - Test thoroughly across themes and color modes

3. **Progressive Enhancement**  
   - Begin with base glass styling  
   - Add animations next  
   - Enhance interactivity last  
   - Ensure graceful degradation for constrained environments

---

## Implementation Best Practices

### Coding Patterns

#### 1. Theme Context Pattern
```tsx
import { ThemeContext } from 'styled-components';
import { createThemeContext } from '../../design/core';

const GlassComponent = () => {
  const theme = useContext(ThemeContext);
  const themeContext = createThemeContext(theme);

  return (
    <StyledComponent $themeContext={themeContext} />
  );
};
```

#### 2. CSS Property Handling
```tsx
import { cssWithKebabProps } from '../../design/core/cssUtils';

// ✅ CORRECT: Use kebab-case or the helper for CSS properties
const StyledComponent = styled.div`
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background-color: white;
  border-radius: 8px;
`;

const StyledComponent2 = styled.div`
  ${cssWithKebabProps`
    boxShadow: 0 0 10px rgba(0, 0, 0, 0.5);
    backgroundColor: white;
    borderRadius: 8px;
  `}
`;

// ❌ INCORRECT: CamelCase in styled-components causes runtime errors
const StyledComponent3 = styled.div`
  boxShadow: 0 0 10px rgba(0, 0, 0, 0.5); // Error!
  backgroundColor: white;               // Error!
  borderRadius: 8px;                   // Error!
`;
```

**CRITICAL NOTE**: Using camelCase instead of kebab-case for CSS properties in styled-components template literals will cause runtime errors. Always use kebab-case (e.g., `background-color`, not `backgroundColor`) or use the `cssWithKebabProps` helper if you prefer writing in camelCase.

#### 3. Modern Animation Pattern
```tsx
import { accessibleAnimation } from '../../design/animations/presets/accessibleAnimations';
import { fadeIn, reducedFadeIn } from '../../design/animations/keyframes/basic';

const AnimatedComponent = styled.div`
  ${props => accessibleAnimation({
    animation: fadeIn,
    reducedMotionAnimation: reducedFadeIn,
    duration: 0.3,
    easing: 'ease-out',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

#### 4. Modern Interactive Glass Pattern
```tsx
import { interactiveGlass } from '../../design/mixins/interaction/interactiveGlass';
import { createThemeContext } from '../../design/core/themeUtils';

const InteractiveElement = styled.div<{ theme: any }>`
  ${props => interactiveGlass({
    variant: 'primary',
    feedback: 'all',
    glowColor: 'primary',
    depth: 2,
    themeContext: createThemeContext(props.theme)
  })}
`;
```

#### 5. Glass Surface Pattern
```tsx
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
import { createThemeContext } from '../../design/core/themeUtils';

const GlassCard = styled.div<{ theme: any }>`
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  padding: 24px;
  border-radius: 12px;
`;
```

---

## Animation Implementation Guidelines
When adding animations to chart components, ensure accessibility, performance, and consistency with Galileo Glass UI.

### 1. Accessible Animations for Charts
```tsx
import { accessibleAnimation } from '../../design/animations/presets/accessibleAnimations';
import { fadeIn, reducedFadeIn } from '../../design/animations/keyframes/basic';
import { createThemeContext } from '../../design/core/themeUtils';

const AnimatedChartContent = styled.div<{ theme: any }>`
  ${props => accessibleAnimation({
    animation: fadeIn,
    reducedMotionAnimation: reducedFadeIn,
    duration: 0.4,
    easing: 'ease-out',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

### 2. Staggered Data Element Animations
```tsx
import { createStaggered } from '../../design/animations/presets/staggeredAnimations';
import { slideInBottom } from '../../design/animations/keyframes/motion';
import { createThemeContext } from '../../design/core/themeUtils';

const ChartDataPoint = styled.circle<{ theme: any; index: number }>`
  ${props => createStaggered({
    animation: slideInBottom,
    index: props.index,
    baseDelay: 0.1,
    staggerDelay: 0.03,
    duration: 0.4,
    easing: 'standardSpring',
    themeContext: createThemeContext(props.theme)
  })}
`;
```

### 3. Physics-Based Interactions
```tsx
import { useMousePhysics } from '../../design/animations/hooks/useMousePhysics';
import { physicsPresets } from '../../design/physicsAnimations';

function InteractiveChartElement({ data, index }) {
  const {
    elementRef,
    style,
    ...eventHandlers
  } = useMousePhysics({
    strength: 0.3,
    radius: 100,
    scale: 1.05,
    ...physicsPresets.responsive,
    enableGlow: true,
    glowColor: 'primary',
    glowIntensity: 'medium'
  });

  return (
    <ChartElement
      ref={elementRef}
      style={style}
      data={data}
      {...eventHandlers}
    />
  );
}
```

### 4. Data Transition Animations
```tsx
import { animate } from '../../design/animations/presets/accessibleAnimations';
import { createTransition } from '../../design/animations/utils/transitions';
import { createThemeContext } from '../../design/core/themeUtils';

const ChartBar = styled.rect<{ theme: any; height: number; previousHeight: number }>`
  ${props => createTransition({
    properties: ['height', 'y', 'fill'],
    duration: 0.5,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    themeContext: createThemeContext(props.theme)
  })}

  height: ${props => props.previousHeight}px;
  y: ${props => 200 - props.previousHeight}px;

  &.transition-active {
    height: ${props => props.height}px;
    y: ${props => 200 - props.height}px;
  }
`;
```

### 5. Z-Space and Depth Animations
```tsx
import { useZSpaceAnimation } from '../../design/animations/dimensional/ZSpaceAnimation';
import { ZSpaceLayer } from '../../design/animations/dimensional/types';

function ChartTooltip({ isVisible, content, position }) {
  const { animate, styles } = useZSpaceAnimation({
    fromLayer: ZSpaceLayer.CONTENT,
    toLayer: ZSpaceLayer.FLOATING,
    trajectory: 'forward',
    atmosphericFog: true,
    depthShadows: true
  });

  useEffect(() => {
    if (isVisible) {
      animate();
    }
  }, [isVisible, animate]);

  if (!isVisible) return null;

  return (
    <TooltipContainer style={{ ...styles, left: position.x, top: position.y }}>
      {content}
    </TooltipContainer>
  );
}
```

### 6. Animation Performance Optimization
```tsx
import { useOptimizedAnimation } from '../../design/animations/hooks/useOptimizedAnimation';
import { slideInBottom } from '../../design/animations/keyframes/motion';

function PerformanceOptimizedChart({ data, isVisible }) {
  const { animationProps, shouldAnimate } = useOptimizedAnimation({
    animation: slideInBottom,
    duration: 0.5,
    easing: 'standardSpring',
    reducedMotionAlternative: 'opacity',
    qualityTierAdjustments: true,
    disabled: !isVisible
  });

  return (
    <div style={shouldAnimate ? animationProps : undefined}>
      {/* Chart content */}
    </div>
  );
}
```

### 7. Animation Timing Guidelines for Charts

| Chart Element    | Recommended Duration | Examples                                      |
|------------------|----------------------|-----------------------------------------------|
| Chart Container  | 400-500ms           | Main chart reveal, container fade in          |
| Axes & Labels    | 300-400ms           | Axes drawing, label fade in                   |
| Data Elements    | 500-700ms           | Bar rise, line drawing, point reveal          |
| Data Staggering  | 30-50ms per element | Staggered bar reveal, sequential point appearance |
| Interactions     | 150-250ms           | Hover effects, selection highlight            |
| Data Updates     | 300-500ms           | Transitions for data changes                  |

---

## Theme Integration Guidelines
Ensuring proper theme integration allows charts to adapt to various theme variants, color modes, and user preferences.

### 1. Theme Context Usage
```tsx
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { createThemeContext } from '../../design/core/themeUtils';

const ChartComponent = () => {
  const theme = useContext(ThemeContext);
  const themeContext = createThemeContext(theme);

  const chartColors = {
    primary: theme.colors[theme.variant].primary,
    secondary: theme.colors[theme.variant].secondary,
    background: theme.isDarkMode
      ? 'rgba(30, 30, 34, 0.85)'
      : 'rgba(255, 255, 255, 0.85)'
  };

  return (
    <StyledChartContainer $themeContext={themeContext}>
      {/* Chart content using chartColors */}
    </StyledChartContainer>
  );
};
```

### 2. Theme-Aware Styled Components
```tsx
import styled from 'styled-components';
import { glassSurface } from '../../design/mixins/surfaces';

const StyledChartContainer = styled.div<{ $themeContext: any }>`
  ${props => glassSurface({
    depth: 2,
    variant: 'standard',
    intensity: 'medium',
    themeContext: props.$themeContext
  })}

  color: ${props => props.theme.colors.text.primary};

  background-color: ${props => props.theme.isDarkMode 
    ? 'rgba(30, 30, 34, 0.5)' 
    : 'rgba(255, 255, 255, 0.7)'
  };
`;
```

### 3. Chart Color Palettes
```tsx
import { useGlassTheme } from '../../design/GlassThemeProvider';

const useChartColorPalette = (numColors = 5) => {
  const {
    currentTheme,
    isDarkMode,
    themeVariant
  } = useGlassTheme();

  const getSequentialColors = () => {
    const baseColor = currentTheme.colors[themeVariant].primary;
    return generateSequentialPalette(baseColor, numColors, isDarkMode);
  };

  const getCategoricalColors = () => {
    return [
      currentTheme.colors[themeVariant].primary,
      currentTheme.colors[themeVariant].secondary,
      currentTheme.colors.accent.success,
      currentTheme.colors.accent.info,
      currentTheme.colors.accent.warning,
      ...generateAdditionalColors(themeVariant, numColors - 5)
    ];
  };

  return {
    sequential: getSequentialColors(),
    categorical: getCategoricalColors(),
    isDarkMode
  };
};
```

### 4. Theme-Aware Chart Data Elements
```tsx
const ChartAxis = styled.line`
  stroke: ${props => props.theme.isDarkMode
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.2)'
  };
  stroke-width: 1;
`;

const AxisTick = styled.text`
  fill: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  font-family: ${props => props.theme.typography.fontFamily};
`;

const DataPoint = styled.circle<{ $dataIndex: number }>`
  fill: ${props => {
    const colors = useChartColorPalette().categorical;
    return colors[props.$dataIndex % colors.length];
  }};

  &:hover {
    stroke: ${props => props.theme.colors[props.theme.variant].primary};
    stroke-width: 2;
  }
`;
```

### 5. Dynamic Theme Switching Support
```tsx
import { useEffect } from 'react';
import { useGlassTheme } from '../../design/GlassThemeProvider';

const ResponsiveChart = ({ data }) => {
  const { isDarkMode, themeVariant, onThemeChange } = useGlassTheme();

  useEffect(() => {
    updateChartAppearance(isDarkMode, themeVariant);
  }, [isDarkMode, themeVariant]);

  useEffect(() => {
    const unsubscribe = onThemeChange((newTheme) => {
      console.log('Theme changed, updating chart:', newTheme);
      // Additional logic here
    });
    return () => unsubscribe();
  }, [onThemeChange]);

  return (
    <ChartContainer>
      {/* Chart implementation */}
    </ChartContainer>
  );
};
```

### 6. Theme-Aware Typography
```tsx
import { GlassTypography } from '../../components/Glass';

const ChartTitle = ({ title, subtitle }) => {
  return (
    <TitleContainer>
      <GlassTypography variant="h5" component="h2">
        {title}
      </GlassTypography>
      
      {subtitle && (
        <GlassTypography 
          variant="subtitle1"
          color="textSecondary"
          style={{ marginTop: '4px' }}
        >
          {subtitle}
        </GlassTypography>
      )}
    </TitleContainer>
  );
};
```

### 7. Theme Variant-Specific Customizations
```tsx
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';

const useChartCustomizations = () => {
  const theme = useContext(ThemeContext);

  const getChartCustomizations = () => {
    switch (theme.variant) {
      case 'nebula':
        return {
          gradientStart: theme.colors.nebula.primary,
          gradientEnd: theme.colors.nebula.secondary,
          accentColor: theme.colors.accent.info
        };
      case 'cosmic':
        return {
          gradientStart: theme.colors.cosmic.primary,
          gradientEnd: theme.colors.cosmic.secondary,
          accentColor: theme.colors.accent.purple
        };
      case 'aurora':
        return {
          gradientStart: theme.colors.aurora.primary,
          gradientEnd: theme.colors.aurora.secondary,
          accentColor: theme.colors.accent.success
        };
      case 'frost':
        return {
          gradientStart: theme.colors.frost.primary,
          gradientEnd: theme.colors.frost.secondary,
          accentColor: theme.colors.accent.info
        };
      case 'celestial':
        return {
          gradientStart: theme.colors.celestial.primary,
          gradientEnd: theme.colors.celestial.secondary,
          accentColor: theme.colors.accent.warning
        };
      default:
        return {
          gradientStart: theme.colors.nebula.primary,
          gradientEnd: theme.colors.nebula.secondary,
          accentColor: theme.colors.accent.info
        };
    }
  };

  return {
    ...getChartCustomizations(),
    isDarkMode: theme.isDarkMode,
    variant: theme.variant
  };
};
```

---

## Glass Styling Implementation
Use these guidelines to incorporate the Galileo Glass look and feel into chart components.

### 1. Glass Surface for Chart Containers
```tsx
import styled from 'styled-components';
import { glassSurface } from '../../design/mixins/surfaces';
import { createThemeContext } from '../../design/core/themeUtils';

const GlassChartContainer = styled.div<{ $depth?: 1 | 2 | 3 | 4; theme: any }>`
  ${props => glassSurface({
    depth: props.$depth || 2,
    variant: 'standard',
    intensity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}

  border-radius: 12px;
  padding: 24px;
  width: 100%;
  height: 100%;

  background-color: ${props => props.theme.isDarkMode 
    ? 'rgba(30, 30, 34, 0.5)' 
    : 'rgba(255, 255, 255, 0.7)'
  };
`;
```

### 2. Interactive Glass Elements
```tsx
import { interactiveGlass } from '../../design/mixins/interactions';
import { glassGlow } from '../../design/mixins/effects/glowEffects';

const GlassDataPoint = styled.circle<{ 
  $interactive?: boolean; 
  $color: string;
  theme: any;
}>`
  fill: ${props => props.$color};
  r: 6;
  transition: r 0.2s ease;

  ${props => props.$interactive && interactiveGlass({
    themeContext: createThemeContext(props.theme),
    hoverScale: 1.15,
    activeScale: 0.95
  })}

  &:hover {
    ${props => glassGlow({
      color: 'primary',
      intensity: 'medium',
      themeContext: createThemeContext(props.theme)
    })}
    r: 8;
  }
`;
```

### 3. Glass Tooltip Implementation
```tsx
import { glassSurface } from '../../design/mixins/surfaces';
import { innerGlow } from '../../design/mixins/depth/innerEffects';
import { edgeHighlight } from '../../design/mixins/effects/edgeEffects';

const GlassTooltip = styled.div<{ theme: any }>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    return glassSurface({
      depth: 3,
      variant: 'clean',
      intensity: 'medium',
      themeContext
    });
  }}

  ${props => innerGlow({
    color: 'primary',
    intensity: 'subtle',
    spread: 5,
    themeContext: createThemeContext(props.theme)
  })}

  ${props => edgeHighlight({
    position: 'bottom',
    width: 2,
    opacity: 0.8,
    color: 'primary',
    themeContext: createThemeContext(props.theme)
  })}

  border-radius: 8px;
  padding: 12px 16px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid ${props => props.theme.isDarkMode 
      ? 'rgba(30, 30, 34, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)'
    };
  }
`;
```

### 4. Glass Axis and Grid Lines
```tsx
import styled from 'styled-components';

const GlassAxisLine = styled.line`
  stroke: ${props => props.theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(0, 0, 0, 0.2)'
  };
  stroke-width: 1;
  shape-rendering: crispEdges;
`;

const GlassGridLine = styled.line`
  stroke: ${props => props.theme.isDarkMode 
    ? 'rgba(255, 255, 255, 0.07)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  stroke-width: 0.5;
  stroke-dasharray: 4, 2;
  shape-rendering: crispEdges;
`;
```

### 5. Glass Chart Title Components
```tsx
import styled from 'styled-components';
import { GlassTypography } from '../../components/Glass';
import { innerGlow } from '../../design/mixins/depth/innerEffects';

const GlassTitleContainer = styled.div<{ theme: any }>`
  margin-bottom: 16px;
  position: relative;

  ${props => innerGlow({
    color: 'primary',
    intensity: 'subtle',
    spread: 5,
    position: 'text',
    themeContext: createThemeContext(props.theme)
  })}
`;

const ChartTitleWithGlass = ({ title, subtitle }) => {
  return (
    <GlassTitleContainer>
      <GlassTypography 
        variant="h5" 
        component="h2"
        glow="subtle"
        glowColor="primary"
      >
        {title}
      </GlassTypography>

      {subtitle && (
        <GlassTypography 
          variant="subtitle1"
          color="textSecondary"
          style={{ marginTop: '4px' }}
        >
          {subtitle}
        </GlassTypography>
      )}
    </GlassTitleContainer>
  );
};
```

### 6. Glass Line Chart Path
```tsx
import styled from 'styled-components';
import { radientStroke } from '../../design/mixins/effects/gradientEffects';

const GlassLinePath = styled.path<{ 
  $color: string; 
  $glowIntensity?: 'subtle' | 'medium' | 'strong';
  theme: any 
}>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;

  ${props => radientStroke({
    startColor: props.theme.colors[props.theme.variant].primary,
    endColor: props.theme.colors[props.theme.variant].secondary,
    direction: 'to right',
    themeContext: createThemeContext(props.theme)
  })}

  filter: ${props => {
    switch (props.$glowIntensity) {
      case 'strong':
        return 'drop-shadow(0 0 8px rgba(75, 102, 234, 0.6))';
      case 'medium':
        return 'drop-shadow(0 0 4px rgba(75, 102, 234, 0.4))';
      case 'subtle':
        return 'drop-shadow(0 0 2px rgba(75, 102, 234, 0.2))';
      default:
        return 'none';
    }
  }};
`;
```

### 7. Glass Bar Chart Elements
```tsx
import styled from 'styled-components';
import { glassSurface } from '../../design/mixins/surfaces';
import { innerGlow } from '../../design/mixins/depth/innerEffects';

const GlassBar = styled.rect<{ 
  $color: string;
  $interactive?: boolean;
  $selected?: boolean;
  theme: any;
}>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    const depth = props.$selected ? 3 : 1;

    return glassSurface({
      depth,
      variant: 'clean',
      intensity: 'medium',
      themeContext
    });
  }}

  fill: ${props => props.$color}${props => props.theme.isDarkMode ? '90' : '70'};

  ${props => props.$selected && innerGlow({
    color: 'primary',
    intensity: 'medium',
    spread: 8,
    themeContext: createThemeContext(props.theme)
  })}

  &:hover {
    cursor: ${props => props.$interactive ? 'pointer' : 'default'};
    fill: ${props => props.$color};

    ${props => props.$interactive && !props.$selected && innerGlow({
      color: 'primary',
      intensity: 'subtle',
      spread: 5,
      themeContext: createThemeContext(props.theme)
    })}
  }

  transition: fill 0.3s ease, filter 0.3s ease;
`;
```

### 8. Implementing Glass Icons in Charts
```tsx
import { GlassIcon } from '../../components/Glass';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ChartLegendItem = ({ label, color, showInfo = false }) => {
  return (
    <LegendItemContainer>
      <LegendColorIndicator style={{ backgroundColor: color }} />
      <LegendLabel>{label}</LegendLabel>

      {showInfo && (
        <InfoIconWrapper>
          <GlassIcon
            component={InfoOutlinedIcon}
            fontSize="small"
            color="action"
            glow="subtle"
            glowColor="primary"
          />
        </InfoIconWrapper>
      )}
    </LegendItemContainer>
  );
};
```

### 9. Glass Card for Chart Legend
```tsx
import styled from 'styled-components';
import { glassSurface } from '../../design/mixins/surfaces';

const GlassLegendCard = styled.div<{ theme: any }>`
  ${props => glassSurface({
    depth: 1,
    variant: 'clean',
    intensity: 'subtle',
    themeContext: createThemeContext(props.theme)
  })}

  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChartLegend = ({ items }) => {
  return (
    <GlassLegendCard>
      {items.map((item, index) => (
        <ChartLegendItem
          key={index}
          label={item.label}
          color={item.color}
          showInfo={item.hasInfo}
        />
      ))}
    </GlassLegendCard>
  );
};
```

### 10. Best Practices for Implementing Glass in Charts
1. **Layer Depth Consistency**  
   - Chart containers: Depth 2  
   - Tooltips/popovers: Depth 3  
   - Data elements: Depth 1  
   - Selected/active elements: Depth 2-3  

2. **Surface Type Selection**  
   - Data visualization containers: `standard` or `clean` variant  
   - Tooltips/detail panels: `frosted` variant  
   - Background elements: `subtle` intensity  
   - Interactive elements: `medium` intensity  

3. **Glass Effects Hierarchy**  
   - Base containers: `glassSurface` only  
   - Important data points: `glassSurface + innerGlow`  
   - Interactive elements: `glassSurface + interactiveGlass + glassGlow`  
   - Featured elements: Add `edgeHighlight` or `borderGlow`  

4. **Performance Considerations**  
   - Limit effect complexity for large data sets (>100 elements)  
   - Use adaptive quality for lower-performance devices  
   - Precompute glass styles for repeated elements  
   - Avoid nesting glass effects on very small elements  

5. **Color Mode Adaptations**  
   - Increase transparency in dark mode  
   - Reduce glow intensity in light mode  
   - Adjust stroke widths and contrasts to match color modes  

---

## Timeline and Resources

### Resource Requirements
1. **Development & Design**  
   - A dedicated team familiar with both chart libraries and the Galileo Glass system  
   - Close collaboration between design, dev, and QA  

2. **Testing & Validation**  
   - Automated tests for accessibility, performance, and regression  
   - Cross-platform, cross-browser testing setups  

3. **Documentation and Enablement**  
   - Updated component storybook examples  
   - Documentation of the new Glass Chart API and props  
   - Implementation examples for multiple use cases

### Implementation Approach
1. **Start with Proof of Concept**  
   - Implement and validate in a single chart component  
   - Gather feedback from design and performance teams  

2. **Incremental Implementation**  
   - Update components category-by-category  
   - Reuse glass styling hooks, mixins, and best practices  

3. **Progressive Enhancement**  
   - Implement core glass styling  
   - Add animations and interactive effects  
   - Leverage adaptive quality for performance  

### Key Success Metrics
1. **Visual Consistency**  
   - Uniform look and feel across all chart components  
   - Smooth transitions between themes  

2. **Performance Benchmarks**  
   - <100ms render time for simple charts  
   - ~45fps or more on mid-tier devices  
   - <15% additional memory usage vs. non-glass components  

3. **Accessibility Compliance**  
   - Animations respect reduced motion  
   - WCAG 2.1 AA color contrast compliance  
   - Maintained keyboard navigation and screen reader support  

### Required Knowledge and Training
- **Galileo Glass UI/UX Framework**  
  - [GalileoGlass.md](mdc:../../GalileoGlass.md)
- **Animation System**  
  - [Animation System Documentation](mdc:../../design/animations/README.md)
- **Theme Provider**  
  - [Theme Provider Documentation](mdc:../../design/ThemeProvider.md)
- **Performance Optimization**  
  - [Performance Optimization Guide](mdc:../../docs/performance.md)

### Additional Resources
- [GalileoGlass.md](mdc:../../GalileoGlass.md) – Complete Glass UI framework documentation  
- [Animation System Documentation](mdc:../../design/animations/README.md) – Architecture and examples  
- [Theme Provider Documentation](mdc:../../design/ThemeProvider.md) – Theming system guide  
- [Performance Optimization Guide](mdc:../../docs/performance.md) – Best practices for efficient rendering  

---

## Usage Examples

### Basic Chart with GlassChart Component
```tsx
import React from 'react';
import { GlassChart } from '../../components/Charts';

const LineChartExample = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#4B66EA',
        backgroundColor: 'rgba(75, 102, 234, 0.2)',
      }
    ]
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <GlassChart
        data={data}
        type="line"
        isDark={false}
        showLegend={true}
        fillArea={true}
        showPoints={true}
      />
    </div>
  );
};
```

### Responsive Chart with Proper Container
```tsx
import React from 'react';
import styled from 'styled-components';
import { GlassChart } from '../../components/Charts';
import { GlassCard } from '../../components/Glass';

const ChartContainer = styled(GlassCard)`
  height: 400px;
  width: 100%;
  padding: 0;
  overflow: visible;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const ResponsiveChartExample = ({ data, isDark }) => {
  return (
    <ChartContainer>
      <GlassChart
        data={data}
        type="bar"
        isDark={isDark}
        showLegend={true}
        height="100%"
        width="100%"
      />
    </ChartContainer>
  );
};
```

### Chart with Enhanced Tooltip and Theme Integration
```tsx
import React from 'react';
import { useTheme } from 'styled-components';
import { GlassChart } from '../../components/Charts';
import { createThemeContext } from '../../design/core/themeUtils';

const ThemeAwareChart = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const themeContext = createThemeContext(theme);

  const chartColors = {
    primary: theme.colors[theme.variant].primary,
    secondary: theme.colors[theme.variant].secondary,
  };

  const themedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: index === 0 ? chartColors.primary : chartColors.secondary,
      backgroundColor: index === 0
        ? `${chartColors.primary}40`
        : `${chartColors.secondary}40`
    }))
  };

  return (
    <GlassChart
      data={themedData}
      type="line"
      isDark={isDarkMode}
      showLegend={true}
      fillArea={true}
      showPoints={true}
      theme={theme}
    />
  );
};
```

### Using SimpleChart for Fallback and Simplified Rendering
```tsx
import React from 'react';
import SimpleChart from '../../components/Charts/ChartFix';

const SimplifiedChartExample = ({ data, isDark, theme }) => {
  return (
    <SimpleChart
      data={data}
      isDark={isDark}
      type="line"
      showLegend={true}
      fillArea={true}
      showPoints={true}
      height={300}
      width="100%"
      theme={theme} // Important: Always pass theme for proper Glass UI styling
    />
  );
};
```

**Note**: The SimpleChart component provides a performance-optimized fallback with proper Glass UI styling. It uses React.memo and includes proper theme context handling, reduced motion detection, and all fixes for CSS property handling. Always pass the theme object to ensure consistent styling with the rest of your application.

---

## Best Practices for Chart Implementation
1. **Container-Based Sizing**  
   - Give the chart container an explicit height  
   - Use 100% width/height for the chart itself  

2. **Essential Theme Integration**  
   - Pass the theme object to chart components  
   - Ensure theme-aware colors for all chart elements  

3. **Proper Data Updates**  
   - Force chart rebuilds when data changes  
   - Use memoization for heavy data transforms  
   - Show loading states where needed  

4. **Performance Optimization**  
   - Limit data point count for small screens  
   - Use simpler chart types for dense data sets  
   - Employ fallback or `SimpleChart` for complex scenarios  

5. **Accessibility**  
   - Provide aria-labels or descriptive text for charts  
   - Test with screen readers and keyboard-only navigation  
   - Use high-contrast color pairs when needed  

---

## Troubleshooting Common Issues

### Chart Not Rendering Properly
1. **Check container dimensions** – The container must have an explicit height.  
2. **Verify data structure** – Ensure the data object follows the required format.  
3. **Fallback to SimpleChart** – Use `SimpleChart` if issues persist.  
4. **Browser console** – Investigate errors or warnings.  
5. **Theme integration** – Confirm theme props are correctly passed.

### Chart Size Issues
1. **Explicit container dimensions** – Always set a specific height on the container.  
2. **Use `width="100%"` and `height="100%"`** – Let the chart fill its container.  
3. **Check for overflow** – Parent containers might be clipping the chart.  
4. **Responsive breakpoints** – Adjust container height at various screen sizes.  
5. **ResizeObserver** – Implement manual monitoring if needed.

### Performance Issues
1. **Reduce data points** – Large datasets can slow rendering and animations.  
2. **Simplify chart type** – Bar or simple line charts perform better than complex ones.  
3. **Prevent excessive re-renders** – Utilize `React.memo` and stable data references.  
4. **Disable animations** – Consider reduced-motion or performance detection toggles.  
5. **Server-side rendering** – Pre-render static charts when possible.

---

## Conclusion
By integrating the Galileo Glass UI system into chart components, you gain a premium and consistent user experience. These enhancements—ranging from glass morphism styling and responsive design to accessible animations and theme integration—elevate the visual appeal, interactivity, and reliability of data visualization offerings.

---

*Galileo Glass UI v1.0 • MIT License*