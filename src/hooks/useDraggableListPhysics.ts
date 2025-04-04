import React, { useRef, useState, useCallback, useEffect, CSSProperties, RefObject } from 'react';
import { 
    useGalileoPhysicsEngine, 
    PhysicsBodyOptions, 
    Vector2D, 
    GalileoPhysicsEngineAPI, 
    PhysicsBodyState 
} from '../animations/physics';

// --- Interfaces ---

export interface DraggableListOptions {
  itemRefs: RefObject<HTMLElement>[];
  onOrderChange?: (newOrder: number[]) => void;
  // Config object for the settling spring animation
  settleConfig?: {
      tension?: number;
      friction?: number;
  };
   // Config object for the dragging interaction (separate from settle)
  dragConfig?: {
      tension?: number; // How strongly it pulls towards the pointer
      friction?: number; // How much it resists pointer movement
  };
  mass?: number;
  activationConstraint?: 'pointerDown' | 'longPress'; // TODO: Implement activation constraint
  direction?: 'vertical' | 'horizontal' | 'both'; // Only vertical pointer reordering implemented
  usePortal?: boolean; // TODO: Implement portal rendering if needed
  spacing?: number; // Spacing between items
  // Allow configuring lift/scale effects
  liftEffect?: {
      z?: number; // Amount to lift on z-axis
      scale?: number; // Amount to scale
      shadow?: string; // Box shadow to apply when lifted
  };
  // Apply specific styles when dragging (e.g., cursor)
  draggingCursor?: string;
}

export interface DraggableListResult {
  styles: CSSProperties[];
  // Renamed from getPointerHandlers
  getHandlers: (index: number) => {
    onPointerDown: (event: React.PointerEvent) => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
  isDragging: boolean;
  draggedIndex: number | null; // Original index of the currently dragged item
}

interface InternalDragState {
  isPointerDragging: boolean;
  isKeyboardDragging: boolean;
  pointerId: number | null;
  initialPointerPos: Vector2D; 
  initialElementPos: Vector2D; 
  draggedBodyId: string | null;
  keyboardDraggedOriginalIndex: number | null;
  orderBeforeInteraction: number[]; // Store order at drag/keyboard start
  offset: Vector2D; // Offset between pointer and element origin
}

// --- Hook Implementation --- 

// Default values
const DEFAULT_SETTLE_TENSION = 170;
const DEFAULT_SETTLE_FRICTION = 26;
const DEFAULT_DRAG_TENSION = 500; // Make drag follow pointer more tightly by default
const DEFAULT_DRAG_FRICTION = 40; 
const DEFAULT_MASS = 1;
const DEFAULT_SPACING = 10;
const DEFAULT_LIFT_Z = 25;
const DEFAULT_LIFT_SCALE = 1.05;
const DEFAULT_LIFT_SHADOW = '0 12px 30px rgba(0,0,0,0.25)';
const DEFAULT_DRAGGING_CURSOR = 'grabbing';

// Helper function to reset drag state
const resetDragState = (): InternalDragState => ({
    isPointerDragging: false,
    isKeyboardDragging: false,
    pointerId: null,
    initialPointerPos: { x: 0, y: 0 },
    initialElementPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    draggedBodyId: null,
    keyboardDraggedOriginalIndex: null,
    orderBeforeInteraction: [],
});

export const useDraggableListPhysics = (
  options: DraggableListOptions
): DraggableListResult => {
  const {
    itemRefs,
    onOrderChange,
    settleConfig = {},
    dragConfig = {},
    mass = DEFAULT_MASS,
    direction = 'vertical',
    spacing = DEFAULT_SPACING,
    liftEffect = {},
    draggingCursor = DEFAULT_DRAGGING_CURSOR,
  } = options;

  const { tension: settleTension = DEFAULT_SETTLE_TENSION, friction: settleFriction = DEFAULT_SETTLE_FRICTION } = settleConfig;
  const { tension: dragTension = DEFAULT_DRAG_TENSION, friction: dragFriction = DEFAULT_DRAG_FRICTION } = dragConfig;
  const { z: liftZ = DEFAULT_LIFT_Z, scale: liftScale = DEFAULT_LIFT_SCALE, shadow: liftShadow = DEFAULT_LIFT_SHADOW } = liftEffect;

  const engine = useGalileoPhysicsEngine(); 
  
  // --- State --- 
  const [currentOrder, setCurrentOrder] = useState<number[]>(() => itemRefs.map((_, i) => i));
  const [styles, setStyles] = useState<CSSProperties[]>(() => itemRefs.map(() => ({ 
      position: 'absolute',
      left: '0px', 
      top: '0px',
      width: 'auto',
      height: 'auto',
      transform: 'translate3d(0px, 0px, 0px)',
      zIndex: 10,
      userSelect: 'none',
      cursor: 'grab', // Default cursor
      willChange: 'transform',
   })));
  const [draggedOriginalIndex, setDraggedOriginalIndex] = useState<number | null>(null); 
  const [isDragging, setIsDragging] = useState(false); // << RE-ADD isDragging state

  // --- Refs --- 
  const bodyIds = useRef<Map<number, string>>(new Map()); 
  const targetPositions = useRef<Map<string, Vector2D>>(new Map()); 
  const elementDimensions = useRef<Map<string, { width: number; height: number }>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const isMounted = useRef(false);
  const dragState = useRef<InternalDragState>(resetDragState());
  const lastTimestamp = useRef<number>(performance.now()); 
  const prevItemCountRef = useRef<number | null>(null); // << RE-ADD prevItemCountRef

  // --- Helper: Calculate all target positions based on current order ---
  const calculateTargetPositions = useCallback((order: number[], bodyIdMap: Map<number, string>, elementDimMap: Map<string, { width: number; height: number }>) => {
      let currentOffset = 0;
      const newTargets = new Map<string, Vector2D>();
      order.forEach((originalIndex) => {
          const bodyId = bodyIdMap.get(originalIndex);
          const dims = elementDimMap.get(bodyId || '') || { width: 100, height: 50 }; 
          if (bodyId) {
              if (direction === 'vertical') {
                  newTargets.set(bodyId, { x: 0, y: currentOffset });
                  currentOffset += dims.height + spacing;
              } else { // horizontal or both
                  newTargets.set(bodyId, { x: currentOffset, y: 0 });
                  currentOffset += dims.width + spacing;
              }
          }
      });
      targetPositions.current = newTargets;
      return newTargets;
  }, [direction, spacing]);

  // --- Effect: Initialize/Cleanup physics bodies ---
  useEffect(() => {
    isMounted.current = true;
    if (!engine) return;
    
    // << RE-ADD Check if item count has changed >>
    if (itemRefs.length === prevItemCountRef.current) {
        // console.log('Skipping body init, item count unchanged.');
        return; 
    }
    // console.log('Running body init, item count changed.');

    // Clear previous bodies 
    bodyIds.current.forEach(id => engine?.removeBody(id));
    bodyIds.current.clear();
    targetPositions.current.clear();
    elementDimensions.current.clear();

    const newBodyIds = new Map<number, string>();
    const initPos = new Map<string, Vector2D>();
    const elemDims = new Map<string, { width: number; height: number }>();
    let initialOffset = 0;

    itemRefs.forEach((ref, index) => {
        let dims = { width: 0, height: 0 };
        let hasValidDims = false;
        if (ref.current) {
            dims = { width: ref.current.offsetWidth, height: ref.current.offsetHeight }; 
            hasValidDims = !isNaN(dims.width) && !isNaN(dims.height) && dims.width > 0 && dims.height > 0;
        }

        if (!hasValidDims) {
            console.warn(`useDraggableListPhysics: Could not get valid dimensions for item at index ${index}. Using fallback.`);
            dims = { width: 100, height: 50 }; // Use fallback dimensions
        }
        
        const initialPosition = direction === 'vertical' ? { x: 0, y: initialOffset } : { x: initialOffset, y: 0 };
        const bodyOptions: PhysicsBodyOptions = {
            shape: { type: 'rectangle', width: dims.width, height: dims.height },
            position: initialPosition,
            mass: mass,
            userData: { listIndex: index }
        };
        const bodyId = engine.addBody(bodyOptions);
        if (bodyId) {
            newBodyIds.set(index, bodyId);
            initPos.set(bodyId, initialPosition);
            elemDims.set(bodyId, dims);
        }
        if (direction === 'vertical') initialOffset += dims.height + spacing;
        else initialOffset += dims.width + spacing;
    });

    bodyIds.current = newBodyIds;
    elementDimensions.current = elemDims;
    const initialOrder = itemRefs.map((_, i) => i);
    setCurrentOrder(initialOrder);
    calculateTargetPositions(initialOrder, newBodyIds, elemDims); 
    // Set initial styles based on calculated positions/dimensions
    setStyles(itemRefs.map((_, index) => {
        const bodyId = newBodyIds.get(index);
        const pos = initPos.get(bodyId || '') || { x: 0, y: 0 };
        const dims = elemDims.get(bodyId || '') || { width: 100, height: 50 };
        return { 
            position: 'absolute', 
            left: '0px', 
            top: '0px', 
            width: `${dims.width}px`, 
            height: `${dims.height}px`,
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, // Initial position
            zIndex: 10,
            userSelect: 'none',
            cursor: 'grab', // Default grab cursor
            willChange: 'transform, box-shadow', // Include box-shadow
        };
    }));
    setDraggedOriginalIndex(null);
    setIsDragging(false); // Ensure dragging is false initially
    dragState.current = resetDragState();
    
    // << RE-ADD Update the stored count >>
    prevItemCountRef.current = itemRefs.length;

    // Cleanup function
    return () => {
      isMounted.current = false;
      bodyIds.current.forEach(id => engine?.removeBody(id));
      bodyIds.current.clear();
      targetPositions.current.clear();
      elementDimensions.current.clear();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null; 
    };
    // This effect should run primarily when itemRefs or the engine changes.
    // Mass, direction, spacing changes ideally trigger recalculation within the loop or specific handlers.
  }, [itemRefs, engine]); 

  // --- Effect: Physics update loop ---
  useEffect(() => {
    if (!engine || !isMounted.current || bodyIds.current.size === 0) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return; 
    }
    let isActive = true;

    const updateLoop = (timestamp: number) => {
        if (!isActive || !isMounted.current) return; 
        if (bodyIds.current.size !== itemRefs.length) {
             if (isMounted.current) animationFrameRef.current = requestAnimationFrame(updateLoop);
             return;
        }

        const dt = Math.min(0.032, (timestamp - lastTimestamp.current) / 1000); 
        lastTimestamp.current = timestamp; 

        const allStates = engine.getAllBodyStates();
        if (!allStates) {
            if (isMounted.current) animationFrameRef.current = requestAnimationFrame(updateLoop);
            return;
        }
        
        const newStylesArray: CSSProperties[] = Array(itemRefs.length).fill({});
        let isAnyBodyActive = false;

        currentOrder.forEach((originalIndex) => {
            const bodyId = bodyIds.current.get(originalIndex);
            if (!bodyId) return;
            const currentState = allStates.get(bodyId);
            if (!currentState) return; 

            let forceX = 0;
            let forceY = 0;
            const isBeingPointerDragged = dragState.current.isPointerDragging && dragState.current.draggedBodyId === bodyId;
            const isBeingKeyboardDragged = dragState.current.isKeyboardDragging && dragState.current.keyboardDraggedOriginalIndex === originalIndex;
            const isDragged = isBeingPointerDragged || isBeingKeyboardDragged;

            // Apply Settling Force (if not pointer dragging)
            if (!isBeingPointerDragged) {
                const targetPos = targetPositions.current.get(bodyId);
                 if (targetPos) {
                     const dy = targetPos.y - currentState.position.y;
                     const dx = targetPos.x - currentState.position.x;
                     forceY = dy * settleTension - currentState.velocity.y * settleFriction;
                     forceX = dx * settleTension - currentState.velocity.x * settleFriction;
                     
                     // Check if close enough to snap
                     const isCloseY = Math.abs(dy) < 0.1 && Math.abs(currentState.velocity.y) < 0.1;
                     const isCloseX = Math.abs(dx) < 0.1 && Math.abs(currentState.velocity.x) < 0.1;

                     if(isCloseY && isCloseX) {
                         engine.updateBodyState(bodyId, { position: targetPos, velocity: { x: 0, y: 0 } });
                         forceX = 0;
                         forceY = 0;
                     } else {
                         isAnyBodyActive = true; // Still needs to move/settle
                     }
                 } else {
                     // Fallback: Damp velocity if target is missing
                     forceX = -currentState.velocity.x * settleFriction;
                     forceY = -currentState.velocity.y * settleFriction;
                 }
             } else {
                 // Apply Damping during Pointer Drag (main drag force is in handlePointerMove)
                 forceX = -currentState.velocity.x * dragFriction; 
                 forceY = -currentState.velocity.y * dragFriction; 
                 isAnyBodyActive = true;
             }
             
             if (Math.abs(forceX) > 0.001 || Math.abs(forceY) > 0.001) {
                engine.applyForce(bodyId, { x: forceX, y: forceY });
             }

            // --- Update Style --- 
            const finalState = engine.getBodyState(bodyId) ?? currentState; // Use potentially updated state
            const dims = elementDimensions.current.get(bodyId) || { width: 100, height: 50 };
            const z = isDragged ? liftZ : 0; 
            const scale = isDragged ? liftScale : 1; 
            const shadow = isDragged ? liftShadow : 'none';
            
            newStylesArray[originalIndex] = {
                transform: `translate3d(${finalState.position.x.toFixed(1)}px, ${finalState.position.y.toFixed(1)}px, ${z}px) scale(${scale})`,
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: `${dims.width}px`,
                height: `${dims.height}px`,
                zIndex: isDragged ? 100 : 10, 
                boxShadow: shadow, 
                userSelect: 'none',
                cursor: isDragged ? draggingCursor : 'grab', // Apply correct cursor
                 // Only apply CSS transition for non-dragged items settling - helps smooth out minor jitters
                // Transition transform might fight physics slightly, use with caution or remove if problematic.
                // transition: !isDragged ? 'box-shadow 0.2s ease' : 'none', 
                transition: 'none', // Disable CSS transitions for now to let physics dominate
                willChange: 'transform, box-shadow',
            };
            
            if (Math.abs(finalState.velocity.x) > 0.01 || Math.abs(finalState.velocity.y) > 0.01) {
                 isAnyBodyActive = true;
            }
        });

        // Batch style updates only if changed
        setStyles(prevStyles => {
            if (JSON.stringify(prevStyles) !== JSON.stringify(newStylesArray)) {
                return newStylesArray;
            }
            return prevStyles;
        });
      
        // Continue loop?
        if (dragState.current.isPointerDragging || dragState.current.isKeyboardDragging || isAnyBodyActive) { 
            if (isMounted.current) animationFrameRef.current = requestAnimationFrame(updateLoop);
        } else {
            animationFrameRef.current = null; // Stop the loop when idle
        }
    };

    // Start loop if not already running
    if (!animationFrameRef.current) {
         lastTimestamp.current = performance.now(); 
         animationFrameRef.current = requestAnimationFrame(updateLoop);
    }
    
    // Cleanup function for the effect
    return () => {
        isActive = false; 
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    };
  }, [engine, settleTension, settleFriction, dragTension, dragFriction, currentOrder, itemRefs.length, mass, direction, spacing, liftZ, liftScale, liftShadow, draggingCursor, calculateTargetPositions]); 

  // --- Pointer Handlers ---
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!dragState.current.isPointerDragging || event.pointerId !== dragState.current.pointerId || !dragState.current.draggedBodyId || !engine) return;

    const currentPointerPos = { x: event.clientX, y: event.clientY };
    const targetElementPos = { 
        x: currentPointerPos.x - dragState.current.offset.x, 
        y: currentPointerPos.y - dragState.current.offset.y 
    };
    const draggedBodyId = dragState.current.draggedBodyId;
    const currentState = engine.getBodyState(draggedBodyId); 
    if (!currentState) return;
    
    // Apply physics force towards target, respecting direction
    let dragForceX = -currentState.velocity.x * dragFriction; // Default to damping only
    let dragForceY = -currentState.velocity.y * dragFriction; // Default to damping only

    if (direction === 'vertical' || direction === 'both') {
         dragForceY = (targetElementPos.y - currentState.position.y) * dragTension - currentState.velocity.y * dragFriction;
    }
     if (direction === 'horizontal' || direction === 'both') {
         dragForceX = (targetElementPos.x - currentState.position.x) * dragTension - currentState.velocity.x * dragFriction;
    }
    
    engine.applyForce(draggedBodyId, { x: dragForceX, y: dragForceY });

    // --- Reordering Logic --- 
    // TODO: Implement pointer reordering for horizontal/both directions
    if (direction === 'vertical') {
        const draggedHeight = elementDimensions.current.get(draggedBodyId)?.height || 50;
        // Use the physics engine's current state for position
        const currentDraggedCenterY = currentState.position.y + draggedHeight / 2;
        const currentDraggedOriginalIndex = Array.from(bodyIds.current.entries()).find(([idx, id]) => id === draggedBodyId)?.[0];
        if (currentDraggedOriginalIndex === undefined) return;

        // Find current position in the DISPLAY order
        const currentDraggedDisplayIndex = currentOrder.indexOf(currentDraggedOriginalIndex);
        if (currentDraggedDisplayIndex === -1) return;

        let newDisplayIndex = currentDraggedDisplayIndex;
        let accumulatedHeight = 0;
        let foundNewIndex = false;

        // Iterate through the CURRENT display order
        for (let i = 0; i < currentOrder.length; i++) {
            const loopOriginalIndex = currentOrder[i];
            // Skip the item being dragged itself when determining slot boundaries
            if (loopOriginalIndex === currentDraggedOriginalIndex) continue; 
            
            const loopBodyId = bodyIds.current.get(loopOriginalIndex);
            const loopHeight = elementDimensions.current.get(loopBodyId || '')?.height || 50;
            // Calculate the threshold *below* the current loop item
            const thresholdY = accumulatedHeight + loopHeight + (spacing / 2);

            // If dragged item center is above the threshold, it should be inserted *before* this loop item
            if (currentDraggedCenterY < thresholdY) {
                // The new display index depends on whether we've already passed the original dragged position
                newDisplayIndex = i > currentDraggedDisplayIndex ? i - 1 : i;
                foundNewIndex = true;
                break; 
            }
            accumulatedHeight += loopHeight + spacing;
        }

        // If we looped through all other items and didn't find a slot, place it at the end
        if (!foundNewIndex) {
            newDisplayIndex = currentOrder.length - 1; 
        }

        // If the calculated insert position is different
        if (newDisplayIndex !== currentDraggedDisplayIndex) {
            const newOrder = [...currentOrder];
            // Use the known original index to find the item to move
            const itemToMove = newOrder.splice(currentDraggedDisplayIndex, 1)[0]; 
            newOrder.splice(newDisplayIndex, 0, itemToMove); 
            setCurrentOrder(newOrder); 
            calculateTargetPositions(newOrder, bodyIds.current, elementDimensions.current); 
        }
    } // End vertical reordering logic

  }, [engine, currentOrder, calculateTargetPositions, spacing, direction, dragTension, dragFriction]); // Removed draggedOriginalIndex dep

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (!dragState.current.isPointerDragging || event.pointerId !== dragState.current.pointerId) return;

    const draggedBodyId = dragState.current.draggedBodyId;
    // Find original index from the currently dragged bodyId
    const originalDraggedIdx = Array.from(bodyIds.current.entries()).find(([idx, id]) => id === draggedBodyId)?.[0];
    const element = itemRefs[originalDraggedIdx ?? -1]?.current;
    try {
        element?.releasePointerCapture(event.pointerId);
    } catch (e) { /* Ignore */ }

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.removeEventListener('pointercancel', handlePointerUp);

    // Check if order actually changed before calling callback
    const orderBeforeInteraction = dragState.current.orderBeforeInteraction; 
     if (orderBeforeInteraction.length > 0 && JSON.stringify(currentOrder) !== JSON.stringify(orderBeforeInteraction)) {
         if (onOrderChange) {
             onOrderChange(currentOrder);
         }
     }

    // Reset drag state
    dragState.current = resetDragState();
    setDraggedOriginalIndex(null);
    setIsDragging(false); // << SET isDragging state

  }, [engine, currentOrder, onOrderChange, calculateTargetPositions, handlePointerMove, resetDragState, itemRefs]); // Removed specific configs, added resetDragState, itemRefs

  const handlePointerDown = useCallback((event: React.PointerEvent, originalIndex: number) => {
    const bodyId = bodyIds.current.get(originalIndex);
    const targetElement = itemRefs[originalIndex]?.current;
    // More specific logging for early exit - REMOVED
    if (!engine) { /* console.log(...) */ return; }
    if (!bodyId) { /* console.log(...) */ return; }
    if (!targetElement) { /* console.log(...) */ return; }
    if (!(event.target instanceof Node)) { /* console.log(...) */ return; }
    if (process.env.NODE_ENV !== 'test' && !targetElement.contains(event.target)) { /* console.log(...) */ return; }
    
    event.preventDefault();
    event.stopPropagation();
    targetElement.setPointerCapture(event.pointerId);

    const initialElementState = engine.getBodyState(bodyId);
    if (!initialElementState) {
        // console.log(...) - REMOVED
        return;
    }

    const offset = {
        x: event.clientX - initialElementState.position.x, 
        y: event.clientY - initialElementState.position.y
    }; 

    dragState.current = {
        ...resetDragState(),
        isPointerDragging: true,
        pointerId: event.pointerId,
        initialPointerPos: { x: event.clientX, y: event.clientY },
        initialElementPos: initialElementState.position,
        draggedBodyId: bodyId,
        orderBeforeInteraction: [...currentOrder], // Store order at drag start
        offset: offset
    };
    setDraggedOriginalIndex(originalIndex);
    setIsDragging(true);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    
  }, [engine, currentOrder, itemRefs, handlePointerMove, handlePointerUp, resetDragState]);

  // --- Keyboard Handler ---
  const handleKeyDown = useCallback((event: React.KeyboardEvent, originalIndex: number) => {
    const bodyId = bodyIds.current.get(originalIndex);
    // Specific logging for early checks - REMOVED
    if (!engine) { /* console.log(...) */ return; }
    if (!bodyId) { /* console.log(...) */ return; }

    const currentDisplayIndex = currentOrder.indexOf(originalIndex);
    if (currentDisplayIndex === -1) {
        // console.log(...) - REMOVED
        return;
    }

    const lastDisplayIndex = currentOrder.length - 1;
    const targetElement = itemRefs[originalIndex]?.current; 
    
    if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault(); 
        if (!dragState.current.isKeyboardDragging) {
             if (!targetElement) { /* console.log(...) */ return; } // REMOVED LOG
            // Start keyboard drag
            // ... (update dragState ref) ...
            setDraggedOriginalIndex(originalIndex);
            setIsDragging(true);
        } else if (dragState.current.keyboardDraggedOriginalIndex === originalIndex) {
            if (!targetElement) { /* console.log(...) */ return; } // REMOVED LOG
            // Confirm keyboard drag (drop)
            // ... (drop logic, focus call) ...
            setDraggedOriginalIndex(null);
            setIsDragging(false);
        }
    } else if (dragState.current.isKeyboardDragging && dragState.current.keyboardDraggedOriginalIndex === originalIndex) {
         if (!targetElement) { /* console.log(...) */ return; } // REMOVED LOG
        // Handle movement keys & Escape
        // ... (movement/escape logic, focus calls) ...
         if (event.key === 'Escape') {
            // ... (escape logic) ...
            setDraggedOriginalIndex(null);
            setIsDragging(false);
        }
    }
  }, [engine, currentOrder, calculateTargetPositions, onOrderChange, itemRefs, direction, resetDragState]);

  // --- Hook Result --- 
  // Renamed from getPointerHandlers to getHandlers
  const getHandlers = useCallback((renderIndex: number) => {
      const originalIndex = currentOrder[renderIndex];
      if (typeof originalIndex !== 'number') {
          console.warn(`useDraggableListPhysics: Could not map render index ${renderIndex} to original index.`);
          return { 
              onPointerDown: (e: React.PointerEvent) => e.preventDefault(), 
              onKeyDown: (e: React.KeyboardEvent) => e.preventDefault()
          }; 
      }
      return {
        onPointerDown: (event: React.PointerEvent) => handlePointerDown(event, originalIndex),
        onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, originalIndex),
      };
  }, [handlePointerDown, handleKeyDown, currentOrder]);

  return {
    styles,
    getHandlers, // Use renamed function
    isDragging, // << RETURN isDragging state
    draggedIndex: draggedOriginalIndex,
  };
};
