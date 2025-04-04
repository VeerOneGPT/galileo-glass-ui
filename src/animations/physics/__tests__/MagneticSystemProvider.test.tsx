/**
 * Tests for the MagneticSystemProvider component
 */

import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { MagneticSystemProvider, useMagneticSystem } from '../MagneticSystemProvider';

describe('MagneticSystemProvider', () => {
  beforeEach(() => {
    // Use Jest fake timers
    jest.useFakeTimers(); 
    // Reset Time Mocks (No longer needed)
  });

  afterEach(() => {
    cleanup();
    // Restore originals (No longer needed)
    // Use Jest real timers
    jest.useRealTimers(); 
    jest.clearAllMocks();
  });
  
  test('should provide magnetic system to children', () => {
    // Create a test consumer component
    const TestConsumer = () => {
      const { system, systemId } = useMagneticSystem();
      
      return (
        <div>
          <div data-testid="system-id">{systemId}</div>
          <div data-testid="has-system">{system ? 'yes' : 'no'}</div>
        </div>
      );
    };
    
    // Render provider with consumer
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="test-provider">
        <TestConsumer />
      </MagneticSystemProvider>
    );
    
    // Should provide the system ID
    expect(getByTestId('system-id').textContent).toBe('test-provider');
    
    // Should have a system reference
    expect(getByTestId('has-system').textContent).toBe('yes');
  });
  
  test('should allow changing active field', async () => {
    // Create a test consumer component that changes the field
    const TestFieldChanger = () => {
      const { activeField, setActiveField } = useMagneticSystem();
      
      const changeField = () => {
        setActiveField({
          type: 'radial',
          behavior: 'constant',
          center: { x: 0.5, y: 0.5 }
        });
      };
      
      return (
        <div>
          <div data-testid="field-type">{activeField ? activeField.type : 'none'}</div>
          <button data-testid="change-field" onClick={changeField}>Change Field</button>
        </div>
      );
    };
    
    // Render provider with field changer
    const { getByTestId } = render(
      <MagneticSystemProvider systemId="field-test">
        <TestFieldChanger />
      </MagneticSystemProvider>
    );
    
    // Should start with no field
    expect(getByTestId('field-type').textContent).toBe('none');
    
    // Change the field using act
    await act(async () => {
        getByTestId('change-field').click();
    });
    
    // Should update to the new field type
    expect(getByTestId('field-type').textContent).toBe('radial');
  });
  
  test('should pass config to the magnetic system', () => {
    // Create a test consumer component that checks config
    const TestConfigConsumer = () => {
      const { system } = useMagneticSystem();
      
      const config = system ? system.getConfig() : null;
      
      return (
        <div>
          <div data-testid="interaction-strength">
            {config ? config.interactionStrength : 'none'}
          </div>
        </div>
      );
    };
    
    // Render provider with custom config
    const { getByTestId } = render(
      <MagneticSystemProvider 
        systemId="config-test"
        config={{ interactionStrength: 0.75 }}
      >
        <TestConfigConsumer />
      </MagneticSystemProvider>
    );
    
    // Config should be passed to the system
    expect(getByTestId('interaction-strength').textContent).toBe('0.75');
  });
});