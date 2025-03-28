/**
 * GlassTooltipDemo Component
 * 
 * Demonstrates the enhanced Glass Tooltip component with all its features.
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { GlassTooltip, GlassTooltipContent } from '../components/GlassTooltip';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Typography } from '../components/Typography';

// Demo container
const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled(Typography)`
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DemoCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
`;

const ControlLabel = styled.label`
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: inherit;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #6366F1;
  }
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

/**
 * GlassTooltipDemo Component demonstrating various tooltip features
 */
export const GlassTooltipDemo: React.FC = () => {
  // Config state for the customizable tooltip
  const [tooltipConfig, setTooltipConfig] = useState({
    placement: 'top',
    color: 'primary',
    glassStyle: 'frosted',
    blurStrength: 'standard',
    animationStyle: 'spring',
    arrow: true,
    interactive: false,
    followCursor: false,
    contextAware: false,
    richContent: true,
  });
  
  // Update config helper
  const updateConfig = (key: string, value: any) => {
    setTooltipConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <DemoContainer>
      <Title variant="h1">Glass Tooltip Component</Title>
      
      <Section>
        <SectionTitle variant="h2">Tooltip Styles</SectionTitle>
        <DemoGrid>
          {/* Basic tooltip */}
          <DemoCard>
            <GlassTooltip title="Basic tooltip with default style">
              <Button variant="contained">Basic Tooltip</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Basic tooltip with default style
            </Typography>
          </DemoCard>
          
          {/* Clear glass style */}
          <DemoCard>
            <GlassTooltip 
              title="Clear glass style with high transparency"
              glassStyle="clear"
              blurStrength="strong"
            >
              <Button variant="contained" color="secondary">Clear Glass</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Clear glass style with strong blur
            </Typography>
          </DemoCard>
          
          {/* Frosted glass style */}
          <DemoCard>
            <GlassTooltip 
              title="Frosted glass effect with medium blur"
              glassStyle="frosted"
              blurStrength="standard"
            >
              <Button variant="contained" color="success">Frosted Glass</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Frosted glass with standard blur
            </Typography>
          </DemoCard>
          
          {/* Tinted glass style */}
          <DemoCard>
            <GlassTooltip 
              title="Tinted glass with color influence"
              glassStyle="tinted"
              color="error"
              blurStrength="light"
            >
              <Button variant="contained" color="error">Tinted Glass</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Tinted glass with error color
            </Typography>
          </DemoCard>
          
          {/* Luminous glass style */}
          <DemoCard>
            <GlassTooltip 
              title="Luminous glass with subtle glow effect"
              glassStyle="luminous"
              color="info"
            >
              <Button variant="contained" color="info">Luminous Glass</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Luminous glass with info color
            </Typography>
          </DemoCard>
          
          {/* Dynamic glass style */}
          <DemoCard>
            <GlassTooltip 
              title="Dynamic glass adapts to content underneath"
              glassStyle="dynamic"
              contextAware={true}
            >
              <Button variant="contained" color="warning">Dynamic Glass</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Dynamic context-aware glass
            </Typography>
          </DemoCard>
        </DemoGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Animation Types</SectionTitle>
        <DemoGrid>
          {/* Spring physics animation */}
          <DemoCard>
            <GlassTooltip 
              title="Spring physics with natural bounce effect"
              animationStyle="spring"
              physics={{ tension: 300, friction: 20, mass: 1 }}
            >
              <Button variant="outlined">Spring Physics</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Spring physics animation
            </Typography>
          </DemoCard>
          
          {/* Inertial animation */}
          <DemoCard>
            <GlassTooltip 
              title="Inertial animation with momentum feel"
              animationStyle="inertial"
              physics={{ friction: 30, mass: 1.5 }}
            >
              <Button variant="outlined" color="secondary">Inertial Motion</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Inertial movement physics
            </Typography>
          </DemoCard>
          
          {/* Magnetic animation */}
          <DemoCard>
            <GlassTooltip 
              title="Magnetic effect that follows with easing"
              animationStyle="magnetic"
              physics={{ tension: 400, friction: 40 }}
            >
              <Button variant="outlined" color="success">Magnetic Effect</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Magnetic physics animation
            </Typography>
          </DemoCard>
          
          {/* Follow cursor */}
          <DemoCard>
            <GlassTooltip 
              title="This tooltip follows your cursor with physics"
              followCursor={true}
              animationStyle="inertial"
            >
              <Button variant="outlined" color="error">Follow Cursor</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Cursor-following tooltip
            </Typography>
          </DemoCard>
        </DemoGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Rich Content</SectionTitle>
        <DemoGrid>
          {/* Rich content with title and items */}
          <DemoCard>
            <GlassTooltip 
              title="Sales Performance" 
              richContent={{
                title: "Sales Performance",
                items: [
                  { label: "Revenue", value: "$12,345", color: "#10B981" },
                  { label: "Growth", value: "+15%", color: "#10B981" },
                  { label: "Customers", value: "1,234" }
                ]
              }}
              maxWidth={220}
              interactive={true}
            >
              <Button variant="contained">Rich Content</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Rich content with formatted items
            </Typography>
          </DemoCard>
          
          {/* Interactive tooltip */}
          <DemoCard>
            <GlassTooltip 
              title={
                <div>
                  <Typography variant="h6" style={{ marginBottom: '0.5rem' }}>Interactive Tooltip</Typography>
                  <Typography variant="body2" style={{ marginBottom: '0.5rem' }}>
                    You can hover this tooltip without it disappearing.
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    className="mt-2"
                  >
                    Click Me
                  </Button>
                </div>
              }
              interactive={true}
              maxWidth={250}
            >
              <Button variant="contained" color="secondary">Interactive</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Interactive tooltip with clickable content
            </Typography>
          </DemoCard>
          
          {/* Custom component */}
          <DemoCard>
            <GlassTooltip 
              title={
                <GlassTooltipContent
                  title="Server Status"
                  titleColor="#6366F1"
                  items={[
                    { label: "CPU", value: "32%", color: "#10B981" },
                    { label: "Memory", value: "2.4GB / 8GB", color: "#F59E0B" },
                    { label: "Uptime", value: "12d 5h 32m" }
                  ]}
                />
              }
              maxWidth={250}
              interactive={true}
            >
              <Button variant="contained" color="info">Custom Component</Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1rem', textAlign: 'center' }}>
              Using GlassTooltipContent helper
            </Typography>
          </DemoCard>
        </DemoGrid>
      </Section>
      
      <Section>
        <SectionTitle variant="h2">Customizable Tooltip</SectionTitle>
        <ControlPanel>
          <ControlGroup>
            <ControlLabel>Placement</ControlLabel>
            <Select 
              value={tooltipConfig.placement} 
              onChange={e => updateConfig('placement', e.target.value)}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top-start">Top Start</option>
              <option value="top-end">Top End</option>
              <option value="bottom-start">Bottom Start</option>
              <option value="bottom-end">Bottom End</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Color</ControlLabel>
            <Select 
              value={tooltipConfig.color} 
              onChange={e => updateConfig('color', e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="default">Default</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Glass Style</ControlLabel>
            <Select 
              value={tooltipConfig.glassStyle} 
              onChange={e => updateConfig('glassStyle', e.target.value)}
            >
              <option value="clear">Clear</option>
              <option value="frosted">Frosted</option>
              <option value="tinted">Tinted</option>
              <option value="luminous">Luminous</option>
              <option value="dynamic">Dynamic</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Blur Strength</ControlLabel>
            <Select 
              value={tooltipConfig.blurStrength} 
              onChange={e => updateConfig('blurStrength', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="standard">Standard</option>
              <option value="strong">Strong</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Animation Style</ControlLabel>
            <Select 
              value={tooltipConfig.animationStyle} 
              onChange={e => updateConfig('animationStyle', e.target.value)}
            >
              <option value="spring">Spring</option>
              <option value="inertial">Inertial</option>
              <option value="magnetic">Magnetic</option>
              <option value="fade">Fade</option>
              <option value="scale">Scale</option>
              <option value="none">None</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>
              <Checkbox 
                type="checkbox" 
                checked={tooltipConfig.arrow} 
                onChange={e => updateConfig('arrow', e.target.checked)}
              />
              Show Arrow
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox 
                type="checkbox" 
                checked={tooltipConfig.interactive} 
                onChange={e => updateConfig('interactive', e.target.checked)}
              />
              Interactive
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox 
                type="checkbox" 
                checked={tooltipConfig.followCursor} 
                onChange={e => updateConfig('followCursor', e.target.checked)}
              />
              Follow Cursor
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox 
                type="checkbox" 
                checked={tooltipConfig.contextAware} 
                onChange={e => updateConfig('contextAware', e.target.checked)}
              />
              Context Aware
            </ControlLabel>
            
            <ControlLabel>
              <Checkbox 
                type="checkbox" 
                checked={tooltipConfig.richContent} 
                onChange={e => updateConfig('richContent', e.target.checked)}
              />
              Rich Content
            </ControlLabel>
          </ControlGroup>
        </ControlPanel>
        
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <DemoCard>
            <GlassTooltip 
              title={tooltipConfig.richContent ? (
                <GlassTooltipContent
                  title="Custom Configuration"
                  titleColor={`var(--color-${tooltipConfig.color})`}
                  items={[
                    { label: "Glass Style", value: tooltipConfig.glassStyle },
                    { label: "Animation", value: tooltipConfig.animationStyle },
                    { label: "Blur", value: tooltipConfig.blurStrength }
                  ]}
                />
              ) : "Customizable tooltip with all options"}
              placement={tooltipConfig.placement as any}
              color={tooltipConfig.color as any}
              glassStyle={tooltipConfig.glassStyle as any}
              blurStrength={tooltipConfig.blurStrength as any}
              animationStyle={tooltipConfig.animationStyle as any}
              arrow={tooltipConfig.arrow}
              interactive={tooltipConfig.interactive}
              followCursor={tooltipConfig.followCursor}
              contextAware={tooltipConfig.contextAware}
              maxWidth={300}
            >
              <Button 
                variant="contained" 
                color={tooltipConfig.color as any}
                size="large"
              >
                Customized Tooltip
              </Button>
            </GlassTooltip>
            <Typography variant="body2" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              Hover to see your custom configuration
            </Typography>
          </DemoCard>
        </div>
      </Section>
    </DemoContainer>
  );
};

export default GlassTooltipDemo;