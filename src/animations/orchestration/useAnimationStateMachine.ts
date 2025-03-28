/**
 * useAnimationStateMachine Hook
 * 
 * React hook for using the animation state machine with React components.
 * Provides a declarative way to define and use animation state machines.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  AnimationState, 
  StateTransition, 
  StateMachineOptions,
  AnimationStateMachine,
  createAnimationStateMachine,
  TransitionContext
} from './AnimationStateMachine';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MotionSensitivityLevel } from '../accessibility/MotionSensitivity';

/**
 * Parameters for the useAnimationStateMachine hook
 */
export interface UseAnimationStateMachineParams {
  /** State definitions */
  states: AnimationState[];
  
  /** Transition definitions */
  transitions: StateTransition[];
  
  /** Initial state ID */
  initialState: string;
  
  /** Target elements to animate */
  targets?: string | HTMLElement | NodeList | HTMLElement[] | null;
  
  /** Motion sensitivity level */
  sensitivity?: MotionSensitivityLevel;
  
  /** Debug mode */
  debug?: boolean;
  
  /** Persist state to localStorage */
  persist?: boolean;
  
  /** Storage key for persistence */
  storageKey?: string;
  
  /** Dependencies array to recreate state machine when changed */
  deps?: any[];
  
  /** Callback when state changes */
  onStateChange?: (from: string, to: string, context: TransitionContext) => void;
}

/**
 * Results returned by the useAnimationStateMachine hook
 */
export interface UseAnimationStateMachineResult {
  /** Current state ID */
  currentState: string;
  
  /** Previous state ID */
  previousState: string;
  
  /** Send an event to the state machine */
  send: (event: string, params?: any) => Promise<boolean>;
  
  /** Check if machine is in a specific state */
  is: (stateId: string) => boolean;
  
  /** Check if machine can handle an event */
  can: (event: string) => boolean;
  
  /** Reset the state machine */
  reset: () => Promise<boolean>;
  
  /** Get all available transitions from current state */
  getAvailableTransitions: () => StateTransition[];
  
  /** Get transition history */
  getHistory: () => TransitionContext['history'];
  
  /** Clear transition history */
  clearHistory: () => void;
  
  /** Set context data */
  setData: (key: string, value: any) => void;
  
  /** Get context data */
  getData: (key: string) => any;
  
  /** Add event listener */
  on: (event: string, handler: (params?: any) => void) => void;
  
  /** Remove event listener */
  off: (event: string, handler: (params?: any) => void) => void;
  
  /** Whether machine is currently transitioning */
  transitioning: boolean;
  
  /** Raw state machine instance */
  machine: AnimationStateMachine;
}

/**
 * Hook for using animation state machines in React components
 * 
 * @param params Hook parameters
 * @returns State machine controls and state
 */
export function useAnimationStateMachine(
  params: UseAnimationStateMachineParams
): UseAnimationStateMachineResult {
  // Get preferred motion settings
  const prefersReducedMotion = useReducedMotion();
  
  // Create a ref for the state machine
  const machineRef = useRef<AnimationStateMachine | null>(null);
  
  // Track transitioning state
  const [transitioning, setTransitioning] = useState(false);
  
  // Track current and previous states
  const [currentState, setCurrentState] = useState(params.initialState);
  const [previousState, setPreviousState] = useState('');
  
  // Create state machine options
  const options: StateMachineOptions = {
    initialState: params.initialState,
    targets: params.targets,
    sensitivity: prefersReducedMotion 
      ? MotionSensitivityLevel.HIGH 
      : (params.sensitivity ?? MotionSensitivityLevel.MEDIUM),
    debug: params.debug,
    persist: params.persist,
    storageKey: params.storageKey,
    onStateChange: (from, to, context) => {
      // Update component state
      setPreviousState(from);
      setCurrentState(to);
      
      // Call user callback if provided
      if (params.onStateChange) {
        params.onStateChange(from, to, context);
      }
    }
  };
  
  // Create or get state machine
  const getOrCreateMachine = useCallback(() => {
    if (!machineRef.current) {
      machineRef.current = createAnimationStateMachine(
        params.states,
        params.transitions,
        options
      );
      
      // Set initial state values
      setCurrentState(machineRef.current.getState());
      setPreviousState(machineRef.current.getPreviousState());
    }
    
    return machineRef.current;
  }, [
    params.initialState,
    params.targets,
    params.sensitivity,
    params.debug,
    params.persist,
    params.storageKey,
    prefersReducedMotion,
    // These are arrays so we can't put them in deps directly
    JSON.stringify(params.states.map(s => s.id)),
    JSON.stringify(params.transitions.map(t => `${t.from}-${t.on}-${t.to}`)),
    ...(params.deps || [])
  ]);
  
  // Initialize machine
  useEffect(() => {
    getOrCreateMachine();
    
    return () => {
      // Clean up
      machineRef.current = null;
    };
  }, [getOrCreateMachine]);
  
  // Send an event to the state machine
  const send = useCallback(async (event: string, eventParams: any = {}) => {
    const machine = getOrCreateMachine();
    setTransitioning(true);
    
    try {
      const result = await machine.send(event, eventParams);
      return result;
    } finally {
      setTransitioning(false);
    }
  }, [getOrCreateMachine]);
  
  // Check if machine is in a specific state
  const is = useCallback((stateId: string) => {
    const machine = getOrCreateMachine();
    return machine.is(stateId);
  }, [getOrCreateMachine]);
  
  // Check if machine can handle an event
  const can = useCallback((event: string) => {
    const machine = getOrCreateMachine();
    return machine.can(event);
  }, [getOrCreateMachine]);
  
  // Reset the state machine
  const reset = useCallback(async () => {
    const machine = getOrCreateMachine();
    setTransitioning(true);
    
    try {
      return await machine.reset();
    } finally {
      setTransitioning(false);
    }
  }, [getOrCreateMachine]);
  
  // Get all available transitions from current state
  const getAvailableTransitions = useCallback(() => {
    const machine = getOrCreateMachine();
    return machine.getAvailableTransitions();
  }, [getOrCreateMachine]);
  
  // Get transition history
  const getHistory = useCallback(() => {
    const machine = getOrCreateMachine();
    return machine.getHistory();
  }, [getOrCreateMachine]);
  
  // Clear transition history
  const clearHistory = useCallback(() => {
    const machine = getOrCreateMachine();
    machine.clearHistory();
  }, [getOrCreateMachine]);
  
  // Set context data
  const setData = useCallback((key: string, value: any) => {
    const machine = getOrCreateMachine();
    machine.setData(key, value);
  }, [getOrCreateMachine]);
  
  // Get context data
  const getData = useCallback((key: string) => {
    const machine = getOrCreateMachine();
    return machine.getData(key);
  }, [getOrCreateMachine]);
  
  // Add event listener
  const on = useCallback((event: string, handler: (params?: any) => void) => {
    const machine = getOrCreateMachine();
    machine.on(event, handler);
  }, [getOrCreateMachine]);
  
  // Remove event listener
  const off = useCallback((event: string, handler: (params?: any) => void) => {
    const machine = getOrCreateMachine();
    machine.off(event, handler);
  }, [getOrCreateMachine]);
  
  return {
    currentState,
    previousState,
    send,
    is,
    can,
    reset,
    getAvailableTransitions,
    getHistory,
    clearHistory,
    setData,
    getData,
    on,
    off,
    transitioning,
    machine: getOrCreateMachine()
  };
}

export default useAnimationStateMachine;