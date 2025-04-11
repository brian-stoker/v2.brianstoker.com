import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FileExplorerCard from './FileListCard';

const mockInitializeFileListProps = jest.fn();

describe('FileExplorerCard component', () => {
  beforeEach(() => {
    mockInitializeFileListProps.mockReset();
  });

  it('renders without crashing', async () => {
    const { container } = render(<FileExplorerCard />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders empty list when no items are provided', () => {
      const props = InitializeFileListProps({});
      const { container } = render(<FileExplorerCard {...props} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders file list with default items', () => {
      const props = InitializeFileListProps(ITEMS);
      const { getAllByRole } = render(<FileExplorerCard {...props} />);
      expect(getAllByRole('listitem')).toHaveLength(10);
    });
  });

  describe('prop validation', () => {
    it('accepts valid items array', () => {
      const props = InitializeFileListProps(ITEMS);
      render(<FileExplorerCard {...props} />);
    });

    it('throws error when invalid items array is provided', () => {
      const props = { items: [] }; // invalid props
      expect(() => render(<FileExplorerCard {...props} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    let file explorerRef;

    beforeEach(() => {
      file explorerRef = render(<FileExplorerCard />);
    });

    it('expands and collapses nodes on click', async () => {
      const node1 = fileExplorerRef getByRole('listitem', { name: 'Company' });
      expect(node1).toBeTruthy();

      fireEvent.click(node1);
      await waitFor(() => expect(fileExplorerRef.getByRole('listitem', { name: 'Company' })).toBeVisible());

      fireEvent.click(node1);
      await waitFor(() => expect(fileExplorerRef.getByRole('listitem', { name: 'Company' })).not.toBeVisible());
    });

    it('selects and deselects nodes on click', async () => {
      const node1 = fileExplorerRef getByRole('listitem', { name: 'Company' });
      expect(node1).toBeTruthy();

      fireEvent.click(node1);
      await waitFor(() => expect(fileExplorerRef.getByRole('listitem', { name: 'Company' })).toBeSelected());

      fireEvent.click(node1);
      await waitFor(() => expect(fileExplorerRef.getByRole('listitem', { name: 'Company' })).not.toBeSelected());
    });
  });

  describe('side effects', () => {
    it('calls onDrop callback when a node is dropped', async () => {
      const onDrop = jest.fn();
      const props = InitializeFileListProps({ items: [ITEMS[0]] });
      render(<FileExplorerCard {...props} onDrop={onDrop} />);
      fireEvent.dragOver(fileExplorerRef);
      fireEvent.drop(fileExplorerRef, { data: 'file1' });
      await waitFor(() => expect(onDrop).toHaveBeenCalledTimes(1));
    });

    it('calls remove callback when a node is removed', async () => {
      const onRemove = jest.fn();
      const props = InitializeFileListProps({ items: [ITEMS[0]] });
      render(<FileExplorerCard {...props} onRemove={onRemove} />);
      fireEvent.dragOver(fileExplorerRef);
      fireEvent.drop(fileExplorerRef, { data: 'file1' });
      await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
    });
  });

  it('passes props to FileList component', () => {
    const props = InitializeFileListProps(ITEMS);
    render(<FileExplorerCard {...props} />);
    expect(fileExplorerRef.getByRole('listitem')).toHaveClass('file-list-item');
  });
});