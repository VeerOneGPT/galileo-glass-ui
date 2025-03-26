import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Animation timing patterns
 */
export type OrchestrationPattern = 
  | 'sequential'      // One after another
  | 'parallel'        // All at once
  | 'staggered'       // Evenly staggered
  | 'cascade'         // Cascading effect
  | 'gestalt'         // Perceptual grouping pattern
  | 'converge'        // Elements converge to a focal point
  | 'diverge'         // Elements diverge from a focal point
  | 'wave'            // Wave-like pattern
  | 'random'          // Random timing
  | 'custom';         // Custom timing function

/**
 * Timing functions for animation easing
 */
export type TimingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'cubic-bezier';

/**
 * Orchestration relationship types based on Gestalt principles
 */
export type GestaltRelationship = 
  | 'proximity'      // Elements close to each other animate together
  | 'similarity'     // Similar elements animate together
  | 'continuity'     // Elements in a continuous line/curve animate in sequence
  | 'closure'        // Elements forming a closed shape animate together
  | 'connectedness'  // Connected elements animate in sequence
  | 'figure-ground'; // Foreground elements before background

/**
 * Animation stage in the orchestration sequence
 */
export interface AnimationStage {
  /**
   * The ID of the animation stage
   */
  id: string;
  
  /**
   * The delay before this stage starts (in milliseconds)
   */
  delay: number;
  
  /**
   * The duration of this stage (in milliseconds)
   */
  duration: number;
  
  /**
   * The callback function to execute when this stage starts
   */
  onStart?: () => void;
  
  /**
   * The callback function to execute when this stage ends
   */
  onEnd?: () => void;
  
  /**
   * Whether this stage is completed
   */
  completed?: boolean;
  
  /**
   * The order of this stage in the sequence
   */
  order?: number;
  
  /**
   * The animation configuration (e.g., easing, keyframes)
   */
  animation?: {
    easing?: TimingFunction;
    keyframes?: string;
  };
  
  /**
   * Group identifier for coordinated animations
   */
  group?: string;
  
  /**
   * Spatial position for gestalt-based animations
   */
  position?: { x: number; y: number; z?: number };
  
  /**
   * Dependency IDs - stages that must complete before this one starts
   */
  dependencies?: string[];
  
  /**
   * Element type or category for gestalt-based grouping
   */
  elementType?: string;
  
  /**
   * Priority level for gestalt pattern analysis
   */
  priority?: number;
  
  /**
   * Visual relationship to other elements
   */
  relationship?: GestaltRelationship;
}

/**
 * Location point interface for gestalt pattern calculations
 */
export interface Point {
  x: number;
  y: number;
  z?: number;
}

/**
 * Gestalt pattern calculation options
 */
export interface GestaltPatternOptions {
  /**
   * Relationship type to emphasize
   */
  primaryRelationship: GestaltRelationship;
  
  /**
   * Secondary relationship type
   */
  secondaryRelationship?: GestaltRelationship;
  
  /**
   * Base delay between animations in milliseconds
   */
  baseDelay?: number;
  
  /**
   * Maximum animation delay in milliseconds
   */
  maxDelay?: number;
  
  /**
   * Focal point for converge/diverge patterns
   */
  focalPoint?: Point;
  
  /**
   * Minimum distance threshold for proximity calculations
   */
  proximityThreshold?: number;
  
  /**
   * Whether to apply continuous wave effect
   */
  waveEffect?: boolean;
  
  /**
   * Element attribute to use for similarity comparisons
   */
  similarityAttribute?: string;
  
  /**
   * Custom path for continuity pattern
   */
  continuityPath?: Point[];
}

/**
 * Orchestration options configuration
 */
export interface OrchestrationOptions {
  /**
   * The animation stages to orchestrate
   */
  stages: AnimationStage[];
  
  /**
   * Whether to auto-start the orchestration
   */
  autoStart?: boolean;
  
  /**
   * The delay before starting the orchestration (in milliseconds)
   */
  startDelay?: number;
  
  /**
   * Whether to repeat the orchestration
   */
  repeat?: boolean;
  
  /**
   * The number of times to repeat the orchestration (Infinity for endless loop)
   */
  repeatCount?: number;
  
  /**
   * Whether to pause between repetitions
   */
  repeatDelay?: number;
  
  /**
   * Whether the orchestration is initially active
   */
  active?: boolean;
  
  /**
   * Callback when the entire sequence is completed
   */
  onComplete?: () => void;
  
  /**
   * Callback before the orchestration starts
   */
  onStart?: () => void;
  
  /**
   * Animation pattern type
   */
  pattern?: OrchestrationPattern;
  
  /**
   * Stagger delay between sequential animations (in milliseconds)
   */
  staggerDelay?: number;
  
  /**
   * Gestalt pattern calculation options
   */
  gestaltOptions?: GestaltPatternOptions;
  
  /**
   * If true, orchestration will respect reduced motion preferences
   */
  respectReducedMotion?: boolean;
  
  /**
   * If true, orchestration timing will be optimized for performance
   */
  optimizeForPerformance?: boolean;
  
  /**
   * Custom timing function for generating delays
   */
  customTimingFunction?: (stage: AnimationStage, index: number, total: number) => number;
  
  /**
   * Whether to analyze stage dependencies automatically
   */
  analyzeRelationships?: boolean;
}

/**
 * Enhanced hook for orchestrating complex animation sequences
 * 
 * This hook coordinates multiple animations with precise timing control,
 * allowing for complex staged animation sequences. It supports gestalt
 * principles for perceptually grouping animations and creating more 
 * natural motion patterns.
 */
export const useOrchestration = (options: OrchestrationOptions) => {
  const {
    stages,
    autoStart = true,
    startDelay = 0,
    repeat = false,
    repeatCount = 1,
    repeatDelay = 0,
    active = true,
    onComplete,
    onStart,
    pattern = 'sequential',
    staggerDelay = 100,
    gestaltOptions,
    respectReducedMotion = true,
    optimizeForPerformance = true,
    customTimingFunction,
    analyzeRelationships = false
  } = options;
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = respectReducedMotion && prefersReducedMotion;
  
  // Get processed stages with applied patterns
  const processedStages = useMemo(() => {
    let stagesCopy = [...stages];
    
    // Sort stages by order property if provided
    stagesCopy = stagesCopy.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0; // Keep original order
    });
    
    // Apply orchestration pattern to stage timing
    if (pattern !== 'custom') {
      stagesCopy = applyOrchestrationPattern(
        stagesCopy, 
        pattern, 
        staggerDelay, 
        gestaltOptions
      );
    }
    
    // Apply reduced motion modifications if needed
    if (shouldReduceMotion) {
      stagesCopy = applyReducedMotion(stagesCopy);
    }
    
    // Apply performance optimizations if enabled
    if (optimizeForPerformance) {
      stagesCopy = optimizeStages(stagesCopy);
    }
    
    return stagesCopy;
  }, [
    stages, pattern, staggerDelay, gestaltOptions, 
    shouldReduceMotion, optimizeForPerformance
  ]);
  
  // Track active stages and completed state
  const [activeStages, setActiveStages] = useState<string[]>([]);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoStart && active);
  const [iteration, setIteration] = useState(1);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // References to keep track of timers and state
  const stageTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const stageStatesRef = useRef<Record<string, { 
    startTime: number | null; 
    endTime: number | null; 
    completed: boolean;
  }>>({});
  
  // Calculate total animation duration
  const totalDuration = useMemo(() => {
    return processedStages.reduce((max, stage) => {
      return Math.max(max, stage.delay + stage.duration);
    }, 0);
  }, [processedStages]);
  
  // Apply different orchestration patterns to stages
  function applyOrchestrationPattern(
    stagesInput: AnimationStage[],
    patternType: OrchestrationPattern,
    baseStaggerDelay: number,
    gestaltOpts?: GestaltPatternOptions
  ): AnimationStage[] {
    // Create a copy of stages so we don't modify the original
    const updatedStages = [...stagesInput];
    
    switch (patternType) {
      case 'parallel':
        // All animations start at the same time
        return updatedStages.map(stage => ({
          ...stage,
          delay: 0
        }));
      
      case 'sequential':
        // Each animation starts after the previous one finishes
        return updatedStages.reduce((acc, stage, index) => {
          if (index === 0) {
            // First stage starts immediately
            acc.push(stage);
          } else {
            // Each subsequent stage starts after the previous one finishes
            const prevStage = acc[index - 1];
            acc.push({
              ...stage,
              delay: prevStage.delay + prevStage.duration
            });
          }
          return acc;
        }, [] as AnimationStage[]);
      
      case 'staggered':
        // Animations start with a consistent delay between them
        return updatedStages.map((stage, index) => ({
          ...stage,
          delay: index * baseStaggerDelay
        }));
      
      case 'cascade':
        // Exponential or logarithmic staggering
        return updatedStages.map((stage, index) => {
          // Increasing delay that grows more quickly for later items
          const cascadeDelay = Math.round(baseStaggerDelay * Math.pow(1.2, index));
          return {
            ...stage,
            delay: cascadeDelay
          };
        });
      
      case 'gestalt':
        // Use gestalt principles to group animations
        if (!gestaltOpts) {
          // Fallback to staggered if no gestalt options provided
          return applyOrchestrationPattern(stagesInput, 'staggered', baseStaggerDelay);
        }
        
        return applyGestaltPattern(updatedStages, gestaltOpts);
      
      case 'converge':
        // Elements animate toward a focal point with timing based on distance
        if (!gestaltOpts?.focalPoint) {
          return applyOrchestrationPattern(stagesInput, 'staggered', baseStaggerDelay);
        }
        
        return updatedStages.map(stage => {
          if (!stage.position) return stage;
          
          // Calculate distance from focal point
          const focal = gestaltOpts.focalPoint!;
          const distance = Math.sqrt(
            Math.pow((stage.position.x - focal.x), 2) + 
            Math.pow((stage.position.y - focal.y), 2) +
            (stage.position.z && focal.z ? Math.pow((stage.position.z - focal.z), 2) : 0)
          );
          
          // Further elements start earlier so they all arrive at the same time
          const delay = Math.round(baseStaggerDelay * (1 - distance / 100));
          
          return {
            ...stage,
            delay: Math.max(0, delay)  // Ensure non-negative delay
          };
        });
      
      case 'diverge':
        // Elements animate away from a focal point
        if (!gestaltOpts?.focalPoint) {
          return applyOrchestrationPattern(stagesInput, 'staggered', baseStaggerDelay);
        }
        
        return updatedStages.map(stage => {
          if (!stage.position) return stage;
          
          // Calculate distance from focal point
          const focal = gestaltOpts.focalPoint!;
          const distance = Math.sqrt(
            Math.pow((stage.position.x - focal.x), 2) + 
            Math.pow((stage.position.y - focal.y), 2) +
            (stage.position.z && focal.z ? Math.pow((stage.position.z - focal.z), 2) : 0)
          );
          
          // Closer elements start earlier
          const delay = Math.round(baseStaggerDelay * (distance / 100));
          
          return {
            ...stage,
            delay: Math.max(0, delay)  // Ensure non-negative delay
          };
        });
      
      case 'wave':
        // Sine wave timing pattern
        return updatedStages.map((stage, index, array) => {
          const position = index / (array.length - 1);  // Normalize to 0-1
          const wavePosition = Math.sin(position * Math.PI * 2);  // Sine wave
          const normalizedPosition = (wavePosition + 1) / 2;  // Normalize to 0-1
          
          return {
            ...stage,
            delay: Math.round(normalizedPosition * baseStaggerDelay * array.length)
          };
        });
      
      case 'random':
        // Random timing within bounds
        const maxRandomDelay = baseStaggerDelay * updatedStages.length;
        
        return updatedStages.map(stage => ({
          ...stage,
          delay: Math.round(Math.random() * maxRandomDelay)
        }));
      
      case 'custom':
        // Use provided custom timing function
        if (customTimingFunction) {
          return updatedStages.map((stage, index) => ({
            ...stage,
            delay: customTimingFunction(stage, index, updatedStages.length)
          }));
        }
        return updatedStages;
      
      default:
        // Default to original stages if pattern not recognized
        return updatedStages;
    }
  }
  
  // Apply gestalt principles to create natural perceptual grouping
  function applyGestaltPattern(
    stagesInput: AnimationStage[],
    opts: GestaltPatternOptions
  ): AnimationStage[] {
    const { 
      primaryRelationship, 
      baseDelay = 50, 
      maxDelay = 1000,
      proximityThreshold = 100
    } = opts;
    
    const updatedStages = [...stagesInput];
    
    switch (primaryRelationship) {
      case 'proximity':
        // Group by spatial proximity
        // Elements close to each other animate together
        if (!updatedStages.every(stage => stage.position)) {
          // Fallback if positions not provided
          return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
        }
        
        // Group stages by proximity
        const groups: AnimationStage[][] = [];
        const processed = new Set<string>();
        
        updatedStages.forEach(stage => {
          if (processed.has(stage.id)) return;
          
          const group = [stage];
          processed.add(stage.id);
          
          // Find nearby stages
          updatedStages.forEach(otherStage => {
            if (processed.has(otherStage.id) || !stage.position || !otherStage.position) return;
            
            const distance = Math.sqrt(
              Math.pow((stage.position.x - otherStage.position.x), 2) + 
              Math.pow((stage.position.y - otherStage.position.y), 2) +
              ((stage.position.z !== undefined && otherStage.position.z !== undefined) 
                ? Math.pow((stage.position.z - otherStage.position.z), 2) 
                : 0)
            );
            
            if (distance < proximityThreshold) {
              group.push(otherStage);
              processed.add(otherStage.id);
            }
          });
          
          groups.push(group);
        });
        
        // Assign delays based on groups
        groups.forEach((group, groupIndex) => {
          const groupDelay = groupIndex * baseDelay;
          
          group.forEach(groupStage => {
            const stageIndex = updatedStages.findIndex(s => s.id === groupStage.id);
            if (stageIndex >= 0) {
              updatedStages[stageIndex] = {
                ...updatedStages[stageIndex],
                delay: groupDelay
              };
            }
          });
        });
        
        return updatedStages;
      
      case 'similarity':
        // Group by element type or visual similarity
        if (!updatedStages.every(stage => stage.elementType)) {
          // Fallback if element types not provided
          return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
        }
        
        // Group by element type
        const typeGroups: Record<string, AnimationStage[]> = {};
        
        updatedStages.forEach(stage => {
          const type = stage.elementType || 'default';
          if (!typeGroups[type]) {
            typeGroups[type] = [];
          }
          typeGroups[type].push(stage);
        });
        
        // Assign delays based on type groups
        let groupIndex = 0;
        Object.values(typeGroups).forEach(group => {
          const groupDelay = groupIndex * baseDelay;
          
          group.forEach(groupStage => {
            const stageIndex = updatedStages.findIndex(s => s.id === groupStage.id);
            if (stageIndex >= 0) {
              updatedStages[stageIndex] = {
                ...updatedStages[stageIndex],
                delay: groupDelay
              };
            }
          });
          
          groupIndex++;
        });
        
        return updatedStages;
      
      case 'continuity':
        // Animate along a path or in a continuous flow
        if (opts.continuityPath && opts.continuityPath.length > 0) {
          // With provided path
          return updatedStages.map(stage => {
            if (!stage.position) return stage;
            
            // Find closest point on path
            let minDistance = Infinity;
            let pathPosition = 0;
            
            opts.continuityPath!.forEach((pathPoint, index) => {
              const distance = Math.sqrt(
                Math.pow((stage.position!.x - pathPoint.x), 2) + 
                Math.pow((stage.position!.y - pathPoint.y), 2) +
                ((stage.position!.z !== undefined && pathPoint.z !== undefined) 
                  ? Math.pow((stage.position!.z - pathPoint.z), 2) 
                  : 0)
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                pathPosition = index;
              }
            });
            
            // Delay based on position along path
            const normalizedPosition = pathPosition / (opts.continuityPath!.length - 1);
            const delay = Math.round(normalizedPosition * maxDelay);
            
            return {
              ...stage,
              delay
            };
          });
        } else {
          // Without path, use simple left-to-right, top-to-bottom ordering
          if (!updatedStages.every(stage => stage.position)) {
            return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
          }
          
          // Sort by y position first, then x
          const sortedByPosition = [...updatedStages].sort((a, b) => {
            if (!a.position || !b.position) return 0;
            
            // Group into rows first
            const rowA = Math.floor(a.position.y / proximityThreshold);
            const rowB = Math.floor(b.position.y / proximityThreshold);
            
            if (rowA !== rowB) return rowA - rowB;
            
            // Within each row, sort by x
            return a.position.x - b.position.x;
          });
          
          // Assign delays based on position in sorted array
          return sortedByPosition.map((stage, index) => ({
            ...stage,
            delay: index * baseDelay
          }));
        }
      
      case 'closure':
        // Elements forming a closed shape animate together
        // This is complex and would require analyzing if elements form a closed shape
        // For simplicity, we'll just implement a basic version based on groups
        if (updatedStages.every(stage => stage.group)) {
          const closureGroups: Record<string, AnimationStage[]> = {};
          
          updatedStages.forEach(stage => {
            const group = stage.group || 'default';
            if (!closureGroups[group]) {
              closureGroups[group] = [];
            }
            closureGroups[group].push(stage);
          });
          
          // Assign delays based on groups
          let groupIndex = 0;
          Object.values(closureGroups).forEach(group => {
            const groupDelay = groupIndex * baseDelay;
            
            group.forEach(groupStage => {
              const stageIndex = updatedStages.findIndex(s => s.id === groupStage.id);
              if (stageIndex >= 0) {
                updatedStages[stageIndex] = {
                  ...updatedStages[stageIndex],
                  delay: groupDelay
                };
              }
            });
            
            groupIndex++;
          });
          
          return updatedStages;
        }
        
        // Fallback if no group information
        return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
      
      case 'connectedness':
        // Connected elements animate in sequence
        if (analyzeRelationships) {
          // Build dependency graph from stage relationships
          const graph: Record<string, string[]> = {};
          
          updatedStages.forEach(stage => {
            graph[stage.id] = stage.dependencies || [];
          });
          
          // Find root nodes (those with no dependencies)
          const roots = updatedStages
            .filter(stage => !stage.dependencies || stage.dependencies.length === 0)
            .map(stage => stage.id);
          
          // Assign levels based on graph traversal
          const levels: Record<string, number> = {};
          let currentLevel = 0;
          let currentNodes = [...roots];
          
          while (currentNodes.length > 0) {
            const nextNodes: string[] = [];
            
            currentNodes.forEach(nodeId => {
              levels[nodeId] = currentLevel;
              
              // Find all nodes that depend on this one
              updatedStages.forEach(stage => {
                if (stage.dependencies?.includes(nodeId) && !levels[stage.id]) {
                  nextNodes.push(stage.id);
                }
              });
            });
            
            currentNodes = nextNodes;
            currentLevel++;
          }
          
          // Assign delays based on levels
          return updatedStages.map(stage => ({
            ...stage,
            delay: (levels[stage.id] || 0) * baseDelay
          }));
        }
        
        // Fallback if relationship analysis disabled
        return applyOrchestrationPattern(stagesInput, 'sequential', baseDelay);
      
      case 'figure-ground':
        // Foreground elements animate before background elements
        if (updatedStages.every(stage => stage.position && stage.position.z !== undefined)) {
          // Sort by z-index (higher z = closer to viewer = foreground)
          const sortedByZ = [...updatedStages].sort((a, b) => {
            if (!a.position?.z || !b.position?.z) return 0;
            return b.position.z - a.position.z;  // Higher z-values first
          });
          
          // Assign delays based on z-order
          return sortedByZ.map((stage, index) => ({
            ...stage,
            delay: index * baseDelay
          }));
        }
        
        // Fallback if z positions not provided
        return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
      
      default:
        // Default to staggered if relationship not recognized
        return applyOrchestrationPattern(stagesInput, 'staggered', baseDelay);
    }
  }
  
  // Apply reduced motion modifications to stage animations
  function applyReducedMotion(stages: AnimationStage[]): AnimationStage[] {
    return stages.map(stage => {
      // Reduce duration to minimize motion time
      const reducedDuration = Math.min(stage.duration, 300);
      
      // Simplify delays to make transitions more immediate
      const reducedDelay = Math.min(stage.delay, 100);
      
      return {
        ...stage,
        duration: reducedDuration,
        delay: reducedDelay,
        // Add reduced motion flag for reference
        animation: {
          ...stage.animation,
          easing: 'ease-out' // Use a simple easing function
        }
      };
    });
  }
  
  // Optimize stages for better performance
  function optimizeStages(stages: AnimationStage[]): AnimationStage[] {
    // Find stages that can be batched together
    const stagesToBatch: Record<number, AnimationStage[]> = {};
    
    stages.forEach(stage => {
      // Round delay to nearest 16ms (frame boundary)
      const frameAlignedDelay = Math.round(stage.delay / 16) * 16;
      
      if (!stagesToBatch[frameAlignedDelay]) {
        stagesToBatch[frameAlignedDelay] = [];
      }
      
      stagesToBatch[frameAlignedDelay].push(stage);
    });
    
    // Apply optimizations
    return stages.map(stage => {
      // Align delays to frame boundaries
      const frameAlignedDelay = Math.round(stage.delay / 16) * 16;
      
      return {
        ...stage,
        delay: frameAlignedDelay
      };
    });
  }
  
  // Start a specific stage
  const startStage = useCallback((stage: AnimationStage) => {
    // Call the onStart callback if provided
    if (stage.onStart) {
      stage.onStart();
    }
    
    // Mark stage as active
    setActiveStages(prev => {
      if (prev.includes(stage.id)) return prev; // Avoid duplication
      return [...prev, stage.id];
    });
    
    // Track stage start time
    const now = performance.now();
    stageStatesRef.current[stage.id] = {
      ...stageStatesRef.current[stage.id],
      startTime: now
    };
    
    // Set up end timer
    stageTimers.current[`${stage.id}-end`] = setTimeout(() => {
      // Call the onEnd callback if provided
      if (stage.onEnd) {
        stage.onEnd();
      }
      
      // Mark stage as inactive and completed
      setActiveStages(prev => prev.filter(id => id !== stage.id));
      setCompletedStages(prev => {
        if (prev.includes(stage.id)) return prev; // Avoid duplication
        return [...prev, stage.id];
      });
      
      // Track stage end time
      stageStatesRef.current[stage.id] = {
        ...stageStatesRef.current[stage.id],
        endTime: performance.now(),
        completed: true
      };
      
      // Update overall progress
      updateProgress();
    }, stage.duration);
  }, []);
  
  // Update overall animation progress
  const updateProgress = useCallback(() => {
    // Calculate progress based on completed stages vs total stages
    const completedCount = Object.values(stageStatesRef.current)
      .filter(state => state.completed).length;
    const totalStages = processedStages.length;
    
    setProgress(totalStages > 0 ? completedCount / totalStages : 0);
  }, [processedStages.length]);
  
  // Start the orchestration sequence
  const startSequence = useCallback(() => {
    // Reset state
    setActiveStages([]);
    setCompletedStages([]);
    setSequenceComplete(false);
    setProgress(0);
    
    // Initialize stage states
    processedStages.forEach(stage => {
      stageStatesRef.current[stage.id] = {
        startTime: null,
        endTime: null,
        completed: false
      };
    });
    
    // Track sequence start time
    startTimeRef.current = performance.now();
    
    // Call the onStart callback if provided
    if (onStart) {
      onStart();
    }
    
    // Schedule each stage
    processedStages.forEach(stage => {
      stageTimers.current[`${stage.id}-start`] = setTimeout(() => {
        startStage(stage);
      }, startDelay + stage.delay);
    });
    
    // Calculate total sequence duration for completion
    const totalDuration = processedStages.reduce((max, stage) => {
      return Math.max(max, stage.delay + stage.duration);
    }, 0);
    
    // Set a timer for the sequence completion
    stageTimers.current.sequenceComplete = setTimeout(() => {
      setSequenceComplete(true);
      setProgress(1); // Ensure progress is 100% at the end
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Handle repeating
      if (repeat && (repeatCount === Infinity || iteration < repeatCount)) {
        repeatTimerRef.current = setTimeout(() => {
          setIteration(prev => prev + 1);
          startSequence();
        }, repeatDelay);
      }
    }, startDelay + totalDuration);
  }, [
    processedStages, startDelay, startStage, repeat, 
    repeatCount, repeatDelay, iteration, onStart, onComplete
  ]);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    // Clear stage timers
    Object.values(stageTimers.current).forEach(clearTimeout);
    stageTimers.current = {};
    
    // Clear start timer
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    
    // Clear repeat timer
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  }, []);
  
  // Start the orchestration
  const start = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIteration(1);
    
    // Resume from paused state if applicable
    if (pausedAtRef.current !== null) {
      const timeElapsed = pausedAtRef.current;
      pausedAtRef.current = null;
      
      // Adjust delays to account for time already elapsed
      const adjustedStages = processedStages.map(stage => ({
        ...stage,
        delay: Math.max(0, stage.delay - timeElapsed)
      }));
      
      // Resume sequence with adjusted stages
      resumeFromPause(adjustedStages);
    } else {
      // Start fresh sequence
      startTimerRef.current = setTimeout(() => {
        startSequence();
      }, startDelay);
    }
  }, [isPlaying, processedStages, startSequence, startDelay]);
  
  // Resume from paused state
  const resumeFromPause = useCallback((adjustedStages: AnimationStage[]) => {
    // Start incomplete stages with adjusted timing
    adjustedStages.forEach(stage => {
      const stageState = stageStatesRef.current[stage.id];
      
      // Skip completed stages
      if (stageState && stageState.completed) return;
      
      if (stageState && stageState.startTime !== null && stageState.endTime === null) {
        // Stage already started but not completed - resume it
        const elapsedDuration = pausedAtRef.current || 0;
        const remainingDuration = Math.max(0, stage.duration - elapsedDuration);
        
        // Add to active stages immediately
        setActiveStages(prev => prev.includes(stage.id) ? prev : [...prev, stage.id]);
        
        // Set timer for remaining duration
        stageTimers.current[`${stage.id}-end`] = setTimeout(() => {
          if (stage.onEnd) {
            stage.onEnd();
          }
          
          setActiveStages(prev => prev.filter(id => id !== stage.id));
          setCompletedStages(prev => 
            prev.includes(stage.id) ? prev : [...prev, stage.id]
          );
          
          stageStatesRef.current[stage.id] = {
            ...stageStatesRef.current[stage.id],
            endTime: performance.now(),
            completed: true
          };
          
          updateProgress();
        }, remainingDuration);
      } else if (!stageState || stageState.startTime === null) {
        // Stage not yet started - schedule it
        stageTimers.current[`${stage.id}-start`] = setTimeout(() => {
          startStage(stage);
        }, stage.delay);
      }
    });
    
    // Calculate remaining sequence duration
    const now = performance.now();
    const elapsedTime = pausedAtRef.current || 0;
    const totalRemainingDuration = Math.max(0, totalDuration - elapsedTime);
    
    // Set a timer for sequence completion
    stageTimers.current.sequenceComplete = setTimeout(() => {
      setSequenceComplete(true);
      setProgress(1);
      
      if (onComplete) {
        onComplete();
      }
      
      if (repeat && (repeatCount === Infinity || iteration < repeatCount)) {
        repeatTimerRef.current = setTimeout(() => {
          setIteration(prev => prev + 1);
          startSequence();
        }, repeatDelay);
      }
    }, totalRemainingDuration);
  }, [startStage, totalDuration, repeat, repeatCount, repeatDelay, iteration, onComplete, startSequence, updateProgress]);
  
  // Stop the orchestration
  const stop = useCallback(() => {
    setIsPlaying(false);
    clearAllTimers();
    setActiveStages([]);
    pausedAtRef.current = null;
  }, [clearAllTimers]);
  
  // Pause the orchestration (keep track of progress)
  const pause = useCallback(() => {
    if (!isPlaying) return;
    
    setIsPlaying(false);
    
    // Calculate the elapsed time since start
    const elapsed = performance.now() - startTimeRef.current;
    pausedAtRef.current = elapsed;
    
    // Clear all timers but keep state for resuming
    clearAllTimers();
  }, [isPlaying, clearAllTimers]);
  
  // Resume the orchestration
  const resume = useCallback(() => {
    if (isPlaying) return;
    start();
  }, [isPlaying, start]);
  
  // Reset the orchestration
  const reset = useCallback(() => {
    stop();
    setCompletedStages([]);
    setIteration(1);
    setSequenceComplete(false);
    setProgress(0);
    
    // Reset stage states
    processedStages.forEach(stage => {
      stageStatesRef.current[stage.id] = {
        startTime: null,
        endTime: null,
        completed: false
      };
    });
    
    pausedAtRef.current = null;
  }, [stop, processedStages]);
  
  // Restart the orchestration
  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);
  
  // Skip to a specific stage
  const skipToStage = useCallback((stageId: string) => {
    stop();
    
    // Find the target stage
    const targetStage = processedStages.find(stage => stage.id === stageId);
    if (!targetStage) return;
    
    // Mark all stages before the target as completed
    const targetIndex = processedStages.findIndex(stage => stage.id === stageId);
    const stagesToComplete = processedStages.slice(0, targetIndex).map(stage => stage.id);
    
    setCompletedStages(stagesToComplete);
    setIsPlaying(true);
    
    // Reset stage states and mark prior stages as completed
    processedStages.forEach(stage => {
      const isCompleted = stagesToComplete.includes(stage.id);
      
      stageStatesRef.current[stage.id] = {
        startTime: isCompleted ? performance.now() - 1000 : null,
        endTime: isCompleted ? performance.now() : null,
        completed: isCompleted
      };
    });
    
    // Update progress
    updateProgress();
    
    // Start from the target stage
    startStage(targetStage);
    
    // Schedule remaining stages
    const remainingStages = processedStages.slice(targetIndex + 1);
    remainingStages.forEach(stage => {
      const relativeDelay = stage.delay - targetStage.delay;
      stageTimers.current[`${stage.id}-start`] = setTimeout(() => {
        startStage(stage);
      }, Math.max(0, relativeDelay));
    });
    
    // Calculate remaining duration for completion
    const remainingDuration = Math.max(
      targetStage.duration,
      ...remainingStages.map(stage => stage.delay - targetStage.delay + stage.duration)
    );
    
    // Set timer for sequence completion
    stageTimers.current.sequenceComplete = setTimeout(() => {
      setSequenceComplete(true);
      setProgress(1);
      
      if (onComplete) {
        onComplete();
      }
    }, remainingDuration);
  }, [processedStages, stop, startStage, updateProgress, onComplete]);
  
  // Effect for auto-start
  useEffect(() => {
    if (autoStart && active) {
      startTimerRef.current = setTimeout(() => {
        startSequence();
      }, startDelay);
    }
    
    return clearAllTimers;
  }, [autoStart, active, startSequence, startDelay, clearAllTimers]);
  
  // Effect for active state changes
  useEffect(() => {
    if (active && !isPlaying) {
      setIsPlaying(true);
    } else if (!active && isPlaying) {
      pause();
    }
  }, [active, isPlaying, pause]);
  
  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);
  
  // Provide helper functions to check stage status
  const isStageActive = useCallback((stageId: string) => {
    return activeStages.includes(stageId);
  }, [activeStages]);
  
  const isStageCompleted = useCallback((stageId: string) => {
    return completedStages.includes(stageId);
  }, [completedStages]);
  
  // Get all staged grouped by status for detailed monitoring
  const getStagesByStatus = useCallback(() => {
    return {
      pending: processedStages
        .filter(stage => !completedStages.includes(stage.id) && !activeStages.includes(stage.id))
        .map(stage => stage.id),
      active: activeStages,
      completed: completedStages
    };
  }, [processedStages, activeStages, completedStages]);
  
  // Get detailed information about a specific stage
  const getStageInfo = useCallback((stageId: string) => {
    const stage = processedStages.find(s => s.id === stageId);
    const stageState = stageStatesRef.current[stageId];
    
    if (!stage) return null;
    
    const isActive = activeStages.includes(stageId);
    const isCompleted = completedStages.includes(stageId);
    let progress = 0;
    
    if (isCompleted) {
      progress = 1;
    } else if (isActive && stageState?.startTime) {
      const elapsedTime = performance.now() - stageState.startTime;
      progress = Math.min(1, elapsedTime / stage.duration);
    }
    
    return {
      ...stage,
      isActive,
      isCompleted,
      progress,
      startTime: stageState?.startTime || null,
      endTime: stageState?.endTime || null
    };
  }, [processedStages, activeStages, completedStages]);
  
  return {
    // Core state
    activeStages,
    completedStages,
    isPlaying,
    sequenceComplete,
    iteration,
    progress,
    
    // Control functions
    start,
    stop,
    pause,
    resume,
    reset,
    restart,
    skipToStage,
    
    // Status helpers
    isStageActive,
    isStageCompleted,
    getStagesByStatus,
    getStageInfo,
    
    // Additional helpers for advanced usage
    totalDuration,
    pattern,
    stageCount: processedStages.length
  };
};

export default useOrchestration;