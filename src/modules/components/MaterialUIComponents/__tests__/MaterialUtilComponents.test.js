import React from 'react';
import { render } from '@testing-library/react';
import MaterialUtilComponents from './MaterialUtilComponents';
import { Grid, InfoCard } from '@mui/material';

jest.mock('@stoked-ui/docs/InfoCard');

describe('MaterialUtilComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MaterialUtilComponents />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders grid items', () => {
      const { getAllByRole } = render(<MaterialUtilComponents />);
      const gridItems = getAllByRole('griditem');
      expect(gridItems.length).toBeGreaterThan(0);
    });

    it('does not render grid item when utilComponents prop is falsy', () => {
      const { container } = render(<MaterialUtilComponents utilComponents=[] />);
      expect(container).not.toContainElement(expect.any(Grid));
    });
  });

  describe('Props Validation', () => {
    it('accepts valid utilComponents prop', () => {
      const utilComponentsValid = [...utilComponents];
      const { container } = render(<MaterialUtilComponents utilComponents=utilComponentsValid />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid utilComponents prop (empty array)', () => {
      const { container } = render(<MaterialUtilComponents utilComponents=[] />);
      expect(container).not.toContainElement(expect.any(Grid));
    });

    it('rejects invalid utilComponents prop (not an array)', () => {
      const MaterialUtilComponentsInvalidProp = <Grid container spacing={2}>Invalid</Grid>;
      const { container } = render(<MaterialUtilComponents utilComponents=MaterialUtilComponentsInvalidProp />);
      expect(container).not.toContainElement(expect.any(Grid));
    });
  });

  describe('User Interactions', () => {
    it('renders grid items when clicking on icon', () => {
      const { getByRole } = render(<MaterialUtilComponents />);
      const icon = document.querySelector('[data-testid="icon"]');
      icon.click();
      expect(getByRole('griditem')).toBeInTheDocument();
    });

    it('does not render grid item when clicking on non-icon element', () => {
      const MaterialUtilComponentsInvalidProp = <Grid container spacing={2}>Click me!</Grid>;
      const { getByText } = render(<MaterialUtilComponents utilComponents=MaterialUtilComponentsInvalidProp />);
      const link = document.querySelector('[data-testid="link"]');
      link.click();
      expect(getByText('Click me!')).toBeInTheDocument();
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<MaterialUtilComponents />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});