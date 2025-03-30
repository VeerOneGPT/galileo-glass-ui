/**
 * Galileo Glass UI - Mixins
 */

// Surface mixins
export { glassSurface } from './glassSurface';
export { glassBorder } from './glassBorder';
export { backgroundEffects } from './backgroundEffects';

// Effects mixins
export { glowEffects } from './effects/glowEffects';
export { edgeHighlight } from './effects/edgeEffects';
export { innerGlow } from './effects/innerEffects';
export { ambientEffects } from './effects/ambientEffects';
export { shadowEffect, type ShadowEffectOptions } from './effects/shadow';
export { reflectionEffect, type ReflectionEffectOptions } from './effects/reflection';

// Enhanced Effects mixins
export { enhancedGlowEffects, enhancedGlow } from '../effects/enhancedGlowEffects';
export { contextAwareGlass, adaptiveGlass } from '../effects/contextAwareGlass';

// Interaction mixins
export { interactiveGlass } from './interactions/interactiveGlass';
export { focusEffects } from './interactions/focusEffects';
export { hoverEffects } from './interactions/hoverEffects';

// Depth mixins
export { zSpaceLayer } from './depth/zSpaceLayer';
export { depthEffects } from './depth/depthEffects';

// Typography mixins
export { textStyles } from './typography/textStyles';

// Accessibility mixins
export { highContrast } from './accessibility/highContrast';
export { reducedTransparency } from './accessibility/reducedTransparency';
export { focusStyles } from './accessibility/focusStyles';
export { visualFeedback } from './accessibility/visualFeedback';
