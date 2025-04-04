import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly (assuming named exports from index)
import { ImageList, ImageListItem, ImageListItemBar } from '../../src/components/ImageList';
// Import from main index
import { ThemeProvider } from '../../src';

const meta: Meta<typeof ImageList> = {
  title: 'Components/ImageList',
  component: ImageList,
  decorators: [(Story) => <ThemeProvider><div style={{ width: 500, height: 450, overflowY: 'scroll' }}><Story /></div></ThemeProvider>],
  parameters: {
    // layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the ImageList component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    cols: { control: 'number' },
    rowHeight: { control: 'number' },
    gap: { control: 'number' },
    variant: { control: 'select', options: ['standard', 'woven', 'masonry', 'quilted'] },
    // TODO: Add more argTypes based on ImageListProps
  },
};

export default meta;
type Story = StoryObj<typeof ImageList>;

// TODO: Add more stories and controls

// Sample data
const itemData = [
  { img: 'https://via.placeholder.com/248x164.png?text=Img1', title: 'Breakfast' },
  { img: 'https://via.placeholder.com/248x164.png?text=Img2', title: 'Burger' },
  { img: 'https://via.placeholder.com/248x164.png?text=Img3', title: 'Camera' },
  { img: 'https://via.placeholder.com/248x164.png?text=Img4', title: 'Coffee' },
  { img: 'https://via.placeholder.com/248x164.png?text=Img5', title: 'Hats' },
  { img: 'https://via.placeholder.com/248x164.png?text=Img6', title: 'Honey' },
];

export const Default: Story = {
  args: {
    cols: 3,
    rowHeight: 164,
    children: itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            src={`${item.img}`}
            srcSet={`${item.img}`}
            alt={item.title}
            loading="lazy"
          />
        </ImageListItem>
      )),
  },
};

export const WithTitleBar: Story = {
    args: {
      ...Default.args,
      children: itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            src={`${item.img}`}
            alt={item.title}
            loading="lazy"
          />
          <ImageListItemBar
            title={item.title}
            // subtitle={<span>by: {item.author}</span>} // Add author if available
            position="below"
          />
        </ImageListItem>
      )),
    },
  };
