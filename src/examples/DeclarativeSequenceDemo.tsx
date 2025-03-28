/**
 * Declarative Animation Sequence Demo
 * 
 * Demonstrates the usage of the declarative animation sequencing system.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useSequence } from '../animations/orchestration/useSequence';
import { MotionSensitivityLevel } from '../animations/accessibility/MotionSensitivity';

// Styled components
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
`;

const DemoSection = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: #2a6ef5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #1d5ed9;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const AnimationArea = styled.div`
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 300px;
  margin-bottom: 24px;
  overflow: hidden;
  background-color: #f9f9f9;
`;

const Card = styled.div<{
  $color?: string;
  $size?: string;
  $position?: string;
}>`
  position: absolute;
  background-color: ${props => props.$color || '#2a6ef5'};
  width: ${props => props.$size || '100px'};
  height: ${props => props.$size || '100px'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  ${props => props.$position === 'center' && `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
  
  ${props => props.$position === 'top-left' && `
    top: 24px;
    left: 24px;
  `}
  
  ${props => props.$position === 'top-right' && `
    top: 24px;
    right: 24px;
  `}
  
  ${props => props.$position === 'bottom-left' && `
    bottom: 24px;
    left: 24px;
  `}
  
  ${props => props.$position === 'bottom-right' && `
    bottom: 24px;
    right: 24px;
  `}
`;

const AnimationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 24px;
`;

const GridItem = styled.div`
  width: 60px;
  height: 60px;
  background-color: #2a6ef5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  opacity: 0;
`;

const SequenceInfoContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
`;

const SyntaxHighlight = styled.pre`
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow: auto;
  tab-size: 2;
`;

/**
 * Declarative Animation Sequence Demo Component
 */
const DeclarativeSequenceDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'stagger' | 'conditional' | 'complex'>('basic');
  
  // Basic Sequence Demo
  const basicGridRef = useRef<HTMLDivElement>(null);
  
  const basicSequence = useSequence({
    name: 'basic-sequence',
    sensitivity: MotionSensitivityLevel.MEDIUM,
    loop: false,
    deps: []
  }, (builder) => {
    builder
      .animate('#basic-card', 'fadeIn', { duration: 800 })
      .wait(300)
      .animate('#basic-card', 'pulse')
      .wait(200)
      .animate('#basic-card', 'slideInUp', { 
        duration: 600,
        delay: 100
      })
      .wait(300)
      .animate('#basic-card', 'zoomOut', { duration: 500 });
  });
  
  // Stagger Sequence Demo
  const staggerGridRef = useRef<HTMLDivElement>(null);
  
  const staggerSequence = useSequence({
    name: 'stagger-sequence',
    sensitivity: MotionSensitivityLevel.MEDIUM,
    loop: false,
    deps: []
  }, (builder) => {
    builder
      .stagger('.stagger-item', 'fadeIn', { 
        staggerDelay: 50,
        direction: 'normal'
      })
      .wait(500)
      .stagger('.stagger-item', 'pulse', { 
        staggerDelay: 50,
        direction: 'center'
      })
      .wait(500)
      .stagger('.stagger-item', 'fadeOut', { 
        staggerDelay: 50,
        direction: 'edges'
      });
  });
  
  // Conditional Sequence Demo
  const [conditionValue, setConditionValue] = useState(false);
  
  const conditionalSequence = useSequence({
    name: 'conditional-sequence',
    sensitivity: MotionSensitivityLevel.MEDIUM,
    loop: false,
    deps: [conditionValue]
  }, (builder) => {
    builder
      .animate('#condition-card', 'fadeIn', { duration: 500 })
      .if(conditionValue)
        .animate('#condition-card', 'bounce')
        .wait(300)
        .animate('#condition-card', 'shake')
      .else()
        .animate('#condition-card', 'pulse')
        .wait(300)
        .animate('#condition-card', 'slideInLeft')
      .endIf()
      .wait(500)
      .animate('#condition-card', 'fadeOut', { duration: 500 });
  });
  
  // Complex Sequence Demo
  const [loopCount, setLoopCount] = useState(3);
  
  const complexSequence = useSequence({
    name: 'complex-sequence',
    sensitivity: MotionSensitivityLevel.MEDIUM,
    loop: false,
    deps: [loopCount]
  }, (builder) => {
    // Set initial variables
    builder
      .set('loopCounter', 0)
      .parallel(b => {
        b.animate('#card-top-left', 'fadeIn')
         .animate('#card-top-right', 'fadeIn')
         .animate('#card-bottom-left', 'fadeIn')
         .animate('#card-bottom-right', 'fadeIn');
      })
      .wait(300)
      // Start a loop for animations
      .forEach(Array.from({ length: loopCount }, (_, i) => i), 'iteration')
        .call(() => console.log('Animation loop iteration'))
        .set('direction', (builder as any).context?.variables?.iteration % 2 === 0 ? 'clockwise' : 'counterclockwise')
        .sequence(b => {
          b.if('$direction === "clockwise"')
            .animate('#card-top-left', 'pulse')
            .animate('#card-top-right', 'pulse')
            .animate('#card-bottom-right', 'pulse')
            .animate('#card-bottom-left', 'pulse')
          .else()
            .animate('#card-top-left', 'pulse')
            .animate('#card-bottom-left', 'pulse')
            .animate('#card-bottom-right', 'pulse')
            .animate('#card-top-right', 'pulse')
          .endIf();
        })
      .endForEach()
      .wait(500)
      .parallel(b => {
        b.animate('#card-top-left', 'fadeOut')
         .animate('#card-top-right', 'fadeOut')
         .animate('#card-bottom-left', 'fadeOut')
         .animate('#card-bottom-right', 'fadeOut');
      });
  });
  
  // Reset demo when switching
  useEffect(() => {
    basicSequence.reset();
    staggerSequence.reset();
    conditionalSequence.reset();
    complexSequence.reset();
  }, [activeDemo]);
  
  // Utility function to generate grid items
  const renderGridItems = (count: number, className: string) => {
    return Array.from({ length: count }, (_, i) => (
      <GridItem key={i} className={className}>
        {i + 1}
      </GridItem>
    ));
  };
  
  // Demo renderer
  const renderDemo = () => {
    switch (activeDemo) {
      case 'basic':
        return (
          <>
            <SectionTitle>Basic Animation Sequence</SectionTitle>
            <Description>
              This demo shows a simple linear animation sequence with chained animations
              and waiting periods.
            </Description>
            
            <Controls>
              <Button onClick={() => basicSequence.start()} disabled={basicSequence.isPlaying}>
                Play Sequence
              </Button>
              <Button onClick={() => basicSequence.pause()} disabled={!basicSequence.isPlaying || basicSequence.isPaused}>
                Pause
              </Button>
              <Button onClick={() => basicSequence.resume()} disabled={!basicSequence.isPaused}>
                Resume
              </Button>
              <Button onClick={() => basicSequence.reset()} disabled={!basicSequence.isPlaying && !basicSequence.isComplete}>
                Reset
              </Button>
            </Controls>
            
            <AnimationArea>
              <Card id="basic-card" $position="center">Card</Card>
            </AnimationArea>
            
            <SyntaxHighlight>{`
// Define a sequence with the useSequence hook
const sequence = useSequence({
  name: 'basic-sequence',
  sensitivity: MotionSensitivityLevel.MEDIUM
}, (builder) => {
  builder
    .animate('#card', 'fadeIn', { duration: 800 })
    .wait(300)
    .animate('#card', 'pulse')
    .wait(200)
    .animate('#card', 'slideInUp', { 
      duration: 600,
      delay: 100
    })
    .wait(300)
    .animate('#card', 'zoomOut', { duration: 500 });
});

// Control the sequence
sequence.start();  // Play the sequence
sequence.pause();  // Pause the sequence
sequence.resume(); // Resume the sequence
sequence.stop();   // Stop the sequence
sequence.reset();  // Reset the sequence
            `}</SyntaxHighlight>
          </>
        );
        
      case 'stagger':
        return (
          <>
            <SectionTitle>Staggered Animations</SectionTitle>
            <Description>
              This demo shows how to create staggered animations with different directions
              and timing patterns.
            </Description>
            
            <Controls>
              <Button onClick={() => staggerSequence.start()} disabled={staggerSequence.isPlaying}>
                Play Sequence
              </Button>
              <Button onClick={() => staggerSequence.pause()} disabled={!staggerSequence.isPlaying || staggerSequence.isPaused}>
                Pause
              </Button>
              <Button onClick={() => staggerSequence.resume()} disabled={!staggerSequence.isPaused}>
                Resume
              </Button>
              <Button onClick={() => staggerSequence.reset()} disabled={!staggerSequence.isPlaying && !staggerSequence.isComplete}>
                Reset
              </Button>
            </Controls>
            
            <AnimationArea>
              <AnimationGrid ref={staggerGridRef}>
                {renderGridItems(25, 'stagger-item')}
              </AnimationGrid>
            </AnimationArea>
            
            <SyntaxHighlight>{`
// Define a staggered sequence
const staggerSequence = useSequence({
  name: 'stagger-sequence',
}, (builder) => {
  builder
    .stagger('.grid-item', 'fadeIn', { 
      staggerDelay: 50,
      direction: 'normal'  // Options: normal, reverse, center, edges
    })
    .wait(500)
    .stagger('.grid-item', 'pulse', { 
      staggerDelay: 50,
      direction: 'center'
    })
    .wait(500)
    .stagger('.grid-item', 'fadeOut', { 
      staggerDelay: 50,
      direction: 'edges'
    });
});
            `}</SyntaxHighlight>
          </>
        );
        
      case 'conditional':
        return (
          <>
            <SectionTitle>Conditional Animations</SectionTitle>
            <Description>
              This demo shows how to use conditional logic to create dynamic animation
              sequences based on state.
            </Description>
            
            <Controls>
              <Button 
                onClick={() => setConditionValue(!conditionValue)} 
                style={{ backgroundColor: conditionValue ? '#2ecc71' : '#e74c3c' }}
              >
                Toggle Condition: {conditionValue ? 'True' : 'False'}
              </Button>
              <Button onClick={() => conditionalSequence.start()} disabled={conditionalSequence.isPlaying}>
                Play Sequence
              </Button>
              <Button onClick={() => conditionalSequence.pause()} disabled={!conditionalSequence.isPlaying || conditionalSequence.isPaused}>
                Pause
              </Button>
              <Button onClick={() => conditionalSequence.resume()} disabled={!conditionalSequence.isPaused}>
                Resume
              </Button>
              <Button onClick={() => conditionalSequence.reset()} disabled={!conditionalSequence.isPlaying && !conditionalSequence.isComplete}>
                Reset
              </Button>
            </Controls>
            
            <AnimationArea>
              <Card 
                id="condition-card" 
                $position="center" 
                $color={conditionValue ? '#2ecc71' : '#e74c3c'}
              >
                {conditionValue ? 'True' : 'False'}
              </Card>
            </AnimationArea>
            
            <SyntaxHighlight>{`
// Define a conditional sequence
const [condition, setCondition] = useState(false);

const conditionalSequence = useSequence({
  name: 'conditional-sequence',
  deps: [condition]  // Re-create sequence when condition changes
}, (builder) => {
  builder
    .animate('#card', 'fadeIn')
    .if(condition)
      .animate('#card', 'bounce')
      .wait(300)
      .animate('#card', 'shake')
    .else()
      .animate('#card', 'pulse')
      .wait(300)
      .animate('#card', 'slideInLeft')
    .endIf()
    .wait(500)
    .animate('#card', 'fadeOut');
});
            `}</SyntaxHighlight>
          </>
        );
        
      case 'complex':
        return (
          <>
            <SectionTitle>Complex Animation Composition</SectionTitle>
            <Description>
              This demo shows advanced animation composition with parallel sequences,
              loops, variables, and conditional branching.
            </Description>
            
            <Controls>
              <Button 
                onClick={() => setLoopCount(prev => Math.max(1, prev - 1))}
                disabled={loopCount <= 1}
              >
                Decrease Loops
              </Button>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Loop Count: {loopCount}
              </span>
              <Button 
                onClick={() => setLoopCount(prev => Math.min(5, prev + 1))}
                disabled={loopCount >= 5}
              >
                Increase Loops
              </Button>
              <Button onClick={() => complexSequence.start()} disabled={complexSequence.isPlaying}>
                Play Sequence
              </Button>
              <Button onClick={() => complexSequence.pause()} disabled={!complexSequence.isPlaying || complexSequence.isPaused}>
                Pause
              </Button>
              <Button onClick={() => complexSequence.resume()} disabled={!complexSequence.isPaused}>
                Resume
              </Button>
              <Button onClick={() => complexSequence.reset()} disabled={!complexSequence.isPlaying && !complexSequence.isComplete}>
                Reset
              </Button>
            </Controls>
            
            <AnimationArea>
              <Card id="card-top-left" $position="top-left" $size="80px" $color="#3498db">TL</Card>
              <Card id="card-top-right" $position="top-right" $size="80px" $color="#2ecc71">TR</Card>
              <Card id="card-bottom-left" $position="bottom-left" $size="80px" $color="#e74c3c">BL</Card>
              <Card id="card-bottom-right" $position="bottom-right" $size="80px" $color="#f39c12">BR</Card>
            </AnimationArea>
            
            <SyntaxHighlight>{`
// Define a complex sequence with variables, loops, and parallel animations
const [loopCount, setLoopCount] = useState(3);

const complexSequence = useSequence({
  name: 'complex-sequence',
  deps: [loopCount]
}, (builder) => {
  // Set initial variables
  builder
    .set('loopCounter', 0)
    .parallel(b => {
      b.animate('#card1', 'fadeIn')
       .animate('#card2', 'fadeIn')
       .animate('#card3', 'fadeIn')
       .animate('#card4', 'fadeIn');
    })
    .wait(300)
    // Start a loop for animations
    .forEach(Array.from({ length: loopCount }), 'iteration')
      .call(() => console.log('Animation loop iteration'))
      .set('direction', '$iteration % 2 === 0 ? "clockwise" : "counterclockwise"')
      .sequence(b => {
        b.if('$direction === "clockwise"')
          // Clockwise animation pattern
          .animate('#card1', 'pulse')
          .animate('#card2', 'pulse')
          .animate('#card4', 'pulse')
          .animate('#card3', 'pulse')
        .else()
          // Counter-clockwise animation pattern
          .animate('#card1', 'pulse')
          .animate('#card3', 'pulse')
          .animate('#card4', 'pulse')
          .animate('#card2', 'pulse')
        .endIf();
      })
    .endForEach()
    .wait(500)
    .parallel(b => {
      b.animate('#card1', 'fadeOut')
       .animate('#card2', 'fadeOut')
       .animate('#card3', 'fadeOut')
       .animate('#card4', 'fadeOut');
    });
});
            `}</SyntaxHighlight>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <DemoContainer>
      <Header>
        <Title>Declarative Animation Sequencing System</Title>
        <Description>
          This demo showcases the declarative animation sequencing system that allows for creating
          complex, orchestrated animations with a clean, fluent API. The system supports sequential,
          parallel, staggered, and conditional animations with full control over timing and execution flow.
        </Description>
      </Header>
      
      <Controls>
        <Button 
          onClick={() => setActiveDemo('basic')}
          style={{ 
            backgroundColor: activeDemo === 'basic' ? '#1d5ed9' : '#f5f5f5',
            color: activeDemo === 'basic' ? 'white' : '#333'
          }}
        >
          Basic Sequence
        </Button>
        <Button 
          onClick={() => setActiveDemo('stagger')}
          style={{ 
            backgroundColor: activeDemo === 'stagger' ? '#1d5ed9' : '#f5f5f5',
            color: activeDemo === 'stagger' ? 'white' : '#333'
          }}
        >
          Staggered Animations
        </Button>
        <Button 
          onClick={() => setActiveDemo('conditional')}
          style={{ 
            backgroundColor: activeDemo === 'conditional' ? '#1d5ed9' : '#f5f5f5',
            color: activeDemo === 'conditional' ? 'white' : '#333'
          }}
        >
          Conditional Animations
        </Button>
        <Button 
          onClick={() => setActiveDemo('complex')}
          style={{ 
            backgroundColor: activeDemo === 'complex' ? '#1d5ed9' : '#f5f5f5',
            color: activeDemo === 'complex' ? 'white' : '#333'
          }}
        >
          Complex Composition
        </Button>
      </Controls>
      
      <DemoSection>
        {renderDemo()}
      </DemoSection>
    </DemoContainer>
  );
};

export default DeclarativeSequenceDemo;