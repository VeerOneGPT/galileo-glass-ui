/**
 * Layout Components Demo
 *
 * Demonstrates the usage of layout components like Grid and Stack
 */
import React from 'react';
import styled from 'styled-components';

import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Grid } from '../components/Grid';
import { Paper } from '../components/Paper';
import { Stack } from '../components/Stack';
import { Typography } from '../components/Typography';

const DemoContainer = styled.div`
  padding: 24px;
  background-color: #f5f5f5;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const DemoItem = styled.div`
  padding: 16px;
  background-color: rgba(63, 81, 181, 0.15);
  border: 1px solid rgba(63, 81, 181, 0.25);
  color: #3f51b5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  height: 40px;
  border-radius: 4px;
`;

const LayoutComponentsDemo = () => {
  return (
    <DemoContainer>
      <Typography variant="h2">Layout Components Demo</Typography>

      <DemoSection>
        <Typography variant="h4">Stack Component (Vertical)</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          A vertical stack with different spacing options:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Stack spacing={2}>
            <DemoItem>Item 1</DemoItem>
            <DemoItem>Item 2</DemoItem>
            <DemoItem>Item 3</DemoItem>
          </Stack>
        </Paper>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Stack Component (Horizontal)</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          A horizontal stack with different alignment options:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DemoItem>Item 1</DemoItem>
            <DemoItem>Item 2</DemoItem>
            <DemoItem>Item 3</DemoItem>
          </Stack>
        </Paper>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Stack with Dividers</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Stack items with dividers between them:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Stack
            spacing={2}
            divider={
              <hr
                style={{
                  width: '100%',
                  margin: 0,
                  border: 'none',
                  borderTop: '1px dashed rgba(0, 0, 0, 0.2)',
                }}
              />
            }
          >
            <DemoItem>Item 1</DemoItem>
            <DemoItem>Item 2</DemoItem>
            <DemoItem>Item 3</DemoItem>
          </Stack>
        </Paper>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Stack with Glass Effect</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Stack with glass effect styling:
        </Typography>

        <div
          style={{
            position: 'relative',
            padding: '24px',
            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
          }}
        >
          <Stack
            spacing={2}
            glass
            glassOptions={{
              blurStrength: 'enhanced',
              backgroundOpacity: 'light',
              elevation: 3,
            }}
            style={{ padding: '24px' }}
          >
            <DemoItem
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}
            >
              Item 1
            </DemoItem>
            <DemoItem
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}
            >
              Item 2
            </DemoItem>
            <DemoItem
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}
            >
              Item 3
            </DemoItem>
          </Stack>
        </div>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Stack.Item with Flex Properties</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Stack items with different flex properties:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Stack direction="row" spacing={2}>
            <Stack.Item grow={1}>
              <DemoItem>Item 1 (grow=1)</DemoItem>
            </Stack.Item>
            <Stack.Item grow={2}>
              <DemoItem>Item 2 (grow=2)</DemoItem>
            </Stack.Item>
            <Stack.Item grow={1}>
              <DemoItem>Item 3 (grow=1)</DemoItem>
            </Stack.Item>
          </Stack>
        </Paper>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Grid Component</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          A responsive grid with 12 columns:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Grid container spacing={2}>
            <Grid.Item xs={12} sm={6} md={4}>
              <DemoItem>1</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={4}>
              <DemoItem>2</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={4}>
              <DemoItem>3</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={6} md={6}>
              <DemoItem>4</DemoItem>
            </Grid.Item>
            <Grid.Item xs={12} sm={12} md={6}>
              <DemoItem>5</DemoItem>
            </Grid.Item>
          </Grid>
        </Paper>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Combined Grid and Stack</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Using Grid and Stack components together:
        </Typography>

        <Paper style={{ padding: '24px' }}>
          <Grid container spacing={3}>
            <Grid.Item xs={12} md={6}>
              <Stack spacing={2}>
                <DemoItem>Stacked Item 1</DemoItem>
                <DemoItem>Stacked Item 2</DemoItem>
                <DemoItem>Stacked Item 3</DemoItem>
              </Stack>
            </Grid.Item>
            <Grid.Item xs={12} md={6}>
              <Stack spacing={2}>
                <Typography variant="h6">Actions</Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary">
                    Save
                  </Button>
                  <Button variant="outlined">Cancel</Button>
                </Stack>
                <DemoItem>Content Area</DemoItem>
              </Stack>
            </Grid.Item>
          </Grid>
        </Paper>
      </DemoSection>
    </DemoContainer>
  );
};

export default LayoutComponentsDemo;
