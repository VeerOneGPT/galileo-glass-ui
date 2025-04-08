import { useMemo } from 'react';
import { useDeviceCapabilities } from './useDeviceCapabilities';
import { QualityTier, DeviceCapabilities } from '../types/accessibility';

// Simple heuristics to determine quality tier based on capabilities
const determineQualityTier = (capabilities: DeviceCapabilities): QualityTier => {
    const { cpuCores, deviceMemory } = capabilities;

    // Ultra tier - High-end devices
    if (cpuCores && cpuCores >= 12 && deviceMemory && deviceMemory >= 16) {
        return QualityTier.ULTRA;
    }
    // High tier - Good desktop/laptop/high-end mobile
    if (cpuCores && cpuCores >= 8 && deviceMemory && deviceMemory >= 8) {
        return QualityTier.HIGH;
    }
    // Medium tier - Mid-range devices
    if (cpuCores && cpuCores >= 4 && deviceMemory && deviceMemory >= 4) {
        return QualityTier.MEDIUM;
    }
    // Low tier - Low-end mobile or older devices
    // Defaulting to Low if capabilities are unknown or below thresholds
    return QualityTier.LOW;
};

/**
 * Hook to determine the performance quality tier based on detected device capabilities.
 */
export const useQualityTier = (): QualityTier => {
    const capabilities = useDeviceCapabilities();

    const qualityTier = useMemo(() => {
        return determineQualityTier(capabilities);
    }, [capabilities]); // Recalculate only when capabilities change

    return qualityTier;
}; 