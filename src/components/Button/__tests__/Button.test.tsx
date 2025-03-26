import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Button, GlassButton } from '../Button';

// Test wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(<Button>Click Me</Button>);

    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('applies variant styles correctly', () => {
    const { rerender } = renderWithTheme(<Button variant="contained">Contained</Button>);

    let button = screen.getByRole('button', { name: /Contained/i });
    expect(button).toHaveStyleRule('background-color', '#6366F1');

    rerender(
      <ThemeProvider>
        <Button variant="outlined">Outlined</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Outlined/i });
    expect(button).toHaveStyleRule('border', '1px solid #6366F1');

    rerender(
      <ThemeProvider>
        <Button variant="text">Text</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Text/i });
    expect(button).toHaveStyleRule('color', '#6366F1');
    expect(button).toHaveStyleRule('background-color', 'transparent');
  });

  test('applies color styles correctly', () => {
    const { rerender } = renderWithTheme(<Button color="primary">Primary</Button>);

    let button = screen.getByRole('button', { name: /Primary/i });
    expect(button).toHaveStyleRule('background-color', '#6366F1');

    rerender(
      <ThemeProvider>
        <Button color="secondary">Secondary</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Secondary/i });
    expect(button).toHaveStyleRule('background-color', '#8B5CF6');

    rerender(
      <ThemeProvider>
        <Button color="success">Success</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Success/i });
    expect(button).toHaveStyleRule('background-color', '#10B981');
  });

  test('applies size styles correctly', () => {
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);

    let button = screen.getByRole('button', { name: /Small/i });
    expect(button).toHaveStyleRule('padding', '6px 16px');
    expect(button).toHaveStyleRule('font-size', '0.8125rem');

    rerender(
      <ThemeProvider>
        <Button size="medium">Medium</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Medium/i });
    expect(button).toHaveStyleRule('padding', '8px 20px');
    expect(button).toHaveStyleRule('font-size', '0.875rem');

    rerender(
      <ThemeProvider>
        <Button size="large">Large</Button>
      </ThemeProvider>
    );

    button = screen.getByRole('button', { name: /Large/i });
    expect(button).toHaveStyleRule('padding', '10px 22px');
    expect(button).toHaveStyleRule('font-size', '0.9375rem');
  });

  test('renders as disabled when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', { name: /Disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveStyleRule('opacity', '0.5');
    expect(button).toHaveStyleRule('pointer-events', 'none');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button', { name: /Click Me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('GlassButton Component', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(<GlassButton>Glass Button</GlassButton>);

    const button = screen.getByRole('button', { name: /Glass Button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('glass-button');
  });

  test('passes props to Button component', () => {
    renderWithTheme(
      <GlassButton variant="outlined" color="secondary" size="large" disabled>
        Glass Button
      </GlassButton>
    );

    const button = screen.getByRole('button', { name: /Glass Button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveStyleRule('border', '1px solid #8B5CF6');
    expect(button).toHaveStyleRule('color', '#8B5CF6');
    expect(button).toHaveStyleRule('font-size', '0.9375rem');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<GlassButton onClick={handleClick}>Click Me</GlassButton>);

    const button = screen.getByRole('button', { name: /Click Me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
