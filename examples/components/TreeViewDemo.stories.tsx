import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import paths
import { TreeView } from '../../src/components/TreeView/TreeView'; // Might be just /TreeView
import { TreeItem } from '../../src/components/TreeView/TreeItem'; // Might be just /TreeView
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons
const ExpandMoreIcon = () => <span>▼</span>;
const ChevronRightIcon = () => <span>▶</span>;
const FolderIcon = () => <span>📁</span>;
const FileIcon = () => <span>📄</span>;

const meta: Meta<typeof TreeView> = {
  title: 'Components/Navigation/TreeView',
  component: TreeView,
  tags: ['autodocs'],
  argTypes: {
    defaultCollapseIcon: { control: 'object' },
    defaultExpandIcon: { control: 'object' },
    defaultExpanded: { control: 'object' }, // Expects string[]
    defaultSelected: { control: 'object' }, // Expects string | string[]
    multiSelect: { control: 'boolean' },
    disabledItemsFocusable: { control: 'boolean' },
    // Add other TreeView props
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

// Basic TreeView Example
export const Basic: Story = {
  args: {
    "aria-label": "file system navigator",
    defaultCollapseIcon: <ExpandMoreIcon />,
    defaultExpandIcon: <ChevronRightIcon />,
    defaultExpanded: ['1'], // Default expand the root
    style: { height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }, // Style for demo
    children: (
      <React.Fragment>
          <TreeItem nodeId="1" label="Applications">
            <TreeItem nodeId="2" label="Calendar" />
            <TreeItem nodeId="3" label="Chrome" />
            <TreeItem nodeId="4" label="Webstorm" />
          </TreeItem>
          <TreeItem nodeId="5" label="Documents">
            <TreeItem nodeId="6" label="Material UI">
              <TreeItem nodeId="7" label="src">
                <TreeItem nodeId="8" label="index.js" />
                <TreeItem nodeId="9" label="tree-view.js" />
              </TreeItem>
            </TreeItem>
          </TreeItem>
      </React.Fragment>
    ),
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Multi-Select Example
export const MultiSelect: Story = {
    args: {
      ...Basic.args, // Reuse structure from Basic
      multiSelect: true,
      defaultSelected: ['1', '7'] // Pre-select multiple
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Example with custom icons per item
export const CustomIcons: Story = {
    args: {
      "aria-label": "custom icon tree",
      defaultCollapseIcon: <ExpandMoreIcon />,
      defaultExpandIcon: <ChevronRightIcon />,
      style: { height: 216, flexGrow: 1, maxWidth: 400, overflowY: 'auto' },
      children: (
        <TreeItem nodeId="1" label="Root" icon={<FolderIcon />}>
            <TreeItem nodeId="2" label="Child 1" icon={<FileIcon />} />
            <TreeItem nodeId="3" label="Child 2" icon={<FileIcon />} />
            <TreeItem nodeId="4" label="Branch" icon={<FolderIcon />}>
                <TreeItem nodeId="5" label="Grandchild" icon={<FileIcon />} />
            </TreeItem>
        </TreeItem>
      )
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  }; 