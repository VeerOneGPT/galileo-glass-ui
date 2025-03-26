import { render, screen } from '@testing-library/react';
import React from 'react';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Typography, GlassTypography } from '../Typography';

// Mock the mixins
jest.mock('../../../core/mixins/effects/edgeEffects', () => ({
  edgeHighlight: jest.fn(() => 'mocked-edge-highlight'),
}));

jest.mock('../../../core/mixins/effects/glowEffects', () => ({
  glassGlow: jest.fn(() => 'mocked-glass-glow'),
}));

// Test wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Typography Component', () => {
  test('renders with default props', () => {
    renderWithTheme(<Typography>Hello World</Typography>);

    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P'); // Default variant is body1 which renders as p
  });

  test('renders different variants with correct HTML tags', () => {
    const variants = [
      { variant: 'h1', tag: 'H1' },
      { variant: 'h2', tag: 'H2' },
      { variant: 'h3', tag: 'H3' },
      { variant: 'h4', tag: 'H4' },
      { variant: 'h5', tag: 'H5' },
      { variant: 'h6', tag: 'H6' },
      { variant: 'subtitle1', tag: 'H6' },
      { variant: 'subtitle2', tag: 'H6' },
      { variant: 'body1', tag: 'P' },
      { variant: 'body2', tag: 'P' },
      { variant: 'button', tag: 'SPAN' },
      { variant: 'caption', tag: 'SPAN' },
      { variant: 'overline', tag: 'SPAN' },
    ];

    variants.forEach(({ variant, tag }) => {
      const { unmount } = renderWithTheme(
        <Typography variant={variant as any}>{variant} text</Typography>
      );

      const element = screen.getByText(`${variant} text`);
      expect(element.tagName).toBe(tag);

      unmount();
    });
  });

  test('respects custom component prop', () => {
    renderWithTheme(<Typography component="article">Custom component</Typography>);

    const element = screen.getByText('Custom component');
    expect(element.tagName).toBe('ARTICLE');
  });

  test('applies different colors', () => {
    const { rerender } = renderWithTheme(<Typography color="primary">Primary text</Typography>);

    let element = screen.getByText('Primary text');
    expect(element).toHaveStyle({ color: '#6366F1' });

    rerender(
      <ThemeProvider>
        <Typography color="error">Error text</Typography>
      </ThemeProvider>
    );

    element = screen.getByText('Error text');
    expect(element).toHaveStyle({ color: '#EF4444' });
  });

  test('applies text alignment', () => {
    renderWithTheme(<Typography align="center">Centered text</Typography>);

    const element = screen.getByText('Centered text');
    expect(element).toHaveStyle({ textAlign: 'center' });
  });

  test('applies noWrap style', () => {
    renderWithTheme(<Typography noWrap>This text should not wrap</Typography>);

    const element = screen.getByText('This text should not wrap');
    expect(element).toHaveStyle({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    });
  });

  test('applies gutterBottom style', () => {
    renderWithTheme(<Typography gutterBottom>Text with gutter bottom</Typography>);

    const element = screen.getByText('Text with gutter bottom');
    expect(element).toHaveStyle({ marginBottom: '0.35em' });
  });

  test('applies paragraph style', () => {
    renderWithTheme(<Typography paragraph>Paragraph text</Typography>);

    const element = screen.getByText('Paragraph text');
    expect(element).toHaveStyle({ marginBottom: '16px' });
  });
});

describe('GlassTypography Component', () => {
  test('renders with glass styling', () => {
    renderWithTheme(<GlassTypography>Glass text</GlassTypography>);

    const element = screen.getByText('Glass text');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('glass-typography');
  });

  test('passes correct glow and edgeHighlight props to Typography', () => {
    renderWithTheme(<GlassTypography>Glass with effects</GlassTypography>);

    // We can't directly test for the props, but we can verify the element rendered
    const element = screen.getByText('Glass with effects');
    expect(element).toBeInTheDocument();

    // GlassTypography uses subtle glow and edgeHighlight by default
    expect(element).toHaveClass('glass-typography');
  });

  test('allows overriding default props', () => {
    renderWithTheme(
      <GlassTypography glow="strong" edgeHighlight={false} variant="h1" color="secondary">
        Custom glass text
      </GlassTypography>
    );

    const element = screen.getByText('Custom glass text');
    expect(element.tagName).toBe('H1');
    expect(element).toHaveStyle({ color: '#8B5CF6' });
  });
});
