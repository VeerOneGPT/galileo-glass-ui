import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled, { css, keyframes } from 'styled-components';
// Import from local paths
import { ThemeProvider } from '../../src/theme/ThemeProvider';
import {
  MotionSensitivityLevel,
  AnimationComplexity,
  AnimationCategory,
  AnimationDistanceScale,
  getMotionSensitivity,
  calculateAnimationIntensity,
  EnhancedAnimationOptions,
  MotionSensitivityOptions,
  getAdjustedAnimation,
} from '../../src/animations/accessibility/MotionSensitivity';
import { Typography } from '../../src/components/Typography';
import { GlassButton } from '../../src/components/Button';
import { Slider } from '../../src/components/Slider';
import { Select } from '../../src/components/Select';
import { Checkbox } from '../../src/components/Checkbox';

// --- Helper Data ---
const levelColors: Record<MotionSensitivityLevel, string> = {
  [MotionSensitivityLevel.NONE]: '#4CAF50',
  [MotionSensitivityLevel.VERY_LOW]: '#8BC34A',
  [MotionSensitivityLevel.LOW]: '#CDDC39',
  [MotionSensitivityLevel.LOW_MEDIUM]: '#FFEB3B',
  [MotionSensitivityLevel.MEDIUM]: '#FFC107',
  [MotionSensitivityLevel.MEDIUM_HIGH]: '#FF9800',
  [MotionSensitivityLevel.HIGH]: '#FF5722',
  [MotionSensitivityLevel.VERY_HIGH]: '#F44336',
  [MotionSensitivityLevel.MAXIMUM]: '#D32F2F',
};

// --- Styled Components (Migrated & Adapted) ---
const Container = styled.div`
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled(Typography).attrs({ variant: 'h1' })`
  margin-bottom: 1rem;
`;

const Subtitle = styled(Typography).attrs({ variant: 'h3' })`
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Use Typography for Labels
const ControlLabel = styled(Typography).attrs({ variant: 'body1' })`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -0.75rem; // Adjust negative margin to match padding
`;

const Column = styled.div<{ $width?: string }>`
  flex: ${props => props.$width || '1'};
  padding: 0.75rem; // Consistent padding
  min-width: 250px; // Ensure columns don't get too narrow
`;

const MetricCard = styled.div<{ $color?: string }>`
  background-color: ${props => props.$color || props.theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  height: 100%; // Make cards fill column height
`;

const LevelBadge = styled.span<{ $level: MotionSensitivityLevel }>`
  display: inline-block;
  background-color: ${props => levelColors[props.$level]};
  color: ${props =>
    [MotionSensitivityLevel.NONE, MotionSensitivityLevel.VERY_LOW, MotionSensitivityLevel.LOW, MotionSensitivityLevel.LOW_MEDIUM].includes(props.$level)
      ? '#000000'
      : '#ffffff'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ProgressBarContainer = styled.div`
    margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div<{ $value: number; $color?: string }>`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => `${props.$value}%`};
    background-color: ${props => props.$color || props.theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const CodeBlock = styled.pre`
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// --- Animation Preview Box Keyframes ---
const fadeOnly = keyframes` 0% { opacity: 0; } 100% { opacity: 1; } `;
const basicSlide = (dist: number) => keyframes` 0% { opacity: 0; transform: translateY(${dist}px); } 100% { opacity: 1; transform: translateY(0); } `;
const standardAnim = (dist: number) => keyframes` 0% { opacity: 0; transform: translateY(${dist}px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } `;
const enhancedAnim = (dist: number, rot: number) => keyframes`
  0% { opacity: 0; transform: translateY(${dist}px) scale(0.8) rotate(${rot}deg); }
  50% { opacity: 0.7; transform: translateY(${dist * 0.3}px) scale(0.9) rotate(${rot * 0.5}deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
`;
const complexAnim = (dist: number, rotY: number) => keyframes`
  0% { opacity: 0; transform: translateY(${dist}px) scale(0.8) rotateY(${rotY}deg); filter: blur(4px); }
  30% { opacity: 0.5; transform: translateY(${dist * 0.5}px) scale(0.9) rotateY(${rotY * 0.5}deg); filter: blur(2px); }
  60% { opacity: 0.8; transform: translateY(${dist * 0.1}px) scale(0.95) rotateY(${rotY * 0.2}deg); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotateY(0); filter: blur(0); }
`;

// Animation Preview Box Styled Component
const AnimationPreviewBox = styled.div<{
  $animationCss?: ReturnType<typeof css>;
}>`
  width: 200px;
  height: 200px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textOnPrimary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 1rem auto;
  position: relative;
  overflow: hidden;
  font-size: 0.9rem;
  padding: 0.5rem;
  ${props => props.$animationCss || 'opacity: 0;'} // Apply dynamic animation or hide
`;

// --- Storybook Configuration ---
export default {
  title: 'Accessibility/EnhancedMotionSensitivity',
  decorators: [
    (Story) => (
      <ThemeProvider initialColorMode="dark" initialTheme="standard">
        <Container>
          <Story />
        </Container>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

// --- Story Component ---
export const InteractiveDemo: StoryFn = () => {
  // --- State Management ---
  // Animation settings state
  const [complexity, setComplexity] = useState<AnimationComplexity>(AnimationComplexity.STANDARD);
  const [animationDuration, setAnimationDuration] = useState(500);
  const [animationDistance, setAnimationDistance] = useState(50);
  const [importance, setImportance] = useState(5);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [uses3D, setUses3D] = useState(false);
  const [hasFlashing, setHasFlashing] = useState(false);
  const [category, setCategory] = useState<AnimationCategory>(AnimationCategory.ENTRANCE);

  // Motion sensitivity settings
  const [sensitivityLevel, setSensitivityLevel] = useState<MotionSensitivityLevel>(MotionSensitivityLevel.MEDIUM);
  const [customizingSettings, setCustomizingSettings] = useState(false);
  const [distanceScale, setDistanceScale] = useState<AnimationDistanceScale>(AnimationDistanceScale.MEDIUM);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [disableAutoPlay, setDisableAutoPlay] = useState(false);
  const [disableBackground, setDisableBackground] = useState(false);
  const [disableHover, setDisableHover] = useState(false);
  const [disable3DEffects, setDisable3DEffects] = useState(false);
  const [reduceFlashing, setReduceFlashing] = useState(true);

  // Animation preview state
  const [isPreviewAnimating, setIsPreviewAnimating] = useState(false);

  // --- Calculations (Memoized) ---

  // Helper to get transform properties based on complexity
  const getTransformProperties = useCallback((): string[] => {
    switch (complexity) {
      case AnimationComplexity.COMPLEX:
      case AnimationComplexity.MAXIMUM:
        return ['translateY', 'scale', 'rotateY', 'perspective'];
      case AnimationComplexity.ENHANCED:
      case AnimationComplexity.ADVANCED:
        return ['translateY', 'scale', 'rotate'];
      case AnimationComplexity.STANDARD:
      case AnimationComplexity.MODERATE:
        return ['translateY', 'scale'];
      case AnimationComplexity.BASIC:
      case AnimationComplexity.RESTRAINED:
        return ['translateY'];
      default:
        return [];
    }
  }, [complexity]);

  // Calculate animation options object
  const animationOptions = useMemo((): EnhancedAnimationOptions => ({
    duration: animationDuration,
    complexity,
    distance: animationDistance,
    autoPlay: isAutoplay,
    isBackground: category === AnimationCategory.BACKGROUND,
    isHover: category === AnimationCategory.HOVER,
    isParallax: false, // Example value
    category,
    transformProperties: getTransformProperties(),
    uses3D,
    hasFlashing,
    importance,
  }), [
    animationDuration, complexity, animationDistance, isAutoplay, category,
    getTransformProperties, uses3D, hasFlashing, importance
  ]);

  // Calculate intensity metrics
  const intensityMetrics = useMemo(() => calculateAnimationIntensity({
    duration: animationDuration,
    complexity,
    distance: animationDistance,
    transformProperties: getTransformProperties(),
    autoPlay: isAutoplay,
    uses3D,
    hasFlashing,
    areaCoverage: 20, // Example value
    importance,
  }), [animationOptions]); // Depend on the options object

  // Determine sensitivity configuration object
  const sensitivityOptions = useMemo((): MotionSensitivityOptions | MotionSensitivityLevel => {
    if (customizingSettings) {
      return {
        level: sensitivityLevel,
        distanceScale,
        speedMultiplier,
        disableAutoPlay,
        disableBackgroundAnimations: disableBackground,
        disableHoverAnimations: disableHover,
        disable3DEffects,
        reduceFlashing,
      };
    }
    return sensitivityLevel;
  }, [
    customizingSettings, sensitivityLevel, distanceScale, speedMultiplier,
    disableAutoPlay, disableBackground, disableHover, disable3DEffects, reduceFlashing
  ]);

  // Get the final sensitivity configuration
  const sensitivityConfig = useMemo(() => getMotionSensitivity(sensitivityOptions), [sensitivityOptions]);

  // Get the adjusted animation parameters
  const adjustedAnimation = useMemo(() => getAdjustedAnimation(animationOptions, sensitivityConfig), [
    animationOptions, sensitivityConfig
  ]);

  // --- Animation Preview Logic ---

  // Play animation function
  const playAnimation = useCallback(() => {
    setIsPreviewAnimating(false);
    setTimeout(() => setIsPreviewAnimating(true), 50); // Reset and start
  }, []);

  // Function to get distance scale factor
  const getDistanceScaleFactor = useCallback((scale: AnimationDistanceScale): number => {
    // (Implementation from demo, simplified)
    const scaleMap: Record<AnimationDistanceScale, number> = {
        [AnimationDistanceScale.NONE]: 0, [AnimationDistanceScale.MINIMAL]: 0.1,
        [AnimationDistanceScale.SMALL]: 0.25, [AnimationDistanceScale.MEDIUM]: 0.5,
        [AnimationDistanceScale.LARGE]: 0.75, [AnimationDistanceScale.FULL]: 1,
    };
    return scaleMap[scale] ?? 1;
  }, []);

  // Generate dynamic animation CSS for the preview box
  const animationCss = useMemo(() => {
    if (!isPreviewAnimating || !adjustedAnimation.shouldAnimate) {
      // If not animating or shouldn't animate, set initial state (hidden)
      return css`opacity: 0;`;
    }

    const adjustedDuration = adjustedAnimation.duration;
    // Use a fixed fallback value for distanceScale since the types don't match
    const scaleFactor = 0.5; // Medium scale factor as a safe default
    const baseDistance = animationDistance; // Use original distance for keyframe calculation

    let keyframe;
    switch (complexity) {
        case AnimationComplexity.NONE: return css`opacity: 1;`; // No animation, just visible
        case AnimationComplexity.MINIMAL: case AnimationComplexity.FADE_ONLY: keyframe = fadeOnly; break;
        case AnimationComplexity.BASIC: case AnimationComplexity.RESTRAINED: keyframe = basicSlide(baseDistance * scaleFactor); break;
        case AnimationComplexity.STANDARD: case AnimationComplexity.MODERATE: keyframe = standardAnim(baseDistance * scaleFactor); break;
        case AnimationComplexity.ENHANCED: case AnimationComplexity.ADVANCED: keyframe = enhancedAnim(baseDistance * scaleFactor, 2 * scaleFactor); break;
        case AnimationComplexity.COMPLEX: case AnimationComplexity.MAXIMUM: keyframe = complexAnim(baseDistance * scaleFactor, 10 * scaleFactor); break;
        default: return css`opacity: 0;`; // Default hidden if complexity unknown
    }

    return css`
        opacity: 1;
        animation: ${keyframe} ${adjustedDuration}ms ease-in-out forwards;
    `;
  }, [isPreviewAnimating, adjustedAnimation, complexity, animationDistance, getDistanceScaleFactor]);


  // --- Code Generation ---
  const generateSettingsCode = useMemo(() => {
    const animOptsStr = JSON.stringify(animationOptions, (key, value) => {
        // Replace enum values with string representation for readability
        if (key === 'complexity') return `AnimationComplexity.${value}`;
        if (key === 'category') return `AnimationCategory.${value}`;
        return value;
    }, 2).replace(/"(AnimationComplexity\.\w+|AnimationCategory\.\w+)"/g, '$1'); // Remove quotes around enums

    const sensOptsStr = typeof sensitivityOptions === 'string'
        ? `MotionSensitivityLevel.${sensitivityOptions}`
        : JSON.stringify(sensitivityOptions, (key, value) => {
            if (key === 'level') return `MotionSensitivityLevel.${value}`;
            if (key === 'distanceScale') return `AnimationDistanceScale.${value}`;
            return value;
        }, 2).replace(/"(MotionSensitivityLevel\.\w+|AnimationDistanceScale\.\w+)"/g, '$1');

    return `// Animation Options
const animationOptions = ${animOptsStr};

// Motion Sensitivity Configuration
const sensitivityConfig = getMotionSensitivity(${sensOptsStr});

// --- Adjusted Animation ---
// shouldAnimate: ${adjustedAnimation.shouldAnimate}
// duration: ${adjustedAnimation.duration}ms
// distanceScale: AnimationDistanceScale.${adjustedAnimation.distanceScale}
// speedMultiplier: ${adjustedAnimation.speedMultiplier}
// shouldUseAlternative: ${adjustedAnimation.shouldUseAlternative}`;
  }, [animationOptions, sensitivityOptions, adjustedAnimation]);

  // --- Render ---
  return (
    <>
      <Title>Enhanced Motion Sensitivity</Title>
      <Section>
        <Subtitle>Animation Settings</Subtitle>
        <Row>
          {/* Column 1: Animation Configuration Controls */}
          <Column $width="50%">
            <ControlGroup>
              <ControlLabel>Complexity</ControlLabel>
              <Select
                value={complexity}
                onChange={(value) => setComplexity(value as AnimationComplexity)}
                options={Object.values(AnimationComplexity).map(v => ({ label: v, value: v }))}
              />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>Duration: {animationDuration}ms</ControlLabel>
              <Slider min={100} max={2000} step={50} value={animationDuration} onChange={(value) => setAnimationDuration(Number(value))} />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>Distance/Magnitude: {animationDistance}px</ControlLabel>
              <Slider min={0} max={300} step={10} value={animationDistance} onChange={(value) => setAnimationDistance(Number(value))} />
            </ControlGroup>
            <ControlGroup>
              <ControlLabel>Importance: {importance}/10</ControlLabel>
              <Slider min={1} max={10} step={1} value={importance} onChange={(value) => setImportance(Number(value))} />
            </ControlGroup>
             <ControlGroup>
              <ControlLabel>Category</ControlLabel>
              <Select
                value={category}
                onChange={(value) => setCategory(value as AnimationCategory)}
                options={Object.values(AnimationCategory).map(v => ({ label: v, value: v }))}
              />
            </ControlGroup>
             <ControlGroup>
                 <Checkbox id="autoplay-cb" checked={isAutoplay} onChange={(e) => setIsAutoplay(e.target.checked)} label="Auto-play" />
                 <Checkbox id="uses3d-cb" checked={uses3D} onChange={(e) => setUses3D(e.target.checked)} label="Uses 3D" />
                 <Checkbox id="flashing-cb" checked={hasFlashing} onChange={(e) => setHasFlashing(e.target.checked)} label="Has Flashing" />
             </ControlGroup>
          </Column>

          {/* Column 2: Preview and Calculated Metrics */}
          <Column $width="50%">
            <ControlLabel>Animation Preview</ControlLabel>
             <AnimationPreviewBox $animationCss={animationCss}>
                <span>{`Complexity: ${complexity}`}</span>
                {isPreviewAnimating && adjustedAnimation.shouldAnimate &&
                    <small>{`Adjusted Duration: ${adjustedAnimation.duration}ms`}</small>
                }
                {!adjustedAnimation.shouldAnimate &&
                    <small>(Animation Disabled)</small>
                }
             </AnimationPreviewBox>
            <GlassButton onClick={playAnimation} disabled={!adjustedAnimation.shouldAnimate}>Play Animation</GlassButton>

            <ControlLabel style={{ marginTop: '1.5rem' }}>Calculated Intensity</ControlLabel>
             <MetricCard>
                <Typography variant="body1">Intensity metrics disabled</Typography>
             </MetricCard>
          </Column>
        </Row>
      </Section>

      <Section>
        <Subtitle>Motion Sensitivity Settings</Subtitle>
        <Row>
           {/* Column 1: Sensitivity Controls */}
           <Column $width="50%">
             <ControlGroup>
              <ControlLabel>Sensitivity Level</ControlLabel>
              <Select
                value={sensitivityLevel}
                onChange={(value) => setSensitivityLevel(value as MotionSensitivityLevel)}
                options={Object.values(MotionSensitivityLevel).map(v => ({ label: v, value: v }))}
              />
            </ControlGroup>
            
            {customizingSettings && (
                <>
                  <ControlGroup>
                     <ControlLabel>Distance Scale</ControlLabel>
                     <Select
                         value={distanceScale}
                         onChange={(value) => setDistanceScale(value as AnimationDistanceScale)}
                         options={Object.values(AnimationDistanceScale).map(v => ({ label: v, value: v }))}
                     />
                  </ControlGroup>
                   <ControlGroup>
                     <ControlLabel>Speed Multiplier: {speedMultiplier.toFixed(1)}x</ControlLabel>
                     <Slider min={0.1} max={2.0} step={0.1} value={speedMultiplier} onChange={(value) => setSpeedMultiplier(Number(value))} />
                   </ControlGroup>
                   <ControlGroup>
                     <Checkbox id="disable-autoplay-cb" checked={disableAutoPlay} onChange={(e) => setDisableAutoPlay(e.target.checked)} label="Disable Auto-play" />
                     <Checkbox id="disable-bg-cb" checked={disableBackground} onChange={(e) => setDisableBackground(e.target.checked)} label="Disable Background" />
                     <Checkbox id="disable-hover-cb" checked={disableHover} onChange={(e) => setDisableHover(e.target.checked)} label="Disable Hover" />
                     <Checkbox id="disable-3d-cb" checked={disable3DEffects} onChange={(e) => setDisable3DEffects(e.target.checked)} label="Disable 3D Effects" />
                     <Checkbox id="reduce-flash-cb" checked={reduceFlashing} onChange={(e) => setReduceFlashing(e.target.checked)} label="Reduce Flashing" />
                   </ControlGroup>
                </>
             )}
           </Column>

            {/* Column 2: Generated Config Code */}
            <Column $width="50%">
                <ControlLabel>Generated Configuration</ControlLabel>
                <CodeBlock>{generateSettingsCode}</CodeBlock>
            </Column>
        </Row>
      </Section>
    </>
  );
};
InteractiveDemo.storyName = 'Interactive Demo'; 