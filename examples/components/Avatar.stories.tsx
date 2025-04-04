import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../../src/components/Avatar'; // Corrected path
import { ThemeProvider } from '../../src'; // Assuming ThemeProvider is exported from src index
// Optionally import an icon component if needed for letter avatars
// import PersonIcon from '@mui/icons-material/Person';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' }, // URL for image avatar
    alt: { control: 'text' },
    children: { control: 'text' }, // For letter avatars
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// Image Avatar Story
export const ImageAvatar: Story = {
  name: 'Image Avatar',
  args: {
    alt: 'User Name',
    // Provide a placeholder image URL
    src: 'https://via.placeholder.com/150/771796', 
  },
};

// Letter Avatar Story
export const LetterAvatar: Story = {
  name: 'Letter Avatar',
  args: {
    children: 'JD', // Example initials
  },
};

// Icon Avatar Story (Optional, if icons are used)
// export const IconAvatar: Story = {
//   name: 'Icon Avatar',
//   args: {
//     children: <PersonIcon />,
//     sx: { bgcolor: '#10B981' }, // Example green color
//   },
// }; 