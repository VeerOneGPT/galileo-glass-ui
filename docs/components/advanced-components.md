# Advanced Components in Galileo Glass UI

**Version 1.0**  |  **Updated: March 2025**

A comprehensive guide to using and implementing advanced components in the Galileo Glass UI framework. This document covers complex interactive components, specialized input elements, and data visualization tools.

---

## Table of Contents
1. [Overview](#overview)
2. [Input Components](#input-components)
   - [Autocomplete](#autocomplete)
   - [DatePicker](#datepicker)
   - [TagInput](#taginput)
   - [Form Components](#form-components)
3. [Interactive Components](#interactive-components)
   - [Accordion](#accordion)
   - [SpeedDial](#speeddial)
   - [TreeView](#treeview)
   - [ToggleButton](#togglebutton)
   - [Rating](#rating)
4. [Data Display Components](#data-display-components)
   - [ImageList](#imagelist)
   - [KPI Cards](#kpi-cards)
5. [Navigation Components](#navigation-components)
   - [GlassNavigation](#glassnavigation)
   - [ResponsiveNavigation](#responsivenavigation)
   - [PageTransition](#pagetransition)
   - [ZSpaceAppLayout](#zspaceapplayout)
6. [Feedback Components](#feedback-components)
   - [Visual Feedback System](#visual-feedback-system)
   - [Cookie Consent](#cookie-consent)
7. [Theme & Performance](#theme--performance)
   - [Theme Components](#theme-components)
   - [Performance Components](#performance-components)
8. [Implementation Best Practices](#implementation-best-practices)
   - [Accessibility Considerations](#accessibility-considerations)
   - [Performance Optimization](#performance-optimization)
   - [Theming Integration](#theming-integration)
9. [Composition Patterns](#composition-patterns)
   - [Component Composition](#component-composition)
   - [Advanced Layout Techniques](#advanced-layout-techniques)
10. [Animation Integration](#animation-integration)
    - [Physics-Based Animations](#physics-based-animations)
    - [Z-Space Animations](#z-space-animations)
11. [Error Handling and Fallbacks](#error-handling-and-fallbacks)
12. [Testing Advanced Components](#testing-advanced-components)
13. [Extending Advanced Components](#extending-advanced-components)
14. [Resources and Examples](#resources-and-examples)

---

## Overview

The Galileo Glass UI library provides a comprehensive suite of advanced components that extend beyond basic UI elements. These components deliver sophisticated interactions, specialized input handling, and complex data visualization with the distinctive glass morphism aesthetic of the framework.

Key features of Galileo Glass UI advanced components:

1. **Consistent Glass Aesthetics**: All components maintain the glass morphism design language across different states and interactions.
2. **Accessibility-First**: Components are built with accessibility as a core principle, respecting user preferences and supporting assistive technologies.
3. **Performance Optimized**: Advanced optimization techniques ensure smooth performance even for complex components.
4. **Theme Integration**: Seamless adaptation to theme variants and color modes.
5. **Physics-Based Interactions**: Natural, intuitive interaction patterns based on real-world physics.
6. **Z-Space Depth**: Consistent implementation of depth perception throughout the component hierarchy.
7. **Responsive Adaptation**: Components intelligently adapt to different screen sizes and device capabilities.

---

## Input Components

### Autocomplete

The Autocomplete component provides suggestions as the user types, with sophisticated filtering, selection, and customization options.

```tsx
import { Autocomplete } from 'galileo-glass-ui';

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

<Autocomplete
  options={options}
  label="Search options"
  placeholder="Type to search..."
  onChange={handleChange}
  value={selectedValue}
  multiple={false}
  freeSolo={false}
  loading={isLoading}
  loadingText="Searching..."
  noOptionsText="No options found"
  renderOption={(option) => (
    <div>
      <div>{option.label}</div>
      <div style={{ fontSize: '12px', color: 'gray' }}>{option.value}</div>
    </div>
  )}
/>
```

#### Key Features

- **Multiple Selection**: Support for selecting multiple values
- **Free Text Input**: Option to allow values not in the provided list
- **Custom Rendering**: Flexible rendering of options and selected values
- **Loading States**: Built-in loading indicators and states
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Filtering Algorithms**: Multiple filtering strategies (startsWith, contains, fuzzy)

#### Glass Specific Features

- Glass morphism styling with depth-based option rendering
- Z-space animation for dropdown expansion
- Interactive hover and focus states with glass effects
- Consistent backdrop blur and transparency across themes

---

### DatePicker

The DatePicker component provides an intuitive interface for selecting dates and date ranges, with multiple views and comprehensive customization options. The component is now fully icon-library agnostic, allowing you to use any icon library of your choice.

```tsx
import { 
  DatePicker, 
  GlassDatePicker, 
  GlassLocalizationProvider, 
  createDateFnsAdapter 
} from 'galileo-glass-ui';

// Using MUI icons (default)
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Or using another icon library like react-icons
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Set up localization
<GlassLocalizationProvider adapter={createDateFnsAdapter()}>
  {/* Default with MUI icons */}
  <GlassDatePicker
    label="Select Date"
    value={selectedDate}
    onChange={handleDateChange}
    minDate={new Date('2023-01-01')}
    maxDate={new Date('2025-12-31')}
    format="MM/dd/yyyy"
    disablePast={true}
  />
  
  {/* With custom icons from react-icons */}
  <GlassDatePicker
    label="Custom Icons"
    value={selectedDate}
    onChange={handleDateChange}
    format="MM/dd/yyyy"
    icons={{
      calendar: FiCalendar,
      today: FiClock,
      leftArrow: FiChevronLeft,
      rightArrow: FiChevronRight
    }}
  />
</GlassLocalizationProvider>
```

#### Key Features

- **Multiple Views**: Year, month, day, time selection views
- **Range Selection**: Support for selecting date ranges
- **Custom Formatting**: Flexible date display formats
- **Date Constraints**: Min/max dates and disabled date ranges
- **Internationalization**: Support for different locales and calendars via GlassLocalizationProvider
- **Keyboard Navigation**: Full keyboard accessibility
- **Icon Library Agnostic**: Supports any icon library through the icons prop
- **Custom Rendering**: Flexible date rendering

#### Glass Specific Features

- Dimensional layering for calendar navigation with proper z-space
- Subtle animations for view transitions with reduced motion support
- Interactive glass effects for hover and selection states
- Theme-aware rendering with proper light/dark mode adaptation

#### GlassLocalizationProvider

The GlassLocalizationProvider component provides date/time localization for Glass components. It supports:

```tsx
import { GlassLocalizationProvider, createDateFnsAdapter } from 'galileo-glass-ui';

<GlassLocalizationProvider
  adapter={createDateFnsAdapter()} // Date-fns adapter (default)
  locale="en-US"                   // Locale for formatting
  firstDayOfWeek={0}               // 0 = Sunday, 1 = Monday, etc.
  dateFormat="MM/dd/yyyy"          // Default date format
  weekdayFormat="short"            // Format for weekday names
  monthFormat="long"               // Format for month names
>
  {children}
</GlassLocalizationProvider>
```

- **Adapter System**: Flexible adapter pattern for different date libraries
- **Locale Support**: International date/time formatting
- **Format Customization**: Configurable date formats
- **Weekday Settings**: Configurable first day of week
- **Context Provider**: Consistent date handling across components

---

### TagInput

The TagInput component allows users to enter multiple values as tags, with support for validation, autocomplete, and customization.

```tsx
import { TagInput } from 'galileo-glass-ui';

<TagInput
  label="Add Tags"
  value={selectedTags}
  onChange={handleTagChange}
  suggestions={availableTags}
  placeholder="Type and press Enter"
  maxTags={5}
  validateTag={tag => tag.length >= 3}
  invalidTagMessage="Tags must be at least 3 characters"
  allowDuplicates={false}
  renderTag={(tag, { onDelete }) => (
    <div className="custom-tag">
      {tag}
      <button onClick={onDelete}>×</button>
    </div>
  )}
/>
```

#### Key Features

- **Tag Validation**: Custom validation rules for tags
- **Autocomplete**: Suggestion support as users type
- **Custom Rendering**: Flexible tag rendering
- **Keyboard Support**: Add/remove tags with keyboard
- **Paste Support**: Parse multiple tags from clipboard
- **Drag and Drop**: Rearrange tags with drag and drop

#### Glass Specific Features

- Glass morphism styling for tags with subtle elevation
- Interactive animations for tag addition and removal
- Haptic-like physics for tag interaction feedback
- Contextual lighting effects based on tag state

---

### Form Components

Galileo Glass UI provides a comprehensive suite of form components designed to work together seamlessly:

```tsx
import { 
  FormControl, 
  FormGroup, 
  FormLabel, 
  FormHelperText,
  TextField,
  Checkbox,
  Button
} from 'galileo-glass-ui';

<FormGroup>
  <FormControl error={!!errors.name}>
    <FormLabel htmlFor="name">Full Name</FormLabel>
    <TextField
      id="name"
      value={values.name}
      onChange={handleChange}
    />
    <FormHelperText>{errors.name}</FormHelperText>
  </FormControl>
  
  <FormControl>
    <FormLabel htmlFor="terms">Terms</FormLabel>
    <Checkbox
      id="terms"
      checked={values.terms}
      onChange={handleTermsChange}
    />
    <FormHelperText>I agree to the terms and conditions</FormHelperText>
  </FormControl>
  
  <Button type="submit" onClick={handleSubmit}>
    Submit
  </Button>
</FormGroup>
```

#### Key Features

- **Form Layout**: Flexible form grouping and layout
- **Error States**: Consistent error handling and display
- **Accessibility**: Proper labeling and ARIA attributes
- **Validation Integration**: Works with form validation libraries
- **Controlled & Uncontrolled**: Support for both patterns
- **Form State Management**: Optional form state management utilities

#### Glass Specific Features

- Consistent glass styling across all form elements
- Subtle glass transitions for focus and error states
- Interactive feedback with glass effects
- Z-space depth for focused elements

---

## Interactive Components

### Accordion

The Accordion component provides collapsible content sections for organizing information.

```tsx
import { 
  Accordion,
  AccordionSummary,
  AccordionDetails
} from 'galileo-glass-ui';

<Accordion>
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

<Accordion disabled>
  <AccordionSummary>Disabled Panel</AccordionSummary>
  <AccordionDetails>This panel cannot be expanded.</AccordionDetails>
</Accordion>
```

#### Key Features

- **Controlled & Uncontrolled**: Support for both modes
- **Multiple Expansion**: Option to allow multiple panels open
- **Custom Icons**: Customizable expansion indicators
- **Transition Customization**: Configurable animation timing
- **Nested Accordions**: Support for accordion hierarchy
- **Keyboard Navigation**: Full keyboard accessibility

#### Glass Specific Features

- Physics-based expansion animation with spring effects
- Z-space depth change during expansion/collapse
- Glass surface transitions between states
- Interactive hover and focus effects with glass styling

---

### SpeedDial

The SpeedDial component provides a floating action button that expands to reveal a set of related actions.

```tsx
import { 
  SpeedDial, 
  SpeedDialAction, 
  SpeedDialIcon 
} from 'galileo-glass-ui';
import { AddIcon, EditIcon, ShareIcon, DeleteIcon } from './icons';

<SpeedDial
  ariaLabel="Speed Dial Actions"
  icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
  open={open}
  onOpen={handleOpen}
  onClose={handleClose}
  direction="up"
>
  <SpeedDialAction
    icon={<EditIcon />}
    tooltipTitle="Edit"
    onClick={handleEdit}
  />
  <SpeedDialAction
    icon={<ShareIcon />}
    tooltipTitle="Share"
    onClick={handleShare}
  />
  <SpeedDialAction
    icon={<DeleteIcon />}
    tooltipTitle="Delete"
    onClick={handleDelete}
  />
</SpeedDial>
```

#### Key Features

- **Multiple Directions**: Supports up, down, left, right expansion
- **Custom Icons**: Customizable main and action icons
- **Tooltips**: Built-in tooltips for actions
- **Animation Control**: Customizable animations
- **Accessibility**: Full keyboard and screen reader support
- **Mobile Optimization**: Touch-friendly targets

#### Glass Specific Features

- Staggered glass animations for action expansion
- Z-space layering with proper depth perception
- Glass reflection and lighting effects during interaction
- Physics-based animation for natural motion
- Orchestrated animations with Gestalt principles

---

### TreeView

The TreeView component displays hierarchical data with expandable nodes.

```tsx
import { TreeView, TreeItem } from 'galileo-glass-ui';
import { ExpandMoreIcon, ChevronRightIcon } from './icons';

<TreeView
  defaultCollapseIcon={<ExpandMoreIcon />}
  defaultExpandIcon={<ChevronRightIcon />}
  defaultExpanded={['1']}
  onNodeSelect={handleNodeSelect}
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
```

#### Key Features

- **Multiselect**: Option to select multiple nodes
- **Custom Icons**: Customizable expand/collapse icons
- **State Management**: Control expanded/selected state
- **Rich Content**: Support for complex node content
- **Keyboard Navigation**: Full keyboard accessibility
- **Virtualization**: Optional virtualization for large trees

#### Glass Specific Features

- Depth-based glass rendering for hierarchy visualization
- Z-space animations for expand/collapse actions
- Parallax effects for tree depth perception
- Interactive glass styling on hover/selection
- Contextual lighting based on tree depth

---

### ToggleButton

The ToggleButton component provides selectable button options with single or multiple selection.

```tsx
import { 
  ToggleButton, 
  ToggleButtonGroup 
} from 'galileo-glass-ui';
import { FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon } from './icons';

<ToggleButtonGroup
  value={formats}
  onChange={handleFormatChange}
  aria-label="text formatting"
  exclusive={false}
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
```

#### Key Features

- **Single/Multiple Selection**: Exclusive or multiple selection
- **Controlled State**: Full control over selection state
- **Custom Content**: Supports icons, text, or custom content
- **Size Variants**: Multiple size options
- **Orientation**: Horizontal or vertical layouts
- **Disabled States**: Support for disabled buttons or groups

#### Glass Specific Features

- Interactive glass effects with state transitions
- Spring-based selection animations
- Z-space depth changes for selected state
- Contextual lighting effects for active states
- Gesture-responsive feedback with physics simulation

---

### Rating

The Rating component provides an intuitive interface for inputting and displaying ratings.

```tsx
import { Rating } from 'galileo-glass-ui';

<Rating
  name="simple-rating"
  value={value}
  onChange={handleChange}
  precision={0.5}
  size="large"
  icon={<StarIcon />}
  emptyIcon={<StarBorderIcon />}
  readOnly={false}
  disabled={false}
  highlightSelectedOnly={false}
/>
```

#### Key Features

- **Precision**: Supports fractional ratings
- **Custom Icons**: Customizable icons for rated/unrated states
- **Size Variants**: Multiple size options
- **Hover Feedback**: Interactive hover preview
- **Accessibility**: Full keyboard and screen reader support
- **Read-Only & Disabled**: Support for different interaction states

#### Glass Specific Features

- Interactive glass glow effects during hover/selection
- Physics-based animations for selection feedback
- Z-space elevation for selected rating items
- Particle effects for rating confirmation (optional)
- Contextual lighting based on rating value

---

## Data Display Components

### ImageList

The ImageList component displays a collection of images in a grid with various layouts and aspect ratio options.

```tsx
import { 
  ImageList, 
  ImageListItem, 
  ImageListItemBar 
} from 'galileo-glass-ui';

<ImageList 
  variant="masonry" 
  cols={3} 
  gap={8}
>
  {items.map((item) => (
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
          <IconButton>
            <InfoIcon />
          </IconButton>
        }
      />
    </ImageListItem>
  ))}
</ImageList>
```

#### Key Features

- **Multiple Layouts**: Standard, masonry, and quilted layouts
- **Responsive Columns**: Adaptive column count
- **Image Bars**: Title bars with customizable actions
- **Aspect Ratio Control**: Maintain image aspect ratios
- **Lazy Loading**: Built-in support for lazy loading
- **Custom Item Spans**: Control item spans in quilted layout

#### Glass Specific Features

- Glass morphism styling for image item bars
- Interactive glass hover effects
- Z-space layering for title bars
- Orchestrated loading animations
- Contextual glass effects based on image content

---

### KPI Cards

The KPI Cards provide specialized components for displaying key performance indicators with rich visualization and interaction.

```tsx
import { 
  KpiCard, 
  PerformanceMetricCard, 
  InteractiveKpiCard 
} from 'galileo-glass-ui';

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
  onExpand={handleExpandDetails}
  expanded={isExpanded}
/>
```

#### Key Features

- **Trend Indicators**: Visual indicators for performance trends
- **Embedded Charts**: Support for inline sparklines or charts
- **Status Visualization**: Color-coded status indicators
- **Drill-Down Details**: Expandable detailed metrics
- **Interactive States**: Support for expandable detailed views
- **Data Comparison**: Built-in comparison visualizations

#### Glass Specific Features

- Glass morphism styling with depth-based information hierarchy
- Z-space animations for detail expansion
- Contextual glass effects based on KPI status
- Interactive physics animations for user engagement
- Glass surface transitions between states

---

## Navigation Components

### GlassNavigation

The GlassNavigation component provides a flexible navigation system with glass morphism styling.

```tsx
import { GlassNavigation } from 'galileo-glass-ui';

<GlassNavigation
  items={[
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { 
      label: 'Reports', 
      icon: <ReportsIcon />, 
      path: '/reports',
      children: [
        { label: 'Annual', path: '/reports/annual' },
        { label: 'Monthly', path: '/reports/monthly' }
      ]
    }
  ]}
  activePath={currentPath}
  onNavigate={handleNavigation}
  variant="horizontal"
  expandableOnHover={true}
/>
```

#### Key Features

- **Hierarchical Navigation**: Support for nested navigation items
- **Multiple Variants**: Horizontal, vertical, and compact layouts
- **Active State Tracking**: Visual indication of current location
- **Icon Support**: Comprehensive icon integration
- **Responsive Behavior**: Adaptive layout based on screen size
- **Accessibility**: Full keyboard and screen reader support

#### Glass Specific Features

- Glass surface styling with proper depth hierarchy
- Z-space transitions for navigation expansion
- Interactive glass effects for hover and active states
- Physics-based animations for selection indicator
- Gesture-responsive feedback with haptic-like effects

---

### ResponsiveNavigation

The ResponsiveNavigation component automatically adapts its presentation based on screen size.

```tsx
import { ResponsiveNavigation } from 'galileo-glass-ui';

<ResponsiveNavigation
  items={navigationItems}
  activePath={currentPath}
  onNavigate={handleNavigation}
  logo={<Logo />}
  title="Application Name"
  breakpoint="md"
  mobileVariant="drawer"
  desktopVariant="horizontal"
  userMenu={<UserProfileMenu />}
/>
```

#### Key Features

- **Adaptive Layout**: Automatically switches between layouts based on screen size
- **Multiple Mobile Variants**: Drawer, bottom bar, or dropdown options
- **Header Integration**: Optional app bar integration
- **Custom Breakpoints**: Configurable responsive breakpoints
- **Animation Control**: Customizable transition animations
- **Deep linking**: Support for deep linking and route matching

#### Glass Specific Features

- Context-aware glass effects based on background content
- Smooth glass transitions between layout variants
- Z-space layering for proper depth perception
- Physical animation patterns for layout transitions
- Atmospheric background effects integration

---

### PageTransition

The PageTransition component provides smooth, animated transitions between pages or views.

```tsx
import { PageTransition } from 'galileo-glass-ui';

<PageTransition
  animationType="slide"
  direction="left"
  duration={300}
  easing="easeInOut"
  keepMounted={false}
>
  {currentView}
</PageTransition>
```

#### Key Features

- **Multiple Animations**: Slide, fade, zoom, and custom transition types
- **Directional Control**: Support for different transition directions
- **Timing Customization**: Configurable duration and easing
- **Content Preservation**: Option to keep previous view mounted
- **Nested Transitions**: Support for nested transition hierarchies
- **Route Integration**: Easy integration with routing libraries

#### Glass Specific Features

- Physics-based transitions with spring animation
- Z-space depth transitions between pages
- Atmospheric fog effects during transitions
- Glass parallax effects for enhanced depth perception
- Gesture-driven transition control

---

### ZSpaceAppLayout

The ZSpaceAppLayout component provides a sophisticated layout system with z-axis depth and parallax effects.

```tsx
import { 
  ZSpaceAppLayout, 
  ZSpaceLayer 
} from 'galileo-glass-ui';

<ZSpaceAppLayout
  backgroundLayer={<AtmosphericBackground />}
  navLayer={<MainNavigation />}
  contentLayer={<PageContent />}
  overlayLayer={<Notifications />}
  depth={3}
  parallaxIntensity={0.2}
  mouseParallax={true}
  scrollParallax={true}
>
  <ZSpaceLayer name="widget" depth={2}>
    <DashboardWidgets />
  </ZSpaceLayer>
  
  <ZSpaceLayer name="modal" depth={4}>
    {modalContent}
  </ZSpaceLayer>
</ZSpaceAppLayout>
```

#### Key Features

- **Layered Architecture**: Built-in layers with configurable depth
- **Parallax Effects**: Mouse and scroll-based parallax
- **Custom Layers**: Support for custom layer definition
- **Layer Management**: Programmatic layer control
- **Animation System**: Built-in animation capabilities
- **Responsive Behavior**: Adaptive depth behavior for different devices

#### Glass Specific Features

- True z-space depth rendering with accurate lighting
- Atmospheric effects between layers (fog, particles)
- Glass surfaces with proper depth-based transparency
- Physics-based layer transitions
- Dimensional glass effects with realistic depth cues

---

## Feedback Components

### Visual Feedback System

The Visual Feedback components provide a comprehensive system for giving users feedback about their interactions.

```tsx
import { 
  VisualFeedback, 
  RippleButton, 
  FocusIndicator, 
  StateIndicator 
} from 'galileo-glass-ui';

<VisualFeedback
  type="success"
  message="Operation completed successfully"
  icon={<CheckIcon />}
  autoHide={5000}
/>

<RippleButton 
  onClick={handleClick}
  rippleColor="rgba(255, 255, 255, 0.3)"
  rippleOrigin="center"
>
  Click Me
</RippleButton>

<FocusIndicator
  visible={isFocused}
  color="primary"
  borderRadius={8}
  intensity="medium"
>
  {children}
</FocusIndicator>

<StateIndicator
  state="loading"
  fallback={<LoadingSpinner />}
  transition="fade"
>
  {content}
</StateIndicator>
```

#### Key Features

- **Multiple Feedback Types**: Success, error, warning, info states
- **Interactive Ripples**: Configurable ripple effects
- **Focus Visualization**: Enhanced focus indicators
- **State Management**: Visual state representation
- **Transition Effects**: Smooth state transitions
- **Timing Control**: Configurable display duration

#### Glass Specific Features

- Glass morphism styling for feedback containers
- Physics-based ripple animations
- Z-space elevation for focused elements
- Particle effects for state transitions
- Contextual glass effects based on feedback type

---

### Cookie Consent

The Cookie Consent components provide user-friendly interfaces for managing cookie preferences and consent.

```tsx
import { 
  CookieConsent, 
  GlobalCookieConsent, 
  CompactCookieNotice 
} from 'galileo-glass-ui';

<CookieConsent
  title="Cookie Preferences"
  description="We use cookies to enhance your browsing experience."
  categories={[
    { id: 'necessary', label: 'Necessary', required: true },
    { id: 'functional', label: 'Functional', description: '...' },
    { id: 'analytics', label: 'Analytics', description: '...' },
    { id: 'marketing', label: 'Marketing', description: '...' }
  ]}
  onAccept={handleAccept}
  onDecline={handleDecline}
  privacyPolicyLink="/privacy"
  position="bottom"
  allowCustomization={true}
/>

<GlobalCookieConsent
  storageKey="cookie-consent"
  version="1.0"
  expires={365}
  onConsentChange={handleConsentChange}
/>

<CompactCookieNotice
  message="This site uses cookies."
  acceptLabel="Accept"
  customizeLabel="Customize"
  onAccept={handleAccept}
  onCustomize={showCustomizeDialog}
/>
```

#### Key Features

- **Preference Management**: Granular cookie category control
- **Storage Integration**: Built-in consent storage and retrieval
- **Multiple Layouts**: Full, compact, and modal variants
- **Versioning**: Support for consent version tracking
- **Integration**: Easy integration with analytics and tracking
- **Compliance**: Built with GDPR and similar regulations in mind

#### Glass Specific Features

- Glass morphism styling for consent interfaces
- Z-space layering for proper interface hierarchy
- Interactive glass effects for options and buttons
- Smooth transition animations with accessibility support
- Contextual glass effects based on current application theme

---

## Theme & Performance

### Theme Components

The Theme components provide tools for managing and demonstrating theme capabilities.

```tsx
import { 
  GlassThemeSwitcher, 
  GlassThemeDemo, 
  ThemedGlassComponents 
} from 'galileo-glass-ui';

<GlassThemeSwitcher
  themes={['nebula', 'cosmic', 'aurora', 'frost', 'celestial']}
  currentTheme={theme}
  onThemeChange={handleThemeChange}
  showColorMode={true}
  variant="dropdown"
/>

<GlassThemeDemo
  components={['button', 'card', 'input', 'switch']}
  showThemeProperties={true}
  interactive={true}
/>

<ThemedGlassComponents
  themeOverride={{
    colors: {
      primary: '#3e63dd',
      secondary: '#7c53dd'
    }
  }}
>
  {children}
</ThemedGlassComponents>
```

#### Key Features

- **Theme Switching**: Easy theme selection interface
- **Theme Demonstration**: Visual theme showcase
- **Theme Overrides**: Local theme customization
- **Color Mode Toggle**: Light/dark mode switching
- **Theme Preview**: Live theme preview capabilities
- **Component Theming**: Per-component theme control

#### Glass Specific Features

- Glass morphism styling for theme interfaces
- Theme transition animations with glass effects
- Z-space theme previews with proper depth
- Interactive glass surfaces for theme selection
- Theme-specific glass variants and effects

---

### Performance Components

The Performance components provide utilities for monitoring and optimizing application performance.

```tsx
import { 
  PerformanceMonitor, 
  OptimizedGlassContainer 
} from 'galileo-glass-ui';

<PerformanceMonitor
  metrics={['fps', 'memory', 'renderTime']}
  threshold={{ fps: 30, renderTime: 16 }}
  onPerformanceIssue={handlePerformanceIssue}
  visible={isDevelopment}
/>

<OptimizedGlassContainer
  complexity={content.length > 100 ? 'high' : 'medium'}
  optimizationLevel="auto"
  deferRenderingOutsideViewport={true}
  enableGPURendering={true}
>
  {complexContent}
</OptimizedGlassContainer>
```

#### Key Features

- **Metrics Tracking**: Monitor key performance indicators
- **Adaptive Rendering**: Automatic quality adjustments
- **Deferred Content**: Optimize off-screen content
- **GPU Acceleration**: Intelligent GPU utilization
- **Performance Alerting**: Notifications for performance issues
- **Batched Updates**: Optimized rendering updates

#### Glass Specific Features

- Quality tier adaptation for glass effects
- Simplified glass rendering for performance-constrained environments
- Progressive enhancement of glass effects based on device capabilities
- Memory-optimized glass effect implementation
- Performance-aware animations and transitions

---

## Implementation Best Practices

### Accessibility Considerations

When implementing advanced components, follow these accessibility best practices:

1. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
2. **Screen Reader Support**: Provide meaningful labels and descriptions
3. **Reduced Motion**: Respect user preferences for reduced motion
4. **Focus Management**: Implement proper focus management for complex components
5. **Color Contrast**: Maintain sufficient contrast ratios
6. **Error States**: Provide clear, accessible error messages
7. **ARIA Attributes**: Use appropriate ARIA roles and attributes
8. **Touch Targets**: Ensure touch targets are large enough for all users

#### Example: Accessible TagInput

```tsx
import { TagInput } from 'galileo-glass-ui';

<TagInput
  label="Skills (required)"
  id="skills-input"
  value={skills}
  onChange={handleSkillsChange}
  required
  aria-describedby="skills-help"
  aria-invalid={!!errors.skills}
  onBlur={validateSkills}
  maxTags={5}
  invalidTagMessage="Skills must be between 2 and 20 characters"
/>
<span id="skills-help" className="sr-only">
  Enter skills, press Enter after each one. You can add up to 5 skills.
</span>
{errors.skills && (
  <div id="skills-error" className="error-message" role="alert">
    {errors.skills}
  </div>
)}
```

---

### Performance Optimization

When working with advanced components, consider these performance optimization techniques:

1. **Component Memoization**: Use React.memo for complex components
2. **Virtualization**: Implement virtualization for long lists
3. **Lazy Loading**: Load components only when needed
4. **Debouncing & Throttling**: Limit frequent callbacks
5. **Batched Updates**: Group state updates
6. **Selective Rendering**: Minimize unnecessary re-renders
7. **Code Splitting**: Split large component code
8. **Progressive Enhancement**: Add advanced features incrementally

#### Example: Optimized TreeView

```tsx
import { TreeView, TreeItem } from 'galileo-glass-ui';
import { useMemo } from 'react';

function OptimizedTreeView({ data, onSelect }) {
  // Memoize recursive tree item generation
  const renderTree = useMemo(() => {
    const buildTreeItems = (nodes) => {
      return nodes.map(node => (
        <TreeItem key={node.id} nodeId={node.id} label={node.name}>
          {node.children && node.children.length > 0 
            ? buildTreeItems(node.children) 
            : null}
        </TreeItem>
      ));
    };
    
    return buildTreeItems(data);
  }, [data]);
  
  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      onNodeSelect={onSelect}
    >
      {renderTree}
    </TreeView>
  );
}
```

---

### Theming Integration

To ensure proper theme integration with advanced components:

1. **ThemeContext Access**: Access theme through ThemeContext
2. **createThemeContext**: Use createThemeContext for glass mixins
3. **Color Mode Adaptation**: Adapt styling based on color mode
4. **Theme Variants**: Support all theme variants
5. **Dynamic Theming**: Handle theme changes gracefully
6. **Theme Extensions**: Extend the theme system when needed
7. **Component Variants**: Support multiple component variants
8. **Theme Tokens**: Use theme tokens for consistent styling

#### Example: Theme-Aware Component

```tsx
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { createThemeContext, glassSurface } from 'galileo-glass-ui';

const ThemeAwareCard = styled.div`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    
    return glassSurface({
      depth: 2,
      variant: props.theme.variant === 'frost' ? 'frosted' : 'standard',
      intensity: props.theme.isDarkMode ? 'medium' : 'subtle',
      themeContext
    });
  }}
  
  padding: 24px;
  border-radius: 12px;
  color: ${props => props.theme.colors.text.primary};
  
  ${props => props.theme.isDarkMode && `
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
`;

function AdvancedCard({ children, ...props }) {
  const theme = useContext(ThemeContext);
  
  return (
    <ThemeAwareCard theme={theme} {...props}>
      {children}
    </ThemeAwareCard>
  );
}
```

---

## Composition Patterns

### Component Composition

Effective patterns for composing advanced components:

1. **Compound Components**: Use parent-child relationships
2. **Render Props**: Pass rendering logic as props
3. **Higher-Order Components**: Enhance components with shared functionality
4. **Custom Hooks**: Extract reusable stateful logic
5. **Context Providers**: Share state and functionality
6. **Controlled vs. Uncontrolled**: Support both patterns
7. **State Lifting**: Lift state for shared control

#### Example: Compound Component Pattern

```tsx
import { useState } from 'react';

// Compound component example
function Tabs({ children, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) onChange(tabId);
  };
  
  // Create context to share state with child components
  const context = {
    activeTab,
    onTabChange: handleTabChange
  };
  
  return (
    <TabsContext.Provider value={context}>
      <div className="tabs-container">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Child components
Tabs.TabList = function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
};

Tabs.Tab = function Tab({ children, id }) {
  const { activeTab, onTabChange } = useContext(TabsContext);
  const isActive = activeTab === id;
  
  return (
    <button 
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => onTabChange(id)}
      aria-selected={isActive}
      role="tab"
    >
      {children}
    </button>
  );
};

Tabs.TabPanel = function TabPanel({ children, id }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== id) return null;
  
  return <div className="tab-panel">{children}</div>;
};

// Usage
<Tabs defaultTab="tab1" onChange={handleTabChange}>
  <Tabs.TabList>
    <Tabs.Tab id="tab1">First Tab</Tabs.Tab>
    <Tabs.Tab id="tab2">Second Tab</Tabs.Tab>
  </Tabs.TabList>
  
  <Tabs.TabPanel id="tab1">
    Content for first tab
  </Tabs.TabPanel>
  
  <Tabs.TabPanel id="tab2">
    Content for second tab
  </Tabs.TabPanel>
</Tabs>
```

---

### Advanced Layout Techniques

Sophisticated layout techniques for advanced components:

1. **Grid Systems**: Use CSS Grid for complex layouts
2. **Flexbox Patterns**: Flexible box layouts for components
3. **Z-Space Layering**: Organize elements in 3D space
4. **Responsive Containers**: Container queries and adaptive layouts
5. **Scroll Containers**: Optimized scrolling experiences
6. **Fixed & Sticky Positioning**: Strategic element positioning
7. **Virtual Elements**: Optimize large data sets
8. **Dynamic Sizing**: Content-driven sizing strategies

#### Example: Z-Space Layout

```tsx
import { ZSpaceContainer, ZSpaceLayer } from 'galileo-glass-ui';

<ZSpaceContainer depth={4} perspective={1000}>
  <ZSpaceLayer depth={0} blur={0}>
    <BackgroundElements />
  </ZSpaceLayer>
  
  <ZSpaceLayer depth={1} blur={2}>
    <ContentBackground />
  </ZSpaceLayer>
  
  <ZSpaceLayer depth={2} blur={0}>
    <MainContent />
  </ZSpaceLayer>
  
  <ZSpaceLayer depth={3} blur={0}>
    <ForegroundElements />
  </ZSpaceLayer>
</ZSpaceContainer>
```

---

## Animation Integration

### Physics-Based Animations

Integrating physics-based animations with advanced components:

1. **Spring Animations**: Natural motion with configurable physics
2. **Magnetic Effects**: Attraction/repulsion interactions
3. **Momentum & Inertia**: Realistic motion continuation
4. **Collision Detection**: Handle element collisions
5. **Gesture Physics**: Realistic response to user gestures
6. **Force Feedback**: Visual representation of force
7. **Physics Presets**: Reusable motion characteristics

#### Example: Physics Button

```tsx
import { usePhysicsInteraction } from 'galileo-glass-ui';
import { physicsPresets } from 'galileo-glass-ui/animations';

function PhysicsButton({ children, onClick }) {
  const {
    ref,
    style,
    animationProps,
    ...eventHandlers
  } = usePhysicsInteraction({
    type: 'spring',
    mass: 1,
    stiffness: 300,
    damping: 20,
    intensity: 'responsive',
    scale: true,
    rotation: false,
    preset: physicsPresets.responsive,
    onMouseDown: onClick
  });
  
  return (
    <button
      ref={ref}
      style={{ ...style, ...animationProps }}
      {...eventHandlers}
    >
      {children}
    </button>
  );
}
```

---

### Z-Space Animations

Creating depth-based animations with advanced components:

1. **Z-Axis Transitions**: Movement along the depth axis
2. **Parallax Effects**: Multi-layer depth perception
3. **Perspective Adjustments**: Dynamic perspective changes
4. **Depth Fog**: Atmospheric depth cues
5. **Z-Space Stacking**: Managing element stacking in 3D
6. **Orbital Motion**: Elements orbiting in 3D space
7. **Depth-Based Scaling**: Size changes based on depth

#### Example: Z-Space Modal

```tsx
import { useZSpaceAnimation } from 'galileo-glass-ui';
import { ZSpaceLayer } from 'galileo-glass-ui/animations';

function ZSpaceModal({ isOpen, onClose, children }) {
  const {
    containerRef,
    contentRef,
    styles,
    animate,
    isAnimating
  } = useZSpaceAnimation({
    fromLayer: ZSpaceLayer.HIDDEN,
    toLayer: ZSpaceLayer.MODAL,
    duration: 0.4,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fog: true,
    parallax: true
  });
  
  useEffect(() => {
    if (isOpen) {
      animate('enter');
    } else if (contentRef.current) {
      animate('exit');
    }
  }, [isOpen, animate]);
  
  if (!isOpen && !isAnimating) return null;
  
  return (
    <div ref={containerRef} style={styles.container}>
      <div className="backdrop" onClick={onClose} style={styles.backdrop} />
      <div ref={contentRef} style={styles.content}>
        {children}
      </div>
    </div>
  );
}
```

---

## Error Handling and Fallbacks

Strategies for handling errors and providing fallbacks in advanced components:

1. **Error Boundaries**: Contain errors within components
2. **Fallback UI**: Provide graceful fallback interfaces
3. **Progressive Enhancement**: Layer functionality based on capabilities
4. **Feature Detection**: Check for browser support
5. **Graceful Degradation**: Simplify features when needed
6. **Resilient Animations**: Prevent animation failures
7. **State Recovery**: Recover from error states

#### Example: Error Boundary with Fallback

```tsx
import { Component } from 'react';
import { ErrorBoundary } from 'galileo-glass-ui';

// Advanced component with error boundary
function ComplexVisualization({ data }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-container">
          <h3>Visualization Error</h3>
          <p>We encountered an error while rendering this visualization.</p>
          <button onClick={resetError}>Try Again</button>
          <button onClick={() => logError(error)}>Report Issue</button>
        </div>
      )}
    >
      <DataVisualization data={data} />
    </ErrorBoundary>
  );
}
```

---

## Testing Advanced Components

Approaches for testing complex, interactive components:

1. **Component Unit Tests**: Test component logic in isolation
2. **Integration Tests**: Test component interactions
3. **Accessibility Testing**: Verify a11y compliance
4. **Visual Regression Tests**: Ensure consistent appearance
5. **Animation Testing**: Test animation behavior
6. **Performance Testing**: Measure rendering performance
7. **User Interaction Tests**: Simulate user interactions
8. **Device Testing**: Test across devices and browsers

#### Example: Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Autocomplete } from 'galileo-glass-ui';

describe('Autocomplete', () => {
  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' }
  ];
  
  test('shows options when input is focused', () => {
    render(
      <Autocomplete 
        options={options} 
        label="Fruit" 
        placeholder="Select a fruit" 
      />
    );
    
    // Initially, options should not be visible
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    
    // Focus the input
    fireEvent.focus(screen.getByPlaceholderText('Select a fruit'));
    
    // Options should now be visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });
  
  test('filters options based on input', () => {
    render(
      <Autocomplete 
        options={options} 
        label="Fruit" 
        placeholder="Select a fruit" 
      />
    );
    
    const input = screen.getByPlaceholderText('Select a fruit');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ap' } });
    
    // Only Apple should be visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });
});
```

---

## Extending Advanced Components

Guidelines for extending and customizing advanced components:

1. **Component Composition**: Compose rather than modify
2. **HOC Wrapping**: Wrap components for enhanced functionality
3. **Render Props**: Use render props for customization
4. **Theme Extensions**: Extend the theme system
5. **Custom Hooks**: Create specialized hooks for reuse
6. **Utility Functions**: Build helper functions
7. **Style Overrides**: Apply targeted style overrides

#### Example: Extended Component

```tsx
import { Autocomplete } from 'galileo-glass-ui';
import { AdvancedLabel, createFilterFunction } from './extensions';

// Extended Autocomplete with custom filtering and presentation
function EnhancedAutocomplete({
  data,
  labelField,
  valueField,
  searchFields,
  renderOption,
  ...props
}) {
  // Transform data to expected format
  const options = useMemo(() => {
    return data.map(item => ({
      label: item[labelField],
      value: item[valueField],
      originalData: item
    }));
  }, [data, labelField, valueField]);
  
  // Custom filter function
  const filterFunction = useMemo(() => {
    return createFilterFunction(searchFields, {
      caseSensitive: false,
      fuzzy: true,
      threshold: 0.3
    });
  }, [searchFields]);
  
  // Custom option renderer
  const optionRenderer = useMemo(() => {
    if (renderOption) return (option) => renderOption(option.originalData);
    return undefined;
  }, [renderOption]);
  
  return (
    <Autocomplete
      options={options}
      filterFunction={filterFunction}
      renderOption={optionRenderer}
      {...props}
    />
  );
}
```

---

## Resources and Examples

Additional resources and examples for working with advanced components:

1. **Component Demos**: Interactive component examples
2. **API Reference**: Detailed API documentation
3. **Implementation Guides**: Step-by-step implementation guides
4. **Pattern Library**: Common usage patterns
5. **Code Snippets**: Reusable code fragments
6. **Case Studies**: Real-world implementation examples
7. **Performance Tips**: Component-specific optimization

For more detailed examples and complete code samples, refer to the Galileo Glass UI documentation, storybook examples, and the component source code.

---

*Galileo Glass UI v1.0 • March 2025*