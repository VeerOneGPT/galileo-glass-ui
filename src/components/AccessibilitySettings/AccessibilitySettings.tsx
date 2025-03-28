/**
 * AccessibilitySettings Component
 * 
 * A comprehensive settings component that allows users to personalize their
 * motion preferences and other accessibility options.
 */
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

import { 
  MotionSensitivityLevel, 
  AnimationComplexity,
  AnimationCategory,
  AnimationDistanceScale 
} from '../../animations/accessibility/MotionSensitivity';
import { 
  AnimationSpeedPreference,
  DurationAdjustmentMode,
  getSpeedController
} from '../../animations/accessibility/AnimationSpeedController';
import { MotionIntensityLevel } from '../../animations/accessibility/MotionIntensityProfiler';
import { AlternativeType, getAlternativesRegistry } from '../../animations/accessibility/ReducedMotionAlternatives';
import { useAccessibility } from '../AccessibilityProvider';

// Settings panel container with glass effect
const SettingsContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: ${props => props.theme.colors.text};
`;

const SettingsHeader = styled.div`
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 16px;
`;

const SettingsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const SettingsDescription = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
`;

const SettingsSectionHeader = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 24px 0 16px 0;
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-left: 16px;
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.label`
  flex-grow: 1;
`;

const SettingTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const Button = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 16px;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &.primary {
    background-color: ${props => props.theme.colors.primary + '33'};
    border-color: ${props => props.theme.colors.primary + '66'};
    
    &:hover {
      background-color: ${props => props.theme.colors.primary + '4D'};
    }
  }
`;

const Select = styled.select`
  background-color: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: ${props => props.theme.colors.text};
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary + '33'};
  }
`;

const Toggle = styled.div`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.1);
    transition: 0.3s;
    border-radius: 34px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: ${props => props.theme.colors.primary + '66'};
    border-color: ${props => props.theme.colors.primary};
  }
  
  input:checked + .slider:before {
    transform: translateX(22px);
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 16px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  opacity: ${props => props.$active ? '1' : '0.6'};
  position: relative;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.theme.colors.primary};
    opacity: ${props => props.$active ? '1' : '0'};
    transition: opacity 0.2s ease;
  }
  
  &:hover {
    opacity: 1;
  }
`;

const CategorySettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
`;

const CategorySettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  
  .category-name {
    font-weight: 500;
  }
`;

/**
 * Access level for settings - used to determine which settings to show
 */
enum SettingsAccessLevel {
  /** Basic settings only */
  BASIC = 'basic',
  /** Advanced options visible */
  ADVANCED = 'advanced',
  /** Developer options visible */
  DEVELOPER = 'developer',
}

/**
 * AccessibilitySettings component props
 */
export interface AccessibilitySettingsProps {
  /** Initial access level for settings */
  initialAccessLevel?: SettingsAccessLevel;
  /** Whether to auto-save settings changes */
  autoSave?: boolean;
  /** Callback when settings are saved */
  onSave?: (settings: any) => void;
  /** Callback when settings are reset */
  onReset?: () => void;
  /** Callback when settings are changed */
  onChange?: (settings: any) => void;
  /** Callback when settings panel is closed */
  onClose?: () => void;
}

/**
 * AccessibilitySettings component
 * Provides a comprehensive UI for controlling all accessibility features
 */
export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  initialAccessLevel = SettingsAccessLevel.BASIC,
  autoSave = true,
  onSave,
  onReset,
  onChange,
  onClose,
}) => {
  // Get accessibility context
  const accessibility = useAccessibility();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('general');
  
  // Access level state
  const [accessLevel, setAccessLevel] = useState<SettingsAccessLevel>(initialAccessLevel);
  
  // Get speed controller
  const speedController = getSpeedController();
  const [speedSettings, setSpeedSettings] = useState(speedController.getConfig());
  
  // Initialize category-specific settings
  const [categorySettings, setCategorySettings] = useState<Record<AnimationCategory, any>>({
    [AnimationCategory.ENTRANCE]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.EXIT]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.HOVER]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.FOCUS]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.ACTIVE]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.LOADING]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.BACKGROUND]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.SCROLL]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.ATTENTION]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
    [AnimationCategory.ESSENTIAL]: { 
      speed: AnimationSpeedPreference.NORMAL, 
      enabled: true 
    },
  });
  
  // Initialize settings from current configuration
  useEffect(() => {
    // Initialize category settings from speed controller config
    if (speedSettings.categoryPreferences) {
      const updatedCategorySettings = { ...categorySettings };
      
      Object.entries(speedSettings.categoryPreferences).forEach(([category, preference]) => {
        if (updatedCategorySettings[category as AnimationCategory]) {
          updatedCategorySettings[category as AnimationCategory].speed = preference;
        }
      });
      
      setCategorySettings(updatedCategorySettings);
    }
  }, []);
  
  // Add listener to speed controller for changes
  useEffect(() => {
    const unsubscribe = speedController.addListener((newConfig) => {
      setSpeedSettings(newConfig);
    });
    
    return unsubscribe;
  }, [speedController]);
  
  // Handle saving settings
  const handleSave = useCallback(() => {
    // Update speed controller with current settings
    speedController.updateConfig(speedSettings);
    
    // Call onSave callback if provided
    if (onSave) {
      onSave({
        accessibility: {
          reducedMotion: accessibility.reducedMotion,
          highContrast: accessibility.highContrast,
          reduceTransparency: accessibility.reduceTransparency,
          disableAnimations: accessibility.disableAnimations,
          fontScale: accessibility.fontScale,
          enhancedFocus: accessibility.enhancedFocus,
          screenReaderSupport: accessibility.screenReaderSupport,
          keyboardNavigation: accessibility.keyboardNavigation,
        },
        speed: speedSettings,
        categorySettings,
      });
    }
  }, [accessibility, speedSettings, categorySettings, onSave, speedController]);
  
  // Auto-save when settings change if enabled
  useEffect(() => {
    if (autoSave) {
      handleSave();
    }
  }, [accessibility, speedSettings, categorySettings, autoSave, handleSave]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    // Reset accessibility context
    accessibility.setReducedMotion(false);
    accessibility.setHighContrast(false);
    accessibility.setReduceTransparency(false);
    accessibility.setDisableAnimations(false);
    accessibility.setFontScale(1);
    accessibility.setEnhancedFocus(true);
    accessibility.setScreenReaderSupport(true);
    accessibility.setKeyboardNavigation(true);
    
    // Reset speed controller
    speedController.resetAllPreferences();
    
    // Call onReset callback if provided
    if (onReset) {
      onReset();
    }
  }, [accessibility, onReset, speedController]);
  
  // Update category speed preference
  const handleCategorySpeedChange = useCallback((category: AnimationCategory, preference: AnimationSpeedPreference) => {
    setCategorySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        speed: preference,
      },
    }));
    
    // Update speed controller
    speedController.setCategorySpeedPreference(category, preference);
  }, [speedController]);
  
  // Update category enabled state
  const handleCategoryEnabledChange = useCallback((category: AnimationCategory, enabled: boolean) => {
    setCategorySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled,
      },
    }));
  }, []);
  
  // Update global speed preference
  const handleGlobalSpeedChange = useCallback((preference: AnimationSpeedPreference) => {
    setSpeedSettings(prev => ({
      ...prev,
      globalSpeedPreference: preference,
    }));
    
    // Update speed controller
    speedController.setGlobalSpeedPreference(preference);
  }, [speedController]);
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>Accessibility & Motion Settings</SettingsTitle>
        <SettingsDescription>
          Customize animation behavior, appearance, and accessibility features to match your preferences.
        </SettingsDescription>
      </SettingsHeader>
      
      <Tabs>
        <Tab 
          $active={activeTab === 'general'} 
          onClick={() => setActiveTab('general')}
        >
          General
        </Tab>
        <Tab 
          $active={activeTab === 'motion'} 
          onClick={() => setActiveTab('motion')}
        >
          Motion
        </Tab>
        <Tab 
          $active={activeTab === 'categories'} 
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </Tab>
        {accessLevel !== SettingsAccessLevel.BASIC && (
          <Tab 
            $active={activeTab === 'advanced'} 
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </Tab>
        )}
      </Tabs>
      
      {activeTab === 'general' && (
        <>
          <SettingsSectionHeader>General Accessibility</SettingsSectionHeader>
          
          <SettingRow>
            <SettingLabel htmlFor="reducedMotion">
              <SettingTitle>Reduced Motion</SettingTitle>
              <SettingDescription>
                Minimize or eliminate animation effects that can cause discomfort.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="reducedMotion"
                type="checkbox" 
                checked={accessibility.reducedMotion} 
                onChange={(e) => accessibility.setReducedMotion(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="disableAnimations">
              <SettingTitle>Disable All Animations</SettingTitle>
              <SettingDescription>
                Turn off all animations completely.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="disableAnimations"
                type="checkbox" 
                checked={accessibility.disableAnimations} 
                onChange={(e) => accessibility.setDisableAnimations(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="highContrast">
              <SettingTitle>High Contrast</SettingTitle>
              <SettingDescription>
                Increase contrast for better readability.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="highContrast"
                type="checkbox" 
                checked={accessibility.highContrast} 
                onChange={(e) => accessibility.setHighContrast(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="reduceTransparency">
              <SettingTitle>Reduce Transparency</SettingTitle>
              <SettingDescription>
                Decrease transparent effects for better visibility.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="reduceTransparency"
                type="checkbox" 
                checked={accessibility.reduceTransparency} 
                onChange={(e) => accessibility.setReduceTransparency(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="fontScale">
              <SettingTitle>Font Size</SettingTitle>
              <SettingDescription>
                Adjust text size for better readability.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="fontScale"
              value={accessibility.fontScale}
              onChange={(e) => accessibility.setFontScale(parseFloat(e.target.value))}
            >
              <option value="0.75">Very Small</option>
              <option value="0.9">Small</option>
              <option value="1">Normal</option>
              <option value="1.15">Large</option>
              <option value="1.3">Very Large</option>
              <option value="1.5">Extra Large</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="enhancedFocus">
              <SettingTitle>Enhanced Focus Indicators</SettingTitle>
              <SettingDescription>
                Make focus outlines more visible for keyboard navigation.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="enhancedFocus"
                type="checkbox" 
                checked={accessibility.enhancedFocus} 
                onChange={(e) => accessibility.setEnhancedFocus(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="keyboardNavigation">
              <SettingTitle>Keyboard Navigation Indicators</SettingTitle>
              <SettingDescription>
                Show additional visual cues for keyboard navigation.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="keyboardNavigation"
                type="checkbox" 
                checked={accessibility.keyboardNavigation} 
                onChange={(e) => accessibility.setKeyboardNavigation(e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
        </>
      )}
      
      {activeTab === 'motion' && (
        <>
          <SettingsSectionHeader>Motion Preferences</SettingsSectionHeader>
          
          <SettingRow>
            <SettingLabel htmlFor="motionSensitivity">
              <SettingTitle>Motion Sensitivity Level</SettingTitle>
              <SettingDescription>
                Set your sensitivity to motion and animations.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="motionSensitivity"
              value={accessibility.reducedMotion ? MotionSensitivityLevel.MEDIUM : MotionSensitivityLevel.NONE}
              onChange={(e) => {
                // Set reduced motion based on sensitivity level
                accessibility.setReducedMotion(e.target.value !== MotionSensitivityLevel.NONE);
                // Set disable animations for maximum level
                accessibility.setDisableAnimations(e.target.value === MotionSensitivityLevel.MAXIMUM);
              }}
            >
              <option value={MotionSensitivityLevel.NONE}>None - Full animations</option>
              <option value={MotionSensitivityLevel.VERY_LOW}>Very Low - Limit extreme effects</option>
              <option value={MotionSensitivityLevel.LOW}>Low - Moderate reduction</option>
              <option value={MotionSensitivityLevel.MEDIUM}>Medium - Significant reduction</option>
              <option value={MotionSensitivityLevel.HIGH}>High - Minimal animation</option>
              <option value={MotionSensitivityLevel.MAXIMUM}>Maximum - No animation</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="animationSpeed">
              <SettingTitle>Animation Speed</SettingTitle>
              <SettingDescription>
                Control how fast animations play.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="animationSpeed"
              value={speedSettings.globalSpeedPreference}
              onChange={(e) => handleGlobalSpeedChange(e.target.value as AnimationSpeedPreference)}
            >
              <option value={AnimationSpeedPreference.SLOWER}>Slower (1.5x duration)</option>
              <option value={AnimationSpeedPreference.SLIGHTLY_SLOWER}>Slightly Slower (1.25x)</option>
              <option value={AnimationSpeedPreference.NORMAL}>Normal Speed</option>
              <option value={AnimationSpeedPreference.SLIGHTLY_FASTER}>Slightly Faster (0.75x)</option>
              <option value={AnimationSpeedPreference.FASTER}>Faster (0.5x)</option>
              <option value={AnimationSpeedPreference.VERY_FAST}>Very Fast (0.25x)</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="animationDistance">
              <SettingTitle>Animation Distance</SettingTitle>
              <SettingDescription>
                Control how far elements move during animations.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="animationDistance"
              // This would typically connect to the motion sensitivity config
              defaultValue={AnimationDistanceScale.FULL}
            >
              <option value={AnimationDistanceScale.FULL}>Full Distance</option>
              <option value={AnimationDistanceScale.LARGE}>Large (75%)</option>
              <option value={AnimationDistanceScale.MEDIUM}>Medium (50%)</option>
              <option value={AnimationDistanceScale.SMALL}>Small (25%)</option>
              <option value={AnimationDistanceScale.MINIMAL}>Minimal (10%)</option>
              <option value={AnimationDistanceScale.NONE}>None (0%)</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="backgroundAnimations">
              <SettingTitle>Background Animations</SettingTitle>
              <SettingDescription>
                Enable or disable decorative background animations.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="backgroundAnimations"
                type="checkbox" 
                checked={categorySettings[AnimationCategory.BACKGROUND].enabled} 
                onChange={(e) => handleCategoryEnabledChange(AnimationCategory.BACKGROUND, e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="loadingAnimations">
              <SettingTitle>Loading Animations</SettingTitle>
              <SettingDescription>
                Control animations for loading indicators.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="loadingAnimations"
              value={categorySettings[AnimationCategory.LOADING].speed}
              onChange={(e) => handleCategorySpeedChange(AnimationCategory.LOADING, e.target.value as AnimationSpeedPreference)}
            >
              <option value={AnimationSpeedPreference.SLOWER}>Slower</option>
              <option value={AnimationSpeedPreference.NORMAL}>Normal</option>
              <option value={AnimationSpeedPreference.FASTER}>Faster</option>
              <option value={AnimationSpeedPreference.VERY_FAST}>Very Fast</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="hoverAnimations">
              <SettingTitle>Hover Effect Animations</SettingTitle>
              <SettingDescription>
                Control animations when hovering over interactive elements.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="hoverAnimations"
                type="checkbox" 
                checked={categorySettings[AnimationCategory.HOVER].enabled} 
                onChange={(e) => handleCategoryEnabledChange(AnimationCategory.HOVER, e.target.checked)}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
        </>
      )}
      
      {activeTab === 'categories' && (
        <>
          <SettingsSectionHeader>Animation Categories</SettingsSectionHeader>
          <SettingDescription style={{ marginBottom: '16px' }}>
            Fine-tune animation settings for different types of animations.
          </SettingDescription>
          
          <CategorySettingsGrid>
            {/* Entrance Animations */}
            <CategorySettingItem>
              <div className="category-name">Entrance</div>
              <Select
                value={categorySettings[AnimationCategory.ENTRANCE].speed}
                onChange={(e) => handleCategorySpeedChange(AnimationCategory.ENTRANCE, e.target.value as AnimationSpeedPreference)}
              >
                <option value={AnimationSpeedPreference.NORMAL}>Normal</option>
                <option value={AnimationSpeedPreference.SLIGHTLY_FASTER}>Faster</option>
                <option value={AnimationSpeedPreference.SLIGHTLY_SLOWER}>Slower</option>
              </Select>
            </CategorySettingItem>
            
            {/* Exit Animations */}
            <CategorySettingItem>
              <div className="category-name">Exit</div>
              <Select
                value={categorySettings[AnimationCategory.EXIT].speed}
                onChange={(e) => handleCategorySpeedChange(AnimationCategory.EXIT, e.target.value as AnimationSpeedPreference)}
              >
                <option value={AnimationSpeedPreference.NORMAL}>Normal</option>
                <option value={AnimationSpeedPreference.SLIGHTLY_FASTER}>Faster</option>
                <option value={AnimationSpeedPreference.SLIGHTLY_SLOWER}>Slower</option>
              </Select>
            </CategorySettingItem>
            
            {/* Hover Animations */}
            <CategorySettingItem>
              <div className="category-name">Hover</div>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={categorySettings[AnimationCategory.HOVER].enabled} 
                  onChange={(e) => handleCategoryEnabledChange(AnimationCategory.HOVER, e.target.checked)}
                />
                <span className="slider"></span>
              </Toggle>
            </CategorySettingItem>
            
            {/* Focus Animations */}
            <CategorySettingItem>
              <div className="category-name">Focus</div>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={categorySettings[AnimationCategory.FOCUS].enabled} 
                  onChange={(e) => handleCategoryEnabledChange(AnimationCategory.FOCUS, e.target.checked)}
                />
                <span className="slider"></span>
              </Toggle>
            </CategorySettingItem>
            
            {/* Loading Animations */}
            <CategorySettingItem>
              <div className="category-name">Loading</div>
              <Select
                value={categorySettings[AnimationCategory.LOADING].speed}
                onChange={(e) => handleCategorySpeedChange(AnimationCategory.LOADING, e.target.value as AnimationSpeedPreference)}
              >
                <option value={AnimationSpeedPreference.NORMAL}>Normal</option>
                <option value={AnimationSpeedPreference.SLIGHTLY_FASTER}>Faster</option>
                <option value={AnimationSpeedPreference.FASTER}>Very Fast</option>
              </Select>
            </CategorySettingItem>
            
            {/* Background Animations */}
            <CategorySettingItem>
              <div className="category-name">Background</div>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={categorySettings[AnimationCategory.BACKGROUND].enabled} 
                  onChange={(e) => handleCategoryEnabledChange(AnimationCategory.BACKGROUND, e.target.checked)}
                />
                <span className="slider"></span>
              </Toggle>
            </CategorySettingItem>
            
            {/* Scroll Animations */}
            <CategorySettingItem>
              <div className="category-name">Scroll</div>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={categorySettings[AnimationCategory.SCROLL].enabled} 
                  onChange={(e) => handleCategoryEnabledChange(AnimationCategory.SCROLL, e.target.checked)}
                />
                <span className="slider"></span>
              </Toggle>
            </CategorySettingItem>
            
            {/* Attention Animations */}
            <CategorySettingItem>
              <div className="category-name">Attention</div>
              <Toggle>
                <input 
                  type="checkbox" 
                  checked={categorySettings[AnimationCategory.ATTENTION].enabled} 
                  onChange={(e) => handleCategoryEnabledChange(AnimationCategory.ATTENTION, e.target.checked)}
                />
                <span className="slider"></span>
              </Toggle>
            </CategorySettingItem>
          </CategorySettingsGrid>
        </>
      )}
      
      {activeTab === 'advanced' && accessLevel !== SettingsAccessLevel.BASIC && (
        <>
          <SettingsSectionHeader>Advanced Settings</SettingsSectionHeader>
          
          <SettingRow>
            <SettingLabel htmlFor="adjustmentMode">
              <SettingTitle>Duration Adjustment Mode</SettingTitle>
              <SettingDescription>
                How animation durations are modified.
              </SettingDescription>
            </SettingLabel>
            <Select
              id="adjustmentMode"
              value={speedSettings.adjustmentMode}
              onChange={(e) => setSpeedSettings(prev => ({
                ...prev,
                adjustmentMode: e.target.value as DurationAdjustmentMode,
              }))}
            >
              <option value={DurationAdjustmentMode.MULTIPLY}>Multiply</option>
              <option value={DurationAdjustmentMode.ADD}>Add/Subtract</option>
              <option value={DurationAdjustmentMode.MAX}>Maximum</option>
              <option value={DurationAdjustmentMode.MIN}>Minimum</option>
              <option value={DurationAdjustmentMode.FIXED}>Fixed</option>
            </Select>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel htmlFor="smartDurationScaling">
              <SettingTitle>Smart Duration Scaling</SettingTitle>
              <SettingDescription>
                Apply different scaling to short vs. long animations.
              </SettingDescription>
            </SettingLabel>
            <Toggle>
              <input 
                id="smartDurationScaling"
                type="checkbox" 
                checked={speedSettings.smartDurationScaling} 
                onChange={(e) => setSpeedSettings(prev => ({
                  ...prev,
                  smartDurationScaling: e.target.checked,
                }))}
              />
              <span className="slider"></span>
            </Toggle>
          </SettingRow>
          
          {accessLevel === SettingsAccessLevel.DEVELOPER && (
            <>
              <SettingRow>
                <SettingLabel htmlFor="adjustmentValue">
                  <SettingTitle>Adjustment Value</SettingTitle>
                  <SettingDescription>
                    Value used for the selected adjustment mode.
                  </SettingDescription>
                </SettingLabel>
                <input 
                  id="adjustmentValue"
                  type="number" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={speedSettings.adjustmentValue || 1.0}
                  onChange={(e) => setSpeedSettings(prev => ({
                    ...prev,
                    adjustmentValue: parseFloat(e.target.value),
                  }))}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'inherit',
                    width: '100px',
                  }}
                />
              </SettingRow>
              
              <SettingsSectionHeader>Developer Options</SettingsSectionHeader>
              
              <SettingRow>
                <SettingLabel>
                  <SettingTitle>Access Level</SettingTitle>
                  <SettingDescription>
                    Control which settings are visible.
                  </SettingDescription>
                </SettingLabel>
                <Select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as SettingsAccessLevel)}
                >
                  <option value={SettingsAccessLevel.BASIC}>Basic</option>
                  <option value={SettingsAccessLevel.ADVANCED}>Advanced</option>
                  <option value={SettingsAccessLevel.DEVELOPER}>Developer</option>
                </Select>
              </SettingRow>
            </>
          )}
        </>
      )}
      
      <ButtonGroup>
        <Button onClick={handleReset}>Reset to Defaults</Button>
        {!autoSave && (
          <Button className="primary" onClick={handleSave}>Save Settings</Button>
        )}
        {onClose && (
          <Button onClick={onClose}>Close</Button>
        )}
      </ButtonGroup>
    </SettingsContainer>
  );
};

export default AccessibilitySettings;