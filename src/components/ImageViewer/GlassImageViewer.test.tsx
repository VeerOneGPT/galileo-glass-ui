import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassImageViewer, ImageItem, GlassImageViewerRef } from './GlassImageViewer';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '../../contexts/AnimationContext';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock Image constructor for Jest
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Image = class {
    src: string = '';
    onload: () => void = () => {}; // Default onload handler
    onerror: () => void = () => {}; // Default onerror handler
    naturalWidth: number = 800; // Mock dimensions
    naturalHeight: number = 600;

    constructor() {
        // Simulate async loading completion
        setTimeout(() => {
            this.onload(); // Trigger onload event handler
        }, 50); // Small delay to mimic async nature
        return this;
    }
};

// Sample image data using the correct ImageItem type
const sampleImage: ImageItem = {
    src: 'https://via.placeholder.com/800x600',
    alt: 'Placeholder Image 1',
    thumbnail: 'https://via.placeholder.com/100x75',
    metadata: { title: 'Image 1' },
};

const sampleImages: ImageItem[] = [
    sampleImage,
    {
        src: 'https://via.placeholder.com/1024x768',
        alt: 'Placeholder Image 2',
        thumbnail: 'https://via.placeholder.com/100x75',
        metadata: { title: 'Image 2', description: 'Second image description' },
    },
];

describe('GlassImageViewer', () => {
    test('renders single image correctly', async () => {
        render(
            <AnimationProvider>
                <ThemeProvider>
                    <GlassImageViewer image={sampleImage} />
                </ThemeProvider>
            </AnimationProvider>
        );
        const imgElement = await screen.findByRole('img', { name: /Placeholder Image 1/i });
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', sampleImage.src);
    });

    test('renders gallery images correctly', async () => {
        render(
            <AnimationProvider>
                <ThemeProvider>
                    <GlassImageViewer image={sampleImages[0]} images={sampleImages} mode="gallery" />
                </ThemeProvider>
            </AnimationProvider>
        );
        // Initially shows the first image
        const imgElement = await screen.findByRole('img', { name: /Placeholder Image 1/i });
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', sampleImages[0].src);
    });

    test('forwards ref correctly', async () => {
        const ref = React.createRef<GlassImageViewerRef>();
        render(
            <AnimationProvider>
                <ThemeProvider>
                    <GlassImageViewer ref={ref} image={sampleImage} />
                </ThemeProvider>
            </AnimationProvider>
        );

        expect(ref.current).toBeDefined();
        // Check for a few key methods exposed by the ref
        expect(typeof ref.current?.zoomTo).toBe('function');
        expect(typeof ref.current?.resetView).toBe('function');
        expect(typeof ref.current?.getCurrentImage).toBe('function');
    });

    // Add more tests here for:
    // - Zoom functionality (if testable without complex interaction)
    // - Pan functionality (if testable)
    // - Gallery navigation (clicking next/prev if controls are rendered)
    // - Fullscreen toggle
    // - Keyboard navigation
    // - Touch gestures (might require more complex setup)
    // - Different props (glass effects, controls visibility, etc.)
});