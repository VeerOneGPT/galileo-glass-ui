/**
 * TrajectoryUtils.ts
 * 
 * Utility functions for calculating and rendering trajectories and projectile motion.
 * This provides accurate physics-based trajectory predictions for UI elements.
 */

import { Vector, VectorUtils } from './galileoPhysicsSystem';

/**
 * Types of trajectory paths
 */
export enum TrajectoryType {
  /** Standard parabolic projectile motion */
  PROJECTILE = 'projectile',
  
  /** Bezier curve path */
  BEZIER = 'bezier',
  
  /** Spiral path */
  SPIRAL = 'spiral',
  
  /** Sine wave path */
  SINE_WAVE = 'sine-wave',
  
  /** Custom path function */
  CUSTOM = 'custom'
}

/**
 * Trajectory simulation options
 */
export interface TrajectoryOptions {
  /** Starting position */
  startPosition: Vector;
  
  /** Initial velocity */
  initialVelocity: Vector;
  
  /** Gravity vector */
  gravity?: Vector;
  
  /** Air resistance coefficient */
  airResistance?: number;
  
  /** Wind force vector */
  wind?: Vector;
  
  /** Maximum trajectory time (seconds) */
  maxTime?: number;
  
  /** Time step for simulation (seconds) */
  timeStep?: number;
  
  /** Number of points to sample */
  numPoints?: number;
  
  /** Whether to stop at ground level (y = 0) */
  stopAtGround?: boolean;
  
  /** Whether to bounce at boundaries */
  bounce?: boolean;
  
  /** Boundaries for the trajectory */
  boundaries?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  
  /** Restitution (bounciness) coefficient (0-1) */
  restitution?: number;
}

/**
 * Bezier curve trajectory options
 */
export interface BezierTrajectoryOptions {
  /** Starting position */
  startPosition: Vector;
  
  /** End position */
  endPosition: Vector;
  
  /** Control points for the curve */
  controlPoints: Vector[];
  
  /** Number of points to sample */
  numPoints?: number;
}

/**
 * Spiral trajectory options
 */
export interface SpiralTrajectoryOptions {
  /** Center of the spiral */
  center: Vector;
  
  /** Starting radius */
  startRadius: number;
  
  /** End radius (grows or shrinks) */
  endRadius?: number;
  
  /** Angular speed (radians per second) */
  angularSpeed: number;
  
  /** Radial speed (growth rate) */
  radialSpeed?: number;
  
  /** Starting angle (radians) */
  startAngle?: number;
  
  /** Number of turns */
  turns?: number;
  
  /** Number of points to sample */
  numPoints?: number;
}

/**
 * Sine wave trajectory options
 */
export interface SineWaveTrajectoryOptions {
  /** Starting position */
  startPosition: Vector;
  
  /** Direction vector */
  direction: Vector;
  
  /** Distance to travel */
  distance: number;
  
  /** Amplitude of the wave */
  amplitude: number;
  
  /** Frequency of the wave (cycles per unit distance) */
  frequency: number;
  
  /** Phase offset (radians) */
  phase?: number;
  
  /** Number of points to sample */
  numPoints?: number;
}

/**
 * Custom trajectory function
 */
export type TrajectoryFunction = (t: number) => Vector;

/**
 * Custom trajectory options
 */
export interface CustomTrajectoryOptions {
  /** Custom function that returns position for a given time t (0-1) */
  trajectoryFn: TrajectoryFunction;
  
  /** Number of points to sample */
  numPoints?: number;
}

/**
 * Trajectory point with position, velocity and time
 */
export interface TrajectoryPoint {
  /** Position vector */
  position: Vector;
  
  /** Velocity vector */
  velocity: Vector;
  
  /** Time at this point */
  time: number;
}

/**
 * Trajectory result containing points and metadata
 */
export interface TrajectoryResult {
  /** Array of trajectory points */
  points: TrajectoryPoint[];
  
  /** Total distance of the trajectory */
  distance: number;
  
  /** Maximum height of the trajectory */
  maxHeight: number;
  
  /** Total time of the trajectory */
  totalTime: number;
  
  /** Whether the trajectory hit a boundary */
  hitBoundary: boolean;
  
  /** Boundary that was hit (if any) */
  boundaryHit?: 'left' | 'right' | 'top' | 'bottom';
  
  /** Time when boundary was hit */
  hitTime?: number;
  
  /** Whether the trajectory is still in motion at the end */
  inMotion: boolean;
  
  /** SVG path for the trajectory */
  svgPath: string;
  
  /** Trajectory type */
  type: TrajectoryType;
}

/**
 * Calculate projectile motion trajectory
 * 
 * @param options Trajectory calculation options
 * @returns Trajectory points and metadata
 */
export function calculateProjectileTrajectory(options: TrajectoryOptions): TrajectoryResult {
  const {
    startPosition,
    initialVelocity,
    gravity = { x: 0, y: 9.8, z: 0 },
    airResistance = 0,
    wind = { x: 0, y: 0, z: 0 },
    maxTime = 10,
    timeStep = 0.05,
    numPoints = 100,
    stopAtGround = false,
    bounce = false,
    boundaries,
    restitution = 0.7
  } = options;
  
  // Calculate time step based on numPoints if provided
  const dt = numPoints ? maxTime / numPoints : timeStep;
  
  // Initialize trajectory points
  const points: TrajectoryPoint[] = [];
  
  // Initial conditions
  let position: Vector = { ...startPosition };
  let velocity: Vector = { ...initialVelocity };
  let time = 0;
  let hitBoundary = false;
  let boundaryHit: 'left' | 'right' | 'top' | 'bottom' | undefined = undefined;
  let hitTime = 0;
  let maxHeight = startPosition.y;
  let totalDistance = 0;
  let lastPosition: Vector | null = null;
  let inMotion = true;
  
  // Add initial point
  points.push({
    position: { ...position },
    velocity: { ...velocity },
    time
  });
  
  // Simulate trajectory
  while (time < maxTime && points.length < 1000) { // Safety limit of 1000 points
    // Store last position for distance calculation
    lastPosition = { ...position };
    
    // Calculate air resistance force (proportional to velocity squared)
    const velocityMagnitude = VectorUtils.magnitude(velocity);
    const dragForce = airResistance > 0 ? 
      VectorUtils.multiply(
        VectorUtils.normalize(velocity),
        -airResistance * velocityMagnitude * velocityMagnitude
      ) : 
      { x: 0, y: 0, z: 0 };
    
    // Calculate total acceleration
    const acceleration = {
      x: gravity.x + dragForce.x + wind.x,
      y: gravity.y + dragForce.y + wind.y,
      z: gravity.z + dragForce.z + wind.z
    };
    
    // Update velocity using acceleration
    velocity = {
      x: velocity.x + acceleration.x * dt,
      y: velocity.y + acceleration.y * dt,
      z: velocity.z + acceleration.z * dt
    };
    
    // Check if nearly stopped
    if (VectorUtils.magnitude(velocity) < 0.1) {
      inMotion = false;
      break;
    }
    
    // Calculate next position
    const nextPosition = {
      x: position.x + velocity.x * dt,
      y: position.y + velocity.y * dt,
      z: position.z + velocity.z * dt
    };
    
    // Check for ground collision
    if (stopAtGround && nextPosition.y <= 0) {
      // Interpolate to find exact ground hit position
      const t = -position.y / (nextPosition.y - position.y);
      const groundHitPosition = {
        x: position.x + (nextPosition.x - position.x) * t,
        y: 0,
        z: position.z + (nextPosition.z - position.z) * t
      };
      
      // Add the ground hit point
      points.push({
        position: groundHitPosition,
        velocity: { ...velocity },
        time: time + dt * t
      });
      
      hitBoundary = true;
      boundaryHit = 'bottom';
      hitTime = time + dt * t;
      
      // If bouncing, reflect velocity and continue
      if (bounce) {
        velocity.y = -velocity.y * restitution;
        position = { ...groundHitPosition };
        position.y += 0.01; // Tiny offset to prevent stuck
      } else {
        break;
      }
    } 
    // Check for boundary collisions if specified
    else if (boundaries) {
      let hitBoundaryThisStep = false;
      let interpolationFactor = 1.0;
      let reflectedVelocity = { ...velocity };
      
      // Check left boundary
      if (boundaries.left !== undefined && nextPosition.x < boundaries.left && velocity.x < 0) {
        const t = (boundaries.left - position.x) / (nextPosition.x - position.x);
        if (t < interpolationFactor) {
          interpolationFactor = t;
          hitBoundaryThisStep = true;
          boundaryHit = 'left';
          reflectedVelocity = { 
            x: -velocity.x * restitution, 
            y: velocity.y, 
            z: velocity.z 
          };
        }
      }
      
      // Check right boundary
      if (boundaries.right !== undefined && nextPosition.x > boundaries.right && velocity.x > 0) {
        const t = (boundaries.right - position.x) / (nextPosition.x - position.x);
        if (t < interpolationFactor) {
          interpolationFactor = t;
          hitBoundaryThisStep = true;
          boundaryHit = 'right';
          reflectedVelocity = { 
            x: -velocity.x * restitution, 
            y: velocity.y, 
            z: velocity.z 
          };
        }
      }
      
      // Check top boundary
      if (boundaries.top !== undefined && nextPosition.y < boundaries.top && velocity.y < 0) {
        const t = (boundaries.top - position.y) / (nextPosition.y - position.y);
        if (t < interpolationFactor) {
          interpolationFactor = t;
          hitBoundaryThisStep = true;
          boundaryHit = 'top';
          reflectedVelocity = { 
            x: velocity.x, 
            y: -velocity.y * restitution, 
            z: velocity.z 
          };
        }
      }
      
      // Check bottom boundary
      if (boundaries.bottom !== undefined && nextPosition.y > boundaries.bottom && velocity.y > 0) {
        const t = (boundaries.bottom - position.y) / (nextPosition.y - position.y);
        if (t < interpolationFactor) {
          interpolationFactor = t;
          hitBoundaryThisStep = true;
          boundaryHit = 'bottom';
          reflectedVelocity = { 
            x: velocity.x, 
            y: -velocity.y * restitution, 
            z: velocity.z 
          };
        }
      }
      
      // Handle boundary collision
      if (hitBoundaryThisStep) {
        // Interpolate to find exact hit position
        const hitPosition = {
          x: position.x + (nextPosition.x - position.x) * interpolationFactor,
          y: position.y + (nextPosition.y - position.y) * interpolationFactor,
          z: position.z + (nextPosition.z - position.z) * interpolationFactor
        };
        
        // Add hit point
        points.push({
          position: hitPosition,
          velocity: { ...velocity },
          time: time + dt * interpolationFactor
        });
        
        hitBoundary = true;
        hitTime = time + dt * interpolationFactor;
        
        // If bouncing, reflect velocity and continue
        if (bounce) {
          velocity = reflectedVelocity;
          position = { ...hitPosition };
          
          // Add tiny offset to prevent stuck
          if (boundaryHit === 'left') position.x += 0.01;
          if (boundaryHit === 'right') position.x -= 0.01;
          if (boundaryHit === 'top') position.y += 0.01;
          if (boundaryHit === 'bottom') position.y -= 0.01;
        } else {
          break;
        }
      } else {
        // No collision, just update position normally
        position = nextPosition;
      }
    } else {
      // No boundaries, just update position
      position = nextPosition;
    }
    
    // Update maximum height
    if (position.y > maxHeight) {
      maxHeight = position.y;
    }
    
    // Calculate segment distance if we have a last position
    if (lastPosition) {
      totalDistance += VectorUtils.distance(lastPosition, position);
    }
    
    // Advance time
    time += dt;
    
    // Add point to trajectory
    points.push({
      position: { ...position },
      velocity: { ...velocity },
      time
    });
  }
  
  // Generate SVG path
  const svgPath = generateSvgPath(points.map(p => p.position));
  
  // Return trajectory data
  return {
    points,
    distance: totalDistance,
    maxHeight,
    totalTime: time,
    hitBoundary,
    boundaryHit,
    hitTime: hitBoundary ? hitTime : undefined,
    inMotion,
    svgPath,
    type: TrajectoryType.PROJECTILE
  };
}

/**
 * Calculate a Bezier curve trajectory
 * 
 * @param options Bezier curve options
 * @returns Trajectory points and metadata
 */
export function calculateBezierTrajectory(options: BezierTrajectoryOptions): TrajectoryResult {
  const {
    startPosition,
    endPosition,
    controlPoints,
    numPoints = 100
  } = options;
  
  if (controlPoints.length === 0) {
    throw new Error('At least one control point is required for a bezier curve');
  }
  
  // Points on the curve
  const points: TrajectoryPoint[] = [];
  const timeStep = 1 / numPoints;
  let totalDistance = 0;
  let maxHeight = startPosition.y;
  let lastPosition: Vector | null = null;
  
  // Function to calculate position on a bezier curve at time t (0-1)
  const bezierPoint = (t: number): Vector => {
    // For quadratic bezier curve (one control point)
    if (controlPoints.length === 1) {
      const p0 = startPosition;
      const p1 = controlPoints[0];
      const p2 = endPosition;
      
      const mt = 1 - t;
      return {
        x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
        y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
        z: mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z
      };
    }
    // For cubic bezier curve (two control points)
    else if (controlPoints.length === 2) {
      const p0 = startPosition;
      const p1 = controlPoints[0];
      const p2 = controlPoints[1];
      const p3 = endPosition;
      
      const mt = 1 - t;
      return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
        z: mt * mt * mt * p0.z + 3 * mt * mt * t * p1.z + 3 * mt * t * t * p2.z + t * t * t * p3.z
      };
    }
    // For higher order bezier curves (de Casteljau's algorithm)
    else {
      // Combine all points including start and end
      const points = [startPosition, ...controlPoints, endPosition];
      
      // Apply de Casteljau's algorithm recursively
      const deCasteljau = (points: Vector[], t: number): Vector => {
        if (points.length === 1) {
          return points[0];
        }
        
        const newPoints: Vector[] = [];
        for (let i = 0; i < points.length - 1; i++) {
          newPoints.push({
            x: (1 - t) * points[i].x + t * points[i + 1].x,
            y: (1 - t) * points[i].y + t * points[i + 1].y,
            z: (1 - t) * points[i].z + t * points[i + 1].z
          });
        }
        
        return deCasteljau(newPoints, t);
      };
      
      return deCasteljau(points, t);
    }
  };
  
  // Function to calculate derivative at time t (for velocity)
  const bezierDerivative = (t: number): Vector => {
    // For quadratic bezier curve (one control point)
    if (controlPoints.length === 1) {
      const p0 = startPosition;
      const p1 = controlPoints[0];
      const p2 = endPosition;
      
      return {
        x: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
        y: 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
        z: 2 * (1 - t) * (p1.z - p0.z) + 2 * t * (p2.z - p1.z)
      };
    }
    // For cubic bezier curve (two control points)
    else if (controlPoints.length === 2) {
      const p0 = startPosition;
      const p1 = controlPoints[0];
      const p2 = controlPoints[1];
      const p3 = endPosition;
      
      const mt = 1 - t;
      return {
        x: 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
        y: 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
        z: 3 * mt * mt * (p1.z - p0.z) + 6 * mt * t * (p2.z - p1.z) + 3 * t * t * (p3.z - p2.z)
      };
    }
    // For higher order bezier curves, we use a numerical approximation
    else {
      const epsilon = 0.0001;
      const p1 = bezierPoint(t);
      const p2 = bezierPoint(t + epsilon);
      
      return {
        x: (p2.x - p1.x) / epsilon,
        y: (p2.y - p1.y) / epsilon,
        z: (p2.z - p1.z) / epsilon
      };
    }
  };
  
  // Generate points along the curve
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const position = bezierPoint(t);
    const velocity = bezierDerivative(t);
    
    // Add to trajectory points
    points.push({
      position,
      velocity,
      time: t
    });
    
    // Update maximum height
    if (position.y > maxHeight) {
      maxHeight = position.y;
    }
    
    // Calculate segment distance
    if (lastPosition) {
      totalDistance += VectorUtils.distance(lastPosition, position);
    }
    
    lastPosition = { ...position };
  }
  
  // Generate SVG path
  const svgPath = generateSvgPath(points.map(p => p.position));
  
  // Return trajectory data
  return {
    points,
    distance: totalDistance,
    maxHeight,
    totalTime: 1, // Normalized time for bezier
    hitBoundary: false,
    inMotion: false, // Bezier completes its path
    svgPath,
    type: TrajectoryType.BEZIER
  };
}

/**
 * Calculate a spiral trajectory
 * 
 * @param options Spiral trajectory options
 * @returns Trajectory points and metadata
 */
export function calculateSpiralTrajectory(options: SpiralTrajectoryOptions): TrajectoryResult {
  const {
    center,
    startRadius,
    endRadius = startRadius, // Default to constant radius if not specified
    angularSpeed,
    radialSpeed = 0, // Default to 0 (constant radius) if not specified
    startAngle = 0,
    turns = 2, // Default to 2 complete turns
    numPoints = 100
  } = options;
  
  const points: TrajectoryPoint[] = [];
  const totalAngle = startAngle + turns * 2 * Math.PI;
  const angleStep = (totalAngle - startAngle) / numPoints;
  let totalDistance = 0;
  let maxHeight = center.y - startRadius; // Initial guess
  let lastPosition: Vector | null = null;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const angle = startAngle + t * (totalAngle - startAngle);
    
    // Calculate radius at this point (linear interpolation between start and end radius)
    const radius = startRadius + t * (endRadius - startRadius);
    
    // Calculate position using polar coordinates
    const position = {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      z: center.z
    };
    
    // Calculate tangential velocity (perpendicular to radius)
    const tangentialSpeed = angularSpeed * radius;
    // Calculate radial velocity (along radius)
    const radialVelocity = radialSpeed;
    
    // Combine tangential and radial velocities
    const velocity = {
      x: -tangentialSpeed * Math.sin(angle) + radialVelocity * Math.cos(angle),
      y: tangentialSpeed * Math.cos(angle) + radialVelocity * Math.sin(angle),
      z: 0
    };
    
    // Add to trajectory points
    points.push({
      position,
      velocity,
      time: t
    });
    
    // Update maximum height
    if (position.y > maxHeight) {
      maxHeight = position.y;
    }
    
    // Calculate segment distance
    if (lastPosition) {
      totalDistance += VectorUtils.distance(lastPosition, position);
    }
    
    lastPosition = { ...position };
  }
  
  // Generate SVG path
  const svgPath = generateSvgPath(points.map(p => p.position));
  
  // Return trajectory data
  return {
    points,
    distance: totalDistance,
    maxHeight,
    totalTime: 1, // Normalized time for spiral
    hitBoundary: false,
    inMotion: true, // Spiral could continue indefinitely
    svgPath,
    type: TrajectoryType.SPIRAL
  };
}

/**
 * Calculate a sine wave trajectory
 * 
 * @param options Sine wave trajectory options
 * @returns Trajectory points and metadata
 */
export function calculateSineWaveTrajectory(options: SineWaveTrajectoryOptions): TrajectoryResult {
  const {
    startPosition,
    direction,
    distance,
    amplitude,
    frequency,
    phase = 0,
    numPoints = 100
  } = options;
  
  // Normalize direction vector
  const normalizedDirection = VectorUtils.normalize(direction);
  
  // Get perpendicular vector (for wave oscillation)
  const perpendicular = {
    x: -normalizedDirection.y,
    y: normalizedDirection.x,
    z: 0
  };
  
  const points: TrajectoryPoint[] = [];
  let totalDistance = 0;
  let maxHeight = startPosition.y;
  let lastPosition: Vector | null = null;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const linearDistance = t * distance;
    
    // Calculate sine wave offset
    const waveOffset = amplitude * Math.sin(2 * Math.PI * frequency * linearDistance + phase);
    
    // Calculate position along the wave
    const position = {
      x: startPosition.x + normalizedDirection.x * linearDistance + perpendicular.x * waveOffset,
      y: startPosition.y + normalizedDirection.y * linearDistance + perpendicular.y * waveOffset,
      z: startPosition.z
    };
    
    // Calculate velocity (tangent to the curve)
    const waveDerivative = amplitude * 2 * Math.PI * frequency * Math.cos(2 * Math.PI * frequency * linearDistance + phase);
    const velocityMagnitude = Math.sqrt(1 + waveDerivative * waveDerivative);
    
    const velocity = {
      x: (normalizedDirection.x + perpendicular.x * waveDerivative) / velocityMagnitude,
      y: (normalizedDirection.y + perpendicular.y * waveDerivative) / velocityMagnitude,
      z: 0
    };
    
    // Add to trajectory points
    points.push({
      position,
      velocity,
      time: t
    });
    
    // Update maximum height
    if (position.y > maxHeight) {
      maxHeight = position.y;
    }
    
    // Calculate segment distance
    if (lastPosition) {
      totalDistance += VectorUtils.distance(lastPosition, position);
    }
    
    lastPosition = { ...position };
  }
  
  // Generate SVG path
  const svgPath = generateSvgPath(points.map(p => p.position));
  
  // Return trajectory data
  return {
    points,
    distance: totalDistance,
    maxHeight,
    totalTime: 1, // Normalized time
    hitBoundary: false,
    inMotion: false, // Completes its path
    svgPath,
    type: TrajectoryType.SINE_WAVE
  };
}

/**
 * Calculate a custom trajectory using a provided function
 * 
 * @param options Custom trajectory options with function
 * @returns Trajectory points and metadata
 */
export function calculateCustomTrajectory(options: CustomTrajectoryOptions): TrajectoryResult {
  const {
    trajectoryFn,
    numPoints = 100
  } = options;
  
  const points: TrajectoryPoint[] = [];
  let totalDistance = 0;
  let maxHeight = -Infinity;
  let lastPosition: Vector | null = null;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const position = trajectoryFn(t);
    
    // Approximate velocity using finite differences
    const epsilon = 0.0001;
    const nextT = Math.min(1, t + epsilon);
    const nextPosition = trajectoryFn(nextT);
    
    const velocity = {
      x: (nextPosition.x - position.x) / epsilon,
      y: (nextPosition.y - position.y) / epsilon,
      z: (nextPosition.z - position.z) / epsilon
    };
    
    // Add to trajectory points
    points.push({
      position,
      velocity,
      time: t
    });
    
    // Update maximum height
    if (position.y > maxHeight) {
      maxHeight = position.y;
    }
    
    // Calculate segment distance
    if (lastPosition) {
      totalDistance += VectorUtils.distance(lastPosition, position);
    }
    
    lastPosition = { ...position };
  }
  
  // Generate SVG path
  const svgPath = generateSvgPath(points.map(p => p.position));
  
  // Return trajectory data
  return {
    points,
    distance: totalDistance,
    maxHeight,
    totalTime: 1, // Normalized time
    hitBoundary: false,
    inMotion: false, // Custom function completes
    svgPath,
    type: TrajectoryType.CUSTOM
  };
}

/**
 * Generate SVG path string from a series of points
 * 
 * @param points Array of position vectors
 * @returns SVG path string
 */
export function generateSvgPath(points: Vector[]): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x},${points[i].y}`;
  }
  
  return path;
}

/**
 * Calculate launch angle and velocity for projectile to hit target
 * 
 * @param start Starting position
 * @param target Target position
 * @param gravity Gravity vector
 * @param speed Initial speed (magnitude of velocity)
 * @returns Object with angle (radians) and velocity vector, or null if unreachable
 */
export function calculateLaunchParameters(
  start: Vector,
  target: Vector,
  gravity: Vector = { x: 0, y: 9.8, z: 0 },
  speed: number
): { angle: number, velocity: Vector } | null {
  // Calculate horizontal and vertical distance
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  
  // Calculate gravity magnitude in the relevant direction
  // (Usually just the y component for standard gravity)
  const g = gravity.y;
  
  // If gravity is 0, it's a simple straight line
  if (g === 0) {
    const angle = Math.atan2(dy, dx);
    return {
      angle,
      velocity: {
        x: speed * Math.cos(angle),
        y: speed * Math.sin(angle),
        z: 0
      }
    };
  }
  
  // Calculate the discriminant for the quadratic formula
  const speedSquared = speed * speed;
  const discriminant = speedSquared * speedSquared - g * (g * dx * dx + 2 * dy * speedSquared);
  
  // If discriminant is negative, target is unreachable with given speed
  if (discriminant < 0) {
    return null;
  }
  
  // There are two possible angles (low angle and high angle)
  // We'll calculate both and return the lower angle as it's usually preferred
  const term1 = speedSquared;
  const term2 = Math.sqrt(discriminant);
  
  // Lower angle solution
  const tanTheta1 = (term1 - term2) / (g * dx);
  const angle1 = Math.atan(tanTheta1);
  
  // Higher angle solution
  const tanTheta2 = (term1 + term2) / (g * dx);
  const angle2 = Math.atan(tanTheta2);
  
  // Determine which angle to use (avoid negative angles when shooting left)
  let angle: number;
  
  if (dx < 0) {
    // If target is to the left, we need to adjust the angles
    if (tanTheta1 < 0) angle = angle1 + Math.PI;
    else angle = angle2 + Math.PI;
  } else {
    // For targets to the right, use the lower angle if possible
    angle = angle1 > 0 ? angle1 : angle2;
  }
  
  // Calculate the velocity vector
  return {
    angle,
    velocity: {
      x: speed * Math.cos(angle),
      y: speed * Math.sin(angle),
      z: 0
    }
  };
}

/**
 * Create a path string for rendering a trajectory as CSS clip-path
 * 
 * @param points Array of trajectory points
 * @param width Width of the container
 * @param height Height of the container
 * @param thickness Thickness of the path in pixels
 * @returns CSS polygon string for clip-path
 */
export function createTrajectoryClipPath(
  points: Vector[],
  width: number,
  height: number,
  thickness: number = 2
): string {
  if (points.length < 2) return '';
  
  // Create a polygon that follows the trajectory with the specified thickness
  const halfThickness = thickness / 2;
  
  // Start with an empty array of polygon points
  const polygonPoints: string[] = [];
  
  // Add points for the top of the trajectory
  for (let i = 0; i < points.length; i++) {
    // Calculate normal vector (perpendicular to trajectory direction)
    let normal: Vector;
    
    if (i === 0) {
      // For the first point, use the direction to the next point
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      normal = { x: -dy / length, y: dx / length, z: 0 };
    } else if (i === points.length - 1) {
      // For the last point, use the direction from the previous point
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      normal = { x: -dy / length, y: dx / length, z: 0 };
    } else {
      // For middle points, average the normals of the two segments
      const dx1 = points[i].x - points[i - 1].x;
      const dy1 = points[i].y - points[i - 1].y;
      const length1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      
      const dx2 = points[i + 1].x - points[i].x;
      const dy2 = points[i + 1].y - points[i].y;
      const length2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      const nx1 = -dy1 / length1;
      const ny1 = dx1 / length1;
      
      const nx2 = -dy2 / length2;
      const ny2 = dx2 / length2;
      
      const nx = (nx1 + nx2) / 2;
      const ny = (ny1 + ny2) / 2;
      
      const length = Math.sqrt(nx * nx + ny * ny);
      normal = { x: nx / length, y: ny / length, z: 0 };
    }
    
    // Add point along the top edge
    polygonPoints.push(
      `${points[i].x + normal.x * halfThickness}px ${points[i].y + normal.y * halfThickness}px`
    );
  }
  
  // Add points for the bottom of the trajectory (in reverse order)
  for (let i = points.length - 1; i >= 0; i--) {
    // Calculate normal vector (same as above but in reverse)
    let normal: Vector;
    
    if (i === points.length - 1) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      normal = { x: -dy / length, y: dx / length, z: 0 };
    } else if (i === 0) {
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      normal = { x: -dy / length, y: dx / length, z: 0 };
    } else {
      const dx1 = points[i].x - points[i - 1].x;
      const dy1 = points[i].y - points[i - 1].y;
      const length1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      
      const dx2 = points[i + 1].x - points[i].x;
      const dy2 = points[i + 1].y - points[i].y;
      const length2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      const nx1 = -dy1 / length1;
      const ny1 = dx1 / length1;
      
      const nx2 = -dy2 / length2;
      const ny2 = dx2 / length2;
      
      const nx = (nx1 + nx2) / 2;
      const ny = (ny1 + ny2) / 2;
      
      const length = Math.sqrt(nx * nx + ny * ny);
      normal = { x: nx / length, y: ny / length, z: 0 };
    }
    
    // Add point along the bottom edge (negative normal)
    polygonPoints.push(
      `${points[i].x - normal.x * halfThickness}px ${points[i].y - normal.y * halfThickness}px`
    );
  }
  
  // Join all points into a polygon
  return `polygon(${polygonPoints.join(', ')})`;
}

/**
 * Utility function to render a SVG preview of a trajectory
 * 
 * @param trajectory Trajectory result to render
 * @param width Width of the SVG
 * @param height Height of the SVG
 * @param options Additional rendering options
 * @returns SVG element as a string
 */
export function renderTrajectorySVG(
  trajectory: TrajectoryResult,
  width: number,
  height: number,
  options: {
    strokeColor?: string;
    strokeWidth?: number;
    showPoints?: boolean;
    pointRadius?: number;
    pointColor?: string;
    showVelocity?: boolean;
    velocityScale?: number;
    velocityColor?: string;
    backgroundColor?: string;
  } = {}
): string {
  const {
    strokeColor = '#3a86ff',
    strokeWidth = 2,
    showPoints = false,
    pointRadius = 3,
    pointColor = '#ff006e',
    showVelocity = false,
    velocityScale = 10,
    velocityColor = '#8338ec',
    backgroundColor = 'transparent'
  } = options;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background if specified
  if (backgroundColor !== 'transparent') {
    svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`;
  }
  
  // Draw the trajectory path
  svg += `<path d="${trajectory.svgPath}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  
  // Draw points if requested
  if (showPoints) {
    for (const point of trajectory.points) {
      svg += `<circle cx="${point.position.x}" cy="${point.position.y}" r="${pointRadius}" fill="${pointColor}" />`;
    }
  }
  
  // Draw velocity vectors if requested
  if (showVelocity) {
    for (const point of trajectory.points) {
      // Skip points with very low velocity
      if (VectorUtils.magnitude(point.velocity) < 0.1) continue;
      
      const endX = point.position.x + point.velocity.x * velocityScale;
      const endY = point.position.y + point.velocity.y * velocityScale;
      
      svg += `<line x1="${point.position.x}" y1="${point.position.y}" x2="${endX}" y2="${endY}" stroke="${velocityColor}" stroke-width="1" />`;
      
      // Add a small arrowhead
      const angle = Math.atan2(point.velocity.y, point.velocity.x);
      const arrowSize = 5;
      
      const arrowPoint1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
      const arrowPoint1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
      
      const arrowPoint2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
      const arrowPoint2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);
      
      svg += `<polygon points="${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}" fill="${velocityColor}" />`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

export default {
  calculateProjectileTrajectory,
  calculateBezierTrajectory,
  calculateSpiralTrajectory,
  calculateSineWaveTrajectory,
  calculateCustomTrajectory,
  calculateLaunchParameters,
  generateSvgPath,
  createTrajectoryClipPath,
  renderTrajectorySVG,
  TrajectoryType
};