/**
 * Optimized Styles
 *
 * CSS style optimizations for performance.
 */

/**
 * Get CSS styles for GPU acceleration
 * @returns CSS properties for GPU acceleration
 */
export const getGPUAccelerationStyles = () => ({
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  willChange: 'transform, opacity',
});

/**
 * Create transform styles optimized for performance
 * @param transforms The transform values to apply
 * @returns Optimized transform CSS
 */
export const getOptimizedTransforms = (transforms: { [key: string]: string | number }) => {
  const transformValues = [];

  if (transforms.translateX) {
    transformValues.push(
      `translateX(${transforms.translateX}${typeof transforms.translateX === 'number' ? 'px' : ''})`
    );
  }

  if (transforms.translateY) {
    transformValues.push(
      `translateY(${transforms.translateY}${typeof transforms.translateY === 'number' ? 'px' : ''})`
    );
  }

  if (transforms.translateZ) {
    transformValues.push(
      `translateZ(${transforms.translateZ}${typeof transforms.translateZ === 'number' ? 'px' : ''})`
    );
  }

  if (transforms.scale) {
    transformValues.push(`scale(${transforms.scale})`);
  }

  if (transforms.scaleX) {
    transformValues.push(`scaleX(${transforms.scaleX})`);
  }

  if (transforms.scaleY) {
    transformValues.push(`scaleY(${transforms.scaleY})`);
  }

  if (transforms.rotate) {
    transformValues.push(
      `rotate(${transforms.rotate}${typeof transforms.rotate === 'number' ? 'deg' : ''})`
    );
  }

  if (transforms.rotateX) {
    transformValues.push(
      `rotateX(${transforms.rotateX}${typeof transforms.rotateX === 'number' ? 'deg' : ''})`
    );
  }

  if (transforms.rotateY) {
    transformValues.push(
      `rotateY(${transforms.rotateY}${typeof transforms.rotateY === 'number' ? 'deg' : ''})`
    );
  }

  return {
    transform: transformValues.join(' '),
    // Add will-change for properties that are being transformed
    willChange: 'transform',
  };
};
