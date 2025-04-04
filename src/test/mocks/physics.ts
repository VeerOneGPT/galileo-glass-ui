/**
 * Physics Engine Mocks
 * 
 * Provides mock implementations of the Galileo Physics System for testing
 */

interface Vector {
  x: number;
  y: number;
  z?: number;
}

interface MockBody {
  id: string;
  position: Vector;
  velocity: Vector;
  forces: Vector[];
  isStatic?: boolean;
  mass?: number;
  shape?: {
    type: string;
    radius?: number;
    width?: number;
    height?: number;
  };
  [key: string]: any;
}

interface Constraint {
  id: string;
  type: string;
  bodyAId: string;
  bodyBId: string;
  length?: number;
  stiffness?: number;
  damping?: number;
  anchorA?: Vector;
  anchorB?: Vector;
  [key: string]: any;
}

interface MockPhysicsSystem {
  bodies: Map<string, MockBody>;
  collisions: Set<string>;
  constraints: Map<string, any>;
  activeCollisionPairs: Set<string>;
  eventListeners: {
    collision: Function[];
    collisionStart: Function[];
    collisionEnd: Function[];
    collisionActive: Function[];
    update: Function[];
    [key: string]: Function[];
  };
  options: Record<string, any>;
  
  addBody: (body: any) => string;
  getBodyState: (id: string) => MockBody | null;
  getObject: (id: string) => MockBody | null;
  removeBody: (id: string) => void;
  update: (deltaTime: number) => boolean;
  addCollisionListener: (type: string, listener: Function) => string;
  removeCollisionListener: (id: string) => boolean;
  setBodyVelocity: (id: string, velocity: Vector) => void;
  applyForce: (id: string, force: Vector) => void;
  [key: string]: any;
}

// Helper function to calculate distance between two vectors
const calculateDistance = (a: Vector, b: Vector): number => {
  if (!a || !b) return 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = (b.z || 0) - (a.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Helper function to check collision between two bodies
const checkCollision = (bodyA: MockBody, bodyB: MockBody): boolean => {
  // If either body is missing, no collision
  if (!bodyA || !bodyB) return false;
  
  // Get shapes
  const shapeA = bodyA.shape || { type: 'circle', radius: 5 };
  const shapeB = bodyB.shape || { type: 'circle', radius: 5 };
  
  // Circle-circle collision
  if (shapeA.type === 'circle' && shapeB.type === 'circle') {
    const radiusA = shapeA.radius || 5;
    const radiusB = shapeB.radius || 5;
    const distance = calculateDistance(bodyA.position, bodyB.position);
    return distance < (radiusA + radiusB);
  }
  
  // Rectangle-rectangle collision (AABB)
  if (shapeA.type === 'rectangle' && shapeB.type === 'rectangle') {
    const halfWidthA = (shapeA.width || 10) / 2;
    const halfHeightA = (shapeA.height || 10) / 2;
    const halfWidthB = (shapeB.width || 10) / 2;
    const halfHeightB = (shapeB.height || 10) / 2;
    
    // Check if rectangles overlap
    const overlapX = Math.abs(bodyB.position.x - bodyA.position.x) < (halfWidthA + halfWidthB);
    const overlapY = Math.abs(bodyB.position.y - bodyA.position.y) < (halfHeightA + halfHeightB);
    
    return overlapX && overlapY;
  }
  
  // Circle-rectangle collision
  if ((shapeA.type === 'circle' && shapeB.type === 'rectangle') || 
      (shapeA.type === 'rectangle' && shapeB.type === 'circle')) {
    const circle = shapeA.type === 'circle' ? bodyA : bodyB;
    const rect = shapeA.type === 'rectangle' ? bodyA : bodyB;
    
    const circleRadius = (circle.shape?.radius || 5);
    const halfWidth = (rect.shape?.width || 10) / 2;
    const halfHeight = (rect.shape?.height || 10) / 2;
    
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.position.x - halfWidth, Math.min(circle.position.x, rect.position.x + halfWidth));
    const closestY = Math.max(rect.position.y - halfHeight, Math.min(circle.position.y, rect.position.y + halfHeight));
    
    // Calculate distance from closest point to circle center
    const distanceX = circle.position.x - closestX;
    const distanceY = circle.position.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    return distanceSquared < (circleRadius * circleRadius);
  }
  
  // Default to simple distance check for unknown shapes
  return calculateDistance(bodyA.position, bodyB.position) < 15;
};

// Helper to create unique identifiers
const createId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/**
 * Sets up physics engine mocking in Jest
 */
export const mockPhysicsEngine = () => {
  jest.mock('../../animations/physics/galileoPhysicsSystem', () => {
    return {
      GalileoPhysicsSystem: class {
        bodies = new Map<string, MockBody>();
        collisions = new Set<string>();
        constraints = new Map<string, Constraint>();
        activeCollisionPairs = new Set<string>();
        eventListeners = {
          collision: [],
          collisionStart: [],
          collisionEnd: [],
          collisionActive: [],
          update: []
        };
        options = {};
        
        constructor(options = {}) {
          this.options = options;
        }
        
        addBody(body: any) {
          const id = typeof body === 'string' ? body : body.id || String(Math.random());
          const bodyState: MockBody = { 
            id, 
            position: { x: 0, y: 0, z: 0 }, 
            velocity: { x: 0, y: 0, z: 0 },
            forces: [],
            mass: 1,
            shape: { type: 'circle', radius: 5 },
            ...body 
          };
          this.bodies.set(id, bodyState);
          return id;
        }
        
        getBodyState(id: string) {
          return this.bodies.get(id) || null;
        }
        
        getObject(id: string) {
          return this.bodies.get(id) || null;
        }
        
        getAllObjects() {
          return Array.from(this.bodies.values());
        }
        
        removeBody(id: string) {
          this.bodies.delete(id);
          
          // Also remove any constraints involving this body
          for (const [constraintId, constraint] of this.constraints.entries()) {
            if (constraint.bodyAId === id || constraint.bodyBId === id) {
              this.removeConstraint(constraintId);
            }
          }
        }
        
        update(deltaTime: number = 16.667) {
          // Apply forces and simulate physics
          this.updateBodies(deltaTime);
          
          // Handle constraints
          this.resolveConstraints();
          
          // Detect and resolve collisions
          this.detectAndResolveCollisions();
          
          // Notify listeners about update
          this.eventListeners.update.forEach(listener => listener({ deltaTime }));
          
          return true;
        }
        
        updateBodies(deltaTime: number) {
          // Simple Euler integration for each body
          for (const body of this.bodies.values()) {
            if (body.isStatic) continue;
            
            // Apply forces
            const mass = body.mass || 1;
            let totalForceX = 0;
            let totalForceY = 0;
            
            body.forces.forEach(force => {
              totalForceX += force.x;
              totalForceY += force.y;
            });
            
            // Calculate acceleration (F = ma → a = F/m)
            const accX = totalForceX / mass;
            const accY = totalForceY / mass;
            
            // Update velocity
            body.velocity.x += accX * (deltaTime / 1000);
            body.velocity.y += accY * (deltaTime / 1000);
            
            // Update position
            body.position.x += body.velocity.x * (deltaTime / 1000);
            body.position.y += body.velocity.y * (deltaTime / 1000);
            
            // Clear forces for next frame
            body.forces = [];
          }
        }
        
        resolveConstraints() {
          // Apply constraints (simple implementation)
          for (const constraint of this.constraints.values()) {
            const bodyA = this.bodies.get(constraint.bodyAId);
            const bodyB = this.bodies.get(constraint.bodyBId);
            
            if (!bodyA || !bodyB) continue;
            
            if (constraint.type === 'distance') {
              // Distance constraint
              const currentDistance = calculateDistance(bodyA.position, bodyB.position);
              const targetDistance = constraint.length || 10;
              
              if (Math.abs(currentDistance - targetDistance) > 0.01 && currentDistance > 0) {
                const diff = currentDistance - targetDistance;
                const percent = diff / currentDistance;
                const offsetX = (bodyB.position.x - bodyA.position.x) * percent * 0.5;
                const offsetY = (bodyB.position.y - bodyA.position.y) * percent * 0.5;
                
                if (!bodyA.isStatic) {
                  bodyA.position.x += offsetX;
                  bodyA.position.y += offsetY;
                }
                
                if (!bodyB.isStatic) {
                  bodyB.position.x -= offsetX;
                  bodyB.position.y -= offsetY;
                }
              }
            } else if (constraint.type === 'hinge') {
              // Hinge constraint - for mock, we'll just keep the bodies at a fixed distance
              const anchorA = constraint.anchorA || { x: 0, y: 0 };
              const anchorB = constraint.anchorB || { x: 0, y: 0 };
              
              // Calculate world positions of anchors
              const worldAnchorA = {
                x: bodyA.position.x + anchorA.x,
                y: bodyA.position.y + anchorA.y
              };
              
              const worldAnchorB = {
                x: bodyB.position.x + anchorB.x,
                y: bodyB.position.y + anchorB.y
              };
              
              // Bring the anchors together
              const diffX = worldAnchorB.x - worldAnchorA.x;
              const diffY = worldAnchorB.y - worldAnchorA.y;
              
              if (!bodyA.isStatic) {
                bodyA.position.x += diffX * 0.5;
                bodyA.position.y += diffY * 0.5;
              }
              
              if (!bodyB.isStatic) {
                bodyB.position.x -= diffX * 0.5;
                bodyB.position.y -= diffY * 0.5;
              }
              
              // Reduce relative velocity along the constraint normal
              const dx = bodyB.position.x - bodyA.position.x;
              const dy = bodyB.position.y - bodyA.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0.001) {
                const nx = dx / distance;
                const ny = dy / distance;
                
                const relVelX = bodyB.velocity.x - bodyA.velocity.x;
                const relVelY = bodyB.velocity.y - bodyA.velocity.y;
                
                const relVelDotNormal = relVelX * nx + relVelY * ny;
                
                if (!bodyA.isStatic) {
                  bodyA.velocity.x += nx * relVelDotNormal * 0.5;
                  bodyA.velocity.y += ny * relVelDotNormal * 0.5;
                }
                
                if (!bodyB.isStatic) {
                  bodyB.velocity.x -= nx * relVelDotNormal * 0.5;
                  bodyB.velocity.y -= ny * relVelDotNormal * 0.5;
                }
              }
            }
          }
        }
        
        // Special method for tests that manually force a collision
        // This is needed because the mock environment might not fully simulate 
        // the actual physics behavior
        forceCollision(bodyAId: string, bodyBId: string, options = {}) {
          const bodyA = this.bodies.get(bodyAId);
          const bodyB = this.bodies.get(bodyBId);
          
          if (!bodyA || !bodyB) return;
          
          // Create a unique pair ID
          const pairId = [bodyAId, bodyBId].sort().join('-');
          
          // Add to active collisions
          this.activeCollisionPairs.add(pairId);
          
          // Trigger collision event
          this.triggerCollisionEvent('collisionStart', {
            bodyA,
            bodyB,
            bodyAId,
            bodyBId,
            collisionPoint: {
              x: (bodyA.position.x + bodyB.position.x) / 2,
              y: (bodyA.position.y + bodyB.position.y) / 2
            },
            normal: {
              x: (bodyB.position.x - bodyA.position.x),
              y: (bodyB.position.y - bodyA.position.y)
            },
            impact: 10,
            pairId,
            ...options
          });
        }
        
        detectAndResolveCollisions() {
          // Store current collision pairs for this frame
          const currentCollisionPairs = new Set<string>();
          
          // Check all pairs of bodies for collisions
          const bodies = Array.from(this.bodies.values());
          
          for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
              const bodyA = bodies[i];
              const bodyB = bodies[j];
              
              // Skip if either body is missing
              if (!bodyA || !bodyB) continue;
              
              // Create a unique pair ID (always sorted alphabetically for consistency)
              const pairId = [bodyA.id, bodyB.id].sort().join('-');
              
              // Check for collision
              const isColliding = checkCollision(bodyA, bodyB);
              
              if (isColliding) {
                currentCollisionPairs.add(pairId);
                
                // If this is a new collision, trigger collisionStart
                if (!this.activeCollisionPairs.has(pairId)) {
                  this.triggerCollisionEvent('collisionStart', {
                    bodyA: bodyA,
                    bodyB: bodyB,
                    bodyAId: bodyA.id,
                    bodyBId: bodyB.id,
                    collisionPoint: {
                      x: (bodyA.position.x + bodyB.position.x) / 2,
                      y: (bodyA.position.y + bodyB.position.y) / 2
                    },
                    normal: {
                      x: bodyB.position.x - bodyA.position.x,
                      y: bodyB.position.y - bodyA.position.y
                    },
                    impact: 10, // Mock impact value
                    pairId
                  });
                } else {
                  // Ongoing collision
                  this.triggerCollisionEvent('collisionActive', {
                    bodyA: bodyA,
                    bodyB: bodyB,
                    bodyAId: bodyA.id,
                    bodyBId: bodyB.id,
                    collisionPoint: {
                      x: (bodyA.position.x + bodyB.position.x) / 2,
                      y: (bodyA.position.y + bodyB.position.y) / 2
                    },
                    normal: {
                      x: bodyB.position.x - bodyA.position.x,
                      y: bodyB.position.y - bodyA.position.y
                    },
                    impact: 5, // Less impact during active collision
                    pairId
                  });
                }
                
                // Simple collision resolution
                if (!bodyA.isStatic && !bodyB.isStatic) {
                  // Exchange velocities (simplified)
                  const tempVx = bodyA.velocity.x;
                  const tempVy = bodyA.velocity.y;
                  
                  bodyA.velocity.x = bodyB.velocity.x * 0.9;
                  bodyA.velocity.y = bodyB.velocity.y * 0.9;
                  
                  bodyB.velocity.x = tempVx * 0.9;
                  bodyB.velocity.y = tempVy * 0.9;
                } else if (!bodyA.isStatic) {
                  // B is static, reverse A's velocity
                  bodyA.velocity.x *= -0.9;
                  bodyA.velocity.y *= -0.9;
                } else if (!bodyB.isStatic) {
                  // A is static, reverse B's velocity
                  bodyB.velocity.x *= -0.9;
                  bodyB.velocity.y *= -0.9;
                }
              }
            }
          }
          
          // Check for collision endings
          for (const pairId of this.activeCollisionPairs) {
            if (!currentCollisionPairs.has(pairId)) {
              // This pair is no longer colliding
              const [idA, idB] = pairId.split('-');
              const bodyA = this.bodies.get(idA);
              const bodyB = this.bodies.get(idB);
              
              if (bodyA && bodyB) {
                this.triggerCollisionEvent('collisionEnd', {
                  bodyA: bodyA,
                  bodyB: bodyB,
                  bodyAId: bodyA.id,
                  bodyBId: bodyB.id,
                  pairId
                });
              }
            }
          }
          
          // Update active collision pairs for the next frame
          this.activeCollisionPairs = currentCollisionPairs;
        }
        
        triggerCollisionEvent(type: string, data: any) {
          // Call both specific listeners and general collision listeners
          const specificListeners = this.eventListeners[type] || [];
          const generalListeners = this.eventListeners.collision || [];
          
          [...specificListeners, ...generalListeners].forEach(listener => {
            listener({
              type,
              ...data,
              timestamp: Date.now()
            });
          });
        }
        
        addCollisionListener(type: string, listener: Function) {
          if (!this.eventListeners[type]) {
            this.eventListeners[type] = [];
          }
          
          // Create a listener ID
          const id = createId('sub');
          
          // Store the ID on the listener function for retrieval later
          (listener as any).id = id;
          
          this.eventListeners[type].push(listener);
          return id;
        }
        
        removeCollisionListener(id: string) {
          let removed = false;
          
          // Check all event types
          Object.keys(this.eventListeners).forEach(type => {
            const index = this.eventListeners[type].findIndex(l => (l as any).id === id);
            if (index !== -1) {
              this.eventListeners[type].splice(index, 1);
              removed = true;
            }
          });
          
          return removed;
        }
        
        addConstraint(options: any) {
          // Validate bodies exist
          const bodyA = this.bodies.get(options.bodyAId);
          const bodyB = this.bodies.get(options.bodyBId);
          
          if (!bodyA || !bodyB) {
            console.error(`Cannot add constraint: Body A ('${options.bodyAId}') or Body B ('${options.bodyBId}') not found.`);
            return null;
          }
          
          const id = options.id || `physics_constraint_${this.constraints.size + 1}`;
          
          // Calculate length if not provided
          const length = options.length !== undefined 
            ? options.length 
            : calculateDistance(bodyA.position, bodyB.position);
          
          const constraint: Constraint = {
            id,
            type: options.type || 'distance',
            bodyAId: options.bodyAId,
            bodyBId: options.bodyBId,
            length: length, // Use calculated length or provided length
            stiffness: options.stiffness || 0.5,
            damping: options.damping || 0.3,
            anchorA: options.anchorA || { x: 0, y: 0 },
            anchorB: options.anchorB || { x: 0, y: 0 },
            ...options
          };
          
          this.constraints.set(id, constraint);
          return id;
        }
        
        removeConstraint(id: string) {
          if (this.constraints.has(id)) {
            this.constraints.delete(id);
            return true;
          }
          return false;
        }
        
        // Additional utility methods required by tests
        setBodyVelocity(id: string, velocity: Vector) {
          const body = this.bodies.get(id);
          if (body) {
            body.velocity = { ...velocity };
          }
        }
        
        applyForce(id: string, force: Vector) {
          const body = this.bodies.get(id);
          if (body) {
            body.forces.push(force);
          }
        }
        
        setBodyPosition(id: string, position: Vector) {
          const body = this.bodies.get(id);
          if (body) {
            body.position = { ...position };
          }
        }
        
        // Simulate a collision between two bodies
        simulateCollision(bodyAId: string, bodyBId: string, data = {}) {
          const bodyA = this.bodies.get(bodyAId);
          const bodyB = this.bodies.get(bodyBId);
          
          if (bodyA && bodyB) {
            const pairId = [bodyAId, bodyBId].sort().join('-');
            this.activeCollisionPairs.add(pairId);
            
            this.triggerCollisionEvent('collisionStart', {
              bodyA,
              bodyB,
              bodyAId,
              bodyBId,
              collisionPoint: { 
                x: (bodyA.position.x + bodyB.position.x) / 2,
                y: (bodyA.position.y + bodyB.position.y) / 2
              },
              impactForce: 10,
              relativeVelocity: { 
                x: bodyB.velocity.x - bodyA.velocity.x,
                y: bodyB.velocity.y - bodyA.velocity.y
              },
              pairId,
              ...data
            });
          }
        }
      }
    };
  });
}; 