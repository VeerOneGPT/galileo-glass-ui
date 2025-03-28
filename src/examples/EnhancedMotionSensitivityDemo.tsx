import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { 
  MotionSensitivityLevel, 
  AnimationComplexity,
  AnimationCategory,
  AnimationDistanceScale,
  getMotionSensitivity, 
  calculateAnimationIntensity,
  EnhancedAnimationOptions,
  MotionSensitivityOptions,
  getAdjustedAnimation
} from '../animations/accessibility/MotionSensitivity';
import { accessibleAnimation } from '../animations/accessibility/accessibleAnimation';
import { presets } from '../animations/presets';

// Motion sensitivity level colors
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

// Container for the demo
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

// Section for different parts of the demo
const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Title styling
const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

// Subtitle styling
const Subtitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #e0e0e0;
`;

// Control group for settings
const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Label for controls
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e0e0e0;
`;

// Slider control
const Slider = styled.input.attrs({ type: 'range' })`
  width: 100%;
  margin-bottom: 0.5rem;
`;

// Select dropdown
const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

// Checkbox control
const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 0.5rem;
`;

// Button styling
const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #3f51b5;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
`;

// Row for layout
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
`;

// Column for layout
const Column = styled.div<{ $width?: string }>`
  flex: ${props => props.$width || '1'};
  padding: 0.5rem;
`;

// Card for displaying metrics
const MetricCard = styled.div<{ $color?: string }>`
  background-color: ${props => props.$color || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

// Badge for level display
const LevelBadge = styled.span<{ $level: MotionSensitivityLevel }>`
  display: inline-block;
  background-color: ${props => levelColors[props.$level]};
  color: ${props => 
    props.$level === MotionSensitivityLevel.NONE || 
    props.$level === MotionSensitivityLevel.VERY_LOW || 
    props.$level === MotionSensitivityLevel.LOW ? '#000000' : '#ffffff'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
`;

// Progress bar for metrics
const ProgressBar = styled.div<{ $value: number; $color?: string }>`
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => `${props.$value}%`};
    background-color: ${props => props.$color || '#3f51b5'};
    transition: width 0.3s ease;
  }
`;

// Code display
const CodeBlock = styled.pre`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem;
  color: #e0e0e0;
`;

// Import styled-components css constructor
import { css, keyframes } from 'styled-components';

// Animation Preview Box
const AnimationPreviewBox = styled.div<{
  $animating: boolean;
  $complexity: AnimationComplexity;
  $distanceScale: number;
  $speedMultiplier: number;
}>`
  width: 200px;
  height: 200px;
  background-color: rgba(63, 81, 181, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  position: relative;
  overflow: hidden;
  
  ${props => {
    if (!props.$animating) {
      return '';
    }
    
    // Apply animation based on complexity and settings
    switch (props.$complexity) {
      case AnimationComplexity.NONE:
        return '';
      case AnimationComplexity.MINIMAL:
      case AnimationComplexity.FADE_ONLY:
        return css`
          animation: fadeOnly ${1000 * (1 / props.$speedMultiplier)}ms ease-in-out;
          @keyframes fadeOnly {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `;
      case AnimationComplexity.BASIC:
      case AnimationComplexity.RESTRAINED:
        return css`
          animation: basicSlide ${1000 * (1 / props.$speedMultiplier)}ms ease-in-out;
          @keyframes basicSlide {
            0% { opacity: 0; transform: translateY(${10 * props.$distanceScale}px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `;
      case AnimationComplexity.STANDARD:
      case AnimationComplexity.MODERATE:
        return css`
          animation: standardAnim ${1000 * (1 / props.$speedMultiplier)}ms ease-in-out;
          @keyframes standardAnim {
            0% { opacity: 0; transform: translateY(${20 * props.$distanceScale}px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `;
      case AnimationComplexity.ENHANCED:
      case AnimationComplexity.ADVANCED:
        return css`
          animation: enhancedAnim ${1200 * (1 / props.$speedMultiplier)}ms cubic-bezier(0.2, 0.8, 0.2, 1);
          @keyframes enhancedAnim {
            0% { opacity: 0; transform: translateY(${30 * props.$distanceScale}px) scale(0.8) rotate(${2 * props.$distanceScale}deg); }
            50% { opacity: 0.7; transform: translateY(${10 * props.$distanceScale}px) scale(0.9) rotate(${1 * props.$distanceScale}deg); }
            100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
          }
        `;
      case AnimationComplexity.COMPLEX:
      case AnimationComplexity.MAXIMUM:
        return css`
          animation: complexAnim ${1500 * (1 / props.$speedMultiplier)}ms cubic-bezier(0.2, 0.8, 0.2, 1);
          @keyframes complexAnim {
            0% { opacity: 0; transform: translateY(${40 * props.$distanceScale}px) scale(0.8) rotateY(${10 * props.$distanceScale}deg); filter: blur(4px); }
            30% { opacity: 0.5; transform: translateY(${20 * props.$distanceScale}px) scale(0.9) rotateY(${5 * props.$distanceScale}deg); filter: blur(2px); }
            60% { opacity: 0.8; transform: translateY(${5 * props.$distanceScale}px) scale(0.95) rotateY(${2 * props.$distanceScale}deg); filter: blur(0); }
            100% { opacity: 1; transform: translateY(0) scale(1) rotateY(0); filter: blur(0); }
          }
        `;
      default:
        return '';
    }
  }}
`;

// Define some test animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
`;

const flip = keyframes`
  0% {
    transform: perspective(400px) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateY(180deg);
  }
`;

const availableAnimations = {
  bounce,
  rotate,
  pulse,
  shake,
  flip,
  fadeIn: presets.basic.fade.keyframes,
  slideUp: presets.basic.slideUp.keyframes,
  slideDown: presets.basic.slideDown.keyframes,
  slideLeft: presets.basic.slideLeft.keyframes,
  slideRight: presets.basic.slideRight.keyframes,
  glassReveal: presets.basic.glassReveal.keyframes,
};

/**
 * Enhanced Motion Sensitivity Demo Component
 * 
 * This demo showcases the expanded motion sensitivity levels and granular control
 * options for animation accessibility.
 */
const EnhancedMotionSensitivityDemo: React.FC = () => {
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
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Get animation options
  const getAnimationOptions = (): EnhancedAnimationOptions => {
    return {
      duration: animationDuration,
      complexity,
      distance: animationDistance,
      autoPlay: isAutoplay,
      isBackground: category === AnimationCategory.BACKGROUND,
      isHover: category === AnimationCategory.HOVER,
      isParallax: false,
      category,
      transformProperties: getTransformProperties(),
      uses3D,
      hasFlashing,
      importance,
    };
  };
  
  // Get transform properties based on animation
  const getTransformProperties = (): string[] => {
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
      case AnimationComplexity.FADE_ONLY:
      case AnimationComplexity.MINIMAL:
      case AnimationComplexity.NONE:
      default:
        return [];
    }
  };
  
  // Calculate intensity metrics
  const intensityMetrics = calculateAnimationIntensity({
    duration: animationDuration,
    complexity,
    distance: animationDistance,
    transformProperties: getTransformProperties(),
    autoPlay: isAutoplay,
    uses3D,
    hasFlashing,
    areaCoverage: 20,
    importance,
  });
  
  // Get motion sensitivity configuration
  const sensitivityConfig = getMotionSensitivity(
    customizingSettings 
      ? {
          level: sensitivityLevel,
          distanceScale,
          speedMultiplier,
          disableAutoPlay,
          disableBackgroundAnimations: disableBackground,
          disableHoverAnimations: disableHover,
          disable3DEffects,
          reduceFlashing,
        } as MotionSensitivityOptions
      : sensitivityLevel
  );
  
  // Use the imported getAdjustedAnimation function
  const adjustedAnimation = getAdjustedAnimation(getAnimationOptions(), sensitivityConfig);
  
  // Play animation
  const playAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 10);
  };
  
  // Reset animation
  const stopAnimation = () => {
    setIsAnimating(false);
  };
  
  // Adjust the distance scale switch statement to use correct enum values
  const getDistanceScaleFactor = (scale: AnimationDistanceScale): number => {
    switch (scale) {
      case AnimationDistanceScale.NONE:
        return 0;
      case AnimationDistanceScale.MINIMAL:
        return 0.1;
      case AnimationDistanceScale.SMALL:
        return 0.25;
      case AnimationDistanceScale.MEDIUM:
        return 0.5;
      case AnimationDistanceScale.LARGE:
        return 0.75;
      case AnimationDistanceScale.FULL:
        return 1;
      default:
        return 1;
    }
  };
  
  // Fix the settings code generation
  const generateSettingsCode = () => {
    return `// Animation Options
const animationOptions: EnhancedAnimationOptions = {
  duration: ${animationDuration},
  complexity: AnimationComplexity.${complexity},
  distance: ${animationDistance},
  autoPlay: ${isAutoplay},
  category: AnimationCategory.${category},
  uses3D: ${uses3D},
  hasFlashing: ${hasFlashing},
  importance: ${importance},
};

// Motion Sensitivity Configuration
const sensitivityConfig = getMotionSensitivity(${
  customizingSettings 
    ? `{
  level: MotionSensitivityLevel.${sensitivityLevel},
  distanceScale: AnimationDistanceScale.${distanceScale},
  speedMultiplier: ${speedMultiplier},
  disableAutoPlay: ${disableAutoPlay},
  disableBackgroundAnimations: ${disableBackground},
  disableHoverAnimations: ${disableHover},
  disable3DEffects: ${disable3DEffects},
  reduceFlashing: ${reduceFlashing},
}`
    : `MotionSensitivityLevel.${sensitivityLevel}`
});

// Animation will run for ${adjustedAnimation.duration}ms
// Should animate: ${adjustedAnimation.shouldAnimate}
// Distance scale: ${adjustedAnimation.distanceScale}
// Speed multiplier: ${adjustedAnimation.speedMultiplier}
// Use alternative: ${adjustedAnimation.shouldUseAlternative}`;
  };
  
  return (
    <Container>
      <Title>Enhanced Motion Sensitivity Demo</Title>
      
      <Section>
        <Subtitle>Animation Settings</Subtitle>
        <Row>
          <Column $width="60%">
            <ControlGroup>
              <Label>Animation Complexity</Label>
              <Select 
                value={complexity}
                onChange={e => setComplexity(e.target.value as AnimationComplexity)}
              >
                {Object.values(AnimationComplexity).map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </ControlGroup>
            
            <ControlGroup>
              <Label>Duration: {animationDuration}ms</Label>
              <Slider
                min={100}
                max={2000}
                step={100}
                value={animationDuration}
                onChange={e => setAnimationDuration(parseInt(e.target.value))}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>Distance/Magnitude: {animationDistance}px</Label>
              <Slider
                min={10}
                max={300}
                step={10}
                value={animationDistance}
                onChange={e => setAnimationDistance(parseInt(e.target.value))}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>Importance: {importance}/10</Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={importance}
                onChange={e => setImportance(parseInt(e.target.value))}
              />
            </ControlGroup>
            
            <ControlGroup>
              <Label>Animation Category</Label>
              <Select 
                value={category}
                onChange={e => setCategory(e.target.value as AnimationCategory)}
              >
                {Object.values(AnimationCategory).map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                <Checkbox 
                  checked={isAutoplay}
                  onChange={e => setIsAutoplay(e.target.checked)}
                />
                Auto-play Animation
              </Label>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                <Checkbox 
                  checked={uses3D}
                  onChange={e => setUses3D(e.target.checked)}
                />
                Uses 3D Transforms
              </Label>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                <Checkbox 
                  checked={hasFlashing}
                  onChange={e => setHasFlashing(e.target.checked)}
                />
                Has Flashing Content
              </Label>
            </ControlGroup>
          </Column>
          
          <Column $width="40%">
            <Subtitle>Animation Preview</Subtitle>
            <AnimationPreviewBox
              $animating={isAnimating}
              $complexity={complexity}
              $distanceScale={getDistanceScaleFactor(distanceScale)}
              $speedMultiplier={speedMultiplier}
            >
              <div>
                {isAnimating ? `AnimationComplexity.${complexity}` : "Click Play Animation"}
              </div>
            </AnimationPreviewBox>
            
            <Button onClick={playAnimation} disabled={!adjustedAnimation.shouldAnimate}>
              Play Animation
            </Button>
            <Button onClick={stopAnimation}>
              Stop Animation
            </Button>
            
            {!adjustedAnimation.shouldAnimate && (
              <div style={{ color: '#ff9800', marginTop: '0.5rem' }}>
                Animation disabled based on current sensitivity settings
              </div>
            )}
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Motion Sensitivity Settings</Subtitle>
        <Row>
          <Column $width="60%">
            <ControlGroup>
              <Label>Sensitivity Level</Label>
              <Select 
                value={sensitivityLevel}
                onChange={e => setSensitivityLevel(e.target.value as MotionSensitivityLevel)}
              >
                {Object.values(MotionSensitivityLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Select>
            </ControlGroup>
            
            <ControlGroup>
              <Label>
                <Checkbox 
                  checked={customizingSettings}
                  onChange={e => setCustomizingSettings(e.target.checked)}
                />
                Customize Settings
              </Label>
            </ControlGroup>
            
            {customizingSettings && (
              <>
                <ControlGroup>
                  <Label>Distance Scale</Label>
                  <Select 
                    value={distanceScale}
                    onChange={e => setDistanceScale(e.target.value as AnimationDistanceScale)}
                  >
                    {Object.values(AnimationDistanceScale).map(scale => (
                      <option key={scale} value={scale}>{scale}</option>
                    ))}
                  </Select>
                </ControlGroup>
                
                <ControlGroup>
                  <Label>Speed Multiplier: {speedMultiplier.toFixed(1)}</Label>
                  <Slider
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={speedMultiplier}
                    onChange={e => setSpeedMultiplier(parseFloat(e.target.value))}
                  />
                </ControlGroup>
                
                <ControlGroup>
                  <Label>
                    <Checkbox 
                      checked={disableAutoPlay}
                      onChange={e => setDisableAutoPlay(e.target.checked)}
                    />
                    Disable Auto-play Animations
                  </Label>
                </ControlGroup>
                
                <ControlGroup>
                  <Label>
                    <Checkbox 
                      checked={disableBackground}
                      onChange={e => setDisableBackground(e.target.checked)}
                    />
                    Disable Background Animations
                  </Label>
                </ControlGroup>
                
                <ControlGroup>
                  <Label>
                    <Checkbox 
                      checked={disableHover}
                      onChange={e => setDisableHover(e.target.checked)}
                    />
                    Disable Hover Animations
                  </Label>
                </ControlGroup>
                
                <ControlGroup>
                  <Label>
                    <Checkbox 
                      checked={disable3DEffects}
                      onChange={e => setDisable3DEffects(e.target.checked)}
                    />
                    Disable 3D Effects
                  </Label>
                </ControlGroup>
                
                <ControlGroup>
                  <Label>
                    <Checkbox 
                      checked={reduceFlashing}
                      onChange={e => setReduceFlashing(e.target.checked)}
                    />
                    Reduce Flashing
                  </Label>
                </ControlGroup>
              </>
            )}
          </Column>
          
          <Column $width="40%">
            <Subtitle>Generated Configuration</Subtitle>
            <CodeBlock>
              {generateSettingsCode()}
            </CodeBlock>
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Animation Intensity Analysis</Subtitle>
        <Row>
          <Column $width="60%">
            <MetricCard>
              <Label>Overall Intensity: {intensityMetrics.intensity.toFixed(1)}/100</Label>
              <ProgressBar 
                $value={intensityMetrics.intensity} 
                $color={levelColors[intensityMetrics.recommendedLevel]}
              />
              
              <Label>Motion Intensity: {intensityMetrics.motionIntensity.toFixed(1)}/100</Label>
              <ProgressBar $value={intensityMetrics.motionIntensity} $color="#3f51b5" />
              
              <Label>Duration Intensity: {intensityMetrics.durationIntensity.toFixed(1)}/100</Label>
              <ProgressBar $value={intensityMetrics.durationIntensity} $color="#9c27b0" />
              
              <Label>Visual Complexity: {intensityMetrics.visualComplexity.toFixed(1)}/100</Label>
              <ProgressBar $value={intensityMetrics.visualComplexity} $color="#009688" />
              
              <Label>User Impact: {intensityMetrics.userImpact.toFixed(1)}/100</Label>
              <ProgressBar $value={intensityMetrics.userImpact} $color="#ff5722" />
            </MetricCard>
          </Column>
          
          <Column $width="40%">
            <MetricCard $color={`${levelColors[intensityMetrics.recommendedLevel]}20`}>
              <Label>Recommended Sensitivity Level:</Label>
              <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                <LevelBadge $level={intensityMetrics.recommendedLevel}>
                  {intensityMetrics.recommendedLevel}
                </LevelBadge>
              </div>
              
              <Label>Analysis:</Label>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                {intensityMetrics.analysis.has3DTransforms && (
                  <li>Uses 3D transforms</li>
                )}
                {intensityMetrics.analysis.hasRapidMovement && (
                  <li>Has rapid movement</li>
                )}
                {intensityMetrics.analysis.hasFlashing && (
                  <li>Contains flashing elements</li>
                )}
                {intensityMetrics.analysis.hasLargeArea && (
                  <li>Covers a large screen area</li>
                )}
                {intensityMetrics.analysis.hasComplexTransforms && (
                  <li>Uses complex transforms</li>
                )}
                {intensityMetrics.analysis.hasLongDuration && (
                  <li>Has long duration</li>
                )}
                {Object.values(intensityMetrics.analysis).every(value => !value) && (
                  <li>No significant motion concerns detected</li>
                )}
              </ul>
            </MetricCard>
            
            <MetricCard>
              <Label>Current vs. Recommended</Label>
              <div style={{ marginTop: '0.5rem' }}>
                <div>
                  Current: <LevelBadge $level={sensitivityLevel}>{sensitivityLevel}</LevelBadge>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  Recommended: <LevelBadge $level={intensityMetrics.recommendedLevel}>{intensityMetrics.recommendedLevel}</LevelBadge>
                </div>
              </div>
            </MetricCard>
          </Column>
        </Row>
      </Section>
    </Container>
  );
};

export default EnhancedMotionSensitivityDemo;