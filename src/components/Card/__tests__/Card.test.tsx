import React from 'react';
import { render, screen, fireEvent } from '../../../test/utils/test-utils';
import 'jest-styled-components';

import { ThemeProvider } from '../../../theme';
import { Card } from '../Card';
import { glassSurface } from '../../../core/mixins/glassSurface';
import { glassGlow } from '../../../core/mixins/effects/glowEffects';

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

  test('renders with default props and applies glassSurface', () => {
    renderWithTheme(<Card>Default Card</Card>);
    expect(screen.getByText('Default Card')).toBeInTheDocument();
    // Check for a style applied by glassSurface, e.g., backdrop-filter
    expect(screen.getByText('Default Card').parentElement).toHaveStyleRule('backdrop-filter', expect.stringContaining('blur')); 
  });

  test('handles click events', async () => {
    const handleClick = jest.fn();
    renderWithTheme(<Card onClick={handleClick} data-testid="card-click">Click Me</Card>);

    const card = await screen.findByTestId('card-click'); 
    
    // Wrap event firing in React.act
    React.act(() => {
        fireEvent.click(card);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies glow effect when specified', () => {
    renderWithTheme(<Card glow="medium" glowColor="secondary">Glow Card</Card>);
    // Check for box-shadow applied by glassGlow
    expect(screen.getByText('Glow Card').parentElement).toHaveStyleRule('box-shadow', expect.stringContaining('rgba')); 
  });

  test('renders Card with outlined variant', () => {
    const { container } = renderWithTheme(<Card variant="outlined">Outlined Card</Card>);
    // Check for a style more specific to 'outlined' if possible
    // For now, check if border-color is not the default glass border
    // This assumes outlined uses a different border mechanism
     expect(container.firstChild).toHaveStyleRule('border-width', '1px'); // Assuming outlined adds a border
     // A more robust check might involve snapshot testing or inspecting theme application
  });

  test('handles click events on Card (alternative test)', async () => {
    const handleClick = jest.fn();
    renderWithTheme(<Card onClick={handleClick} data-testid="alt-click">Click Me</Card>);

    const card = await screen.findByTestId('alt-click-clickable');
    
    // Wrap event firing in React.act
    React.act(() => {
      fireEvent.click(card);
    });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Card with title', () => {
    const { getByText } = render(<Card title="My Card Title">Content</Card>);
    // Verify the title is rendered
    expect(getByText('My Card Title')).toBeInTheDocument();
  });

  test('renders children correctly', () => {
    render(<Card>Test Content</Card>);
  });
});
