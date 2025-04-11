import React from '@testing-library/react';
import { createSvgIcon } from '@mui/material/utils';
import { render, fireEvent, waitFor } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';

describe('SketchIcon', () => {
  const Icon = createSvgIcon(
    <g fillRule="nonzero" fill="none">
      <path fill="#FDB300" d="M5.24 2.7L12 2l6.76.7L24 9.48 12 23 0 9.49z" />
      <path fill="#EA6C00" d="M4.85 9l7.13 14L0 9zM19.1 9l-7.12 14L23.95 9z" />
      <path fill="#FDAD00" d="M4.85 9H19.1l-7.12 14z" />
      <g>
        <path fill="#FDD231" d="M11.98 2l-6.75.65-.38 6.34zM11.98 2l6.75.65.37 6.34z" />
        <path fill="#FDAD00" d="M23.95 9l-5.22-6.35.37 6.34zM0 9l5.23-6.35-.38 6.34z" />
        <path fill="#FEEEB7" d="M11.98 2L4.85 9H19.1z" />
      </g>
    </g>,
    'Sketch',
  );

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render without crashing', () => {
    it('renders the component without crashing', async () => {
      const { container } = render(<Icon />);
      expect(container).toBeTruthy();
    });
  });

  describe('Conditional rendering', () => {
    it('renders correctly when icon is visible', async () => {
      const { getByRole, queryByRole } = render(<Icon />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Check if any other component elements exist (in case of a parent wrapper)
      expect(queryByRole('button')?.length).toBe(0);
    });

    it('does not render when icon is hidden', async () => {
      const { queryByRole } = render(<Icon variant="hidden" />);

      // Check if the icon element does not exist
      expect(queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('requires a valid SVG icon', async () => {
      const IconInvalid = createSvgIcon(null, 'Invalid');
      const { error } = render(IconInvalid);

      // Check if the error message is displayed
      expect(error).not.toBeNull();
    });

    it('allows a valid SVG icon', async () => {
      const { getByRole } = render(<Icon svg={<g fillRule="nonzero" fill="none">...</g>} />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Check if any other component elements exist (in case of a parent wrapper)
      expect(queryByRole('button')?.length).toBe(0);
    });
  });

  describe('User interactions', () => {
    it('calls onClick when clicked', async () => {
      const IconClick = createSvgIcon(<g fillRule="nonzero" fill="none">...</g>, 'Click');
      const { getByRole } = render(<IconClick onClick={() => jest.fn()} />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Simulate a click event on the icon
      fireEvent.click(getByRole('img'));

      // Check if the onClick callback was called
      expect(IconClick.onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when changed', async () => {
      const IconChange = createSvgIcon(<g fillRule="nonzero" fill="none">...</g>, 'Change');
      const { getByRole, queryByRole } = render(<IconChange onChange={() => jest.fn()} />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Check if any other component elements exist (in case of a parent wrapper)
      expect(queryByRole('button')?.length).toBe(0);

      // Simulate a change event on the input field
      fireEvent.change(document.querySelector('input[type="color"]'), { target: { value: 'new-color' } });

      // Check if the onChange callback was called
      expect(IconChange.onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects or state changes', () => {
    it('calls render when rendered', async () => {
      const IconRender = createSvgIcon(<g fillRule="nonzero" fill="none">...</g>, 'Render');
      const { getByRole } = render(<IconRender />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Simulate a rerender event on the icon
      await waitFor(() => IconRender.render());

      // Check if the render callback was called
      expect(IconRender.render).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mocking', () => {
    it('should mock the SVG icon correctly', async () => {
      const IconMock = createSvgIcon(<g fillRule="nonzero" fill="none">...</g>, 'Mock');
      const { getByRole } = render(<IconMock />);

      // Check if the icon element exists
      expect(getByRole('img')).toBeInTheDocument();

      // Simulate a click event on the icon
      fireEvent.click(getByRole('img'));

      // Check if the onClick callback was called with the correct value
      expect(IconMock.onClick).toHaveBeenCalledTimes(1);
    });
  });
});