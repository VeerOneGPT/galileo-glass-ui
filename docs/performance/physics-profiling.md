# Performance Profiling for Galileo Physics

**Status:** Guide

## Overview

Physics simulations can be computationally intensive. Understanding how to measure and optimize the performance of Galileo's physics engine within your application is crucial for maintaining a smooth user experience, especially on lower-end devices or in complex scenes.

This guide focuses on using standard browser developer tools and React-specific tools to profile and identify performance bottlenecks related to Galileo physics.

## Tools

1.  **Browser Developer Tools - Performance Tab:**
    *   **Purpose:** Records detailed timelines of browser activity, including JavaScript execution, rendering, layout, and painting.
    *   **Usage:**
        *   Open your browser's developer tools (usually F12).
        *   Navigate to the "Performance" tab.
        *   Click the "Record" button.
        *   Interact with the parts of your application using Galileo physics.
        *   Stop recording.
    *   **Analysis:**
        *   **Main Thread Activity:** Look for long tasks (red triangles) in the "Main" track. Hover over them to see what functions are taking the most time.
        *   **Bottom-Up / Call Tree:** Analyze these views to pinpoint specific functions within Galileo (e.g., `engine.step()`, `engine.update()`, `resolveCollision`, `integrateObject`) or your own application code (event handlers, state updates triggered by physics) that are consuming significant CPU time.
        *   **Frame Rate (FPS):** Monitor the "Frames" track. Consistent dips below 60 FPS (or your target frame rate) indicate performance issues.
        *   **Scripting Time:** High scripting time often points to heavy JavaScript calculations, common in physics engines.

2.  **React Developer Tools - Profiler:**
    *   **Purpose:** Specifically analyzes React component render times and identifies why components re-rendered.
    *   **Usage:**
        *   Ensure you have the React DevTools browser extension installed.
        *   Open the React DevTools tab in your browser's developer tools.
        *   Select the "Profiler" tab.
        *   Click "Record".
        *   Interact with your physics-enabled components.
        *   Stop recording.
    *   **Analysis:**
        *   **Flamegraph / Ranked Chart:** Identify components that render frequently or take a long time to render. While the physics engine runs outside React's render cycle, state updates triggered by physics (e.g., updating styles based on `getBodyState`) can cause component re-renders. Check if these re-renders are necessary or if they can be optimized (e.g., using `React.memo`, optimizing state updates).
        *   **"Why did this render?"** Use this feature (if enabled in DevTools settings) to understand the cause of re-renders.

## Galileo-Specific Optimization Tips

When profiling reveals bottlenecks related to Galileo physics, consider these strategies:

1.  **Reduce Body Count:** The most significant factor is often the number of active physics bodies. Remove bodies that are no longer needed using `engine.removeBody(id)`.
2.  **Enable Sleeping:** Ensure `enableSleeping: true` (default) is set in the engine configuration. Bodies that come to rest will stop being simulated, saving significant CPU time. Adjust `velocitySleepThreshold`, `angularSleepThreshold`, and `sleepTimeThreshold` if needed, but defaults are usually reasonable.
3.  **Simplify Collision Shapes:** Use simpler shapes (`circle`) where possible, as collision checks are generally faster than for `rectangle` or `polygon` (though implementation details matter).
4.  **Optimize Collision Filters:** *(Requires Collision System Implementation)* If using collision groups/masks, ensure they are set up efficiently to minimize unnecessary collision checks between bodies that should not interact.
5.  **Throttle State Updates:** If you are reading physics state (`getAllBodyStates`) on every frame to update React component styles, ensure this update process is efficient. Avoid triggering unnecessary re-renders of large component trees.
    *   Consider updating styles directly on DOM elements if performance is critical and React state updates are too slow (use with caution).
    *   Debounce or throttle frequent state updates derived from physics if exact real-time sync isn't visually necessary.
6.  **Engine Configuration:**
    *   `fixedTimeStep`: Increasing this value (e.g., `1/30` instead of `1/60`) reduces simulation frequency but can decrease accuracy and visual smoothness.
    *   `maxSubSteps`: Reducing this limits how many simulation steps run per frame if the frame rate drops, preventing further spirals but potentially sacrificing accuracy.
7.  **Check Custom Logic:** Profile any complex calculations performed within physics event callbacks (`onCollisionStart`, etc.) or loops that interact with the engine frequently.

## Example Scenario

*(TODO: Add a brief example showing a potential bottleneck identified in the Performance tab and how one of the tips above could address it)*

## Further Reading

*   [Browser DevTools Performance Tab Documentation (MDN/Chrome Dev)](https://developer.chrome.com/docs/devtools/performance/)
*   [React DevTools Profiler Documentation](https://react.dev/learn/react-developer-tools#profiler) 