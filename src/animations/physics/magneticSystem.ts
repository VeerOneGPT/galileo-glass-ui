/**
 * Magnetic System for Multi-Element Interactions
 * 
 * Provides a system for coordinating multiple magnetic elements that can
 * interact with each other and respond together to magnetic forces.
 */

import { ForceVector } from './magneticEffect';
import { GalileoPhysicsSystem, physicsSystem, PhysicsObject, PhysicsEvent, Vector } from './galileoPhysicsSystem';
import { DirectionalFieldConfig, PointerData } from './directionalField';
import { 
  calculateDirectionalForce, 
  normalizeVector, 
  scaleVector, 
  vectorMagnitude 
} from './directionalFieldImpl';

/**
 * Configuration options for a magnetic system
 */
export interface MagneticSystemConfig {
  /**
   * Unique ID for the system
   */
  id?: string;
  
  /**
   * Whether elements should interact with each other
   */
  enableElementInteraction?: boolean;
  
  /**
   * Strength of interactions between elements (0-1)
   */
  interactionStrength?: number;
  
  /**
   * Maximum distance for element interactions
   */
  interactionRadius?: number;
  
  /**
   * Whether elements can attract each other
   */
  enableAttraction?: boolean;
  
  /**
   * Whether elements can repel each other
   */
  enableRepulsion?: boolean;
  
  /**
   * Whether to use the global physics system for interactions
   */
  usePhysicsSystem?: boolean;
  
  /**
   * Custom physics system instance (if not using global)
   */
  customPhysicsSystem?: GalileoPhysicsSystem;
  
  /**
   * Function to determine if two elements should interact
   */
  interactionFilter?: (elementA: MagneticElement, elementB: MagneticElement) => boolean;
  
  /**
   * Function to modify interaction forces between elements
   */
  forceModifier?: (force: ForceVector, elementA: MagneticElement, elementB: MagneticElement) => ForceVector;
  
  /**
   * Field used for group behavior
   */
  groupField?: DirectionalFieldConfig;
  
  /**
   * Whether elements should maintain a minimum distance
   */
  enableCollisionAvoidance?: boolean;
  
  /**
   * Minimum distance between elements when collision avoidance is enabled
   */
  minElementDistance?: number;
}

/**
 * Registration options for a magnetic element in a system
 */
export interface MagneticElementOptions {
  /**
   * Element HTML reference
   */
  element: HTMLElement;
  
  /**
   * Unique ID for the element
   */
  id?: string;
  
  /**
   * Position of the element
   */
  position?: {
    x: number;
    y: number;
  };
  
  /**
   * Mass of the element (affects force response)
   */
  mass?: number;
  
  /**
   * Influence radius of the element
   */
  radius?: number;
  
  /**
   * Whether the element is static (doesn't move in response to forces)
   */
  isStatic?: boolean;
  
  /**
   * Whether the element attracts other elements
   */
  isAttractor?: boolean;
  
  /**
   * Whether the element repels other elements
   */
  isRepeller?: boolean;
  
  /**
   * Strength of the element's magnetic field (0-1)
   */
  strength?: number;
  
  /**
   * Function to apply magnetic transform to the element
   */
  applyTransform?: (transform: MagneticTransform) => void;
  
  /**
   * Custom field configuration for this element
   */
  directionalField?: DirectionalFieldConfig;
  
  /**
   * Custom data associated with the element
   */
  userData?: any;
  
  /**
   * Role in the magnetic system
   */
  role?: 'leader' | 'follower' | 'independent';
}

/**
 * Magnetic element in a system
 */
export interface MagneticElement {
  /**
   * Unique ID for the element
   */
  id: string;
  
  /**
   * HTML element reference
   */
  element: HTMLElement;
  
  /**
   * Current position of the element
   */
  position: {
    x: number;
    y: number;
  };
  
  /**
   * Current velocity of the element
   */
  velocity: {
    x: number;
    y: number;
  };
  
  /**
   * Mass of the element
   */
  mass: number;
  
  /**
   * Influence radius of the element
   */
  radius: number;
  
  /**
   * Whether the element is static
   */
  isStatic: boolean;
  
  /**
   * Whether the element attracts other elements
   */
  isAttractor: boolean;
  
  /**
   * Whether the element repels other elements
   */
  isRepeller: boolean;
  
  /**
   * Strength of the element's magnetic field
   */
  strength: number;
  
  /**
   * Current magnetic transform
   */
  transform: MagneticTransform;
  
  /**
   * Function to apply magnetic transform
   */
  applyTransform: (transform: MagneticTransform) => void;
  
  /**
   * Physics object ID (if registered with physics system)
   */
  physicsObjectId: string | number | null;
  
  /**
   * Directional field configuration
   */
  directionalField: DirectionalFieldConfig | null;
  
  /**
   * Custom data associated with the element
   */
  userData: any;
  
  /**
   * Role in the magnetic system
   */
  role: 'leader' | 'follower' | 'independent';
  
  /**
   * Whether the element is currently active
   */
  isActive: boolean;
}

/**
 * Magnetic transform applied to elements
 */
export interface MagneticTransform {
  /**
   * X translation in pixels
   */
  x: number;
  
  /**
   * Y translation in pixels
   */
  y: number;
  
  /**
   * Rotation in degrees
   */
  rotation: number;
  
  /**
   * Scale factor
   */
  scale: number;
  
  /**
   * Whether the element is actively being transformed
   */
  active: boolean;
  
  /**
   * Normalized force magnitude (0-1)
   */
  force: number;
}

/**
 * Manages a system of magnetic elements that interact with each other
 */
export class MagneticSystemManager {
  /**
   * System configuration
   */
  private config: MagneticSystemConfig;
  
  /**
   * Unique ID for the system
   */
  private id: string;
  
  /**
   * Reference to physics system
   */
  private physicsSystem: GalileoPhysicsSystem;
  
  /**
   * Map of registered elements by ID
   */
  private elements: Map<string, MagneticElement> = new Map();
  
  /**
   * Animation frame request ID
   */
  private animationFrameId: number | null = null;
  
  /**
   * Whether the system is currently running
   */
  private isRunning = false;
  
  /**
   * Event listeners for the system
   */
  private eventListeners: Map<string, Set<Function>> = new Map();
  
  /**
   * Mouse position for interaction
   */
  private mousePosition: { x: number, y: number } = { x: 0, y: 0 };
  
  /**
   * Whether the mouse is currently over any system element
   */
  private isMouseOver = false;
  
  /**
   * Last timestamp for frame rate calculation
   */
  private lastUpdateTime = 0;
  
  /**
   * Create a new magnetic system
   */
  constructor(config: MagneticSystemConfig = {}) {
    // Set default configuration
    this.config = {
      enableElementInteraction: true,
      interactionStrength: 0.5,
      interactionRadius: 200,
      enableAttraction: true,
      enableRepulsion: true,
      usePhysicsSystem: true,
      enableCollisionAvoidance: false,
      minElementDistance: 20,
      ...config
    };
    
    // Generate system ID
    this.id = config.id || `magnetic_system_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Get physics system reference
    this.physicsSystem = config.customPhysicsSystem || 
      (this.config.usePhysicsSystem ? physicsSystem : new GalileoPhysicsSystem());
    
    // Initialize event listener maps
    ['elementAdded', 'elementRemoved', 'elementUpdated', 'interaction'].forEach(event => {
      this.eventListeners.set(event, new Set());
    });
    
    // Start the system if using physics
    if (this.config.usePhysicsSystem) {
      // Add collision listener to physics system
      this.physicsSystem.addEventListener('collision', this.handlePhysicsCollision);
    }
    
    // Add mouse move listener for interactions
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  
  /**
   * Handle mouse movement for interaction with system elements
   */
  private handleMouseMove = (e: MouseEvent) => {
    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;
    
    // Check if mouse is over any system element
    const wasMouseOver = this.isMouseOver;
    this.isMouseOver = false;
    
    for (const element of this.elements.values()) {
      const rect = element.element.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        this.isMouseOver = true;
        break;
      }
    }
    
    // Start/stop the animation loop based on mouse position
    if (this.isMouseOver !== wasMouseOver) {
      if (this.isMouseOver && !this.isRunning) {
        this.start();
      } else if (!this.isMouseOver && this.isRunning && this.elements.size > 0) {
        // Don't stop immediately, let the system run for a bit to animate back to original positions
        setTimeout(() => {
          // Only stop if mouse is still not over any element
          if (!this.isMouseOver) {
            const anyActive = Array.from(this.elements.values()).some(el => el.transform.active);
            if (!anyActive) {
              this.stop();
            }
          }
        }, 500);
      }
    }
  };
  
  /**
   * Handle physics system collisions
   */
  private handlePhysicsCollision = (event: PhysicsEvent) => {
    // Guard against missing objects or userData
    if (!event.objectA?.userData || !event.objectB?.userData) return;
    
    // Safely access potential magneticElementId
    const elementAId = event.objectA.userData.magneticElementId as string | undefined;
    const elementBId = event.objectB.userData.magneticElementId as string | undefined;
    
    if (!elementAId || !elementBId) return;
    
    const elementA = this.elements.get(elementAId);
    const elementB = this.elements.get(elementBId);
    
    if (!elementA || !elementB) return;
    
    // Dispatch interaction event
    this.dispatchEvent('interaction', {
      elementA,
      elementB,
      // Ensure contactPoint and normal exist before accessing properties
      contactPoint: event.contactPoint ? { ...event.contactPoint } : undefined,
      contactNormal: event.contactNormal ? { ...event.contactNormal } : undefined,
      penetration: event.penetration
    });
  };
  
  /**
   * Register a new element with the system
   */
  public registerElement(options: MagneticElementOptions): string {
    // Generate ID if not provided
    const id = options.id || `magnetic_element_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Check if element already exists
    if (this.elements.has(id)) {
      throw new Error(`Element with ID ${id} already exists in the system`);
    }
    
    let position = options.position;
    let elementRect: DOMRect | null = null;
    try {
        elementRect = options.element.getBoundingClientRect();
    } catch (e) {
        console.error(`Error getting bounding rect for element ID ${options.id}:`, e);
        // Handle error: maybe skip registration or use a default position?
        throw new Error(`Failed to get bounding client rect for element in registerElement`);
    }

    if (!position && elementRect) {
      position = {
        x: elementRect.left + elementRect.width / 2,
        y: elementRect.top + elementRect.height / 2
      };
    } else if (!position) {
        // Fallback if position is needed but rect failed
        console.warn(`Using default position {0, 0} for element ID ${options.id}`);
        position = { x: 0, y: 0 };
    }
    
    // Default transform function if not provided
    const applyTransform = options.applyTransform || ((transform: MagneticTransform) => {
      try {
        options.element.style.transform = `
          translate(${transform.x}px, ${transform.y}px)
          ${transform.rotation !== 0 ? `rotate(${transform.rotation}deg)` : ''}
          ${transform.scale !== 1 ? `scale(${transform.scale})` : ''}
        `;
      } catch (e) {
        console.error(`Error applying transform to element ID ${id}:`, e);
      }
    });
    
    // Create the magnetic element
    const element: MagneticElement = {
      id,
      element: options.element,
      position,
      velocity: { x: 0, y: 0 },
      mass: options.mass ?? 1,
      radius: options.radius ?? (elementRect ? Math.max(elementRect.width, elementRect.height) / 2 : 50),
      isStatic: options.isStatic ?? false,
      isAttractor: options.isAttractor ?? false,
      isRepeller: options.isRepeller ?? false,
      strength: options.strength ?? 1,
      transform: {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        active: false,
        force: 0
      },
      applyTransform,
      physicsObjectId: null,
      directionalField: options.directionalField ?? null,
      userData: options.userData ?? {},
      role: options.role ?? 'independent',
      isActive: false
    };
    
    // Register with physics system if enabled
    if (this.config.usePhysicsSystem && this.physicsSystem) {
      try {
        const physicsObjectId = this.physicsSystem.addObject({
          position: {
            x: element.position.x,
            y: element.position.y,
          },
          mass: element.mass,
          shape: 'circle',
          radius: element.radius,
          isStatic: element.isStatic,
          velocity: { x: 0, y: 0 },
          userData: {
            magneticElementId: id,
            magneticSystemId: this.id
          }
        });
        element.physicsObjectId = physicsObjectId;
      } catch (e) {
        console.error(`Error registering element ${id} with physics system:`, e);
      }
    }
    
    // Add element to the system
    this.elements.set(id, element);
    
    // Dispatch element added event
    this.dispatchEvent('elementAdded', { element });
    
    // Start system if not running and we have elements
    if (!this.isRunning && this.elements.size > 0) {
      this.start();
    }
    
    return id;
  }
  
  /**
   * Remove an element from the system
   */
  public unregisterElement(id: string): boolean {
    const element = this.elements.get(id);
    
    if (!element) {
      return false;
    }
    
    // Remove from physics system if registered
    if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
        try {
           // Ensure ID is a string for physics system methods
           this.physicsSystem.removeObject(String(element.physicsObjectId));
        } catch (e) {
           console.error(`Error removing physics object ${element.physicsObjectId} for element ${id}:`, e);
        }
    }
    
    // Remove from elements map
    this.elements.delete(id);
    
    // Dispatch element removed event
    this.dispatchEvent('elementRemoved', { element });
    
    // Stop system if no elements remain
    if (this.elements.size === 0 && this.isRunning) {
      this.stop();
    }
    
    return true;
  }
  
  /**
   * Update an element's properties
   */
  public updateElement(id: string, updates: Partial<MagneticElementOptions>): boolean {
    const element = this.elements.get(id);
    
    if (!element) {
      return false;
    }
    
    // Update element properties
    if (updates.element) {
      element.element = updates.element;
    }
    
    if (updates.position) {
      element.position = updates.position;
      if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
         try {
            // Ensure ID is a string
            this.physicsSystem.updateObject(String(element.physicsObjectId), {
              position: updates.position
            });
         } catch (e) {
            console.error(`Error updating position for physics object ${element.physicsObjectId}:`, e);
         }
      }
    }
    
    if (updates.mass !== undefined) {
      element.mass = updates.mass;
      if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
          try {
             // Ensure ID is a string
             this.physicsSystem.updateObject(String(element.physicsObjectId), {
               mass: updates.mass
             });
          } catch (e) {
             console.error(`Error updating mass for physics object ${element.physicsObjectId}:`, e);
          }
      }
    }
    
    if (updates.radius !== undefined) {
      element.radius = updates.radius;
      if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
          try {
             // Ensure ID is a string
             this.physicsSystem.updateObject(String(element.physicsObjectId), {
               radius: updates.radius // Pass radius directly
             });
          } catch (e) {
              console.error(`Error updating radius for physics object ${element.physicsObjectId}:`, e);
          }
      }
    }
    
    if (updates.isStatic !== undefined) {
      element.isStatic = updates.isStatic;
      if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
          try {
             // Ensure ID is a string
             this.physicsSystem.updateObject(String(element.physicsObjectId), {
               isStatic: updates.isStatic
             });
          } catch (e) {
             console.error(`Error updating isStatic for physics object ${element.physicsObjectId}:`, e);
          }
      }
    }
    
    if (updates.isAttractor !== undefined) {
      element.isAttractor = updates.isAttractor;
    }
    
    if (updates.isRepeller !== undefined) {
      element.isRepeller = updates.isRepeller;
    }
    
    if (updates.strength !== undefined) {
      element.strength = updates.strength;
    }
    
    if (updates.applyTransform) {
      element.applyTransform = updates.applyTransform;
    }
    
    if (updates.directionalField !== undefined) {
      element.directionalField = updates.directionalField;
    }
    
    if (updates.userData !== undefined) {
      element.userData = updates.userData;
    }
    
    if (updates.role !== undefined) {
      element.role = updates.role;
    }
    
    // Dispatch element updated event
    this.dispatchEvent('elementUpdated', { element, updates });
    
    return true;
  }
  
  /**
   * Get an element by ID
   */
  public getElement(id: string): MagneticElement | undefined {
    return this.elements.get(id);
  }
  
  /**
   * Get all elements in the system
   */
  public getAllElements(): MagneticElement[] {
    return Array.from(this.elements.values());
  }
  
  /**
   * Apply force to an element
   */
  public applyForce(id: string, force: ForceVector): boolean {
    const element = this.elements.get(id);
    
    if (!element || element.isStatic) {
      return false;
    }
    
    if (element.physicsObjectId !== null && this.config.usePhysicsSystem) {
        try {
           // Ensure ID is a string
           this.physicsSystem.applyForce(String(element.physicsObjectId), force);
        } catch (e) {
           console.error(`Error applying force to physics object ${element.physicsObjectId}:`, e);
        }
    } else {
      // Otherwise, manually apply force to velocity
      const accelerationX = force.x / element.mass;
      const accelerationY = force.y / element.mass;
      
      element.velocity.x += accelerationX;
      element.velocity.y += accelerationY;
    }
    
    return true;
  }
  
  /**
   * Update system for a single frame
   */
  private update = (timestamp: number) => {
    if (!this.isRunning) return;
    
    // Calculate delta time, handle first frame and large gaps
    const now = performance.now(); // Use performance.now() for higher precision
    const deltaTime = this.lastUpdateTime === 0 ? 1 / 60 : (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;
    
    // Clamp deltaTime to prevent physics instability
    const clampedDeltaTime = Math.max(0, Math.min(deltaTime, 0.1)); 

    // If clamped time is effectively zero, skip update to avoid NaN issues
    if (clampedDeltaTime <= 1e-6) {
        this.animationFrameId = requestAnimationFrame(this.update);
        return;
    }
    
    // Update element positions from DOM (only if not using physics system for position)
    // If using physics, position should ideally come FROM the physics system
    if (!this.config.usePhysicsSystem) {
        for (const element of this.elements.values()) {
            if (element.isStatic) continue; // Don't update static elements from DOM
            try {
                const rect = element.element.getBoundingClientRect();
                element.position = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            } catch (e) {
                 console.warn(`Could not get bounding rect for element ${element.id} in update loop`);
                 // Decide how to handle - maybe deactivate element?
                 element.isActive = false; 
            }
        }
    } else {
        // If using physics, update element positions FROM physics system
        for (const element of this.elements.values()) {
             if (element.physicsObjectId !== null) {
                 try {
                    // Ensure ID is a string
                    const physicsObject = this.physicsSystem.getObject(String(element.physicsObjectId));
                    if (physicsObject && physicsObject.position) {
                         element.position.x = physicsObject.position.x;
                         element.position.y = physicsObject.position.y;
                         if (physicsObject.velocity) {
                              element.velocity.x = physicsObject.velocity.x;
                              element.velocity.y = physicsObject.velocity.y;
                         }
                    } else {
                        console.warn(`Could not find or get position for physics object ${element.physicsObjectId}`);
                        element.isActive = false;
                    }
                 } catch (e) {
                    console.error(`Error getting physics object ${element.physicsObjectId}:`, e);
                    element.isActive = false;
                 }
             }
        }
    }

    // Reset forces or accelerations before calculating new ones
    // (This depends on whether you accumulate forces or set them each frame)
    // Example: If NOT using physics system directly for integration:
    if (!this.config.usePhysicsSystem) {
        for (const element of this.elements.values()) {
            // Reset acceleration implicitly by recalculating velocity changes
        }
    }

    // Process element interactions
    if (this.config.enableElementInteraction) {
      this.processElementInteractions(clampedDeltaTime);
    }
    
    // Apply group field if configured
    if (this.config.groupField) {
      this.applyGroupField(clampedDeltaTime);
    }

    // Integrate velocity and position IF NOT using physics system for integration
    if (!this.config.usePhysicsSystem) {
        for (const element of this.elements.values()) {
            if (element.isStatic || !element.isActive) continue;

            // Simple Euler integration (can replace with Verlet, RK4 etc.)
            element.position.x += element.velocity.x * clampedDeltaTime;
            element.position.y += element.velocity.y * clampedDeltaTime;

            // Apply damping/friction
            element.velocity.x *= Math.pow(0.95, clampedDeltaTime * 60); // Example damping
            element.velocity.y *= Math.pow(0.95, clampedDeltaTime * 60);
        }
    }
    
    // Apply transforms to elements based on their current state
    this.applyTransforms(); // This function likely calculates transform based on position/velocity/forces
    
    // Check if any elements are still active (moving or being affected)
    const anyActive = Array.from(this.elements.values()).some(el => el.isActive); // Refine isActive logic

    // Continue or stop the loop
    if (anyActive || this.isMouseOver) { // Keep running if mouse is over or elements are active
      this.animationFrameId = requestAnimationFrame(this.update);
    } else {
      this.stop(); // Stop if mouse is not over AND no elements are active
    }
  };
  
  /**
   * Process interactions between elements
   */
  private processElementInteractions(deltaTime: number): void {
    const elementsArray = Array.from(this.elements.values());
    const numElements = elementsArray.length;

    for (let i = 0; i < numElements; i++) {
      const elementA = elementsArray[i];
      if (elementA.isStatic || !elementA.isActive) continue; 

      // Reset net force for this element for this frame
      let netForceA: ForceVector = { x: 0, y: 0 };

      for (let j = i + 1; j < numElements; j++) {
        const elementB = elementsArray[j];
        if (!elementB.isActive) continue;

        // Check interaction filter
        if (this.config.interactionFilter && !this.config.interactionFilter(elementA, elementB)) {
          continue;
        }

        const dx = elementB.position.x - elementA.position.x;
        const dy = elementB.position.y - elementA.position.y;
        const distanceSq = dx * dx + dy * dy;
        const interactionRadiusSq = (this.config.interactionRadius ?? 200) ** 2;

        if (distanceSq > 0 && distanceSq < interactionRadiusSq) {
          const distance = Math.sqrt(distanceSq);
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          let forceMagnitude = 0;
          let interactionType: 'attraction' | 'repulsion' | 'none' = 'none';

          // Calculate base attraction/repulsion
          if (this.config.enableAttraction && elementA.isAttractor && elementB.isAttractor) {
              // Attraction: force pulls elements together (inverse square law is common)
              forceMagnitude += (elementA.strength * elementB.strength * (this.config.interactionStrength ?? 0.5)) / distanceSq;
              interactionType = 'attraction';
          } else if (this.config.enableRepulsion && elementA.isRepeller && elementB.isRepeller) {
               // Repulsion: force pushes elements apart
               forceMagnitude -= (elementA.strength * elementB.strength * (this.config.interactionStrength ?? 0.5)) / distanceSq;
               interactionType = 'repulsion';
          } // Add logic for attractor-repeller interaction if needed

          // Apply collision avoidance force
          if (this.config.enableCollisionAvoidance && distance < (this.config.minElementDistance ?? 20)) {
              const avoidanceStrength = 100; // Adjust as needed
              const penetration = (this.config.minElementDistance ?? 20) - distance;
              forceMagnitude -= avoidanceStrength * penetration; // Repulsive force
              if (interactionType === 'attraction') interactionType = 'repulsion'; // Override attraction if too close
              else interactionType = 'repulsion';
          }

          if (forceMagnitude !== 0) {
              let forceVector: ForceVector = {
                  x: normalizedDx * forceMagnitude,
                  y: normalizedDy * forceMagnitude
              };

              // Apply force modifier if provided
              if (this.config.forceModifier) {
                   try {
                      forceVector = this.config.forceModifier(forceVector, elementA, elementB);
                   } catch (e) {
                       console.error(`Error in forceModifier for elements ${elementA.id} and ${elementB.id}:`, e);
                   }
              }

              // Accumulate force for element A
              netForceA.x += forceVector.x;
              netForceA.y += forceVector.y;

              // Apply equal and opposite force to element B (if not static)
              if (!elementB.isStatic) {
                    // Need to track net force for B separately if not using physics system
                    // For simplicity here, applying directly if not using physics
                    if (!this.config.usePhysicsSystem) {
                         const accelerationBx = -forceVector.x / elementB.mass;
                         const accelerationBy = -forceVector.y / elementB.mass;
                         elementB.velocity.x += accelerationBx * deltaTime;
                         elementB.velocity.y += accelerationBy * deltaTime;
                    } else if (elementB.physicsObjectId !== null) {
                         try {
                            // Ensure ID is a string
                            this.physicsSystem.applyForce(String(elementB.physicsObjectId), { x: -forceVector.x, y: -forceVector.y });
                         } catch (e) {
                             console.error(`Error applying interaction force to physics object ${elementB.physicsObjectId}:`, e);
                         }
                    }
              }

              // Dispatch interaction event (consider performance impact)
              // this.dispatchEvent('interaction', { elementA, elementB, force: forceVector });
          }
        }
      }

      // Apply the accumulated net force to element A
       if (!elementA.isStatic) {
           if (!this.config.usePhysicsSystem) {
               const accelerationAx = netForceA.x / elementA.mass;
               const accelerationAy = netForceA.y / elementA.mass;
               elementA.velocity.x += accelerationAx * deltaTime;
               elementA.velocity.y += accelerationAy * deltaTime;
           } else if (elementA.physicsObjectId !== null) {
               try {
                  // Ensure ID is a string
                  this.physicsSystem.applyForce(String(elementA.physicsObjectId), netForceA);
               } catch (e) {
                  console.error(`Error applying net interaction force to physics object ${elementA.physicsObjectId}:`, e);
               }
           }
       }
    }
  }
  
  /**
   * Apply group field to all elements
   */
  private applyGroupField(deltaTime: number): void {
    if (!this.config.groupField) return;
    const fieldConfig = this.config.groupField;

    for (const element of this.elements.values()) {
        if (element.isStatic || !element.isActive) continue;

        try {
            let forceToApply: ForceVector = { x: 0, y: 0 };

            // Check if the field behavior is constant, as we lack PointerData
            if (fieldConfig.behavior === 'constant') {
                 // For constant behavior, we *might* be able to derive the force directly
                 // This assumes a 'constant' field applies uniformly based on its type/direction
                 // NOTE: This is an assumption based on the available info. The exact intended
                 //       logic for applying a non-pointer groupField might differ.

                 switch (fieldConfig.type) {
                    case 'unidirectional':
                        forceToApply = normalizeVector(fieldConfig.direction || { x: 1, y: 0 });
                        // Assuming constant unidirectional applies max force (magnitude 1)
                        break;
                    case 'bidirectional':
                        // Constant bidirectional without pointer reference is ambiguous.
                        // Defaulting to zero force. Needs clarification on intended behavior.
                        forceToApply = { x: 0, y: 0 }; 
                        break;
                    // Other types like radial, tangential, vortex inherently depend on a reference point (like pointer)
                    // Constant behavior for these without PointerData is unclear. Defaulting to zero.
                    case 'radial':
                    case 'tangential':
                    case 'vortex':
                    case 'flow': // Flow fields also need a position reference
                    case 'custom':
                    default:
                        forceToApply = { x: 0, y: 0 };
                        break;
                 }
                 // Apply configured severity/strength if available (assuming a generic strength property might exist)
                 const strength = (fieldConfig as any).strength || 1.0; // Check if strength exists
                 forceToApply = scaleVector(forceToApply, strength);

            } else {
                 // Cannot calculate non-constant field force without PointerData
                 // console.warn(`Cannot apply non-constant groupField (${fieldConfig.type}/${fieldConfig.behavior}) without PointerData.`);
                 // Skipping force application for this element
                 continue; // Go to the next element
            }

            // Apply the derived force
            if (vectorMagnitude(forceToApply) > 0) { // Only apply if force is non-zero
                if (!this.config.usePhysicsSystem) {
                    const accelerationX = forceToApply.x / element.mass;
                    const accelerationY = forceToApply.y / element.mass;
                    element.velocity.x += accelerationX * deltaTime;
                    element.velocity.y += accelerationY * deltaTime;
                } else if (element.physicsObjectId !== null) {
                    try {
                        // Ensure ID is a string
                        this.physicsSystem.applyForce(String(element.physicsObjectId), forceToApply);
                    } catch(e) {
                        console.error(`Error applying group field force to physics object ${element.physicsObjectId}:`, e);
                    }
                }
            }
        } catch (e) {
            console.error(`Error calculating or applying group field to element ${element.id}:`, e);
        }
    }
  }
  
  /**
   * Apply all transforms to elements
   */
  private applyTransforms(): void {
      for (const element of this.elements.values()) {
          if (!element.isActive && element.transform.x === 0 && element.transform.y === 0 && element.transform.rotation === 0 && element.transform.scale === 1) {
              // Skip applying transform if element is inactive and already at base state
              continue; 
          }

          let targetX = 0;
          let targetY = 0;
          let targetRotation = 0;
          let targetScale = 1;
          let forceMagnitude = 0;

          // Determine target transform based on velocity, forces, or other logic
          // This part is highly dependent on the desired magnetic effect.
          // Example: Simple transform based on velocity (needs smoothing/interpolation)
          if (Math.abs(element.velocity.x) > 0.1 || Math.abs(element.velocity.y) > 0.1) {
              targetX = element.velocity.x * 0.1; // Scale velocity effect
              targetY = element.velocity.y * 0.1;
              forceMagnitude = Math.sqrt(targetX*targetX + targetY*targetY) / (element.radius * 0.5); // Example force calculation
              element.isActive = true; // Mark active if moving
          } else {
              // If velocity is near zero, target the base state
              targetX = 0;
              targetY = 0;
              element.isActive = false; // Mark inactive if stopped
          }

          // Interpolate towards target transform (simple lerp example)
          const lerpFactor = 0.1; // Adjust for desired smoothness
          element.transform.x += (targetX - element.transform.x) * lerpFactor;
          element.transform.y += (targetY - element.transform.y) * lerpFactor;
          element.transform.rotation += (targetRotation - element.transform.rotation) * lerpFactor;
          element.transform.scale += (targetScale - element.transform.scale) * lerpFactor;
          element.transform.force = forceMagnitude; // Update force magnitude

          // Check if transform is close enough to zero to be considered inactive
          if (!element.isActive && 
              Math.abs(element.transform.x) < 0.01 &&
              Math.abs(element.transform.y) < 0.01 &&
              Math.abs(element.transform.rotation) < 0.1 &&
              Math.abs(element.transform.scale - 1) < 0.01) {
              // Snap to base state and ensure inactive
              element.transform.x = 0;
              element.transform.y = 0;
              element.transform.rotation = 0;
              element.transform.scale = 1;
              element.transform.active = false;
              element.transform.force = 0;
          } else {
              element.transform.active = true; // Mark active if transform is applied
          }

          // Apply the calculated transform to the DOM element
          try {
             element.applyTransform(element.transform);
          } catch (e) {
             console.error(`Error in custom applyTransform for element ${element.id}:`, e);
             // Handle error, maybe remove element or use default transform
          }
      }
  }
  
  /**
   * Start the magnetic system
   */
  public start(): void {
    if (!this.isRunning && this.elements.size > 0) {
      this.isRunning = true;
      this.lastUpdateTime = 0; // Reset last update time on start
      this.animationFrameId = requestAnimationFrame(this.update);
      console.log(`MagneticSystem ${this.id} started.`);
    }
  }
  
  /**
   * Stop the magnetic system
   */
  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
       // Reset elements to base state when stopping
       /*
       for (const element of this.elements.values()) {
            if (element.transform.active) {
                 element.transform = { x: 0, y: 0, rotation: 0, scale: 1, active: false, force: 0 };
                 try {
                     element.applyTransform(element.transform);
                 } catch(e) { console.error(...); }
            }
       }
       */
      console.log(`MagneticSystem ${this.id} stopped.`);
    }
  }
  
  /**
   * Add an event listener
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      console.warn(`Event type "${event}" not supported by MagneticSystem.`);
      return;
    }
    this.eventListeners.get(event)?.add(callback);
  }
  
  /**
   * Remove an event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }
  
  /**
   * Dispatch an event to all listeners
   */
  private dispatchEvent(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
          callback(data);
      } catch (e) {
          console.error(`Error in event listener for "${event}":`, e);
      }
    });
  }
  
  /**
   * Update system configuration
   */
  public updateConfig(newConfig: Partial<MagneticSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Potentially update physics system settings if needed
  }
  
  /**
   * Get current system configuration
   */
  public getConfig(): MagneticSystemConfig {
    return { ...this.config };
  }
  
  /**
   * Clean up and destroy the system
   */
  public destroy(): void {
    this.stop();
    
    // Remove all elements
    const elementIds = Array.from(this.elements.keys());
    elementIds.forEach(id => this.unregisterElement(id));
    
    // Remove physics system listener
    if (this.config.usePhysicsSystem && this.physicsSystem) {
      this.physicsSystem.removeEventListener('collision', this.handlePhysicsCollision);
    }
    
    // Remove mouse listener
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    // Clear event listeners
    this.eventListeners.forEach(listeners => listeners.clear());
    this.eventListeners.clear();
    
    // Clear elements map
    this.elements.clear();
    
    console.log(`MagneticSystem ${this.id} destroyed.`);
    
    // Remove from global registry if applicable (if using getMagneticSystem)
    if (magneticSystemRegistry.has(this.id)) {
        magneticSystemRegistry.delete(this.id);
    }
  }
}

// Global registry for magnetic systems (optional, allows retrieval by ID)
const magneticSystemRegistry: Map<string, MagneticSystemManager> = new Map();

/**
 * Creates a new magnetic system instance
 */
export function createMagneticSystem(config: MagneticSystemConfig = {}): MagneticSystemManager {
  const system = new MagneticSystemManager(config);
  if (system.getConfig().id) { // Use the ID from config if provided
      magneticSystemRegistry.set(system.getConfig().id!, system);
  }
  return system;
}

/**
 * Retrieves or creates a magnetic system instance by ID
 */
export function getMagneticSystem(id: string, config: MagneticSystemConfig = {}): MagneticSystemManager {
  if (magneticSystemRegistry.has(id)) {
    const system = magneticSystemRegistry.get(id)!;
    // Optionally update config if provided
    if (Object.keys(config).length > 0) {
        system.updateConfig(config);
    }
    return system;
  } else {
    // Ensure the provided config includes the ID
    const systemConfig = { ...config, id };
    const newSystem = new MagneticSystemManager(systemConfig);
    magneticSystemRegistry.set(id, newSystem);
    return newSystem;
  }
}

export default MagneticSystemManager;