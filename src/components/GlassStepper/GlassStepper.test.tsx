import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { GlassStepper } from './GlassStepper';
import { Step } from './types';
// Import the real AnimationProvider
import { AnimationProvider } from '../../contexts/AnimationContext';
// ThemeProvider is mocked below
// import { ThemeProvider } from '../../theme'; 

// Mock ThemeProvider to avoid complex interactions
jest.mock('../../theme', () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock sub-components - Simplify GlassStep mock, remove forwardRef for now
jest.mock('./GlassStep', () => {
    const React = require('react'); 
    return {
        // Simpler mock without forwardRef initially
        GlassStep: jest.fn(({ step, active, completed, onClick }: any) => (
            <div 
                data-testid={`step-${step.id}`} 
                data-active={active}
                data-completed={completed}
                onClick={onClick}
            >
                {step.label}
            </div>
        )),
    }
});

const sampleSteps: Step[] = [
  { id: 'step1', label: 'Step 1' },
  { id: 'step2', label: 'Step 2' },
  { id: 'step3', label: 'Step 3' },
];

// Restore renderWithTheme helper, now wrapping with MockThemeProvider and REAL AnimationProvider
const renderWithTheme = (ui: React.ReactElement) => {
    const MockThemeProvider = require('../../theme').ThemeProvider;
    return render(
        <MockThemeProvider>
            <AnimationProvider>
                {ui}
            </AnimationProvider>
        </MockThemeProvider>
    );
};

describe('GlassStepper', () => {
    
    beforeEach(() => {
        (require('./GlassStep').GlassStep as jest.Mock).mockClear(); 
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('renders the correct number of steps and connectors', () => {
        const { container } = renderWithTheme(<GlassStepper steps={sampleSteps} />); 
        const steps = screen.getAllByText(/Step \d/);
        expect(steps).toHaveLength(sampleSteps.length);

        // Check for connectors (N-1)
        // Assuming StepConnector renders a div with specific style or testid
        // Example: Find divs that are likely connectors (might be fragile)
        const potentialConnectors = container.querySelectorAll('div[aria-hidden="true"]');
        expect(potentialConnectors.length).toBe(sampleSteps.length - 1);
    });

    test('renders vertically when orientation is vertical', () => {
        const { container } = renderWithTheme(<GlassStepper steps={sampleSteps} orientation="vertical" />);
        const stepperContainer = screen.getByRole('tablist'); // Use role
        expect(stepperContainer).toHaveStyle('flex-direction: column');
    });

    test('renders horizontally by default', () => {
        renderWithTheme(<GlassStepper steps={sampleSteps} />);
        const stepperContainer = screen.getByRole('tablist'); // Use role
        expect(stepperContainer).toHaveStyle('flex-direction: row');
    });

    test('passes correct active and completed props to GlassStep', () => {
        const activeStepIndex = 1;
        renderWithTheme(<GlassStepper steps={sampleSteps} activeStep={activeStepIndex} />); 
        const step1 = screen.getByTestId('step-step1');
        const step2 = screen.getByTestId('step-step2');
        const step3 = screen.getByTestId('step-step3');

        expect(step1).toHaveAttribute('data-active', 'false');
        expect(step2).toHaveAttribute('data-active', 'true');
        expect(step3).toHaveAttribute('data-active', 'false');

        expect(step1).toHaveAttribute('data-completed', 'true');
        expect(step2).toHaveAttribute('data-completed', 'false');
        expect(step3).toHaveAttribute('data-completed', 'false');
    });

    test('calls onStepClick with correct index when a step is clicked', () => {
        const handleClick = jest.fn();
        renderWithTheme(<GlassStepper steps={sampleSteps} onStepClick={handleClick} />); 
        const step2 = screen.getByTestId('step-step2');
        fireEvent.click(step2);

        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledWith(1); // Step 2 is at index 1
    });

    describe('Keyboard Navigation', () => {
        test('calls onStepClick with next index on ArrowRight/Down', () => {
            const handleClick = jest.fn();
            renderWithTheme(
                <GlassStepper steps={sampleSteps} activeStep={0} onStepClick={handleClick} />
            );
            const stepperContainer = screen.getByRole('tablist');
            stepperContainer.focus();

            fireEvent.keyDown(stepperContainer, { key: 'ArrowRight' });
            expect(handleClick).toHaveBeenCalledWith(1);
            
            fireEvent.keyDown(stepperContainer, { key: 'ArrowDown' });
            expect(handleClick).toHaveBeenCalledWith(1); // Should still be 1 as activeStep prop hasn't changed
            expect(handleClick).toHaveBeenCalledTimes(2); // Called twice now
        });

        test('calls onStepClick with previous index on ArrowLeft/Up', () => {
             const handleClick = jest.fn();
             renderWithTheme(
                <GlassStepper steps={sampleSteps} activeStep={1} onStepClick={handleClick} />
            );
            const stepperContainer = screen.getByRole('tablist');
            stepperContainer.focus();

            fireEvent.keyDown(stepperContainer, { key: 'ArrowLeft' });
            expect(handleClick).toHaveBeenCalledWith(0);
            
            fireEvent.keyDown(stepperContainer, { key: 'ArrowUp' });
             expect(handleClick).toHaveBeenCalledWith(0);
             expect(handleClick).toHaveBeenCalledTimes(2);
        });

        test('calls onStepClick with first index on Home', () => {
            const handleClick = jest.fn();
             renderWithTheme(
                <GlassStepper steps={sampleSteps} activeStep={2} onStepClick={handleClick} />
            );
            const stepperContainer = screen.getByRole('tablist');
            stepperContainer.focus();

            fireEvent.keyDown(stepperContainer, { key: 'Home' });
            expect(handleClick).toHaveBeenCalledWith(0);
        });

        test('calls onStepClick with last index on End', () => {
            const handleClick = jest.fn();
             renderWithTheme(
                <GlassStepper steps={sampleSteps} activeStep={0} onStepClick={handleClick} />
            );
            const stepperContainer = screen.getByRole('tablist');
            stepperContainer.focus();

            fireEvent.keyDown(stepperContainer, { key: 'End' });
            expect(handleClick).toHaveBeenCalledWith(sampleSteps.length - 1);
        });
        
        test('does not call onStepClick at boundaries', () => {
            const handleClick = jest.fn();
            const { rerender } = renderWithTheme(
                <GlassStepper steps={sampleSteps} activeStep={0} onStepClick={handleClick} />
            );
            const stepperContainer = screen.getByRole('tablist');
            stepperContainer.focus();

            fireEvent.keyDown(stepperContainer, { key: 'ArrowLeft' });
            fireEvent.keyDown(stepperContainer, { key: 'ArrowUp' });
            expect(handleClick).not.toHaveBeenCalled();
            
            // Update rerender call to also include providers
            const MockThemeProvider = require('../../theme').ThemeProvider;
            rerender(
                 <MockThemeProvider>
                    <AnimationProvider>
                        <GlassStepper steps={sampleSteps} activeStep={sampleSteps.length - 1} onStepClick={handleClick} />
                    </AnimationProvider>
                </MockThemeProvider>
            );
            
            // Focus might be lost on rerender, re-acquire
            const stepperContainerLast = screen.getByRole('tablist'); 
            stepperContainerLast.focus();
            
            fireEvent.keyDown(stepperContainerLast, { key: 'ArrowRight' });
            fireEvent.keyDown(stepperContainerLast, { key: 'ArrowDown' });
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Indicator Physics Animation', () => {
        // Helper to get transform style
        const getIndicatorTransform = () => {
            const indicator = screen.getByTestId('stepper-indicator');
            return window.getComputedStyle(indicator).transform;
        };

        test('should animate indicator position when activeStep changes', async () => {
            const { rerender } = renderWithTheme(<GlassStepper steps={sampleSteps} activeStep={0} />);
            
            const initialTransform = getIndicatorTransform();
            expect(initialTransform).not.toBe('none'); // Ensure initial transform is set

            act(() => {
                // Update rerender call
                const MockThemeProvider = require('../../theme').ThemeProvider;
                rerender(
                    <MockThemeProvider>
                        <AnimationProvider>
                             <GlassStepper steps={sampleSteps} activeStep={1} />
                        </AnimationProvider>
                    </MockThemeProvider>
                );
            });

            // Advance timers to allow animation
            act(() => {
                jest.advanceTimersByTime(100); // Small step
            });
            
            // Check intermediate state (transform should have changed)
            const intermediateTransform = getIndicatorTransform();
            expect(intermediateTransform).not.toBe(initialTransform);

            // Advance timers further to let animation (likely) finish
            act(() => {
                jest.advanceTimersByTime(500); 
            });

            let finalTransformStep1: string | null = null;
            await waitFor(() => {
                const currentTransform = getIndicatorTransform();
                // Check it's different from initial
                expect(currentTransform).not.toBe(initialTransform); 
                // Check it has settled (doesn't change significantly after more time - harder to test precisely)
                // For simplicity, we store this value
                finalTransformStep1 = currentTransform;
                expect(finalTransformStep1).toBeTruthy();
            });

            act(() => {
                // Update rerender call
                const MockThemeProvider = require('../../theme').ThemeProvider;
                rerender(
                    <MockThemeProvider>
                        <AnimationProvider>
                            <GlassStepper steps={sampleSteps} activeStep={0} />
                        </AnimationProvider>
                    </MockThemeProvider>
                );
            });

            act(() => {
                jest.advanceTimersByTime(500); // Allow animation to complete
            });

            await waitFor(() => {
                const currentTransform = getIndicatorTransform();
                 // Expect it to return to the initial state (or very close)
                expect(currentTransform).toBe(initialTransform); 
                expect(currentTransform).not.toBe(finalTransformStep1); 
            });
        });
    });

}); 