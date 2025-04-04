import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassTabBar } from './GlassTabBar'; // Correct path assumed
import { TabItem, TabBarRef } from './types'; // Use TabItem, import TabBarRef
import { ThemeProvider } from '../../theme'; // Adjust path if needed
import { AnimationProvider } from '../../contexts/AnimationContext'; // Need AnimationProvider for physics

// Helper to render with ThemeProvider AND AnimationProvider
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider>
            <AnimationProvider>{ui}</AnimationProvider>
        </ThemeProvider>
    );
};

// Sample Tabs using TabItem type
const sampleTabs: TabItem[] = [
    { id: 'tab1', label: 'Tab One', value: 'one' }, // Add value if needed by component
    { id: 'tab2', label: 'Tab Two', value: 'two' },
    { id: 'tab3', label: 'Tab Three', value: 'three' },
];

describe('GlassTabBar', () => {
    it('should render tabs correctly', () => {
        // Use index 0 for activeTab and correct onChange prop
        renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={0} onChange={() => {}} />);
        expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Tab Three' })).toBeInTheDocument();
    });

    it('should set initial active tab correctly', () => {
        renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={1} onChange={() => {}} />); // Start with Tab Two active
        expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
        expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tab', { name: 'Tab Three' })).toHaveAttribute('aria-selected', 'false');
    });

    it('should call onChange and update active tab on click', async () => {
        const handleChange = jest.fn();
        renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={0} onChange={handleChange} />);

        const tabTwo = screen.getByRole('tab', { name: 'Tab Two' });
        expect(tabTwo).toHaveAttribute('aria-selected', 'false');

        await act(async () => {
            fireEvent.click(tabTwo);
        });

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(1, 'two'); // Expect index 1, value 'two'

        // The component updates its internal state, or relies on parent re-render with new activeTab prop.
        // We re-render with the new prop to simulate parent state update.
        const { rerender } = renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={0} onChange={handleChange} />);
        rerender(<GlassTabBar tabs={sampleTabs} activeTab={1} onChange={handleChange} />); // Rerender with updated active tab

        await waitFor(() => {
            expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'false');
            expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'true');
        });
    });

    it('should handle keyboard navigation (ArrowRight, ArrowLeft, Home, End)', async () => {
        const handleChange = jest.fn();
        renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={0} onChange={handleChange} />);
        const tablist = screen.getByRole('tablist');
        const tabOne = screen.getByRole('tab', { name: 'Tab One' });
        const tabTwo = screen.getByRole('tab', { name: 'Tab Two' });
        const tabThree = screen.getByRole('tab', { name: 'Tab Three' });

        // Initial focus on active tab (usually handled internally by component on render or interaction)
        await act(async () => {
           tabOne.focus(); 
        });
        expect(tabOne).toHaveFocus();

        // ArrowRight -> Tab Two
        await act(async () => {
            fireEvent.keyDown(tablist, { key: 'ArrowRight' });
        });
        expect(tabTwo).toHaveFocus();

        // ArrowRight -> Tab Three
        await act(async () => {
            fireEvent.keyDown(tablist, { key: 'ArrowRight' });
        });
        expect(tabThree).toHaveFocus();

        // ArrowRight -> Wrap to Tab One
        await act(async () => {
            fireEvent.keyDown(tablist, { key: 'ArrowRight' });
        });
        expect(tabOne).toHaveFocus();

        // ArrowLeft -> Wrap to Tab Three
        await act(async () => {
            fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
        });
        expect(tabThree).toHaveFocus();

        // Home -> Tab One
        await act(async () => {
             fireEvent.keyDown(tablist, { key: 'Home' });
        });
        expect(tabOne).toHaveFocus();

        // End -> Tab Three
        await act(async () => {
            fireEvent.keyDown(tablist, { key: 'End' });
        });
        expect(tabThree).toHaveFocus();

        // Enter on focused Tab Three should trigger change
        await act(async () => {
             fireEvent.keyDown(tablist, { key: 'Enter' });
        });
        expect(handleChange).toHaveBeenCalledWith(2, 'three');
    });

    it('should animate indicator to the active tab', async () => {
        const { rerender } = renderWithProviders(<GlassTabBar tabs={sampleTabs} activeTab={0} onChange={() => {}} />);
        // Find indicator (assuming a specific data-testid or role)
        const indicator = await screen.findByRole('presentation', {hidden: true}); // Adjust selector as needed
        const initialLeft = indicator.style.left;

        // Change active tab by re-rendering (simulates parent update)
        rerender(<GlassTabBar tabs={sampleTabs} activeTab={1} onChange={() => {}} />);

        // Wait for the indicator's style.left to change
        await waitFor(() => {
            const currentLeft = indicator.style.left;
            expect(currentLeft).not.toBe(initialLeft);
            // Optionally check it's a positive pixel value if it moves right
            expect(currentLeft).toMatch(/\d+px/);
        }, { timeout: 1000 }); // Timeout for animation

        const secondLeft = indicator.style.left;

        // Change active tab again
         rerender(<GlassTabBar tabs={sampleTabs} activeTab={2} onChange={() => {}} />);
         await waitFor(() => {
            expect(indicator.style.left).not.toBe(secondLeft);
         }, { timeout: 1000 });
    });

    it('should forward ref and allow calling imperative methods', () => {
        const ref = createRef<TabBarRef>();
        const handleChange = jest.fn();
        renderWithProviders(<GlassTabBar ref={ref} tabs={sampleTabs} activeTab={0} onChange={handleChange} data-testid="tab-bar"/>);

        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.selectTab).toBe('function');
        expect(typeof ref.current?.getContainerElement).toBe('function');
        expect(typeof ref.current?.getTabElements).toBe('function');

        const containerElement = ref.current?.getContainerElement();
        expect(containerElement).toBeInstanceOf(HTMLDivElement);
        expect(screen.getByTestId('tab-bar')).toBe(containerElement);

        // Test getTabElements
        const tabElements = ref.current?.getTabElements();
        expect(tabElements).toHaveLength(sampleTabs.length);
        expect(tabElements?.[0]).toHaveTextContent('Tab One');

        // Test selectTab
        act(() => {
            ref.current?.selectTab(2); // Select Tab Three
        });
        expect(handleChange).toHaveBeenCalledWith(2, 'three');
        // Need to re-render with updated prop to see aria-selected change
        // (Imperative handle likely just calls the passed onChange)
    });
});