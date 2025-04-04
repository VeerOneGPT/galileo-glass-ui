import React, { useEffect, useRef } from 'react';
import { GalileoPhysicsEngineAPI, PhysicsConstraintOptions } from '../animations/physics/engineTypes';

/**
 * Custom React Hook to declaratively manage a physics constraint within the Galileo Physics Engine.
 * Handles adding the constraint when the component mounts or options change, and removing it on unmount.
 *
 * @param engine - The physics engine API instance obtained from `useGalileoPhysicsEngine`.
 * @param options - The configuration options for the physics constraint.
 */
export function usePhysicsConstraint(
    engine: GalileoPhysicsEngineAPI | null | undefined,
    options: PhysicsConstraintOptions | null | undefined
): void {
    const constraintIdRef = useRef<string | null>(null);

    // Use key properties from options as dependencies for the effect.
    // Stringify complex properties like local attachment points if they need to trigger updates.
    // This avoids unnecessary re-runs if the options object reference changes but content is the same.
    const optionsKeyDeps = [
        options?.type,
        options?.bodyAId,
        options?.bodyBId,
        (options?.type === 'distance' ? options.distance : undefined),
        (options?.type === 'spring' ? options.restLength : undefined),
        // Add other critical options properties as needed
        // JSON.stringify(options?.pointA), // Example for complex prop
        // JSON.stringify(options?.pointB),
    ];

    useEffect(() => {
        // Ensure engine and valid options are provided
        if (!engine || !options || !options.bodyAId || !options.bodyBId) {
            // If we previously had a constraint, remove it
            if (constraintIdRef.current) {
                console.log(`[usePhysicsConstraint] Removing constraint ${constraintIdRef.current} due to missing engine or options.`);
                engine?.removeConstraint(constraintIdRef.current);
                constraintIdRef.current = null;
            }
            return;
        }

        // --- Add the constraint ---
        console.log(`[usePhysicsConstraint] Attempting to add constraint type '${options.type}' between ${options.bodyAId} and ${options.bodyBId}`);
        const newConstraintId = engine.addConstraint(options);

        if (newConstraintId) {
            console.log(`[usePhysicsConstraint] Successfully added constraint ${newConstraintId}`);
            constraintIdRef.current = newConstraintId;
        } else {
            console.error(`[usePhysicsConstraint] Failed to add constraint:`, options);
            // Ensure ref is cleared if addition fails
            constraintIdRef.current = null;
        }

        // --- Cleanup Function --- 
        return () => {
            if (constraintIdRef.current) {
                console.log(`[usePhysicsConstraint] Cleaning up constraint ${constraintIdRef.current}`);
                engine.removeConstraint(constraintIdRef.current);
                constraintIdRef.current = null;
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, ...optionsKeyDeps]); // Re-run if engine or key options change

    // This hook doesn't return anything, it just manages the side effect.
} 