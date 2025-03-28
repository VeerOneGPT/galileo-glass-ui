import { SpringPhysics, SpringPresets, createSpring, convertSpringParams } from '../springPhysics';

describe('SpringPhysics', () => {
  test('should initialize with default values', () => {
    const spring = new SpringPhysics();
    const state = spring.getState();
    
    expect(state.position).toBe(0);
    expect(state.velocity).toBe(0);
    expect(state.atRest).toBe(false);
  });
  
  test('should accept custom configuration', () => {
    const customConfig = {
      tension: 200,
      friction: 30,
      mass: 2,
      restThreshold: 0.005,
      initialVelocity: 5
    };
    
    const spring = new SpringPhysics(customConfig);
    
    // Initial velocity should be applied
    expect(spring.getState().velocity).toBe(5);
  });
  
  test('should update position and velocity correctly', () => {
    const spring = new SpringPhysics(SpringPresets.DEFAULT);
    
    // Set spring to move from 0 to 100
    spring.setTarget(100);
    
    // Run a few updates to see movement
    spring.update();
    
    // Should move towards target
    expect(spring.getCurrentValue()).toBeGreaterThan(0);
    
    // After multiple updates, should get closer to target
    for (let i = 0; i < 20; i++) {
      spring.update();
    }
    
    expect(spring.getCurrentValue()).toBeGreaterThan(50);
  });
  
  test('should eventually come to rest near target value', () => {
    const spring = new SpringPhysics(SpringPresets.SNAPPY);
    
    spring.setTarget(100);
    
    // Run many updates until spring reaches rest
    let iterations = 0;
    while (!spring.isAtRest() && iterations < 200) {
      spring.update();
      iterations++;
    }
    
    // Should be at rest
    expect(spring.isAtRest()).toBe(true);
    
    // Position should be very close to target value
    expect(Math.abs(spring.getCurrentValue() - 100)).toBeLessThan(0.01);
  });
  
  test('should apply clamping when configured', () => {
    const spring = new SpringPhysics({
      ...SpringPresets.BOUNCY,
      clamp: true
    });
    
    // Set a target to create movement
    spring.setTarget(50, { from: 0, velocity: 50 });
    
    // With a bouncy config and high initial velocity, 
    // the spring would normally oscillate beyond the target
    for (let i = 0; i < 10; i++) {
      spring.update();
    }
    
    // Clamping should prevent values greater than max (50)
    // or less than min (0)
    expect(spring.getCurrentValue()).toBeLessThanOrEqual(50);
    expect(spring.getCurrentValue()).toBeGreaterThanOrEqual(0);
  });
  
  test('createSpring factory function should work correctly', () => {
    const spring = createSpring(SpringPresets.HEAVY);
    
    // Should be an instance of SpringPhysics
    expect(spring).toBeInstanceOf(SpringPhysics);
    
    // Set a target and update
    spring.setTarget(100);
    spring.update();
    
    // Should be working correctly
    expect(spring.getCurrentValue()).toBeGreaterThan(0);
  });
  
  test('convertSpringParams should translate between parameter systems', () => {
    const converted = convertSpringParams(200, 25, 1.5);
    
    // Should map parameters correctly
    expect(converted.tension).toBe(200);
    expect(converted.friction).toBe(25);
    expect(converted.mass).toBe(1.5);
  });
}); 