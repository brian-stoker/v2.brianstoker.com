import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-phuket-retreat.md?muiMarkdown';

describe('Page', () => {
  const initialDocs = docs;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(true).toBe(true);
  });

  describe('props validation', () => {
    const invalidDocsProp = {};
    const validDocsProp = { title: 'Phuket Retreat' };

    it('throws an error when docs prop is invalid', () => {
      expect(() => <Page docs={invalidDocsProp} />).toThrow();
    });

    it('renders correctly with valid props', () => {
      render(<Page docs={validDocsProp} />);
      expect(getByText(validDocsProp.title)).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    const validDocs = { title: 'Phuket Retreat' };

    it('renders TopLayoutBlog component', () => {
      render(<TopLayoutBlog docs={validDocs} />);
      expect(getByRole('heading')).toBeInTheDocument();
    });

    it('renders docs within the layout', () => {
      render(<Page />);
      expect(getByText(validDocs.title)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    const validDocs = { title: 'Phuket Retreat' };
    const mockClickHandler = jest.fn();

    beforeEach(() => {
      render(<TopLayoutBlog docs={validDocs} onClick={mockClickHandler} />);
    });

    it('calls the onCLick handler when clicked', () => {
      const button = getByRole('button');
      fireEvent.click(button);
      expect(mockClickHandler).toHaveBeenCalledTimes(1);
    });

    it('renders a form with input field', () => {
      render(<Page />);
      const inputField = getByPlaceholderText('Type something');
      expect(inputField).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    const validDocs = { title: 'Phuket Retreat' };
    const invalidDocsProp = {};

    it('renders TopLayoutBlog when docs prop is valid', () => {
      render(<Page docs={validDocs} />);
      expect(getByRole('heading')).toBeInTheDocument();
    });

    it('does not render anything when docs prop is invalid', () => {
      render(<Page docs={invalidDocsProp} />);
      expect(getByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('snapshot test', () => {
    const validDocs = { title: 'Phuket Retreat' };

    it('matches the snapshot when rendered', async () => {
      const { asFragment } = render(<Page docs={validDocs} />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});