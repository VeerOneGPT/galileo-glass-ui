/**
 * Physics Engine Debug Utilities
 * 
 * Helper functions for troubleshooting the Galileo physics engine
 * Added in v1.0.14 to address issues with getBodyState() and provide better dev experience
 */

import { GalileoPhysicsEngineAPI, PhysicsBodyState } from './engineTypes';

/**
 * Robust utility to get a physics body state, with multiple fallback methods
 * This helps work around potential issues with direct ID lookup
 * 
 * @param engine The physics engine instance from useGalileoPhysicsEngine
 * @param bodyId The ID of the body to retrieve
 * @returns The body state if found, or null
 */
export function getPhysicsBodyState(engine: GalileoPhysicsEngineAPI, bodyId: string): PhysicsBodyState | null {
  if (!engine) return null;
  
  // Try direct method first (which now has enhanced fallbacks internally)
  const directState = engine.getBodyState(bodyId);
  if (directState) return directState;
  
  // If still unsuccessful, try retrieving from getAllBodyStates map
  const allStates = engine.getAllBodyStates();
  
  // Try direct map lookup
  if (allStates.has(bodyId)) {
    return allStates.get(bodyId) || null;
  }
  
  // Try with string conversion
  const stringId = String(bodyId);
  for (const [key, value] of allStates.entries()) {
    if (String(key) === stringId) {
      return value;
    }
  }
  
  // If still not found, return null
  return null;
}

/**
 * Check if the physics engine is functioning correctly
 * Useful for debugging setup issues
 * 
 * @param engine The physics engine instance
 */
export function verifyPhysicsEngineState(engine: GalileoPhysicsEngineAPI): {
  isActive: boolean,
  bodyCount: number,
  bodiesWithState: number,
  message: string
} {
  if (!engine) {
    return {
      isActive: false,
      bodyCount: 0,
      bodiesWithState: 0,
      message: "Physics engine not initialized"
    };
  }
  
  // Get all states to check engine health
  const allStates = engine.getAllBodyStates();
  const bodyCount = allStates.size;
  
  // Check if states have valid positions
  let bodiesWithValidState = 0;
  allStates.forEach(state => {
    if (state && state.position && 
        (typeof state.position.x === 'number') && 
        (typeof state.position.y === 'number')) {
      bodiesWithValidState++;
    }
  });
  
  const result = {
    isActive: bodyCount > 0,
    bodyCount,
    bodiesWithState: bodiesWithValidState,
    message: ""
  };
  
  // Generate diagnostic message
  if (bodyCount === 0) {
    result.message = "No physics bodies found. Engine may not be running or no bodies have been added.";
  } else if (bodiesWithValidState < bodyCount) {
    result.message = `Found ${bodyCount} bodies, but only ${bodiesWithValidState} have valid state data. Engine may be partially functioning.`;
  } else {
    result.message = `Physics engine is active with ${bodyCount} bodies, all with valid states.`;
  }
  
  return result;
}

/**
 * Force an update of the physics engine's state
 * Useful to ensure the engine is active and processing updates when direct position retrieval fails
 * 
 * @param engine The physics engine instance
 * @param bodyId The ID of the body to update (optional, can be any valid body ID)
 */
export function forcePhysicsEngineUpdate(engine: GalileoPhysicsEngineAPI, bodyId?: string): boolean {
  if (!engine) return false;
  
  // If no specific bodyId provided, try to get one from all states
  if (!bodyId) {
    const allStates = engine.getAllBodyStates();
    if (allStates.size > 0) {
      // Get the first available body ID
      bodyId = Array.from(allStates.keys())[0];
    } else {
      console.warn("[PhysicsUtils] Cannot force update: No bodies in the engine");
      return false;
    }
  }
  
  // Get current state
  const currentState = engine.getBodyState(bodyId);
  if (!currentState) {
    console.warn(`[PhysicsUtils] Cannot force update: Body ${bodyId} not found`);
    return false;
  }
  
  // Apply small impulse to ensure physics is processing
  engine.applyImpulse(bodyId, { x: 0.0001, y: 0.0001 });
  
  // Update with current state (no actual change) to trigger processing
  engine.updateBodyState(bodyId, {
    position: currentState.position,
    velocity: currentState.velocity
  });
  
  return true;
}

// Export a helper function for convenient physics engine troubleshooting
export function debugPhysicsEngine(engine: GalileoPhysicsEngineAPI): void {
  const state = verifyPhysicsEngineState(engine);
  
  console.group("🔍 Galileo Physics Engine Diagnostic");
  console.log("Engine active:", state.isActive);
  console.log("Total bodies:", state.bodyCount);
  console.log("Bodies with valid state:", state.bodiesWithState);
  console.log("Status:", state.message);
  
  if (state.bodyCount > 0) {
    console.group("Body States");
    const allStates = engine.getAllBodyStates();
    allStates.forEach((bodyState, id) => {
      console.log(`Body ${id}:`, bodyState);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
} 