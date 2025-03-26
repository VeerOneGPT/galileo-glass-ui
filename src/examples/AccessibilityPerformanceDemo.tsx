/**
 * Accessibility and Performance Demo
 *
 * A demo component showcasing the accessibility and performance features
 * of the Glass UI system
 */
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { fadeIn, scaleIn } from '../animations/keyframes/basic';
import { glassFadeIn } from '../animations/keyframes/glass';
import { slideInBottom, slideInTop, pulse, float, bounce } from '../animations/keyframes/motion';
import { AccessibilityProvider, useAccessibility } from '../components/AccessibilityProvider';
import { useOptimizedAnimation, useGlassPerformance } from '../hooks';
import { AnimationComplexity } from '../hooks/useOptimizedAnimation';
import {
  detectFeatures,
  getFeatureSupportLevel,
  GLASS_REQUIREMENTS,
  FeatureLevel,
  getBackdropFilterValue,
  getBackdropFilterFallback,
  createGlassStyle,
} from '../utils/browserCompatibility';
import {
  OptimizationLevel,
  getOptimizedSettings,
  PerformanceMonitor,
  applyCssOptimizations,
  optimizeAnimatedElement,
} from '../utils/performanceOptimizations';

/**
 * Styled components for the demo
 */
const Container = styled.div`
  padding: 24px;
  background-color: #1a1f2e;
  min-height: 100vh;
  color: rgba(255, 255, 255, 0.9);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.7);
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const DemoSection = styled.section`
  background-color: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
`;

const ControlsGroup = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
`;

const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const ControlItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const Select = styled.select`
  background-color: rgba(30, 41, 59, 0.8);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  background-color: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-right: 8px;
`;

const RangeSlider = styled.input.attrs({ type: 'range' })`
  width: 120px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #4f46e5;
  }

  &:disabled {
    background-color: rgba(99, 102, 241, 0.5);
    cursor: not-allowed;
  }
`;

const MetricsCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const MetricLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const MetricValue = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-family: monospace;
`;

const StatusIndicator = styled.div<{ status: 'good' | 'warning' | 'critical' }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props =>
    props.status === 'good' ? '#10B981' : props.status === 'warning' ? '#F59E0B' : '#EF4444'};
`;

const DemoCard = styled.div<{
  glassEffect: boolean;
  blur: number;
  animationName: string;
  reducedMotion: boolean;
}>`
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
    if (props.glassEffect) {
      return `
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(${props.blur}px);
        -webkit-backdrop-filter: blur(${props.blur}px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      `;
    } else {
      return `
        background-color: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
    }
  }}

  ${props => {
    if (!props.reducedMotion) {
      if (props.animationName === 'fade') {
        return `
          animation: ${fadeIn} 1s ease-out;
        `;
      } else if (props.animationName === 'scale') {
        return `
          animation: ${scaleIn} 1s ease-out;
        `;
      } else if (props.animationName === 'slideBottom') {
        return `
          animation: ${slideInBottom} 1s ease-out;
        `;
      } else if (props.animationName === 'slideTop') {
        return `
          animation: ${slideInTop} 1s ease-out;
        `;
      } else if (props.animationName === 'pulse') {
        return `
          animation: ${pulse} 2s infinite ease-in-out;
        `;
      } else if (props.animationName === 'float') {
        return `
          animation: ${float} 3s infinite ease-in-out;
        `;
      } else if (props.animationName === 'bounce') {
        return `
          animation: ${bounce} 2s infinite;
        `;
      } else if (props.animationName === 'glass') {
        return `
          animation: ${glassFadeIn} 1s ease-out;
        `;
      }
    } else {
      // Reduced motion - just fade in
      return `
        animation: ${fadeIn} 0.5s ease-out;
      `;
    }
    return '';
  }}
`;

/**
 * Interface for performance monitoring state
 */
interface PerformanceState {
  fps: number;
  frameTime: number;
  hasJank: boolean;
  featureSupport: FeatureLevel;
  optimizationLevel: OptimizationLevel;
}

/**
 * Controls for Accessibility Settings
 */
const AccessibilityControls: React.FC = () => {
  const {
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    reduceTransparency,
    setReduceTransparency,
    disableAnimations,
    setDisableAnimations,
    fontScale,
    setFontScale,
    enhancedFocus,
    setEnhancedFocus,
  } = useAccessibility();

  return (
    <ControlsGroup>
      <h3>Accessibility Settings</h3>

      <ControlRow>
        <ControlItem>
          <Checkbox
            id="reduced-motion"
            checked={reducedMotion}
            onChange={e => setReducedMotion(e.target.checked)}
          />
          <Label htmlFor="reduced-motion">Reduced Motion</Label>
        </ControlItem>

        <ControlItem>
          <Checkbox
            id="high-contrast"
            checked={highContrast}
            onChange={e => setHighContrast(e.target.checked)}
          />
          <Label htmlFor="high-contrast">High Contrast</Label>
        </ControlItem>

        <ControlItem>
          <Checkbox
            id="reduce-transparency"
            checked={reduceTransparency}
            onChange={e => setReduceTransparency(e.target.checked)}
          />
          <Label htmlFor="reduce-transparency">Reduce Transparency</Label>
        </ControlItem>
      </ControlRow>

      <ControlRow>
        <ControlItem>
          <Checkbox
            id="disable-animations"
            checked={disableAnimations}
            onChange={e => setDisableAnimations(e.target.checked)}
          />
          <Label htmlFor="disable-animations">Disable Animations</Label>
        </ControlItem>

        <ControlItem>
          <Checkbox
            id="enhanced-focus"
            checked={enhancedFocus}
            onChange={e => setEnhancedFocus(e.target.checked)}
          />
          <Label htmlFor="enhanced-focus">Enhanced Focus Indicators</Label>
        </ControlItem>
      </ControlRow>

      <ControlRow>
        <ControlItem>
          <Label htmlFor="font-scale">Font Size:</Label>
          <RangeSlider
            id="font-scale"
            min="0.75"
            max="1.5"
            step="0.05"
            value={fontScale}
            onChange={e => setFontScale(parseFloat(e.target.value))}
          />
          <span>{Math.round(fontScale * 100)}%</span>
        </ControlItem>
      </ControlRow>
    </ControlsGroup>
  );
};

/**
 * Animations Demo Component
 */
const AnimationsDemo: React.FC = () => {
  const { reducedMotion, disableAnimations } = useAccessibility();
  const [animationType, setAnimationType] = useState<string>('fade');
  const [glassEffect, setGlassEffect] = useState(true);
  const [blurStrength, setBlurStrength] = useState(8);

  return (
    <DemoSection>
      <SectionTitle>Animation Accessibility</SectionTitle>

      <ControlRow>
        <ControlItem>
          <Label htmlFor="animation-type">Animation Type:</Label>
          <Select
            id="animation-type"
            value={animationType}
            onChange={e => setAnimationType(e.target.value)}
            disabled={disableAnimations}
          >
            <option value="fade">Fade In</option>
            <option value="scale">Scale In</option>
            <option value="slideBottom">Slide from Bottom</option>
            <option value="slideTop">Slide from Top</option>
            <option value="pulse">Pulse</option>
            <option value="float">Float</option>
            <option value="bounce">Bounce</option>
            <option value="glass">Glass Reveal</option>
          </Select>
        </ControlItem>

        <ControlItem>
          <Checkbox
            id="glass-effect"
            checked={glassEffect}
            onChange={e => setGlassEffect(e.target.checked)}
          />
          <Label htmlFor="glass-effect">Enable Glass Effect</Label>
        </ControlItem>

        <ControlItem>
          <Label htmlFor="blur-strength">Blur Strength:</Label>
          <RangeSlider
            id="blur-strength"
            min="0"
            max="20"
            step="1"
            value={blurStrength}
            onChange={e => setBlurStrength(parseInt(e.target.value))}
            disabled={!glassEffect}
          />
          <span>{blurStrength}px</span>
        </ControlItem>
      </ControlRow>

      <DemoCard
        glassEffect={glassEffect}
        blur={blurStrength}
        animationName={animationType}
        reducedMotion={reducedMotion || disableAnimations}
      >
        <div>
          <h3>Animation Demo</h3>
          <p>
            {reducedMotion
              ? "Reduced motion is enabled - showing simplified animation"
              : disableAnimations
              ? "Animations are disabled"
              : `Showing "${animationType}" animation`}
          </p>
          <Button
            onClick={() => {
              // Force re-render to restart animation
              setAnimationType(current => current);
            }}
          >
            Replay Animation
          </Button>
        </div>
      </DemoCard>

      <div>
        <p>
          This demo shows how animations adapt to accessibility preferences. Try toggling the
          &quot;Reduced Motion&quot; or &quot;Disable Animations&quot; settings to see how animations respond to user
          preferences.
        </p>
      </div>
    </DemoSection>
  );
};

/**
 * Performance Monitoring Component
 */
const PerformanceMonitoring: React.FC = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    frameTime: 16.67,
    hasJank: false,
    featureSupport: FeatureLevel.FULL,
    optimizationLevel: OptimizationLevel.NONE,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const [stressTest, setStressTest] = useState(false);
  const [stressTestCount, setStressTestCount] = useState(20);
  const stressElementsRef = useRef<HTMLDivElement>(null);

  // Start/stop performance monitoring
  useEffect(() => {
    if (isMonitoring && !performanceMonitorRef.current) {
      performanceMonitorRef.current = new PerformanceMonitor(metrics => {
        setPerformanceState({
          fps: metrics.fps,
          frameTime: metrics.frameTime,
          hasJank: metrics.hasJank,
          featureSupport: metrics.featureSupportLevel,
          optimizationLevel: getOptimizedSettings().optimizationLevel,
        });
      });

      performanceMonitorRef.current.start();
    } else if (!isMonitoring && performanceMonitorRef.current) {
      performanceMonitorRef.current.stop();
      performanceMonitorRef.current = null;
    }

    return () => {
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.stop();
      }
    };
  }, [isMonitoring]);

  // Generate stress test elements
  const generateStressElements = () => {
    if (!stressElementsRef.current) return;

    // Clear previous elements
    stressElementsRef.current.innerHTML = '';

    // Generate new elements
    for (let i = 0; i < stressTestCount; i++) {
      const el = document.createElement('div');
      el.className = 'stress-element';
      el.style.width = '100px';
      el.style.height = '100px';
      el.style.margin = '10px';
      el.style.display = 'inline-block';
      el.style.backgroundColor = `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2})`;
      el.style.borderRadius = '8px';
      el.style.backdropFilter = `blur(${Math.floor(Math.random() * 10) + 1}px)`;
      el.style.webkitBackdropFilter = el.style.backdropFilter;
      el.style.animation = `${Math.random() > 0.5 ? 'pulse' : 'float'} ${
        Math.floor(Math.random() * 3) + 1
      }s infinite alternate ease-in-out`;
      el.style.transform = 'translateZ(0)';

      // Apply optimizations if the stress test is active
      if (stressTest) {
        const settings = getOptimizedSettings();
        optimizeAnimatedElement(el, settings);
      }

      stressElementsRef.current.appendChild(el);
    }
  };

  // Update stress test
  useEffect(() => {
    if (stressTest) {
      generateStressElements();
    } else if (stressElementsRef.current) {
      stressElementsRef.current.innerHTML = '';
    }
  }, [stressTest, stressTestCount]);

  return (
    <DemoSection>
      <SectionTitle>Performance Monitoring</SectionTitle>

      <ControlRow>
        <ControlItem>
          <Button onClick={() => setIsMonitoring(!isMonitoring)}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </ControlItem>

        <ControlItem>
          <Checkbox
            id="stress-test"
            checked={stressTest}
            onChange={e => setStressTest(e.target.checked)}
          />
          <Label htmlFor="stress-test">Enable Stress Test</Label>
        </ControlItem>

        <ControlItem>
          <Label htmlFor="stress-count">Element Count:</Label>
          <RangeSlider
            id="stress-count"
            min="5"
            max="100"
            step="5"
            value={stressTestCount}
            onChange={e => setStressTestCount(parseInt(e.target.value))}
            disabled={!stressTest}
          />
          <span>{stressTestCount}</span>
        </ControlItem>
      </ControlRow>

      {isMonitoring && (
        <MetricsCard>
          <h3>Performance Metrics</h3>

          <MetricRow>
            <MetricLabel>FPS:</MetricLabel>
            <MetricValue>
              <StatusIndicator
                status={
                  performanceState.fps >= 50
                    ? 'good'
                    : performanceState.fps >= 30
                    ? 'warning'
                    : 'critical'
                }
              />
              {performanceState.fps.toFixed(1)}
            </MetricValue>
          </MetricRow>

          <MetricRow>
            <MetricLabel>Frame Time:</MetricLabel>
            <MetricValue>
              <StatusIndicator
                status={
                  performanceState.frameTime <= 20
                    ? 'good'
                    : performanceState.frameTime <= 33
                    ? 'warning'
                    : 'critical'
                }
              />
              {performanceState.frameTime.toFixed(2)} ms
            </MetricValue>
          </MetricRow>

          <MetricRow>
            <MetricLabel>Jank Detected:</MetricLabel>
            <MetricValue>
              <StatusIndicator status={performanceState.hasJank ? 'warning' : 'good'} />
              {performanceState.hasJank ? 'Yes' : 'No'}
            </MetricValue>
          </MetricRow>

          <MetricRow>
            <MetricLabel>Feature Support:</MetricLabel>
            <MetricValue>
              <StatusIndicator
                status={
                  performanceState.featureSupport === FeatureLevel.FULL
                    ? 'good'
                    : performanceState.featureSupport === FeatureLevel.PARTIAL
                    ? 'warning'
                    : 'critical'
                }
              />
              {performanceState.featureSupport}
            </MetricValue>
          </MetricRow>

          <MetricRow>
            <MetricLabel>Optimization Level:</MetricLabel>
            <MetricValue>{performanceState.optimizationLevel}</MetricValue>
          </MetricRow>
        </MetricsCard>
      )}

      <div ref={stressElementsRef} style={{ marginTop: '20px', textAlign: 'center' }}>
        {!stressTest && (
          <p>Enable the stress test to generate animated elements with glass effects</p>
        )}
      </div>
    </DemoSection>
  );
};

/**
 * Browser Compatibility Demo
 */
const BrowserCompatibilityDemo: React.FC = () => {
  const [features, setFeatures] = useState(detectFeatures());
  const [demoKey, setDemoKey] = useState(0);

  // Force browser compatibility detection
  const refreshFeatures = () => {
    setFeatures(detectFeatures());
    setDemoKey(prev => prev + 1);
  };

  // Create a demo glass style with fallbacks
  const glassStyle = createGlassStyle(
    {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backgroundOpacity: 0.15,
      blurStrength: 8,
      borderColor: 'rgb(255, 255, 255)',
      borderOpacity: 0.2,
    },
    features
  );

  return (
    <DemoSection>
      <SectionTitle>Browser Compatibility</SectionTitle>

      <Button onClick={refreshFeatures}>Refresh Compatibility Detection</Button>

      <MetricsCard>
        <h3>Detected Features</h3>

        <MetricRow>
          <MetricLabel>Browser:</MetricLabel>
          <MetricValue>
            {features.browser} {features.browserVersion}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>OS:</MetricLabel>
          <MetricValue>{features.os}</MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>Backdrop Filter:</MetricLabel>
          <MetricValue>
            <StatusIndicator status={features.backdropFilter ? 'good' : 'critical'} />
            {features.backdropFilter ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>CSS Grid:</MetricLabel>
          <MetricValue>
            <StatusIndicator status={features.cssGrid ? 'good' : 'warning'} />
            {features.cssGrid ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>CSS Variables:</MetricLabel>
          <MetricValue>
            <StatusIndicator status={features.cssVariables ? 'good' : 'critical'} />
            {features.cssVariables ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>CSS Animations:</MetricLabel>
          <MetricValue>
            <StatusIndicator status={features.cssAnimations ? 'good' : 'warning'} />
            {features.cssAnimations ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>Hardware Acceleration:</MetricLabel>
          <MetricValue>
            <StatusIndicator status={features.hardwareAcceleration ? 'good' : 'warning'} />
            {features.hardwareAcceleration ? 'Available' : 'Limited'}
          </MetricValue>
        </MetricRow>

        <MetricRow>
          <MetricLabel>Glass UI Support:</MetricLabel>
          <MetricValue>
            <StatusIndicator
              status={
                getFeatureSupportLevel(GLASS_REQUIREMENTS, features) === FeatureLevel.FULL
                  ? 'good'
                  : getFeatureSupportLevel(GLASS_REQUIREMENTS, features) === FeatureLevel.PARTIAL
                  ? 'warning'
                  : 'critical'
              }
            />
            {getFeatureSupportLevel(GLASS_REQUIREMENTS, features)}
          </MetricValue>
        </MetricRow>
      </MetricsCard>

      <div style={{ marginTop: '20px' }}>
        <h3>Glass Effect with Fallbacks</h3>
        <p>This example uses automatic fallbacks based on browser capability detection</p>

        <div
          key={demoKey}
          style={{
            padding: '20px',
            borderRadius: '8px',
            marginTop: '16px',
            ...glassStyle.split(';').reduce((styles, style) => {
              const [property, value] = style.split(':');
              if (property && value) {
                styles[property.trim()] = value.trim();
              }
              return styles;
            }, {} as Record<string, string>),
          }}
        >
          <h4>Adaptive Glass Card</h4>
          <p>This card adjusts its style based on browser capabilities</p>
          <p>Feature Support Level: {getFeatureSupportLevel(GLASS_REQUIREMENTS, features)}</p>
        </div>
      </div>
    </DemoSection>
  );
};

/**
 * Main Demo Component
 */
export const AccessibilityPerformanceDemo: React.FC = () => {
  return (
    <AccessibilityProvider listenToSystemPreferences={true} persistPreferences={true}>
      <Container>
        <Title>Glass UI Accessibility & Performance</Title>
        <Description>
          Explore the accessibility and performance features of the Glass UI system. This demo
          showcases how Glass UI adapts to user preferences and device capabilities.
        </Description>

        <AccessibilityControls />

        <DemoGrid>
          <AnimationsDemo />
          <PerformanceMonitoring />
        </DemoGrid>

        <BrowserCompatibilityDemo />
      </Container>
    </AccessibilityProvider>
  );
};

export default AccessibilityPerformanceDemo;
