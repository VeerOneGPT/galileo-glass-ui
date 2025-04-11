/**
 * Animation System Migration Examples
 * 
 * This file contains example components showing how to migrate from the old
 * animation system to the new event-based system.
 */

import React, { useEffect, useRef, useState } from 'react';

// Old imports
// import { useGameAnimation as useOldGameAnimation } from '@galileo/animations/game'; // Example, keep commented

// New imports 
import { 
  useGameAnimationRefactored as useNewGameAnimation,
  GameAnimationEventType,
  createErrorRecoveryMiddleware
} from '../../../src/animations/game'; // Corrected path

import { 
  TransitionType, 
  TransitionDirection,
  AnimationCategory,
  MotionSensitivityLevel
} from '../../../src/animations/types'; // Corrected path

// Example 1: Basic Migration - Minimal Changes
export const BasicMigrationExample = () => {
  // Define states and transitions (same for both versions)
  const gameStates = [
    { id: 'menu', elements: '.menu-element' },
    { id: 'game', elements: '.game-element' },
    { id: 'gameover', elements: '.gameover-element' }
  ];
  
  const gameTransitions = [
    { 
      from: 'menu', 
      to: 'game', 
      type: TransitionType.FADE,
      duration: 500
    },
    { 
      from: 'game', 
      to: 'gameover', 
      type: TransitionType.SLIDE,
      direction: TransitionDirection.BOTTOM_TO_TOP,
      duration: 800
    },
    { 
      from: 'gameover', 
      to: 'menu', 
      type: TransitionType.FADE,
      duration: 500
    }
  ];
  
  // Old way
  /*
  const gameAnimation = useOldGameAnimation({
    initialState: 'menu',
    states: gameStates,
    transitions: gameTransitions
  });
  */
  
  // New way (API remains compatible)
  const gameAnimation = useNewGameAnimation({
    initialState: 'menu',
    states: gameStates,
    transitions: gameTransitions
  });
  
  return (
    <div className="game-container">
      {/* Menu screen */}
      <div className="menu-element">
        <h1>Game Menu</h1>
        <button onClick={() => gameAnimation.transitionTo('game')}>
          Start Game
        </button>
      </div>
      
      {/* Game screen */}
      <div className="game-element">
        <h1>Game Running</h1>
        <button onClick={() => gameAnimation.transitionTo('gameover')}>
          End Game
        </button>
      </div>
      
      {/* Game Over screen */}
      <div className="gameover-element">
        <h1>Game Over</h1>
        <button onClick={() => gameAnimation.transitionTo('menu')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
};

// Example 2: Advanced Migration - Using New Features
export const AdvancedMigrationExample = () => {
  // Game state
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [error, setError] = useState<{ message: string; recoverable: boolean } | null>(null);
  
  // Animation controller ref for accessing later
  const gameAnimationController = useRef<ReturnType<typeof useNewGameAnimation> | null>(null);
  
  // Define states and transitions
  const gameStates = [
    { id: 'menu', elements: '.menu-element', exclusive: true },
    { id: 'loading', elements: '.loading-element', exclusive: true },
    { id: 'game', elements: '.game-element', exclusive: true },
    { id: 'pause', elements: '.pause-element' },
    { id: 'gameover', elements: '.gameover-element', exclusive: true }
  ];
  
  const gameTransitions = [
    { 
      from: 'menu', 
      to: 'loading', 
      type: TransitionType.FADE,
      duration: 300
    },
    { 
      from: 'loading', 
      to: 'game', 
      type: TransitionType.ZOOM,
      direction: TransitionDirection.FROM_CENTER,
      duration: 600
    },
    { 
      from: 'game', 
      to: 'pause', 
      type: TransitionType.GLASS_BLUR,
      duration: 200
    },
    { 
      from: 'pause', 
      to: 'game', 
      type: TransitionType.GLASS_BLUR,
      duration: 200
    },
    { 
      from: 'game', 
      to: 'gameover', 
      type: TransitionType.PHYSICS_SLIDE,
      direction: TransitionDirection.BOTTOM_TO_TOP,
      duration: 800,
      physicsConfig: {
        tension: 100,
        friction: 15
      }
    },
    { 
      from: 'gameover', 
      to: 'menu', 
      type: TransitionType.FADE,
      duration: 500
    }
  ];
  
  // New game animation with enhanced options
  const gameAnimation = useNewGameAnimation({
    initialState: 'menu',
    states: gameStates,
    transitions: gameTransitions,
    defaultDuration: 400,
    defaultEasing: 'easeOutCubic',
    category: AnimationCategory.INTERACTION,
    motionSensitivity: MotionSensitivityLevel.MEDIUM,
    onStateChange: (prevState, newState) => {
      console.log(`State changed: ${prevState} -> ${newState}`);
      setGameStatus(newState || 'idle');
    },
    debug: process.env.NODE_ENV === 'development'
  });
  
  // Store reference for event listeners
  gameAnimationController.current = gameAnimation;
  
  // Set up event listeners
  useEffect(() => {
    // Ensure controller ref is current
    if (!gameAnimationController.current) return;
    
    // Access emitter via the controller instance
    const emitter = gameAnimationController.current.getEventEmitter?.(); 
    if (!emitter) return;
    
    // Animation error listener
    const errorListener = (event: any) => { // Add type annotation if possible
      const { error, recoverable } = event.data;
      // Set the error state correctly
      setError({ 
        message: error.message, 
        recoverable 
      }); 
    };
    
    // Animation recovery listener
    const recoveryListener = (event: any) => {
      const { resolution } = event.data;
      console.log(`Animation recovered: ${resolution}`);
      setError(null);
    };
    
    // Add listeners
    emitter.on(GameAnimationEventType.ANIMATION_ERROR, errorListener);
    emitter.on(GameAnimationEventType.ANIMATION_RECOVERY, recoveryListener);
    
    // Clean up
    return () => {
      emitter.removeEventListener(GameAnimationEventType.ANIMATION_ERROR, errorListener);
      emitter.removeEventListener(GameAnimationEventType.ANIMATION_RECOVERY, recoveryListener);
    };
  }, []); // Dependency array is empty, runs once
  
  // Game logic example
  const startGame = () => {
    gameAnimation.transitionTo('loading');
    
    // Simulate asset loading
    setTimeout(() => {
      setScore(0);
      gameAnimation.transitionTo('game');
    }, 1500);
  };
  
  const pauseGame = () => {
    gameAnimation.transitionTo('pause');
  };
  
  const resumeGame = () => {
    gameAnimation.transitionTo('game');
  };
  
  const endGame = () => {
    gameAnimation.transitionTo('gameover');
  };
  
  const returnToMenu = () => {
    gameAnimation.transitionTo('menu');
  };
  
  // Error handling UI
  const ErrorDisplay = ({ error }: { error: { message: string; recoverable: boolean } | null }) => {
    if (!error) return null;
    
    return (
      <div className="error-overlay">
        <div className="error-content">
          <h3>Animation Error</h3>
          <p>{error.message}</p>
          {error.recoverable && (
            // Use controller ref to resume
            <button onClick={() => gameAnimationController.current?.resumeTransition()}>
              Retry Animation
            </button>
          )}
          <button onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="game-container">
      {/* Error overlay */}
      {error && <ErrorDisplay error={error} />}
      
      {/* Menu screen */}
      <div className="menu-element">
        <h1>Advanced Game Example</h1>
        <p>Motion Sensitivity: {gameAnimation.motionSensitivity}</p>
        <p>Reduced Motion: {gameAnimation.reducedMotion ? 'Enabled' : 'Disabled'}</p>
        <button onClick={startGame}>Start Game</button>
      </div>
      
      {/* Loading screen */}
      <div className="loading-element">
        <div className="loading-spinner"></div>
        <p>Loading Game Assets...</p>
      </div>
      
      {/* Game screen */}
      <div className="game-element">
        <div className="game-header">
          <h2>Score: {score}</h2>
          <button onClick={pauseGame}>Pause</button>
        </div>
        <div className="game-content">
          <div className="game-character"></div>
        </div>
        <button className="debug-button" onClick={endGame}>End Game (Debug)</button>
      </div>
      
      {/* Pause overlay */}
      <div className="pause-element">
        <div className="pause-menu">
          <h2>Game Paused</h2>
          <button onClick={resumeGame}>Resume</button>
          <button onClick={returnToMenu}>Quit to Menu</button>
        </div>
      </div>
      
      {/* Game Over screen */}
      <div className="gameover-element">
        <h1>Game Over</h1>
        <p>Final Score: {score}</p>
        <button onClick={returnToMenu}>Back to Menu</button>
      </div>
    </div>
  );
};

// Example 3: Custom Error Recovery Example
export const CustomErrorRecoveryExample = () => {
  // Custom error recovery strategies
  const customErrorRecoveryStrategies = {
    // Handle timing errors (animation timing issues)
    'TimingError': (error, context) => {
      // Simply reset and try again
      if (context.animationSequence) {
        try {
          context.animationSequence.reset();
          return { resolved: true, resolution: 'Reset animation sequence' };
        } catch (e) {
          return { resolved: false };
        }
      }
      return { resolved: false };
    },
    
    // Handle resource errors (missing assets)
    'ResourceError': (error, context) => {
      // Try to use fallback resources
      if (context.resources && context.resources.fallbacks) {
        try {
          // Replace missing resources with fallbacks
          context.resources.useFallbacks();
          return { 
            resolved: true, 
            resolution: 'Using fallback animation resources' 
          };
        } catch (e) {
          return { resolved: false };
        }
      }
      return { resolved: false };
    }
  };
  
  // Create middleware
  const errorRecoveryMiddleware = createErrorRecoveryMiddleware(
    customErrorRecoveryStrategies
  );
  
  return (
    <div>
      <h2>Custom Error Recovery Example</h2>
      <p>This example shows how to implement custom error recovery strategies.</p>
      <p>See the code for implementation details.</p>
    </div>
  );
}; 