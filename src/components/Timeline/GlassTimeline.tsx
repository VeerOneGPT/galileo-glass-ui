/**
 * GlassTimeline Component
 * 
 * A glass-styled timeline component for displaying chronological events
 * with physics-based animations and interactions.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { format as formatDateFn } from 'date-fns';
import { useTheme } from 'styled-components';

// Physics-related imports
import { SpringPresets, SpringConfig } from '../../animations/physics/springPhysics';
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';

// Core styling imports
import { createThemeContext } from '../../core/themeContext';

// Hooks and utilities
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { AnimationProps } from '../../animations/types';

// Timeline utilities and types
import { 
  TimelineProps, 
  type TimelineItem,
  TimelineViewMode,
  ZoomLevel,
  TimelineRef,
  TimelineOrientation,
  TimelineDensity
} from './types';

import {
  parseDate,
  formatDate,
  groupItemsByDate,
  generateTimeMarkers,
  filterItems,
  getDateRangeForView,
  calculateTimelinePosition
} from './TimelineUtils';

// Import modularized components and hooks
import { 
  usePositionInertia, 
  clamp 
} from './hooks';
import { 
  TimelineEvent, 
  TimelineMarkers, 
  TimelineControls 
} from './components';

// Import styled components
import {
  TimelineContainer,
  TimelineScrollContainer,
  TimelineAxis,
  TimelineEvents,
  LoadingIndicator,
  EmptyStateMessage
} from './styles';

/**
 * GlassTimeline Component
 * 
 * A glass-styled timeline component for displaying chronological events
 * with physics-based animations and interactions.
 */
export const GlassTimeline = forwardRef<TimelineRef, TimelineProps & Partial<AnimationProps>>(({
  // Destructure known props
  items = [],
  orientation = 'vertical',
  markerPosition = 'alternate',
  viewMode = 'month',
  groupByDate = true,
  groupThreshold = 3,
  groups = [],
  showAxis = true,
  markers = { 
    show: true, 
    primaryInterval: undefined, 
    secondaryInterval: undefined, 
    formatter: undefined,
    showNow: true 
  },
  animation = 'spring',
  physics = { preset: 'default', staggerDelay: 50 },
  density = 'normal',
  width,
  height,
  className,
  markerClassName,
  contentClassName,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  glassMarkers = true,
  glassContent = true,
  navigation = 'scroll',
  zoomLevel = 'days',
  zoomLevels = ['days', 'weeks', 'months', 'years'],
  allowWheelZoom = true,
  initialDate = new Date(),
  activeId,
  filter,
  allowFiltering = true,
  loadingPast = false,
  loadingFuture = false,
  hasMorePast = false,
  hasMoreFuture = false,
  onLoadMorePast,
  onLoadMoreFuture,
  onItemClick,
  onItemSelect,
  onNavigate,
  onZoomChange,
  onFilterChange,
  renderMarker,
  renderContent,
  renderAxis,
  animateOnMount = true,
  animateOnChange = true,
  id,
  ariaLabel,
  animationConfig,
  disableAnimation,
  // Collect remaining props to spread
  ...restProps 
}, ref) => {
  
  // Parse initial date
  const parsedInitialDate = useMemo(() => {
    return typeof initialDate === 'string' ? new Date(initialDate) : initialDate;
  }, [initialDate]);
  
  // State for timeline
  const [currentDate, setCurrentDate] = useState<Date>(parsedInitialDate);
  const [currentViewMode, setCurrentViewMode] = useState<TimelineViewMode>(viewMode);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<ZoomLevel>(zoomLevel);
  const [selectedId, setSelectedId] = useState<string | number | null>(activeId || null);
  const [dateRange, setDateRange] = useState(getDateRangeForView(parsedInitialDate, viewMode, 2));
  
  // State for container dimensions AND PADDING
  const [containerMetrics, setContainerMetrics] = useState<{
    width: number, 
    height: number, 
    paddingTop: number,
    paddingRight: number,
    paddingBottom: number,
    paddingLeft: number
  }>({ width: 0, height: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 });

  // Refs
  const localContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const eventsContainerRef = useRef<HTMLDivElement>(null); 
  
  // Drag State Refs
  const isDragging = useRef(false);
  const pointerId = useRef<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });
  const velocityTracker = useRef<{ t: number; x: number; y: number }[]>([]);
  
  // Hooks & Context
  const themeContext = createThemeContext(useTheme());
  const reducedMotion = useReducedMotion();
  const { defaultSpring: contextDefaultSpring } = useAnimationContext();

  // Combine disable flags
  const finalDisableAnimation = disableAnimation ?? reducedMotion;

  // --- State for Bounds ---
  const [scrollBounds, setScrollBounds] = useState<{ min: number, max: number }>({ min: 0, max: 0 });

  // Create a memoized scroll physics config
  const finalScrollPhysicsConfig = useMemo(() => ({
    damping: 0.85, 
    friction: 0.92, 
    mass: 1,       
  }), []);

  // --- Initialize Physics Hook for Scrolling ---
  const { 
    position: physicsScrollPosition, 
    setPosition: setPhysicsScrollPosition,
    flick: flickPhysicsScroll,
    stop: stopPhysicsScroll,
    updateConfig: updatePhysicsConfig
  } = usePositionInertia({ x: 0, y: 0 }, { 
    config: { 
      bounds: scrollBounds,
      ...finalScrollPhysicsConfig
    }
  });
  
  // Memoize interaction config for use in TimelineEvent
  const finalInteractionConfig = useMemo((): Partial<SpringConfig> | keyof typeof SpringPresets | undefined => {
    let config: Partial<SpringConfig> | keyof typeof SpringPresets | undefined;
    if (physics?.preset && SpringPresets[physics.preset.toUpperCase() as keyof typeof SpringPresets]) {
      config = physics.preset.toUpperCase() as keyof typeof SpringPresets;
    } else if (typeof animationConfig === 'object' && animationConfig !== null) {
      if ('tension' in animationConfig || 'friction' in animationConfig || 'mass' in animationConfig) {
           config = animationConfig as Partial<SpringConfig>;
      }
    } else if (animation === 'spring') {
      config = contextDefaultSpring ?? 'DEFAULT';
    }
    return config;
  }, [physics?.preset, animationConfig, animation, contextDefaultSpring]); 

  // Effect to measure events container size AND PADDING
  useEffect(() => {
    const targetElement = eventsContainerRef.current;
    if (!targetElement) return;

    // Helper function to get metrics
    const measureMetrics = () => {
      const { offsetWidth, offsetHeight } = targetElement;
      const computedStyle = window.getComputedStyle(targetElement);
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      
      setContainerMetrics({ 
        width: offsetWidth, 
        height: offsetHeight,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft
      });
      // Update scroll bounds whenever metrics change
      updateScrollBounds(offsetWidth, offsetHeight, paddingTop, paddingBottom, paddingLeft, paddingRight);
    }

    const resizeObserver = new ResizeObserver(measureMetrics); // Measure on resize

    resizeObserver.observe(targetElement);

    measureMetrics(); // Initial measure

    return () => {
      resizeObserver.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Rerun if orientation/density changes padding? Maybe not needed, resize should catch it.

  // Helper to update scroll bounds (now takes padding into account for content size)
  const updateScrollBounds = useCallback((containerWidth: number, containerHeight: number, paddingTop: number, paddingBottom: number, paddingLeft: number, paddingRight: number) => {
    if (!scrollContainerRef.current || !eventsContainerRef.current) return;

    const scrollEl = scrollContainerRef.current;
    const contentEl = eventsContainerRef.current;
    
    let minBound = 0;
    const maxBound = 0;
    
    const contentScrollHeight = contentEl.scrollHeight; // Includes padding
    const contentScrollWidth = contentEl.scrollWidth;   // Includes padding

    if (orientation === 'vertical') {
      // Usable container height excludes padding for scrolling calculations
      const usableContainerHeight = containerHeight - paddingTop - paddingBottom;
      // Use scrollHeight directly as it represents the total scrollable content height
      minBound = usableContainerHeight >= contentScrollHeight ? 0 : -(contentScrollHeight - usableContainerHeight);
    } else {
      // Usable container width excludes padding
      const usableContainerWidth = containerWidth - paddingLeft - paddingRight;
      minBound = usableContainerWidth >= contentScrollWidth ? 0 : -(contentScrollWidth - usableContainerWidth);
    }

    const newBounds = { min: minBound, max: maxBound };

    setScrollBounds(prevBounds => {
      if (newBounds.min !== prevBounds.min || newBounds.max !== prevBounds.max) {
        updatePhysicsConfig({ 
          bounds: newBounds,
          ...finalScrollPhysicsConfig
        });
        return newBounds;
      }
      return prevBounds; // No change
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, updatePhysicsConfig, finalScrollPhysicsConfig]); 

  // Update date range
  useEffect(() => {
    setDateRange(getDateRangeForView(currentDate, currentViewMode, 2));
  }, [currentDate, currentViewMode]);

  // Calculate position % - Still needed for markers, potentially internal logic
  const calculateItemPositionPercent = useCallback((date: Date): number => {
    return calculateTimelinePosition(date, dateRange.start, dateRange.end);
  }, [dateRange]);

  // Scroll to a specific date
  const scrollToDate = useCallback((date: Date, smooth = true) => {
    if (!scrollContainerRef.current) return;
    
    const position = calculateItemPositionPercent(date);
    const container = scrollContainerRef.current;
    let targetX = physicsScrollPosition.x;
    let targetY = physicsScrollPosition.y;
    
    const currentBounds = scrollBounds; 

    if (orientation === 'vertical') {
      const containerHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      const targetScrollTop = (position / 100) * scrollHeight - containerHeight / 2;
      targetY = clamp(-targetScrollTop, currentBounds.min, currentBounds.max); 
    } else {
       const containerWidth = container.clientWidth;
       const scrollWidth = container.scrollWidth;
       const targetScrollLeft = (position / 100) * scrollWidth - containerWidth / 2;
       targetX = clamp(-targetScrollLeft, currentBounds.min, currentBounds.max);
    }
    
    setPhysicsScrollPosition({ x: targetX, y: targetY }, smooth ? undefined : { x: 0, y: 0 });

  }, [calculateItemPositionPercent, orientation, setPhysicsScrollPosition, physicsScrollPosition, scrollBounds]);

  // Expose methods via imperative handle (using localContainerRef internally)
  useImperativeHandle(ref, () => ({
    scrollToDate: (date: Date, smooth = true) => scrollToDate(date, smooth),
    scrollToItem: (itemId: string | number, smooth = true) => {
      const item = items.find(item => item.id === itemId);
      if (item) {
        scrollToDate(parseDate(item.date), smooth);
      }
    },
    getContainerElement: () => localContainerRef.current,
    getCurrentDate: () => currentDate,
    selectItem: (itemId: string | number) => {
      setSelectedId(itemId);
      const item = items.find(item => item.id === itemId);
      if (item) {
        scrollToDate(parseDate(item.date));
      }
    }
  }), [ref, scrollToDate, currentDate, items, setSelectedId]);

  // Sync selectedId with activeId from props
  useEffect(() => {
    if (activeId !== undefined) {
      setSelectedId(activeId);
      const selectedItem = items.find(item => item.id === activeId);
      if (selectedItem) {
        scrollToDate(parseDate(selectedItem.date)); 
      }
    }
  }, [activeId, items, scrollToDate]); 
  
  // Filter items
  const filteredItems = useMemo(() => {
    return filter ? filterItems(items, filter) : items;
  }, [items, filter]);
  
  // Group items by date if needed
  const groupedItems = useMemo(() => {
    if (!groupByDate) return null;
    return groupItemsByDate(filteredItems, currentZoomLevel, groupThreshold);
  }, [filteredItems, currentZoomLevel, groupByDate, groupThreshold]);
  
  // Generate time markers
  const timeMarkers = useMemo(() => {
    if (!markers.show) return [];
    return generateTimeMarkers(dateRange.start, dateRange.end, 
      markers.primaryInterval || currentZoomLevel);
  }, [dateRange, markers.show, markers.primaryInterval, currentZoomLevel]);
  
  // Format marker label
  const formatMarkerLabel = useCallback((date: Date): string => {
    if (markers.formatter) {
      return markers.formatter(date, currentZoomLevel);
    }
    return formatDate(date, currentViewMode, currentZoomLevel);
  }, [currentViewMode, currentZoomLevel, markers.formatter]);
  
  // Determine which side an event should be on
  const getEventSide = useCallback((index: number, itemId: string | number): 'left' | 'right' | 'center' => {
    if (markerPosition === 'left') return 'right';
    if (markerPosition === 'right') return 'left';
    if (markerPosition === 'center') return 'center';
    
    // For alternate, determine based on index or ID
    const idNumber = typeof itemId === 'string' 
      ? itemId.charCodeAt(0) + itemId.charCodeAt(itemId.length - 1)
      : itemId;
      
    return index % 2 === 0 || idNumber % 2 === 0 ? 'right' : 'left';
  }, [markerPosition]);
  
  // Handle date change
  const changeDate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    onNavigate?.(newDate, currentViewMode);
    // scrollToDate(newDate); // <<< REMOVE SCROLL CALL FROM HERE
  }, [currentViewMode, onNavigate]); // <<< REMOVE scrollToDate DEPENDENCY
  
  // Go to previous/next time period
  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (currentViewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'decade':
        newDate.setFullYear(newDate.getFullYear() - 10);
        break;
    }
    
    changeDate(newDate);
  }, [currentDate, currentViewMode, changeDate]);
  
  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (currentViewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      case 'decade':
        newDate.setFullYear(newDate.getFullYear() + 10);
        break;
    }
    
    changeDate(newDate);
  }, [currentDate, currentViewMode, changeDate]);
  
  // Go to today
  const goToToday = useCallback(() => {
    changeDate(new Date());
  }, [changeDate]);
  
  // Change zoom level
  const changeZoomLevel = useCallback((newZoomLevel: ZoomLevel) => {
    setCurrentZoomLevel(newZoomLevel);
    onZoomChange?.(newZoomLevel);
  }, [onZoomChange]);
  
  // Zoom in/out
  const zoomIn = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(currentZoomLevel);
    if (currentIndex > 0) {
      changeZoomLevel(zoomLevels[currentIndex - 1]);
    }
  }, [currentZoomLevel, zoomLevels, changeZoomLevel]);
  
  const zoomOut = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(currentZoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      changeZoomLevel(zoomLevels[currentIndex + 1]);
    }
  }, [currentZoomLevel, zoomLevels, changeZoomLevel]);
  
  // Handle mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (allowWheelZoom && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation(); 
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    } else {
      e.preventDefault(); 
      e.stopPropagation();

      const wheelScaleFactor = 0.5;
      let deltaX = 0;
      let deltaY = 0;

      if (orientation === 'vertical') {
        deltaY = -e.deltaY * wheelScaleFactor; 
      } else {
        deltaX = -(e.deltaX || e.deltaY) * wheelScaleFactor;
      }
      
      let newTargetPosX = physicsScrollPosition.x + deltaX;
      let newTargetPosY = physicsScrollPosition.y + deltaY;

      const currentBounds = scrollBounds;
      if (orientation === 'vertical') {
         newTargetPosY = clamp(newTargetPosY, currentBounds.min, currentBounds.max);
         newTargetPosX = physicsScrollPosition.x;
      } else { 
         newTargetPosX = clamp(newTargetPosX, currentBounds.min, currentBounds.max);
         newTargetPosY = physicsScrollPosition.y;
      }

      setPhysicsScrollPosition({ x: newTargetPosX, y: newTargetPosY }); 
    }
  }, [allowWheelZoom, zoomIn, zoomOut, physicsScrollPosition, setPhysicsScrollPosition, scrollBounds, orientation]);
  
  // Handle item click
  const handleItemClick = useCallback((item: TimelineItem) => {
    setSelectedId(item.id);
    onItemClick?.(item);
    onItemSelect?.(item);
    scrollToDate(parseDate(item.date));
  }, [onItemClick, onItemSelect, scrollToDate]);
  
  // Animation effects
  useEffect(() => {
    if (!animateOnChange || isInitialMount.current) return;
    
    const existingItemIds = new Set(
      Object.keys(itemPhysicsProps).map(id => id.toString())
    );
    
    const itemsToRender = groupedItems
      ? Object.values(groupedItems).flat()
      : filteredItems;
    
    itemsToRender.forEach((item, index) => {
      const itemId = item.id.toString();
      
      if (!existingItemIds.has(itemId)) {
        const initialX = orientation === 'vertical' ? 30 : 0;
        const initialY = orientation === 'vertical' ? 0 : 30;
        
        setItemPhysicsProps(prev => ({
          ...prev,
          [itemId]: {
            translateX: initialX,
            translateY: initialY,
            scale: 0.9,
            opacity: 0
          }
        }));
        
        setTimeout(() => {
          setItemPhysicsProps(prev => ({
            ...prev,
            [itemId]: {
              translateX: 0,
              translateY: 0,
              scale: 1,
              opacity: 1
            }
          }));
        }, (physics.staggerDelay || 50) * index);
      }
    });
  }, [filteredItems, groupedItems, orientation, animateOnChange, physics.staggerDelay]);
  
  // Restore original state for item physics props (used for entrance animation)
  const [itemPhysicsProps, setItemPhysicsProps] = useState<Record<string | number, {
    translateX: number;
    translateY: number;
    scale: number;
    opacity: number;
  }>>({});

  // Initial mount animation - Restore useEffect with setTimeout
  useEffect(() => {
    // Mark initial mount as done after the first run
    const initial = isInitialMount.current;
    isInitialMount.current = false; 
    
    // Only run if animation is enabled and it's the initial mount
    if (finalDisableAnimation || !animateOnMount || !initial) return;

    const itemsToRender = groupedItems
      ? Object.values(groupedItems).flat()
      : filteredItems;
    
    // Set initial (off-screen/faded) state
    let initialProps: Record<string, { translateX: number; translateY: number; scale: number; opacity: number; }> = {};
    itemsToRender.forEach(item => {
        const initialX = orientation === 'vertical' ? 30 : 0;
        const initialY = orientation === 'vertical' ? 0 : 30;
        initialProps[item.id.toString()] = {
            translateX: initialX,
            translateY: initialY,
            scale: 0.9,
            opacity: 0
        };
    });
    setItemPhysicsProps(initialProps);

    // Schedule animations to the final state with stagger
    const timeouts: NodeJS.Timeout[] = [];
    itemsToRender.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setItemPhysicsProps(prev => ({
          ...prev,
          [item.id.toString()]: {
            translateX: 0,
            translateY: 0,
            scale: 1,
            opacity: 1
          }
        }));
      }, (physics.staggerDelay || 50) * index);
      timeouts.push(timeout);
    });

    // Cleanup timeouts on unmount or if dependencies change
    return () => {
      timeouts.forEach(clearTimeout);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateOnMount, finalDisableAnimation, filteredItems, groupedItems, orientation, physics?.staggerDelay]); // Dependencies
  
  // --- Effect to scroll when currentDate changes --- 
  useEffect(() => {
    // Optional: Prevent scrolling on initial mount if initialDate is already centered
    if (isInitialMount.current) { 
      // isInitialMount is set to false in the animation useEffect
      // We might need a separate flag if animation is disabled
      // Or simply allow the initial scroll always
       // return; 
    }
    scrollToDate(currentDate);
  }, [currentDate, scrollToDate]); // <<< ADD EFFECT
  
  // Effect to trigger load more (Ensure this is present)
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const thresholdFactor = 0.2;
    let currentPos: number;
    let clientSize: number;
    
    if (orientation === 'vertical') {
      currentPos = physicsScrollPosition.y;
      clientSize = container.clientHeight;
    } else {
      currentPos = physicsScrollPosition.x;
      clientSize = container.clientWidth;
    }

    const minBound = scrollBounds.min;
    const maxBound = scrollBounds.max;

    const pastLoadThreshold = minBound < 0 ? minBound + clientSize * thresholdFactor : 0;
    if (
      hasMorePast && 
      onLoadMorePast && 
      !loadingPast && 
      currentPos < pastLoadThreshold &&
      minBound < 0
    ) {
      onLoadMorePast();
    }

    const futureLoadThreshold = minBound < 0 ? maxBound - clientSize * thresholdFactor : 0;
    if (
      hasMoreFuture && 
      onLoadMoreFuture && 
      !loadingFuture && 
      currentPos > futureLoadThreshold &&
      minBound < 0
    ) {
      onLoadMoreFuture();
    }
  }, [
    physicsScrollPosition, 
    scrollBounds, 
    orientation, 
    loadingPast, 
    loadingFuture, 
    hasMorePast, 
    hasMoreFuture, 
    onLoadMorePast, 
    onLoadMoreFuture
  ]);
  
  // Pointer event handlers (Restored / Ensure Present)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    e.preventDefault(); 
    
    isDragging.current = true;
    pointerId.current = e.pointerId;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastDragPos.current = physicsScrollPosition; 
    
    stopPhysicsScroll(); 
    velocityTracker.current = [];
    
    e.currentTarget.setPointerCapture(e.pointerId); 
  }, [physicsScrollPosition, stopPhysicsScroll]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || e.pointerId !== pointerId.current) return;
    
    const currentPos = { x: e.clientX, y: e.clientY };
    const timestamp = e.timeStamp;
    
    const tracker = velocityTracker.current;
    while (tracker.length > 0 && timestamp - tracker[0].t > 100) {
      tracker.shift();
    }
    tracker.push({ t: timestamp, x: currentPos.x, y: currentPos.y });

    const delta = { 
      x: currentPos.x - dragStartPos.current.x, 
      y: currentPos.y - dragStartPos.current.y 
    };
    
    let newTargetPosX = lastDragPos.current.x + delta.x;
    let newTargetPosY = lastDragPos.current.y + delta.y;
    
    const currentBounds = scrollBounds;
    if (orientation === 'vertical') {
       newTargetPosY = clamp(newTargetPosY, currentBounds.min, currentBounds.max);
       newTargetPosX = physicsScrollPosition.x;
    } else {
       newTargetPosX = clamp(newTargetPosX, currentBounds.min, currentBounds.max);
       newTargetPosY = physicsScrollPosition.y;
    }
    
    setPhysicsScrollPosition({ x: newTargetPosX, y: newTargetPosY });
  }, [setPhysicsScrollPosition, scrollBounds, orientation, physicsScrollPosition]);

  const handlePointerUpOrLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || e.pointerId !== pointerId.current) return;
    
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    pointerId.current = null;
    
    let velocity = { x: 0, y: 0 };
    const tracker = velocityTracker.current;
    if (tracker.length >= 2) {
      const first = tracker[0];
      const last = tracker[tracker.length - 1];
      const dt = (last.t - first.t) / 1000; 
      if (dt > 0) {
        const velocityFactor = 1.5; 
        velocity = {
          x: ((last.x - first.x) / dt) * velocityFactor,
          y: ((last.y - first.y) / dt) * velocityFactor,
        };
      }
    }
    velocityTracker.current = [];

    if (Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10) {
       flickPhysicsScroll(velocity);
    }
  }, [flickPhysicsScroll]);
  
  // Render events - STRATEGY 9: Relative + Margin
  const renderEvents = () => {
    const itemsToRender = groupedItems 
      ? Object.entries(groupedItems).flatMap(([dateKey, itemsForDate]) => itemsForDate)
      : filteredItems;

    // SORT items explicitly by date first!
    const sortedItems = [...itemsToRender].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    
    return sortedItems.map((item, index) => {
      // Keep only animation style calculation logic (if still needed/used)
      // This part might need review based on how TimelineEvent uses physics props
      const style: React.CSSProperties = {}; 
      // TODO: Review if itemPhysicsProps are sufficient or if manual style needed here
      // For now, pass empty style object, relying on TimelineEvent internal springs

      const groupInfo = groupedItems ? Object.entries(groupedItems).find(([key, items]) => items.some(i => i.id === item.id)) : undefined;
      const isGroupedAndNotFirst = groupInfo ? groupInfo[1].findIndex(i => i.id === item.id) > 0 : false;
      if (groupedItems && isGroupedAndNotFirst) return null; 

      return (
        <TimelineEvent
          key={item.id}
          item={item}
          index={index} 
          isGrouped={groupInfo ? groupInfo[1].length > 1 : false}
          orientation={orientation}
          isHighlighted={!!item.highlighted}
          color={color}
          finalDisableAnimation={finalDisableAnimation}
          glassContent={glassContent}
          glassVariant={glassVariant}
          blurStrength={blurStrength}
          contentClassName={contentClassName}
          markerClassName={markerClassName}
          handleItemClick={handleItemClick}
          renderContent={renderContent}
          renderMarker={renderMarker}
          density={density}
          itemPhysicsProps={itemPhysicsProps[item.id.toString()] || { translateX: 0, translateY: 0, scale: 1, opacity: 1 }}
          finalInteractionConfig={finalInteractionConfig}
          formatDate={formatDate}
          currentViewMode={currentViewMode}
          currentZoomLevel={currentZoomLevel}
          parseDate={parseDate}
          getEventSide={getEventSide}
          selectedId={selectedId}
          groupedItems={groupedItems}
          glassMarkers={glassMarkers}
          format={formatDateFn}
          style={style}
        />
      );
    });
  };
  
  const renderEmptyState = () => {
    return (
      <EmptyStateMessage>
        No timeline events to display
      </EmptyStateMessage>
    );
  };
  
  return (
    <TimelineContainer
      ref={localContainerRef}
      $orientation={orientation}
      className={`glass-timeline ${className || ''}`}
      style={{ width, height }}
      {...restProps}
    >
      {/* Timeline Controls */}
      {navigation && navigation !== 'none' && (
        <TimelineControls
          orientation={orientation}
          position={'top'}
          currentZoomLevel={currentZoomLevel}
          zoomLevels={zoomLevels}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
          goToToday={goToToday}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          color={color}
          glassVariant={glassVariant}
          blurStrength={blurStrength}
        />
      )}
      
      {/* Timeline body with physics scrolling */}
      <TimelineScrollContainer
        ref={scrollContainerRef}
        $orientation={orientation}
        $scrollX={physicsScrollPosition.x}
        $scrollY={physicsScrollPosition.y}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        style={{
          transform: `translate3d(${physicsScrollPosition.x}px, ${physicsScrollPosition.y}px, 0px)`
        }}
        tabIndex={0}
      >
        {/* Timeline Axis */}
        {showAxis && (
          <TimelineAxis
            $orientation={orientation}
            $markerPosition={markerPosition}
            $color={color}
            $height={40}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
          >
            {renderAxis ? renderAxis(currentViewMode, currentZoomLevel) : formatDate(new Date(), currentViewMode, currentZoomLevel)}
          </TimelineAxis>
        )}
        
        {/* Timeline Markers */}
        {markers.show && (
          <TimelineMarkers
            markers={markers}
            timeMarkers={timeMarkers}
            orientation={orientation}
            markerHeight={40}
            calculateItemPosition={calculateItemPositionPercent}
            formatMarkerLabel={formatMarkerLabel}
            color={color}
          />
        )}
        
        {/* Timeline Events */}
        <TimelineEvents
          ref={eventsContainerRef}
          $orientation={orientation}
          $markerPosition={markerPosition}
          $density={density}
        >
          {loadingPast && (
            <LoadingIndicator $position="start" $orientation={orientation}>
              Loading past events...
            </LoadingIndicator>
          )} 
          {filteredItems.length === 0 && !loadingPast && !loadingFuture && renderEmptyState()}
          {renderEvents()}
          {loadingFuture && (
            <LoadingIndicator $position="end" $orientation={orientation}>
              Loading future events...
            </LoadingIndicator>
          )}
        </TimelineEvents>
      </TimelineScrollContainer>
    </TimelineContainer>
  );
});

// Set displayName for better debugging
GlassTimeline.displayName = "GlassTimeline";

export default GlassTimeline;