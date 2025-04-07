# Galileo Glass UI v1.0.23 - Changelog

## Release Date: [April 8, 2025]

## Overview

Version 1.0.23 is primarily a **corrective release** focused on addressing critical build configuration issues, export errors, and functional regressions identified following the v1.0.22 release. This version stabilizes the library by ensuring all documented hooks and components are correctly exported and usable, fixing major bugs in animation and interaction systems, and resolving visual glitches. Documentation has also been significantly updated to reflect accurate usage patterns.

## 🐛 Bug Fixes

### Build & Export Issues

*   **Systemic Export Fixes (Multiple Bugs - #8, #19, #20, #21):** Resolved fundamental build configuration problems in `rollup.config.js` and `package.json` that prevented several hooks and components (especially nested ones) from being included in the final bundles and correctly exported. Added explicit export paths for affected modules.
*   **`useParticleSystem` Export (Bug #16):** Fixed build issue preventing `useParticleSystem` from being exported. Verified it's importable from main entry and `/hooks`.
*   **`Card` Component Export (Bug #17):** Fixed build issue preventing `Card` and its sub-components from being exported, resolving runtime errors.
*   **`useChartPhysicsInteraction` Export (Bug #21):** Fixed build configuration and export paths to ensure the hook is correctly exported and bundled, resolving runtime errors.
*   **`useMagneticElement` Export (Bug #19):** Fixed build configuration to ensure the hook is exported correctly via the `./magnetic` path.
*   **`useAnimationSequence` Export (Bug #20):** Fixed build configuration to ensure the hook is exported correctly via the `./animations/sequence` path.

### Hook Functionality

*   **`useAnimationSequence` Initialization (Bug #20):**
    *   Applied a core fix to the initialization logic, aiming to correctly apply initial `from` styles just before the first animation frame. This is intended to resolve the critical issue where elements targeted by the sequence failed to render or initialize properly without manual workarounds. *(Verification Required)*
    *   Resolved internal TypeScript type import errors within the hook and consuming components.
*   **`usePhysicsInteraction({ type: 'magnetic' })` (Bug #19):** Corrected the internal force calculation logic to ensure `strength` polarity correctly determines attraction vs. repulsion.
*   **`useMagneticElement` Usage (Bug #19):** While the export was fixed, the primary issue was incorrect documentation. Usage requires manual style application based on the hook's return values. Documentation updated accordingly.

### Component Functionality & Visuals

*   **`DataChart` Visual Glitches (Bug #21):**
    *   Fixed legend cutoff issues by implementing flexbox layout and `min-height` on the container.
    *   Resolved layering issues where the glass/frost effect overlapped chart content by adjusting `z-index` and margins.

## ✨ Enhancements

*   No major feature enhancements were included in this release, as the focus was entirely on bug fixing, stabilization, and build process correction.

## 📚 Documentation

*   **Corrected Usage Examples:** Updated documentation for `useMagneticElement` and `useAnimationSequence` with accurate usage patterns, examples, and workarounds based on debugging and fixes.
*   **New Release Notes:** Added detailed fix logs (`1.0.23-fixes.md`) and build notes (`1.0.23-build-notes.md`).
*   **Troubleshooting Guide:** Added a troubleshooting section to the release notes covering common import errors and hook-specific issues for v1.0.23+.

## 💻 Development & Performance

*   Corrected build configuration (`rollup.config.js`, `package.json`) to ensure proper bundling and export of all intended modules.
*   The fix applied to `useAnimationSequence` initialization logic might slightly improve performance by applying initial styles more efficiently.

---

**Full Release Date:** [Placeholder] 