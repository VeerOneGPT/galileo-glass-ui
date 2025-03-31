import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  GalileoPhysicsEngineAPI, 
  PhysicsBodyOptions, 
  PhysicsBodyState, 
  CollisionEvent,
  Vector2D,
  UnsubscribeFunction
} from './engineTypes';
// Import internal physics system and types
import { 
  GalileoPhysicsSystem, 
  PhysicsConfig, 
  PhysicsObjectConfig, 
  PhysicsObject, 
  Vector,
  PhysicsEventListener, // Import event listener type
  PhysicsEvent as InternalPhysicsEvent, 
  PhysicsEventType
} from './galileoPhysicsSystem'; 
// Import Collision System
import { 
  CollisionSystem, 
  CollisionBody, // Type used by CollisionSystem
  CollisionEvent as InternalCollisionEvent, // Collision system's event type
  CollisionEventCallback, // Callback type for collision system
  CollisionEventType, // Enum for event types
  CollisionShape, // Enum for shapes
  PhysicsMaterial // Type for material
} from './collisionSystem';

// Helper to map internal PhysicsObject state to public PhysicsBodyState
const mapInternalStateToPublic = (internalObj: PhysicsObject): PhysicsBodyState => ({
  id: internalObj.id,
  position: { x: internalObj.position.x, y: internalObj.position.y }, // Only x, y for now
  angle: internalObj.position.z ?? 0, // Assuming z might be used for angle internally? Or add angle property
  velocity: { x: internalObj.velocity.x, y: internalObj.velocity.y },
  angularVelocity: internalObj.velocity.z ?? 0, // Assuming z might be used for angular velocity?
  isStatic: internalObj.isStatic,
  userData: internalObj.userData,
});

// Helper to map public options to internal config
const mapPublicOptionsToInternal = (options: PhysicsBodyOptions): PhysicsObjectConfig => {
  // Basic mapping, assuming Vector interfaces are compatible enough or need conversion
  // Need to handle shape differences explicitly if internal system uses different structure
  const internalConfig: PhysicsObjectConfig = {
    // Spread operator omitted to avoid shape type conflict
    id: options.id,
    position: options.position,
    velocity: options.velocity,
    mass: options.mass,
    friction: options.friction,
    restitution: options.restitution,
    isStatic: options.isStatic,
    collisionGroup: options.collisionFilter?.group,
    collisionMask: options.collisionFilter?.mask,
    userData: options.userData,
    // Map shape type string
    shape: options.shape.type, 
  };
  
  // Map shape-specific properties based on type
  switch (options.shape.type) {
    case 'circle':
      internalConfig.radius = options.shape.radius;
      break;
    case 'rectangle':
      internalConfig.width = options.shape.width;
      internalConfig.height = options.shape.height;
      break;
    // Add other shapes if needed
  }

  // Ensure mass/inverseMass consistency with isStatic
  if (options.isStatic) {
    internalConfig.mass = Infinity;
  }
  return internalConfig;
};

// Maps public options to the format needed by GalileoPhysicsSystem
const mapOptionsToPhysicsSystemConfig = (options: PhysicsBodyOptions): PhysicsObjectConfig => {
  const internalConfig: PhysicsObjectConfig = {
    id: options.id,
    position: options.position, // Assuming Vector2D maps to Partial<Vector>
    velocity: options.velocity,
    mass: options.mass,
    friction: options.friction,
    restitution: options.restitution,
    isStatic: options.isStatic,
    collisionGroup: options.collisionFilter?.group,
    collisionMask: options.collisionFilter?.mask,
    userData: options.userData,
    // TODO: Map shape details (radius, width, height, vertices) if needed by physics system
  };
  if (options.isStatic) internalConfig.mass = Infinity;
  return internalConfig;
};

// Maps public options to the format needed by CollisionSystem
const mapOptionsToCollisionBody = (options: PhysicsBodyOptions, id: string): CollisionBody => {
  // Revert shape type to CollisionShape
  let shape: CollisionShape;
  let shapeData: any;

  switch (options.shape.type) {
    case 'circle':
      // Revert to using enum value
      shape = CollisionShape.CIRCLE; 
      shapeData = { radius: options.shape.radius };
      break;
    case 'rectangle':
      // Revert to using enum value
      shape = CollisionShape.RECTANGLE;
      shapeData = { width: options.shape.width, height: options.shape.height };
      break;
    // TODO: Add Polygon case later
    default:
      console.warn(`[PhysicsEngine] Unsupported shape type for collision: ${(options.shape as any).type}. Defaulting to Point.`);
      // Revert to using enum value
      shape = CollisionShape.POINT; 
      shapeData = { tolerance: 1 }; 
  }

  const collisionBody: CollisionBody = {
    id: id, 
    position: options.position, 
    velocity: options.velocity ?? { x: 0, y: 0 }, 
    mass: options.mass ?? (options.isStatic ? Infinity : 1),
    shape: shape,
    shapeData: shapeData,
    material: { // Default material
      friction: options.friction ?? 0.1,
      restitution: options.restitution ?? 0.5,
      // Add required defaults for density and airResistance
      density: 1, // Default density
      airResistance: 0.01 // Default air resistance
    },
    isStatic: options.isStatic ?? false,
    collisionEnabled: true,
    collisionFilter: {
        category: options.collisionFilter?.group ?? 1, // Map group to category
        mask: options.collisionFilter?.mask ?? 0xFFFFFFFF, 
        // CollisionSystem's CollisionFilter doesn't have `group`, only category/mask
    },
    rotation: options.angle ?? 0,
  };
  return collisionBody;
};

// Maps internal collision event to public format
const mapInternalCollisionToPublic = (internalEvent: InternalCollisionEvent): CollisionEvent => ({
  bodyAId: String(internalEvent.collision.bodyA.id), // Ensure string IDs
  bodyBId: String(internalEvent.collision.bodyB.id),
  bodyAUserData: (internalEvent.collision.bodyA as any).userData,
  bodyBUserData: (internalEvent.collision.bodyB as any).userData,
  contactPoints: internalEvent.collision.contactPoint ? [internalEvent.collision.contactPoint] : undefined,
  normal: internalEvent.collision.normal,
  penetration: internalEvent.collision.penetration,
  // Add duration, impulse if available/needed later
});

/**
 * Hook to initialize and interact with a dedicated Galileo physics engine instance.
 * Provides lower-level access for creating custom physics simulations.
 * 
 * @param config Optional configuration for the physics engine (passed to GalileoPhysicsSystem).
 */
export const useGalileoPhysicsEngine = (config?: Partial<PhysicsConfig>): GalileoPhysicsEngineAPI => {
  const physicsSystemRef = useRef<GalileoPhysicsSystem | null>(null);
  const collisionSystemRef = useRef<CollisionSystem | null>(null);
  const apiRef = useRef<GalileoPhysicsEngineAPI | null>(null);
  const isMountedRef = useRef<boolean>(false);

  // Store mapping from internal CollisionSystem subscription ID to public callbacks
  const collisionCallbackMapRef = useRef<Map<string, { 
    startCb?: (event: CollisionEvent) => void; 
    activeCb?: (event: CollisionEvent) => void; 
    endCb?: (event: CollisionEvent) => void; 
  }>>(new Map());
  const nextSubId = useRef(0);

  // Initialize systems on mount
  useEffect(() => {
    isMountedRef.current = true;
    console.log('Initializing Galileo Physics & Collision Systems...');
    
    const physicsSystem = new GalileoPhysicsSystem(config);
    const collisionSystem = new CollisionSystem(); // Use default config for now

    physicsSystemRef.current = physicsSystem;
    collisionSystemRef.current = collisionSystem;

    // --- Integrate Collision Update using Physics 'step' event ---
    const handlePhysicsStep: PhysicsEventListener = (event: InternalPhysicsEvent) => {
      if (event.type !== 'step' || !isMountedRef.current || !collisionSystemRef.current || !physicsSystemRef.current) {
        return;
      }

      // 1. Update bodies in collision system based on physics system state
      const physicsBodies = physicsSystemRef.current.getAllObjects() ?? [];
      physicsBodies.forEach(physBody => {
        // Ensure the body exists in the collision system before updating
        if (collisionSystemRef.current?.getBody(physBody.id)) {
          collisionSystemRef.current.updateBody(physBody.id, {
            position: {x: physBody.position.x, y: physBody.position.y},
            velocity: {x: physBody.velocity.x, y: physBody.velocity.y},
            // Map angle from z position/velocity based on previous assumption, or add explicit angle to PhysicsObject
            rotation: physBody.position.z // Assumption - Needs verification/update in PhysicsObject
          });
        }
      });

      // 2. Run collision detection and event emission
      collisionSystemRef.current.update(); 
    };

    // Subscribe to the physics system's 'step' event
    physicsSystem.addEventListener('step', handlePhysicsStep);

    // Start the physics loop
    physicsSystem.start();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      console.log('Destroying Galileo Physics & Collision Systems...');
      if (physicsSystemRef.current) {
        // Unsubscribe from event
        physicsSystemRef.current.removeEventListener('step', handlePhysicsStep);
        physicsSystemRef.current.stop(); 
      }
      physicsSystemRef.current = null;
      collisionSystemRef.current?.clear(); // Clear collision system state
      collisionSystemRef.current = null;
      collisionCallbackMapRef.current.clear();
    };
  }, [config]);

  // --- Public API Methods --- 

  const addBody = useCallback((options: PhysicsBodyOptions): string => {
    if (!physicsSystemRef.current || !collisionSystemRef.current) {
      console.warn('[PhysicsEngine] Systems not initialized. Cannot add body.');
      return '';
    }
    // Map options directly for addObject
    const finalId = physicsSystemRef.current.addObject(mapOptionsToPhysicsSystemConfig(options));
    const collisionBody = mapOptionsToCollisionBody(options, finalId);
    // Store userData on the collision body after creation if it exists
    // Note: CollisionBody interface itself doesn't have userData yet.
    if (options.userData !== undefined) {
       (collisionBody as any).userData = options.userData;
    }
    collisionSystemRef.current.addBody(collisionBody);

    console.log(`[PhysicsEngine] Added body: ${finalId}`);
    return finalId;
  }, []);

  const removeBody = useCallback((id: string): void => {
    if (!physicsSystemRef.current || !collisionSystemRef.current) return;
    const physSuccess = physicsSystemRef.current.removeObject(id);
    collisionSystemRef.current.removeBody(id);
    if (physSuccess) {
      console.log(`[PhysicsEngine] Removed body: ${id}`);
    } else {
      console.warn(`[PhysicsEngine] Failed to remove body from physics system: ${id}`);
    }
  }, []);

  const updateBodyState = useCallback((id: string, state: Partial<Omit<PhysicsBodyState, 'id' | 'isStatic'>>): void => {
    if (!physicsSystemRef.current || !collisionSystemRef.current) return;
    console.warn(`[PhysicsEngine] updateBodyState is partially implemented. Use applyForce/applyImpulse. Updating: ${id}`, state);
    
    const physUpdates: Partial<PhysicsObjectConfig> = {};
    const collisionUpdates: Partial<Omit<CollisionBody, 'id' | 'shape' | 'shapeData'>> = {};

    if (state.position) {
      physUpdates.position = state.position;
      collisionUpdates.position = state.position;
    }
    if (state.velocity) {
      physUpdates.velocity = state.velocity;
      collisionUpdates.velocity = state.velocity;
    }
    if (state.angle !== undefined) { 
        physUpdates.position = { ...physicsSystemRef.current.getObject(id)?.position, z: state.angle }; // Assumption
        collisionUpdates.rotation = state.angle;
    }
     if (state.angularVelocity !== undefined) { 
        physUpdates.velocity = { ...physicsSystemRef.current.getObject(id)?.velocity, z: state.angularVelocity }; // Assumption
        // Collision system doesn't track angular velocity directly
    }
    if (state.userData !== undefined) {
       const physObj = physicsSystemRef.current.getObject(id);
       if(physObj) physObj.userData = state.userData;
       const collObj = collisionSystemRef.current.getBody(id);
       if(collObj) (collObj as any).userData = state.userData;
    }

    if (Object.keys(physUpdates).length > 0) {
      physicsSystemRef.current.updateObject(id, physUpdates);
    }
    if (Object.keys(collisionUpdates).length > 0) {
      collisionSystemRef.current.updateBody(id, collisionUpdates);
    }

  }, []);

  const getBodyState = useCallback((id: string): PhysicsBodyState | null => {
    if (!physicsSystemRef.current) return null;
    const internalObj = physicsSystemRef.current.getObject(id);
    return internalObj ? mapInternalStateToPublic(internalObj) : null;
  }, []);
  
  const getAllBodyStates = useCallback((): Map<string, PhysicsBodyState> => {
    if (!physicsSystemRef.current) return new Map();
    const internalObjects = physicsSystemRef.current.getAllObjects();
    const states = new Map<string, PhysicsBodyState>();
    internalObjects.forEach(obj => {
      states.set(obj.id, mapInternalStateToPublic(obj));
    });
    return states;
  }, []);

  const applyForce = useCallback((id: string, force: Vector2D, point?: Vector2D): void => {
    if (!physicsSystemRef.current) return;
    const forceVec: Partial<Vector> = { ...force, z: 0 };
    // TODO: Point application not supported by internal physics system currently.
    const success = physicsSystemRef.current.applyForce(id, forceVec);
    if (!success) {
      console.warn(`[PhysicsEngine] Failed to apply force to body: ${id}`);
    }
  }, []);

  const applyImpulse = useCallback((id: string, impulse: Vector2D, point?: Vector2D): void => {
    if (!physicsSystemRef.current) return;
    const impulseVec: Partial<Vector> = { ...impulse, z: 0 };
    // TODO: Point application not supported by internal physics system currently.
    const success = physicsSystemRef.current.applyImpulse(id, impulseVec);
     if (!success) {
      console.warn(`[PhysicsEngine] Failed to apply impulse to body: ${id}`);
    }
  }, []);

  // --- Collision Event Subscription ---
  // Helper to manage subscriptions via the CollisionSystem
  const subscribeToCollision = useCallback(( 
    eventType: CollisionEventType, 
    callback: (event: CollisionEvent) => void
  ): UnsubscribeFunction => {
    if (!collisionSystemRef.current) {
      console.warn('[PhysicsEngine] Collision system not ready.');
      return () => {};
    }
    
    const subId = `sub_${nextSubId.current++}`;
    const internalCallback: CollisionEventCallback = (internalEvent) => {
      const publicEvent = mapInternalCollisionToPublic(internalEvent);
      callback(publicEvent); // Call the user's callback
    };

    collisionCallbackMapRef.current.set(subId, { 
        [eventType === CollisionEventType.START ? 'startCb' : eventType === CollisionEventType.ACTIVE ? 'activeCb' : 'endCb']: callback 
    });
    
    // Use CollisionSystem's subscription
    const internalSubId = collisionSystemRef.current.onCollision(internalCallback, { eventType });

    console.log(`[PhysicsEngine] Registered ${eventType} callback (Sub ID: ${subId}, Internal ID: ${internalSubId})`);
    
    // Return an unsubscribe function that uses the *internal* ID
    return () => {
      if (collisionSystemRef.current?.offCollision(internalSubId)) {
         collisionCallbackMapRef.current.delete(subId);
         console.log(`[PhysicsEngine] Unregistered ${eventType} callback (Sub ID: ${subId}, Internal ID: ${internalSubId})`);
      } else {
         console.warn(`[PhysicsEngine] Failed to unregister ${eventType} callback (Internal ID: ${internalSubId})`);
      }
    };
  }, []);

  const onCollisionStart = useCallback((callback: (event: CollisionEvent) => void): UnsubscribeFunction => {
    return subscribeToCollision(CollisionEventType.START, callback);
  }, [subscribeToCollision]);

  const onCollisionActive = useCallback((callback: (event: CollisionEvent) => void): UnsubscribeFunction => {
     return subscribeToCollision(CollisionEventType.ACTIVE, callback);
  }, [subscribeToCollision]);

  const onCollisionEnd = useCallback((callback: (event: CollisionEvent) => void): UnsubscribeFunction => {
     return subscribeToCollision(CollisionEventType.END, callback);
  }, [subscribeToCollision]);


  // Create the stable API object only once
  if (!apiRef.current) {
      apiRef.current = {
        addBody,
        removeBody,
        updateBodyState,
        getBodyState,
        getAllBodyStates,
        applyForce,
        applyImpulse,
        onCollisionStart,
        onCollisionActive,
        onCollisionEnd,
      };
  }

  // Update methods in the ref if dependencies change (needed because of useCallback)
  useEffect(() => {
    if (apiRef.current) {
        apiRef.current.addBody = addBody;
        apiRef.current.removeBody = removeBody;
        apiRef.current.updateBodyState = updateBodyState;
        apiRef.current.getBodyState = getBodyState;
        apiRef.current.getAllBodyStates = getAllBodyStates;
        apiRef.current.applyForce = applyForce;
        apiRef.current.applyImpulse = applyImpulse;
        apiRef.current.onCollisionStart = onCollisionStart;
        apiRef.current.onCollisionActive = onCollisionActive;
        apiRef.current.onCollisionEnd = onCollisionEnd;
    }
  }, [addBody, removeBody, updateBodyState, getBodyState, getAllBodyStates, applyForce, applyImpulse, onCollisionStart, onCollisionActive, onCollisionEnd]);

  // Return the stable API ref, assert non-null as it's created synchronously on first render
  return apiRef.current!;
}; 