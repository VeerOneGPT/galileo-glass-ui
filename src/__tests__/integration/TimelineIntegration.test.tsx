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
  // ... (rest of the test file using 'render' which now comes from test-utils) ...
});