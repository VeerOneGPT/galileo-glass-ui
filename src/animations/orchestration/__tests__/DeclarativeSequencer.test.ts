/**
 * Declarative Animation Sequencer Tests
 */
import { 
  DeclarativeSequencer, 
  SequenceBuilder, 
  createAnimationSequence,
  CommandType
} from '../DeclarativeSequencer';
import { AnimationPreset, AnimationIntensity } from '../../core/types';
import { MotionSensitivityLevel } from '../../accessibility/MotionSensitivity';
import { animationOrchestrator } from '../Orchestrator';

// Mock animationOrchestrator
jest.mock('../Orchestrator', () => ({
  animationOrchestrator: {
    createSequence: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
  }
}));

// Mock DOM methods
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn();

const mockElement = {
  style: { cssText: '', setProperty: jest.fn() },
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn()
  }
};

describe('DeclarativeSequencer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock element queries
    (document.querySelector as jest.Mock).mockReturnValue(mockElement);
    (document.querySelectorAll as jest.Mock).mockReturnValue([mockElement, mockElement]);
  });
  
  describe('Constructor', () => {
    it('should create a new sequencer with default options', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      expect(sequencer).toBeDefined();
    });
    
    it('should create a new sequencer with custom options', () => {
      const options = {
        sensitivity: MotionSensitivityLevel.HIGH,
        loop: true,
        iterations: 3,
        autoPlay: false
      };
      
      const sequencer = new DeclarativeSequencer('test-sequence', options);
      
      expect(sequencer).toBeDefined();
    });
  });
  
  describe('addCommand', () => {
    it('should add commands to the sequence', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element',
          animation: 'fadeIn'
        }
      });
      
      sequencer.addCommand({
        type: CommandType.WAIT,
        params: {
          duration: 300
        }
      });
      
      // Not a great test since commands is private, but checking side effects
      expect(sequencer.buildExecutionPlan().length).toBe(2);
    });
  });
  
  describe('buildExecutionPlan', () => {
    it('should create a valid execution plan for independent commands', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element1',
          animation: 'fadeIn'
        },
        id: 'cmd1'
      });
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element2',
          animation: 'fadeIn'
        },
        id: 'cmd2'
      });
      
      const plan = sequencer.buildExecutionPlan();
      
      expect(plan).toEqual(['cmd1', 'cmd2']);
    });
    
    it('should create a valid execution plan respecting dependencies', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element1',
          animation: 'fadeIn'
        },
        id: 'cmd1'
      });
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element2',
          animation: 'fadeIn'
        },
        id: 'cmd2',
        dependencies: ['cmd1']
      });
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element3',
          animation: 'fadeIn'
        },
        id: 'cmd3',
        dependencies: ['cmd2']
      });
      
      const plan = sequencer.buildExecutionPlan();
      
      expect(plan).toEqual(['cmd1', 'cmd2', 'cmd3']);
    });
    
    it('should throw an error for circular dependencies', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element1',
          animation: 'fadeIn'
        },
        id: 'cmd1',
        dependencies: ['cmd3']
      });
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element2',
          animation: 'fadeIn'
        },
        id: 'cmd2',
        dependencies: ['cmd1']
      });
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element3',
          animation: 'fadeIn'
        },
        id: 'cmd3',
        dependencies: ['cmd2']
      });
      
      expect(() => sequencer.buildExecutionPlan()).toThrow(/circular dependency/i);
    });
  });
  
  describe('execute', () => {
    it('should execute commands and call appropriate orchestrator methods', async () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.addCommand({
        type: CommandType.ANIMATE,
        params: {
          target: '.element',
          animation: 'fadeIn'
        }
      });
      
      await sequencer.execute();
      
      expect(animationOrchestrator.createSequence).toHaveBeenCalled();
    });
  });
  
  describe('Control methods', () => {
    it('should call orchestrator methods for start/pause/resume/stop/reset', () => {
      const sequencer = new DeclarativeSequencer('test-sequence');
      
      sequencer.pause();
      expect(animationOrchestrator.pause).toHaveBeenCalled();
      
      sequencer.resume();
      expect(animationOrchestrator.play).toHaveBeenCalled();
      
      sequencer.stop();
      expect(animationOrchestrator.stop).toHaveBeenCalled();
      
      // Reset only calls stop
      sequencer.reset();
      expect(animationOrchestrator.stop).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Factory methods', () => {
    it('should create a sequencer with DeclarativeSequencer.create', () => {
      const sequencer = DeclarativeSequencer.create(
        'test-sequence',
        { autoPlay: true },
        (builder) => {
          builder.animate('.element', 'fadeIn');
          builder.wait(300);
          builder.animate('.element', 'fadeOut');
        }
      );
      
      expect(sequencer).toBeInstanceOf(DeclarativeSequencer);
      expect(sequencer.buildExecutionPlan().length).toBe(3);
    });
    
    it('should create a sequencer with createAnimationSequence', () => {
      const sequencer = createAnimationSequence(
        'test-sequence',
        { autoPlay: true },
        (builder) => {
          builder.animate('.element', 'fadeIn');
          builder.wait(300);
          builder.animate('.element', 'fadeOut');
        }
      );
      
      expect(sequencer).toBeInstanceOf(DeclarativeSequencer);
      expect(sequencer.buildExecutionPlan().length).toBe(3);
    });
  });
});

describe('SequenceBuilder', () => {
  let sequencer: DeclarativeSequencer;
  let builder: SequenceBuilder;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    sequencer = new DeclarativeSequencer('test-sequence');
    builder = new SequenceBuilder(sequencer);
    
    // Mock the addCommand method to track calls
    (sequencer.addCommand as any) = jest.fn().mockReturnValue(sequencer);
  });
  
  describe('Basic animation methods', () => {
    it('should add animate commands', () => {
      builder.animate('.element', 'fadeIn', { duration: 500 });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.ANIMATE,
        params: {
          target: '.element',
          animation: 'fadeIn',
          duration: 500
        }
      });
    });
    
    it('should add stagger commands', () => {
      builder.stagger('.element', 'fadeIn', { 
        staggerDelay: 100,
        direction: 'center'
      });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.STAGGER,
        params: {
          targets: '.element',
          animation: 'fadeIn',
          staggerDelay: 100,
          direction: 'center'
        }
      });
    });
    
    it('should add wait commands', () => {
      builder.wait(300);
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.WAIT,
        params: {
          duration: 300
        }
      });
    });
  });
  
  describe('Control flow methods', () => {
    it('should add sequence and parallel commands', () => {
      // Capture command additions during the sequence
      const originalAddCommand = sequencer.addCommand;
      const commands: any[] = [];
      (sequencer.addCommand as any) = jest.fn((cmd) => {
        commands.push(cmd);
        return sequencer;
      });
      
      builder.sequence(b => {
        b.animate('.element1', 'fadeIn');
        b.animate('.element2', 'fadeIn');
      });
      
      builder.parallel(b => {
        b.animate('.element3', 'fadeIn');
        b.animate('.element4', 'fadeIn');
      });
      
      // Restore original
      (sequencer.addCommand as any) = originalAddCommand;
      
      // Check that appropriate commands were added
      expect(commands.length).toBe(6); // 4 animates + 2 containers
      expect(commands[0].type).toBe(CommandType.ANIMATE);
      expect(commands[1].type).toBe(CommandType.ANIMATE);
      expect(commands[2].type).toBe(CommandType.SEQUENCE);
      expect(commands[3].type).toBe(CommandType.ANIMATE);
      expect(commands[4].type).toBe(CommandType.ANIMATE);
      expect(commands[5].type).toBe(CommandType.PARALLEL);
    });
    
    it('should add conditional commands', () => {
      builder.if(true)
        .animate('.element1', 'fadeIn')
      .elseIf(false)
        .animate('.element2', 'fadeIn')
      .else()
        .animate('.element3', 'fadeIn')
      .endIf();
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.IF,
        params: { condition: true }
      });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.ELSE_IF,
        params: { condition: false }
      });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.ELSE,
        params: {}
      });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.END_IF,
        params: {}
      });
    });
    
    it('should add loop commands', () => {
      builder.forEach([1, 2, 3], 'item')
        .animate('.element', 'fadeIn')
      .endForEach();
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.FOR_EACH,
        params: { 
          items: [1, 2, 3],
          variable: 'item'
        }
      });
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.END_FOR_EACH,
        params: {}
      });
    });
  });
  
  describe('Utility methods', () => {
    it('should add call commands', () => {
      const callback = jest.fn();
      builder.call(callback, 'arg1', 'arg2');
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.CALL,
        params: {
          func: callback,
          args: ['arg1', 'arg2']
        }
      });
    });
    
    it('should add set commands', () => {
      builder.set('count', 5);
      
      expect(sequencer.addCommand).toHaveBeenCalledWith({
        type: CommandType.SET,
        params: {
          variable: 'count',
          value: 5
        }
      });
    });
  });
  
  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const result = builder
        .animate('.element1', 'fadeIn')
        .wait(300)
        .animate('.element2', 'fadeIn');
      
      expect(result).toBe(builder);
      expect((sequencer.addCommand as jest.Mock).mock.calls.length).toBe(3);
    });
  });
});