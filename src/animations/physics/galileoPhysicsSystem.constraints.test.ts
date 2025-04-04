import { GalileoPhysicsSystem, PhysicsObjectConfig, Vector } from './galileoPhysicsSystem';
import { DistanceConstraintOptions, HingeConstraintOptions, SpringConstraintOptions } from './engineTypes';

// Helper function to create a basic system
const createTestSystem = (config = {}) => new GalileoPhysicsSystem({ fixedTimeStep: 1/60, ...config });

// Helper function to add a body
const addBody = (system: GalileoPhysicsSystem, options: PhysicsObjectConfig): string => {
    return system.addObject(options);
};

// Helper function to get body position
const getPos = (system: GalileoPhysicsSystem, id: string): Vector | null => {
    const obj = system.getObject(id);
    return obj ? { ...obj.position } : null;
};

// Helper to step the simulation multiple times
const stepSimulation = (system: GalileoPhysicsSystem, steps: number) => {
    for (let i = 0; i < steps; i++) {
        system.step();
    }
};

// Helper to calculate distance between two vectors (simple 2D for tests)
const vecDist = (v1: Vector, v2: Vector): number => {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx*dx + dy*dy);
};

// Helper function for 2D vector rotation (implement within test scope)
const rotateVector = (v: Vector, angle: number): Vector => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
};

describe('GalileoPhysicsSystem - Constraints', () => {

    describe('DistanceConstraint', () => {
        let system: GalileoPhysicsSystem;

        beforeEach(() => {
            system = createTestSystem({ gravity: { x: 0, y: 0 } }); // Disable gravity for isolated tests
        });

        test('should add and remove a distance constraint', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 } });
            const idB = addBody(system, { position: { x: 10, y: 0 } });
            const constraintOptions: DistanceConstraintOptions = { type: 'distance', bodyAId: idA, bodyBId: idB, distance: 5 };
            const constraintId = system.addConstraint(constraintOptions);
            expect(constraintId).toBeTruthy();
            expect((system as any).constraints.size).toBe(1);
            const removed = system.removeConstraint(constraintId!);
            expect(removed).toBe(true);
            expect((system as any).constraints.size).toBe(0);
        });

        test('should maintain target distance between two dynamic bodies', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 } });
            const idB = addBody(system, { position: { x: 10, y: 0 } });
            const targetDist = 5;
            system.addConstraint({ type: 'distance', bodyAId: idA, bodyBId: idB, distance: targetDist });

            stepSimulation(system, 100); // Allow time for constraints to resolve

            const posA = getPos(system, idA)!;
            const posB = getPos(system, idB)!;
            const currentDist = vecDist(posA, posB);
            expect(currentDist).toBeCloseTo(targetDist, 1); // Check if close to target distance (allow tolerance)
        });

        test('should maintain target distance with one static body', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 }, isStatic: true });
            const idB = addBody(system, { position: { x: 10, y: 0 } });
            const targetDist = 6;
            system.addConstraint({ type: 'distance', bodyAId: idA, bodyBId: idB, distance: targetDist });

            stepSimulation(system, 100);

            const posA = getPos(system, idA)!;
            const posB = getPos(system, idB)!;
            const currentDist = vecDist(posA, posB);
            expect(posA.x).toBe(0); // Static body should not move
            expect(posA.y).toBe(0);
            expect(currentDist).toBeCloseTo(targetDist, 1);
        });

        test('should respect stiffness (softer constraint)', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 } });
            const idB = addBody(system, { position: { x: 10, y: 0 } });
            const targetDist = 5;
            system.addConstraint({ type: 'distance', bodyAId: idA, bodyBId: idB, distance: targetDist, stiffness: 0.1 });

            // Step fewer times - soft constraint shouldn't fully resolve yet
            stepSimulation(system, 10);

            const posA = getPos(system, idA)!;
            const posB = getPos(system, idB)!;
            const currentDist = vecDist(posA, posB);
            // Expect distance to be closer to initial (10) than target (5)
            expect(currentDist).toBeGreaterThan(targetDist);
            expect(currentDist).toBeLessThan(10);
        });
    });

    describe('SpringConstraint', () => {
        let system: GalileoPhysicsSystem;

        beforeEach(() => {
            system = createTestSystem({ gravity: { x: 0, y: 0 } });
        });

        test('should converge to restLength', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 } });
            const idB = addBody(system, { position: { x: 10, y: 0 } });
            const restLen = 7;
            system.addConstraint({ type: 'spring', bodyAId: idA, bodyBId: idB, restLength: restLen, stiffness: 0.5, damping: 0.1 });

            stepSimulation(system, 200);

            const posA = getPos(system, idA)!;
            const posB = getPos(system, idB)!;
            const currentDist = vecDist(posA, posB);
            expect(currentDist).toBeCloseTo(restLen, 1);
        });

        test('should show damping effect (less oscillation)', () => {
            // System 1: With Damping
            const systemDamped = createTestSystem({ gravity: { x: 0, y: 0 } });
            const idAD = addBody(systemDamped, { position: { x: 0, y: 0 } });
            const idBD = addBody(systemDamped, { position: { x: 10, y: 0 } });
            const restLen = 5;
            systemDamped.addConstraint({ type: 'spring', bodyAId: idAD, bodyBId: idBD, restLength: restLen, stiffness: 0.2, damping: 0.1 });

            // System 2: Without Damping
            const systemUndamped = createTestSystem({ gravity: { x: 0, y: 0 } });
            const idAU = addBody(systemUndamped, { position: { x: 0, y: 0 } });
            const idBU = addBody(systemUndamped, { position: { x: 10, y: 0 } });
            systemUndamped.addConstraint({ type: 'spring', bodyAId: idAU, bodyBId: idBU, restLength: restLen, stiffness: 0.2, damping: 0.0 });

            // Track distances over time
            const distancesDamped: number[] = [];
            const distancesUndamped: number[] = [];
            const steps = 150;

            for(let i=0; i<steps; i++) {
                systemDamped.step();
                systemUndamped.step();
                if (i > steps - 50) { // Sample last 50 steps
                    distancesDamped.push(vecDist(getPos(systemDamped, idAD)!, getPos(systemDamped, idBD)!));
                    distancesUndamped.push(vecDist(getPos(systemUndamped, idAU)!, getPos(systemUndamped, idBU)!));
                }
            }

            // Calculate variance or range for the last N steps
            const variance = (arr: number[]) => {
                const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
                return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
            };

            const varianceDamped = variance(distancesDamped);
            const varianceUndamped = variance(distancesUndamped);

            console.log(`Damped Variance: ${varianceDamped}, Undamped Variance: ${varianceUndamped}`);
            // Expect damped system to have significantly less variance (less oscillation)
            expect(varianceDamped).toBeLessThan(varianceUndamped * 0.5); // Damped variance should be much smaller
            expect(distancesDamped[distancesDamped.length - 1]).toBeCloseTo(restLen, 1); // Should settle near rest length
        });

    });

    describe('HingeConstraint (Positional)', () => {
        let system: GalileoPhysicsSystem;

        beforeEach(() => {
            system = createTestSystem({ gravity: { x: 0, y: 0 } });
        });

        test('should keep world anchor points coincident', () => {
            const idA = addBody(system, { position: { x: -1, y: 0 } });
            const idB = addBody(system, { position: { x: 1, y: 0 } });
            // Hinge point should be at (0,0)
            // Attach body A at its (+1, 0) local point
            // Attach body B at its (-1, 0) local point
            const options: HingeConstraintOptions = {
                type: 'hinge',
                bodyAId: idA,
                bodyBId: idB,
                pointA: { x: 1, y: 0 }, // Local to A
                pointB: { x: -1, y: 0 } // Local to B
            };
            system.addConstraint(options);

            stepSimulation(system, 100);

            const bodyA = system.getObject(idA)!;
            const bodyB = system.getObject(idB)!;

            // Calculate world anchor points after simulation using the helper
            const rotatedLocalA = rotateVector(options.pointA!, bodyA.angle);
            const rotatedLocalB = rotateVector(options.pointB!, bodyB.angle);
            const worldAnchorA = { x: bodyA.position.x + rotatedLocalA.x, y: bodyA.position.y + rotatedLocalA.y };
            const worldAnchorB = { x: bodyB.position.x + rotatedLocalB.x, y: bodyB.position.y + rotatedLocalB.y };

            // Check if world anchor points are very close (use smaller tolerance)
            expect(worldAnchorA.x).toBeCloseTo(worldAnchorB.x, 0.1);
            expect(worldAnchorA.y).toBeCloseTo(worldAnchorB.y, 0.1);

            // Bodies themselves would have moved slightly apart/together to satisfy constraint
             expect(bodyA.position.x).not.toBeCloseTo(-1); // Moved slightly
             expect(bodyB.position.x).not.toBeCloseTo(1); // Moved slightly
        });

         test('should work with one static body', () => {
            const idA = addBody(system, { position: { x: 0, y: 0 }, isStatic: true });
            const idB = addBody(system, { position: { x: 5, y: 5 } }); // Start B somewhere else
            // Hinge at (0,0) on static body A, and (-2, -2) local on body B
            const options: HingeConstraintOptions = {
                type: 'hinge',
                bodyAId: idA,
                bodyBId: idB,
                pointA: { x: 0, y: 0 }, // Local to A (world 0,0)
                pointB: { x: -2, y: -2 } // Local to B
            };
            system.addConstraint(options);

            stepSimulation(system, 100);

            const bodyA = system.getObject(idA)!;
            const bodyB = system.getObject(idB)!;

            // Use helper function
            const rotatedLocalB = rotateVector(options.pointB!, bodyB.angle);
            const worldAnchorB = { x: bodyB.position.x + rotatedLocalB.x, y: bodyB.position.y + rotatedLocalB.y };

            // Static body A should not move
            expect(bodyA.position.x).toBe(0);
            expect(bodyA.position.y).toBe(0);

            // Anchor point B should be at (0,0) in world space (use smaller tolerance)
            expect(worldAnchorB.x).toBeCloseTo(0, 0.1);
            expect(worldAnchorB.y).toBeCloseTo(0, 0.1);

            // Body B's center should be at roughly (2,2) if angle is 0
            // Calculation depends on final angle, but it should have moved significantly
            // Keep larger tolerance here as the exact final position depends on dynamics
             expect(bodyB.position.x).toBeCloseTo(2, 1); // Approximate check
             expect(bodyB.position.y).toBeCloseTo(2, 1); // Approximate check
        });
    });
}); 