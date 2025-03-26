import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Card, GlassCard } from '../Card';

// Mock the glassSurface and glassGlow mixins
jest.mock('../../../core/mixins/glassSurface', () => ({
  glassSurface: jest.fn(() => 'mocked-glass-surface'),
}));

jest.mock('../../../core/mixins/effects/glowEffects', () => ({
  glassGlow: jest.fn(() => 'mocked-glass-glow'),
}));

// Test wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    renderWithTheme(<Card>Card Content</Card>);

    // Check that the content is rendered
    expect(screen.getByText('Card Content')).toBeInTheDocument();

    // Check that glassSurface is called with default props
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    expect(glassSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        elevation: 1,
        blurStrength: 'standard',
        backgroundOpacity: 'light',
        borderOpacity: 'subtle',
      })
    );
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Card onClick={handleClick}>Clickable Card</Card>);

    // Find the element and simulate a click
    const element = screen.getByText('Clickable Card');
    element.click();

    // Verify the click handler was called
    expect(handleClick).toHaveBeenCalled();
  });

  test('applies different elevation levels', () => {
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    renderWithTheme(<Card elevation={3}>Elevated Card</Card>);

    // Verify glassSurface is called with the right elevation
    expect(glassSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        elevation: 3,
      })
    );
  });

  test('applies glow effect when specified', () => {
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    renderWithTheme(
      <Card glow="medium" glowColor="secondary">
        Glowing Card
      </Card>
    );

    // Verify glassGlow is called with the right params
    expect(glassGlow).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: 'medium',
        color: 'secondary',
      })
    );
  });
});

describe('GlassCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with glass-specific styling', () => {
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    renderWithTheme(<GlassCard>Glass Card</GlassCard>);

    // Verify that the content is rendered
    expect(screen.getByText('Glass Card')).toBeInTheDocument();

    // Verify that glassSurface and glassGlow were called
    expect(glassSurface).toHaveBeenCalled();
    expect(glassGlow).toHaveBeenCalled();
  });

  test('has different default props than regular Card', () => {
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    // Clear previous calls
    jest.clearAllMocks();

    renderWithTheme(<GlassCard>Default Glass Card</GlassCard>);

    // GlassCard has elevation 2 by default (vs 1 for Card)
    expect(glassSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        elevation: 2,
      })
    );

    // GlassCard has subtle glow by default (vs none for Card)
    expect(glassGlow).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: 'subtle',
      })
    );
  });

  test('allows overriding default props', () => {
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    // Clear previous calls
    jest.clearAllMocks();

    renderWithTheme(
      <GlassCard elevation={4} glow="strong" glowColor="error">
        Custom Glass Card
      </GlassCard>
    );

    // Verify that the content is rendered
    expect(screen.getByText('Custom Glass Card')).toBeInTheDocument();

    // Custom elevation
    expect(glassSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        elevation: 4,
      })
    );

    // Custom glow
    expect(glassGlow).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: 'strong',
        color: 'error',
      })
    );
  });
});
