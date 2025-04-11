import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeViewer } from './ThemeViewer';
import mockData from './mockData';

describe('ThemeViewer', () => {
  const renderComponent = (props) => render(<ThemeViewer {...props} />);

  it('renders tree view with data', () => {
    const { getByText, getByRole } = renderComponent({
      data: mockData,
      expandPaths: ['path1'],
    });

    expect(getByText('Object Key')).toBeInTheDocument();
    expect(getByRole('treeitem')).toBeInTheDocument();

    // TODO: add more assertions here
  });

  it('expands and collapses tree items', () => {
    const { getByText, getByRole } = renderComponent({
      data: mockData,
      expandPaths: ['path1'],
    });

    const expandButton = getByRole('treeexpandbutton');
    fireEvent.click(expandButton);

    // TODO: add more assertions here
  });

  it('computes node IDs lazily', () => {
    const { getByText, getByRole } = renderComponent({
      data: mockData,
      expandPaths: ['path1'],
    });

    const useNodeIdsLazySpy = jest.spyOn(ThemeViewer.prototype, 'useNodeIdsLazy');
    expect(useNodeIdsLazySpy).toHaveBeenCalledTimes(1);

    // TODO: add more assertions here
  });
});