import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import styled, { keyframes, css } from "styled-components";
import { glassSurface } from "../../core/mixins/glassSurface";
import { createThemeContext } from "../../core/themeContext";
import { useAccessibilitySettings } from "../../hooks/useAccessibilitySettings";
import { usePhysicsAnimation, PhysicsAnimationProps } from "../../components/DataChart/hooks/usePhysicsAnimation";

// Animations
const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const glowEffect = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(var(--glass-primary-rgb), 0.3); }
  50% { box-shadow: 0 0 15px rgba(var(--glass-primary-rgb), 0.6); }
`;

// Tab Container
const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Tab List Styled Component
const TabList = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.03)
    );
    pointer-events: none;
  }
`;

// Tab Button Styled Component
const TabButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 
    'rgba(var(--glass-primary-rgb), 0.2)' : 
    'transparent'
  };
  backdrop-filter: ${props => props.$isActive ? 'blur(10px)' : 'none'};
  color: ${props => props.$isActive ? 
    'rgba(var(--glass-primary-rgb), 1)' : 
    'rgba(255, 255, 255, 0.7)'
  };
  border: 1px solid ${props => props.$isActive ? 
    'rgba(var(--glass-primary-rgb), 0.3)' : 
    'transparent'
  };
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  flex: 1;
  text-align: center;
  
  /* Glow effect when active */
  ${props => props.$isActive && css`
    animation: ${glowEffect} 3s infinite ease-in-out;
  `}
  
  /* Hover effect */
  &:hover {
    background: ${props => props.$isActive ? 
      'rgba(var(--glass-primary-rgb), 0.25)' : 
      'rgba(255, 255, 255, 0.05)'
    };
    color: ${props => props.$isActive ? 
      'rgba(var(--glass-primary-rgb), 1)' : 
      'rgba(255, 255, 255, 0.9)'
    };
  }
  
  /* Active/pressed state */
  &:active {
    transform: translateY(1px);
  }
  
  /* Glass shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -50%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s;
    pointer-events: none;
  }
  
  &:hover::before {
    transform: translateX(100%);
  }
`;

// Tab Panel Styled Component
const TabPanel = styled.div<{ $isActive: boolean }>`
  display: ${props => props.$isActive ? 'block' : 'none'};
  animation: ${props => props.$isActive ? css`${slideIn} 0.3s ease-out forwards` : 'none'};
  padding: 1px; /* Prevents margin collapse */
`;

// Indicator for active tab (animated)
const ActiveIndicator = styled.div<{ style?: React.CSSProperties }>`
  position: absolute;
  bottom: 4px;
  height: 3px;
  background: rgba(var(--glass-primary-rgb), 0.8);
  border-radius: 1.5px;
  left: ${props => props.style?.left};
  width: ${props => props.style?.width};
  transform: ${props => props.style?.transform};
  box-shadow: 0 0 8px rgba(var(--glass-primary-rgb), 0.6);
  opacity: 0.8;
`;

export interface GlassTabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface GlassTabsProps {
  /** Array of tab items */
  tabs: GlassTabItem[];
  /** Default active tab ID */
  defaultTab?: string;
  /** Callback when tab changes */
  onChange?: (tabId: string) => void;
  /** Additional className */
  className?: string;
  /** Physics configuration for the active indicator animation */
  physics?: Partial<PhysicsAnimationProps>;
}

// Ref interface
export interface GlassTabsRef {
  /** Gets the main tabs container DOM element */
  getContainerElement: () => HTMLDivElement | null;
  /** Gets the tab list container DOM element */
  getTabListElement: () => HTMLDivElement | null;
  /** Programmatically sets the active tab */
  setActiveTab: (tabId: string) => void;
  /** Gets the ID of the currently active tab */
  getActiveTab: () => string;
}

/**
 * GlassTabs Component
 * 
 * A tabbed interface with glass styling and animated indicator.
 * Features interactive hover effects and smooth transitions.
 */
// Convert component to use forwardRef
export const GlassTabs = forwardRef<GlassTabsRef, GlassTabsProps>(({ 
  tabs, 
  defaultTab, 
  onChange,
  className = '',
  physics
}, ref) => { // Add ref parameter
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ''));
  const { isReducedMotion } = useAccessibilitySettings();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the root container
  
  // State to hold the target indicator style
  const [targetIndicatorStyle, setTargetIndicatorStyle] = useState({ left: 0, width: 0 });

  // --- Refactored Physics Animation for Indicator ---
  const physicsConfig: Partial<PhysicsAnimationProps> = {
    stiffness: physics?.stiffness ?? 500, // Map from potential tension/friction if needed, or use direct props
    damping: physics?.damping ?? 25,    // Map from potential tension/friction if needed, or use direct props
    mass: physics?.mass ?? 1,
    respectReducedMotion: true, // Ensure it respects reduced motion
    ...physics // Spread remaining valid props
  };

  // Animate 'left' property using usePhysicsAnimation
  const { value: animatedLeft, start: startLeft } = usePhysicsAnimation(physicsConfig);
  
  // Animate 'width' property using usePhysicsAnimation
  const { value: animatedWidth, start: startWidth } = usePhysicsAnimation(physicsConfig);
  // --- End Refactored Physics Animation ---

  // Update target indicator style state AND trigger animations
  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    if (activeTabElement && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
            
      const targetLeft = tabRect.left - listRect.left + 4;
      const targetWidth = tabRect.width - 8;
      
      // Update the target indicator style state
      setTargetIndicatorStyle({ 
        left: targetLeft < 0 ? 0 : targetLeft,
        width: targetWidth < 0 ? 0 : targetWidth
      });

      // Only trigger animations if not reduced motion
      if (!isReducedMotion) {
        // Trigger the animations with the new target values using start()
        startLeft(targetLeft < 0 ? 0 : targetLeft);
        startWidth(targetWidth < 0 ? 0 : targetWidth);
      }
    }
  }, [activeTab, tabs, startLeft, startWidth, isReducedMotion]); // Include isReducedMotion in dependencies
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      let newIndex = index;
      
      if (e.key === 'ArrowLeft') {
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
      } else if (e.key === 'ArrowRight') {
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
      }
      
      const newTabId = tabs[newIndex]?.id;
      if (newTabId) {
        handleTabChange(newTabId);
        tabRefs.current.get(newTabId)?.focus();
      }
    }
  };
  
  // --- Imperative Handle (Moved After Handlers) ---
  useImperativeHandle(ref, () => ({
    getContainerElement: () => containerRef.current,
    getTabListElement: () => listRef.current,
    setActiveTab: (tabId) => {
      if (tabs.some(tab => tab.id === tabId)) {
        handleTabChange(tabId);
      }
    },
    getActiveTab: () => activeTab,
  }), [activeTab, tabs]); // Simplify dependencies to avoid unnecessary updates
  
  // Register tab ref - modify to prevent unnecessary updates
  const registerTabRef = (tabId: string, ref: HTMLButtonElement | null) => {
    // Use setTimeout to update refs outside of render cycle
    if (ref && tabRefs.current.get(tabId) !== ref) {
      setTimeout(() => {
        tabRefs.current.set(tabId, ref);
      }, 0);
    }
  };
  
  return (
    <TabsContainer 
      ref={containerRef} // Assign ref to root container
      className={`glass-tabs ${className}`}
    >
      <TabList role="tablist" ref={listRef}>
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.id}
            ref={(ref) => registerTabRef(tab.id, ref)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            $isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </TabButton>
        ))}
        {!isReducedMotion && targetIndicatorStyle.width > 0 && (
          <ActiveIndicator 
             style={{
                left: `${animatedLeft}px`,
                width: `${animatedWidth}px`,
                // Use transform to move to GPU for better performance
                transform: 'translateZ(0)',
             }}
           />
        )}
      </TabList>
      
      {tabs.map(tab => (
        <TabPanel
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          $isActive={activeTab === tab.id}
          tabIndex={0}
        >
          {tab.content}
        </TabPanel>
      ))}
    </TabsContainer>
  );
}); // Close forwardRef

// Add displayName
GlassTabs.displayName = 'GlassTabs';

export default GlassTabs; 