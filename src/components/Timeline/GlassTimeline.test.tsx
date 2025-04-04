import React, { useRef, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { GlassTimeline } from './GlassTimeline'; // Adjust import path
import { TimelineItem, TimelineRef } from './types'; // Import necessary types
// import { vi } from 'vitest'; // Comment out

// Sample data using TimelineItem type
const sampleItems: TimelineItem[] = [
  { id: '1', date: '2023-01-15', title: 'Event 1', content: 'Content 1' },
  { id: '2', date: '2023-03-22', title: 'Event 2', content: 'Content 2' },
];

// Correct mock path and structure
jest.mock('./components/TimelineEvent', () => 
    jest.fn(({ item, isActive }) => (
        <div data-testid={`event-${item.id}`} data-active={isActive}>{item.title}</div>
    ))
);
// Correct mock path/name and structure, handle undefined date
jest.mock('./components/TimelineMarkers', () => 
    jest.fn(({ date }) => <div data-testid="marker">{date ? date.toISOString() : 'Invalid Date'}</div>)
);
// Mock TimelineControls component
jest.mock('./components/TimelineControls', () => ({
    __esModule: true, 
    default: jest.fn(() => <div data-testid="timeline-controls">Mock Controls</div>)
}));

jest.mock('../../hooks/useGalileoSprings', () => ({
    useGalileoSprings: jest.fn((count, configFn) => {
        return Array.from({ length: count }, (_, i) => ({
            style: { opacity: 1, transform: 'none' }, 
            ref: { current: null },
        }));
    })
}));

// Correct mock path for styles and update mocks within
jest.mock('./styles', () => { 
    const styled = require('styled-components');
    const React = require('react'); 

    interface MockContainerProps {
      $orientation?: string;
      $glassVariant?: string;
      $blurStrength?: string; 
      $color?: string; 
      className?: string;
      style?: React.CSSProperties;
      children?: React.ReactNode;
      // Explicitly add data-testid if needed, avoid index signature
      'data-testid'?: string;
    }
    
    const MockStyledTimelineControls = styled.default.div<MockContainerProps>` 
      border: 1px solid red; 
    `;

    // Define the component function separately
    const TimelineContainerComponent = (
      { children, $orientation, $glassVariant, $blurStrength, $color, ...restProps }: MockContainerProps, 
      ref: React.Ref<HTMLDivElement>
    ) => (
        <div ref={ref} {...restProps}>{children}</div>
    );
    const MockTimelineContainer = React.forwardRef(TimelineContainerComponent);

    return {
        StyledTimelineControls: MockStyledTimelineControls, 
        TimelineContainer: MockTimelineContainer, 
        TimelineEventContainer: styled.default.div``,
        TimelineAxisContainer: styled.default.div``, 
        TimelineToolbar: styled.default.div``,
        TimelineActionButton: styled.default.button``, 
        TimelineButton: styled.default.button``,
        ZoomControls: styled.default.div``,
        ZoomLabel: styled.default.div``, 
        TimelineTrack: styled.default.div``,
        EventGroup: styled.default.div``,
        EventLine: styled.default.div``, 
        EventContent: styled.default.div``,
        EventTitle: styled.default.div``,
        EventDate: styled.default.div``,
        EventDescription: styled.default.div``,
        MarkerContainer: styled.default.div``,
        MarkerLine: styled.default.div``,
        MarkerLabel: styled.default.div``,
        TimelineAxis: styled.default.div``, 
        TimelineEvents: styled.default.div``,
        TimelineScrollContainer: styled.default.div``,
    }
});

describe('GlassTimeline', () => {
  it('should render items', () => {
    render(<GlassTimeline items={sampleItems} />); 
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('should forward ref and expose imperative handle methods', () => {
    const TestComponent = () => {
      const timelineRef = useRef<TimelineRef>(null);
      
      useEffect(() => {
        expect(timelineRef.current?.scrollToDate).toBeInstanceOf(Function);
        expect(timelineRef.current?.scrollToItem).toBeInstanceOf(Function);
        expect(timelineRef.current?.getContainerElement).toBeInstanceOf(Function);
        expect(timelineRef.current?.getCurrentDate).toBeInstanceOf(Function);
        expect(timelineRef.current?.selectItem).toBeInstanceOf(Function);
      }, []);
      
      return <GlassTimeline items={sampleItems} ref={timelineRef} data-testid="timeline" />;
    };
    render(<TestComponent />);
    const timelineElement = screen.getByTestId('timeline');
    expect(timelineElement).toBeInTheDocument(); // Check if the element with testid is found
  });

  // TODO: Add tests for physics animations, interactions, vertical layout, etc.
}); 