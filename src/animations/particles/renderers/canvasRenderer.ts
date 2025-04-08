import { Particle, ParticleRendering, Vector2D } from '../../../types/particles';

/**
 * Canvas Particle Renderer
 *
 * Renders particles onto a 2D Canvas context.
 */
export class CanvasParticleRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderingOptions: Required<ParticleRendering>;
  private particleImages: Record<string, HTMLImageElement> = {};
  private imageLoadingStatus: Record<string, 'loading' | 'loaded' | 'error' > = {};

  constructor(canvas: HTMLCanvasElement, options: Required<ParticleRendering>) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.renderingOptions = options;
    this.preloadImage();
  }

  /** Preloads the particle image if specified */
  private preloadImage(): void {
    const imageUrl = this.renderingOptions.particleImage;
    if (imageUrl && !this.particleImages[imageUrl] && this.imageLoadingStatus[imageUrl] !== 'loading') {
      this.imageLoadingStatus[imageUrl] = 'loading';
      const img = new Image();
      img.onload = () => {
        this.particleImages[imageUrl] = img;
        this.imageLoadingStatus[imageUrl] = 'loaded';
        // console.log(`Particle image loaded: ${imageUrl}`);
      };
      img.onerror = () => {
          this.imageLoadingStatus[imageUrl] = 'error';
          console.error(`Failed to load particle image: ${imageUrl}`);
          // this.renderingOptions.particleImage = ''; // Avoid modifying options directly here
      };
      img.src = imageUrl;
    }
  }

  /** Updates the rendering options */
  public updateOptions(options: Required<ParticleRendering>): void {
    const oldImageUrl = this.renderingOptions.particleImage;
    this.renderingOptions = options;
    // Preload new image if it changed
    if (this.renderingOptions.particleImage && this.renderingOptions.particleImage !== oldImageUrl) {
        this.preloadImage();
    }
  }

  /** Clears the canvas */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renders a single frame with the given particles.
   * @param particles Array of particles to render.
   */
  public render(particles: ReadonlyArray<Particle>): void {
    this.clear();
    // Ensure blend mode is valid, fallback if needed
    this.ctx.globalCompositeOperation = this.renderingOptions.blendMode || 'source-over';

    const imageUrl = this.renderingOptions.particleImage;
    const image = imageUrl ? this.particleImages[imageUrl] : null;
    const imageStatus = imageUrl ? this.imageLoadingStatus[imageUrl] : undefined;
    const canDrawImage = image && imageStatus === 'loaded';

    particles.forEach((p) => {
      if (!p.isAlive) return;

      this.ctx.save();
      this.ctx.translate(p.position.x, p.position.y);
      this.ctx.rotate(p.rotation * (Math.PI / 180)); 
      this.ctx.scale(p.scale, p.scale);
      // Clamp opacity just in case
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

      if (canDrawImage && image) {
        const imgWidth = image.width;
        const imgHeight = image.height;
        // Draw centered
        this.ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        // TODO: Apply imageColorTint if needed (requires temporary canvas manipulation)
      } else {
        // Draw fallback circle if no image or image not loaded/error
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        // Simple circle fallback, size could be adjusted (e.g., based on p.scale)
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2); 
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    // Reset global alpha and blend mode after drawing all particles
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = 'source-over'; // Reset to default
  }
} 