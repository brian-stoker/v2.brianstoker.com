import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@mui/material/styles';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { TreeView } from '@mui/x-tree-view/TreeView';
import {
  FileElement,
  useTreeItem,
  TreeItemProps,
  TreeItemContentProps,
} from '@mui/x-tree-view/FileElement';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import FolderRounded from '@mui/icons-material/FolderRounded';
import CustomContent from './CustomContent';
import CustomTreeItem from './CustomTreeItem';
import CustomTreeView from './FolderTreeView';

const mockUseTreeItem = jest.fn(() => ({
  disabled: false,
  expanded: false,
  selected: false,
  focused: false,
  handleExpansion: jest.fn(),
  handleSelection: jest.fn(),
  preventSelection: jest.fn(),
}));

describe('FolderTreeView', () => {
  const componentProps = {
    defaultExpanded: ['1', '2', '5', '7'],
    defaultCollapseIcon: <KeyboardArrowUpRounded sx={{ fontSize: 16, color: 'primary.main' }} />,
    defaultExpandIcon: <KeyboardArrowDownRounded sx={{ fontSize: 16, color: 'grey.600' }} />,
    defaultEndIcon: <div style={{ width: 24 }} />,
    sx: { p: 1, overflowY: 'auto' },
  };

  const treeViewRef = React.createRef();

  it('renders tree view', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    expect(getByText('src')).toBeInTheDocument();
  });

  it('calls useTreeItem with default expanded nodes', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    expect(mockUseTreeItem).toHaveBeenCalledTimes(1);
    expect(mockUseTreeItem).toHaveBeenCalledWith({ nodeId: '1' });
  });

  it('calls useTreeItem when expanding node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(2);
    expect(mockUseTreeItem).toHaveBeenCalledWith({ nodeId: '1' });
  });

  it('calls useTreeItem when collapsing node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(3);
    expect(mockUseTreeItem).toHaveBeenCalledWith({ nodeId: '1' });
  });

  it('calls useTreeItem when selecting node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(4);
    expect(mockUseTreeItem).toHaveBeenCalledWith({ nodeId: '1' });
  });

  it('renders children when last child is expanded', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    const children = getByText('components');
    expect(children).toBeInTheDocument();
  });

  it('calls useTreeItem when expanding child node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    const children = getByText('components');
    fireEvent.click(children);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(5);
  });

  it('calls useTreeItem when collapsing child node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    const children = getByText('components');
    fireEvent.click(children);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(6);
  });

  it('calls useTreeItem when selecting child node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    const children = getByText('components');
    fireEvent.click(children);
    expect(mockUseTreeItem).toHaveBeenCalledTimes(7);
  });

  it('calls useTreeItem when expanding nested child node', () => {
    const { getByText } = render(<CustomTreeView {...componentProps} />);
    const treeItem = getByText('src');
    fireEvent.click(treeItem);
    const children = getByText('components');
    fireEvent.click(children);
    const grandChild = getByText('Button.tsx');
    expect(mockUseTreeItem).toHaveBeenCalledTimes(8);
  });
});