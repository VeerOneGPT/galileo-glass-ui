/**
 * Integration tests for GlassTimeline component
 */
import React from 'react';
import { render, fireEvent, screen, waitFor } from '../../test/utils/test-utils';
import GlassTimeline from '../../components/Timeline/GlassTimeline';
import { TimelineItem } from '../../components/Timeline/types';

// Mock ResizeObserver globally if not done in setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('GlassTimeline Integration Tests', () => {
  const sampleData: TimelineItem[] = [
    {
      id: '1',
      date: new Date(2023, 0, 1),
      title: 'Event 1',
      content: 'Description for event 1',
    },
    {
      id: '2',
      date: new Date(2023, 1, 15),
      title: 'Event 2',
      content: 'Description for event 2',
    },
  ];

  it('should render the timeline with data', () => {
    render(<GlassTimeline items={sampleData} />);

    // Check if titles and content are rendered
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Description for event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Description for event 2')).toBeInTheDocument();

    // Optional: Check for date formatting (might need specific queries)
    // expect(screen.getByText(/Jan 1, 2023/i)).toBeInTheDocument(); 
    // expect(screen.getByText(/Feb 15, 2023/i)).toBeInTheDocument();
  });
});