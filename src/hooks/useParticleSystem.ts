import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
// Correctly import and export types
import type { 
    ParticleSystemOptions, 
    ParticleSystemResult, 
    ParticleSystemControls, 
    ParticleSystemState,
    ParticlePresetCollection,
    Vector2D,
    // Import internal types needed for resolving logic
    EmitterOptions, ParticleProperties, ParticlePhysics, ParticleRendering, ParticlePreset 
} from '../types/particles';
// Export types for consumers of the hook
export type { 
    ParticleSystemOptions, 
    ParticleSystemResult, 
    ParticleSystemControls, 
    ParticleSystemState,
    ParticlePresetCollection,
    Vector2D
}; 

import { ParticleEngine } from '../animations/particles/particleEngine';
import { CanvasParticleRenderer } from '../animations/particles/renderers/canvasRenderer';
// import { WebGLParticleRenderer } from '../animations/particles/renderers/webglRenderer'; // Import later
// import { useGlassPerformance } from './useGlassPerformance'; // Removed usage
import { useReducedMotion } from './useReducedMotion';
import { useAnimationContext } from '../contexts/AnimationContext'; // Import animation context
import { QualityTier } from '../types/accessibility'; // Import QualityTier

// Presets import 
import { particlePresets as DEFAULT_PRESETS } from '../animations/particles/presets';

// Duplicate DEFAULT options from engine for resolving within hook effect
const DEFAULT_EMITTER: Required<EmitterOptions> = { position: { x: 0.5, y: 0.5 }, shape: 'point', size: 0, emissionRate: 10, maxParticles: 500, burst: { count: 0, time: 0, spread: 0 } };
const DEFAULT_PARTICLE: Required<ParticleProperties> = { lifespan: { min: 1, max: 3 }, initialVelocity: { x: [-50, 50], y: [-50, 50] }, initialRotation: [0, 360], initialScale: [0.5, 1.5], sizeOverLife: [1, 0], colorOverLife: [['#ffffff'], ['#000000']], opacityOverLife: [1, 0], rotationSpeed: [-90, 90] };
const DEFAULT_PHYSICS: Required<ParticlePhysics> = { gravity: { x: 0, y: 0 }, friction: 0.05, wind: { x: 0, y: 0 }, attractors: [], repulsors: [], maxVelocity: 1000, bounce: 0.5, bounds: { behavior: 'bounce' } };
const DEFAULT_RENDERING: Required<ParticleRendering> = { particleImage: '', blendMode: 'source-over', renderer: 'canvas', zIndex: 0, imageColorTint: '#ffffff' };
const DEFAULT_SYSTEM_OPTIONS = { autoStart: true, preset: undefined };

/**
 * useParticleSystem Hook
 *
 * Manages a particle system within a specified container element.
 */
export const useParticleSystem = (
  options: ParticleSystemOptions = { preset: 'default' }, 
  presets: ParticlePresetCollection = DEFAULT_PRESETS
): ParticleSystemResult => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const rendererRef = useRef<CanvasParticleRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [state, setState] = useState<ParticleSystemState>({
    isActive: false,
    particleCount: 0,
  });

  // Performance and accessibility hooks
  const prefersReducedMotion = useReducedMotion();
  const { activeQualityTier } = useAnimationContext(); // Get quality tier from context

  // Initialize engine and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // --- Resolve Options Explicitly Here --- 
    let baseEmitter = { ...DEFAULT_EMITTER };
    let baseParticle = { ...DEFAULT_PARTICLE };
    let basePhysics = { ...DEFAULT_PHYSICS };
    let baseRendering = { ...DEFAULT_RENDERING };
    let baseSystem = { ...DEFAULT_SYSTEM_OPTIONS };

    let finalUserOptions: Exclude<ParticleSystemOptions, string> | {} = {};
    let presetName: string | undefined = undefined;
    let currentPreset: ParticlePreset | undefined = undefined;

    if (typeof options === 'string' && presets[options]) {
      presetName = options;
      currentPreset = presets[options];
    } else if (typeof options === 'object' && options !== null && options.preset && presets[options.preset]) {
        presetName = options.preset;
        currentPreset = presets[options.preset];
        finalUserOptions = options; 
    } else if (typeof options === 'object' && options !== null) {
        finalUserOptions = options; 
    }

    if (currentPreset) {
        if(currentPreset.emitter) baseEmitter = { ...baseEmitter, ...currentPreset.emitter };
        if(currentPreset.particle) baseParticle = { ...baseParticle, ...currentPreset.particle };
        if(currentPreset.physics) basePhysics = { ...basePhysics, ...currentPreset.physics };
        if(currentPreset.rendering) baseRendering = { ...baseRendering, ...currentPreset.rendering };
    }
    
    const userOptionsObj = finalUserOptions as Exclude<ParticleSystemOptions, string>;
    const mergedEmitter = { ...baseEmitter, ...userOptionsObj?.emitter };
    const mergedParticle = { ...baseParticle, ...userOptionsObj?.particle };
    const mergedPhysics = { ...basePhysics, ...userOptionsObj?.physics };
    const mergedRendering = { ...baseRendering, ...userOptionsObj?.rendering };
    // Apply reduced motion preference during resolution
    const mergedAutoStart = (userOptionsObj?.autoStart ?? baseSystem.autoStart) && !prefersReducedMotion;

    // Apply top-level shortcuts
    if (userOptionsObj?.position !== undefined) mergedEmitter.position = userOptionsObj.position;
    if (userOptionsObj?.shape !== undefined) mergedEmitter.shape = userOptionsObj.shape;
    if (userOptionsObj?.size !== undefined) mergedEmitter.size = userOptionsObj.size;
    if (userOptionsObj?.emissionRate !== undefined) mergedEmitter.emissionRate = userOptionsObj.emissionRate;
    if (userOptionsObj?.burst !== undefined) mergedEmitter.burst = userOptionsObj.burst;
    if (userOptionsObj?.maxParticles !== undefined) mergedEmitter.maxParticles = userOptionsObj.maxParticles;

    // Construct the fully resolved options object to pass to the engine constructor
    const resolvedInitialOptions = {
        emitter: { ...DEFAULT_EMITTER, ...mergedEmitter }, // Ensure defaults applied
        particle: { ...DEFAULT_PARTICLE, ...mergedParticle },
        physics: { ...DEFAULT_PHYSICS, ...mergedPhysics },
        rendering: { ...DEFAULT_RENDERING, ...mergedRendering },
        autoStart: mergedAutoStart,
        preset: presetName, 
    };

    // --- Create Engine --- 
    // Now pass the fully resolved object but remove the third parameter
    const engine = new ParticleEngine(resolvedInitialOptions, presets);
    engineRef.current = engine;
    // Get options directly from engine (using getter)
    const resolvedOptsFromEngine = engine.getResolvedOptions(); 

    // --- Create Canvas --- 
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; 
    canvas.style.zIndex = String(resolvedOptsFromEngine.rendering.zIndex || 0); 
    containerRef.current.style.position = containerRef.current.style.position || 'relative'; 
    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;

    // Create renderer with full required rendering options
    const renderer = new CanvasParticleRenderer(canvas, DEFAULT_RENDERING);
    rendererRef.current = renderer;

    // Resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
        engineRef.current?.setContainerSize(width, height);
      }
    });
    if (containerRef.current) { // Check ref before observing
        resizeObserver.observe(containerRef.current);
    }

    // Initial size sync
    const initialRect = containerRef.current.getBoundingClientRect();
    if (canvasRef.current) {
        canvasRef.current.width = initialRect.width;
        canvasRef.current.height = initialRect.height;
    }
    engineRef.current?.setContainerSize(initialRect.width, initialRect.height);

    // Start animation loop
    if (engineRef.current?.isEngineRunning()) {
        setState(prev => ({ ...prev, isActive: true }));
        const animate = () => {
            if (!engineRef.current || !rendererRef.current || !engineRef.current.isEngineRunning()) { 
                 animationFrameRef.current = null; // Stop if engine stopped
                 setState(prev => ({ ...prev, isActive: false }));
                 return;
             }
            engineRef.current.update(); 
            const particles = engineRef.current.getParticles();
            rendererRef.current.render(particles);
            // Update state only if count changes to avoid excessive re-renders
            const currentCount = engineRef.current.getParticleCount();
            setState(prev => prev.particleCount !== currentCount ? { ...prev, particleCount: currentCount } : prev);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null; // Ensure ref is cleared
      }
      if(containerRef.current) { // Check ref before disconnecting
          resizeObserver.unobserve(containerRef.current);
      }
      engineRef.current?.stop(); // Stop engine simulation
      if (containerRef.current && canvasRef.current) {
        try {
            containerRef.current.removeChild(canvasRef.current);
        } catch (e) { /* Ignore error if already removed */ }
      }
      canvasRef.current = null;
      rendererRef.current = null;
      engineRef.current = null;
      setState({ isActive: false, particleCount: 0 });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, activeQualityTier]); 

  // --- Controls --- 
  const start = useCallback(() => {
    if (engineRef.current && !engineRef.current.isEngineRunning()) {
      engineRef.current.start();
      setState(prev => ({ ...prev, isActive: true }));
      // Restart animation loop ONLY if it's not already scheduled
      if (!animationFrameRef.current) {
        const animate = () => {
            if (!engineRef.current || !rendererRef.current || !engineRef.current.isEngineRunning()) {
                animationFrameRef.current = null;
                // Update state only if it's actually changing
                setState(prev => prev.isActive ? { ...prev, isActive: false } : prev);
                return;
            }
            engineRef.current.update();
            const particles = engineRef.current.getParticles();
            rendererRef.current.render(particles);
            const currentCount = engineRef.current.getParticleCount();
            setState(prev => prev.particleCount !== currentCount ? { ...prev, particleCount: currentCount } : prev);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setState(prev => ({ ...prev, isActive: false, particleCount: 0 }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setState(prev => ({ ...prev, isActive: false }));
    // Animation loop should stop itself when engineRef.current.isEngineRunning() becomes false
  }, []);

  const updateOptions = useCallback((newOptions: Partial<Exclude<ParticleSystemOptions, string>>) => {
    if (engineRef.current) {
        // Remove the second parameter
        engineRef.current.setOptions(newOptions); 
        const resolvedOpts = engineRef.current.getResolvedOptions(); // Use getter
        // Use DEFAULT_RENDERING as a base to satisfy Required<ParticleRendering>
        const fullRenderingOptions = {
          ...DEFAULT_RENDERING,
          ...resolvedOpts.rendering
        };
        rendererRef.current?.updateOptions(fullRenderingOptions);
        // Update canvas zIndex if changed
        if (canvasRef.current && resolvedOpts.rendering.zIndex !== undefined) {
            canvasRef.current.style.zIndex = String(resolvedOpts.rendering.zIndex);
        }
    }
  }, []);

  const emitParticles = useCallback((count: number, position?: Vector2D | 'center' | 'random') => {
    engineRef.current?.emitBurst(count, position);
    // Update particle count immediately for responsiveness
    setState(prev => ({ ...prev, particleCount: engineRef.current?.getParticleCount() ?? 0 }));
  }, []);

  const clearParticles = useCallback(() => {
      engineRef.current?.clear();
      setState(prev => ({ ...prev, particleCount: 0 }));
  }, []);

  // Combine controls and state for the result
  const controls: ParticleSystemControls = useMemo(() => ({
    start,
    stop,
    pause,
    updateOptions,
    emitParticles,
    clearParticles,
  }), [start, stop, pause, updateOptions, emitParticles, clearParticles]);

  return {
    containerRef,
    ...state,
    ...controls,
  };
}; 