import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';

import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import ThemePerformanceMonitor from '../../theme/ThemePerformanceMonitor';
import { Alert } from '../Alert';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Box } from '../Box';
import { Button } from '../Button';
import { Card } from '../Card';
import { Checkbox } from '../Checkbox';
import { Chip } from '../Chip';
import { Divider } from '../Divider';
import { Paper } from '../Paper';
import { Progress } from '../Progress';
import { Radio } from '../Radio';
import { Select } from '../Select';
import { Slider } from '../Slider';
import { Switch } from '../Switch';
import { Tabs, Tab } from '../Tabs';
import { TextField } from '../TextField';
import { Typography } from '../Typography';

import { GlassThemeSwitcher } from './GlassThemeSwitcher';
import { GlassThemeDemoProps } from './types';

// Styled components
const StyledDemo = styled.div<{
  $glassIntensity: number;
  $minimal: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: ${({ $minimal }) => ($minimal ? '1rem' : '2rem')};
  border-radius: 12px;
  width: 100%;

  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: $glassIntensity,
      backgroundOpacity: 0.4,
      blurStrength: '8px',
      themeContext,
    });
  }}

  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.3,
      themeContext,
    });
  }}
`;

const Header = styled.header`
  margin-bottom: 1rem;
`;

const DemoSection = styled.section`
  margin-top: 1.5rem;
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const ComponentCard = styled(Card)`
  padding: 1.25rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ComponentTitle = styled(Typography)`
  margin-bottom: 1rem;
  font-weight: 500;
`;

const CodePreview = styled.pre`
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0.75rem;
  font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
  font-size: 0.85rem;
  overflow: auto;
  margin-top: 1rem;
`;

// Categories of components to showcase
const COMPONENT_CATEGORIES = {
  inputs: 'Input Components',
  feedback: 'Feedback Components',
  layout: 'Layout Components',
  navigation: 'Navigation Components',
  display: 'Display Components',
};

/**
 * A comprehensive theme demo component to showcase themed Glass UI components
 */
export const GlassThemeDemo = forwardRef<HTMLDivElement, GlassThemeDemoProps>(
  (
    {
      title = 'Glass UI Theme Demo',
      description = 'Explore different theme options and see how components adapt to theme changes.',
      showThemeSwitcher = true,
      showExamples = true,
      customExamples,
      glassIntensity = 0.7,
      className,
      style,
      header,
      footer,
      showPerformanceMetrics = false,
      useTabs = true,
      showCode = false,
      interactive = true,
      includedCategories = Object.keys(COMPONENT_CATEGORIES),
      minimal = false,
      ...rest
    }: GlassThemeDemoProps,
    ref
  ) => {
    const [activeTab, setActiveTab] = useState(0);

    // Example components by category
    const categoryExamples = {
      inputs: (
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle variant="subtitle1">Button</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
            </Box>
            {showCode && (
              <CodePreview>
                {`<Button variant="contained">Contained</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="text">Text</Button>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Text Field</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
              <TextField label="Standard" />
              <TextField label="With placeholder" placeholder="Type here..." />
              <TextField label="Disabled" disabled />
            </Box>
            {showCode && (
              <CodePreview>
                {`<TextField label="Standard" />
<TextField label="With placeholder" placeholder="Type here..." />
<TextField label="Disabled" disabled />`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Select</ComponentTitle>
            <Select
              label="Select Option"
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
            />
            {showCode && (
              <CodePreview>
                {`<Select
  label="Select Option"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]}
/>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Checkbox & Radio</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
              <Checkbox label="Checkbox Option" />
              <Radio label="Radio Option" name="radio-group" />
              <Switch label="Switch Option" />
            </Box>
            {showCode && (
              <CodePreview>
                {`<Checkbox label="Checkbox Option" />
<Radio label="Radio Option" name="radio-group" />
<Switch label="Switch Option" />`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Slider</ComponentTitle>
            <Slider defaultValue={50} aria-label="Slider" />
            {showCode && (
              <CodePreview>{`<Slider defaultValue={50} aria-label="Slider" />`}</CodePreview>
            )}
          </ComponentCard>
        </ComponentGrid>
      ),

      feedback: (
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle variant="subtitle1">Alert</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
              <Alert severity="info">Info message</Alert>
              <Alert severity="success">Success message</Alert>
              <Alert severity="warning">Warning message</Alert>
              <Alert severity="error">Error message</Alert>
            </Box>
            {showCode && (
              <CodePreview>
                {`<Alert severity="info">Info message</Alert>
<Alert severity="success">Success message</Alert>
<Alert severity="warning">Warning message</Alert>
<Alert severity="error">Error message</Alert>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Progress</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '16px' }}>
              <Progress variant="determinate" value={75} />
              <Progress variant="indeterminate" />
            </Box>
            {showCode && (
              <CodePreview>
                {`<Progress variant="determinate" value={75} />
<Progress variant="indeterminate" />`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Badge</ComponentTitle>
            <Box display="flex" style={{ gap: '16px' }}>
              <Badge content={4}>
                <Button>Messages</Button>
              </Badge>
              <Badge content="New" color="error">
                <Button>Updates</Button>
              </Badge>
            </Box>
            {showCode && (
              <CodePreview>
                {`<Badge content={4}>
  <Button>Messages</Button>
</Badge>
<Badge content="New" color="error">
  <Button>Updates</Button>
</Badge>`}
              </CodePreview>
            )}
          </ComponentCard>
        </ComponentGrid>
      ),

      layout: (
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle variant="subtitle1">Card</ComponentTitle>
            <Card>
              <Box p={2}>
                <Typography variant="h6">Card Title</Typography>
                <Typography variant="body2">Card content with text</Typography>
                <Box mt={2}>
                  <Button size="small">Action</Button>
                </Box>
              </Box>
            </Card>
            {showCode && (
              <CodePreview>
                {`<Card>
  <Box p={2}>
    <Typography variant="h6">Card Title</Typography>
    <Typography variant="body2">Card content with text</Typography>
    <Box mt={2}>
      <Button size="small">Action</Button>
    </Box>
  </Box>
</Card>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Paper</ComponentTitle>
            <Paper elevation={2}>
              <Box p={2}>
                <Typography>Paper Component</Typography>
              </Box>
            </Paper>
            {showCode && (
              <CodePreview>
                {`<Paper elevation={2}>
  <Box p={2}>
    <Typography>Paper Component</Typography>
  </Box>
</Paper>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Divider</ComponentTitle>
            <Box>
              <Typography>Above divider</Typography>
              <Divider style={{ marginTop: '16px', marginBottom: '16px' }} />
              <Typography>Below divider</Typography>
            </Box>
            {showCode && (
              <CodePreview>
                {`<Typography>Above divider</Typography>
<Divider style={{ marginTop: '16px', marginBottom: '16px' }} />
<Typography>Below divider</Typography>`}
              </CodePreview>
            )}
          </ComponentCard>
        </ComponentGrid>
      ),

      navigation: (
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle variant="subtitle1">Tabs</ComponentTitle>
            <Tabs value={0}>
              <Tab label="Tab 1" />
              <Tab label="Tab 2" />
              <Tab label="Tab 3" />
            </Tabs>
            {showCode && (
              <CodePreview>
                {`<Tabs value={0}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
  <Tab label="Tab 3" />
</Tabs>`}
              </CodePreview>
            )}
          </ComponentCard>
        </ComponentGrid>
      ),

      display: (
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle variant="subtitle1">Typography</ComponentTitle>
            <Box display="flex" flexDirection="column" style={{ gap: '8px' }}>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="h5">Heading 5</Typography>
              <Typography variant="subtitle1">Subtitle 1</Typography>
              <Typography variant="body1">Body 1 text</Typography>
              <Typography variant="body2">Body 2 text</Typography>
              <Typography variant="caption">Caption text</Typography>
            </Box>
            {showCode && (
              <CodePreview>
                {`<Typography variant="h3">Heading 3</Typography>
<Typography variant="h5">Heading 5</Typography>
<Typography variant="subtitle1">Subtitle 1</Typography>
<Typography variant="body1">Body 1 text</Typography>
<Typography variant="body2">Body 2 text</Typography>
<Typography variant="caption">Caption text</Typography>`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Chip</ComponentTitle>
            <Box display="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
              <Chip label="Basic" />
              <Chip label="Clickable" onClick={() => {}} />
              <Chip label="Deletable" onDelete={() => {}} />
              <Chip label="With Avatar" />
            </Box>
            {showCode && (
              <CodePreview>
                {`<Chip label="Basic" />
<Chip label="Clickable" onClick={() => {}} />
<Chip label="Deletable" onDelete={() => {}} />
<Chip label="With Avatar">`}
              </CodePreview>
            )}
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle variant="subtitle1">Avatar</ComponentTitle>
            <Box display="flex" style={{ gap: '8px' }}>
              <Avatar>A</Avatar>
              <Avatar color="primary">B</Avatar>
              <Avatar src="https://via.placeholder.com/40" alt="User" />
            </Box>
            {showCode && (
              <CodePreview>
                {`<Avatar>A</Avatar>
<Avatar color="primary">B</Avatar>
<Avatar src="https://via.placeholder.com/40" alt="User" />`}
              </CodePreview>
            )}
          </ComponentCard>
        </ComponentGrid>
      ),
    };

    // Filter categories based on includedCategories prop
    const filteredCategories = Object.entries(COMPONENT_CATEGORIES)
      .filter(([key]) => includedCategories.includes(key))
      .map(([key, label]) => ({ key, label }));

    return (
      <StyledDemo
        ref={ref}
        className={className}
        style={style}
        $glassIntensity={glassIntensity}
        $minimal={minimal}
        {...rest}
      >
        {/* Custom header or default header */}
        <Header>
          {header || (
            <>
              <Typography variant="h4" style={{ marginBottom: '8px' }}>
                {title}
              </Typography>
              {typeof description === 'string' ? (
                <Typography variant="body1">{description}</Typography>
              ) : (
                description
              )}
            </>
          )}
        </Header>

        {/* Theme switcher */}
        {showThemeSwitcher && (
          <DemoSection>
            <GlassThemeSwitcher glassIntensity={glassIntensity} compact={minimal} />
          </DemoSection>
        )}

        {/* Component examples */}
        {showExamples && (
          <DemoSection>
            {useTabs && filteredCategories.length > 1 ? (
              <>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  {filteredCategories.map(({ key, label }) => (
                    <Tab key={key} label={label} />
                  ))}
                </Tabs>
                <Box mt={2}>
                  {filteredCategories.map(
                    ({ key }, index) =>
                      activeTab === index && (
                        <Box key={key}>
                          {categoryExamples[key as keyof typeof categoryExamples]}
                        </Box>
                      )
                  )}
                </Box>
              </>
            ) : (
              // Show all categories without tabs
              <>
                {filteredCategories.map(({ key, label }) => (
                  <Box key={key} mt={3} mb={2}>
                    <Typography variant="h5" style={{ marginBottom: '16px' }}>
                      {label}
                    </Typography>
                    {categoryExamples[key as keyof typeof categoryExamples]}
                  </Box>
                ))}
              </>
            )}
          </DemoSection>
        )}

        {/* Custom examples */}
        {customExamples && (
          <DemoSection>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>
              Custom Examples
            </Typography>
            {customExamples}
          </DemoSection>
        )}

        {/* Performance metrics */}
        {showPerformanceMetrics && (
          <DemoSection>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>
              Performance Metrics
            </Typography>
            <Paper>
              <Box p={2}>
                <ThemePerformanceMonitor />
              </Box>
            </Paper>
          </DemoSection>
        )}

        {/* Footer */}
        {footer && (
          <Box mt="auto" pt={2}>
            {footer}
          </Box>
        )}
      </StyledDemo>
    );
  }
);

GlassThemeDemo.displayName = 'GlassThemeDemo';
