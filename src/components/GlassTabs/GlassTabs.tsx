import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { glassSurface } from "../../core/mixins/glassSurface";
import { createThemeContext } from "../../core/themeContext";
import { useAccessibilitySettings } from "../../hooks/useAccessibilitySettings";
import { usePhysicsAnimation, PhysicsAnimationProps } from "../../components/DataChart/hooks/usePhysicsAnimation";

// --- Define Variant Type ---
export type GlassTabsVariant = 'equal' | 'auto' | 'scrollable';

// --- Define Vertical Align Type ---
export type GlassTabsVerticalAlign = 'top' | 'center' | 'bottom' | 'stretch';

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

// --- New Scroll Button Styles ---
const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2; // Ensure buttons are above tabs
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  padding: 0;
  line-height: 0; // Ensure icon is centered

  &:hover {
    background: rgba(0, 0, 0, 0.6);
    color: rgba(255, 255, 255, 1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  // SVG icon styling
  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

const LeftScrollButton = styled(ScrollButton)`
  left: 8px; // Position near the left edge
`;

const RightScrollButton = styled(ScrollButton)`
  right: 8px; // Position near the right edge
`;
// --- End Scroll Button Styles ---

// Tab Container
const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Tab List Styled Component
const TabList = styled.div<{ $variant: GlassTabsVariant; $verticalAlign: GlassTabsVerticalAlign }>`
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
  
  /* Vertical Alignment */
  align-items: ${({ $verticalAlign }) => {
      switch ($verticalAlign) {
          case 'top': return 'flex-start';
          case 'bottom': return 'flex-end';
          case 'stretch': return 'stretch';
          case 'center':
          default: return 'center';
      }
  }};

  ${({ $variant }) => ($variant === 'scrollable') && css`
    overflow-x: auto;
    /* Hide default scrollbar */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
    /* Add padding to prevent buttons from overlapping content edge */
    padding-left: 40px; 
    padding-right: 40px;
    /* Ensure container clips content, needed for absolute positioned buttons */
    overflow: hidden; // Change from auto to hidden to clip, scrolling is handled programmatically/manually
  `}

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

// Inner container for scrolling when variant is 'scrollable'
const ScrollableTabInner = styled.div`
    display: flex;
    gap: 8px; // Match TabList gap
    overflow-x: auto; // Enable scrolling on this inner div
    /* Hide scrollbar */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
        display: none; /* Safari and Chrome */
    }
    /* Ensure it takes up space */
    width: 100%;
`;

// Tab Button Styled Component
const TabButton = styled.button<{ $isActive: boolean; $variant: GlassTabsVariant }>`
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
  text-align: center;
  white-space: nowrap; // Prevent text wrapping
  flex-shrink: 0; // Prevent shrinking in scrollable/auto modes

  /* Apply flex: 1 only for 'equal' variant */
  ${({ $variant }) => $variant === 'equal' && css`
    flex: 1;
  `}

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
  /** Controls how tabs are sized and behave when overflowing. */
  variant?: GlassTabsVariant;
  /** Controls the vertical alignment of tabs within the list container. */
  verticalAlign?: GlassTabsVerticalAlign;
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
 * Includes optional scroll buttons for the 'scrollable' variant.
 */
// Convert component to use forwardRef
export const GlassTabs = forwardRef<GlassTabsRef, GlassTabsProps>(({ 
  tabs, 
  defaultTab, 
  variant = 'equal', // Default to 'equal'
  verticalAlign = 'center', // Default vertical alignment
  onChange,
  className = '',
  physics
}, ref) => { // Add ref parameter
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ''));
  const { isReducedMotion } = useAccessibilitySettings();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const scrollableInnerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the root container
  
  // State for Scroll Buttons
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

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

  // --- Scroll Button Visibility Logic ---
  const updateScrollButtonVisibility = useCallback(() => {
    if (variant !== 'scrollable' || !scrollableInnerRef.current) {
      setShowLeftButton(false);
      setShowRightButton(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollableInnerRef.current;
    const isOverflowing = scrollWidth > clientWidth;
    const scrollEndReached = Math.abs(scrollWidth - clientWidth - scrollLeft) < 1; // Check if near the end

    setShowLeftButton(isOverflowing && scrollLeft > 0);
    setShowRightButton(isOverflowing && !scrollEndReached);

  }, [variant]); // Dependency on variant

  // Effect for ResizeObserver and initial check
  useEffect(() => {
    const scrollElement = scrollableInnerRef.current;
    if (variant !== 'scrollable' || !scrollElement) return;

    // Initial check
    updateScrollButtonVisibility();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateScrollButtonVisibility();
    });
    resizeObserver.observe(scrollElement);

    // Add scroll event listener
    scrollElement.addEventListener('scroll', updateScrollButtonVisibility);

    return () => {
      resizeObserver.disconnect();
      scrollElement.removeEventListener('scroll', updateScrollButtonVisibility);
    };
  }, [variant, updateScrollButtonVisibility, tabs]); // Re-run if variant or tabs change

  // --- Scroll Button Click Handlers ---
  const handleScrollLeft = () => {
    if (scrollableInnerRef.current) {
      scrollableInnerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollableInnerRef.current) {
      scrollableInnerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  // --- End Scroll Button Click Handlers ---

  // Update target indicator style state AND trigger animations
  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    // Use scrollableInnerRef for offset calculation if variant is scrollable
    const referenceElement = variant === 'scrollable' ? scrollableInnerRef.current : listRef.current;

    if (activeTabElement && referenceElement) {
      // Calculate relative offset within the scrollable container
      const targetLeft = activeTabElement.offsetLeft; // offsetLeft is relative to the offsetParent
      const targetWidth = activeTabElement.offsetWidth;

      // No extra padding adjustment needed if using inner container
      const adjustedLeft = targetLeft;
      const adjustedWidth = targetWidth;

      setTargetIndicatorStyle({
        left: adjustedLeft < 0 ? 0 : adjustedLeft,
        width: adjustedWidth < 0 ? 0 : adjustedWidth
      });

      if (!isReducedMotion) {
        // Need to adjust the physics animation target based on the scroll position
        const scrollOffset = scrollableInnerRef.current?.scrollLeft ?? 0;
        const visualLeft = adjustedLeft - (variant === 'scrollable' ? scrollOffset : 0);

        // Note: Physics animation might jitter if scroll happens simultaneously.
        // Consider disabling physics indicator if scrolling becomes too complex.
        // For now, let's try animating based on the offsetLeft within the scrollable div.
        startLeft(adjustedLeft < 0 ? 0 : adjustedLeft);
        startWidth(adjustedWidth < 0 ? 0 : adjustedWidth);
      } else {
         // Immediately set style for reduced motion
         setTargetIndicatorStyle({
            left: adjustedLeft < 0 ? 0 : adjustedLeft,
            width: adjustedWidth < 0 ? 0 : adjustedWidth
         });
      }
    }
  }, [activeTab, tabs, startLeft, startWidth, isReducedMotion, variant]); // Add variant

  // Handle tab change - Scroll into view if needed
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
    // Scroll the active tab into view if using scrollable variant
    if (variant === 'scrollable') {
        const tabElement = tabRefs.current.get(tabId);
        tabElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
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
  
  const renderTabs = () => (
     tabs.map((tab, index) => (
        <TabButton
          key={tab.id}
          ref={(ref) => registerTabRef(tab.id, ref)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          $isActive={activeTab === tab.id}
          $variant={variant} // Pass variant to styled component
          onClick={() => handleTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </TabButton>
     ))
  );

  // Indicator style calculation depends on whether motion is reduced
  const indicatorStyle = isReducedMotion ?
    { left: `${targetIndicatorStyle.left}px`, width: `${targetIndicatorStyle.width}px`, transform: 'translateZ(0)'} :
    { left: `${animatedLeft}px`, width: `${animatedWidth}px`, transform: 'translateZ(0)'};

  return (
    <TabsContainer 
      ref={containerRef} // Assign ref to root container
      className={`glass-tabs ${className}`}
    >
      <TabList 
        role="tablist" 
        ref={listRef} 
        $variant={variant} // Pass variant to styled component
        $verticalAlign={verticalAlign} // Pass verticalAlign to styled component
      >
        {/* Conditionally render scroll buttons */}
        {variant === 'scrollable' && showLeftButton && (
          <LeftScrollButton onClick={handleScrollLeft} aria-label="Scroll tabs left" disabled={!showLeftButton}>
             {/* Simple SVG Arrow Left */}
             <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </LeftScrollButton>
        )}

        {/* Render tabs inside a scrollable div only if variant is scrollable */}
        {variant === 'scrollable' ? (
            <ScrollableTabInner ref={scrollableInnerRef}>
                 {renderTabs()}
                 {/* Render indicator inside the scrollable area */}
                 {targetIndicatorStyle.width > 0 && (
                    <ActiveIndicator style={indicatorStyle} />
                 )}
            </ScrollableTabInner>
        ) : (
            <>
                {renderTabs()}
                 {/* Render indicator directly in TabList if not scrollable */}
                 {targetIndicatorStyle.width > 0 && (
                    <ActiveIndicator style={indicatorStyle} />
                 )}
            </>
        )}

        {variant === 'scrollable' && showRightButton && (
          <RightScrollButton onClick={handleScrollRight} aria-label="Scroll tabs right" disabled={!showRightButton}>
            {/* Simple SVG Arrow Right */}
            <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </RightScrollButton>
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