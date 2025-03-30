import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Card } from '../Card';

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

  it('renders Card with outlined variant', () => {
    const { container } = render(<Card variant="outlined">Test</Card>);
    // Check for styles associated with outlined variant if implemented
    // This example assumes styled-components is used and styles are applied via classes or attributes
    expect(container.firstChild).toHaveStyle('border: 1px solid'); // Example check
  });

  it('handles click events on Card', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Card onClick={handleClick}>Click Me</Card>);
    // Verify the click handler was called
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders Card with title', () => {
    const { getByText } = render(<Card title="My Card Title">Content</Card>);
    // Verify the title is rendered
    expect(getByText('My Card Title')).toBeInTheDocument();
  });
});
