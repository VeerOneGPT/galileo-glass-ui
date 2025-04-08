import { useState, useEffect } from 'react';
import type { DeviceCapabilities } from '../types/accessibility';

// Define the extended types locally for type assertion usage
// These might not perfectly match all browser implementations
interface ExtendedNetworkInformation extends EventTarget {
    readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    readonly saveData?: boolean;
    onchange?: ((this: ExtendedNetworkInformation, ev: Event) => any) | null;
}
interface NavigatorWithDeviceCapabilities {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: ExtendedNetworkInformation;
}

/**
 * Hook to detect various device capabilities relevant for performance tuning.
 */
export const useDeviceCapabilities = (): Readonly<DeviceCapabilities> => {
    const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => {
        // Initial detection (synchronous parts)
        const nav = navigator as unknown as NavigatorWithDeviceCapabilities;
        const conn = nav.connection;
        const initialCaps: DeviceCapabilities = {
            cpuCores: nav.hardwareConcurrency,
            deviceMemory: nav.deviceMemory,
            connectionType: conn?.effectiveType || 'unknown',
            saveData: conn?.saveData || false,
        };
        return initialCaps;
    });

    // Effect for asynchronous updates (like network changes)
    useEffect(() => {
        const nav = navigator as unknown as NavigatorWithDeviceCapabilities;
        const connection = nav.connection;

        const updateNetworkCapabilities = () => {
            // Re-read current values inside the handler
            const currentConn = (navigator as unknown as NavigatorWithDeviceCapabilities).connection;
            setCapabilities(prev => ({
                ...prev,
                connectionType: currentConn?.effectiveType || 'unknown',
                saveData: currentConn?.saveData || false,
            }));
        };

        if (connection && typeof connection.addEventListener === 'function') {
            connection.addEventListener('change', updateNetworkCapabilities);
            // Initial update 
            updateNetworkCapabilities(); 
        }

        return () => {
            if (connection && typeof connection.removeEventListener === 'function') {
                try {
                    connection.removeEventListener('change', updateNetworkCapabilities);
                } catch(e) {/* Ignore */} 
            }
        };
    }, []);

    return capabilities;
}; 