/**
 * Provides simple haptic feedback using the navigator.vibrate API.
 * Note: Browser support and intensity control are limited.
 */

/**
 * Triggers haptic feedback.
 * 
 * @param type Predefined feedback type (maps to vibration pattern/duration).
 */
export const triggerHapticFeedback = (
    type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
): void => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        let pattern: number | number[];

        switch (type) {
            case 'light':
                pattern = 10; // Short, weak vibration
                break;
            case 'medium':
                pattern = [30, 20, 30]; // Slightly longer/stronger pulse
                break;
            case 'heavy':
                pattern = 50; // Stronger single vibration
                break;
            case 'success':
                pattern = [20, 50, 20]; // Quick double buzz
                break;
            case 'warning':
                pattern = [50, 50, 50]; // Longer buzz pattern
                break;
            case 'error':
                pattern = 100; // Longer single buzz
                break;
            case 'selection':
                pattern = 5; // Very short tick
                break;
            default:
                pattern = 10; // Default to light
        }

        try {
            window.navigator.vibrate(pattern);
        } catch (e) {
            // Vibration might be unsupported or fail
            // console.warn("Haptic feedback failed:", e);
        }
    } else {
        // console.log('Haptic feedback not supported.');
    }
}; 