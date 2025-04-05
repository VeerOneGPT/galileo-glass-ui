# Galileo Glass UI - v1.0.19 Bug Fixes & Documentation Patches

This document tracks necessary code fixes and documentation updates planned for the v1.0.19 patch release based on feedback from implementing v1.0.18.

**Legend:**
*   ✅ = Completed / Resolved
*   ⏳ = Pending (Code Fix, Investigation, or Documentation Update)

---

## 1. `useAnimationSequence` API & Type Definition Issues (Severity: High) [✅ Resolved]

*   **Target Version:** 1.0.19
*   **Affected Hook:** `useAnimationSequence`
*   **Affected Documentation:** `docs/animations/orchestration.md`
*   **Affected Type Definitions:** `AnimationStage` union, `StyleAnimationStage`, `StaggerAnimationStage` (and potentially others), `AnimationSequenceResult`.

*   **Issue Summary:** The type definitions (`.d.ts`) generated for `useAnimationSequence` in v1.0.18 are significantly flawed, making the hook difficult or impossible to use correctly with TypeScript without workarounds or encountering errors.

*   **Issue 1.1: `targets` Property Type Incorrect** [✅ Code Fixed / ✅ Docs Done]
    *   **Problem:** The type definition for `AnimationStage['targets']` is incorrect/too strict, failing to accept standard React ref patterns like `() => Element | null` or arrays containing `null`.
    *   ~~**Required Fix (Code v1.0.19):** Correct the generated type definition for `targets` to accurately reflect its ability to accept functions returning `Element | null`, arrays potentially containing `null` elements, direct refs, or selector strings.~~ **DONE**
    *   **Doc Update:** [✅] Explain the v1.0.18 issue, provide temporary workarounds (`as any`), and show the correct intended usage post-fix.

*   **Issue 1.2: `AnimationStage` Structure Incorrect/Incomplete** [✅ Investigation Done / ✅ Code Fix Complete / ✅ Docs Done]
    *   **Problem:** Even with `targets` bypassed (`as any`), `TS2322` errors occur because the type definitions for the members of the `AnimationStage` union seem to be missing properties or are incorrectly defined.
    *   **Finding:** The generated `.d.ts` file *accurately reflects* the source `BaseAnimationStage` definition. The root cause appears to be that the **source `BaseAnimationStage` itself is too broad**, containing optional properties (like `order`, `position`, `dependencies`, `animation`) likely intended for internal use or a different hook (e.g., `useOrchestration`). This causes TS errors when defining simpler stages (like `StyleAnimationStage`) as TypeScript implicitly checks for these extra optional base properties.
    *   **Fix Implemented (Code v1.0.19):**
        * Created a separate public API type structure (`PublicBaseAnimationStage`, `PublicAnimationStage`) for use with `useAnimationSequence`
        * Added type converters to seamlessly translate between public and internal stage types
        * Updated `useAnimationSequence` to accept public types and return them
        * TypeScript users can now use the simpler public API types without internal-only properties
    *   **Doc Update:** [✅] Clearly document the **full required and optional structure** for defining each type of `AnimationStage`, emphasizing required fields like `type`, `id`, `duration`.

*   **Issue 1.3: Return Signature Missing `defaults`** [✅ Docs Done]
    *   **Problem:** The hook does not return the `defaults` object.
    *   **Confirmation:** This omission is intentional. ✅
    *   ~~**Doc Update:** [⏳] Reiterate that `defaults` is not returned. Clearly explain how to determine sequence end (manual calculation or `onComplete` callback).~~ **DONE**

*   **Issue 1.4: Return Signature Missing State/Reset** [✅ Docs Done]
    *   **Problem:** Lack of clarity on how to get playing state or reset the sequence.
    *   **Confirmation:** `isPlaying`/`status`/`reset` are not returned intentionally. ✅
    *   ~~**Doc Update:** [⏳] Reiterate managing playing state via callbacks + `useState`. Reiterate resetting via `seek(0)` + `pause()`.~~ **DONE**

---

## 2. `GlassMultiSelect` Prop Type Issue (Severity: Medium) [✅ Code Fixed / ✅ Docs]

*   **Target Version:** 1.0.19
*   **Affected Component:** `GlassMultiSelect`
*   **Affected Prop:** `itemRemoveAnimation`
*   **Affected Documentation:** `docs/components/glass-multiselect.md`

*   **Issue Summary:** The type definition (`.d.ts`) for the `itemRemoveAnimation` prop in v1.0.18 is incorrect.

*   **Problem:** Users encounter `TS2322` errors when trying to provide valid animation configurations.

*   ~~**Required Fix (Code v1.0.19):** Correct the generated type definition for `GlassMultiSelectProps['itemRemoveAnimation']`. Should accept structures like `{ type: 'spring', preset: ... }`, `{ type: 'spring', config: ... }`, or `false`.~~ **DONE**

*   ~~**Doc Update:** [⏳]~~ **DONE**
    *   ~~Update `docs/components/glass-multiselect.md` to clearly document the *correct* object structure required for `itemRemoveAnimation`.~~ **DONE**
    *   ~~Explain the v1.0.18 type error and recommend the `as any` workaround until v1.0.19 is released.~~ **DONE**

---

## 3. `GlassDataGrid` Missing Documentation (Severity: High) [✅ Initial Docs Done]

*   **Target Version:** 1.0.19
*   **Affected Component:** `GlassDataGrid`
*   **Affected Documentation:** `docs/components/glass-data-grid.md`

*   **Issue Summary:** `GlassDataGrid` lacked dedicated API documentation.

*   **Problem:** Users couldn't determine column structure, cell renderer signature, or available feature props.

*   ~~**Required Fix (Documentation v1.0.19):** Create/update comprehensive documentation based on source code analysis.~~ **DONE** (Initial draft/update completed based on v1.0.18 source analysis. Final review might be needed after v1.0.19 release).
    *   ~~Specify the underlying data grid library if applicable (likely TanStack Table v8) and link to its documentation for deeper details.~~ **Note:** Initial feedback suggested TanStack Table, but source code analysis (v1.0.18) revealed a custom implementation without TanStack. Documentation fix based on actual source.
    *   ~~Clearly define and provide TypeScript interfaces/types for: Column Definitions, Cell Renderer.~~ **DONE**
    *   ~~List and thoroughly explain *all* props accepted by the `<GlassDataGrid>` component.~~ **DONE**
    *   ~~Include practical code examples.~~ **DONE**

*   **Guidance Provided (Interim):** Advised user on likely patterns before source analysis was complete. ✅

---

## 4. `GlassCardLink` Missing Documentation (Severity: Medium) [✅ Docs Verified]

*   **Target Version:** 1.0.19
*   **Affected Component:** `GlassCardLink`
*   **Affected Documentation:** `docs/components/glass-card-link.md`

*   **Issue Summary:** Documentation file existed but needed verification.

*   **Problem:** User couldn't find official documentation.

*   ~~**Required Fix (Documentation v1.0.19):** Verify existing documentation against source code.~~ **DONE** (Documentation confirmed accurate).

*   **Related Task:** Confirmed Task 21 obsolete. ✅

---

## 6. Physics Hook Type Exports & Signature Discrepancies (Severity: Low - Mostly Resolved) [✅ Code Done / ✅ Docs Done]

*   **Target Version:** 1.0.19
*   **Affected Hooks:** `useGesturePhysics`, `useMagneticElement`, `usePhysicsInteraction`
*   **Affected Files/Docs:** `src/index.ts`, `src/animations/physics/useMagneticElement.ts`, `docs/hooks/physics-interaction.md`, relevant example files (`GesturePhysicsDemo.tsx`?, `MagneticElementDemo.tsx`?, `glass-card-example.tsx`?)
*   **Issue Summary:** Review of original Bug #6 report regarding potentially missing type exports and incorrect return signatures/options for core physics hooks.
*   **Status & Findings (v1.0.19 Check):**
    *   `GesturePhysicsOptions`: Confirmed exported. ✅
    *   `MagneticElementOptions`: Exported from source, not top-level index. ✅
    *   `PhysicsInteractionOptions`: Confirmed exported. Includes `rotationAmplitude`/`tiltAmplitude`/`scaleAmplitude`, not `*Factor`. ✅
    *   `useGesturePhysics` return (`isDragging`): Resolved externally. ✅
    *   `useMagneticElement` return (`style`): Resolved externally. ✅
*   **Required Fixes (v1.0.19):**
    *   ~~**(Code - Optional Improvement):** [⏳] Add `export type { MagneticElementOptions } from './animations/physics/useMagneticElement';` to `src/index.ts`.~~ **DONE**
    *   ~~**(Docs/Examples):** [⏳] Verify documentation and examples ensure they use `rotationAmplitude`/`tiltAmplitude` and `scaleAmplitude`, not `rotationFactor` or `scaleFactor`.~~ **DONE** - Found that existing docs and examples correctly use `rotationAmplitude`/`tiltAmplitude`/`scaleAmplitude` terminology.

---

## 7. Missing Exports & Unclear `usePhysicsInteraction` Prop (Severity: Low - Mostly Resolved) [✅ Code Done / ✅ Docs Done]

*   **Target Version:** 1.0.19
*   **Affected Hooks:** `useMagneticElement`
*   **Affected Files/Docs:** `src/index.ts`, docs for physics hooks
*   **Issue Summary:**  Follow-up from Bug #6, but specifically about `useMagneticElement` and the unclear `usePhysicsInteraction` prop.
*   **Status & Findings (v1.0.19 Check):**
    *   `MagneticElementOptions` type: Now exported from top-level index ✅
    *   Documentation correctly uses `rotationAmplitude`/`tiltAmplitude`/`scaleAmplitude` terminology ✅
*   **Required Fixes (v1.0.19):**
    *   ~~**Code:** [⏳] Add missing type export for `MagneticElementOptions` in `src/index.ts`~~ **DONE**
    *   ~~**Docs:** [⏳] Verify documentation and examples use correct terminology (`rotationAmplitude`, not `rotationFactor`, etc.)~~ **DONE** - Review found that documentation and examples already use the correct terminology.

---

## 8. `usePhysicsEngine` API Clarity & Usage Documentation (Severity: Medium) [✅ Investigation Done / ✅ Docs Done]

*   **Target Version:** 1.0.19
*   **Affected Hooks:** `usePhysicsEngine`, `useGalileoPhysicsEngine`
*   **Affected Documentation:** `docs/physics/engine-api.md`
*   **Issue Summary:** Need to clarify that `usePhysicsEngine` and `useGalileoPhysicsEngine` are identical and that either can be imported & used. `usePhysicsEngine` is an alias of `useGalileoPhysicsEngine` - either can be used interchangeably.
*   **Status & Findings (v1.0.19 Check):**
    *   The documentation already clearly explains the alias relationship in `docs/animations/physics/engine-api.md` with a note at the beginning and consistent references throughout the documentation. ✅
    *   Import examples show both options for importing either hook name. ✅
    *   Code examples show proper usage patterns. ✅
*   **Required Fixes (v1.0.19):**
    *   ~~**Investigation:** [⏳] Check current documentation for clarity on the alias relationship.~~ **DONE**
    *   ~~**Docs:** [⏳] Update documentation to explicitly state alias relationship and provide import examples for both.~~ **NOT NEEDED** - Documentation is already clear and comprehensive.

---

## 9. `use3DTransform` Broken Type Definitions (Severity: Low - Fixed) [✅ Investigation Done / ✅ Code Fixed]

*   **Target Version:** 1.0.19
*   **Affected Hook:** `use3DTransform`
*   **Affected Files:** `src/index.ts`, `src/animations/physics/use3DTransform.ts`
*   **Issue Summary:** Type definitions for `use3DTransform` were not correctly exported, making the hook difficult to use with TypeScript.
*   **Status & Findings (v1.0.19 Check):**
    *   In v1.0.19, the `use3DTransform` hook is now correctly exported directly from the source file ✅
    *   The associated types (`Transform3DOptions`, `Transform3DState`, `Transform3DResult`) are also properly exported ✅
*   **Required Fixes (v1.0.19):**
    *   ~~**Code:** Export `use3DTransform` directly from its source file in `src/index.ts`~~ **DONE**
    *   ~~**Code:** Export the necessary type definitions (`Transform3DOptions`, `Transform3DState`, `Transform3DResult`)~~ **DONE**