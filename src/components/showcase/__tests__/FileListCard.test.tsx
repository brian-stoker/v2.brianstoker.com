import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FileExplorerCard from './FileListCard';

const createRelativeDate = (diff: number) => {
  const now = Date.now();
  const diffDate = new Date(now - diff);
  return diffDate.getTime();
};

describe('FileExplorerCard component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<FileExplorerCard />);
    expect(container).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('renders FileList when data is available', async () => {
      const { getByText } = render(<FileExplorerCard />);
      await waitFor(() => getByText('Documents'));
      expect(getByText('Documents')).toBeInTheDocument();
    });

    it('does not render FileList when data is not available', async () => {
      const props = InitializeFileListProps([]);
      const { container } = render(<FileExplorerCard {...props} />);
      expect(container).not.toContainElement(getByText('Documents'));
    });
  });

  describe('prop validation', () => {
    it('calls initialize with valid data', async () => {
      const initializeMock = jest.fn();
      const props = InitializeFileListProps([]);
      render(<FileExplorerCard {...props} />);
      expect(initializeMock).toHaveBeenCalledTimes(1);
      expect(initializeMock).toHaveBeenCalledWith([]);
    });

    it('does not call initialize with invalid data', async () => {
      const initializeMock = jest.fn();
      const props = InitializeFileListProps(undefined);
      render(<FileExplorerCard {...props} />);
      expect(initializeMock).not.toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('expands/collapses items when clicked', async () => {
      const { getByText, getByRole } = render(<FileExplorerCard />);
      await waitFor(() => getByText('Documents'));
      const expandButton = getByRole('button');
      fireEvent.click(expandButton);
      expect(getByText('Company')).toBeInTheDocument();
    });

    it('selects an item when clicked', async () => {
      const { getByText, getByRole } = render(<FileExplorerCard />);
      await waitFor(() => getByText('Documents'));
      const selectButton = getByRole('button');
      fireEvent.click(selectButton);
      expect(getByText('Company')).toHaveClass('selected');
    });

    it('submits form when all items are selected', async () => {
      const { getByText, getByRole } = render(<FileExplorerCard />);
      await waitFor(() => getByText('Documents'));
      const selectAllButton = getByRole('button');
      fireEvent.click(selectAllButton);
      expect(getByRole('textbox')).toHaveValue('');
    });
  });

  describe('side effects', () => {
    it('renders grid layout when data is available', async () => {
      const { getByText } = render(<FileExplorerCard />);
      await waitFor(() => getByText('Documents'));
      expect(getByText('Documents')).toBeInTheDocument();
      expect(document.body).toHaveClass('grid-layout');
    });

    it('does not render grid layout when data is not available', async () => {
      const props = InitializeFileListProps([]);
      const { container } = render(<FileExplorerCard {...props} />);
      expect(container).not.toContainElement(getByText('Documents'));
      expect(document.body).nottoHaveClass('grid-layout');
    });
  });
});