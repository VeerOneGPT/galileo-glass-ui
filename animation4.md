# Galileo Glass UI v1.0.14 - PRD: Features 1-11

This document outlines the requirements for features 1 through 11 planned for the `v1.0.14` release of the Galileo Glass UI library.

---

## 1. Advanced Physics Constraints

**Goal:** Extend the `useGalileoPhysicsEngine` hook to support common physics constraints between bodies, enabling more complex and realistic simulations.

**Requirements:**

*   Implement support for at least `DistanceConstraint` (fixed distance between two points on two bodies) and `HingeConstraint` (allows rotation around a single point).
*   Provide clear API methods within the engine instance returned by `useGalileoPhysicsEngine` to add/remove constraints (e.g., `engine.addConstraint(options)`, `engine.removeConstraint(constraintId)`).
*   Ensure constraints interact correctly with existing forces, collisions, and body properties.
*   Update type definitions for the engine and constraint options.

**Files to Update/Create:**

*   `src/physics/galileoPhysicsSystem.ts`: Implement core constraint logic.
*   `src/hooks/useGalileoPhysicsEngine.ts`: Expose constraint methods via the hook's return value.
*   `src/types/physics.ts`: Add type definitions for `ConstraintOptions`, `DistanceConstraintOptions`, `HingeConstraintOptions`, etc.
*   `docs/physics/engine-api.md`: Document the new constraint APIs.
*   `examples/physics/ConstraintsDemo.tsx` (New): Create a Storybook example demonstrating constraint usage.

**Tasks:**

*   [ ] Design constraint API structure and options interfaces.
*   [ ] Implement `DistanceConstraint` logic within the physics engine core.
*   [ ] Implement `HingeConstraint` logic within the physics engine core.
*   [ ] Add `addConstraint` and `removeConstraint` methods to the engine wrapper.
*   [ ] Expose constraint methods through the `useGalileoPhysicsEngine` hook.
*   [ ] Write unit tests for distance constraints.
*   [ ] Write unit tests for hinge constraints.
*   [ ] Update `physics.ts` type definitions.
*   [ ] Document constraints in `engine-api.md`.
*   [ ] Create `ConstraintsDemo.tsx` Storybook example.

---

## 2. Physics-Based Layout Hook (`usePhysicsLayout`)

**Goal:** Create a hook that uses the physics engine to dynamically arrange a list of child elements (e.g., in a grid, stack, or freeform layout) with smooth, physics-based transitions.

**Requirements:**

*   The hook (`usePhysicsLayout`) should accept an array of refs to the elements to be laid out and configuration options (layout type: 'grid' | 'stack' | 'freeform', spacing, physics parameters like stiffness/damping).
*   It should internally manage physics bodies for each element and apply forces or constraints to guide them towards their target positions based on the chosen layout.
*   Elements should animate smoothly to new positions when the layout configuration or the number of elements changes.
*   Should provide props/styles to apply to each child element for positioning.
*   Consider performance implications for a large number of elements.

**Files to Update/Create:**

*   `src/hooks/usePhysicsLayout.ts` (New): Implement the core hook logic.
*   `src/types/hooks.ts`: Add type definitions for the hook's options and return value.
*   `src/physics/utils/layoutForces.ts` (New - potentially): Helper functions for calculating layout-specific forces/targets.
*   `docs/hooks/physics-layout.md` (New): Document the `usePhysicsLayout` hook.
*   `examples/hooks/PhysicsLayoutDemo.tsx` (New): Create a Storybook example demonstrating different layout types.

**Tasks:**

*   [ ] Design the API and options for `usePhysicsLayout`.
*   [ ] Implement the core logic for managing physics bodies based on element refs.
*   [ ] Implement force/constraint logic for 'grid' layout.
*   [ ] Implement force/constraint logic for 'stack' layout.
*   [ ] Implement basic 'freeform' behavior (e.g., gentle repulsion).
*   [ ] Handle dynamic changes in elements or configuration.
*   [ ] Develop strategy for applying calculated positions/styles to elements.
*   [ ] Write unit/integration tests for the hook.
*   [ ] Add type definitions.
*   [ ] Document the hook in `physics-layout.md`.
*   [ ] Create `PhysicsLayoutDemo.tsx` Storybook example.

---

## 3. Enhanced Collision Events

**Goal:** Provide more detailed information within the collision event callbacks (`onCollisionStart`, `onCollisionEnd`, `onCollisionActive`) returned by `useGalileoPhysicsEngine`.

**Requirements:**

*   Collision events should include additional data points like:
    *   `impactForce` (magnitude of the collision impact).
    *   `collisionPoint` (approximate point of contact in world coordinates).
    *   `relativeVelocity` (velocity difference between the bodies at the point of contact).
*   This data should be calculated accurately within the physics engine's collision resolution step.
*   Update type definitions for the `CollisionEvent` object.

**Files to Update/Create:**

*   `src/physics/galileoPhysicsSystem.ts`: Modify collision detection/resolution logic to calculate and store detailed event data.
*   `src/types/physics.ts`: Update the `CollisionEvent` interface.
*   `docs/physics/engine-api.md`: Update documentation for collision events.
*   `examples/physics/*`: Update existing physics demos if they use collision events to showcase new data.

**Tasks:**

*   [ ] Research/implement methods for calculating impact force within the physics engine.
*   [ ] Research/implement methods for determining collision point.
*   [ ] Research/implement methods for calculating relative velocity at collision.
*   [ ] Integrate calculations into the physics engine's collision handling pipeline.
*   [ ] Pass the enhanced data through the event emission system.
*   [ ] Update the `CollisionEvent` type definition.
*   [ ] Write unit tests verifying the new collision data.
*   [ ] Update documentation and examples.

---

## 4. New Animation Presets

**Goal:** Expand the available animation presets within the `AnimationProvider` to include common UI feedback patterns.

**Requirements:**

*   Define and implement at least three new animation presets:
    *   `shake`: A rapid side-to-side or subtle vibration, useful for indicating errors in input fields.
    *   `pulse`: A gentle scaling or opacity animation to draw attention to an element.
    *   `confetti`: A (potentially simplified) particle burst effect suitable for success confirmations.
*   Presets should be configurable (e.g., intensity of shake, color of confetti) via the `AnimationProvider` theme or directly when using animation hooks.
*   Ensure presets work correctly with `useReducedMotion`.

**Files to Update/Create:**

*   `src/animations/presets.ts` (New or Update): Define the keyframes and default configurations for the new presets.
*   `src/theme/defaultTheme.ts`: Add default configurations for the new presets to the theme structure.
*   `src/providers/AnimationProvider.tsx`: Integrate new presets into the context.
*   `src/types/animations.ts`: Update types related to animation presets.
*   `docs/animations/context-config.md`: Document the new presets.
*   `examples/animations/PresetsDemo.tsx` (New or Update): Add demonstrations of the new presets.

**Tasks:**

*   [ ] Define keyframes for the `shake` animation.
*   [ ] Define keyframes/logic for the `pulse` animation.
*   [ ] Define keyframes/logic for the `confetti` effect (consider simplification if full particles are too complex).
*   [ ] Integrate presets into `presets.ts` and the theme.
*   [ ] Ensure presets are accessible via `AnimationProvider`.
*   [ ] Add configuration options and default values.
*   [ ] Implement `useReducedMotion` alternatives for each preset.
*   [ ] Write tests for applying presets.
*   [ ] Document the new presets.
*   [ ] Add examples to Storybook.

---

## 5. Physics Performance Profiling Tools/Guidance

**Goal:** Provide developers with tools or guidance on how to measure and understand the performance impact of Galileo physics animations within their applications.

**Requirements:**

*   **Option A (Integration):** Integrate a simple performance overlay component (`PhysicsPerfMonitor`?) that displays key metrics (FPS, number of active bodies, collision checks/ms) when using `useGalileoPhysicsEngine`.
*   **Option B (Documentation):** Create a dedicated documentation page explaining how to use browser developer tools (Performance tab) and React DevTools profiler to identify performance bottlenecks related to Galileo physics. Include tips specific to the library (e.g., impact of body count, collision complexity, `isSleeping` state).
*   The chosen solution should be easy for developers to use and understand.

**Files to Update/Create:**

*   *(Option A)* `src/components/PhysicsPerfMonitor.tsx` (New): Implement the overlay component.
*   *(Option A)* `src/hooks/useGalileoPhysicsEngine.ts`: Potentially add hooks for the monitor to tap into engine stats.
*   *(Option A)* `src/types/components.ts`: Add types for the monitor.
*   `docs/performance/physics-profiling.md` (New): Write the documentation guide (mandatory for Option B, good for Option A too).
*   `examples/performance/PhysicsProfilingDemo.tsx` (New): Demonstrate the monitor (Option A) or link to the guide (Option B).

**Tasks:**

*   [ ] Decide between Option A (Integrated Tool) and Option B (Documentation Focus).
*   *If Option A:*
    *   [ ] Design the `PhysicsPerfMonitor` component UI/API.
    *   [ ] Implement logic to gather stats from the physics engine.
    *   [ ] Build the React component for the overlay.
    *   [ ] Write tests for the monitor component.
    *   [ ] Create Storybook example.
*   *Documentation (Both Options):*
    *   [ ] Outline the content for `physics-profiling.md`.
    *   [ ] Detail usage of browser performance tools for physics analysis.
    *   [ ] Provide specific tips related to Galileo physics optimization (sleeping bodies, collision layers, etc.).
    *   [ ] Write the `physics-profiling.md` document.

---

## 6. Physics-Driven Data Grid (`GlassDataGrid`)

**Goal:** Create a new `GlassDataGrid` component that displays tabular data with advanced features like sortable columns and potentially draggable rows, using the physics engine for smooth visual feedback.

**Requirements:**

*   Component should accept data (array of objects) and column definitions.
*   Render data in a table/grid structure with the Galileo Glass aesthetic.
*   Implement column sorting: Clicking a column header sorts the data, potentially with a physics-based animation on the sort indicator or rows reordering.
*   *(Stretch Goal)* Implement draggable rows: Allow users to reorder rows via drag-and-drop, with physics providing inertia and smooth drop animations.
*   Leverage existing components where possible (e.g., `Table`, `GlassCard`).
*   Ensure accessibility (keyboard navigation for sorting/reordering).

**Files to Update/Create:**

*   `src/components/GlassDataGrid/GlassDataGrid.tsx` (New)
*   `src/components/GlassDataGrid/GlassDataGridHeader.tsx` (New)
*   `src/components/GlassDataGrid/GlassDataGridRow.tsx` (New)
*   `src/components/GlassDataGrid/index.ts` (New)
*   `src/hooks/useSortableData.ts` (New - potentially): Hook to manage sorting state.
*   `src/hooks/useDraggableListPhysics.ts` (New - potentially): Hook leveraging physics for drag/drop reordering.
*   `src/types/components.ts`: Add types for `GlassDataGridProps`, etc.
*   `docs/components/glass-data-grid.md` (New): Document the component.
*   `examples/components/GlassDataGridDemo.tsx` (New): Storybook example.

**Tasks:**

*   [ ] Design the `GlassDataGrid` API (props for data, columns, features).
*   [ ] Implement basic grid rendering with Glass styling.
*   [ ] Implement column header rendering and click handling.
*   [ ] Implement data sorting logic (using `useSortableData` hook or similar).
*   [ ] Add physics-based animation to the sort indicator/transition.
*   [ ] *(Stretch)* Design drag-and-drop interaction for rows.
*   [ ] *(Stretch)* Implement `useDraggableListPhysics` hook.
*   [ ] *(Stretch)* Integrate row dragging into `GlassDataGrid`.
*   [ ] *(Stretch)* Implement visual lifting effect (z-depth change/perspective shift) for dragged row (Inspired by 1.1 Depth-Aware Interactions).
*   [ ] Implement keyboard navigation for sorting/reordering.
*   [ ] Write unit and integration tests.
*   [ ] Add type definitions.
*   [ ] Document the component.
*   [ ] Create Storybook example.

---

## 7. Glass Stepper Component (`GlassStepper`)

**Goal:** Introduce a `GlassStepper` component to guide users through multi-step processes or workflows, incorporating physics-based transitions between steps.

**Requirements:**

*   Component should display steps (e.g., icons or numbers with labels) horizontally or vertically.
*   Indicate the active step, completed steps, and optional steps.
*   Provide navigation controls (Next/Back buttons) or allow programmatic control.
*   Transitions between steps should utilize the Galileo animation system (e.g., animating the active indicator, content transitions if content is managed within).
*   Apply Galileo Glass styling to the stepper elements.
*   Ensure accessibility (keyboard navigation between steps/controls).

**Files to Update/Create:**

*   `src/components/GlassStepper/GlassStepper.tsx` (New)
*   `src/components/GlassStepper/GlassStep.tsx` (New)
*   `src/components/GlassStepper/GlassStepIcon.tsx` (New)
*   `src/components/GlassStepper/GlassStepLabel.tsx` (New)
*   `src/components/GlassStepper/index.ts` (New)
*   `src/types/components.ts`: Add types for `GlassStepperProps`, `GlassStepProps`.
*   `docs/components/glass-stepper.md` (New): Document the component.
*   `examples/components/GlassStepperDemo.tsx` (New): Storybook example.

**Tasks:**

*   [ ] Design the `GlassStepper` API (props for steps, activeStep, orientation, handlers).
*   [ ] Implement horizontal layout rendering.
*   [ ] Implement vertical layout rendering.
*   [ ] Implement styling for active, completed, and default steps.
*   [ ] Integrate Galileo Glass effects.
*   [ ] Implement animation for active step indicator transition (consider ripple/pulse effect inspired by 1.1 Fluid Transitions).
*   [ ] *(Optional)* Implement content transition animations if stepper manages content panes.
*   [ ] Implement keyboard navigation.
*   [ ] Write unit and integration tests.
*   [ ] Add type definitions.
*   [ ] Document the component.
*   [ ] Create Storybook example.

---

## 8. Refined Chart Interactivity (`GlassDataChart`)

**Goal:** Enhance the existing `GlassDataChart` component with physics-based interactions like zoom/pan or interactive data points.

**Requirements:**

*   **Option A (Zoom/Pan):** Implement zoom and pan functionality for charts (especially Line, Bar, Area) using mouse wheel/drag gestures. Transitions during zoom/pan should be smoothed using physics (e.g., `useGalileoStateSpring` or direct engine use for inertial panning).
*   **Option B (Interactive Points):** Make data points on charts (e.g., points on a line chart, bars on a bar chart) interactive. Hovering could trigger a physics-based scale/glow animation, and clicking could trigger a callback.
*   Choose one option (A or B) for `v1.0.14`.
*   Interaction should feel natural and responsive.
*   Ensure interaction works well with existing tooltips.

**Files to Update/Create:**

*   `src/components/GlassDataChart/ChartRenderer.tsx`: Implement core interaction logic.
*   `src/components/GlassDataChart/hooks/useChartPhysicsInteraction.ts` (New - potentially): Encapsulate physics logic for zoom/pan or point interaction.
*   `src/components/GlassDataChart/GlassDataChart.tsx`: Update props to enable/configure new interactions.
*   `src/types/charts.ts`: Update chart prop types.
*   `docs/components/glass-charts.md`: Document the new interaction features.
*   `examples/charts/*`: Update chart demos to showcase new interactions.

**Tasks:**

*   [ ] Choose primary interaction feature (Zoom/Pan or Interactive Points).
*   *If Zoom/Pan:*
    *   [ ] Implement gesture detection (wheel, drag) on the chart canvas/container.
    *   [ ] Implement logic to update chart scales based on gestures.
    *   [ ] Use physics hooks/engine to smooth scale/translation transitions.
    *   [ ] Handle axis updates during zoom/pan.
    *   [ ] *(Optional) Implement subtle background distortion effect during chart zoom/pan interaction (Inspired by 1.1 Material Property Physics).*
*   *If Interactive Points:*
    *   [ ] Implement hover/click detection on chart data elements.
    *   [ ] Define physics-based animations for hover/click states (scale, glow).
    *   [ ] Apply animations to targeted data points.
    *   [ ] Implement click callback prop.
*   [ ] Ensure compatibility with existing tooltips and chart features.
*   [ ] Write tests for the new interaction.
*   [ ] Update type definitions.
*   [ ] Document the feature.
*   [ ] Update Storybook examples.

---

## 9. `forwardRef` Audit & Completion

**Goal:** Systematically review all core components and ensure `React.forwardRef` is implemented correctly where appropriate, improving composability and consistency.

**Requirements:**

*   Audit all components exported from `src/index.ts` (and potentially key internal ones).
*   Identify components that render a primary DOM element and would benefit from exposing a ref to that element.
*   Implement `React.forwardRef` for identified components, ensuring correct typing for the ref handle.
*   Verify that refs work as expected (e.g., accessing the underlying DOM node).

**Files to Update/Create:**

*   Multiple `src/components/**/*.tsx` files will be updated.
*   Potentially update relevant type definition files (`src/types/*.ts`).

**Tasks:**

*   [ ] Create a checklist of all exported components.
*   [ ] Review each component's implementation and purpose.
*   [ ] Identify components suitable for `forwardRef`.
*   [ ] Implement `forwardRef` with correct typings for component X.
*   [ ] Implement `forwardRef` with correct typings for component Y.
*   [ ] ... (repeat for all identified components) ...
*   [ ] Add/update tests to verify ref forwarding for modified components.
*   [ ] Ensure no build errors or type regressions are introduced.

---

## 10. Composite Component Examples

**Goal:** Create new documentation sections or Storybook examples demonstrating how to combine multiple Galileo components and hooks to build more complex, realistic UI patterns.

**Requirements:**

*   Develop at least two distinct examples of composite patterns. Examples could include:
    *   An interactive dashboard widget using `GlassCard`, `GlassDataChart`, and physics hooks.
    *   A settings panel using `GlassTabs`, `GlassSwitch`, `Slider`, and layout components.
    *   An animated notification system using `GlassCard`, `useAnimationSequence`, and feedback components.
*   Examples should showcase best practices for integrating Galileo components and features.
*   Provide clear code snippets and explanations.

**Files to Update/Create:**

*   `docs/examples/composite-patterns.md` (New): A dedicated documentation page for these patterns.
*   OR
*   `examples/patterns/DashboardWidgetDemo.tsx` (New)
*   `examples/patterns/SettingsPanelDemo.tsx` (New)
*   `(Potentially update existing docs/examples)`

**Tasks:**

*   [ ] Brainstorm and select 2-3 suitable composite patterns.
*   [ ] Design the structure and components for Pattern 1 (e.g., Dashboard Widget).
*   [ ] Implement Pattern 1 using Galileo components/hooks.
*   [ ] Design the structure and components for Pattern 2 (e.g., Settings Panel).
*   [ ] Implement Pattern 2 using Galileo components/hooks.
*   [ ] Write clear explanations and code snippets for each pattern.
*   [ ] Decide on documentation format (new page vs. new Storybook examples).
*   [ ] Create the documentation page or Storybook files.
*   [ ] Review examples for clarity and best practices.

---

## 11. Optional Glass Focus Ring (New - Inspired by v1.1)

**Goal:** Provide an optional, aesthetically pleasing focus indicator using glass effects and animation, enhancing accessibility and visual feedback in line with the v1.1 direction.

**Requirements:**

*   Create a utility component or hook (`GlassFocusRing`? `useGlassFocus`?) that can be applied to interactive elements.
*   On focus, display an animated (e.g., pulsing glow, subtle outline expansion) focus indicator using glass styling (blur, color appropriate to the theme).
*   The animation should respect `useReducedMotion` preferences, providing a static but clear glass-styled ring as a fallback.
*   Ensure the focus indicator does not interfere with element layout and has appropriate z-index.
*   Make it easy to apply to existing Galileo components or custom interactive elements.

**Files to Update/Create:**

*   `src/components/GlassFocusRing/GlassFocusRing.tsx` (New - if component approach) OR `src/hooks/useGlassFocus.ts` (New - if hook approach)
*   `src/styles/focusRingStyles.ts` (New - potentially)
*   `src/types/accessibility.ts` (Update or New)
*   `docs/accessibility/focus-indicators.md` (New or Update): Document the new focus style option.
*   `examples/accessibility/FocusRingDemo.tsx` (New): Storybook example demonstrating usage.

**Tasks:**

*   [ ] Decide between component vs. hook implementation approach.
*   [ ] Design the visual appearance and animation of the glass focus ring.
*   [ ] Define the reduced motion fallback appearance.
*   [ ] Implement the chosen approach (component or hook).
*   [ ] Integrate with theme system for colors/styles.
*   [ ] Ensure proper accessibility (clear visibility, respects reduced motion).
*   [ ] Write unit tests.
*   [ ] Document the usage and configuration.
*   [ ] Create Storybook example(s).
