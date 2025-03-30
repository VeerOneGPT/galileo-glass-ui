import { 
  getPhysicsSettings, 
  applySpecializedPreset, 
  createCustomPhysicsSettings,
  usePhysicsSettings,
  DEFAULT_PHYSICS_SETTINGS,
  PHYSICS_SETTINGS_PRESETS,
  SPECIALIZED_PHYSICS_PRESETS
} from '../physicsSettings';
import { QualityTier } from '../types';

describe('physicsSettings', () => {
  test('should provide default physics settings', () => {
    expect(DEFAULT_PHYSICS_SETTINGS).toBeDefined();
    expect(DEFAULT_PHYSICS_SETTINGS.updateFrequency).toBe(60);
    expect(DEFAULT_PHYSICS_SETTINGS.gravity).toEqual({ x: 0, y: 9.8 });
  });
  
  test('should provide presets for all quality tiers', () => {
    // Should have a preset for each quality tier
    expect(Object.keys(PHYSICS_SETTINGS_PRESETS).length).toBe(Object.keys(QualityTier).length);
    
    // Each quality tier should have a corresponding preset
    Object.values(QualityTier).forEach(tier => {
      expect(PHYSICS_SETTINGS_PRESETS[tier]).toBeDefined();
    });
  });
  
  test('should return physics settings for a quality tier', () => {
    const minimalSettings = getPhysicsSettings(QualityTier.MINIMAL);
    const ultraSettings = getPhysicsSettings(QualityTier.ULTRA);
    
    expect(minimalSettings.updateFrequency).toBe(30);
    expect(ultraSettings.updateFrequency).toBe(120);
    
    // Low tier should have lower precision and fewer resources
    expect(minimalSettings.highPrecisionCalculations).toBe(false);
    expect(minimalSettings.maxDynamicBodies).toBeLessThan(ultraSettings.maxDynamicBodies);
    
    // Minimal tier should have larger spatial grid cells for better performance
    expect(minimalSettings.spatialGridCellSize).toBeGreaterThan(ultraSettings.spatialGridCellSize);
  });
  
  test('should apply specialized presets over base settings', () => {
    const baseSettings = getPhysicsSettings(QualityTier.MEDIUM);
    
    // Apply space-like physics preset
    const spaceSettings = applySpecializedPreset(baseSettings, 'SPACE');
    
    // Should keep most settings from base
    expect(spaceSettings.updateFrequency).toBe(baseSettings.updateFrequency);
    expect(spaceSettings.solverIterations).toBe(baseSettings.solverIterations);
    
    // But override the gravity and friction
    expect(spaceSettings.gravity).toEqual(SPECIALIZED_PHYSICS_PRESETS.SPACE.gravity);
    expect(spaceSettings.friction).toBe(SPECIALIZED_PHYSICS_PRESETS.SPACE.friction);
    
    // Bouncy preset should have high restitution
    const bouncySettings = applySpecializedPreset(baseSettings, 'BOUNCY');
    expect(bouncySettings.restitution).toBe(SPECIALIZED_PHYSICS_PRESETS.BOUNCY.restitution);
    expect(bouncySettings.restitution).toBeGreaterThan(baseSettings.restitution);
  });
  
  test('should create custom physics settings with overrides', () => {
    const baseSettings = getPhysicsSettings(QualityTier.MEDIUM);
    
    // Apply custom overrides
    const customSettings = createCustomPhysicsSettings(baseSettings, {
      gravity: { x: 0, y: 20 },
      friction: 0.5,
      enableSleeping: false
    });
    
    // Should keep most settings from base
    expect(customSettings.updateFrequency).toBe(baseSettings.updateFrequency);
    expect(customSettings.solverIterations).toBe(baseSettings.solverIterations);
    
    // But apply custom overrides
    expect(customSettings.gravity).toEqual({ x: 0, y: 20 });
    expect(customSettings.friction).toBe(0.5);
    expect(customSettings.enableSleeping).toBe(false);
  });
  
  test('usePhysicsSettings should apply quality tier, specialized preset, and custom overrides', () => {
    // Medium quality with water physics and custom gravity
    const settings = usePhysicsSettings(
      QualityTier.MEDIUM,
      'WATER',
      { gravity: { x: 0, y: 3.0 } }
    );
    
    // Should start with medium tier settings
    expect(settings.updateFrequency).toBe(PHYSICS_SETTINGS_PRESETS[QualityTier.MEDIUM].updateFrequency);
    
    // Should include water physics characteristics
    expect(settings.airResistance).toBe(SPECIALIZED_PHYSICS_PRESETS.WATER.airResistance);
    
    // But with custom gravity override
    expect(settings.gravity).toEqual({ x: 0, y: 3.0 });
  });
  
  test('specialized presets should have meaningful differences', () => {
    // Space vs Water
    expect(SPECIALIZED_PHYSICS_PRESETS.SPACE.gravity.y).toBeLessThan(SPECIALIZED_PHYSICS_PRESETS.WATER.gravity.y);
    expect(SPECIALIZED_PHYSICS_PRESETS.WATER.airResistance).toBeGreaterThan(SPECIALIZED_PHYSICS_PRESETS.SPACE.airResistance);
    
    // Bouncy vs Sticky
    expect(SPECIALIZED_PHYSICS_PRESETS.BOUNCY.restitution).toBeGreaterThan(SPECIALIZED_PHYSICS_PRESETS.STICKY.restitution);
    expect(SPECIALIZED_PHYSICS_PRESETS.STICKY.friction).toBeGreaterThan(SPECIALIZED_PHYSICS_PRESETS.BOUNCY.friction);
  });
}); 