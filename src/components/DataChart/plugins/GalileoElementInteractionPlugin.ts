// src/components/DataChart/plugins/GalileoElementInteractionPlugin.ts
import { Plugin, Chart, ChartDataset, ChartEvent, InteractionItem } from 'chart.js';
import { Element } from 'chart.js';
// Import the necessary types from ChartProps
import { GetElementPhysicsOptions, ChartVariant } from '../types/ChartProps';

// Export the imported types
export type { GetElementPhysicsOptions, ChartVariant };

// Simple spring physics update function
// dt is delta time in seconds
function updateSpring(current: number, target: number, velocity: number, config: {
  tension: number;
  friction: number;
  mass: number;
  precision: number;
}, dt: number): { position: number; velocity: number } {
  const { tension, friction, mass, precision } = config;
  
  // Avoid division by zero or negative mass
  const effectiveMass = Math.max(0.1, mass);

  const displacement = current - target;
  const springForce = -tension * displacement;
  const dampingForce = -friction * velocity;
  const acceleration = (springForce + dampingForce) / effectiveMass;
  
  const newVelocity = velocity + acceleration * dt;
  const newPosition = current + newVelocity * dt;

  // Check if settled
  const isSettled = Math.abs(newPosition - target) < precision && Math.abs(newVelocity) < precision;
  
  if (isSettled) {
    return { position: target, velocity: 0 };
  }
  
  return { position: newPosition, velocity: newVelocity };
}

// Type for the animation state stored per element
interface ElementAnimState {
  currentScale: number;
  currentOpacity: number;
  currentX: number;
  currentY: number;
  velocityScale: number;
  velocityOpacity: number;
  velocityX: number;
  velocityY: number;
  targetScale: number;
  targetOpacity: number;
  targetX: number;
  targetY: number;
  physicsConfig: { 
      tension: number;
      friction: number;
      mass: number;
      precision: number;
  };
  needsSave?: boolean;
  isAnimating: boolean;
}

// Default physics parameters
const DEFAULT_PLUGIN_PHYSICS = {
    tension: 300,
    friction: 20,
    mass: 1,
    precision: 0.01
};

// Map: Element -> State
const elementAnimationState = new WeakMap<Element, ElementAnimState>();
// Set to track currently hovered elements keys ('datasetIndex_dataIndex')
let currentlyHovered = new Set<string>();

export const GalileoElementInteractionPlugin: Plugin = {
  id: 'galileoElementInteraction',

  afterEvent: (chart: Chart, args: { event: ChartEvent; replay: boolean }, options: any) => {
    // Get options, including chartType AND enabled flag
    const { enabled, getElementPhysicsOptions, chartType } = options as { 
        enabled?: boolean;
        getElementPhysicsOptions?: GetElementPhysicsOptions; 
        chartType?: ChartVariant; 
    };
    const chartEvent = args.event;
    
    // Check enabled flag first
    if (!enabled || !getElementPhysicsOptions || !chartEvent || chartEvent.native == null || !chartType) return;

    const newHovered = new Set<string>();

    if (chartEvent.type === 'mousemove') {
      const items = chart.getElementsAtEventForMode(chartEvent.native, 'nearest', { intersect: true }, true);

      if (items.length > 0) {
        const item = items[0]; 
        const element = item.element as Element;
        
        if (!(element instanceof Element)) return;

        const { datasetIndex, index } = item;
        const targetKey = `${datasetIndex}_${index}`;
        newHovered.add(targetKey);

        const dataset = chart.data.datasets[datasetIndex];
        const dataPoint = dataset.data?.[index];
        // const currentChartType = chart.config.type as ChartVariant; // Remove direct access

        // Use chartType passed via options
        const physicsConfig = getElementPhysicsOptions(dataPoint, datasetIndex, index, chartType);
        const hoverEffect = physicsConfig?.hoverEffect;
        
        let animState = elementAnimationState.get(element);
        if (!animState) { 
            animState = { 
                currentScale: 1, currentOpacity: 1, currentX: 0, currentY: 0,
                velocityScale: 0, velocityOpacity: 0, velocityX: 0, velocityY: 0,
                targetScale: 1, targetOpacity: 1, targetX: 0, targetY: 0,
                physicsConfig: { ...DEFAULT_PLUGIN_PHYSICS }, 
                isAnimating: false
            };
            elementAnimationState.set(element, animState);
        }
        
        animState.physicsConfig.tension = physicsConfig?.tension ?? DEFAULT_PLUGIN_PHYSICS.tension;
        animState.physicsConfig.friction = physicsConfig?.friction ?? DEFAULT_PLUGIN_PHYSICS.friction;
        animState.physicsConfig.mass = physicsConfig?.mass ?? DEFAULT_PLUGIN_PHYSICS.mass;
        
        const newTargetScale = hoverEffect?.scale ?? 1;
        const newTargetOpacity = hoverEffect?.opacity ?? 1;
        const newTargetX = hoverEffect?.x ?? 0;
        const newTargetY = hoverEffect?.y ?? 0;
        
        if (animState.targetScale !== newTargetScale || animState.targetOpacity !== newTargetOpacity ||
            animState.targetX !== newTargetX || animState.targetY !== newTargetY) {
            animState.targetScale = newTargetScale;
            animState.targetOpacity = newTargetOpacity;
            animState.targetX = newTargetX;
            animState.targetY = newTargetY;
            animState.isAnimating = true;
        }
      }
    } 
    
    // Check for elements that are no longer hovered
    currentlyHovered.forEach(key => {
        if (!newHovered.has(key)) {
            const [datasetIndexStr, indexStr] = key.split('_');
            const datasetIndex = parseInt(datasetIndexStr, 10);
            const index = parseInt(indexStr, 10);
            // Access element via getDatasetMeta().data[index]
            const element = chart.getDatasetMeta(datasetIndex)?.data?.[index] as Element | undefined; 
            if (element && element instanceof Element) {
                const animState = elementAnimationState.get(element);
                if (animState && (animState.targetScale !== 1 || animState.targetOpacity !== 1 || animState.targetX !== 0 || animState.targetY !== 0)) {
                    animState.targetScale = 1;
                    animState.targetOpacity = 1;
                    animState.targetX = 0;
                    animState.targetY = 0;
                    animState.isAnimating = true;
                }
            }
        }
    });

    currentlyHovered = newHovered;

    if (chart.isDatasetVisible(0)) {
      chart.draw();
    }
  },

  // Runs once before the entire draw process
  beforeDraw: (chart: Chart, args, options: any) => {
    const { enabled } = options as { enabled?: boolean };
    // Check enabled flag
    if (!enabled) return;

    const now = performance.now();
    let needsRedraw = false;
    const lastUpdate = (chart as any)._galileoLastPluginUpdate ?? now;
    const dt = (now - lastUpdate) / 1000;
    (chart as any)._galileoLastPluginUpdate = now;
    const clampedDt = Math.max(0, Math.min(dt, 1/15)); 

    // Iterate through all visible elements to update animation state
    chart.getSortedVisibleDatasetMetas().forEach(meta => {
      meta.data.forEach((element: Element, index: number) => {
        let animState = elementAnimationState.get(element);
        
        // Update physics simulation if animating
        if (animState?.isAnimating) {
            // Update X position spring
            const xUpdate = updateSpring(
                animState.currentX, animState.targetX, animState.velocityX,
                animState.physicsConfig, clampedDt
            );
            // Update Y position spring
            const yUpdate = updateSpring(
                animState.currentY, animState.targetY, animState.velocityY,
                animState.physicsConfig, clampedDt
            );
            // Update Scale spring
            const scaleUpdate = updateSpring(
                animState.currentScale, animState.targetScale, animState.velocityScale,
                animState.physicsConfig, clampedDt
            );
            // Update Opacity spring
            const opacityUpdate = updateSpring(
                animState.currentOpacity, animState.targetOpacity, animState.velocityOpacity,
                animState.physicsConfig, clampedDt
            );

            // Update state
            animState.currentX = xUpdate.position;
            animState.velocityX = xUpdate.velocity;
            animState.currentY = yUpdate.position;
            animState.velocityY = yUpdate.velocity;
            animState.currentScale = scaleUpdate.position;
            animState.velocityScale = scaleUpdate.velocity;
            animState.currentOpacity = opacityUpdate.position;
            animState.velocityOpacity = opacityUpdate.velocity;
            
            // Stop animating if ALL springs are settled
            if(xUpdate.velocity === 0 && yUpdate.velocity === 0 && 
               scaleUpdate.velocity === 0 && opacityUpdate.velocity === 0 && 
               xUpdate.position === animState.targetX && yUpdate.position === animState.targetY &&
               scaleUpdate.position === animState.targetScale && 
               opacityUpdate.position === animState.targetOpacity) {
                animState.isAnimating = false;
            }
            
            needsRedraw = true; // Needs redraw if any animation happened
        }
      });
    });

    // Request next animation frame if any animation is ongoing AND plugin is enabled
    if (needsRedraw) {
       chart.draw(); // Request redraw
    }
  },

  // Runs before drawing each dataset
  beforeDatasetDraw: (chart: Chart, args: { index: number; meta: any }, options: any) => {
    const { enabled } = options as { enabled?: boolean };
    // Check enabled flag
    if (!enabled) return;

    const { ctx } = chart;
    const meta = args.meta;

    meta.data.forEach((element: Element, index: number) => {
      const animState = elementAnimationState.get(element);

      if (animState) {
        const scaleEffectNeeded = Math.abs(animState.currentScale - 1) > 0.001;
        const opacityEffectNeeded = Math.abs(animState.currentOpacity - 1) > 0.001;
        // Check if translation is needed
        const translateEffectNeeded = Math.abs(animState.currentX) > 0.001 || Math.abs(animState.currentY) > 0.001;

        // Save context if *any* effect is active
        if (scaleEffectNeeded || opacityEffectNeeded || translateEffectNeeded) {
            ctx.save();
            animState.needsSave = true; 

            // Apply translation first
            if (translateEffectNeeded) {
                 ctx.translate(animState.currentX, animState.currentY);
            }

            // Apply scale around center point
            if (scaleEffectNeeded && typeof (element as any).getCenterPoint === 'function') {
                const center = (element as any).getCenterPoint();
                // Adjust center point based on current translation if applied
                const adjustedCenterX = center.x - (translateEffectNeeded ? animState.currentX : 0);
                const adjustedCenterY = center.y - (translateEffectNeeded ? animState.currentY : 0);

                ctx.translate(adjustedCenterX, adjustedCenterY);
                ctx.scale(animState.currentScale, animState.currentScale);
                ctx.translate(-adjustedCenterX, -adjustedCenterY);
            }

            // Apply opacity
            if (opacityEffectNeeded) {
                ctx.globalAlpha *= animState.currentOpacity; 
            }
        } else {
            animState.needsSave = false;
        }
      } 
    });
  },

  // Runs after drawing each dataset
  afterDatasetDraw: (chart: Chart, args: { index: number; meta: any }, options: any) => {
    const { enabled } = options as { enabled?: boolean };
    // Check enabled flag
    if (!enabled) return;

    const { ctx } = chart;
    const meta = args.meta;

    meta.data.forEach((element: Element) => { 
      const animState = elementAnimationState.get(element);
      if (animState?.needsSave) {
        ctx.restore();
        animState.needsSave = false;
      }
    });
  },

  // Cleanup on chart destroy
  afterDestroy: (chart: Chart) => {
    // No explicit clear needed for WeakMap
    (chart as any)._galileoLastPluginUpdate = undefined; // Clean up timestamp
  }
};