import { GalileoPhysicsSystem } from './galileoPhysicsSystem';
import { PhysicsBodyOptions, DistanceConstraintOptions, HingeConstraintOptions, SpringConstraintOptions } from './engineTypes';
// Keep trying updated path for VectorUtils
// import { VectorUtils } from '../utils/vectorUtils'; // Commented out again

// Define helpers locally for now
const addTestBody = (engine: GalileoPhysicsSystem, options: Partial<PhysicsBodyOptions>): string => {
    const defaultOptions: PhysicsBodyOptions = {
        id: `test-${Math.random().toString(36).substring(7)}`,
        // Use a simplified shape definition that might pass type checking
        shape: { type: 'circle', radius: 10 }, // Keep original for now, may need adjustment
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        mass: 1,
        ...options as any, // Keep allowing overrides
    };
    // Cast the options to any to bypass stricter type checking on addObject if needed
    return engine.addObject(defaultOptions as any); 
};

const stepEngine = (engineInstance: GalileoPhysicsSystem, steps = 1, dt = 1 / 60) => {
    for (let i = 0; i < steps; i++) {
        (engineInstance as any).update(dt);
    }
};

describe('GalileoPhysicsSystem - Constraints', () => {
    let engine: GalileoPhysicsSystem;
  
    beforeEach(() => {
      engine = new GalileoPhysicsSystem();
    });

    describe('DistanceConstraint', () => {
      test('should maintain distance between two bodies', () => {
        const bodyAId = addTestBody(engine, { position: { x: 0, y: 0 } });
        const bodyBId = addTestBody(engine, { position: { x: 50, y: 0 } }); // Start closer than restLength

        // ... rest of test using VectorUtils, addTestBody, stepEngine ...
      });

      // ... other DistanceConstraint tests ...
    });

    describe('HingeConstraint', () => {
        test('should keep anchor points coincident', () => {
          const bodyAId = addTestBody(engine, { position: { x: 0, y: 0 } });
          const bodyBId = addTestBody(engine, { position: { x: 50, y: 0 } });

         // ... rest of test using VectorUtils, addTestBody, stepEngine ...
        });

        // ... other HingeConstraint tests ...
    });

    describe('SpringConstraint', () => {
        test('should oscillate around restLength', () => {
          const bodyAId = addTestBody(engine, { position: { x: 0, y: 0 } });
          const bodyBId = addTestBody(engine, { position: { x: 150, y: 0 } }); // Start further than restLength
          
          // ... rest of test using VectorUtils, addTestBody, stepEngine ...
        });

        // ... other SpringConstraint tests ...
    });
});