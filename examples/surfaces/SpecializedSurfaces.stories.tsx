import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

// Corrected imports for ThemeProvider
import { ThemeProvider as GalileoThemeProvider } from '../../src/theme';

// Import the actual existing surfaces
import {
    DimensionalGlass,
    FrostedGlass,
    HeatGlass,
    PageGlassContainer,
    WidgetGlass,
} from '../../src/components/surfaces';

// Import types if needed for props
import { 
    GlassSurfaceBaseProps,
    DimensionalGlassProps,
    HeatGlassProps,
    FrostedGlassProps,
    PageGlassContainerProps,
    WidgetGlassProps
} from '../../src/components/surfaces/types';

import { Typography } from '../../src/components/Typography';
import { Box, Stack } from '../../src/components';
import { Select } from '../../src/components/Select';
import { Slider } from '../../src/components/Slider';
import { Paper } from '../../src/components/Paper';

// --- Styled Components ---

const StoryContainer = styled(Box)`
    padding: 2rem;
    background-color: ${({ theme }) => theme.colors.background ?? '#121212'}; /* Add fallback */
    color: ${({ theme }) => theme.colors.textPrimary ?? '#ffffff'}; /* Add fallback */
    min-height: 100vh;
`;

const ControlArea = styled(Paper)`
    padding: 1.5rem;
    margin-bottom: 2rem;
`;

// --- Story Template ---
// Using the actual available components
const Template: StoryFn<any> = (args) => (
    <StoryContainer>
        <Typography variant="h4" gutterBottom>
            Glass Surface Components
        </Typography>
        
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6">Dimensional Glass</Typography>
                <DimensionalGlass {...args.dimensionalProps}>
                    <Typography>Content on Dimensional Glass</Typography>
                </DimensionalGlass>
            </Box>
            <Box>
                <Typography variant="h6">Frosted Glass</Typography>
                <FrostedGlass {...args.frostedProps}>
                    <Typography>Content on Frosted Glass</Typography>
                </FrostedGlass>
            </Box>
            <Box>
                <Typography variant="h6">Heat Glass</Typography>
                <HeatGlass {...args.heatProps}>
                    <Typography>Content on Heat Glass</Typography>
                </HeatGlass>
            </Box>
            <Box>
                <Typography variant="h6">Page Glass Container</Typography>
                <PageGlassContainer {...args.pageProps}>
                    <Typography>Content in Page Glass Container</Typography>
                </PageGlassContainer>
            </Box>
            <Box>
                <Typography variant="h6">Widget Glass</Typography>
                <WidgetGlass {...args.widgetProps}>
                    <Typography>Content in Widget Glass</Typography>
                </WidgetGlass>
            </Box>
        </Stack>
    </StoryContainer>
);

// --- Story Configuration ---
export default {
    title: 'Surfaces/Specialized Surfaces',
    component: DimensionalGlass, // Use one component as the "main" one
    subcomponents: { 
        FrostedGlass, 
        HeatGlass, 
        PageGlassContainer, 
        WidgetGlass 
    },
    decorators: [
        (Story) => (
            <GalileoThemeProvider>
                <Story />
            </GalileoThemeProvider>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component: 'Showcases different specialized glass surface components for various UI needs.'
            }
        }
    }
} as Meta;

// --- Story ---
export const AllSurfaces = Template.bind({});
AllSurfaces.args = {
    dimensionalProps: {
        depth: 10,
        style: { padding: '1.5rem', minHeight: '100px' }
    },
    frostedProps: {
        intensity: 0.5,
        style: { padding: '1.5rem', minHeight: '100px' }
    },
    heatProps: {
        intensity: 0.6,
        style: { padding: '1.5rem', minHeight: '100px' }
    },
    pageProps: {
        style: { padding: '1.5rem', minHeight: '100px' }
    },
    widgetProps: {
        style: { padding: '1.5rem', minHeight: '100px' }
    }
}; 