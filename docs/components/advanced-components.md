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
import { Rating } from '@veerone/galileo-glass-ui/components';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import React, { useState } from 'react';

function MyRating() {
  const [value, setValue] = useState<number | null>(2.5);

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number | null,
  ) => {
    setValue(newValue);
  };

  return (
<Rating
  name="simple-rating"
  value={value}
  onChange={handleChange}
  precision={0.5}
  size="large"
      filledIcon={<StarIcon fontSize="inherit" />}
      emptyIcon={<StarBorderIcon fontSize="inherit" />}
  readOnly={false}
  disabled={false}
      showValue
/>
  );
}
```

#### Key Features

- **Precision**: Supports fractional ratings (e.g., half stars) via `precision` prop.
- **Custom Icons**: Customizable icons for rated (`filledIcon`), unrated (`emptyIcon`), and highlighted (`highlightedIcon`) states.
- **Size Variants**: `size` prop (`small`, `medium`, `large`).
- **Hover Feedback**: Interactive hover preview (highlights potential rating).
- **Accessibility**: Full keyboard and screen reader support via radio inputs.
- **Read-Only & Disabled**: Support for different interaction states (`readOnly`, `disabled`).
- **Value Label**: Optionally display the numeric value (`showValue`).

#### Glass Specific Features

- Interactive glass glow effects during hover/selection (`GlassRating`).
- Physics-based animations for selection feedback.
- Z-space elevation for selected rating items.

#### Props (`RatingProps`)

| Prop              | Type                                         | Default        | Description                                                                                              |
| :---------------- | :------------------------------------------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| `value`           | `number`                                     | `undefined`    | Controlled value of the rating. Use `null` for empty.                                                      |
| `defaultValue`    | `number`                                     | `0`            | Initial value for uncontrolled state.                                                                      |
| `max`             | `number`                                     | `5`            | Maximum rating value (number of icons).                                                                    |
| `precision`       | `number`                                     | `1`            | The minimum granularity change allowed (e.g., `0.5` for half ratings, `1` for whole).                      |
| `readOnly`        | `boolean`                                    | `false`        | If true, the rating is displayed but cannot be changed.                                                    |
| `disabled`        | `boolean`                                    | `false`        | If true, the rating is disabled and cannot be interacted with.                                             |
| `onChange`        | `(event, value: number \| null) => void`      | `undefined`    | Callback fired when the value changes. Receives `null` if cleared.                                         |
| `onClick`         | `(event, value: number) => void`           | `undefined`    | Callback fired when an icon is clicked.                                                                    |
| `onHover`         | `(event, value: number) => void`           | `undefined`    | Callback fired when the mouse hovers over a rating value. `-1` indicates hover left the component.           |
| `label`           | `string`                                     | `undefined`    | Label text associated with the rating (used with `showLabel`).                                             |
| `size`            | `'small' \| 'medium' \| 'large'`              | `'medium'`     | Size of the rating icons.                                                                                  |
| `emptyIcon`       | `React.ReactNode`                            | `<StarBorderIcon/>` | Icon for unselected/empty state.                                                                           |
| `filledIcon`      | `React.ReactNode`                            | `<StarIcon/>`    | Icon for selected/filled state.                                                                            |
| `highlightedIcon` | `React.ReactNode`                            | `filledIcon`   | Icon used when hovering or focusing (defaults to `filledIcon`).                                            |
| `name`            | `string`                                     | `undefined`    | `name` attribute applied to the underlying radio inputs (useful for forms).                              |
| `showLabel`       | `boolean`                                    | `false`        | If true, displays the `label` text alongside the rating.                                                   |
| `showValue`       | `boolean`                                    | `false`        | If true, displays the numeric `value` alongside the rating.                                                |
| `glass`           | `boolean`                                    | `false`        | Applies glass styling (internal prop, use `GlassRating`).                                                  |
| `color`           | `'default' \| 'primary' \| ...`                | `'default'`    | Color theme for filled icons (default is gold-like).                                                     |
| `className`       | `string`                                     | `undefined`    | Additional CSS class name(s).                                                                              |
| `style`           | `React.CSSProperties`                        | `undefined`    | Inline styles.                                                                                             |
| `animationConfig` | `Partial<SpringConfig> \| SpringPresetName`    | Internal       | Inherited. Configures interaction animations.                                                              |
| `disableAnimation`| `boolean`                                    | `false`        | Inherited. Disables interaction animations if true.                                                        |

---

## Data Display Components

### ImageList

The ImageList component displays a collection of images in a grid with various layouts and aspect ratio options.

```tsx
import React from 'react';
import { 
  ImageList, 
  ImageListItem, 
  ImageListItemBar 
} from '@veerone/galileo-glass-ui/components';
import InfoIcon from '@mui/icons-material/Info';
import { Button } from '@veerone/galileo-glass-ui/components'; // Import Galileo Button

const items = [
  { id: '1', img: '/path/to/image1.jpg', title: 'Breakfast', author: 'author1' },
  { id: '2', img: '/path/to/image2.jpg', title: 'Burger', author: 'author2', rows: 2, cols: 2 },
  { id: '3', img: '/path/to/image3.jpg', title: 'Camera', author: 'author3' },
];

function MyImageList() {
  return (
<ImageList 
  variant="masonry" 
  cols={3} 
  gap={8}
      glass
>
  {items.map((item) => (
        <ImageListItem 
          key={item.id} 
          cols={item.cols || 1} 
          rows={item.rows || 1}
          glass
          rounded
          elevation={1}
          hoverOverlay
        >
      <img
        src={item.img}
        alt={item.title}
        loading="lazy"
            style={{ display: 'block', width: '100%', height: 'auto' }}
      />
      <ImageListItemBar
        title={item.title}
            subtitle={<span>by: {item.author}</span>}
            position="bottom"
            actionPosition="right"
            glass
        actionIcon={
              // Replace MUI IconButton with Galileo Button styled as an icon button
              <Button 
                variant="icon" // Assuming an 'icon' variant or similar exists
                aria-label={`info about ${item.title}`} 
                style={{ color: 'rgba(255, 255, 255, 0.7)', minWidth: 'auto', padding: '4px' }} // Basic styling
              >
                <InfoIcon fontSize="inherit" />
              </Button>
        }
            showOnHover
      />
    </ImageListItem>
  ))}
</ImageList>
  );
}
```

#### Key Features

- **Multiple Layouts**: Standard, masonry, quilted, and woven layouts (`variant`).
- **Responsive Columns**: Adaptive column count (`cols`).
- **Image Bars**: Title bars (`ImageListItemBar`) with customizable actions (`actionIcon`).
- **Aspect Ratio Control**: Items fill their grid cells, `img` tags control aspect ratio.
- **Lazy Loading**: Standard browser `loading="lazy"` attribute.
- **Custom Item Spans**: Control item spans in quilted/standard layouts (`cols`, `rows` on `ImageListItem`).

#### Glass Specific Features

- **Glass Styling**: Optional glass effects on the container (`ImageList`), items (`ImageListItem`), and bars (`ImageListItemBar`) via the `glass` prop.
- **Interactive Hover Effects**: Built-in hover scale animation and optional overlay (`hoverOverlay` on `ImageListItem`). Physics-based animations enhance the effect.
- **Z-space Layering**: Title bars are layered above images.
- **Orchestrated Loading Animations**: Optional entrance animations (`enableEntranceAnimation` on `ImageList`).

#### Props (`ImageListProps`)

| Prop                      | Type                                                  | Default        | Description                                                                                             |
| :------------------------ | :---------------------------------------------------- | :------------- | :------------------------------------------------------------------------------------------------------ |
| `children`                | `React.ReactNode`                                     | `undefined`    | The content of the component, typically `ImageListItem` components.                                       |
| `className`               | `string`                                              | `undefined`    | Override or extend the styles applied to the component.                                                   |
| `style`                   | `React.CSSProperties`                                 | `undefined`    | CSS styles applied to the root element.                                                                   |
| `cols`                    | `number \| { xs?, sm?, md?, lg?, xl? }`                | `2`            | Number of columns in the grid, or a responsive object.                                                    |
| `gap`                     | `number`                                              | `4`            | The gap between items in the grid (in px).                                                              |
| `rowHeight`               | `number \| 'auto'`                                   | `'auto'`       | Height of the grid rows (in px). 'auto' adjusts to content, primarily for `standard`/`woven`.           |
| `variant`                 | `'standard' \| 'quilted' \| 'masonry' \| 'woven'`      | `'standard'`   | The layout variant to use.                                                                                |
| `glass`                   | `boolean`                                             | `false`        | If true, applies glass morphism effect to the container background.                                       |
| `rounded`                 | `boolean`                                             | `false`        | If true, the container will have rounded corners.                                                         |
| `variableSize`            | `boolean`                                             | `false`        | **(Internal/Context)** If true, allows items to span multiple columns/rows (`cols`/`rows` props on items). |
| `enableEntranceAnimation` | `boolean`                                             | `false`        | If true, enables a staggered entrance animation for items using physics.                                |
| `animationConfig`         | `Partial<SpringConfig> \| SpringPresetName`            | `'DEFAULT'`    | Inherited. Configures the `spring` item animations (entrance, hover).                                 |
| `disableAnimation`        | `boolean`                                             | `false`        | Inherited. Disables all animations if true.                                                             |
| `motionSensitivity`       | `MotionSensitivityLevel`                              | `undefined`    | Inherited. Can influence animation intensity.                                                           |
| *...rest*                 | `HTMLAttributes<HTMLUListElement>`                    | -              | Standard HTML attributes for the root `ul` element.                                                       |

#### Props (`ImageListItemProps`)

| Prop              | Type                                         | Default     | Description                                                                                             |
| :---------------- | :------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------ |
| `children`        | `React.ReactNode`                            | `undefined` | The content of the component, usually an `img` or `picture` tag, and optionally an `ImageListItemBar`. |
| `className`       | `string`                                     | `undefined` | Override or extend the styles applied to the component.                                                   |
| `style`           | `React.CSSProperties`                        | `undefined` | CSS styles applied to the root `li` element.                                                              |
| `cols`            | `number`                                     | `1`         | Number of grid columns the item should span (for `standard`, `quilted`, `woven` variants).              |
| `rows`            | `number`                                     | `1`         | Number of grid rows the item should span (for `standard`, `quilted`, `woven` variants).                 |
| `glass`           | `boolean`                                    | `false`     | If true, applies glass morphism effect to the item background.                                          |
| `hoverOverlay`    | `boolean`                                    | `false`     | If true, the item will have a dark overlay on hover/focus.                                              |
| `elevation`       | `0 \| 1 \| 2 \| 3 \| 4 \| 5`                  | `0`         | Applies a box shadow effect simulating elevation (ignored if `glass` is true).                            |
| `rounded`         | `boolean`                                    | `false`     | If true, the item will have rounded corners.                                                            |
| `alt`             | `string`                                     | `undefined` | Passed to the underlying `img` element if `src` is provided directly on `ImageListItem`.                |
| `src`             | `string`                                     | `undefined` | Shortcut to render an `img` element directly within the item. Use `children` for more complex content.    |
| `srcSet`          | `string`                                     | `undefined` | Passed to the underlying `img` element if `src` is provided.                                            |
| `animationConfig` | `Partial<SpringConfig> \| SpringPresetName`    | Inherited   | Overrides the `ImageList` context animation config for this specific item.                                |
| `disableAnimation`| `boolean`                                    | Inherited   | Overrides the `ImageList` context disable animation setting.                                            |
| `motionSensitivity`| `MotionSensitivityLevel`                   | Inherited   | Overrides the `ImageList` context motion sensitivity setting.                                           |
| *...rest*         | `LiHTMLAttributes<HTMLLIElement>`             | -           | Standard HTML attributes for the root `li` element.                                                       |

#### Props (`ImageListItemBarProps`)

| Prop             | Type                      | Default        | Description                                                                                             |
| :--------------- | :------------------------ | :------------- | :------------------------------------------------------------------------------------------------------ |
| `children`       | `React.ReactNode`         | `undefined`    | Additional content placed inside the bar (rarely used).                                                   |
| `className`      | `string`                  | `undefined`    | Override or extend the styles applied to the component.                                                   |
| `style`          | `React.CSSProperties`     | `undefined`    | CSS styles applied to the root `div` element.                                                             |
| `title`          | `React.ReactNode`         | `undefined`    | The main title text or node to display.                                                                   |
| `subtitle`       | `React.ReactNode`         | `undefined`    | The subtitle text or node displayed below the title.                                                      |
| `position`       | `'top' \| 'bottom' \| 'below'` | `'bottom'`     | Position of the title bar relative to the image (`'below'` renders outside the item container).           |
| `glass`          | `boolean`                 | `false`        | If true, applies glass morphism effect to the bar background.                                             |
| `actionIcon`     | `React.ReactNode`         | `undefined`    | An icon or button element displayed at the end (or start if `actionPosition` is 'left').                  |
| `actionPosition` | `'left' \| 'right'`        | `'right'`      | Position of the `actionIcon`.                                                                             |
| `showOnHover`    | `boolean`                 | `false`        | If true, the bar fades in only when the parent `ImageListItem` is hovered or focused.                    |
| *...rest*        | `HTMLAttributes<HTMLDivElement>` | -              | Standard HTML attributes for the root `div` element.                                                        |

---

### KPI Cards

The KPI Cards provide specialized components for displaying key performance indicators with rich visualization and interaction. There are three main variants:

*   **`KpiCard`:** Displays a primary value, optional icon, subtitle, and a change indicator with period.
*   **`PerformanceMetricCard`:** Focuses on metrics with targets, showing progress indicators (linear, circular, gauge) and status.
*   **`InteractiveKpiCard`:** Includes a mini chart (line, bar, area, sparkline) for visualizing data trends.

```tsx
import React from 'react';
import { 
  KpiCard, 
  PerformanceMetricCard, 
  InteractiveKpiCard 
} from '@veerone/galileo-glass-ui/components'; // Corrected import path
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Example Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';

// --- Example for KpiCard --- 
function BasicKpi() {
  return (
<KpiCard
  title="Total Revenue"
      value={1234567}
      valueFormat="$0,0.00" // Example formatting
      prefix="$"
      unit="USD"
      change={0.123} // Represents +12.3%
      changeFormat="+0.0%" // Format for change display
      positiveIsGood={true}
      period="vs Last Month"
      icon={<TrendingUpIcon />}
      glass={true}
      color="success"
    />
  );
}

// --- Example for PerformanceMetricCard --- 
function PerformanceKpi() {
  return (
<PerformanceMetricCard
  title="System Performance"
      value={89} // Current value
      target={95} // Target value
      min={0}    // Min possible value
      max={100}  // Max possible value
      unit="%"
      higherIsBetter={true}
      status="warning" // Explicit status, or calculated if 'neutral'
      showProgress={true}
      progressType="gauge" // 'linear', 'circular', 'gauge'
      icon={<SpeedIcon />}
      period="Real-time"
      glass={true}
      highlight={false} // Optional pulse animation
      footer={<div>CPU: 23% | Mem: 45%</div>} // Use footer or children for details
    />
  );
}

// --- Example for InteractiveKpiCard --- 
const sampleChartData = [10, 15, 13, 18, 20, 25, 22];

function InteractiveKpi() {
  return (
<InteractiveKpiCard
  title="User Engagement"
      value={78}
      valueFormat="0%" // Format as percentage
      unit="%"
      change={0.052} // Represents +5.2%
      positiveIsGood={true}
      period="Weekly Trend"
      icon={<ShowChartIcon />}
      chartData={sampleChartData}
      chartType="sparkline" // 'line', 'bar', 'area', 'sparkline'
      showTooltip={true}
      glass={true}
      interactive={true} // Enable hover effects
      animateOnHover={true}
    />
  );
}

#### Key Features

- **Trend Indicators**: Visual indicators for performance trends (`change`, `positiveIsGood` on `KpiCard`, `InteractiveKpiCard`).
- **Embedded Charts**: Support for inline charts (`chartData`, `chartType` on `InteractiveKpiCard`).
- **Status Visualization**: Color-coded status indicators (`status` on `PerformanceMetricCard`, or based on `change`).
- **Progress Indicators**: Visual progress towards a target (`showProgress`, `progressType` on `PerformanceMetricCard`).
- **Interactive States**: Hover effects and tooltips (`interactive`, `showTooltip` on `InteractiveKpiCard`).
- **Formatting**: Customizable value and change formatting (`valueFormat`, `changeFormat`).

#### Glass Specific Features

- **Glass Styling**: Optional glass effects on cards via the `glass` prop.
- **Depth & Hierarchy**: Uses dimensional glass for clear information structure.
- **Z-space Animations**: Subtle depth animations on hover or interaction (if enabled by props/theme).
- **Contextual Effects**: Glass appearance can subtly change based on status or theme color.
- **Physics Animations**: Interactive elements may use physics for feedback (e.g., hover scale).

#### Props (`KpiCardBaseProps` - Common to all variants)

| Prop           | Type                                                                     | Default      | Description                                                                   |
| :------------- | :----------------------------------------------------------------------- | :----------- | :---------------------------------------------------------------------------- |
| `title`        | `string`                                                                 | -            | **Required.** The title of the KPI card.                                        |
| `value`        | `number \| string`                                                   | -            | **Required.** The main value to display.                                      |
| `subtitle`     | `string`                                                                 | `undefined`  | Optional subtitle or description.                                               |
| `icon`         | `React.ReactNode`                                                        | `undefined`  | Optional icon displayed prominently.                                          |
| `className`    | `string`                                                                 | `undefined`  | Additional CSS class name(s).                                                 |
| `style`        | `React.CSSProperties`                                                    | `undefined`  | Inline styles for the root card element.                                      |
| `glass`        | `boolean`                                                                | `false`      | If true, applies glass morphism effect.                                       |
| `color`        | `'default' \| 'primary' \| 'secondary' \| ... \| string`                | `'default'`  | Color theme influencing text, borders, or accents.                            |
| `size`         | `'small' \| 'medium' \| 'large'`                                       | `'medium'`   | Controls the overall size and padding of the card.                            |
| `fullWidth`    | `boolean`                                                                | `false`      | If true, the card takes the full width of its container.                      |
| `elevation`    | `0 \| 1 \| 2 \| 3 \| 4 \| 5`                                       | `2`          | Shadow elevation level (ignored if `glass` is true).                          |
| `borderRadius` | `number \| string`                                                 | `12`         | Corner radius of the card.                                                    |
| `hover`        | `boolean`                                                                | `true`       | If true, applies a hover effect (e.g., slight lift).                          |
| `onClick`      | `(event: React.MouseEvent<HTMLDivElement>) => void`                     | `undefined`  | Callback fired when the card is clicked. Makes the card focusable.           |
| `align`        | `'left' \| 'center' \| 'right'`                                        | `'left'`     | Text alignment of the content.                                                |
| `footer`       | `React.ReactNode`                                                        | `undefined`  | Optional content rendered in a distinct footer section.                       |
| `children`     | `React.ReactNode`                                                        | `undefined`  | Optional content rendered at the bottom, within the main content area.        |
| *...rest*      | `HTMLAttributes<HTMLDivElement>`                                         | -            | Standard HTML attributes.                                                     |

#### Props (`KpiCardProps` - Extends `KpiCardBaseProps`, `AnimationProps`)

| Prop             | Type     | Default        | Description                                                                   |
| :--------------- | :------- | :------------- | :---------------------------------------------------------------------------- |
| `valueFormat`    | `string` | `undefined`    | Format string for the `value` (e.g., `"0,0.00"`, `"0.0%"`).                   |
| `unit`           | `string` | `undefined`    | Unit label displayed after the `value`.                                         |
| `change`         | `number` | `undefined`    | Numeric value representing change (e.g., `0.12` for 12%).                     |
| `changeFormat`   | `string` | `"+0.0%"`      | Format string for the `change` value.                                         |
| `positiveIsGood` | `boolean`| `true`         | If true, positive `change` is styled as good (e.g., green), negative as bad. |
| `period`         | `string` | `undefined`    | Text label describing the time period for the `change` (e.g., "vs Last Month"). |
| `prefix`         | `string` | `undefined`    | Prefix string displayed before the `value` (e.g., "$").                        |

#### Props (`PerformanceMetricCardProps` - Extends `KpiCardBaseProps`, `AnimationProps`)

| Prop             | Type                                     | Default        | Description                                                                   |
| :--------------- | :--------------------------------------- | :------------- | :---------------------------------------------------------------------------- |
| `value`          | `number`                                 | -              | **Required.** Current numeric value of the metric.                            |
| `target`         | `number`                                 | -              | **Required.** The target value for the metric.                                |
| `min`            | `number`                                 | `0`            | Minimum possible value (used for progress calculation).                       |
| `max`            | `number`                                 | Calculated     | Maximum possible value (used for progress calculation, defaults based on value/target). |
| `higherIsBetter` | `boolean`                                | `true`         | If true, values closer to `max` are better. If false, values closer to `min`. |
| `valueFormat`    | `string`                                 | `undefined`    | Format string for the `value` and `target`.                                   |
| `unit`           | `string`                                 | `undefined`    | Unit label displayed after the `value` and `target`.                            |
| `showProgress`   | `boolean`                                | `true`         | If true, displays a progress indicator.                                       |
| `progressType`   | `'linear' \| 'circular' \| 'gauge'`        | `'linear'`     | Type of progress indicator to display.                                        |
| `status`         | `'success' \| 'warning' \| ... \| 'neutral'` | `'neutral'`    | Explicit status indicator. If 'neutral', status is calculated based on value/target. |
| `period`         | `string`                                 | `undefined`    | Text label describing the time period for the data.                           |
| `highlight`      | `boolean`                                | `false`        | If true, applies a subtle pulse animation to draw attention.                  |

#### Props (`InteractiveKpiCardProps` - Extends `KpiCardBaseProps`, `AnimationProps`)

| Prop             | Type                                                      | Default        | Description                                                                   |
| :--------------- | :-------------------------------------------------------- | :------------- | :---------------------------------------------------------------------------- |
| `chartData`      | `Array<number \| { x: number \| string; y: number }>`    | `[]`           | Data points for the mini chart. Can be numbers (index as x) or {x, y} objects. |
| `chartType`      | `'line' \| 'bar' \| 'area' \| 'sparkline'`            | `'line'`       | Type of mini chart to render.                                                 |
| `animationDuration`| `number`                                                  | `500`          | Duration (ms) for chart animations (if applicable).                           |
| `zoomable`       | `boolean`                                                 | `false`        | **(Not Implemented)** If true, enables zooming on the chart.                  |
| `showTooltip`    | `boolean`                                                 | `true`         | If true, shows a tooltip with the data point value on chart hover.            |
| `valueFormat`    | `string`                                                  | `undefined`    | Format string for the main `value` and tooltip values.                      |
| `unit`           | `string`                                                  | `undefined`    | Unit label displayed after the `value` and in tooltips.                       |
| `change`         | `number`                                                  | `undefined`    | Numeric value representing change (e.g., `0.12` for 12%).                     |
| `changeFormat`   | `string`                                                  | `"+0.0%"`      | Format string for the `change` value.                                         |
| `positiveIsGood` | `boolean`                                                 | `true`         | If true, positive `change` is styled as good (e.g., green), negative as bad. |
| `period`         | `string`                                                  | `undefined`    | Text label describing the time period for the `change` (e.g., "Weekly Trend"). |
| `interactive`    | `boolean`                                                 | `true`         | If true, enables hover effects (like breathing animation) on the card.        |
| `animateOnHover` | `boolean`                                                 | `true`         | If true, the chart may animate subtly when the card is hovered.             |

---

## Navigation Components

### GlassNavigation

The GlassNavigation component provides a flexible navigation system with glass morphism styling, suitable for top, bottom, left, or right placement.

```tsx
import React, { useState } from 'react';
import { GlassNavigation, NavigationItem } from '@veerone/galileo-glass-ui/components'; // Corrected import path
import { Home as HomeIcon, BarChart as BarChartIcon, Assessment as ReportsIcon } from '@mui/icons-material'; // Example Icons

const navItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChartIcon />, href: '/dashboard' },
  {
    id: 'reports',
      label: 'Reports', 
      icon: <ReportsIcon />, 
      children: [
      { id: 'reports-annual', label: 'Annual', href: '/reports/annual' },
      { id: 'reports-monthly', label: 'Monthly', href: '/reports/monthly' },
    ],
  },
  { id: 'disabled', label: 'Disabled', href:'/disabled', disabled: true },
];

function HorizontalNav() {
  const [active, setActive] = useState('dashboard');

  const handleClick = (id: string) => {
    console.log(`Item clicked: ${id}`);
    setActive(id);
    // Add actual routing logic here if needed based on the item's href or id
  };

  return (
    <GlassNavigation
      items={navItems}
      activeItem={active} // Use activeItem with the item's id
      onItemClick={handleClick} // Use onItemClick callback
      position="top" // 'top' or 'bottom' for horizontal layout
      variant="standard" // 'standard', 'minimal', 'prominent'
      glassIntensity={0.8}
      logo={<span>MyApp</span>} // Example logo
      actions={<span>Actions</span>} // Example actions
      sticky={true}
    />
  );
}

function VerticalNav() {
  const [active, setActive] = useState('home');

  const handleClick = (id: string) => {
    console.log(`Item clicked: ${id}`);
    setActive(id);
  };

  return (
    <div style={{ height: '400px' }}> {/* Container for vertical nav */} 
      <GlassNavigation
        items={navItems}
        activeItem={active}
        onItemClick={handleClick}
        position="left" // 'left' or 'right' for vertical layout
        variant="prominent"
        width={220} // Custom width for vertical nav
        collapsible={true} // Make it collapsible
        logo={<span>Vertical</span>}
      />
    </div>
  );
}

```

#### Key Features

- **Hierarchical Navigation**: Supports nested items via the `children` property in `NavigationItem`.
- **Layout & Style Variants**: 
    - `position` (`'top'`, `'bottom'`, `'left'`, `'right'`) controls orientation and placement.
    - `variant` (`'standard'`, `'minimal'`, `'prominent'`) adjusts visual style and density.
    - `compact` reduces padding.
    - `collapsible` (for `left`/`right` position) allows collapsing to icons only.
- **Active State Tracking**: Visual indication using the `activeItem` prop (expects item `id`).
- **Icon Support**: Integrates icons via the `icon` property in `NavigationItem`.
- **Basic Responsiveness**: A mobile menu toggle appears at smaller screen widths, but full responsive behavior (like drawers) requires the `ResponsiveNavigation` wrapper component.
- **Accessibility**: Includes features like keyboard navigation support and ARIA attributes.

#### Glass Specific Features

- Configurable glass surface styling (`glassIntensity`).
- Physics-based animation for the active item indicator.
- Optional glow effects (`prominent` variant).
- Smooth animations for expanding/collapsing children and side navigation.

#### Props (`GlassNavigationProps`)

| Prop                   | Type                                                                     | Default         | Description                                                                               |
| :--------------------- | :----------------------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------- |
| `items`                | `NavigationItem[]`                                                       | `[]`            | **Required.** Array of navigation items to display.                                     |
| `activeItem`           | `string`                                                                 | `undefined`     | The `id` of the currently active navigation item.                                       |
| `onItemClick`          | `(id: string) => void`                                                 | `undefined`     | Callback fired when a navigation item is clicked, receiving the item's `id`.            |
| `onMenuToggle`         | `(isOpen: boolean) => void`                                            | `undefined`     | Callback fired when the mobile menu is toggled (primarily for `ResponsiveNavigation`).    |
| `position`             | `'top' \| 'left' \| 'right' \| 'bottom'`                                   | `'top'`         | Position and orientation of the navigation bar.                                         |
| `variant`              | `'standard' \| 'minimal' \| 'prominent'`                                | `'standard'`    | Visual style variant affecting appearance and density.                                  |
| `logo`                 | `React.ReactNode`                                                        | `undefined`     | Custom logo or brand element displayed at the start (or top for vertical).            |
| `actions`              | `React.ReactNode`                                                        | `undefined`     | Custom elements (e.g., buttons, profile) displayed at the end (or bottom).              |
| `showDivider`          | `boolean`                                                                | `false`         | Whether to show a divider line between nav items and actions.                           |
| `glassIntensity`       | `number` (0-1)                                                           | `0.7`           | Opacity/intensity of the glass background effect.                                       |
| `sticky`               | `boolean`                                                                | `false`         | If true, the navigation bar sticks to its position during scroll.                       |
| `maxWidth`             | `string \| number`                                                 | `undefined`     | Maximum width for the navigation container (useful for centered top/bottom nav).    |
| `compact`              | `boolean`                                                                | `false`         | If true, uses reduced padding for a more compact look.                                |
| `centered`             | `boolean`                                                                | `false`         | If true, centers the navigation items within the container (for top/bottom).          |
| `zIndex`               | `number`                                                                 | `100`           | Custom CSS z-index for the navigation bar.                                            |
| `width`                | `string \| number`                                                 | `'240px'`       | Width for vertical navigation (`left` or `right` position).                             |
| `initialExpandedItems` | `string[]`                                                               | `[]`            | Array of item `id`s that should be initially expanded if they have children.          |
| `collapsible`          | `boolean`                                                                | `false`         | If true (for `left`/`right` position), adds a button to collapse/expand the sidebar. |
| `initialCollapsed`     | `boolean`                                                                | `false`         | Initial collapsed state if `collapsible` is true.                                     |
| `className`            | `string`                                                                 | `undefined`     | Additional CSS class name(s).                                                             |
| `style`                | `React.CSSProperties`                                                    | `undefined`     | Inline styles for the root element.                                                     |
| `theme`                | `DefaultTheme`                                                           | Theme Context   | Styled-components theme object.                                                         |

#### Item Structure (`NavigationItem`)

| Prop            | Type               | Default     | Description                                                                      |
| :-------------- | :----------------- | :---------- | :------------------------------------------------------------------------------- |
| `id`            | `string`           | -           | **Required.** Unique identifier for the item. Used for `activeItem` and `onItemClick`. |
| `label`         | `string`           | -           | **Required.** The text label displayed for the item.                           |
| `href`          | `string`           | `undefined` | URL target for the item. If provided, renders as an anchor `<a>` tag.          |
| `icon`          | `React.ReactNode`  | `undefined` | Optional icon displayed before the label.                                        |
| `active`        | `boolean`          | `undefined` | Explicitly mark item as active (overrides `activeItem` prop if set).           |
| `disabled`      | `boolean`          | `false`     | If true, dims the item and disables interaction.                               |
| `children`      | `NavigationItem[]` | `undefined` | Array of nested navigation items for creating submenus.                        |
| `badge`         | `string \| number` | `undefined` | Content for a small badge displayed next to the label (e.g., notification count). |
| `onClick`       | `() => void`       | `undefined` | Custom click handler. Called *before* the main `onItemClick` prop.               |
| `external`      | `boolean`          | `false`     | If true and `href` is set, adds `target="_blank" rel="noopener noreferrer"`.  |
| `className`     | `string`           | `undefined` | Additional CSS class name for the list item element.                             |
| `tooltip`       | `string`           | `undefined` | Tooltip text displayed on hover (especially useful when `collapsible` is true). |
| `customElement` | `React.ReactNode`  | `undefined` | Render a completely custom element instead of the default item structure.        |

---

### ResponsiveNavigation

The ResponsiveNavigation component provides a container that automatically switches between a desktop navigation view (using `GlassNavigation`) and a mobile view (typically a drawer containing `GlassNavigation`) based on screen width.

**Note:** This component primarily handles the responsive layout switching. Props for the actual navigation items (`items`), active state tracking (e.g., `activeItem`), and navigation callbacks (`onItemClick`) should be passed through; they will be received by the underlying `GlassNavigation` component it renders.

```tsx
import React, { useState } from 'react';
import { ResponsiveNavigation, NavigationItem } from '@veerone/galileo-glass-ui/components'; // Corrected import path
import { Home as HomeIcon, BarChart as BarChartIcon, Settings as SettingsIcon } from '@mui/icons-material'; // Example icons

const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/' }, // Use href for links
    { id: 'dashboard', label: 'Dashboard', icon: <BarChartIcon />, href: '/dashboard' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, href: '/settings' },
];
const MyLogo = () => <span style={{ fontWeight: 'bold' }}>MyApp</span>; // Placeholder

function AppNavigation() {
  // State should hold the ID of the active item
  const [activeItemId, setActiveItemId] = useState('home'); 

  const handleNavigate = (itemId: string) => {
    // Find the item by ID if needed, e.g., for routing
    const item = navigationItems.find(item => item.id === itemId);
    console.log('Navigating based on item ID:', itemId, '(Path:', item?.href, ')');
    setActiveItemId(itemId);
    // Add actual routing logic here using item?.href or itemId
  };

  return (
    <ResponsiveNavigation
      items={navigationItems}
      logo={<MyLogo />}
      mobileBreakpoint="md" // Breakpoint to switch to mobile view (e.g., 960px)
      useDrawer={true} // Use a drawer for mobile menu
      mobileMenuPosition="left" // Drawer opens from left
      activeItem={activeItemId} // Pass the active item ID 
      onItemClick={handleNavigate} // Handle navigation clicks
      // Optional: Control mobile drawer state externally
      // drawerOpen={isMobileMenuOpen}
      // onMenuToggle={setIsMobileMenuOpen}
      // You can also pass other GlassNavigation props like variant for desktop
      variant="standard"
    />
  );
}
```

#### Key Props (`ResponsiveNavigationProps`)

| Prop                     | Type                                         | Default        | Description                                                                                                      |
|--------------------------|----------------------------------------------|----------------|------------------------------------------------------------------------------------------------------------------|
| `items`                  | `NavigationItem[]`                           | `[]`           | **Required.** Array of navigation items passed to the underlying `GlassNavigation`.                              |
| `logo`                   | `React.ReactNode`                            | `undefined`    | Optional logo component displayed in the navigation bar.                                                       |
| `mobileBreakpoint`       | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`         | The screen width (px or breakpoint key) at which the layout switches to mobile view.                               |
| `useDrawer`              | `boolean`                                    | `true`         | If `true`, uses a slide-in `Drawer` for the mobile menu. If `false`, renders navigation inline (less common). |
| `drawerWidth`            | `number \| string`                           | `280`          | Width of the mobile menu drawer.                                                                               |
| `mobileMenuPosition`     | `'left' \| 'right'`                         | `'left'`       | Side from which the mobile drawer opens.                                                                       |
| `drawerWithHeader`       | `boolean`                                    | `true`         | If `true` and `useDrawer` is `true`, adds a header with title and close button to the mobile drawer.           |
| `mobileMenuLabel`        | `string`                                     | `'Menu'`       | Text label for the mobile menu button and drawer header.                                                       |
| `menuIcon`               | `React.ReactNode`                            | `undefined`    | Custom icon for the mobile menu toggle button. Defaults to a menu/close icon.                                |
| `showLogoInMobile`       | `boolean`                                    | `true`         | If `true`, displays the `logo` in the mobile menu bar.                                                         |
| `useMinimalBefore`       | `boolean`                                    | `false`        | If `true`, applies a minimal style (hiding labels) to desktop navigation just before the mobile breakpoint. |
| `glassIntensity`         | `number` (0-1)                               | `0.7`          | Controls the intensity/opacity of the glass effect (passed to underlying `GlassNavigation`).                 |
| `onMenuToggle`           | `(isOpen: boolean) => void`                | `undefined`    | Callback fired when the mobile menu drawer is opened or closed (useful for external state control).            |
| *...rest (`GlassNavigationProps`)* |                                              |                | All other props are passed down to the underlying `GlassNavigation` component (e.g., `activeItem`, `onItemClick`, `variant` for desktop, etc.). |

**Note:** Pass the `id` of the active navigation item to the `activeItem` prop for highlighting. The `onItemClick` handler receives the `id` of the clicked `NavigationItem`.

#### Behavior

- Below the `mobileBreakpoint`, it renders a `MobileMenuBar` with a toggle button (`menuIcon` or default) and optionally the `logo`.
- Clicking the toggle button opens/closes a `Drawer` (if `useDrawer` is true) containing the `GlassNavigation` component styled for vertical mobile layout.
- Above the `mobileBreakpoint`, it renders the `GlassNavigation` component directly, typically in a horizontal layout (controlled by the `variant` prop passed in `...rest`).
- The `useMinimalBefore` prop provides an intermediate step for larger tablets, shrinking the desktop nav before switching to the mobile drawer.

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
} from '@veerone/galileo-glass-ui/components'; // Corrected import path

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
} from '@veerone/galileo-glass-ui/components'; // Corrected import path

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

---

### PageTransition

The PageTransition component provides smooth, animated transitions between pages or views, utilizing CSS or physics-based animations.

```tsx
import React, { useState, useEffect } from 'react';
import { PageTransition } from '@veerone/galileo-glass-ui/components'; // Corrected import path
import { Box, Typography, Button } from '@veerone/galileo-glass-ui/components'; // Example content components

const View1 = () => <Box p={2} bgcolor="rgba(0, 100, 255, 0.2)"><Typography>View One</Typography></Box>;
const View2 = () => <Box p={2} bgcolor="rgba(255, 100, 0, 0.2)"><Typography>View Two</Typography></Box>;
const View3 = () => <Box p={2} bgcolor="rgba(100, 255, 0, 0.2)"><Typography>View Three (Physics)</Typography></Box>;

function AppWithTransitions() {
  const [currentViewKey, setCurrentViewKey] = useState('view1');

  const renderView = () => {
    switch (currentViewKey) {
      case 'view1': return <View1 />;
      case 'view2': return <View2 />;
      case 'view3': return <View3 />;
      default: return <View1 />;
    }
  };

  return (
    <div>
      <Box display="flex" gap={1} mb={2}>
        <Button onClick={() => setCurrentViewKey('view1')}>View 1 (Slide)</Button>
        <Button onClick={() => setCurrentViewKey('view2')}>View 2 (Fade)</Button>
        <Button onClick={() => setCurrentViewKey('view3')}>View 3 (Physics)</Button>
      </Box>

      <PageTransition
        mode={currentViewKey === 'view3' ? 'physics' : (currentViewKey === 'view2' ? 'fade' : 'slide')}
        direction={currentViewKey === 'view1' ? 'left' : 'right'} // Example direction logic
        duration={currentViewKey === 'view3' ? undefined : 400} // Duration relevant for CSS modes
        locationKey={currentViewKey} // Unique key triggers the transition
        physicsConfig={{ tension: 190, friction: 22 }} // Example physics config
        style={{ position: 'relative', height: '100px' }} // Ensure container has dimensions
      >
        {renderView()}
      </PageTransition>
    </div>
  );
}
```

#### Key Features

- **Multiple Animation Modes**: 
    - CSS-based: `'fade'`, `'slide'`, `'zoom'`, `'flip'`, `'glass-fade'`, `'glass-reveal'`.
    - Physics-based: `'physics'`, `'zSpace'` (adds `translateZ`).
- **Directional Control**: `direction` (`'up'`, `'down'`, `'left'`, `'right'`) for `slide`, `physics`, `zSpace` modes.
- **Timing & Physics Customization**: 
    - `duration` for CSS modes.
    - `physicsConfig` for detailed spring physics tuning (tension, friction, etc.) in physics modes.
- **Key-Based Trigger**: Transitions occur when the `locationKey` prop changes.
- **Callbacks**: `onStart` and `onComplete` callbacks for transition lifecycle.
- **Reduced Motion**: Respects user preference via `respectReducedMotion` prop.

#### Glass Specific Features

- **Physics Transitions**: Smooth, natural motion using the `physics` or `zSpace` modes.
- **Z-Space Transitions**: Creates depth effects by animating `translateZ` in `zSpace` mode.
- **Glass Effect Modes**: `'glass-fade'` and `'glass-reveal'` provide transitions integrated with glass surface effects.

#### Props (`PageTransitionProps` - Extends `AnimationProps`)

| Prop                     | Type                                                      | Default        | Description                                                                                                                                    |
| :----------------------- | :-------------------------------------------------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`               | `React.ReactNode`                                         | `undefined`    | The content to be rendered within the transition container.                                                                                      |
| `mode`                   | `'fade' \| ... \| 'physics' \| 'zSpace'`             | `'fade'`       | The type of animation to use for transitions.                                                                                                  |
| `locationKey`            | `string \| number`                                      | `undefined`    | A unique key representing the current view/page. Changing this key triggers the transition.                                                    |
| `duration`               | `number`                                                  | `300`          | Duration in milliseconds for CSS-based animation modes (`fade`, `slide`, etc.). Ignored for `physics`/`zSpace`.                               |
| `direction`              | `'up' \| 'down' \| 'left' \| 'right'`                   | `'right'`      | Direction for `slide`, `physics`, and `zSpace` animations.                                                                                   |
| `physicsConfig`          | `Partial<SpringConfig> \| keyof typeof SpringPresets` | `undefined`    | Configuration for physics-based animations (`physics`, `zSpace`). Overrides context/`animationConfig`. See `SpringConfig` for options.           |
| `perspective`            | `number`                                                  | `1200`         | CSS `perspective` value (in pixels) applied for `flip` and `zSpace` modes.                                                                     |
| `glassTransitionIntensity` | `number` (0-1)                                            | `0.5`          | Intensity factor for `glass-fade` and `glass-reveal` modes.                                                                                    |
| `onStart`                | `() => void`                                              | `undefined`    | Callback fired when a transition starts (exit or enter).                                                                                       |
| `onComplete`             | `() => void`                                              | `undefined`    | Callback fired when an enter transition completes.                                                                                             |
| `disabled`               | `boolean`                                                 | `false`        | If true, disables transitions entirely.                                                                                                        |
| `respectReducedMotion`   | `boolean`                                                 | `true`         | If true, uses simple fade transitions if the user prefers reduced motion. Overridden by `disableAnimation` prop.                           |
| `className`              | `string`                                                  | `undefined`    | Additional CSS class name(s).                                                                                                                  |
| `style`                  | `React.CSSProperties`                                     | `undefined`    | Inline styles for the root container.                                                                                                          |
| `animationConfig`        | `AnimationConfig`                                         | From Context   | General animation configuration (can be Spring config) from `AnimationProps`. `physicsConfig` takes precedence for physics modes.           |
| `disableAnimation`       | `boolean`                                                 | From Context   | Disables animation, overriding `respectReducedMotion`. From `AnimationProps`.                                                                  |
| `motionSensitivity`      | `MotionSensitivity`                                       | From Context   | Controls sensitivity for interactive motion. From `AnimationProps`. (Less relevant here).                                                          |

---

### ZSpaceAppLayout

The ZSpaceAppLayout component provides a layout structure that utilizes Z-Space depth perception for a more immersive user experience.

```tsx
import React, { useState } from 'react';
import { ZSpaceAppLayout, ZSpaceLayer } from '@veerone/galileo-glass-ui/components'; // Corrected import path
import { Home as HomeIcon, BarChart as BarChartIcon, Assessment as ReportsIcon } from '@mui/icons-material'; // Example Icons

const navItems = [
  { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChartIcon />, href: '/dashboard' },
  {
    id: 'reports',
    label: 'Reports',
    icon: <ReportsIcon />,
    children: [
      { id: 'reports-annual', label: 'Annual', href: '/reports/annual' },
      { id: 'reports-monthly', label: 'Monthly', href: '/reports/monthly' },
    ],
  },
  { id: 'disabled', label: 'Disabled', href:'/disabled', disabled: true },
];

function AppLayout() {
  const [activeItemId, setActiveItemId] = useState('home');

  const handleNavigate = (itemId) => {
    // Implement navigation logic based on itemId
    console.log('Navigating to:', itemId);
    setActiveItemId(itemId);
  };

  return (
    <ZSpaceAppLayout
      navItems={navItems}
      activeItemId={activeItemId}
      onItemClick={handleNavigate}
      glassIntensity={0.8}
      logo={<span>MyApp</span>}
      actions={<span>Actions</span>}
      sticky={true}
      maxWidth="1200px"
      compact={true}
      centered={true}
      zIndex={100}
      width="240px"
      initialExpandedItems={['home', 'dashboard']}
      collapsible={true}
      initialCollapsed={false}
      className="app-layout"
      style={{ height: '100vh' }}
    >
      {/* Add your content components here */}
    </ZSpaceAppLayout>
  );
}
```

#### Key Features

- **Hierarchical Navigation**: Supports nested items via the `children` property in `NavigationItem`.
- **Layout & Style Variants**: 
    - `position` (`'top'`, `'bottom'`, `'left'`, `'right'`) controls orientation and placement.
    - `variant` (`'standard'`, `'minimal'`, `'prominent'`) adjusts visual style and density.
    - `compact` reduces padding.
    - `collapsible` (for `left`/`right` position) allows collapsing to icons only.
- **Active State Tracking**: Visual indication using the `activeItem` prop (expects item `id`).
- **Icon Support**: Integrates icons via the `icon` property in `NavigationItem`.
- **Basic Responsiveness**: A mobile menu toggle appears at smaller screen widths, but full responsive behavior (like drawers) requires the `ResponsiveNavigation` wrapper component.
- **Accessibility**: Includes features like keyboard navigation support and ARIA attributes.

#### Glass Specific Features

- Configurable glass surface styling (`glassIntensity`).
- Physics-based animation for the active item indicator.
- Optional glow effects (`prominent` variant).
- Smooth animations for expanding/collapsing children and side navigation.

#### Props (`ZSpaceAppLayoutProps`)

| Prop                   | Type                                                                     | Default         | Description                                                                               |
| :--------------------- | :----------------------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------- |
| `navItems`             | `NavigationItem[]`                                                       | `[]`            | **Required.** Array of navigation items to display.                                     |
| `activeItemId`         | `string`                                                                 | `undefined`     | The `id` of the currently active navigation item.                                       |
| `onItemClick`          | `(id: string) => void`                                                 | `undefined`     | Callback fired when a navigation item is clicked, receiving the item's `id`.            |
| `glassIntensity`       | `number` (0-1)                                                           | `0.7`           | Opacity/intensity of the glass background effect.                                       |
| `logo`                 | `React.ReactNode`                                                        | `undefined`     | Custom logo or brand element displayed at the start (or top for vertical).            |
| `actions`              | `React.ReactNode`                                                        | `undefined`     | Custom elements (e.g., buttons, profile) displayed at the end (or bottom).              |
| `sticky`               | `boolean`                                                                | `false`         | If true, the navigation bar sticks to its position during scroll.                       |
| `maxWidth`             | `string \| number`                                                 | `'1200px'`      | Maximum width for the navigation container (useful for centered top/bottom nav).    |
| `compact`              | `boolean`                                                                | `true`          | If true, uses reduced padding for a more compact look.                                |
| `centered`             | `boolean`                                                                | `true`          | If true, centers the navigation items within the container (for top/bottom).          |
| `zIndex`               | `number`                                                                 | `100`           | Custom CSS z-index for the navigation bar.                                            |
| `width`                | `string \| number`                                                 | `'240px'`       | Width for vertical navigation (`left` or `right` position).                             |
| `initialExpandedItems` | `string[]`                                                               | `[]`            | Array of item `id`s that should be initially expanded if they have children.          |
| `collapsible`          | `boolean`                                                                | `true`          | If true (for `left`/`right` position), adds a button to collapse/expand the sidebar. |
| `initialCollapsed`     | `boolean`                                                                | `false`         | Initial collapsed state if `collapsible` is true.                                     |
| `className`            | `string`                                                                 | `undefined`     | Additional CSS class name(s).                                                             |
| `style`                | `React.CSSProperties`                                                    | `undefined`     | Inline styles for the root element.                                                     |
| `theme`                | `DefaultTheme`                                                           | Theme Context   | Styled-components theme object.                                                         |

#### Item Structure (`NavigationItem`)

| Prop            | Type               | Default     | Description                                                                      |
| :-------------- | :----------------- | :---------- | :------------------------------------------------------------------------------- |
| `id`            | `string`           | -           | **Required.** Unique identifier for the item. Used for `activeItem` and `onItemClick`. |
| `label`         | `string`           | -           | **Required.** The text label displayed for the item.                           |
| `href`          | `string`           | `undefined` | URL target for the item. If provided, renders as an anchor `<a>` tag.          |
| `icon`          | `React.ReactNode`  | `undefined` | Optional icon displayed before the label.                                        |
| `active`        | `boolean`          | `undefined` | Explicitly mark item as active (overrides `activeItem` prop if set).           |
| `disabled`      | `boolean`          | `false`     | If true, dims the item and disables interaction.                               |
| `children`      | `NavigationItem[]` | `undefined` | Array of nested navigation items for creating submenus.                        |
| `badge`         | `string \| number` | `undefined` | Content for a small badge displayed next to the label (e.g., notification count). |
| `onClick`       | `() => void`       | `undefined` | Custom click handler. Called *before* the main `onItemClick` prop.               |
| `external`      | `boolean`          | `false`     | If true and `href` is set, adds `target="_blank" rel="noopener noreferrer"`.  |
| `className`     | `string`           | `undefined` | Additional CSS class name for the list item element.                             |
| `tooltip`       | `string`           | `undefined` | Tooltip text displayed on hover (especially useful when `collapsible` is true). |
| `customElement` | `React.ReactNode`  | `undefined` | Render a completely custom element instead of the default item structure.        |