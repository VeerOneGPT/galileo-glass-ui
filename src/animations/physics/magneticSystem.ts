/**
 * Magnetic System for Multi-Element Interactions
 * 
 * Provides a system for coordinating multiple magnetic elements that can
 * interact with each other and respond together to magnetic forces.
 */

import { ForceVector } from './magneticEffect';
import { GalileoPhysicsSystem, physicsSystem, PhysicsObject, PhysicsEvent } from './galileoPhysicsSystem';
import { DirectionalFieldConfig } from './directionalField';
import { calculateDirectionalForce } from './directionalFieldImpl';

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
  physicsObjectId: string | null;
  
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
  private isRunning: boolean = false;
  
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
  private isMouseOver: boolean = false;
  
  /**
   * Last timestamp for frame rate calculation
   */
  private lastUpdateTime: number = 0;
  
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
    let wasMouseOver = this.isMouseOver;
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
    if (!event.objectA || !event.objectB) return;
    
    const elementAId = (event.objectA.userData?.magneticElementId as string);
    const elementBId = (event.objectB.userData?.magneticElementId as string);
    
    if (!elementAId || !elementBId) return;
    
    const elementA = this.elements.get(elementAId);
    const elementB = this.elements.get(elementBId);
    
    if (!elementA || !elementB) return;
    
    // Dispatch interaction event
    this.dispatchEvent('interaction', {
      elementA,
      elementB,
      contactPoint: event.contactPoint,
      contactNormal: event.contactNormal,
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
    
    // Get element position from DOM if not provided
    let position = options.position;
    if (!position) {
      const rect = options.element.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    
    // Default transform function if not provided
    const applyTransform = options.applyTransform || ((transform: MagneticTransform) => {
      options.element.style.transform = `
        translate(${transform.x}px, ${transform.y}px)
        ${transform.rotation !== 0 ? `rotate(${transform.rotation}deg)` : ''}
        ${transform.scale !== 1 ? `scale(${transform.scale})` : ''}
      `;
    });
    
    // Create the magnetic element
    const element: MagneticElement = {
      id,
      element: options.element,
      position,
      velocity: { x: 0, y: 0 },
      mass: options.mass || 1,
      radius: options.radius || (
        Math.max(options.element.offsetWidth, options.element.offsetHeight) / 2
      ),
      isStatic: options.isStatic || false,
      isAttractor: options.isAttractor || false,
      isRepeller: options.isRepeller || false,
      strength: options.strength || 1,
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
      directionalField: options.directionalField || null,
      userData: options.userData || {},
      role: options.role || 'independent',
      isActive: false
    };
    
    // Register with physics system if enabled
    if (this.config.usePhysicsSystem) {
      const physicsObjectId = this.physicsSystem.addObject({
        position: {
          x: position.x,
          y: position.y
        },
        mass: element.mass,
        radius: element.radius,
        isStatic: element.isStatic,
        shape: 'circle',
        userData: {
          magneticElementId: id,
          magneticSystemId: this.id
        }
      });
      
      element.physicsObjectId = physicsObjectId;
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
    if (element.physicsObjectId && this.config.usePhysicsSystem) {
      this.physicsSystem.removeObject(element.physicsObjectId);
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
      
      // Update physics object if registered
      if (element.physicsObjectId && this.config.usePhysicsSystem) {
        this.physicsSystem.updateObject(element.physicsObjectId, {
          position: updates.position
        });
      }
    }
    
    if (updates.mass !== undefined) {
      element.mass = updates.mass;
      
      // Update physics object if registered
      if (element.physicsObjectId && this.config.usePhysicsSystem) {
        this.physicsSystem.updateObject(element.physicsObjectId, {
          mass: updates.mass
        });
      }
    }
    
    if (updates.radius !== undefined) {
      element.radius = updates.radius;
      
      // Update physics object if registered
      if (element.physicsObjectId && this.config.usePhysicsSystem) {
        this.physicsSystem.updateObject(element.physicsObjectId, {
          radius: updates.radius
        });
      }
    }
    
    if (updates.isStatic !== undefined) {
      element.isStatic = updates.isStatic;
      
      // Update physics object if registered
      if (element.physicsObjectId && this.config.usePhysicsSystem) {
        this.physicsSystem.updateObject(element.physicsObjectId, {
          isStatic: updates.isStatic
        });
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
    
    // Apply force to physics object if registered
    if (element.physicsObjectId && this.config.usePhysicsSystem) {
      this.physicsSystem.applyForce(element.physicsObjectId, force);
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
    
    // Calculate delta time
    const deltaTime = this.lastUpdateTime === 0 ? 0 : (timestamp - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = timestamp;
    
    // Skip first frame and frames with large time gaps
    if (deltaTime === 0 || deltaTime > 0.1) {
      this.animationFrameId = requestAnimationFrame(this.update);
      return;
    }
    
    // Update element positions from DOM
    for (const element of this.elements.values()) {
      const rect = element.element.getBoundingClientRect();
      element.position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Update physics object position if registered
      if (element.physicsObjectId && this.config.usePhysicsSystem) {
        this.physicsSystem.updateObject(element.physicsObjectId, {
          position: element.position
        });
      }
    }
    
    // Process element interactions
    if (this.config.enableElementInteraction) {
      this.processElementInteractions(deltaTime);
    }
    
    // Apply group field if configured
    if (this.config.groupField) {
      this.applyGroupField(deltaTime);
    }
    
    // Apply transforms to elements
    this.applyTransforms();
    
    // Check if any elements are still active
    const anyActive = Array.from(this.elements.values()).some(el => el.transform.active);
    
    // Continue animation loop
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.update);
    }
  };
  
  /**
   * Process interactions between elements
   */
  private processElementInteractions(deltaTime: number): void {
    const elements = Array.from(this.elements.values());
    
    // Skip if fewer than 2 elements
    if (elements.length < 2) return;
    
    for (let i = 0; i < elements.length; i++) {
      const elementA = elements[i];
      
      // Skip static elements for force application (they still affect others)
      if (elementA.isStatic) continue;
      
      for (let j = i + 1; j < elements.length; j++) {
        const elementB = elements[j];
        
        // Apply interaction filter if provided
        if (this.config.interactionFilter && 
            !this.config.interactionFilter(elementA, elementB)) {
          continue;
        }
        
        // Calculate distance between elements
        const dx = elementB.position.x - elementA.position.x;
        const dy = elementB.position.y - elementA.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);
        
        // Skip if outside interaction radius
        const interactionRadius = this.config.interactionRadius || 200;
        if (distance > interactionRadius) continue;
        
        // Calculate normalized direction vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate base force magnitude based on distance
        const normalizedDistance = distance / interactionRadius;
        const forceMagnitude = (1 - normalizedDistance) * this.config.interactionStrength!;
        
        // Determine if attraction or repulsion
        let forceMultiplier = 0;
        
        if (this.config.enableAttraction && 
            ((elementA.isAttractor && !elementB.isRepeller) || 
             (elementB.isAttractor && !elementA.isRepeller))) {
          // Attraction
          forceMultiplier = -forceMagnitude;
        } else if (this.config.enableRepulsion && 
                  ((elementA.isRepeller && !elementB.isAttractor) || 
                   (elementB.isRepeller && !elementA.isAttractor))) {
          // Repulsion
          forceMultiplier = forceMagnitude;
        } else if (this.config.enableCollisionAvoidance && 
                   distance < this.config.minElementDistance!) {
          // Collision avoidance - repel when too close
          const avoidanceFactor = 1 - (distance / this.config.minElementDistance!);
          forceMultiplier = avoidanceFactor * forceMagnitude * 2; // Stronger repulsion
        }
        
        // Skip if no force
        if (forceMultiplier === 0) continue;
        
        // Calculate base force
        let force = {
          x: nx * forceMultiplier * elementA.strength * elementB.strength,
          y: ny * forceMultiplier * elementA.strength * elementB.strength
        };
        
        // Apply force modifier if provided
        if (this.config.forceModifier) {
          force = this.config.forceModifier(force, elementA, elementB);
        }
        
        // Apply force to both elements in opposite directions
        if (!elementA.isStatic) {
          this.applyForce(elementA.id, { x: force.x, y: force.y });
        }
        
        if (!elementB.isStatic) {
          this.applyForce(elementB.id, { x: -force.x, y: -force.y });
        }
      }
    }
  }
  
  /**
   * Apply group field to all elements
   */
  private applyGroupField(deltaTime: number): void {
    if (!this.config.groupField) return;
    
    const elements = Array.from(this.elements.values());
    
    // Find a leader element if any
    const leader = elements.find(el => el.role === 'leader');
    
    // Calculate center of mass if no leader
    let centerX = 0;
    let centerY = 0;
    
    if (!leader) {
      let totalMass = 0;
      
      for (const element of elements) {
        centerX += element.position.x * element.mass;
        centerY += element.position.y * element.mass;
        totalMass += element.mass;
      }
      
      if (totalMass > 0) {
        centerX /= totalMass;
        centerY /= totalMass;
      }
    } else {
      centerX = leader.position.x;
      centerY = leader.position.y;
    }
    
    // Apply group field forces to each element
    for (const element of elements) {
      // Skip leader or static elements
      if (element.role === 'leader' || element.isStatic) continue;
      
      // Calculate distance from center or leader
      const dx = element.position.x - centerX;
      const dy = element.position.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Skip if at the center
      if (distance < 0.001) continue;
      
      // Create pointer data for directional field
      const pointerData = {
        position: { x: dx / distance, y: dy / distance },
        distance,
        normalizedDistance: distance / (this.config.interactionRadius || 200),
        angle: Math.atan2(dy, dx),
        elapsedTime: Date.now()
      };
      
      // Calculate directional force
      const result = calculateDirectionalForce(this.config.groupField, pointerData);
      
      // Apply the force
      const forceMagnitude = result.magnitude * element.strength;
      const forceX = result.force.x * forceMagnitude;
      const forceY = result.force.y * forceMagnitude;
      
      this.applyForce(element.id, { x: forceX, y: forceY });
    }
  }
  
  /**
   * Apply all transforms to elements
   */
  private applyTransforms(): void {
    for (const element of this.elements.values()) {
      // Skip if element is static or has no physics object
      if (!this.config.usePhysicsSystem || !element.physicsObjectId) continue;
      
      // Get current physics object state
      const physicsObject = this.physicsSystem.getObject(element.physicsObjectId);
      
      if (!physicsObject) continue;
      
      // Get transform from physics state
      const targetX = physicsObject.position.x - element.position.x;
      const targetY = physicsObject.position.y - element.position.y;
      
      // Calculate transform
      const transform: MagneticTransform = {
        x: targetX,
        y: targetY,
        rotation: Math.atan2(physicsObject.velocity.y, physicsObject.velocity.x) * (180 / Math.PI),
        scale: 1,
        active: Math.abs(targetX) > 0.1 || Math.abs(targetY) > 0.1,
        force: Math.min(1, Math.sqrt(targetX * targetX + targetY * targetY) / 50)
      };
      
      // Apply scale based on velocity
      const velocityMagnitude = Math.sqrt(
        physicsObject.velocity.x * physicsObject.velocity.x + 
        physicsObject.velocity.y * physicsObject.velocity.y
      );
      
      transform.scale = 1 + Math.min(0.2, velocityMagnitude * 0.02);
      
      // Set element transform state
      element.transform = transform;
      element.isActive = transform.active;
      
      // Apply the transform to the DOM element
      element.applyTransform(transform);
    }
  }
  
  /**
   * Start the magnetic system
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastUpdateTime = 0;
    this.animationFrameId = requestAnimationFrame(this.update);
    
    // Start physics system if using it
    if (this.config.usePhysicsSystem && !this.physicsSystem.getIsRunning()) {
      this.physicsSystem.start();
    }
  }
  
  /**
   * Stop the magnetic system
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Don't stop the physics system as other components might be using it
  }
  
  /**
   * Add an event listener
   */
  public addEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.add(callback);
    } else {
      this.eventListeners.set(event, new Set([callback]));
    }
  }
  
  /**
   * Remove an event listener
   */
  public removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.delete(callback);
    }
  }
  
  /**
   * Dispatch an event to all listeners
   */
  private dispatchEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in magnetic system event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Update system configuration
   */
  public updateConfig(config: Partial<MagneticSystemConfig>): void {
    this.config = { ...this.config, ...config };
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
    // Stop the system
    this.stop();
    
    // Remove mouse move listener
    document.removeEventListener('mousemove', this.handleMouseMove);
    
    // Remove collision listener from physics system
    if (this.config.usePhysicsSystem) {
      this.physicsSystem.removeEventListener('collision', this.handlePhysicsCollision);
    }
    
    // Remove all elements
    for (const id of Array.from(this.elements.keys())) {
      this.unregisterElement(id);
    }
    
    // Clear event listeners
    this.eventListeners.clear();
  }
}

/**
 * Create a magnetic system with the specified configuration
 * @param config System configuration
 * @returns A new magnetic system manager
 */
export function createMagneticSystem(config: MagneticSystemConfig = {}): MagneticSystemManager {
  return new MagneticSystemManager(config);
}

/**
 * Global registry of magnetic systems for cross-component access
 */
const magneticSystems: Map<string, MagneticSystemManager> = new Map();

/**
 * Get or create a magnetic system with the specified ID
 * @param id System ID
 * @param config System configuration (only used if system doesn't exist)
 * @returns The magnetic system manager
 */
export function getMagneticSystem(id: string, config: MagneticSystemConfig = {}): MagneticSystemManager {
  let system = magneticSystems.get(id);
  
  if (!system) {
    system = new MagneticSystemManager({ id, ...config });
    magneticSystems.set(id, system);
  }
  
  return system;
}

export default MagneticSystemManager;