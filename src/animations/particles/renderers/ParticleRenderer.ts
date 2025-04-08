import { Particle } from '../particleEngine';

/**
 * Options for rendering particles
 */
export interface ParticleRenderOptions {
  /** Width of the rendering canvas */
  width: number;
  /** Height of the rendering canvas */
  height: number;
  /** CSS blend mode to apply */
  blendMode?: 'source-over' | 'multiply' | 'screen' | 'lighter';
}

/**
 * Interface for particle renderers
 */
export interface ParticleRenderer {
  /**
   * Set a texture image for the particles
   * @param image Optional image to use as particle texture
   */
  setTexture(image: HTMLImageElement | null): void;
  
  /**
   * Resize the rendering canvas
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number): void;
  
  /**
   * Clear the rendering canvas
   */
  clear(): void;
  
  /**
   * Render a batch of particles
   * @param particles Array of particles to render
   * @param options Rendering options
   */
  render(particles: Particle[], options: ParticleRenderOptions): void;
  
  /**
   * Dispose of resources
   */
  dispose(): void;
} 