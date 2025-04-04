import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAmbientTilt } from '../useAmbientTilt';
import { useReducedMotion } from '../useReducedMotion';

// Mock useReducedMotion
jest.mock('../useReducedMotion', () => ({
    useReducedMotion: jest.fn(() => false),
}));

// Mock Element for bounding rect
class MockElement {
    getBoundingClientRect() {
        return { top: 100, left: 100, width: 200, height: 150 };
    }
}

describe('useAmbientTilt', () => {
    let mockAddEventListener: jest.SpyInstance;
    let mockRemoveEventListener: jest.SpyInstance;
    let mockElement: MockElement; // Declare mockElement
    let mouseMoveHandler: ((event: MouseEvent) => void) | undefined;

    beforeEach(() => {
        mockElement = new MockElement(); // Instantiate MockElement
        mockAddEventListener = jest.spyOn(window, 'addEventListener');
        mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');
        // Capture the handler when addEventListener is called
        mockAddEventListener.mockImplementation((event, handler) => {
            if (event === 'mousemove') {
                mouseMoveHandler = handler as (event: MouseEvent) => void;
            }
        });
        (useReducedMotion as jest.Mock).mockReturnValue(false);
        jest.useFakeTimers(); // Enable fake timers
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers(); // Disable fake timers
        // Ensure mouseMoveHandler is reset
        mouseMoveHandler = undefined; 
    });

    it('should initialize and return default style object', () => {
        const { result } = renderHook(() => useAmbientTilt());
        expect(result.current.style).toHaveProperty('transform');
        expect(result.current.style).toHaveProperty('perspective');
        expect(result.current.style.transform).toContain('rotateX(0deg)');
        expect(result.current.style.transform).toContain('rotateY(0deg)');
    });

    it('should attach mousemove listener when enabled', () => {
        renderHook(() => useAmbientTilt({ enabled: true }));
        expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), expect.any(Object));
    });

    it('should NOT attach mousemove listener when disabled', () => {
        renderHook(() => useAmbientTilt({ enabled: false }));
        expect(mockAddEventListener).not.toHaveBeenCalledWith('mousemove', expect.any(Function), expect.any(Object));
    });

    it('should remove mousemove listener on unmount', () => {
        const { unmount } = renderHook(() => useAmbientTilt({ enabled: true }));
        // Listener is attached on mount
        const attachedListener = mockAddEventListener.mock.calls.find(call => call[0] === 'mousemove')?.[1];
        expect(attachedListener).toBeDefined();

        unmount();
        expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', attachedListener, expect.any(Object));
    });

    it('should update transform style on mousemove', () => {
        const { result } = renderHook(() => useAmbientTilt({ enabled: true, smoothingFactor: 0 })); // Disable smoothing for direct check
        
        // Ensure listener was attached and handler captured
        expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), expect.any(Object));
        expect(mouseMoveHandler).toBeDefined();

        const initialTransform = result.current.style.transform;

        // Simulate mouse move event near top-left corner
        act(() => {
            mouseMoveHandler?.(new MouseEvent('mousemove', {
                clientX: 100, // 10% of width (1000)
                clientY: 80,  // 10% of height (800)
            }));
        });

        // Check that transform style has changed
        expect(result.current.style.transform).not.toBe(initialTransform);
        // Check for specific rotation values (these depend on the hook's internal calculation)
        // Example: Assuming top-left movement causes positive rotateX and negative rotateY
        expect(result.current.style.transform).toMatch(/rotateX\(\d+\.\d+deg\)/); // Positive X rotation
        expect(result.current.style.transform).toMatch(/rotateY\(-\d+\.\d+deg\)/); // Negative Y rotation

         // Simulate mouse move event near bottom-right corner
         act(() => {
            mouseMoveHandler?.(new MouseEvent('mousemove', {
                clientX: 900, // 90% of width
                clientY: 720, // 90% of height
            }));
        });
        
         // Example: Assuming bottom-right movement causes negative rotateX and positive rotateY
        expect(result.current.style.transform).toMatch(/rotateX\(-\d+\.\d+deg\)/); // Negative X rotation
        expect(result.current.style.transform).toMatch(/rotateY\(\d+\.\d+deg\)/); // Positive Y rotation
    });

    it('should not update transform style on mousemove when reduced motion is preferred', () => {
        (useReducedMotion as jest.Mock).mockReturnValue(true); // Enable reduced motion
        const { result } = renderHook(() => useAmbientTilt({ enabled: true }));
        
        // Ensure listener was attached and handler captured
        expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function), expect.any(Object));
        expect(mouseMoveHandler).toBeDefined();

        const initialTransform = result.current.style.transform;
        expect(initialTransform).toContain('rotateX(0deg)'); // Should be initial state
        expect(initialTransform).toContain('rotateY(0deg)');

        // Simulate mouse move event
        act(() => {
            mouseMoveHandler?.(new MouseEvent('mousemove', {
                clientX: 100, 
                clientY: 80,  
            }));
        });

        // Transform style should NOT have changed
        expect(result.current.style.transform).toBe(initialTransform);
    });

    it('should calculate rotation based on viewport center', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

        // Use separate maxRotateX and maxRotateY
        const { result } = renderHook(() => useAmbientTilt({ 
            enabled: true, 
            maxRotateX: 10, 
            maxRotateY: 10 
        }));

        // const mouseMoveHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'mousemove')?.[1];
        // ^ Handler is now captured in beforeEach
        expect(mouseMoveHandler).toBeDefined();

        // Simulate mouse move to bottom-left quadrant
        act(() => {
            const event = new MouseEvent('mousemove', { clientX: 200, clientY: 600 });
            if (typeof mouseMoveHandler === 'function') { // Type guard
                mouseMoveHandler(event);
            }
        });

        // Wait for potential debounced updates (if any)
        jest.advanceTimersByTime(100); 
        
        const style = result.current.style;
        // Expect rotation values based on mouse position relative to center (500, 400)
        // relativeX = (200 - 500) / 500 = -0.6
        // relativeY = (600 - 400) / 400 = 0.5
        // rotateY ≈ -relativeX * maxRotateY ≈ -(-0.6) * 10 = 6
        // rotateX ≈ relativeY * maxRotateX ≈ 0.5 * 10 = 5
        expect(style?.transform).toContain('rotateX(5deg)'); 
        expect(style?.transform).toContain('rotateY(6deg)');
    });

    test('should respect maxRotate limits', () => {
        // ... existing code ...
    });

    // TODO: Test configuration options like maxRotation, smoothingFactor
}); 