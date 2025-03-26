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
  test('renders with default props', () => {
    renderWithTheme(<Card>Card Content</Card>);

    const cardElement = screen.getByText('Card Content');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement.parentElement).toHaveClass('sc-'); // styled component class
  });

  test('applies hover effect when hover prop is true', () => {
    renderWithTheme(<Card hover>Hoverable Card</Card>);

    const cardElement = screen.getByText('Hoverable Card').parentElement;
    expect(cardElement).toHaveStyle({ cursor: 'pointer' });
  });

  test('handles click events', () => {
    const handleClick = jest.fn();

    renderWithTheme(<Card onClick={handleClick}>Clickable Card</Card>);

    const cardElement = screen.getByText('Clickable Card').parentElement;
    fireEvent.click(cardElement!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies outlined variant when specified', () => {
    renderWithTheme(<Card variant="outlined">Outlined Card</Card>);

    const cardElement = screen.getByText('Outlined Card').parentElement;
    expect(cardElement).toHaveStyle({
      border: '1px solid rgba(255, 255, 255, 0.12)',
      backgroundColor: 'transparent',
    });
  });

  test('applies different elevation levels', () => {
    // Since we've mocked glassSurface, we'll check that it's called with the right elevation
    const { glassSurface } = require('../../../core/mixins/glassSurface');

    renderWithTheme(<Card elevation={3}>Elevated Card</Card>);

    expect(glassSurface).toHaveBeenCalledWith(
      expect.objectContaining({
        elevation: 3,
      })
    );
  });

  test('applies glow effect when specified', () => {
    // Since we've mocked glassGlow, we'll check that it's called with the right params
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    renderWithTheme(
      <Card glow="medium" glowColor="secondary">
        Glowing Card
      </Card>
    );

    expect(glassGlow).toHaveBeenCalledWith(
      expect.objectContaining({
        intensity: 'medium',
        color: 'secondary',
      })
    );
  });
});

describe('GlassCard Component', () => {
  test('renders with glass-specific styling', () => {
    renderWithTheme(<GlassCard>Glass Card</GlassCard>);

    const cardElement = screen.getByText('Glass Card').parentElement;
    expect(cardElement).toHaveClass('glass-card');
  });

  test('has different default props than regular Card', () => {
    // Since we've mocked glassSurface and glassGlow, we'll check that they're called correctly
    const { glassSurface } = require('../../../core/mixins/glassSurface');
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    renderWithTheme(<GlassCard>Default Glass Card</GlassCard>);

    // GlassCard has elevation 2 by default (vs 1 for Card)
    expect(glassSurface).toHaveBeenLastCalledWith(
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
    renderWithTheme(
      <GlassCard elevation={4} hover={false} glow="strong" glowColor="error">
        Custom Glass Card
      </GlassCard>
    );

    const { glassSurface } = require('../../../core/mixins/glassSurface');
    const { glassGlow } = require('../../../core/mixins/effects/glowEffects');

    // Custom elevation
    expect(glassSurface).toHaveBeenLastCalledWith(
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

    // hover=false
    const cardElement = screen.getByText('Custom Glass Card').parentElement;
    expect(cardElement).not.toHaveStyle({ cursor: 'pointer' });
  });
});
