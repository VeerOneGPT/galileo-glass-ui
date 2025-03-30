/**
 * AtmosphericEffects Component
 * 
 * Provides enhanced visual effects for charts, creating an atmospheric
 * background with dynamic lighting and particles. The effects automatically
 * adjust based on quality tier settings.
 */
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { atmosphericMovement } from '../../../animations/keyframes/chartAnimations';
import { QualityTier } from '../hooks/useQualityTier';
import { getQualityBasedFilters } from '../utils/ChartAnimationUtils';

export interface AtmosphericEffectsProps {
  /** Current quality tier */
  qualityTier: QualityTier;
  /** Base color for atmospheric effects */
  color: string;
  /** Whether user prefers reduced motion */
  isReducedMotion?: boolean;
  /** Additional class name */
  className?: string;
  /** Height of container (in pixels) */
  height?: number;
}

// Styled components for the atmospheric effects
const AtmosphereContainer = styled.div<{
  $color: string;
  $isReducedMotion: boolean;
}>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
`;

const AtmosphereGlow = styled.div<{
  $color: string;
  $quality: QualityTier;
  $isReducedMotion: boolean;
}>`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    ${props => {
      const baseColor = props.$color || 'primary';
      let color;
      
      switch (baseColor) {
        case 'primary':
          color = 'rgba(99, 102, 241, 0.15)';
          break;
        case 'secondary':
          color = 'rgba(139, 92, 246, 0.15)';
          break;
        case 'info':
          color = 'rgba(59, 130, 246, 0.15)';
          break;
        case 'success':
          color = 'rgba(16, 185, 129, 0.15)';
          break;
        case 'warning':
          color = 'rgba(245, 158, 11, 0.15)';
          break;
        case 'error':
          color = 'rgba(239, 68, 68, 0.15)';
          break;
        default:
          color = 'rgba(99, 102, 241, 0.15)';
      }
      
      return color;
    }},
    transparent 70%
  );
  opacity: 0.5;
  animation: ${props => props.$isReducedMotion ? 'none' : atmosphericMovement} 
    ${props => props.$quality === 'low' ? '40s' : '30s'} 
    ease-in-out infinite;
  filter: blur(${props => props.$quality === 'low' ? '10px' : 
    props.$quality === 'medium' ? '15px' :
    props.$quality === 'high' ? '20px' : '25px'});
`;

const ParticleLayer = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  pointer-events: none;
`;

/**
 * AtmosphericEffects Component
 * 
 * Creates ambient atmospheric effects for the chart background
 * with quality-based adjustments.
 */
export const AtmosphericEffects: React.FC<AtmosphericEffectsProps> = ({
  qualityTier,
  color,
  isReducedMotion = false,
  className,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Quality-based particle settings
  const getParticleCount = () => {
    switch (qualityTier) {
      case 'ultra': return 60;
      case 'high': return 40;
      case 'medium': return 25;
      case 'low': return isReducedMotion ? 0 : 15;
      default: return 25;
    }
  };
  
  // Initialize particle system
  useEffect(() => {
    if (isReducedMotion || qualityTier === 'low') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
    };
    
    setDimensions();
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
        
        // Get color with alpha
        let particleColor;
        switch (color) {
          case 'primary': particleColor = '99, 102, 241'; break;
          case 'secondary': particleColor = '139, 92, 246'; break;
          case 'info': particleColor = '59, 130, 246'; break;
          case 'success': particleColor = '16, 185, 129'; break;
          case 'warning': particleColor = '245, 158, 11'; break;
          case 'error': particleColor = '239, 68, 68'; break;
          default: particleColor = '255, 255, 255';
        }
        
        this.alpha = Math.random() * 0.3 + 0.1;
        this.color = `rgba(${particleColor}, ${this.alpha})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.speedX *= -1;
        }
        
        if (this.y > canvas.height || this.y < 0) {
          this.speedY *= -1;
        }
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const particleCount = getParticleCount();
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    let animationFrame: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      setDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [qualityTier, color, isReducedMotion]);
  
  return (
    <AtmosphereContainer 
      className={className}
      $color={color}
      $isReducedMotion={isReducedMotion}
    >
      <AtmosphereGlow 
        $color={color}
        $quality={qualityTier}
        $isReducedMotion={isReducedMotion}
      />
      {(!isReducedMotion && qualityTier !== 'low') && (
        <ParticleLayer ref={canvasRef} />
      )}
    </AtmosphereContainer>
  );
};

export default AtmosphericEffects; 