/**
 * Optimized Physics Calculations
 * 
 * High-performance utility functions for physics-based animations.
 */

/**
 * Vector2D type for 2D vector operations
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Spring parameters for spring simulations
 */
export interface SpringParams {
  /** Mass of the object */
  mass: number;
  
  /** Spring stiffness */
  stiffness: number;
  
  /** Damping coefficient */
  damping: number;
}

/**
 * Particle state for particle simulations
 */
export interface ParticleState {
  /** Position vector */
  position: Vector2D;
  
  /** Velocity vector */
  velocity: Vector2D;
  
  /** Acceleration vector */
  acceleration: Vector2D;
  
  /** Mass of the particle */
  mass: number;
  
  /** Rotation angle in radians */
  rotation: number;
  
  /** Angular velocity in radians/sec */
  angularVelocity: number;
  
  /** Scale factor */
  scale: number;
  
  /** Lifetime in seconds */
  lifetime: number;
  
  /** Current age in seconds */
  age: number;
}

/**
 * Create a new Vector2D
 * @param x X component
 * @param y Y component
 * @returns Vector2D object
 */
export const createVector = (x: number = 0, y: number = 0): Vector2D => {
  return { x, y };
};

/**
 * Add two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Resulting vector
 */
export const addVectors = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  };
};

/**
 * Subtract vector v2 from v1
 * @param v1 First vector
 * @param v2 Second vector to subtract
 * @returns Resulting vector
 */
export const subtractVectors = (v1: Vector2D, v2: Vector2D): Vector2D => {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  };
};

/**
 * Multiply vector by scalar
 * @param v Vector to scale
 * @param scalar Scalar value
 * @returns Scaled vector
 */
export const multiplyVector = (v: Vector2D, scalar: number): Vector2D => {
  return {
    x: v.x * scalar,
    y: v.y * scalar
  };
};

/**
 * Calculate vector magnitude (length)
 * @param v Vector
 * @returns Vector magnitude
 */
export const vectorMagnitude = (v: Vector2D): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

/**
 * Normalize vector (scale to unit length)
 * @param v Vector to normalize
 * @returns Normalized vector
 */
export const normalizeVector = (v: Vector2D): Vector2D => {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  
  return {
    x: v.x / mag,
    y: v.y / mag
  };
};

/**
 * Limit vector magnitude to maximum value
 * @param v Vector to limit
 * @param max Maximum magnitude
 * @returns Limited vector
 */
export const limitVector = (v: Vector2D, max: number): Vector2D => {
  const mag = vectorMagnitude(v);
  
  if (mag <= max) return { ...v };
  
  const normalized = normalizeVector(v);
  return multiplyVector(normalized, max);
};

/**
 * Calculate vector dot product
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Dot product value
 */
export const dotProduct = (v1: Vector2D, v2: Vector2D): number => {
  return v1.x * v2.x + v1.y * v2.y;
};

/**
 * Calculate distance between two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Distance
 */
export const vectorDistance = (v1: Vector2D, v2: Vector2D): number => {
  const dx = v2.x - v1.x;
  const dy = v2.y - v1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate spring force using Hooke's law
 * @param position Current position
 * @param target Rest position
 * @param springParams Spring parameters
 * @returns Force vector
 */
export const calculateSpringForce = (
  position: Vector2D,
  target: Vector2D,
  springParams: SpringParams
): Vector2D => {
  // Calculate displacement vector
  const displacement = subtractVectors(target, position);
  
  // Calculate spring force (F = k * x) where k is stiffness and x is displacement
  const springForce = multiplyVector(displacement, springParams.stiffness);
  
  return springForce;
};

/**
 * Calculate damping force to reduce oscillations
 * @param velocity Current velocity
 * @param damping Damping coefficient
 * @returns Damping force vector
 */
export const calculateDampingForce = (
  velocity: Vector2D,
  damping: number
): Vector2D => {
  // Damping force (F = -c * v) where c is damping coefficient and v is velocity
  return multiplyVector(velocity, -damping);
};

/**
 * Update particle state for one time step
 * @param state Current particle state
 * @param forces Forces acting on the particle
 * @param dt Time step in seconds
 * @returns Updated particle state
 */
export const updateParticle = (
  state: ParticleState,
  forces: Vector2D,
  dt: number
): ParticleState => {
  // Calculate acceleration (F = m * a, so a = F / m)
  const acceleration = multiplyVector(forces, 1 / state.mass);
  
  // Update velocity (v = v0 + a * dt)
  const newVelocity = addVectors(state.velocity, multiplyVector(acceleration, dt));
  
  // Update position (p = p0 + v * dt)
  const newPosition = addVectors(state.position, multiplyVector(newVelocity, dt));
  
  // Update rotation (r = r0 + ω * dt)
  const newRotation = state.rotation + state.angularVelocity * dt;
  
  // Update age
  const newAge = state.age + dt;
  
  return {
    ...state,
    position: newPosition,
    velocity: newVelocity,
    acceleration,
    rotation: newRotation,
    age: newAge
  };
};

/**
 * Calculate gravity force
 * @param mass Mass of the object
 * @param gravity Gravity constant (default: 9.8 m/s²)
 * @returns Gravity force vector
 */
export const calculateGravity = (
  mass: number,
  gravity: number = 9.8
): Vector2D => {
  return { x: 0, y: mass * gravity };
};

/**
 * Calculate friction force
 * @param velocity Velocity vector
 * @param coefficient Friction coefficient (0-1)
 * @returns Friction force vector
 */
export const calculateFriction = (
  velocity: Vector2D,
  coefficient: number
): Vector2D => {
  // Friction should be in opposite direction of velocity
  const direction = normalizeVector(velocity);
  const magnitude = vectorMagnitude(velocity) * coefficient;
  
  return {
    x: -direction.x * magnitude,
    y: -direction.y * magnitude
  };
};

/**
 * Calculate magnetic attraction force
 * @param position Position of the object
 * @param center Position of the magnet
 * @param strength Strength of the magnetic field
 * @param falloff Distance falloff factor
 * @returns Magnetic force vector
 */
export const calculateMagneticForce = (
  position: Vector2D,
  center: Vector2D,
  strength: number,
  falloff: number = 2
): Vector2D => {
  // Calculate direction to center
  const direction = subtractVectors(center, position);
  const distance = vectorMagnitude(direction);
  
  // Avoid division by zero
  if (distance === 0) return { x: 0, y: 0 };
  
  // Magnetic force decreases with distance squared (inverse square law)
  const forceMagnitude = strength / Math.pow(distance, falloff);
  const normalized = normalizeVector(direction);
  
  return multiplyVector(normalized, forceMagnitude);
};

/**
 * Detect collision between two circular objects
 * @param p1 Position of first object
 * @param r1 Radius of first object
 * @param p2 Position of second object
 * @param r2 Radius of second object
 * @returns Whether objects are colliding
 */
export const detectCollision = (
  p1: Vector2D,
  r1: number,
  p2: Vector2D,
  r2: number
): boolean => {
  const distance = vectorDistance(p1, p2);
  return distance < (r1 + r2);
};

/**
 * Resolve collision with elastic response
 * @param p1 Position of first object
 * @param v1 Velocity of first object
 * @param m1 Mass of first object
 * @param p2 Position of second object
 * @param v2 Velocity of second object
 * @param m2 Mass of second object
 * @param restitution Coefficient of restitution (0-1)
 * @returns New velocities after collision
 */
export const resolveCollision = (
  p1: Vector2D,
  v1: Vector2D,
  m1: number,
  p2: Vector2D,
  v2: Vector2D,
  m2: number,
  restitution: number = 0.8
): { v1: Vector2D; v2: Vector2D } => {
  // Calculate collision normal
  const normal = normalizeVector(subtractVectors(p2, p1));
  
  // Calculate relative velocity
  const relativeVelocity = subtractVectors(v2, v1);
  
  // Calculate velocity along normal
  const velocityAlongNormal = dotProduct(relativeVelocity, normal);
  
  // No collision if objects are moving away from each other
  if (velocityAlongNormal > 0) {
    return { v1, v2 };
  }
  
  // Calculate impulse scalar
  const impulseScalar = -(1 + restitution) * velocityAlongNormal;
  const impulseScalar2 = impulseScalar / (1/m1 + 1/m2);
  
  // Apply impulse
  const impulse = multiplyVector(normal, impulseScalar2);
  
  // Calculate new velocities
  const newV1 = subtractVectors(v1, multiplyVector(impulse, 1/m1));
  const newV2 = addVectors(v2, multiplyVector(impulse, 1/m2));
  
  return { v1: newV1, v2: newV2 };
};

/**
 * Calculate spring parameters for desired motion
 * @param mass Mass of the object
 * @param settlingTime Time to settle (in seconds)
 * @param overshoot Allowed overshoot (0-1)
 * @returns Spring parameters
 */
export const designSpring = (
  mass: number = 1,
  settlingTime: number = 1,
  overshoot: number = 0.02
): SpringParams => {
  // Calculate damping ratio based on allowed overshoot
  const dampingRatio = -Math.log(overshoot) / Math.sqrt(Math.PI * Math.PI + Math.log(overshoot) * Math.log(overshoot));
  
  // Calculate natural frequency based on settling time
  const naturalFrequency = 4 / (settlingTime * dampingRatio);
  
  // Calculate spring stiffness
  const stiffness = Math.pow(naturalFrequency, 2) * mass;
  
  // Calculate damping coefficient
  const damping = 2 * dampingRatio * Math.sqrt(mass * stiffness);
  
  return { mass, stiffness, damping };
};

/**
 * Calculate angular oscillation around a point
 * @param center Center of oscillation
 * @param radius Radius of oscillation
 * @param frequency Oscillation frequency
 * @param phase Phase offset
 * @param time Current time
 * @returns Position vector
 */
export const oscillateAround = (
  center: Vector2D,
  radius: number,
  frequency: number,
  phase: number,
  time: number
): Vector2D => {
  const angle = time * frequency * Math.PI * 2 + phase;
  
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
};

/**
 * Generate a noise value for organic motion
 * @param x X component
 * @param y Y component
 * @param t Time component
 * @returns Noise value (-1 to 1)
 */
export const noise = (x: number, y: number, t: number): number => {
  // Simplified Perlin-like noise function
  const p = (x + y * 57 + t * 131) * 15731;
  return (((Math.sin(p) * 43758.5453) % 1) * 2 - 1);
};

/**
 * Apply noise to a vector for organic motion
 * @param v Base vector
 * @param amplitude Noise amplitude
 * @param time Current time
 * @returns Vector with applied noise
 */
export const applyNoise = (
  v: Vector2D,
  amplitude: number,
  time: number
): Vector2D => {
  return {
    x: v.x + noise(v.x, v.y, time) * amplitude,
    y: v.y + noise(v.y, v.x, time + 100) * amplitude
  };
};