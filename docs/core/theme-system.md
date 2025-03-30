# ThemeProvider Implementation Guide - Galileo Glass UI

This comprehensive guide covers the ThemeProvider implementation in the Galileo Glass UI system, explaining different theme context patterns and best practices.

**IMPORTANT: Galileo Glass UI is a fully independent, custom-built UI/UX system. The ThemeProvider is a custom implementation built specifically for the Glass design system.**

## Table of Contents

1. [ThemeProvider Architecture](mdc:#1-themeprovider-architecture)
2. [Basic Implementation Patterns](mdc:#2-basic-implementation-patterns)
3. [Context Patterns for Different Scenarios](mdc:#3-context-patterns-for-different-scenarios)
4. [Performance Considerations](mdc:#4-performance-considerations)
5. [Advanced Patterns and Techniques](mdc:#5-advanced-patterns-and-techniques)
6. [Troubleshooting Common Issues](mdc:#6-troubleshooting-common-issues)

---

## 1. ThemeProvider Architecture

The ThemeProvider in Galileo Glass UI is built on a sophisticated multi-context architecture designed for maximum performance and flexibility.

### Core Architecture Components

```
┌─────────────────────────────────────────┐
│             ThemeProvider               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐      ┌──────────────┐  │
│  │ ColorMode   │      │ ThemeVariant │  │
│  │ Context     │      │ Context      │  │
│  └─────────────┘      └──────────────┘  │
│                                         │
│  ┌─────────────┐      ┌──────────────┐  │
│  │ StyleUtils  │      │ GlassEffects │  │
│  │ Context     │      │ Context      │  │
│  └─────────────┘      └──────────────┘  │
│                                         │
│  ┌─────────────┐      ┌──────────────┐  │
│  │ Responsive  │      │ Preferences  │  │
│  │ Context     │      │ Context      │  │
│  └─────────────┘      └──────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Key Components

1. **UnifiedThemeProvider**: The core implementation that manages all theme state
2. **ThemeProvider**: A memoized wrapper with presence tracking 
3. **ThemeTransition**: Handles smooth transitions between theme variants
4. **ThemePerformanceMonitor**: Monitors and optimizes theme-related performance
5. **GlassContext**: Manages glass-specific theme settings and adaptations
6. **ColorModeContext**: Manages dark/light mode states
7. **ThemeVariantContext**: Manages theme variants (nebula, cosmic, etc.)
8. **StyleUtilsContext**: Provides memoized style utility functions
9. **GlassEffectsContext**: Manages glass-specific styling utilities
10. **PreferencesContext**: Handles user preferences including accessibility options
11. **ResponsiveContext**: Manages responsive breakpoints and media queries

### Core API

```tsx
<ThemeProvider
  initialTheme="nebula"            // Initial theme variant
  initialColorMode="dark"          // Initial color mode
  enableAutoDetection={true}       // Auto-detect OS preferences
  respectSystemPreference={true}   // Respect system dark mode
  forceColorMode={undefined}       // Force specific color mode
  disableTransitions={false}       // Disable transitions (for performance)
  enableScrollOptimization={true}  // Optimize glass effects on scroll
  initialQualityTier="high"        // Initial glass quality setting
>
  <App />
</ThemeProvider>
```

## 2. Basic Implementation Patterns

### Application Root Pattern

The most common implementation pattern places ThemeProvider at the application root:

```tsx
// src/index.tsx or App.tsx
import { ThemeProvider } from '../../design/ThemeProvider';

function App() {
  return (
    <ThemeProvider 
      initialTheme="nebula"
      initialColorMode="dark"
      respectSystemPreference={true}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Additional routes */}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

### Usage with Other Providers

When using with other context providers, ThemeProvider should typically be the outermost provider:

```tsx
// ✅ RECOMMENDED: ThemeProvider as outermost provider
function App() {
  return (
    <ThemeProvider initialTheme="nebula">
      <ReduxProvider store={store}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppContent />
          </QueryClientProvider>
        </AuthProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}

// ❌ NOT RECOMMENDED: ThemeProvider nested inside other providers
// May cause context issues or unnecessary re-renders
function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider initialTheme="nebula">
        <AppContent />
      </ThemeProvider>
    </ReduxProvider>
  );
}
```

### Accessing Theme in Components

There are several ways to access the theme within components:

```tsx
// 1. Using the useTheme hook (recommended for functional components)
import { useTheme } from '../../design/hooks';

function MyComponent() {
  const { 
    currentTheme,     // Current theme object
    isDark,           // Boolean indicating dark mode
    currentColorMode, // "dark" or "light"
    toggleColorMode,  // Function to toggle dark/light mode
    setTheme          // Function to change theme variant
  } = useTheme();
  
  return (
    <div>
      <p>Current theme: {currentTheme.name}</p>
      <p>Dark mode: {isDark ? 'Yes' : 'No'}</p>
      <button onClick={toggleColorMode}>Toggle Mode</button>
      <button onClick={() => setTheme('cosmic')}>Switch to Cosmic</button>
    </div>
  );
}

// 2. Using specific hooks for granular updates
import { 
  useColorMode, 
  useThemeVariant 
} from '../../design/hooks';

function OptimizedComponent() {
  // Only re-renders when color mode changes
  const { isDark, toggleColorMode } = useColorMode();
  
  // Only re-renders when theme variant changes
  const { currentTheme, setTheme } = useThemeVariant();
  
  return (
    <div>
      <p>Current theme: {currentTheme.name}</p>
      <p>Dark mode: {isDark ? 'Yes' : 'No'}</p>
      <button onClick={toggleColorMode}>Toggle Mode</button>
      <button onClick={() => setTheme('cosmic')}>Switch to Cosmic</button>
    </div>
  );
}

// 3. Using withTheme HOC (for class components)
import { withTheme } from '../../design/withTheme';

class ClassComponent extends React.Component {
  render() {
    const { theme, isDark, toggleColorMode } = this.props;
    
    return (
      <div>
        <p>Current theme: {theme.name}</p>
        <p>Dark mode: {isDark ? 'Yes' : 'No'}</p>
        <button onClick={toggleColorMode}>Toggle Mode</button>
      </div>
    );
  }
}

export default withTheme(ClassComponent);
```

## 3. Context Patterns for Different Scenarios

### Standard Application Flow

For typical applications that respect user preferences:

```tsx
// App.tsx - Standard application with system preference detection
function App() {
  return (
    <ThemeProvider
      initialTheme="nebula"
      respectSystemPreference={true}
      enableScrollOptimization={true}
    >
      <AppContent />
    </ThemeProvider>
  );
}
```

### Marketing Pages (Forced Dark Mode)

For marketing pages that should always use dark mode:

```tsx
// MarketingApp.tsx
function MarketingApp() {
  return (
    <ThemeProvider
      initialTheme="nebula"
      forceColorMode="dark"
      disableTransitions={false}
    >
      <MarketingPages />
    </ThemeProvider>
  );
}
```

### Dashboard with User Preferences

For applications that should store user preferences:

```tsx
// DashboardApp.tsx
function DashboardApp() {
  // Get user preferences from storage or API
  const { theme, colorMode } = useUserPreferences();
  
  // Save preferences when they change
  const handleColorModeChange = (mode) => {
    saveUserPreference('colorMode', mode);
  };
  
  const handleThemeChange = (theme) => {
    saveUserPreference('theme', theme);
  };
  
  return (
    <ThemeProvider
      initialTheme={theme || 'nebula'}
      initialColorMode={colorMode || 'light'}
      onColorModeChange={handleColorModeChange}
      onThemeChange={handleThemeChange}
    >
      <Dashboard />
    </ThemeProvider>
  );
}
```

### Mixed Content Applications

For applications with both marketing and dashboard sections:

```tsx
// MixedApp.tsx - Conditional theming based on route
function MixedApp() {
  // Check if current route is a marketing page
  const isMarketingPage = useIsMarketingPage();
  
  return (
    <ThemeProvider
      initialTheme="nebula"
      forceColorMode={isMarketingPage ? 'dark' : undefined}
      respectSystemPreference={!isMarketingPage}
    >
      <Router>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Router>
    </ThemeProvider>
  );
}

// Helper hook to check current route
function useIsMarketingPage() {
  const location = useLocation();
  const marketingRoutes = ['/', '/about', '/features', '/pricing'];
  
  return marketingRoutes.includes(location.pathname) || 
    !location.pathname.startsWith('/dashboard');
}
```

### Layout Component with Conditional ThemeProvider

For layouts that may need to provide theme context:

```tsx
// MainLayout.tsx
function MainLayout({ children }) {
  // Check if already inside a ThemeProvider
  const hasThemeProvider = useThemeProviderPresence();
  
  if (hasThemeProvider) {
    // Just render content if already in ThemeProvider
    return <MainLayoutContent>{children}</MainLayoutContent>;
  }
  
  // Provide theme context if not already available
  return (
    <ThemeProvider initialTheme="nebula" initialColorMode="dark">
      <MainLayoutContent>{children}</MainLayoutContent>
    </ThemeProvider>
  );
}

// ThemeProviderPresence hook implementation
function useThemeProviderPresence() {
  try {
    // This will throw if not in a ThemeProvider
    useTheme();
    return true;
  } catch (e) {
    return false;
  }
}
```

### Isolated Theme Section

For components that need a different theme from the rest of the app:

```tsx
// IsolatedThemeSection.tsx
function IsolatedThemeSection() {
  // Get parent theme info
  const parentTheme = useTheme();
  
  // Create isolated section with different theme
  return (
    <div className="isolated-section">
      <ThemeProvider
        initialTheme="cosmic" // Different from parent
        forceColorMode="light" // Different from parent
        disableTransitions={true} // Prevent transition flicker on mount
      >
        <IsolatedContent />
      </ThemeProvider>
      
      {/* Return to parent theme after isolated section */}
      <div className="back-to-parent">
        <RegularContent />
      </div>
    </div>
  );
}
```

## 4. Performance Considerations

### Preventing Unnecessary Re-renders

The ThemeProvider uses several optimizations to prevent unnecessary re-renders:

1. **Context Splitting**: Multiple contexts to prevent full-tree re-renders
2. **Memoization**: Extensive use of useMemo to prevent recalculation
3. **Controlled Updates**: Only update components that need specific context

```tsx
// Example of optimized consuming component
function OptimizedComponent() {
  // Only re-renders when color mode changes
  const { isDark } = useColorMode();
  
  // Only re-renders when these specific theme values change
  const { spacing, typography } = useThemeValues(['spacing', 'typography']);
  
  // Will not re-render when other theme values change
  return (
    <div style={{ margin: spacing.md }}>
      <p style={{ fontFamily: typography.fontFamily }}>
        {isDark ? 'Dark' : 'Light'} mode
      </p>
    </div>
  );
}
```

### Theme Context in Styled Components

When using theme values in styled-components, use the `createThemeContext` utility:

```tsx
import { createThemeContext } from '../../design/core/themeUtils';

const StyledCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  
  // More efficient for complex operations:
  ${props => {
    // Create lightweight theme context just once
    const themeContext = createThemeContext(props.theme);
    
    return `
      color: ${themeContext.colors.text};
      border: 1px solid ${themeContext.colors.border};
      box-shadow: ${themeContext.shadows.small};
    `;
  }}
`;
```

### Using the ThemeObserver Pattern

For components that need theme changes without re-rendering:

```tsx
import { useThemeObserver } from '../../design/hooks';

function ThemeAwareCanvas() {
  const canvasRef = useRef(null);
  
  // Subscribe to theme changes without re-rendering
  useThemeObserver((newTheme, isDark) => {
    // Update canvas directly without component re-render
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      // Redraw canvas...
    }
  });
  
  return <canvas ref={canvasRef} width={400} height={300} />;
}
```

### Performance Monitoring

Enable performance monitoring during development:

```tsx
// App.tsx (development)
function App() {
  return (
    <ThemeProvider 
      initialTheme="nebula"
      debug={process.env.NODE_ENV === 'development'}
      performanceMonitoring={true}
    >
      <AppContent />
      
      {process.env.NODE_ENV === 'development' && (
        <ThemePerformanceMonitor position="bottom-right" />
      )}
    </ThemeProvider>
  );
}
```

## 5. Advanced Patterns and Techniques

### Theme Context Pattern for Glass Components

Glass components should use the `createThemeContext` utility for optimal performance:

```tsx
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
import { createThemeContext } from '../../design/core/themeUtils';

const GlassCard = styled.div`
  ${props => {
    // Create lightweight context
    const themeContext = createThemeContext(props.theme);
    
    // Pass context to glass mixins
    return glassSurface({
      elevation: 2,
      blurStrength: 'standard',
      themeContext
    });
  }}
`;
```

### Forced Dark Mode Pattern

For components that should always use dark mode regardless of global theme:

```tsx
import { glassSurface } from '../../design/mixins/surfaces/glassSurface';
import { createThemeContext } from '../../design/core/themeUtils';

const AlwaysDarkGlassCard = styled.div`
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    isDarkMode: true,  // Force dark mode
    themeContext: createThemeContext(props.theme, true)  // Force dark in context
  })}
`;
```

### URL-Based Theme Pattern

For applications that need different themes based on URL:

```tsx
function URLAwareThemeProvider({ children }) {
  const location = useLocation();
  
  // Determine if current route should be dark mode
  const shouldForceDarkMode = useMemo(() => {
    const marketingRoutes = ['/', '/about', '/features'];
    return marketingRoutes.includes(location.pathname);
  }, [location.pathname]);
  
  // Get stored user preference
  const storedTheme = localStorage.getItem('theme') || 'nebula';
  const storedColorMode = localStorage.getItem('colorMode');
  
  return (
    <ThemeProvider
      initialTheme={storedTheme}
      initialColorMode={storedColorMode}
      forceColorMode={shouldForceDarkMode ? 'dark' : undefined}
      onThemeChange={(theme) => localStorage.setItem('theme', theme)}
      onColorModeChange={(mode) => localStorage.setItem('colorMode', mode)}
    >
      {children}
    </ThemeProvider>
  );
}
```

### Theme Transition Pattern

For smooth transitions when theme changes:

```tsx
import { AccessibleAnimationConfig, useAccessibleAnimation } from '../../animations';
import { useTheme } from '../../hooks';
import { GlassButton } from '../GlassButton'; // Assuming GlassButton is importable

function ThemeTransitionLayout({ children }) {
  const { isDark, currentTheme } = useTheme();
  
  // Create unique key for theme state
  const themeKey = `${currentTheme.name}-${isDark ? 'dark' : 'light'}`;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={themeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Performance-Optimized Context Pattern

For applications with very deep component trees:

```tsx
function OptimizedThemeProvider({ children }) {
  return (
    <ThemeProvider
      initialTheme="nebula"
      enableContextOptimization={true}
      contextUpdateThrottle={100} // Wait 100ms between updates
      updateOnlyOnCommit={true}  // Only update on React commit phases
    >
      {children}
    </ThemeProvider>
  );
}
```

## 6. Troubleshooting Common Issues

### Theme Not Applied Correctly

**Problem**: Components don't reflect the expected theme

**Solution**:
1. Check for nested ThemeProviders (should be avoided)
2. Ensure components are accessing theme context correctly
3. Verify that components are children of ThemeProvider

```tsx
// ❌ INCORRECT: Unexpected theme nesting
function Layout() {
  return (
    <ThemeProvider initialTheme="nebula">
      <Header />
      <ThemeProvider initialTheme="cosmic"> {/* Creates conflict! */}
        <Content />
      </ThemeProvider>
    </ThemeProvider>
  );
}

// ✅ CORRECT: Single ThemeProvider
function Layout() {
  return (
    <ThemeProvider initialTheme="nebula">
      <Header />
      <Content /> {/* Uses parent ThemeProvider */}
    </ThemeProvider>
  );
}
```

### Theme Changes Not Reflected

**Problem**: Theme changes in one component don't affect other components

**Solution**:
1. Ensure you're using the correct context functions
2. Check for isolated theme contexts
3. Verify theme change handlers are called

```tsx
// ❌ INCORRECT: Local theme state overriding context
function ThemeSwitcher() {
  // Local state overrides context updates from elsewhere
  const [theme, setTheme] = useState('nebula');
  
  return (
    <div>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="nebula">Nebula</option>
        <option value="cosmic">Cosmic</option>
      </select>
    </div>
  );
}

// ✅ CORRECT: Using context functions
function ThemeSwitcher() {
  // Get theme and setter from context
  const { currentTheme, setTheme } = useTheme();
  
  return (
    <div>
      <select 
        value={currentTheme.name} 
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="nebula">Nebula</option>
        <option value="cosmic">Cosmic</option>
      </select>
    </div>
  );
}
```

### Performance Issues

**Problem**: Theme changes cause too many re-renders or performance drops

**Solution**:
1. Use granular context hooks instead of useTheme
2. Add memoization to prevent unnecessary recalculation
3. Enable performance optimizations in ThemeProvider

```tsx
// ❌ INEFFICIENT: Using full theme context when only need color mode
function DarkModeToggle() {
  const { isDark, toggleColorMode } = useTheme(); // Gets entire theme context
  
  return (
    <button onClick={toggleColorMode}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

// ✅ OPTIMIZED: Using specific context
function DarkModeToggle() {
  const { isDark, toggleColorMode } = useColorMode(); // Only color mode context
  
  return (
    <button onClick={toggleColorMode}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### Styled Component Issues

**Problem**: Styled components not receiving theme properly

**Solution**:
1. Ensure ThemeProvider wraps styled components
2. Use correct theme property access patterns
3. Use createThemeContext for complex operations

```tsx
// ❌ INCORRECT: Unsafe property access
const Card = styled.div`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text}; // May be undefined
`;

// ✅ CORRECT: Safe property access
const Card = styled.div`
  background-color: ${props => props.theme?.colors?.background || '#FFFFFF'};
  color: ${props => props.theme?.colors?.text || '#000000'};
`;

// ✅ BETTER: Use utility for safe access
import { themeValue } from '../../design/core/themeUtils';

const Card = styled.div`
  background-color: ${props => themeValue(props, 'colors.background', '#FFFFFF')};
  color: ${props => themeValue(props, 'colors.text', '#000000')};
`;
```

### Context Provider Issues

**Problem**: "Cannot find ThemeContext" or similar provider errors

**Solution**:
1. Check that ThemeProvider is imported from correct location
2. Ensure app is wrapped with ThemeProvider
3. Check for conditional rendering issues

```tsx
// ❌ INCORRECT: Conditional provider rendering
function App() {
  const user = useUser();
  
  return (
    <>
      {user && (
        <ThemeProvider initialTheme="nebula">
          <UserDashboard />
        </ThemeProvider>
      )}
      {!user && <LoginPage />} {/* Not wrapped in ThemeProvider! */}
    </>
  );
}

// ✅ CORRECT: Consistent provider wrapping
function App() {
  const user = useUser();
  
  return (
    <ThemeProvider initialTheme="nebula">
      {user ? <UserDashboard /> : <LoginPage />}
    </ThemeProvider>
  );
}
```

---

By following this guide, you should be able to implement the ThemeProvider effectively for different scenarios in your application. Proper theme context management ensures consistent styling, optimal performance, and a great user experience.