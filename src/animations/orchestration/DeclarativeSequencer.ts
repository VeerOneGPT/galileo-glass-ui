/**
 * Declarative Animation Sequencer
 * 
 * A system for creating and managing complex animation sequences using a declarative API.
 * This implementation allows for creating sophisticated, reusable animation sequences
 * with a clear, readable syntax.
 */

import { 
  AnimationPreset, 
  AnimationIntensity 
} from '../core/types';
import { animationOrchestrator, AnimationTarget } from './Orchestrator';
import { MotionSensitivityLevel } from '../accessibility/MotionSensitivity';
import { accessibleAnimation } from '../accessibility/accessibleAnimation';
import { Keyframes } from 'styled-components';

// Types
/**
 * Animation command types
 */
export enum CommandType {
  // Timeline control
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  COMPLETE = 'complete',
  RESET = 'reset',
  SKIP_TO = 'skipTo',
  WAIT = 'wait',
  
  // Animation setup
  ANIMATE = 'animate',
  STAGGER = 'stagger',
  GROUP = 'group',
  SEQUENCE = 'sequence',
  PARALLEL = 'parallel',
  REPEAT = 'repeat',
  
  // Flow control
  IF = 'if',
  ELSE = 'else',
  ELSE_IF = 'elseIf',
  END_IF = 'endIf',
  FOR_EACH = 'forEach',
  END_FOR_EACH = 'endForEach',
  WHEN = 'when',
  
  // Events
  ON = 'on',
  EMIT = 'emit',
  
  // Variable handling
  SET = 'set',
  GET = 'get',
  
  // Timing control
  TIME_SCALE = 'timeScale',
  DELAY = 'delay',
  DURATION = 'duration',
  EASE = 'ease',
  
  // Custom functions
  CALL = 'call',
  CANCEL = 'cancel'
}

/**
 * Animation command interface
 */
export interface AnimationCommand {
  /** Command type */
  type: CommandType;
  
  /** Command parameters */
  params: Record<string, any>;
  
  /** Unique identifier for the command */
  id?: string;
  
  /** Delay before executing the command (in milliseconds) */
  delay?: number;
  
  /** Labels for referencing this command */
  labels?: string[];
  
  /** Dependencies for this command */
  dependencies?: string[];
}

/**
 * Animation sequence context for evaluating commands
 */
export interface SequenceContext {
  /** Variable storage */
  variables: Record<string, any>;
  
  /** Event handlers */
  eventHandlers: Record<string, Array<(data?: any) => void>>;
  
  /** Timeline position (in milliseconds) */
  currentTime: number;
  
  /** Command execution state */
  state: {
    isPlaying: boolean;
    isPaused: boolean;
    isComplete: boolean;
    currentLabel: string | null;
    lastCommandId: string | null;
    conditionalStack: boolean[];
    loopStack: Array<{
      items: any[];
      currentIndex: number;
      variable: string;
    }>;
  };
  
  /** Sequence options */
  options: SequenceOptions;
}

/**
 * Options for the animation sequence
 */
export interface SequenceOptions {
  /** Animation sensitivity level */
  sensitivity?: MotionSensitivityLevel;
  
  /** Whether to autoplay the sequence */
  autoPlay?: boolean;
  
  /** Delay before sequence starts */
  startDelay?: number;
  
  /** Global time scale for the sequence */
  timeScale?: number;
  
  /** Whether to loop the sequence */
  loop?: boolean;
  
  /** Number of iterations if looping */
  iterations?: number;
  
  /** Whether to alternate direction when looping */
  alternate?: boolean;
  
  /** Whether to use relative timing */
  relative?: boolean;
  
  /** Default easing function */
  defaultEase?: string;
}

/**
 * Animation target selector types
 */
export type AnimationTargetSelector = string | HTMLElement | NodeList | HTMLElement[] | null;

/**
 * Animation declaration structure
 */
export interface AnimationDeclaration {
  /** Target element(s) */
  target: AnimationTargetSelector;
  
  /** Animation preset or keyframes */
  animation: AnimationPreset | string;
  
  /** Animation duration */
  duration?: number | string;
  
  /** Animation delay */
  delay?: number | string;
  
  /** Animation easing function */
  easing?: string;
  
  /** Whether to wait for completion before next animation */
  waitForCompletion?: boolean;
  
  /** Additional properties to animate */
  props?: Record<string, any>;
  
  /** CSS variables to set */
  vars?: Record<string, string>;
  
  /** Class names to add/remove */
  classes?: {
    add?: string[];
    remove?: string[];
    toggle?: string[];
  };
  
  /** Animation events */
  events?: {
    onStart?: () => void;
    onComplete?: () => void;
    onUpdate?: (progress: number) => void;
  };
  
  /** When to trigger the next animation */
  triggerNext?: 'afterStart' | 'afterComplete' | number;
}

/**
 * Stagger animation options 
 */
export interface StaggerOptions {
  /** Targets to animate */
  targets: AnimationTargetSelector;
  
  /** Animation to apply */
  animation: AnimationPreset | string;
  
  /** Delay between elements */
  staggerDelay?: number;
  
  /** Direction of stagger */
  direction?: 'normal' | 'reverse' | 'center' | 'edges';
  
  /** Animation duration */
  duration?: number | string;
  
  /** Base delay before first element */
  startDelay?: number;
  
  /** Easing function for stagger timing */
  staggerEase?: string;
  
  /** Easing function for individual animations */
  easing?: string;
  
  /** Callback for each element */
  onStaggerStep?: (el: HTMLElement, index: number, total: number) => void;
}

/**
 * Group animation options
 */
export interface GroupOptions {
  /** Commands to run in the group */
  commands: AnimationCommand[];
  
  /** Whether to run commands in parallel */
  parallel?: boolean;
  
  /** Group label */
  label?: string;
}

/**
 * Declarative Animation Sequencer
 */
export class DeclarativeSequencer {
  /** Animation commands in the sequence */
  private commands: AnimationCommand[] = [];
  
  /** Sequence context */
  private context: SequenceContext;
  
  /** Sequence options */
  private options: SequenceOptions;
  
  /** Orchestrator ID */
  private sequenceId: string;
  
  /** Command execution order */
  private executionPlan: string[] = [];
  
  /** Command dependencies */
  private dependencies: Record<string, string[]> = {};
  
  /** Command by ID lookup */
  private commandById: Record<string, AnimationCommand> = {};
  
  /** Commands by label lookup */
  private commandsByLabel: Record<string, string[]> = {};
  
  /** Sequence name */
  private name: string;
  
  /**
   * Create a new animation sequence
   * @param name Sequence name
   * @param options Sequence options
   */
  constructor(name: string, options: SequenceOptions = {}) {
    this.name = name;
    this.sequenceId = `sequence-${name}-${Date.now()}`;
    this.options = {
      sensitivity: MotionSensitivityLevel.MEDIUM,
      autoPlay: true,
      startDelay: 0,
      timeScale: 1,
      loop: false,
      iterations: 1,
      alternate: false,
      relative: true,
      defaultEase: 'ease-out',
      ...options
    };
    
    // Initialize context
    this.context = {
      variables: {},
      eventHandlers: {},
      currentTime: 0,
      state: {
        isPlaying: false,
        isPaused: false,
        isComplete: false,
        currentLabel: null,
        lastCommandId: null,
        conditionalStack: [],
        loopStack: []
      },
      options: this.options
    };
  }
  
  /**
   * Add a command to the sequence
   * @param command Animation command to add
   * @returns This sequencer for method chaining
   */
  addCommand(command: AnimationCommand): DeclarativeSequencer {
    // Generate a unique ID if not provided
    if (!command.id) {
      command.id = `cmd-${this.commands.length}-${Date.now()}`;
    }
    
    // Store command
    this.commands.push(command);
    this.commandById[command.id] = command;
    
    // Store labels if any
    if (command.labels && command.labels.length > 0) {
      command.labels.forEach(label => {
        if (!this.commandsByLabel[label]) {
          this.commandsByLabel[label] = [];
        }
        this.commandsByLabel[label].push(command.id!);
      });
    }
    
    // Store dependencies
    if (command.dependencies && command.dependencies.length > 0) {
      this.dependencies[command.id] = [...command.dependencies];
    }
    
    return this;
  }
  
  /**
   * Create the execution plan for the sequence
   * @returns Execution plan as array of command IDs
   */
  buildExecutionPlan(): string[] {
    // Initialize execution plan
    this.executionPlan = [];
    
    // Topological sort for dependency ordering
    const visited = new Set<string>();
    const temp = new Set<string>();
    
    // Traverse commands and build execution order
    const visit = (commandId: string) => {
      // Skip if already visited
      if (visited.has(commandId)) return;
      
      // Check for circular dependencies
      if (temp.has(commandId)) {
        throw new Error(`Circular dependency detected in animation sequence: ${commandId}`);
      }
      
      // Mark as being processed
      temp.add(commandId);
      
      // Visit dependencies first
      const deps = this.dependencies[commandId] || [];
      for (const depId of deps) {
        visit(depId);
      }
      
      // Mark as visited and add to execution plan
      temp.delete(commandId);
      visited.add(commandId);
      this.executionPlan.push(commandId);
    };
    
    // Visit all commands
    for (const command of this.commands) {
      visit(command.id!);
    }
    
    return this.executionPlan;
  }
  
  /**
   * Execute the animation sequence
   * @returns Promise that resolves when the sequence completes
   */
  async execute(): Promise<void> {
    // Build execution plan if not already built
    if (this.executionPlan.length === 0) {
      this.buildExecutionPlan();
    }
    
    // Reset context state
    this.context.state.isPlaying = true;
    this.context.state.isPaused = false;
    this.context.state.isComplete = false;
    this.context.currentTime = 0;
    
    // Execute commands in order
    const animationTargets: AnimationTarget[] = [];
    
    for (const commandId of this.executionPlan) {
      const command = this.commandById[commandId];
      
      // Skip if in conditional block that evaluates to false
      if (this.shouldSkipCommand(command)) {
        continue;
      }
      
      // Process command
      const result = await this.processCommand(command);
      
      // Add animation targets if returned
      if (Array.isArray(result)) {
        animationTargets.push(...result);
      }
    }
    
    // Create and play sequence with orchestrator
    if (animationTargets.length > 0) {
      return new Promise<void>((resolve) => {
        // Create event handlers
        const onComplete = () => {
          this.context.state.isComplete = true;
          this.context.state.isPlaying = false;
          resolve();
        };
        
        // Add event listener for sequence completion
        animationOrchestrator.addEventListener('complete', (event) => {
          if (event.animation === this.sequenceId) {
            onComplete();
          }
        });
        
        // Create and play sequence
        animationOrchestrator.createSequence(this.sequenceId, {
          targets: animationTargets,
          parallel: false,
          sensitivity: this.options.sensitivity,
          loop: this.options.loop,
          iterations: this.options.iterations,
          alternate: this.options.alternate,
          autoPlay: this.options.autoPlay
        });
        
        // Manually play if not auto-playing
        if (!this.options.autoPlay) {
          animationOrchestrator.play(this.sequenceId);
        }
      });
    }
    
    // No animations were created, sequence is complete
    this.context.state.isComplete = true;
    this.context.state.isPlaying = false;
    return Promise.resolve();
  }
  
  /**
   * Check if a command should be skipped based on conditional logic
   * @param command Command to check
   * @returns Whether the command should be skipped
   */
  private shouldSkipCommand(command: AnimationCommand): boolean {
    // If conditional stack has any false values, skip commands until end of condition
    if (this.context.state.conditionalStack.includes(false)) {
      // Only process control flow commands
      return !([
        CommandType.IF,
        CommandType.ELSE,
        CommandType.ELSE_IF,
        CommandType.END_IF,
        CommandType.FOR_EACH,
        CommandType.END_FOR_EACH
      ].includes(command.type));
    }
    
    return false;
  }
  
  /**
   * Process a single animation command
   * @param command Command to process
   * @returns Animation targets if created, or void
   */
  private async processCommand(command: AnimationCommand): Promise<AnimationTarget[] | void> {
    // Update context for command
    this.context.state.lastCommandId = command.id || null;
    
    // Apply delay if specified
    if (command.delay && command.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, command.delay));
    }
    
    // Process by command type
    switch (command.type) {
      case CommandType.ANIMATE:
        return this.processAnimateCommand(command);
        
      case CommandType.STAGGER:
        return this.processStaggerCommand(command);
        
      case CommandType.GROUP:
        return this.processGroupCommand(command);
        
      case CommandType.SEQUENCE:
        return this.processSequenceCommand(command);
        
      case CommandType.PARALLEL:
        return this.processParallelCommand(command);
        
      case CommandType.WAIT:
        return this.processWaitCommand(command);
        
      case CommandType.IF:
        return this.processIfCommand(command);
        
      case CommandType.ELSE:
        return this.processElseCommand(command);
        
      case CommandType.ELSE_IF:
        return this.processElseIfCommand(command);
        
      case CommandType.END_IF:
        return this.processEndIfCommand(command);
        
      case CommandType.FOR_EACH:
        return this.processForEachCommand(command);
        
      case CommandType.END_FOR_EACH:
        return this.processEndForEachCommand(command);
        
      case CommandType.CALL:
        return this.processCallCommand(command);
        
      case CommandType.SET:
        return this.processSetCommand(command);
        
      case CommandType.ON:
        return this.processOnCommand(command);
        
      case CommandType.EMIT:
        return this.processEmitCommand(command);
        
      default:
        console.warn(`Unknown command type: ${command.type}`);
        return;
    }
  }
  
  /**
   * Process an ANIMATE command
   * @param command Animation command
   * @returns Animation targets
   */
  private processAnimateCommand(command: AnimationCommand): AnimationTarget[] {
    const { target, animation, duration, delay, easing, waitForCompletion, props, vars, classes, events } = command.params as AnimationDeclaration;
    
    // Convert target to array of elements
    const elements = this.resolveTargets(target);
    if (!elements || elements.length === 0) {
      console.warn(`Animation target not found: ${target}`);
      return [];
    }
    
    // Create animation targets
    const animationTargets: AnimationTarget[] = elements.map(element => {
      // Resolve animation
      const resolvedAnimation = typeof animation === 'string' 
        ? this.getAnimationByName(animation) 
        : animation;
        
      // Apply CSS classes if specified
      if (classes) {
        if (classes.add) {
          classes.add.forEach(cls => element.classList.add(cls));
        }
        if (classes.remove) {
          classes.remove.forEach(cls => element.classList.remove(cls));
        }
        if (classes.toggle) {
          classes.toggle.forEach(cls => element.classList.toggle(cls));
        }
      }
      
      // Apply CSS variables if specified
      if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
          element.style.setProperty(`--${key}`, value);
        });
      }
      
      // Resolve easing function
      const resolvedEasing = easing || resolvedAnimation.easing || this.options.defaultEase;
      
      // Create animation target
      const target: AnimationTarget = {
        target: element,
        animation: {
          ...resolvedAnimation,
          easing: resolvedEasing
        },
        delay: this.resolveTime(delay || 0),
        duration: this.resolveTime(duration),
        waitForCompletion: waitForCompletion ?? true,
        options: { ...props }
      };
      
      // Register events if specified
      if (events) {
        if (events.onStart) {
          // Will be called when animation starts
          const originalOnStart = events.onStart;
          setTimeout(() => originalOnStart(), this.resolveTime(delay || 0));
        }
        
        if (events.onComplete) {
          // Will be called when animation completes
          const originalOnComplete = events.onComplete;
          const totalDuration = this.resolveTime(delay || 0) + this.resolveTime(duration);
          setTimeout(() => originalOnComplete(), totalDuration);
        }
      }
      
      return target;
    });
    
    return animationTargets;
  }
  
  /**
   * Process a STAGGER command
   * @param command Stagger command
   * @returns Animation targets
   */
  private processStaggerCommand(command: AnimationCommand): AnimationTarget[] {
    const { 
      targets, 
      animation, 
      staggerDelay = 50, 
      direction = 'normal',
      duration, 
      startDelay = 0,
      staggerEase,
      easing,
      onStaggerStep
    } = command.params as StaggerOptions;
    
    // Resolve targets
    const elements = this.resolveTargets(targets);
    if (!elements || elements.length === 0) {
      console.warn(`Stagger targets not found: ${targets}`);
      return [];
    }
    
    // Create animation targets with staggered delays
    const animationTargets: AnimationTarget[] = [];
    
    // Calculate indices based on direction
    let indices: number[];
    switch (direction) {
      case 'reverse':
        // Reverse order
        indices = Array.from({ length: elements.length }, (_, i) => elements.length - 1 - i);
        break;
      case 'center':
        // From center outward
        indices = Array.from({ length: elements.length }, (_, i) => {
          const half = Math.floor(elements.length / 2);
          const dist = i % 2 === 0 ? i / 2 : Math.ceil(i / 2);
          return half + (i % 2 === 0 ? dist : -dist);
        });
        break;
      case 'edges':
        // From edges to center
        indices = Array.from({ length: elements.length }, (_, i) => {
          return i < elements.length / 2 ? i * 2 : (elements.length - 1 - i) * 2 + 1;
        });
        break;
      case 'normal':
      default:
        // Normal order
        indices = Array.from({ length: elements.length }, (_, i) => i);
        break;
    }
    
    // Create staggered animations
    indices.forEach((originalIndex, i) => {
      const element = elements[originalIndex];
      
      // Calculate staggered delay
      // Apply easing to the stagger timing if specified
      let staggerFactor = i / Math.max(1, elements.length - 1);
      if (staggerEase) {
        staggerFactor = this.applyEasing(staggerFactor, staggerEase);
      }
      const elementDelay = startDelay + (staggerFactor * staggerDelay * elements.length);
      
      // Resolve animation
      const resolvedAnimation = typeof animation === 'string' 
        ? this.getAnimationByName(animation) 
        : animation;
        
      // Run step callback if provided
      if (onStaggerStep) {
        onStaggerStep(element, originalIndex, elements.length);
      }
      
      // Create animation target
      animationTargets.push({
        target: element,
        animation: {
          ...resolvedAnimation,
          easing: easing || resolvedAnimation.easing || this.options.defaultEase
        },
        delay: this.resolveTime(elementDelay),
        duration: this.resolveTime(duration),
        waitForCompletion: i === indices.length - 1, // Wait only on last element
      });
    });
    
    return animationTargets;
  }
  
  /**
   * Process a GROUP command
   * @param command Group command
   * @returns Animation targets
   */
  private async processGroupCommand(command: AnimationCommand): Promise<AnimationTarget[]> {
    const { commands, parallel = false, label } = command.params as GroupOptions;
    
    // Update context
    const prevLabel = this.context.state.currentLabel;
    if (label) {
      this.context.state.currentLabel = label;
    }
    
    // Process commands
    const allTargets: AnimationTarget[] = [];
    
    if (parallel) {
      // Process commands in parallel
      const promises = commands.map(async (cmd) => {
        if (this.shouldSkipCommand(cmd)) return [];
        return await this.processCommand(cmd) || [];
      });
      
      const results = await Promise.all(promises);
      results.forEach(targets => {
        if (Array.isArray(targets)) {
          allTargets.push(...targets);
        }
      });
    } else {
      // Process commands sequentially
      for (const cmd of commands) {
        if (this.shouldSkipCommand(cmd)) continue;
        const targets = await this.processCommand(cmd);
        if (Array.isArray(targets)) {
          allTargets.push(...targets);
        }
      }
    }
    
    // Restore context
    this.context.state.currentLabel = prevLabel;
    
    return allTargets;
  }
  
  /**
   * Process a SEQUENCE command
   * @param command Sequence command
   * @returns Animation targets
   */
  private async processSequenceCommand(command: AnimationCommand): Promise<AnimationTarget[]> {
    // A sequence is just a group that runs sequentially
    return this.processGroupCommand({
      ...command,
      params: {
        ...command.params,
        parallel: false
      }
    });
  }
  
  /**
   * Process a PARALLEL command
   * @param command Parallel command
   * @returns Animation targets
   */
  private async processParallelCommand(command: AnimationCommand): Promise<AnimationTarget[]> {
    // A parallel sequence is just a group that runs in parallel
    return this.processGroupCommand({
      ...command,
      params: {
        ...command.params,
        parallel: true
      }
    });
  }
  
  /**
   * Process a WAIT command
   * @param command Wait command
   */
  private async processWaitCommand(command: AnimationCommand): Promise<void> {
    const { duration } = command.params;
    
    if (duration && typeof duration === 'number' && duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration));
    }
  }
  
  /**
   * Process an IF command
   * @param command IF command
   */
  private processIfCommand(command: AnimationCommand): void {
    const { condition } = command.params;
    
    // Evaluate condition
    const result = this.evaluateCondition(condition);
    
    // Push result to conditional stack
    this.context.state.conditionalStack.push(result);
  }
  
  /**
   * Process an ELSE command
   * @param command ELSE command
   */
  private processElseCommand(command: AnimationCommand): void {
    // If we're in an if block, flip the last condition
    if (this.context.state.conditionalStack.length > 0) {
      const lastIndex = this.context.state.conditionalStack.length - 1;
      const lastCondition = this.context.state.conditionalStack[lastIndex];
      
      // Flip the condition
      this.context.state.conditionalStack[lastIndex] = !lastCondition;
    }
  }
  
  /**
   * Process an ELSE_IF command
   * @param command ELSE_IF command
   */
  private processElseIfCommand(command: AnimationCommand): void {
    const { condition } = command.params;
    
    // Pop the previous condition
    if (this.context.state.conditionalStack.length > 0) {
      this.context.state.conditionalStack.pop();
      
      // Evaluate new condition
      const result = this.evaluateCondition(condition);
      
      // Push result to conditional stack
      this.context.state.conditionalStack.push(result);
    }
  }
  
  /**
   * Process an END_IF command
   * @param command END_IF command
   */
  private processEndIfCommand(command: AnimationCommand): void {
    // Pop the current condition from the stack
    if (this.context.state.conditionalStack.length > 0) {
      this.context.state.conditionalStack.pop();
    }
  }
  
  /**
   * Process a FOR_EACH command
   * @param command FOR_EACH command
   */
  private processForEachCommand(command: AnimationCommand): void {
    const { items, variable } = command.params;
    
    // Evaluate items
    let resolvedItems: any[] = [];
    
    if (typeof items === 'string' && items.startsWith('$')) {
      // Variable reference
      const varName = items.substring(1);
      resolvedItems = this.context.variables[varName] || [];
    } else if (Array.isArray(items)) {
      resolvedItems = items;
    } else {
      console.warn(`FOR_EACH items must be an array or variable reference: ${items}`);
      resolvedItems = [];
    }
    
    // Push loop state to stack
    this.context.state.loopStack.push({
      items: resolvedItems,
      currentIndex: 0,
      variable
    });
    
    // Set first item as variable
    if (resolvedItems.length > 0) {
      this.context.variables[variable] = resolvedItems[0];
      
      // Also set index variable
      this.context.variables[`${variable}_index`] = 0;
    } else {
      // Empty array, skip loop body
      this.context.state.conditionalStack.push(false);
    }
  }
  
  /**
   * Process an END_FOR_EACH command
   * @param command END_FOR_EACH command
   */
  private processEndForEachCommand(command: AnimationCommand): void {
    // Pop loop state from stack
    if (this.context.state.loopStack.length > 0) {
      const loopState = this.context.state.loopStack[this.context.state.loopStack.length - 1];
      
      // Increment index
      loopState.currentIndex++;
      
      // Check if we're done with the loop
      if (loopState.currentIndex >= loopState.items.length) {
        // End of loop, pop from stack
        this.context.state.loopStack.pop();
      } else {
        // Set next item as variable
        this.context.variables[loopState.variable] = loopState.items[loopState.currentIndex];
        
        // Also set index variable
        this.context.variables[`${loopState.variable}_index`] = loopState.currentIndex;
        
        // Seek back to FOR_EACH command
        // This is implementation-specific and depends on how command execution is tracked
        // In a real implementation, we would seek back to the FOR_EACH command
      }
    }
  }
  
  /**
   * Process a CALL command
   * @param command CALL command
   */
  private async processCallCommand(command: AnimationCommand): Promise<void> {
    const { func, args = [] } = command.params;
    
    if (typeof func === 'function') {
      // Call function with provided args
      await func(...args);
    } else if (typeof func === 'string') {
      // Function reference - could be a method on this object or a global function
      const fn = (this as any)[func] || (window as any)[func];
      
      if (typeof fn === 'function') {
        await fn(...args);
      } else {
        console.warn(`Function not found: ${func}`);
      }
    }
  }
  
  /**
   * Process a SET command
   * @param command SET command
   */
  private processSetCommand(command: AnimationCommand): void {
    const { variable, value } = command.params;
    
    if (typeof variable === 'string') {
      this.context.variables[variable] = value;
    }
  }
  
  /**
   * Process an ON command
   * @param command ON command
   */
  private processOnCommand(command: AnimationCommand): void {
    const { event, handler } = command.params;
    
    if (typeof event === 'string' && typeof handler === 'function') {
      if (!this.context.eventHandlers[event]) {
        this.context.eventHandlers[event] = [];
      }
      
      this.context.eventHandlers[event].push(handler);
    }
  }
  
  /**
   * Process an EMIT command
   * @param command EMIT command
   */
  private processEmitCommand(command: AnimationCommand): void {
    const { event, data } = command.params;
    
    if (typeof event === 'string') {
      const handlers = this.context.eventHandlers[event] || [];
      
      for (const handler of handlers) {
        handler(data);
      }
    }
  }
  
  /**
   * Resolve animation targets to array of elements
   * @param targets Target selector
   * @returns Array of HTML elements
   */
  private resolveTargets(targets: AnimationTargetSelector): HTMLElement[] {
    if (!targets) {
      return [];
    }
    
    // If target is already an HTMLElement
    if (targets instanceof HTMLElement) {
      return [targets];
    }
    
    // If target is a NodeList or array
    if (targets instanceof NodeList || Array.isArray(targets)) {
      return Array.from(targets).filter(el => el instanceof HTMLElement) as HTMLElement[];
    }
    
    // If target is a CSS selector string
    if (typeof targets === 'string') {
      // Get variable if it starts with $
      if (targets.startsWith('$')) {
        const varName = targets.substring(1);
        const varValue = this.context.variables[varName];
        
        // Recursively resolve variable value
        return this.resolveTargets(varValue);
      }
      
      // Otherwise, treat as selector
      const elements = document.querySelectorAll(targets);
      return Array.from(elements) as HTMLElement[];
    }
    
    return [];
  }
  
  /**
   * Get animation preset by name
   * @param name Animation name
   * @returns Animation preset
   */
  private getAnimationByName(name: string): AnimationPreset {
    // Create a compliant Keyframes object builder
    const createKeyframes = (name: string, rules: string): Keyframes => {
      return {
        name,
        rules,
        id: `keyframe-${name}-${Math.random().toString(36).substring(2, 9)}`,
        getName: function() { return this.name; }
      };
    };

    // Look for built-in animations
    const builtInAnimations: Record<string, AnimationPreset> = {
      // Default animations
      fadeIn: {
        keyframes: createKeyframes('fadeIn', `
          from { opacity: 0; }
          to { opacity: 1; }
        `),
        duration: 300,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.SUBTLE
      },
      fadeOut: {
        keyframes: createKeyframes('fadeOut', `
          from { opacity: 1; }
          to { opacity: 0; }
        `),
        duration: 300,
        easing: 'ease-in',
        fillMode: 'forwards',
        intensity: AnimationIntensity.SUBTLE
      },
      slideInUp: {
        keyframes: createKeyframes('slideInUp', `
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        `),
        duration: 400,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      slideInDown: {
        keyframes: createKeyframes('slideInDown', `
          from { 
            transform: translateY(-20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        `),
        duration: 400,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      slideInLeft: {
        keyframes: createKeyframes('slideInLeft', `
          from { 
            transform: translateX(-20px);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        `),
        duration: 400,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      slideInRight: {
        keyframes: createKeyframes('slideInRight', `
          from { 
            transform: translateX(20px);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        `),
        duration: 400,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      zoomIn: {
        keyframes: createKeyframes('zoomIn', `
          from { 
            transform: scale(0.95);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        `),
        duration: 400,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      zoomOut: {
        keyframes: createKeyframes('zoomOut', `
          from { 
            transform: scale(1);
            opacity: 1;
          }
          to { 
            transform: scale(0.95);
            opacity: 0;
          }
        `),
        duration: 300,
        easing: 'ease-in',
        fillMode: 'forwards',
        intensity: AnimationIntensity.STANDARD
      },
      pulse: {
        keyframes: createKeyframes('pulse', `
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        `),
        duration: 600,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.SUBTLE
      },
      bounce: {
        keyframes: createKeyframes('bounce', `
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        `),
        duration: 800,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.PRONOUNCED
      },
      shake: {
        keyframes: createKeyframes('shake', `
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        `),
        duration: 600,
        easing: 'ease-in-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.PRONOUNCED
      },
      flipIn: {
        keyframes: createKeyframes('flipIn', `
          from { 
            transform: perspective(400px) rotateX(90deg);
            opacity: 0;
          }
          to { 
            transform: perspective(400px) rotateX(0deg);
            opacity: 1;
          }
        `),
        duration: 600,
        easing: 'ease-out',
        fillMode: 'forwards',
        intensity: AnimationIntensity.DRAMATIC
      },
      flipOut: {
        keyframes: createKeyframes('flipOut', `
          from { 
            transform: perspective(400px) rotateX(0deg);
            opacity: 1;
          }
          to { 
            transform: perspective(400px) rotateX(90deg);
            opacity: 0;
          }
        `),
        duration: 600,
        easing: 'ease-in',
        fillMode: 'forwards',
        intensity: AnimationIntensity.DRAMATIC
      }
    };
    
    // Return built-in animation or default to fade in
    return builtInAnimations[name] || builtInAnimations.fadeIn;
  }
  
  /**
   * Evaluate a condition
   * @param condition Condition to evaluate
   * @returns Boolean result
   */
  private evaluateCondition(condition: any): boolean {
    // If condition is a function, call it
    if (typeof condition === 'function') {
      return Boolean(condition(this.context));
    }
    
    // If condition is a variable reference, resolve it
    if (typeof condition === 'string' && condition.startsWith('$')) {
      const varName = condition.substring(1);
      return Boolean(this.context.variables[varName]);
    }
    
    // Otherwise, just convert to boolean
    return Boolean(condition);
  }
  
  /**
   * Apply easing function to a value
   * @param value Value to ease (0-1)
   * @param easing Easing function name
   * @returns Eased value (0-1)
   */
  private applyEasing(value: number, easing: string): number {
    // Clamp input value to 0-1
    const t = Math.max(0, Math.min(1, value));
    
    switch (easing) {
      case 'linear':
        return t;
        
      case 'ease-in':
        return t * t;
        
      case 'ease-out':
        return 1 - Math.pow(1 - t, 2);
        
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
      case 'expo-in':
        return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
        
      case 'expo-out':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        
      case 'expo-in-out':
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ?
          Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
        
      case 'elastic-out':
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        
      case 'bounce-out':
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          const tPrime = t - 1.5 / d1;
          return n1 * tPrime * tPrime + 0.75;
        } else if (t < 2.5 / d1) {
          const tPrime = t - 2.25 / d1;
          return n1 * tPrime * tPrime + 0.9375;
        } else {
          const tPrime = t - 2.625 / d1;
          return n1 * tPrime * tPrime + 0.984375;
        }
        
      default:
        // Default to ease-out
        return 1 - Math.pow(1 - t, 2);
    }
  }
  
  /**
   * Resolve time value (string or number) to milliseconds
   * @param time Time value
   * @returns Time in milliseconds
   */
  private resolveTime(time: number | string | undefined): number {
    if (time === undefined) {
      return 300; // Default duration
    }
    
    if (typeof time === 'number') {
      return time;
    }
    
    // Parse string time values (e.g., "0.5s" or "500ms")
    if (typeof time === 'string') {
      if (time.endsWith('ms')) {
        return parseFloat(time);
      } else if (time.endsWith('s')) {
        return parseFloat(time) * 1000;
      }
    }
    
    return 300; // Default fallback
  }
  
  /**
   * Start the animation sequence
   * @returns Promise that resolves when sequence completes
   */
  start(): Promise<void> {
    return this.execute();
  }
  
  /**
   * Pause the animation sequence
   */
  pause(): void {
    animationOrchestrator.pause(this.sequenceId);
    this.context.state.isPaused = true;
    this.context.state.isPlaying = false;
  }
  
  /**
   * Resume the animation sequence
   */
  resume(): void {
    animationOrchestrator.play(this.sequenceId);
    this.context.state.isPaused = false;
    this.context.state.isPlaying = true;
  }
  
  /**
   * Stop the animation sequence
   */
  stop(): void {
    animationOrchestrator.stop(this.sequenceId);
    this.context.state.isPlaying = false;
    this.context.state.isPaused = false;
  }
  
  /**
   * Reset the animation sequence
   */
  reset(): void {
    this.stop();
    
    // Reset context
    this.context.variables = {};
    this.context.currentTime = 0;
    this.context.state.isComplete = false;
    this.context.state.conditionalStack = [];
    this.context.state.loopStack = [];
  }
  
  /**
   * Create a new instance with predefined sequence of commands
   * @param name Sequence name
   * @param options Sequence options
   * @param fn Function to build the sequence
   * @returns New sequence
   */
  static create(
    name: string, 
    options: SequenceOptions = {}, 
    fn: (builder: SequenceBuilder) => void
  ): DeclarativeSequencer {
    const sequencer = new DeclarativeSequencer(name, options);
    const builder = new SequenceBuilder(sequencer);
    
    fn(builder);
    
    return sequencer;
  }
}

/**
 * Fluent builder for creating animation sequences
 */
export class SequenceBuilder {
  /** Parent sequencer */
  private sequencer: DeclarativeSequencer;
  
  /**
   * Create a new builder
   * @param sequencer Parent sequencer
   */
  constructor(sequencer: DeclarativeSequencer) {
    this.sequencer = sequencer;
  }
  
  /**
   * Add an animation to the sequence
   * @param targets Target element(s)
   * @param animation Animation preset or name
   * @param options Animation options
   * @returns This builder for chaining
   */
  animate(
    targets: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options: Partial<AnimationDeclaration> = {}
  ): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.ANIMATE,
      params: {
        target: targets,
        animation,
        ...options
      }
    });
    
    return this;
  }
  
  /**
   * Add a staggered animation to the sequence
   * @param targets Target elements
   * @param animation Animation preset or name
   * @param options Stagger options
   * @returns This builder for chaining
   */
  stagger(
    targets: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options: Partial<StaggerOptions> = {}
  ): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.STAGGER,
      params: {
        targets,
        animation,
        ...options
      }
    });
    
    return this;
  }
  
  /**
   * Wait for a specified duration
   * @param duration Duration in milliseconds
   * @returns This builder for chaining
   */
  wait(duration: number): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.WAIT,
      params: {
        duration
      }
    });
    
    return this;
  }
  
  /**
   * Start a group of animations to run sequentially
   * @param fn Function to build the group
   * @returns This builder for chaining
   */
  sequence(fn: (builder: SequenceBuilder) => void): SequenceBuilder {
    const groupBuilder = new SequenceBuilder(this.sequencer);
    const commands: AnimationCommand[] = [];
    
    // Initialize commands array to capture commands from the builder
    const originalAddCommand = this.sequencer.addCommand;
    this.sequencer.addCommand = (command: AnimationCommand) => {
      commands.push(command);
      return this.sequencer;
    };
    
    // Call the builder function
    fn(groupBuilder);
    
    // Restore original addCommand
    this.sequencer.addCommand = originalAddCommand;
    
    // Add the sequence command
    this.sequencer.addCommand({
      type: CommandType.SEQUENCE,
      params: {
        commands,
        parallel: false
      }
    });
    
    return this;
  }
  
  /**
   * Start a group of animations to run in parallel
   * @param fn Function to build the group
   * @returns This builder for chaining
   */
  parallel(fn: (builder: SequenceBuilder) => void): SequenceBuilder {
    const groupBuilder = new SequenceBuilder(this.sequencer);
    const commands: AnimationCommand[] = [];
    
    // Initialize commands array to capture commands from the builder
    const originalAddCommand = this.sequencer.addCommand;
    this.sequencer.addCommand = (command: AnimationCommand) => {
      commands.push(command);
      return this.sequencer;
    };
    
    // Call the builder function
    fn(groupBuilder);
    
    // Restore original addCommand
    this.sequencer.addCommand = originalAddCommand;
    
    // Add the parallel command
    this.sequencer.addCommand({
      type: CommandType.PARALLEL,
      params: {
        commands,
        parallel: true
      }
    });
    
    return this;
  }
  
  /**
   * Start a conditional block
   * @param condition Condition to evaluate
   * @returns This builder for chaining
   */
  if(condition: any): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.IF,
      params: {
        condition
      }
    });
    
    return this;
  }
  
  /**
   * Add an else branch to a conditional block
   * @returns This builder for chaining
   */
  else(): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.ELSE,
      params: {}
    });
    
    return this;
  }
  
  /**
   * Add an else-if branch to a conditional block
   * @param condition Condition to evaluate
   * @returns This builder for chaining
   */
  elseIf(condition: any): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.ELSE_IF,
      params: {
        condition
      }
    });
    
    return this;
  }
  
  /**
   * End a conditional block
   * @returns This builder for chaining
   */
  endIf(): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.END_IF,
      params: {}
    });
    
    return this;
  }
  
  /**
   * Start a loop over items
   * @param items Array of items or variable name
   * @param variable Variable to set for each item
   * @returns This builder for chaining
   */
  forEach(items: any[] | string, variable: string): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.FOR_EACH,
      params: {
        items,
        variable
      }
    });
    
    return this;
  }
  
  /**
   * End a for-each loop
   * @returns This builder for chaining
   */
  endForEach(): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.END_FOR_EACH,
      params: {}
    });
    
    return this;
  }
  
  /**
   * Call a function as part of the sequence
   * @param func Function to call
   * @param args Arguments to pass to the function
   * @returns This builder for chaining
   */
  call(func: Function | string, ...args: any[]): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.CALL,
      params: {
        func,
        args
      }
    });
    
    return this;
  }
  
  /**
   * Set a variable value
   * @param variable Variable name
   * @param value Variable value
   * @returns This builder for chaining
   */
  set(variable: string, value: any): SequenceBuilder {
    this.sequencer.addCommand({
      type: CommandType.SET,
      params: {
        variable,
        value
      }
    });
    
    return this;
  }
}

/**
 * Create a new animation sequence
 * @param name Sequence name
 * @param options Sequence options
 * @param fn Function to build the sequence
 * @returns The animation sequence
 */
export function createAnimationSequence(
  name: string,
  options: SequenceOptions = {},
  fn: (builder: SequenceBuilder) => void
): DeclarativeSequencer {
  return DeclarativeSequencer.create(name, options, fn);
}

export default DeclarativeSequencer;