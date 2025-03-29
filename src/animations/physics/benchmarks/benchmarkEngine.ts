/**
 * Physics Engine Benchmarking Tools
 * 
 * Utilities for comparing performance and quality of different physics animation engines
 */

import { BenchmarkConfig, BenchmarkResult, FrameData, PerformanceMetrics } from './types';

/**
 * Measures FPS during animation
 */
export const measureFPS = (duration = 1000): Promise<number> => {
  return new Promise(resolve => {
    const startTime = performance.now();
    let frameCount = 0;
    
    const countFrame = () => {
      const currentTime = performance.now();
      const elapsedTime = currentTime - startTime;
      
      frameCount++;
      
      if (elapsedTime < duration) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsedTime) * 1000;
        resolve(fps);
      }
    };
    
    requestAnimationFrame(countFrame);
  });
};

/**
 * Measures frame duration statistics
 */
export const measureFrameDurations = (sampleCount = 100): Promise<{
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  frames: number[];
}> => {
  return new Promise(resolve => {
    const frameTimes: number[] = [];
    let lastFrameTime = performance.now();
    
    const measureFrame = () => {
      const now = performance.now();
      const frameDuration = now - lastFrameTime;
      lastFrameTime = now;
      
      frameTimes.push(frameDuration);
      
      if (frameTimes.length < sampleCount) {
        requestAnimationFrame(measureFrame);
      } else {
        // Calculate statistics
        const sortedTimes = [...frameTimes].sort((a, b) => a - b);
        const mean = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        const median = sortedTimes[Math.floor(sortedTimes.length / 2)];
        const min = sortedTimes[0];
        const max = sortedTimes[sortedTimes.length - 1];
        
        // Calculate standard deviation
        const variance = frameTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / frameTimes.length;
        const stdDev = Math.sqrt(variance);
        
        resolve({
          mean,
          median,
          min,
          max,
          stdDev,
          frames: frameTimes
        });
      }
    };
    
    requestAnimationFrame(measureFrame);
  });
};

/**
 * Measures memory usage during an animation
 */
export const measureMemoryUsage = async (): Promise<{
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}> => {
  if ('memory' in performance) {
    // TypeScript doesn't know about the memory property
    const perfMemory = (performance as any).memory;
    if (perfMemory) {
      return {
        jsHeapSizeLimit: perfMemory.jsHeapSizeLimit,
        totalJSHeapSize: perfMemory.totalJSHeapSize,
        usedJSHeapSize: perfMemory.usedJSHeapSize
      };
    }
  }
  
  // Fallback for browsers without memory API
  return {
    jsHeapSizeLimit: 0,
    totalJSHeapSize: 0,
    usedJSHeapSize: 0
  };
};

/**
 * Records animation frames for motion analysis
 */
export const recordAnimationFrames = (
  element: HTMLElement, 
  duration = 1000,
  sampleRate = 30
): Promise<FrameData[]> => {
  return new Promise(resolve => {
    const frames: FrameData[] = [];
    const startTime = performance.now();
    const sampleInterval = 1000 / sampleRate; // ms between samples
    let nextSampleTime = startTime;
    
    const recordFrame = () => {
      const now = performance.now();
      const elapsedTime = now - startTime;
      
      if (now >= nextSampleTime) {
        // Get element position/transform
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const transform = style.transform;
        
        frames.push({
          time: elapsedTime,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          transform
        });
        
        nextSampleTime = startTime + Math.ceil((now - startTime) / sampleInterval) * sampleInterval;
      }
      
      if (elapsedTime < duration) {
        requestAnimationFrame(recordFrame);
      } else {
        resolve(frames);
      }
    };
    
    requestAnimationFrame(recordFrame);
  });
};

/**
 * Calculates animation smoothness from recorded frames
 */
export const calculateSmoothness = (frames: FrameData[]): {
  smoothnessScore: number; // 0-100%
  maxJerk: number;
  averageJerk: number;
  velocityVariance: number;
} => {
  if (frames.length < 3) {
    return {
      smoothnessScore: 0,
      maxJerk: 0,
      averageJerk: 0,
      velocityVariance: 0
    };
  }
  
  // Calculate velocities (px/ms)
  const velocities: {x: number, y: number, time: number}[] = [];
  for (let i = 1; i < frames.length; i++) {
    const dt = frames[i].time - frames[i-1].time;
    if (dt === 0) continue;
    
    velocities.push({
      x: (frames[i].x - frames[i-1].x) / dt,
      y: (frames[i].y - frames[i-1].y) / dt,
      time: frames[i].time
    });
  }
  
  // Calculate accelerations (px/ms²)
  const accelerations: {x: number, y: number, time: number}[] = [];
  for (let i = 1; i < velocities.length; i++) {
    const dt = velocities[i].time - velocities[i-1].time;
    if (dt === 0) continue;
    
    accelerations.push({
      x: (velocities[i].x - velocities[i-1].x) / dt,
      y: (velocities[i].y - velocities[i-1].y) / dt,
      time: velocities[i].time
    });
  }
  
  // Calculate jerks (px/ms³) - the rate of change of acceleration
  const jerks: number[] = [];
  for (let i = 1; i < accelerations.length; i++) {
    const dt = accelerations[i].time - accelerations[i-1].time;
    if (dt === 0) continue;
    
    const jerkX = Math.abs((accelerations[i].x - accelerations[i-1].x) / dt);
    const jerkY = Math.abs((accelerations[i].y - accelerations[i-1].y) / dt);
    const jerkMagnitude = Math.sqrt(jerkX * jerkX + jerkY * jerkY);
    
    jerks.push(jerkMagnitude);
  }
  
  // Calculate velocity variance
  let velocityXSum = 0;
  let velocityYSum = 0;
  velocities.forEach(v => {
    velocityXSum += v.x;
    velocityYSum += v.y;
  });
  
  const velocityXMean = velocityXSum / velocities.length;
  const velocityYMean = velocityYSum / velocities.length;
  
  let velocityXVarSum = 0;
  let velocityYVarSum = 0;
  velocities.forEach(v => {
    velocityXVarSum += Math.pow(v.x - velocityXMean, 2);
    velocityYVarSum += Math.pow(v.y - velocityYMean, 2);
  });
  
  const velocityXVar = velocityXVarSum / velocities.length;
  const velocityYVar = velocityYVarSum / velocities.length;
  const velocityVariance = velocityXVar + velocityYVar;
  
  // Calculate jerk statistics
  const maxJerk = jerks.length > 0 ? Math.max(...jerks) : 0;
  const averageJerk = jerks.length > 0 ? jerks.reduce((sum, j) => sum + j, 0) / jerks.length : 0;
  
  // Calculate smoothness score (lower jerk = higher smoothness)
  // Normalize to 0-100% range
  const jerkBase = Math.max(0.001, maxJerk); // Avoid division by zero
  const jerkScore = Math.max(0, 100 - (averageJerk / jerkBase) * 50);
  const varianceScore = Math.max(0, 100 - velocityVariance * 1000);
  
  const smoothnessScore = (jerkScore * 0.7 + varianceScore * 0.3);
  
  return {
    smoothnessScore,
    maxJerk,
    averageJerk,
    velocityVariance
  };
};

/**
 * Measures animation delay (time between triggering animation and first visible change)
 */
export const measureAnimationDelay = (
  element: HTMLElement,
  startAnimation: () => void,
  maxWaitTime = 1000
): Promise<number> => {
  return new Promise(resolve => {
    // Get initial position
    const initialRect = element.getBoundingClientRect();
    const initialPos = { 
      x: initialRect.left, 
      y: initialRect.top,
      width: initialRect.width,
      height: initialRect.height 
    };
    
    const startTime = performance.now();
    startAnimation();
    
    const checkForMovement = () => {
      const currentRect = element.getBoundingClientRect();
      const currentPos = { 
        x: currentRect.left, 
        y: currentRect.top,
        width: currentRect.width,
        height: currentRect.height 
      };
      
      // Check if position has changed significantly (more than 1px to account for rounding)
      const hasChanged = 
        Math.abs(currentPos.x - initialPos.x) > 1 ||
        Math.abs(currentPos.y - initialPos.y) > 1 ||
        Math.abs(currentPos.width - initialPos.width) > 1 ||
        Math.abs(currentPos.height - initialPos.height) > 1;
      
      if (hasChanged) {
        // Movement detected
        const delay = performance.now() - startTime;
        resolve(delay);
      } else if (performance.now() - startTime < maxWaitTime) {
        // Check again in the next frame
        requestAnimationFrame(checkForMovement);
      } else {
        // Timeout reached
        resolve(maxWaitTime);
      }
    };
    
    requestAnimationFrame(checkForMovement);
  });
};

/**
 * Runs a benchmark for a specific engine
 */
export const runBenchmark = async <T extends unknown[]>(
  benchmarkConfig: BenchmarkConfig<T>,
): Promise<BenchmarkResult> => {
  const {
    name,
    renderComponent,
    triggerAnimation,
    duration = 2000,
    warmupCount = 3,
    iterations = 5,
    sampleFrameRate = 60,
    element,
    args
  } = benchmarkConfig;
  
  // Make sure element exists
  if (!element) {
    throw new Error(`Benchmark "${name}" failed: Element not found`);
  }
  
  console.log(`Starting benchmark: ${name}`);
  console.log(`Warming up (${warmupCount} runs)...`);
  
  // Warm up phase
  for (let i = 0; i < warmupCount; i++) {
    await new Promise<void>(resolve => {
      // Create a new array with all arguments and the callback
      const allArgs = [...args] as unknown[];
      allArgs.push(() => {
        // Wait for animation to complete
        setTimeout(resolve, duration + 100);
      });
      
      // Apply the function with the arguments array
      triggerAnimation.apply(null, allArgs as any);
    });
  }
  
  console.log(`Running benchmark iterations (${iterations})...`);
  
  // Collect metrics
  const frameRates: number[] = [];
  const animationDelays: number[] = [];
  const smoothnessScores: number[] = [];
  let framesData: FrameData[] = [];
  let performanceData: PerformanceMetrics;
  
  // Run benchmark iterations
  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1}/${iterations}`);
    
    // Measure animation delay
    const delay = await measureAnimationDelay(element, () => {
      triggerAnimation(...args);
    });
    animationDelays.push(delay);
    
    // Record frames for this iteration
    const frames = await recordAnimationFrames(element, duration, sampleFrameRate);
    if (i === iterations - 1) {
      // Save frames from last iteration for analysis
      framesData = frames;
    }
    
    // Calculate smoothness for this iteration
    const smoothness = calculateSmoothness(frames);
    smoothnessScores.push(smoothness.smoothnessScore);
    
    // Measure FPS for this iteration
    const fps = await measureFPS(duration);
    frameRates.push(fps);
    
    // Wait for things to settle down between iterations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Measure frame durations once at the end
  const frameDurations = await measureFrameDurations(100);
  
  // Measure memory usage
  const memoryUsage = await measureMemoryUsage();
  
  // Calculate aggregated metrics
  const averageFPS = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
  const averageDelay = animationDelays.reduce((sum, delay) => sum + delay, 0) / animationDelays.length;
  const averageSmoothness = smoothnessScores.reduce((sum, score) => sum + score, 0) / smoothnessScores.length;
  
  performanceData = {
    fps: {
      average: averageFPS,
      values: frameRates
    },
    frameDurations: {
      mean: frameDurations.mean,
      median: frameDurations.median,
      min: frameDurations.min,
      max: frameDurations.max,
      stdDev: frameDurations.stdDev
    },
    delay: {
      average: averageDelay,
      values: animationDelays
    },
    smoothness: {
      average: averageSmoothness,
      values: smoothnessScores
    },
    memory: memoryUsage
  };
  
  console.log(`Benchmark complete: ${name}`);
  console.log(`Average FPS: ${averageFPS.toFixed(2)}`);
  console.log(`Average Animation Delay: ${averageDelay.toFixed(2)}ms`);
  console.log(`Average Smoothness Score: ${averageSmoothness.toFixed(2)}%`);
  
  return {
    name,
    metrics: performanceData,
    frames: framesData,
    duration
  };
};

/**
 * Compares results from multiple benchmarks
 */
export const compareBenchmarks = (
  benchmarkResults: BenchmarkResult[]
): {
  summary: string;
  comparisonTable: string;
  winners: { [metric: string]: string };
} => {
  // Validate input
  if (benchmarkResults.length < 2) {
    return {
      summary: "Comparison requires at least two benchmark results",
      comparisonTable: "",
      winners: {}
    };
  }
  
  // Organize metrics for comparison
  const names = benchmarkResults.map(result => result.name);
  const fpsValues = benchmarkResults.map(result => result.metrics.fps.average);
  const delayValues = benchmarkResults.map(result => result.metrics.delay.average);
  const smoothnessValues = benchmarkResults.map(result => result.metrics.smoothness.average);
  const frameTimeValues = benchmarkResults.map(result => result.metrics.frameDurations.mean);
  const memoryValues = benchmarkResults.map(result => result.metrics.memory.usedJSHeapSize);
  
  // Determine winners (higher is better for FPS and smoothness, lower is better for delay, frame time, and memory)
  const maxFPS = Math.max(...fpsValues);
  const minDelay = Math.min(...delayValues);
  const maxSmoothness = Math.max(...smoothnessValues);
  const minFrameTime = Math.min(...frameTimeValues);
  const minMemory = Math.min(...memoryValues);
  
  const winners: { [metric: string]: string } = {
    fps: names[fpsValues.indexOf(maxFPS)],
    delay: names[delayValues.indexOf(minDelay)],
    smoothness: names[smoothnessValues.indexOf(maxSmoothness)],
    frameTime: names[frameTimeValues.indexOf(minFrameTime)],
    memory: names[memoryValues.indexOf(minMemory)]
  };
  
  // Create comparison table
  let comparisonTable = "| Metric | ";
  comparisonTable += names.join(" | ");
  comparisonTable += " |\n";
  comparisonTable += "| --- | ";
  comparisonTable += names.map(() => "---").join(" | ");
  comparisonTable += " |\n";
  
  // FPS row
  comparisonTable += `| FPS | ${fpsValues.map((fps, index) => {
    const isWinner = fps === maxFPS;
    return `${fps.toFixed(2)}${isWinner ? " 🏆" : ""}`;
  }).join(" | ")} |\n`;
  
  // Delay row
  comparisonTable += `| Animation Delay (ms) | ${delayValues.map((delay, index) => {
    const isWinner = delay === minDelay;
    return `${delay.toFixed(2)}${isWinner ? " 🏆" : ""}`;
  }).join(" | ")} |\n`;
  
  // Smoothness row
  comparisonTable += `| Smoothness (%) | ${smoothnessValues.map((smoothness, index) => {
    const isWinner = smoothness === maxSmoothness;
    return `${smoothness.toFixed(2)}${isWinner ? " 🏆" : ""}`;
  }).join(" | ")} |\n`;
  
  // Frame time row
  comparisonTable += `| Frame Time (ms) | ${frameTimeValues.map((frameTime, index) => {
    const isWinner = frameTime === minFrameTime;
    return `${frameTime.toFixed(2)}${isWinner ? " 🏆" : ""}`;
  }).join(" | ")} |\n`;
  
  // Memory row (convert to MB)
  comparisonTable += `| Memory (MB) | ${memoryValues.map((memory, index) => {
    const isWinner = memory === minMemory;
    const memoryMB = memory / (1024 * 1024);
    return `${memoryMB.toFixed(2)}${isWinner ? " 🏆" : ""}`;
  }).join(" | ")} |\n`;
  
  // Count total wins
  const winCounts: Record<string, number> = {};
  Object.values(winners).forEach(winner => {
    winCounts[winner] = (winCounts[winner] || 0) + 1;
  });
  
  // Get the overall winner
  const overallWinner = Object.entries(winCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name} (${count} metric${count > 1 ? 's' : ''})`)
    .join(', ');
  
  // Create summary
  const summary = `# Benchmark Comparison\n\n` +
    `Compared ${benchmarkResults.length} animation engines: ${names.join(', ')}.\n\n` +
    `## Overall Winner: ${overallWinner}\n\n` +
    `## Winners by Category:\n` +
    `- Best FPS: ${winners.fps} (${maxFPS.toFixed(2)} FPS)\n` +
    `- Lowest Animation Delay: ${winners.delay} (${minDelay.toFixed(2)}ms)\n` +
    `- Smoothest Animation: ${winners.smoothness} (${maxSmoothness.toFixed(2)}%)\n` +
    `- Fastest Frame Time: ${winners.frameTime} (${minFrameTime.toFixed(2)}ms)\n` +
    `- Lowest Memory Usage: ${winners.memory} (${(minMemory / (1024 * 1024)).toFixed(2)}MB)\n\n` +
    `## Comparison Table\n\n${comparisonTable}`;
  
  return {
    summary,
    comparisonTable,
    winners
  };
};

export default {
  measureFPS,
  measureFrameDurations,
  measureMemoryUsage,
  recordAnimationFrames,
  calculateSmoothness,
  measureAnimationDelay,
  runBenchmark,
  compareBenchmarks
};