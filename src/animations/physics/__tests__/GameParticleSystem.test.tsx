import { GameParticleSystem } from '../GameParticleSystem';

test('should create particles based on configuration', () => {
  // Create a mock container element
  const container = document.createElement('div');

  const system = new GameParticleSystem({
    container: container,
    emitters: [
      {
        position: { x: 0, y: 0 },
        // ... existing code ...
      }
    ]
  });

  // ... existing code ...
}); 