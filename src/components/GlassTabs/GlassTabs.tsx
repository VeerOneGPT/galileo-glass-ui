import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { glassSurface } from "../../core/mixins/glassSurface";
import { createThemeContext } from "../../core/themeContext";
import { useGlassTheme } from "../../hooks/useGlassTheme";
import { useAccessibilitySettings } from "../../hooks/useAccessibilitySettings";

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
const ActiveIndicator = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  bottom: 4px;
  height: 3px;
  background: rgba(var(--glass-primary-rgb), 0.8);
  border-radius: 1.5px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
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
}

/**
 * GlassTabs Component
 * 
 * A tabbed interface with glass styling and animated indicator.
 * Features interactive hover effects and smooth transitions.
 */
export const GlassTabs: React.FC<GlassTabsProps> = ({ 
  tabs, 
  defaultTab, 
  onChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ''));
  const { isReducedMotion } = useAccessibilitySettings();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const listRef = useRef<HTMLDivElement>(null);
  
  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    if (activeTabElement && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - listRect.left + 4, // 4px for padding
        width: tabRect.width - 8 // 8px for padding on both sides
      });
    }
  }, [activeTab, tabs]);
  
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
  
  // Register tab ref
  const registerTabRef = (tabId: string, ref: HTMLButtonElement | null) => {
    if (ref) {
      tabRefs.current.set(tabId, ref);
    }
  };
  
  return (
    <TabsContainer className={`glass-tabs ${className}`}>
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
        {!isReducedMotion && (
          <ActiveIndicator $left={indicatorStyle.left} $width={indicatorStyle.width} />
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
};

export default GlassTabs; 