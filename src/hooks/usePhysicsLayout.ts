import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useGalileoPhysicsEngine, PhysicsBodyOptions, Vector2D } from '../animations/physics'; // Adjust path
import { 
  PhysicsLayoutOptions, 
  PhysicsLayoutResult, 
  LayoutType, 
  PhysicsLayoutItemConfig // Import new type
} from '../types/hooks'; // Import from new types file
import { GalileoPhysicsSystem, PhysicsObjectConfig, PhysicsObject } from '../animations/physics/galileoPhysicsSystem';
// import { useDebouncedCallback } from 'use-debounce'; // Comment out
// import { usePrevious } from '../utils/usePrevious'; // Comment out

// --- Removed Old Default --- 
// const DEFAULT_LAYOUT_OPTIONS: Required<Omit<PhysicsLayoutOptions, 'gridColumns' | 'containerSize' | 'itemPhysics'>> = {
//   layoutType: 'grid',
//   spacing: 10, 
//   stiffness: 100,
//   damping: 15,
//   mass: 1,
//   friction: 0.1,
// };

// --- Default Configs --- 
const DEFAULT_PHYSICS_CONFIG: Required<NonNullable<PhysicsLayoutOptions['physicsConfig']>> = {
    stiffness: 0.15,
    damping: 0.8,
    mass: 1,
    friction: 0.1,
};

const DEFAULT_GRID_OPTIONS: Required<NonNullable<PhysicsLayoutOptions['gridOptions']>> = {
  columns: 3,
  rowSpacing: 10,
  columnSpacing: 10,
};

const DEFAULT_STACK_OPTIONS: Required<NonNullable<PhysicsLayoutOptions['stackOptions']>> = {
  direction: 'vertical',
  spacing: 5,
  offsetStep: { x: 0, y: 0 },
};

const DEFAULT_FREEFORM_OPTIONS: Required<NonNullable<PhysicsLayoutOptions['freeformOptions']>> = {
  gravity: { x: 0, y: 0 },
  repulsionStrength: 5000,
  repulsionRadius: 50,
  centerAttraction: 0,
};

// Default physics config for items if not provided
const DEFAULT_ITEM_PHYSICS: Required<PhysicsLayoutItemConfig> = {
  stiffness: 0.15,
  damping: 0.8,
  mass: 1,
  friction: 0.1,
};

// Helper function to get physics config for an item
const getItemPhysicsConfig = (
  mergedOpts: Required<PhysicsLayoutOptions>,
  index: number,
  bodyId: string // Keep bodyId param even if unused for now, API consistency
): Required<PhysicsLayoutItemConfig> => {
  const globalDefaults = mergedOpts.physicsConfig;
  const itemConfigs = mergedOpts.itemPhysicsConfigs;
  let itemConfig: Partial<PhysicsLayoutItemConfig> | undefined | null = null;

  // Access itemPhysicsConfigs as an array
  if (Array.isArray(itemConfigs) && itemConfigs[index]) {
    itemConfig = itemConfigs[index];
  }

  // Merge item-specific config over global defaults, then ensure all properties are present using DEFAULT_ITEM_PHYSICS
  const mergedItemConfig = { ...globalDefaults, ...(itemConfig || {}) };

  return {
    stiffness: mergedItemConfig.stiffness ?? DEFAULT_ITEM_PHYSICS.stiffness,
    damping: mergedItemConfig.damping ?? DEFAULT_ITEM_PHYSICS.damping,
    mass: mergedItemConfig.mass ?? DEFAULT_ITEM_PHYSICS.mass,
    friction: mergedItemConfig.friction ?? DEFAULT_ITEM_PHYSICS.friction,
  };
};


/**
 * Galileo Hook: usePhysicsLayout
 * 
 * Arranges a list of child elements using physics-based transitions.
 * 
 * @param itemCount The number of items to lay out.
 * @param options Configuration options for the layout and physics.
 * @returns An object containing props getters for the container and items.
 */
export const usePhysicsLayout = (
  itemCount: number,
  options: PhysicsLayoutOptions // Input options can be partial
): PhysicsLayoutResult => {

  // Deep merge options with defaults
  const mergedOptions = useMemo((): Required<PhysicsLayoutOptions> => {
    return {
      layoutType: options.layoutType ?? 'grid',
      physicsConfig: { ...DEFAULT_PHYSICS_CONFIG, ...options.physicsConfig },
      gridOptions: { ...DEFAULT_GRID_OPTIONS, ...options.gridOptions },
      stackOptions: { ...DEFAULT_STACK_OPTIONS, ...options.stackOptions },
      freeformOptions: { ...DEFAULT_FREEFORM_OPTIONS, ...options.freeformOptions },
      bounds: options.bounds,
      itemPhysicsConfigs: options.itemPhysicsConfigs ?? [],
      initialPositions: options.initialPositions ?? [],
    };
  }, [options]);

  const engine = useGalileoPhysicsEngine({
    gravity: mergedOptions.freeformOptions.gravity,
    defaultDamping: mergedOptions.physicsConfig.damping, 
  });

  const elementRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const bodyIdsRef = useRef<string[]>([]);
  const elementSizeMap = useRef<Map<string, { width: number; height: number }>>(new Map());
  const [styles, setStyles] = useState<{ [key: string]: React.CSSProperties }>({});
  const targetPositionsRef = useRef<Map<string, Vector2D>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null); // Define containerRef here

  // Adjust refs map when itemCount changes
  useEffect(() => {
    const currentBodyIds = bodyIdsRef.current;
    const newBodyIds: string[] = [];
    const bodyIdsToRemove: string[] = [];
    const currentIdsSet = new Set(currentBodyIds);

    for (let i = 0; i < itemCount; i++) {
      const existingId = currentBodyIds[i];
      const bodyId = existingId && !newBodyIds.includes(existingId)
        ? existingId
        : `layout_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`;
      newBodyIds.push(bodyId);
      if (!existingId || !currentIdsSet.has(existingId)) {
        elementRefs.current.set(bodyId, null);
      }
    }

    currentBodyIds.forEach(id => {
      if (!newBodyIds.includes(id)) {
        bodyIdsToRemove.push(id);
      }
    });

    bodyIdsRef.current = newBodyIds;
    bodyIdsToRemove.forEach(id => {
      engine.removeBody(id);
      elementRefs.current.delete(id);
      elementSizeMap.current.delete(id);
      targetPositionsRef.current.delete(id);
      setStyles(s => { const ns = { ...s }; delete ns[id]; return ns; });
    });

    newBodyIds.forEach(id => {
      if (!styles[id]) {
        setStyles(s => ({ ...s, [id]: { position: 'absolute', visibility: 'hidden' } }));
      }
    });

  }, [itemCount, engine]);


  // Initialize/update physics bodies
  useEffect(() => {
    if (!engine) return;

    const currentEngineBodyIds = new Set(engine.getAllBodyStates().keys());

    bodyIdsRef.current.forEach((bodyId, index) => {
      const config = getItemPhysicsConfig(mergedOptions, index, bodyId); // Use helper with mergedOptions
      const initialPos = mergedOptions.initialPositions?.[index];

      // Use container dimensions for initial placement if needed
      const containerRect = containerRef.current?.getBoundingClientRect();
      const containerW = containerRect?.width ?? 600;
      const containerH = containerRect?.height ?? 400;
      const defaultInitialPosition = {
        x: containerW / 2 + (Math.random() - 0.5) * 50,
        y: containerH / 2 + (Math.random() - 0.5) * 50
      };

      const bodyOptions: PhysicsBodyOptions = {
        id: bodyId,
        shape: { type: 'rectangle', width: 50, height: 50 },
        position: initialPos ?? defaultInitialPosition,
        mass: config.mass,
        friction: config.friction,
        // damping: config.damping, // Damping is often applied by engine globally or via forces
        userData: { index },
      };

      if (!currentEngineBodyIds.has(bodyId)) {
        engine.addBody(bodyOptions);
      } else {
        engine.updateBodyState(bodyId, {
          // mass: config.mass, // Changing mass dynamically can be tricky
          // friction: config.friction, // REMOVE: friction is not in PhysicsBodyState
          // Update damping if the engine supports setting it per-body directly
        });
      }
    });

    // Use mergedOptions directly as dependency, ensures rerun if any config changes
    // Also add itemCount to ensure it re-runs when the number of required bodies changes.
  }, [engine, mergedOptions, itemCount]);


  // Function to calculate target positions (memoized)
  const calculateTargetPositions = useCallback((): Map<string, Vector2D> => {
    const newTargetPositions = new Map<string, Vector2D>();
    const orderedBodyIds = bodyIdsRef.current;
    if (orderedBodyIds.length === 0) return newTargetPositions;

    const bounds = mergedOptions.bounds;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerWidth = bounds ? bounds.right - bounds.left : containerRect?.width ?? window.innerWidth;
    const containerHeight = bounds ? bounds.bottom - bounds.top : containerRect?.height ?? window.innerHeight;
    const containerOffsetX = bounds ? bounds.left : containerRect?.left ?? 0;
    const containerOffsetY = bounds ? bounds.top : containerRect?.top ?? 0;

    if (mergedOptions.layoutType === 'grid') {
      const { columns, rowSpacing, columnSpacing } = mergedOptions.gridOptions;
      if (columns <= 0) return newTargetPositions;

      let currentGridX = containerOffsetX; // Start at container edge/bound
      let currentGridY = containerOffsetY;
      let maxRowHeight = 0;
      let rowWidths: number[] = Array(Math.ceil(orderedBodyIds.length / columns)).fill(0);
      let totalGridWidth = 0;

      // Calculate row widths and max total width
      orderedBodyIds.forEach((bodyId, index) => {
          const elementWidth = elementSizeMap.current.get(bodyId)?.width ?? 50;
          const rowIndex = Math.floor(index / columns);
          const colIndex = index % columns;
          rowWidths[rowIndex] += elementWidth + (colIndex > 0 ? columnSpacing : 0);
          totalGridWidth = Math.max(totalGridWidth, rowWidths[rowIndex]);
      });

      const gridOffsetX = containerOffsetX + Math.max(0, (containerWidth - totalGridWidth) / 2);
      currentGridX = gridOffsetX;
      currentGridY = containerOffsetY;

      orderedBodyIds.forEach((bodyId, index) => {
          const elementWidth = elementSizeMap.current.get(bodyId)?.width ?? 50;
          const elementHeight = elementSizeMap.current.get(bodyId)?.height ?? 50;
          const colIndex = index % columns;
          const rowIndex = Math.floor(index / columns);

          if (colIndex === 0 && index > 0) {
              currentGridY += maxRowHeight + rowSpacing;
              maxRowHeight = 0;
              currentGridX = gridOffsetX; // Reset X for new row
          }

          // Calculate X based on previous elements in the same row for alignment
          let rowStartX = gridOffsetX;
          for(let c=0; c < colIndex; c++) {
              const prevBodyId = orderedBodyIds[rowIndex * columns + c];
              rowStartX += (elementSizeMap.current.get(prevBodyId)?.width ?? 50) + columnSpacing;
          }
          
          const targetX = rowStartX + elementWidth / 2;
          const targetY = currentGridY + elementHeight / 2;
          newTargetPositions.set(bodyId, { x: targetX, y: targetY });

          maxRowHeight = Math.max(maxRowHeight, elementHeight);
      });

    } else if (mergedOptions.layoutType === 'stack') {
      const { direction, spacing, offsetStep } = mergedOptions.stackOptions;
      let currentStackX = containerOffsetX + containerWidth / 2; // Start centered for horizontal
      let currentStackY = containerOffsetY; // Start at top for vertical

      orderedBodyIds.forEach((bodyId, index) => {
          const elementWidth = elementSizeMap.current.get(bodyId)?.width ?? 50;
          const elementHeight = elementSizeMap.current.get(bodyId)?.height ?? 50;
          let targetX = currentStackX;
          let targetY = currentStackY;

          if (direction === 'horizontal') {
              targetX = currentStackX + elementWidth / 2 + (offsetStep?.x ? index * offsetStep.x : 0);
              targetY = containerOffsetY + containerHeight / 2 + (offsetStep?.y ? index * offsetStep.y : 0);
              currentStackX += elementWidth + spacing;
          } else { // Vertical
              targetX = containerOffsetX + containerWidth / 2 + (offsetStep?.x ? index * offsetStep.x : 0);
              targetY = currentStackY + elementHeight / 2 + (offsetStep?.y ? index * offsetStep.y : 0);
              currentStackY += elementHeight + spacing;
          }
          newTargetPositions.set(bodyId, { x: targetX, y: targetY });
      });

    } else if (mergedOptions.layoutType === 'freeform') {
        newTargetPositions.clear(); // No explicit targets
    }

    return newTargetPositions;
    // Depends on itemCount (via bodyIdsRef), layout options, and measured sizes (elementSizeMap)
  }, [itemCount, mergedOptions]); // Dependency: mergedOptions covers all layout configs

  // Function to update physics body size when element ref resolves
  const updateBodySize = useCallback((bodyId: string, element: HTMLElement | null) => {
    if (!engine || !element || !elementRefs.current.has(bodyId)) return;

    const { offsetWidth, offsetHeight } = element;
    if (offsetWidth > 0 && offsetHeight > 0) {
      const currentSize = elementSizeMap.current.get(bodyId);
      if (!currentSize || currentSize.width !== offsetWidth || currentSize.height !== offsetHeight) {
        elementSizeMap.current.set(bodyId, { width: offsetWidth, height: offsetHeight });
        // Update physics body shape if engine supports it
        // engine.updateBodyState(bodyId, { shape: { type: 'rectangle', width: offsetWidth, height: offsetHeight } }); 
        // Trigger target recalculation because size changed
        targetPositionsRef.current = calculateTargetPositions(); 
      }
    }
  }, [engine, calculateTargetPositions]); // Depends on engine and the calculator function


  // Effect to recalculate targets when calculator function identity changes
  useEffect(() => {
    const newTargets = calculateTargetPositions();
    targetPositionsRef.current = newTargets;
    // Update mock engine targets when calculated targets change
    if (engine && process.env.NODE_ENV === 'test') { // Add guard for test environment if needed
      newTargets.forEach((targetPos, bodyId) => {
        // Check if body exists in the engine before updating
        if (engine.getBodyState(bodyId)) { 
            engine.updateBodyState(bodyId, { 
              userData: { targetPosition: targetPos } 
            });
        }
      });
    }
  }, [calculateTargetPositions, engine]); // Add engine dependency


  // Animation loop: Get state and update styles
  useEffect(() => {
    let animationFrameId: number;
    const update = () => {
      if (!engine || bodyIdsRef.current.length === 0) {
        animationFrameId = requestAnimationFrame(update);
        return; 
      }

      const currentStates = engine.getAllBodyStates();
      const newStyles: { [key: string]: React.CSSProperties } = {};

      // Define expected state type for assertion
      type ExpectedBodyState = { 
        position: Vector2D; 
        angle: number; 
        velocity: Vector2D; // Add other expected properties from engine state
        isStatic?: boolean;
      };

      bodyIdsRef.current.forEach((bodyId, index) => {
        const rawState = currentStates.get(bodyId);
        const elementSize = elementSizeMap.current.get(bodyId) || { width: 50, height: 50 }; 

        if (!rawState) {
            newStyles[bodyId] = styles[bodyId] || { position: 'absolute', visibility: 'hidden' };
            return;
        } 

        // Assert the type of rawState
        const state = rawState as ExpectedBodyState;

        newStyles[bodyId] = {
          position: 'absolute',
          // Access properties after type assertion
          left: `${state.position.x - elementSize.width / 2}px`,
          top: `${state.position.y - elementSize.height / 2}px`,
          transform: `rotate(${state.angle}rad)`,
          willChange: 'transform, left, top',
          visibility: 'visible',
        };
      });

      setStyles(newStyles);
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine, itemCount, styles]);


  // Effect to apply physics forces before each engine step
  useEffect(() => {
    // REMOVE: engine.onBeforeStep does not exist on the public API
    // const unsubscribe = engine.onBeforeStep?.(() => {
    //   // ... force calculation logic ...
    // });
    // return () => unsubscribe?.();

    // Instead, integrate force application into the main animation loop or a separate timer if needed
    // For now, let's remove this effect entirely as it depends on a non-existent API method.
    // We might need a different approach to apply forces continuously.

  }, [engine, mergedOptions, calculateTargetPositions]); // Removed dependencies related to onBeforeStep

  // Add a placeholder effect for applying forces periodically if needed.
  // This replaces the onBeforeStep logic but needs refinement.
  useEffect(() => {
      const applyForces = () => {
        if (!engine) return;
        const allStates = engine.getAllBodyStates();
        const targetPositions = targetPositionsRef.current;
        const bounds = mergedOptions.bounds;

        allStates.forEach((bodyState, bodyId) => {
            if (bodyState.isStatic) return;

            const index = bodyIdsRef.current.indexOf(bodyId);
            if (index === -1) return;

            const itemPhysics = getItemPhysicsConfig(mergedOptions, index, bodyId);
            let totalForce: Vector2D = { x: 0, y: 0 };

            // Apply Spring Force (Grid/Stack)
            if (mergedOptions.layoutType !== 'freeform') {
                const targetPos = targetPositions.get(bodyId);
                if (targetPos) {
                    const displacement = { x: targetPos.x - bodyState.position.x, y: targetPos.y - bodyState.position.y };
                    const distanceSq = displacement.x * displacement.x + displacement.y * displacement.y;
                    
                    if (distanceSq > 0.5 * 0.5) { 
                        totalForce.x += displacement.x * itemPhysics.stiffness;
                        totalForce.y += displacement.y * itemPhysics.stiffness;
                    }
                }
            } 
            // Apply Freeform Forces
            else {
                const { repulsionStrength, repulsionRadius, centerAttraction } = mergedOptions.freeformOptions;
                // Apply Center Attraction
                if (centerAttraction > 0) {
                  const containerRect = containerRef.current?.getBoundingClientRect();
                  const containerWidth = bounds ? bounds.right - bounds.left : containerRect?.width ?? window.innerWidth;
                  const containerHeight = bounds ? bounds.bottom - bounds.top : containerRect?.height ?? window.innerHeight;
                  const containerCenter = { x: (bounds?.left ?? containerRect?.left ?? 0) + containerWidth/2, y: (bounds?.top ?? containerRect?.top ?? 0) + containerHeight/2 };
                  const centerDir = { x: containerCenter.x - bodyState.position.x, y: containerCenter.y - bodyState.position.y };
                  totalForce.x += centerDir.x * centerAttraction;
                  totalForce.y += centerDir.y * centerAttraction;
                }

                // Apply Repulsion
                if (repulsionStrength > 0 && repulsionRadius > 0) {
                    allStates.forEach((otherState, otherId) => {
                        if (bodyId === otherId || otherState.isStatic) return;
                        const delta = { x: bodyState.position.x - otherState.position.x, y: bodyState.position.y - otherState.position.y };
                        const distSq = delta.x * delta.x + delta.y * delta.y;
                        if (distSq > 0 && distSq < repulsionRadius * repulsionRadius) {
                            const dist = Math.sqrt(distSq);
                            const forceMag = repulsionStrength * (1 - dist / repulsionRadius) / dist; // Inverse square falloff
                            totalForce.x += delta.x * forceMag;
                            totalForce.y += delta.y * forceMag;
                        }
                    });
                }
            }

            // Apply Damping (Velocity-based)
            totalForce.x -= bodyState.velocity.x * itemPhysics.damping;
            totalForce.y -= bodyState.velocity.y * itemPhysics.damping;

            // Apply Bounds (simple repulsion from edges)
            if (bounds) {
                const boundaryForce = 100; // Adjust strength as needed
                const padding = 5; // Distance from edge to start applying force
                if (bodyState.position.x < bounds.left + padding) totalForce.x += boundaryForce;
                if (bodyState.position.x > bounds.right - padding) totalForce.x -= boundaryForce;
                if (bodyState.position.y < bounds.top + padding) totalForce.y += boundaryForce;
                if (bodyState.position.y > bounds.bottom - padding) totalForce.y -= boundaryForce;
            }

            // Apply the calculated force
            if (Math.abs(totalForce.x) > 0.01 || Math.abs(totalForce.y) > 0.01) {
              engine.applyForce(bodyId, totalForce);
            }
        });
      };
      
      // Run force application periodically (e.g., tied to animation frame or interval)
      // Using requestAnimationFrame for smoother integration with rendering
      let rafId: number;
      const loop = () => {
          applyForces();
          rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
      
      return () => cancelAnimationFrame(rafId);

  }, [engine, mergedOptions]); // Removed calculateTargetPositions dependency here, handled above


  // Prop Getters
  const getContainerProps = useCallback(() => ({
    ref: containerRef,
    style: {
      position: 'relative',
      overflow: 'hidden',
      width: mergedOptions.bounds ? `${mergedOptions.bounds.right - mergedOptions.bounds.left}px` : '100%',
      height: mergedOptions.bounds ? `${mergedOptions.bounds.bottom - mergedOptions.bounds.top}px` : '100%',
    } as React.CSSProperties,
    // Ensure dependency includes containerRef if its value change should update props
  }), [mergedOptions.bounds, containerRef]); 

  // Function returned by the hook to get props for a specific item
  // Use inline type definition for return value
  const getItemProps = useCallback((index: number): { ref: (element: HTMLElement | null) => void; style: React.CSSProperties } | undefined => {
    // --- ADD BOUNDARY CHECK --- 
    if (index < 0 || index >= itemCount) {
      console.warn(`usePhysicsLayout: getItemProps called with invalid index ${index}. Item count is ${itemCount}.`);
      return undefined; // Return undefined for invalid index
    }
    // --- END CHECK --- 

    const bodyId = bodyIdsRef.current[index];
    const style = styles[bodyId] || { position: 'absolute', visibility: 'hidden' }; 

    const refCallback = (element: HTMLElement | null) => {
      if (bodyId) {
        elementRefs.current.set(bodyId, element);
        updateBodySize(bodyId, element);
      }
    };

    return {
      ref: refCallback,
      style: {
        position: 'absolute', // Base style
        ...(style || {}), // Merge calculated style
        visibility: style ? 'visible' : 'hidden', // Initially hidden
      },
      // Add other necessary props if any
    };
  }, [styles, updateBodySize, itemCount]); 

  return { getContainerProps, getItemProps };
};
