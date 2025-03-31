/**
 * TabUtils
 * 
 * Utility functions for GlassTabBar component
 */
import { TabItem } from '../types';

/**
 * Create a "More" menu tab
 */
export function createMoreMenuTab(): TabItem {
  return {
    label: 'More',
    value: 'more-menu',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      </svg>
    )
  };
}

/**
 * Calculate which tabs should be visible and which should be collapsed
 */
export function calculateVisibleTabs({
  tabs,
  containerWidth,
  maxVisibleTabs,
  tabWidths,
}: {
  tabs: TabItem[],
  containerWidth: number,
  maxVisibleTabs?: number,
  tabWidths: number[],
}): { visibleTabs: TabItem[], collapsedTabs: TabItem[] } {
  // If we have a maxVisibleTabs value, use that
  if (maxVisibleTabs !== undefined && maxVisibleTabs < tabs.length) {
    const moreMenuTab = createMoreMenuTab();
    
    // Set visible and collapsed tabs based on maxVisibleTabs
    const visible = [...tabs.slice(0, maxVisibleTabs - 1), moreMenuTab];
    const collapsed = tabs.slice(maxVisibleTabs - 1);
    
    return { visibleTabs: visible, collapsedTabs: collapsed };
  }
  
  // Collect tab widths and determine if we need to collapse tabs
  const accumulatedWidth = 0;
  const moreMenuWidth = 60; // Approximate width of "More" menu tab
  let visibleCount = tabs.length;
  
  // If all tabs fit, show all
  const totalWidth = tabWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= containerWidth) {
    return { visibleTabs: tabs, collapsedTabs: [] };
  }
  
  // If tabs don't fit, calculate how many we can show
  // Reserve space for "More" menu button
  const availableWidth = containerWidth - moreMenuWidth;
  let totalUsedWidth = 0;
  
  // Calculate how many tabs fit
  for (let i = 0; i < tabs.length; i++) {
    const tabWidth = tabWidths[i] || 50; // Default width if missing
    
    if (totalUsedWidth + tabWidth > availableWidth) {
      visibleCount = i;
      break;
    }
    
    totalUsedWidth += tabWidth;
  }
  
  // Ensure we show at least 1 tab plus the "More" menu
  visibleCount = Math.max(1, visibleCount);
  
  // Create more menu tab
  const moreMenuTab = createMoreMenuTab();
  
  // Set visible and collapsed tabs
  const visible = [...tabs.slice(0, visibleCount), moreMenuTab];
  const collapsed = tabs.slice(visibleCount);
  
  return { visibleTabs: visible, collapsedTabs: collapsed };
}

/**
 * Calculate the total number of badges for display on the More menu
 */
export function calculateTotalBadgeCount(tabs: TabItem[]): number {
  return tabs.reduce((count, tab) => {
    // If badge is a number, add it to count
    if (typeof tab.badge === 'number') return count + tab.badge;
    // If badge exists but is not a number, increment by 1
    if (tab.badge !== undefined) return count + 1;
    return count;
  }, 0);
}

/**
 * Get the next enabled tab index, skipping disabled tabs
 */
export function getNextEnabledTabIndex(
  startIndex: number, 
  direction: number, 
  tabs: TabItem[]
): number {
  let nextIndex = startIndex;
  do {
    nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
    // If we've cycled through all tabs and found none that are enabled, stay at current tab
    if (nextIndex === startIndex) return startIndex;
  } while (tabs[nextIndex].disabled);
  return nextIndex;
}

/**
 * Scroll a tab into view
 */
export function scrollTabIntoView({
  tabElement,
  containerElement,
  orientation,
  extraPadding = 16
}: {
  tabElement: HTMLElement,
  containerElement: HTMLElement,
  orientation: 'horizontal' | 'vertical',
  extraPadding?: number
}): { x: number, y: number } | null {
  if (!tabElement || !containerElement) return null;
  
  const tabRect = tabElement.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();
  
  if (orientation === 'horizontal') {
    if (tabRect.left < containerRect.left) {
      // Tab is to the left of the visible area
      const targetScrollLeft = containerElement.scrollLeft - (containerRect.left - tabRect.left) - extraPadding;
      return { x: targetScrollLeft, y: 0 };
    } else if (tabRect.right > containerRect.right) {
      // Tab is to the right of the visible area
      const targetScrollLeft = containerElement.scrollLeft + (tabRect.right - containerRect.right) + extraPadding;
      return { x: targetScrollLeft, y: 0 };
    }
  } else {
    if (tabRect.top < containerRect.top) {
      // Tab is above the visible area
      const targetScrollTop = containerElement.scrollTop - (containerRect.top - tabRect.top) - extraPadding;
      return { x: 0, y: targetScrollTop };
    } else if (tabRect.bottom > containerRect.bottom) {
      // Tab is below the visible area
      const targetScrollTop = containerElement.scrollTop + (tabRect.bottom - containerRect.bottom) + extraPadding;
      return { x: 0, y: targetScrollTop };
    }
  }
  
  // Tab is already in view
  return null;
}