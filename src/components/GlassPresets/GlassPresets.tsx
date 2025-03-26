import React, { forwardRef } from 'react';

import { ZLayer } from '../../core/zspace';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { ContextAwareGlass, ContextAwareGlassProps } from '../ContextAwareGlass';

/**
 * CleanGlassContainer Props
 *
 * A minimal, clean glass container with high transparency.
 */
export interface CleanGlassContainerProps extends Omit<ContextAwareGlassProps, 'adaptationMode'> {
  /**
   * If true, use the darkest possible settings
   */
  extraDark?: boolean;
}

/**
 * CleanGlassContainer Component
 *
 * A minimal, clean glass container with high transparency.
 */
export const CleanGlassContainer = forwardRef<HTMLDivElement, CleanGlassContainerProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 5,
      baseOpacity = 0.1,
      baseBorderOpacity = 0.15,
      enableEdgeHighlight = false,
      enableGlow = false,
      extraDark = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="fixed"
        baseBlurStrength={extraDark ? 7 : baseBlurStrength}
        baseOpacity={extraDark ? 0.2 : baseOpacity}
        baseBorderOpacity={extraDark ? 0.25 : baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      />
    );
  }
);

CleanGlassContainer.displayName = 'CleanGlassContainer';

/**
 * FrostedGlassContainer Component
 *
 * A frosted glass container with moderate blur and opacity.
 */
export const FrostedGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 12,
      baseOpacity = 0.2,
      baseBorderOpacity = 0.25,
      enableEdgeHighlight = true,
      enableGlow = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="background"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      />
    );
  }
);

FrostedGlassContainer.displayName = 'FrostedGlassContainer';

/**
 * TexturedGlassContainer Component
 *
 * A textured glass container with noise pattern.
 */
export const TexturedGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 8,
      baseOpacity = 0.15,
      baseBorderOpacity = 0.3,
      enableEdgeHighlight = true,
      enableGlow = false,
      children,
      ...rest
    } = props;

    // Add a noise texture overlay
    const noiseTexture = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.05,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    );

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="hybrid"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      >
        {noiseTexture}
        <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
      </ContextAwareGlass>
    );
  }
);

TexturedGlassContainer.displayName = 'TexturedGlassContainer';

/**
 * SubtleGlassContainer Component
 *
 * A subtle glass container with minimal effects.
 */
export const SubtleGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 3,
      baseOpacity = 0.08,
      baseBorderOpacity = 0.1,
      enableEdgeHighlight = false,
      enableGlow = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="content"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      />
    );
  }
);

SubtleGlassContainer.displayName = 'SubtleGlassContainer';

/**
 * StandardGlassContainer Component
 *
 * A standard glass container with balanced effects.
 */
export const StandardGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 10,
      baseOpacity = 0.15,
      baseBorderOpacity = 0.2,
      enableEdgeHighlight = true,
      enableGlow = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="auto"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      />
    );
  }
);

StandardGlassContainer.displayName = 'StandardGlassContainer';

/**
 * ImmersiveGlassContainer Component
 *
 * An immersive glass container with strong effects.
 */
export const ImmersiveGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 15,
      baseOpacity = 0.12,
      baseBorderOpacity = 0.3,
      enableEdgeHighlight = true,
      enableGlow = true,
      glowColor = '#6366F1',
      ...rest
    } = props;

    const { theme } = useGlassTheme();

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="immersive"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        glowColor={glowColor || theme.colors.primary}
        {...rest}
      />
    );
  }
);

ImmersiveGlassContainer.displayName = 'ImmersiveGlassContainer';

/**
 * DashboardGlassContainer Component
 *
 * A glass container optimized for dashboard UIs.
 */
export const DashboardGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 8,
      baseOpacity = 0.15,
      baseBorderOpacity = 0.2,
      enableEdgeHighlight = true,
      enableGlow = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="content"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        {...rest}
      />
    );
  }
);

DashboardGlassContainer.displayName = 'DashboardGlassContainer';

/**
 * FormGlassContainer Component
 *
 * A glass container optimized for forms.
 */
export const FormGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 7,
      baseOpacity = 0.2,
      baseBorderOpacity = 0.25,
      enableEdgeHighlight = true,
      enableGlow = false,
      ...rest
    } = props;

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="contrast"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        contentType="form"
        {...rest}
      />
    );
  }
);

FormGlassContainer.displayName = 'FormGlassContainer';

/**
 * ModalGlassContainer Component
 *
 * A glass container optimized for modals and dialogs.
 */
export const ModalGlassContainer = forwardRef<HTMLDivElement, ContextAwareGlassProps>(
  (props, ref) => {
    const {
      baseBlurStrength = 12,
      baseOpacity = 0.2,
      baseBorderOpacity = 0.25,
      enableEdgeHighlight = true,
      enableGlow = true,
      glowColor,
      ...rest
    } = props;

    const { theme } = useGlassTheme();

    return (
      <ContextAwareGlass
        ref={ref}
        adaptationMode="hybrid"
        baseBlurStrength={baseBlurStrength}
        baseOpacity={baseOpacity}
        baseBorderOpacity={baseBorderOpacity}
        enableEdgeHighlight={enableEdgeHighlight}
        enableGlow={enableGlow}
        glowColor={glowColor || theme.colors.primary}
        {...rest}
      />
    );
  }
);

ModalGlassContainer.displayName = 'ModalGlassContainer';
