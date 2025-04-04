# GlassImageViewer

The `GlassImageViewer` component provides a sophisticated image viewing experience with physics-based interactions, glass styling, and advanced features like zoom, pan, and gallery navigation. It supports touch gestures, keyboard navigation, and fullscreen mode, making it ideal for creating immersive image viewing experiences.

## Import

```tsx
import { GlassImageViewer } from '@veerone/galileo-glass-ui';
import type { ImageItem, GlassImageViewerRef } from '@veerone/galileo-glass-ui'; // Import types
```

## Usage

```tsx
import React, { useRef } from 'react';
import { GlassImageViewer } from '@veerone/galileo-glass-ui';
import type { GlassImageViewerRef, ImageItem } from '@veerone/galileo-glass-ui';

function MyImageViewer() {
  // Create a ref to access viewer methods
  const viewerRef = useRef<GlassImageViewerRef>(null);
  
  // Define a single image
  const image: ImageItem = {
    src: '/path/to/image.jpg',
    alt: 'Beautiful landscape',
    metadata: {
      title: 'Mountain View',
      description: 'A scenic view of mountains at sunset',
      author: 'Jane Doe',
      date: '2023-05-15'
    }
  };
  
  // For gallery mode, define multiple images
  const images: ImageItem[] = [
    image,
    {
      src: '/path/to/image2.jpg',
      alt: 'Ocean waves',
      metadata: { title: 'Ocean View' }
    },
    {
      src: '/path/to/image3.jpg',
      alt: 'Forest trail',
      metadata: { title: 'Forest Path' }
    }
  ];
  
  // Handle image changes in gallery mode
  const handleImageChange = (image: ImageItem, index: number) => {
    console.log(`Viewing image ${index + 1}: ${image.metadata?.title}`);
  };
  
  // Reset the view programmatically
  const handleReset = () => {
    viewerRef.current?.resetView();
  };

  return (
    <div>
      <GlassImageViewer
        ref={viewerRef}
        image={image}
        images={images} // Optional: for gallery mode
        mode="gallery"
        showInfo={true}
        glassEffect={true}
        glassVariant="frosted"
        zoomControls={true}
        width="800px"
        height="500px"
        physics={{
          tension: 170,
          friction: 26,
          mass: 1,
          panDamping: 0.85,
          inertia: 0.6
        }}
        onImageChange={handleImageChange}
      />
      <button onClick={handleReset}>Reset View</button>
    </div>
  );
}
```

## ImageItem Interface

```tsx
interface ImageItem {
  /** Image source URL */
  src: string;
  
  /** Thumbnail source URL (optional) */
  thumbnail?: string;
  
  /** Alt text for accessibility */
  alt?: string;
  
  /** Image width (if known) */
  width?: number;
  
  /** Image height (if known) */
  height?: number;
  
  /** Image metadata */
  metadata?: ImageMetadata;
  
  /** Whether the image is currently loading */
  loading?: boolean;
  
  /** Optional image ID */
  id?: string;
}

interface ImageMetadata {
  /** Image title */
  title?: string;
  
  /** Image description */
  description?: string;
  
  /** Image creation date */
  date?: string;
  
  /** Image author/creator */
  author?: string;
  
  /** Image location */
  location?: string;
  
  /** Image tags */
  tags?: string[];
  
  /** Any other custom metadata */
  [key: string]: any;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `image` | `ImageItem` | required | The main image to display. |
| `images` | `ImageItem[]` | `undefined` | Collection of images for gallery mode. |
| `initialZoom` | `number` | `1.0` | Initial zoom level (1.0 = 100%). |
| `maxZoom` | `number` | `5.0` | Maximum allowed zoom level. |
| `minZoom` | `number` | `0.5` | Minimum allowed zoom level. |
| `showInfo` | `boolean` | `false` | Whether to show information panel. |
| `glassEffect` | `boolean` | `true` | Whether to use glass styling. |
| `glassVariant` | `'clear' \| 'frosted' \| 'tinted'` | `'frosted'` | Glass styling variant. |
| `blurStrength` | `'light' \| 'standard' \| 'strong'` | `'standard'` | Glass blur strength. |
| `zoomControls` | `boolean` | `true` | Whether to enable zoom controls. |
| `fullscreenEnabled` | `boolean` | `true` | Whether to enable fullscreen mode. |
| `mode` | `'normal' \| 'fullscreen' \| 'gallery' \| 'lightbox'` | `'normal'` | Current viewer mode. |
| `navigationControls` | `boolean` | `true` | Whether to show navigation controls in gallery mode. |
| `keyboardNavigation` | `boolean` | `true` | Whether to enable keyboard navigation. |
| `touchGestures` | `boolean` | `true` | Whether to enable touch gestures. |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | Color theme for controls. |
| `downloadButton` | `boolean` | `true` | Whether to show the image download button. |
| `physics` | `object` | See description | Physics configuration for interactions. |
| `width` | `string \| number` | `undefined` | Width of the viewer. |
| `height` | `string \| number` | `undefined` | Height of the viewer. |
| `borderRadius` | `string \| number` | `8` | Border radius of the viewer. |
| `background` | `string` | `'rgba(0, 0, 0, 0.2)'` | Background color/image for the viewer. |
| `className` | `string` | `undefined` | Additional CSS class. |
| `style` | `React.CSSProperties` | `undefined` | Additional inline styles. |
| `onImageClick` | `(image: ImageItem) => void` | `undefined` | Callback when image is clicked. |
| `onImageDoubleClick` | `(image: ImageItem) => void` | `undefined` | Callback when image is double-clicked. |
| `onFullscreenChange` | `(isFullscreen: boolean) => void` | `undefined` | Callback when fullscreen mode changes. |
| `onZoomChange` | `(zoomLevel: number) => void` | `undefined` | Callback when zoom level changes. |
| `onImageChange` | `(image: ImageItem, index: number) => void` | `undefined` | Callback when active image changes in gallery mode. |

### Default Physics Configuration

```tsx
{
  tension: 170,    // Spring stiffness
  friction: 26,    // Spring damping
  mass: 1,         // Object mass
  panDamping: 0.85, // Damping factor for panning
  inertia: 0.8     // Inertia factor for flick gestures
}
```

## GlassImageViewerRef Methods

The component exposes the following methods via a forwarded ref:

```tsx
interface GlassImageViewerRef {
  /** Programmatically set the zoom level */
  zoomTo: (level: number) => void;
  
  /** Programmatically pan the image */
  panTo: (position: { x: number, y: number }) => void;
  
  /** Reset zoom and pan to the initial state */
  resetView: () => void;
  
  /** Navigate to the next image in gallery mode */
  nextImage: () => void;
  
  /** Navigate to the previous image in gallery mode */
  prevImage: () => void;
  
  /** Toggle fullscreen mode */
  toggleFullscreen: () => void;
  
  /** Get the currently displayed image data */
  getCurrentImage: () => ImageItem;
  
  /** Get the current zoom level */
  getCurrentZoom: () => number;
  
  /** Get the current pan position */
  getCurrentPosition: () => { x: number, y: number };
  
  /** Get the main container DOM element */
  getContainerElement: () => HTMLDivElement | null;
}
```

## Physics-Based Animations

The `GlassImageViewer` component features several physics-based interactions:

1. **Zoom Spring Animation**: The zooming action uses spring physics to create natural, smooth transitions between zoom levels, whether triggered by controls, gestures, or programmatic calls.

2. **Inertial Panning**: When panning/dragging the image, the component implements inertial movement that continues with momentum after releasing, gradually slowing down with realistic physics.

3. **Flick Gesture**: Quick flick gestures on the image result in physics-based momentum that feels natural and responsive.

4. **Multi-touch Physics**: Pinch-to-zoom gestures use physics calculations to ensure smooth transitions based on the speed and scale of the gesture.

5. **Magnetic Boundaries**: When panning reaches the edge of the image, a subtle magnetic effect prevents the image from being panned too far out of view.

The physics behavior can be customized through the `physics` prop:

```tsx
<GlassImageViewer
  physics={{
    tension: 170,     // Higher = stiffer springs, faster but less smooth
    friction: 26,     // Higher = more damping, less bouncy
    mass: 1,          // Higher = more inertia, slower to start/stop
    panDamping: 0.85, // Higher = less momentum when panning
    inertia: 0.6      // Higher = more momentum for flick gestures
  }}
  // ...other props
/>
```

## Examples

### Basic Image Viewer

```tsx
<GlassImageViewer
  image={{
    src: '/path/to/image.jpg',
    alt: 'Sample image'
  }}
  width="100%"
  height="400px"
/>
```

### Gallery Mode

```tsx
<GlassImageViewer
  image={images[0]}
  images={images}
  mode="gallery"
  navigationControls={true}
  onImageChange={handleImageChange}
/>
```

### Fullscreen Mode

```tsx
<GlassImageViewer
  image={image}
  mode="fullscreen"
  showInfo={true}
  onFullscreenChange={handleFullscreenChange}
/>
```

### Custom Physics and Styling

```tsx
<GlassImageViewer
  image={image}
  glassVariant="tinted"
  blurStrength="strong"
  borderRadius={16}
  physics={{
    tension: 140,  // Softer springs
    friction: 30,  // More damping
    inertia: 0.9   // More inertial movement
  }}
  color="secondary"
/>
```

## Keyboard Navigation

The component supports the following keyboard shortcuts when `keyboardNavigation` is enabled:

- **+**: Zoom in
- **-**: Zoom out
- **0**: Reset zoom
- **Arrow keys**: Pan the image
- **F**: Toggle fullscreen mode
- **Esc**: Exit fullscreen or reset view
- **Left/Right** arrows: Previous/next image in gallery mode

## Touch Gestures

When `touchGestures` is enabled, the component supports:

- **Drag**: Pan the image
- **Pinch**: Zoom in/out
- **Double-tap**: Zoom in (at tap location)
- **Two-finger tap**: Zoom out
- **Flick**: Pan with momentum

## Accessibility

The `GlassImageViewer` component implements several accessibility features:

- Proper alt text support for images
- Keyboard navigation
- ARIA roles and attributes
- Focus management
- Respect for reduced motion preferences

## Best Practices

1. **Image Size**: Provide `width` and `height` properties in the `ImageItem` object when known to help with layout stability.

2. **Metadata**: Include descriptive metadata like titles and descriptions to enhance the user experience when `showInfo` is enabled.

3. **Responsive Design**: Consider using responsive units (percentages) for width/height to ensure the viewer adapts to different screen sizes.

4. **Motion Sensitivity**: Be mindful of users who may be sensitive to motion effects; the component respects the `prefers-reduced-motion` media query.

5. **Touch Interface**: When designing for touch devices, ensure there's enough space around the viewer to prevent accidental navigation away from it during gestures.

## Related Components

- `GlassCard`: Can be used as a container for the image viewer
- `GlassMasonry`: Works well with GlassImageViewer for creating photo galleries
