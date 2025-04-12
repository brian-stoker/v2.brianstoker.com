import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createComponent } from './createComponent';
import TableHook from './TableHook';

const customRender = (ui, options) => {
  Object.assign(options, {
    wrapper: 'body',
    // Add other options here if needed
  });
  return render(ui, options);
};

describe('Table Hook Component', () => {
  const { render } = customRender;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering Tests', () => {
    it('should render without crashing', async () => {
      const { container } = render(<TableHook />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Props Validation Tests', () => {
    const tableType = 'table';
    const headType = 'thead';
    const rowType = 'tr';
    const cellType = 'td';

    it(`should validate component prop`, () => {
      const { error } = createComponent(tableType).propTypes;
      expect(error).toBeUndefined();
    });

    it(`should not validate invalid component props`, () => {
      const { error } = createComponent('invalid-type');
      expect(error.message).toBe(`Invalid prop ${createComponent('invalid-type').propTypes.component}`);
    });
  });

  describe('Rendering Tests', () => {
    it('renders TableHead with valid type', async () => {
      const { getByText } = render(<TableHook />);
      expect(getByText(headType)).toBeInTheDocument();
    });

    it('renders TableRow with valid type', async () => {
      const { getAllByRole } = render(<TableHook />);
      expect(getAllByRole(rowType).length).toBe(100);
    });

    it('renders TableCell with valid type', async () => {
      const { getAllByRole } = render(<TableHook />);
      expect(getAllByRole(cellType).length).toBe(4 * 100);
    });
  });

  describe('User Interactions Tests', () => {
    it('should update row values on table cell click', async () => {
      const { getByText, getbyLabelText } = render(<TableHook />);
      expect(getByText(rowType)).toBeInTheDocument();
      fireEvent.click(getByText(cellType));
      expect(getbyLabelText(rowType + ' 0')).toBeInTheDocument();
    });

    it('should submit form correctly', async () => {
      const { getAllByRole } = render(<TableHook />);
      expect(getAllByRole('button')).toHaveLength(1);
      fireEvent.click(getAllByRole('button')[0]);
    });
  });
});