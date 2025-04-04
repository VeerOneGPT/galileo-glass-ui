import React, { useRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components'; // If checking styled-component styles

import { GlassFocusRing } from '../GlassFocusRing';
import { ThemeProvider } from '../../../theme'; // Adjust path if needed
import * as ReducedMotionHook from '../../../hooks/useReducedMotion'; // Import hook for mocking

// Mock useReducedMotion
const mockUseReducedMotion = jest.spyOn(ReducedMotionHook, 'useReducedMotion');

// Helper to render with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
};

// Test component with a focusable element
const FocusableComponent = ({ disabled = false }: { disabled?: boolean }) => {
    return (
        <GlassFocusRing disabled={disabled}>
            <button>Focus Me</button>
        </GlassFocusRing>
    );
};

describe('GlassFocusRing', () => {
    beforeEach(() => {
        // Reset mocks
        mockUseReducedMotion.mockClear();
    });

    it('should render without crashing', () => {
        renderWithTheme(<FocusableComponent />);
        expect(screen.getByRole('button', { name: /Focus Me/i })).toBeInTheDocument();
        // Ring element should exist but may not be visible initially
        expect(screen.getByTestId('glass-focus-ring-element')).toBeInTheDocument(); 
    });

    it('should show the ring when the child element receives focus', async () => {
        renderWithTheme(<FocusableComponent />);
        const button = screen.getByRole('button', { name: /Focus Me/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');

        // Initially hidden (check opacity)
        expect(focusRing).toHaveStyle('opacity: 0');
        
        // Focus the button
        fireEvent.focus(button);

        // Wait for transition/state update
        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 1');
            // Optionally check transform as well
            // expect(focusRing).toHaveStyle('transform: scale(1)'); 
        });
    });

    it('should hide the ring when the child element loses focus', async () => {
        renderWithTheme(<FocusableComponent />);
        const button = screen.getByRole('button', { name: /Focus Me/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');

        // Focus the button first
        fireEvent.focus(button);
        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 1');
        });

        // Blur the button
        fireEvent.blur(button);

        // Wait for transition/state update
        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 0');
            // Optionally check transform
            // expect(focusRing).toHaveStyle('transform: scale(0.95)');
        });
    });

    it('should not show the ring if disabled', async () => {
        renderWithTheme(<FocusableComponent disabled={true} />);
        const button = screen.getByRole('button', { name: /Focus Me/i });
        
        // Focus the button
        fireEvent.focus(button);
        
        // Ring should NOT be in the DOM if disabled
        expect(screen.queryByTestId('glass-focus-ring-element')).not.toBeInTheDocument();
    });

    it('should apply animation styles by default when focused', async () => {
        mockUseReducedMotion.mockReturnValue(false); // Ensure reduced motion is OFF
        renderWithTheme(<FocusableComponent />);
        const button = screen.getByRole('button', { name: /Focus Me/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');

        fireEvent.focus(button);

        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 1');
            // Check if animation property is applied (presence is enough)
            // The exact value depends on styled-components processing
            expect(focusRing).toHaveStyleRule('animation', expect.stringContaining('focusRingAnimation'));
        });
    });

    it('should NOT apply animation styles when reduced motion is preferred', async () => {
        mockUseReducedMotion.mockReturnValue(true); // Force reduced motion ON
        renderWithTheme(<FocusableComponent />);
        const button = screen.getByRole('button', { name: /Focus Me/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');

        fireEvent.focus(button);

        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 1');
            // Check that animation property is NOT applied
             // Note: Checking for absence can be tricky. 
             // styled-components might omit the rule or set it to 'none'.
             // Let's check it's not the expected animation name.
            expect(focusRing).not.toHaveStyleRule('animation', expect.stringContaining('focusRingAnimation'));
            // Or check if the computed style is 'none' or empty
            // const styles = window.getComputedStyle(focusRing);
            // expect(styles.animationName).toBe('none'); // Or match expected non-animated state
        });
    });

    // Add tests for props:

    it('should apply offset correctly', () => {
        const offsetValue = 5;
        renderWithTheme(
            <GlassFocusRing offset={offsetValue}>
                <button>Offset Test</button>
            </GlassFocusRing>
        );
        const focusRing = screen.getByTestId('glass-focus-ring-element');
        expect(focusRing).toHaveStyle(`top: -${offsetValue}px`);
        expect(focusRing).toHaveStyle(`left: -${offsetValue}px`);
        expect(focusRing).toHaveStyle(`right: -${offsetValue}px`);
        expect(focusRing).toHaveStyle(`bottom: -${offsetValue}px`);
    });

    it('should adjust border-radius correctly', async () => {
        const radiusAdjustValue = 10;
        const baseRadius = 6; // Assuming default or easily testable base
        renderWithTheme(
            <GlassFocusRing radiusAdjust={radiusAdjustValue}>
                <button style={{ borderRadius: `${baseRadius}px` }}>Radius Test</button>
            </GlassFocusRing>
        );
        const button = screen.getByRole('button', { name: /Radius Test/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');
        
        // Focus to trigger CSS variable calculation
        fireEvent.focus(button);
        
        await waitFor(() => {
            // Check computed style after potential variable update
            const expectedRadius = `calc(${baseRadius}px + ${radiusAdjustValue}px)`;
            // Note: Directly testing calc() might be fragile. 
            // Check if the value includes the adjustment part.
            // Alternatively, mock getComputedStyle if needed for precision.
            expect(focusRing).toHaveStyleRule('border-radius', expect.stringContaining(`${radiusAdjustValue}px`));
        });
    });

    it('should apply custom color correctly', () => {
        const customColor = 'rgb(255, 0, 0)'; // Red
        renderWithTheme(
            <GlassFocusRing color={customColor}>
                <button>Color Test</button>
            </GlassFocusRing>
        );
        const focusRing = screen.getByTestId('glass-focus-ring-element');
        expect(focusRing).toHaveStyle(`border-color: ${customColor}`);
        // Check box-shadow color includes the custom color (ignoring opacity part)
        expect(focusRing).toHaveStyleContaining(`box-shadow: 0 0 8px 2px ${customColor}`);
    });

    it('should apply ring thickness correctly', () => {
        const thicknessValue = 4;
        renderWithTheme(
            <GlassFocusRing ringThickness={thicknessValue}>
                <button>Thickness Test</button>
            </GlassFocusRing>
        );
        const focusRing = screen.getByTestId('glass-focus-ring-element');
        expect(focusRing).toHaveStyle(`border-width: ${thicknessValue}px`);
    });
    
    it('should disable pulse animation via prop even if reduced motion is off', async () => {
        mockUseReducedMotion.mockReturnValue(false); // Ensure reduced motion is OFF
        renderWithTheme(
            <GlassFocusRing pulseAnimation={false}>
                <button>No Pulse Prop Test</button>
            </GlassFocusRing>
        );
        const button = screen.getByRole('button', { name: /No Pulse Prop Test/i });
        const focusRing = screen.getByTestId('glass-focus-ring-element');

        fireEvent.focus(button);

        await waitFor(() => {
            expect(focusRing).toHaveStyle('opacity: 1');
            // Animation should NOT be applied due to pulseAnimation={false}
            expect(focusRing).not.toHaveStyleRule('animation', expect.stringContaining('focusRingAnimation'));
        });
    });

    // TODO: Add tests for reduced motion (checking animation styles)
}); 