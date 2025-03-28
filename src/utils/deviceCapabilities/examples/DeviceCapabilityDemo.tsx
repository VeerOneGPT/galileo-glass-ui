import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  getDeviceCapabilities, 
  DeviceCapabilityTier, 
  DeviceCapabilityProfile,
  setupDeviceCapabilityMonitoring,
  getFeatureSupportRecommendation
} from '../index';

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
`;

const Header = styled.h1`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 30px 0 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const SubsectionTitle = styled.h3`
  margin: 24px 0 12px;
  color: #333;
`;

const CapabilitySection = styled.div`
  margin-bottom: 30px;
`;

const TierBadge = styled.div<{ $tier: DeviceCapabilityTier }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  margin-left: 10px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.$tier) {
      case DeviceCapabilityTier.ULTRA: return '#6A0DAD'; // Purple
      case DeviceCapabilityTier.HIGH: return '#007BFF'; // Blue
      case DeviceCapabilityTier.MEDIUM: return '#28A745'; // Green
      case DeviceCapabilityTier.LOW: return '#FFC107'; // Yellow
      case DeviceCapabilityTier.MINIMAL: return '#DC3545'; // Red
      default: return '#6C757D'; // Gray
    }
  }};
  color: white;
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PropertyCard = styled.div`
  padding: 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  overflow: hidden;
`;

const PropertyName = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
`;

const PropertyValue = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-family: monospace;
  word-break: break-word;
  color: ${props => {
    if (props.$positive) return '#28A745';
    if (props.$negative) return '#DC3545';
    return 'inherit';
  }};
`;

const FeatureTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
`;

const SupportLabel = styled.span<{ $supported: boolean }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.$supported ? '#E6F7E6' : '#FFEEEE'};
  color: ${props => props.$supported ? '#28A745' : '#DC3545'};
`;

const RecommendationLabel = styled.span<{ $recommendation: 'enable' | 'disable' | 'adapt' }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => {
    switch (props.$recommendation) {
      case 'enable': return '#E6F7E6';
      case 'disable': return '#FFEEEE';
      case 'adapt': return '#FFF9E6';
    }
  }};
  color: ${props => {
    switch (props.$recommendation) {
      case 'enable': return '#28A745';
      case 'disable': return '#DC3545';
      case 'adapt': return '#FF9900';
    }
  }};
`;

// Function to format values for display
const formatValue = (value: any): string => {
  if (value === undefined || value === null) {
    return 'Not available';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  
  return String(value);
};

// List of features to evaluate
const features = [
  'advancedAnimations',
  'glassEffects',
  'particleEffects',
  '3dTransforms',
  'videoBackgrounds',
  'parallaxEffects',
  'backdropFilters'
];

const DeviceCapabilityDemo: React.FC = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState<{ type: string; timestamp: Date }[]>([]);
  
  useEffect(() => {
    // Detect capabilities on mount
    const detectCapabilities = async () => {
      try {
        const result = await getDeviceCapabilities();
        setCapabilities(result);
      } catch (error) {
        console.error('Error detecting device capabilities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    detectCapabilities();
    
    // Set up monitoring for capability changes
    const cleanup = setupDeviceCapabilityMonitoring((changedCapabilities) => {
      // Update the capabilities with the changed parts
      setCapabilities(prev => {
        if (!prev) return prev;
        
        // Log the change
        setChanges(prevChanges => [
          ...prevChanges,
          {
            type: Object.keys(changedCapabilities).join(', '),
            timestamp: new Date()
          }
        ]);
        
        return { ...prev, ...changedCapabilities };
      });
    });
    
    // Clean up monitoring on unmount
    return cleanup;
  }, []);
  
  if (loading) {
    return <DemoContainer>Loading device capabilities...</DemoContainer>;
  }
  
  if (!capabilities) {
    return <DemoContainer>Failed to detect device capabilities</DemoContainer>;
  }
  
  return (
    <DemoContainer>
      <Header>
        Device Capability Detection
        <TierBadge $tier={capabilities.tier}>{capabilities.tier}</TierBadge>
      </Header>
      
      <CapabilitySection>
        <SectionTitle>System Overview</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>Device Tier</PropertyName>
            <PropertyValue>{capabilities.tier}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Operating System</PropertyName>
            <PropertyValue>{capabilities.os.name} {capabilities.os.version}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Form Factor</PropertyName>
            <PropertyValue>{capabilities.formFactor}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Low-End Device</PropertyName>
            <PropertyValue $negative={capabilities.isLowEndDevice}>
              {capabilities.isLowEndDevice ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Browser</PropertyName>
            <PropertyValue>{capabilities.browser.name} {capabilities.browser.version}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Rendering Engine</PropertyName>
            <PropertyValue>{capabilities.browser.engine}</PropertyValue>
          </PropertyCard>
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>Hardware Capabilities</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>GPU Performance</PropertyName>
            <PropertyValue>{capabilities.hardware.performanceScore}/10</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>WebGL Support</PropertyName>
            <PropertyValue $positive={capabilities.hardware.webGLSupport}>
              {capabilities.hardware.webGLSupport ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>WebGL2 Support</PropertyName>
            <PropertyValue $positive={capabilities.hardware.webGL2Support}>
              {capabilities.hardware.webGL2Support ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>WebGPU Support</PropertyName>
            <PropertyValue $positive={capabilities.hardware.webGPUSupport}>
              {capabilities.hardware.webGPUSupport ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>GPU Vendor/Model</PropertyName>
            <PropertyValue>
              {capabilities.hardware.gpuVendor || 'Unknown'} / {capabilities.hardware.gpuModel || 'Unknown'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Transform Acceleration</PropertyName>
            <PropertyValue $positive={capabilities.hardware.transformAccelerated}>
              {capabilities.hardware.transformAccelerated ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Filter Acceleration</PropertyName>
            <PropertyValue $positive={capabilities.hardware.filterAccelerated}>
              {capabilities.hardware.filterAccelerated ? 'Yes' : 'No'}
            </PropertyValue>
          </PropertyCard>
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>Display & Input</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>Screen Resolution</PropertyName>
            <PropertyValue>
              {capabilities.display.screenWidth} × {capabilities.display.screenHeight}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Device Pixel Ratio</PropertyName>
            <PropertyValue>{capabilities.display.devicePixelRatio.toFixed(2)}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Color Gamut</PropertyName>
            <PropertyValue>{capabilities.display.colorGamut}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Refresh Rate</PropertyName>
            <PropertyValue>{capabilities.display.refreshRate} Hz</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Touch Support</PropertyName>
            <PropertyValue>{capabilities.input.touchDevice ? 'Yes' : 'No'}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Pointer Precision</PropertyName>
            <PropertyValue>
              {capabilities.input.finePointer ? 'Fine (Mouse)' : 'Coarse (Touch)'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Hover Capability</PropertyName>
            <PropertyValue>{capabilities.input.hoverCapability ? 'Yes' : 'No'}</PropertyValue>
          </PropertyCard>
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>System Resources</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>Processor Cores</PropertyName>
            <PropertyValue>{capabilities.system.processor.cores}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Processor Performance</PropertyName>
            <PropertyValue>{capabilities.system.processor.performanceScore}/10</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Memory</PropertyName>
            <PropertyValue $negative={capabilities.system.memory.lowMemory}>
              {capabilities.system.memory.estimatedMemory 
                ? `${capabilities.system.memory.estimatedMemory.toFixed(1)} GB` 
                : 'Unknown'}
              {capabilities.system.memory.lowMemory ? ' (Low)' : ''}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Battery Status</PropertyName>
            <PropertyValue>
              {capabilities.system.battery.supported 
                ? (capabilities.system.battery.charging 
                  ? 'Charging' 
                  : `${(capabilities.system.battery.level || 0) * 100}%`)
                : 'Unknown'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Power Save Mode</PropertyName>
            <PropertyValue $negative={capabilities.system.battery.powerSaveMode === true}>
              {capabilities.system.battery.powerSaveMode === null 
                ? 'Unknown' 
                : (capabilities.system.battery.powerSaveMode ? 'Yes' : 'No')}
            </PropertyValue>
          </PropertyCard>
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>Network & Connection</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>Connection Type</PropertyName>
            <PropertyValue>
              {capabilities.network.connectionType || 'Unknown'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Online Status</PropertyName>
            <PropertyValue $positive={capabilities.network.online} $negative={!capabilities.network.online}>
              {capabilities.network.online ? 'Online' : 'Offline'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Data Saver</PropertyName>
            <PropertyValue $negative={capabilities.network.dataSaverEnabled}>
              {capabilities.network.dataSaverEnabled ? 'Enabled' : 'Disabled'}
            </PropertyValue>
          </PropertyCard>
          
          {capabilities.network.bandwidth && (
            <PropertyCard>
              <PropertyName>Bandwidth</PropertyName>
              <PropertyValue>{capabilities.network.bandwidth} Mbps</PropertyValue>
            </PropertyCard>
          )}
          
          {capabilities.network.rtt !== undefined && (
            <PropertyCard>
              <PropertyName>Round Trip Time</PropertyName>
              <PropertyValue>{capabilities.network.rtt} ms</PropertyValue>
            </PropertyCard>
          )}
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>Accessibility Preferences</SectionTitle>
        <PropertyGrid>
          <PropertyCard>
            <PropertyName>Reduced Motion</PropertyName>
            <PropertyValue $negative={capabilities.accessibility.prefersReducedMotion}>
              {capabilities.accessibility.prefersReducedMotion ? 'Enabled' : 'Disabled'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Reduced Transparency</PropertyName>
            <PropertyValue $negative={capabilities.accessibility.prefersReducedTransparency}>
              {capabilities.accessibility.prefersReducedTransparency ? 'Enabled' : 'Disabled'}
            </PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Contrast Preference</PropertyName>
            <PropertyValue>{capabilities.accessibility.prefersContrast}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Color Scheme</PropertyName>
            <PropertyValue>{capabilities.accessibility.prefersColorScheme}</PropertyValue>
          </PropertyCard>
          
          <PropertyCard>
            <PropertyName>Font Size Adjustment</PropertyName>
            <PropertyValue>
              {capabilities.accessibility.fontSizeAdjustment.toFixed(2)}x
            </PropertyValue>
          </PropertyCard>
        </PropertyGrid>
      </CapabilitySection>
      
      <CapabilitySection>
        <SectionTitle>Feature Support Recommendations</SectionTitle>
        <p>
          Based on your device's capabilities, here's what features we recommend enabling or disabling:
        </p>
        
        <FeatureTable>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Supported</th>
              <th>Recommendation</th>
              <th>Fallback</th>
            </tr>
          </thead>
          <tbody>
            {features.map(feature => {
              const recommendation = getFeatureSupportRecommendation(feature, capabilities);
              return (
                <tr key={feature}>
                  <td>{feature}</td>
                  <td>
                    <SupportLabel $supported={recommendation.supported}>
                      {recommendation.supported ? 'Supported' : 'Not Supported'}
                    </SupportLabel>
                  </td>
                  <td>
                    <RecommendationLabel $recommendation={recommendation.recommendation}>
                      {recommendation.recommendation}
                    </RecommendationLabel>
                  </td>
                  <td>{recommendation.fallback || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </FeatureTable>
      </CapabilitySection>
      
      {changes.length > 0 && (
        <CapabilitySection>
          <SectionTitle>Changes Detected</SectionTitle>
          <p>Changes to device capabilities detected during this session:</p>
          <ul>
            {changes.map((change, index) => (
              <li key={index}>
                {change.timestamp.toLocaleTimeString()}: Changed {change.type}
              </li>
            ))}
          </ul>
        </CapabilitySection>
      )}
    </DemoContainer>
  );
};

export default DeviceCapabilityDemo;