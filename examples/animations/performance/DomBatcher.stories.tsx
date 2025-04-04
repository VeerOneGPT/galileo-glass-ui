import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Corrected library paths
import {
    // lightTheme, // Remove theme import
    ThemeProvider as GalileoThemeProvider
} from '../../../src/theme'; // Corrected Path
import {
    domBatcher, // Import domBatcher (camelCase) assuming singleton instance
    DomOperationType,
    BatchPriority // Import BatchPriority
} from '../../../src/animations/performance'; // Path for the batcher
import { Paper } from '../../../src/components/Paper'; // Corrected Path
import { Typography } from '../../../src/components/Typography'; // Corrected Path
import { Button } from '../../../src/components/Button'; // Corrected Path
import { Box, Stack } from '../../../src/components'; // Keep path for Layout components
// import { CodeBlock } from '../../../src/components'; // Comment out CodeBlock import

// --- Styled Components ---
const StoryContainer = styled(Box)`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 100vh;
`;

const DemoArea = styled(Paper)`
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
`;

const TargetElement = styled.div`
  width: 100px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem; // Space below the element
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
`;

const OutputLog = styled(Paper)`
  padding: 1rem;
  margin-top: 1rem;
  background-color: rgba(0,0,0,0.3);
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

// --- Main Story Component ---
interface DomBatcherDemoProps {
    batchMode: 'read-write' | 'write-only' | 'off'; // Note: Modes might behave differently now
}

const DomBatcherDemoComponent: React.FC<DomBatcherDemoProps> = ({ batchMode }) => {
    const [logs, setLogs] = useState<string[]>(['Log output...']);
    const targetRef = useRef<HTMLDivElement>(null);
    // Use the imported singleton instance
    const batcher = domBatcher;

    const addLog = useCallback((message: string) => {
        setLogs(prev => [message, ...prev.slice(0, 49)]); // Keep last 50 logs
    }, []);

    const performOperations = () => {
        if (!targetRef.current) return;
        addLog('Starting operations...');

        const element = targetRef.current;
        const operations = [
            // READ
            () => {
                addLog('Reading offsetWidth...');
                const width = element.offsetWidth;
                addLog(`  -> Read offsetWidth: ${width}px`);
            },
            // WRITE
            () => {
                addLog('Writing style.transform...');
                element.style.transform = `translateX(50px)`;
                addLog('  -> Wrote style.transform');
            },
            // READ
            () => {
                addLog('Reading getBoundingClientRect().height...');
                const height = element.getBoundingClientRect().height;
                addLog(`  -> Read height: ${height}px`);
            },
            // WRITE
            () => {
                addLog('Writing style.opacity...');
                element.style.opacity = '0.5';
                addLog('  -> Wrote style.opacity');
            },
             // WRITE
            () => {
                addLog('Writing style.transform (reset)...');
                element.style.transform = `translateX(0px)`;
                 addLog('  -> Wrote style.transform (reset)');
            },
            // READ
            () => {
                addLog('Reading scrollHeight...');
                const scrollH = element.scrollHeight;
                addLog(`  -> Read scrollHeight: ${scrollH}px`);
            },
            // WRITE
            () => {
                addLog('Writing style.opacity (reset)...');
                element.style.opacity = '1';
                addLog('  -> Wrote style.opacity (reset)');
            },
        ];

        if (batchMode === 'off') {
            addLog('Batching OFF: Executing operations sequentially.');
            operations.forEach(op => op());
        } else {
            addLog(`Batching ON (${batchMode}): Scheduling operations.`);
            operations.forEach(op => {
                // Naive detection of read/write based on function name/content (for demo purposes)
                const isRead = op.toString().includes('offsetWidth') || op.toString().includes('getBoundingClientRect') || op.toString().includes('scrollHeight');
                const type = isRead ? DomOperationType.READ : DomOperationType.WRITE;

                // Schedule expects an object with type, callback, and priority
                if (batchMode === 'read-write') {
                    batcher.schedule({ type: type, callback: op, priority: BatchPriority.NORMAL }); // Add priority
                    addLog(`  -> Scheduled ${type} operation.`);
                } else if (batchMode === 'write-only' && !isRead) {
                     batcher.schedule({ type: DomOperationType.WRITE, callback: op, priority: BatchPriority.NORMAL }); // Add priority
                     addLog(`  -> Scheduled WRITE operation.`);
                } else if (batchMode === 'write-only' && isRead) {
                    // If write-only, execute reads immediately
                    addLog(`  -> Executing READ immediately (write-only mode).`);
                    op();
                } else {
                     // Fallback for unknown state or if read-write mode is off
                     addLog(`  -> Ignoring operation in current mode: ${batchMode}`);
                }
            });
            // Explicitly flush the batch
            // In real scenarios, flushing might happen automatically via requestAnimationFrame
             addLog('Manually flushing batch...');
             batcher.flush();
             addLog('Batch flushed.');
        }
        addLog('Operations complete.');
    };

    // Effect to reset element style on mode change
    useEffect(() => {
        if (targetRef.current) {
            targetRef.current.style.transform = 'translateX(0px)';
            targetRef.current.style.opacity = '1';
        }
        setLogs(['Mode changed. Log cleared.']);
    }, [batchMode]);

    const codeExample = `
import { useDomBatcher, DomOperationType } from 'galileo-glass-ui/animations/performance';

function MyComponent() {
  const batcher = DomBatcher.instance; // Assuming static instance in example too
  const elementRef = useRef<HTMLDivElement>(null);

  const updateStylesAndReadLayout = () => {
    if (!elementRef.current) return;
    const element = elementRef.current;

    // Schedule a WRITE operation
    batcher.schedule(() => {
      element.style.width = '200px';
      console.log('WRITE: Set width');
    }, DomOperationType.WRITE);

    // Schedule a READ operation
    batcher.schedule(() => {
      const height = element.offsetHeight;
      console.log('READ: Get offsetHeight', height);
    }, DomOperationType.READ);

    // Schedule another WRITE operation
    batcher.schedule(() => {
      element.style.opacity = '0.8';
      console.log('WRITE: Set opacity');
    }, DomOperationType.WRITE);

    // Operations will be batched and executed optimally
    // batcher.flush(); // Or rely on rAF flushing
  };

  return <div ref={elementRef}>...</div>;
}
`;

    return (
        <StoryContainer>
            <Typography variant="h4" gutterBottom>
                DOM Operation Batcher (`useDomBatcher`)
            </Typography>

            <Typography variant="body1" paragraph>
                This hook optimizes performance by batching DOM read and write operations,
                minimizing layout thrashing. Observe the log output to see the order of operations
                with and without batching enabled.
            </Typography>

            <DemoArea elevation={1}>
                 <Typography variant="h6">Test Area</Typography>
                <TargetElement ref={targetRef}>Target Div</TargetElement>
                <Button onClick={performOperations} variant="contained">
                    Run Read/Write Operations
                </Button>
                 <OutputLog elevation={0}>
                    {logs.join('\n')}
                </OutputLog>
            </DemoArea>

            {/* <Typography variant="h6" gutterBottom>Usage Example</Typography>
            <CodeBlock language="typescript" code={codeExample} /> */}
            {/* Commented out CodeBlock usage */}

        </StoryContainer>
    );
};

// --- Storybook Configuration ---
export default {
    title: 'Examples/Animations/Performance/DOM Batcher',
    component: DomBatcherDemoComponent,
    decorators: [
        (Story) => (
            <GalileoThemeProvider>
                <Story />
            </GalileoThemeProvider>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                story: 'Demonstrates the `useDomBatcher` hook for optimizing DOM read/write operations. Change the batching mode and run the operations to see how the execution order changes in the log.',
            },
        },
    },
    argTypes: {
        batchMode: {
            name: 'Batching Mode',
            control: 'radio',
            options: ['off', 'read-write', 'write-only'],
            description: 'Controls how DOM operations are batched: \n- off: Execute sequentially (causes layout thrashing). \n- read-write: Batch reads and writes separately. \n- write-only: Batch only writes, execute reads immediately.',
        },
    },
} as Meta<typeof DomBatcherDemoComponent>;

// --- Story ---
export const Default: StoryFn<DomBatcherDemoProps> = (args) => <DomBatcherDemoComponent {...args} />;
Default.args = {
    batchMode: 'off',
}; 