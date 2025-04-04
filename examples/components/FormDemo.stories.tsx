import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import paths
import { Box } from '../../src/components/Box';
import { TextField } from '../../src/components/TextField';
import { Button } from '../../src/components/Button';
import { Switch } from '../../src/components/Switch';
import { Typography } from '../../src/components/Typography';
import { ThemeProvider } from '../../src';

// Meta setup - No specific component, focuses on layout/composition
const meta: Meta = {
  title: 'Examples/Form Layout',
  // component: Box, // Optional: Can associate with Box if desired
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
// Use a generic type or Record for StoryObj if no specific component
type Story = StoryObj<Record<string, unknown>>;

// Basic Form Layout Example
const BasicFormLayout = () => {
    const [subscribe, setSubscribe] = useState(false);

    const handleSubscribeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSubscribe(event.target.checked);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert('Form Submitted (placeholder)');
    };

    return (
        <ThemeProvider>
            <form 
                onSubmit={handleSubmit}
                noValidate 
                autoComplete="off"
            >
                <Box 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px', 
                        padding: '24px',
                        border: '1px solid grey', 
                        borderRadius: '8px',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    <Typography variant="h6">Sign Up</Typography>
                    <TextField 
                        required 
                        id="name"
                        label="Name" 
                        variant="outlined" 
                        fullWidth 
                    />
                    <TextField
                        required
                        id="email"
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        fullWidth
                    />
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                    />
                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch 
                            checked={subscribe}
                            onChange={handleSubscribeChange}
                            name="subscribeNews"
                            color="primary"
                        />
                         <Typography variant="body2" component="span" style={{ marginLeft: '8px' }}>
                             Subscribe to newsletter
                         </Typography>
                    </Box>
    
                    <Button type="submit" variant="contained" color="primary" style={{ marginTop: '8px' }}>
                        Submit
                    </Button>
                </Box>
            </form>
        </ThemeProvider>
    );
};

export const BasicLayout: Story = {
  render: () => <BasicFormLayout />,
}; 