import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen, by, waitForTextChanges } from '@testing-library/user-event';
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

const mockUseTreeItem = jest.fn();

interface Props {
  nodeId: string;
  label?: string;
}

const CustomContent: React.FC<Props & TreeItemContentProps> = (props) => {
  const { nodeId, lastNestedChild } = props;

  return (
    <div className="root">
      {lastNestedChild ? (
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', display: 'inline-block', verticalAlign: 'middle', zIndex: 1 }} />
      ) : (
        <Typography>{nodeId}</Typography>
      )}
    </div>
  );
};

const CustomTreeItem = React.forwardRef(function (props: Props & TreeItemProps, ref) {
  return <FileElement ContentComponent={CustomContent} {...props} />;
});

describe('FolderTreeView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render the tree view', async () => {
    const { container } = render(<FolderTreeView />);
    expect(container).toMatchSnapshot();
  });

  it('should expand and collapse nodes', async () => {
    const { getByText, getByRole } = render(<FolderTreeView />);
    const expandButton = screen.getByRole('button', { name: 'expand' });
    const collapseButton = screen.getByRole('button', { name: 'collapse' });

    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();

    fireEvent.click(expandButton);
    await waitFor(() => expect(getByText('3')).toBeInTheDocument());

    fireEvent.click(collapseButton);
    await waitFor(() => expect(getByText('3')).not.toBeInTheDocument());
  });

  it('should render icons', async () => {
    const { getByRole } = render(<FolderTreeView />);
    const expandIcon = screen.getByRole('icon', { name: 'expand' });
    const collapseIcon = screen.getByRole('icon', { name: 'collapse' });

    expect(expandIcon).toHaveStyle({ fontSize: 16, color: 'grey.600' });
    expect(collapseIcon).toHaveStyle({ fontSize: 16, color: 'primary.main' });
  });

  it('should handle keyboard navigation', async () => {
    const { getByRole } = render(<FolderTreeView />);
    const expandButton = screen.getByRole('button', { name: 'expand' });
    const collapseButton = screen.getByRole('button', { name: 'collapse' });

    fireEvent.click(expandButton);
    await waitFor(() => expect(getByText('1')).toBeInTheDocument());

    // Navigate to node 2 using arrow keys
    const node2 = screen.getByText('2');
    fireEvent.keyDown(node2, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(node2, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(getByText('components')).toBeInTheDocument());

    // Navigate to node 3 using arrow keys
    const node3 = screen.getByText('3');
    fireEvent.keyDown(node3, { key: 'ArrowRight', code: 'ArrowRight' });
    fireEvent.keyDown(node3, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(getByText('Button.tsx')).toBeInTheDocument());
  });

  it('should render child nodes', async () => {
    const { getByText } = render(<FolderTreeView />);
    const node5 = screen.getByText('5');
    const node8 = screen.getByText('SignUpPage.tsx');

    // Expand node 5
    fireEvent.click(getByText('expand'));
    await waitFor(() => expect(node8).toBeInTheDocument());

    // Collapse node 5
    fireEvent.click(getByText('collapse'));
    await waitFor(() => expect(node8).not.toBeInTheDocument());
  });

  it('should handle mouse events', async () => {
    const { getByRole } = render(<FolderTreeView />);
    const expandButton = screen.getByRole('button', { name: 'expand' });
    const collapseButton = screen.getByRole('button', { name: 'collapse' });

    fireEvent.click(expandButton);
    await waitFor(() => expect(getByText('1')).toBeInTheDocument());

    // Click on node 2
    const node2 = screen.getByText('2');
    fireEvent.mouseDown(node2);

    // Check if the node is expanded
    await waitFor(() => expect(getByText('components')).toBeInTheDocument());
  });
});