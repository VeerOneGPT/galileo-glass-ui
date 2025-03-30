/**
 * Magnetic System Provider Component
 * 
 * Context provider that sets up a magnetic system and makes it available
 * to child components. This enables related components to interact magnetically
 * without having to manually share system references.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MagneticSystemManager, getMagneticSystem, MagneticSystemConfig } from './magneticSystem';
import { DirectionalFieldConfig } from './directionalField';

/**
 * Magnetic system context
 */
interface MagneticSystemContextType {
  /**
   * The magnetic system manager instance
   */
  system: MagneticSystemManager | null;
  
  /**
   * The system ID
   */
  systemId: string;
  
  /**
   * Active field configuration
   */
  activeField: DirectionalFieldConfig | null;
  
  /**
   * Set the active field configuration
   */
  setActiveField: (field: DirectionalFieldConfig | null) => void;
}

// Create context with default values
const MagneticSystemContext = createContext<MagneticSystemContextType>({
  system: null,
  systemId: '',
  activeField: null,
  setActiveField: () => {}
});

/**
 * Props for the MagneticSystemProvider component
 */
export interface MagneticSystemProviderProps {
  /**
   * Child components that will have access to the magnetic system
   */
  children: ReactNode;
  
  /**
   * Unique ID for the magnetic system
   */
  systemId?: string;
  
  /**
   * Magnetic system configuration
   */
  config?: MagneticSystemConfig;
  
  /**
   * Initial directional field configuration
   */
  initialField?: DirectionalFieldConfig | null;
  
  /**
   * Whether the system should start automatically
   */
  autoStart?: boolean;
}

/**
 * Provider component for creating and managing a magnetic system
 */
export const MagneticSystemProvider: React.FC<MagneticSystemProviderProps> = ({
  children,
  systemId = `magnetic_system_${Date.now()}`,
  config = {},
  initialField = null,
  autoStart = true
}) => {
  // Get or create the magnetic system
  const [system, setSystem] = useState<MagneticSystemManager | null>(null);
  
  // Track the active field
  const [activeField, setActiveField] = useState<DirectionalFieldConfig | null>(initialField);
  
  // Initialize the system
  useEffect(() => {
    const magneticSystem = getMagneticSystem(systemId, config);
    
    // Set initial group field if provided
    if (initialField) {
      magneticSystem.updateConfig({
        groupField: initialField
      });
    }
    
    // Start system if auto-start is enabled
    if (autoStart) {
      magneticSystem.start();
    }
    
    setSystem(magneticSystem);
    
    // Clean up when unmounted
    return () => {
      // Don't destroy the system as other components might be using it
      // Just stop it if auto-start was enabled
      if (autoStart) {
        magneticSystem.stop();
      }
    };
  }, [systemId]);
  
  // Update system configuration when config changes
  useEffect(() => {
    if (system) {
      system.updateConfig(config);
    }
  }, [config]);
  
  // Update group field when active field changes
  useEffect(() => {
    if (system) {
      system.updateConfig({
        groupField: activeField
      });
    }
  }, [activeField]);
  
  // Context value
  const contextValue: MagneticSystemContextType = {
    system,
    systemId,
    activeField,
    setActiveField
  };
  
  return (
    <MagneticSystemContext.Provider value={contextValue}>
      {children}
    </MagneticSystemContext.Provider>
  );
};

/**
 * Hook to access the magnetic system from any child component
 */
export const useMagneticSystem = (): MagneticSystemContextType => {
  return useContext(MagneticSystemContext);
};

export default MagneticSystemProvider;