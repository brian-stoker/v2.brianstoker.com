import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import pageProps from 'pages/careers/staff-ui-engineer-base-ui.md?muiMarkdown';

describe('Staff UI Engineer Base UI', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TopLayoutCareers {...pageProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders conditional paths', async () => {
      // Render different conditional paths
      const { container, getAllByRole } = render(<TopLayoutCareers {...pageProps} />);
      expect(getAllByRole('header')).toHaveLength(1);
      expect(getAllByRole('main')).toHaveLength(1);
    });

    it('renders with invalid props', async () => {
      // Create mock props
      const mockInvalidProps = { invalidProp: 'value' };

      // Render component with invalid props
      const { container } = render(<TopLayoutCareers {...mockInvalidProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('responds to clicks on links', async () => {
      // Create mock props
      const mockProps = pageProps;

      // Render component with mock props
      const { getByText, getByRole } = render(<TopLayoutCareers {...mockProps} />);
      const link = getByRole('link');
      fireEvent.click(link);
    });

    it('responds to input changes', async () => {
      // Create mock props
      const mockProps = pageProps;

      // Render component with mock props
      const { getByRole, getByDisplayValue } = render(<TopLayoutCareers {...mockProps} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
    });

    it('responds to form submissions', async () => {
      // Create mock props
      const mockProps = pageProps;

      // Render component with mock props
      const { getByRole } = render(<TopLayoutCareers {...mockProps} />);
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
    });
  });

  describe('Side Effects', () => {
    it('calls external dependency on mount', async () => {
      // Create mock props
      const mockProps = pageProps;

      // Mock external dependency
      jest.spyOn(mockProps, 'dependentFunction');

      // Render component with mock props
      const { container } = render(<TopLayoutCareers {...mockProps} />);
      expect(mockProps.dependentFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshots', () => {
    it('matches the expected snapshot', async () => {
      // Create mock props
      const mockProps = pageProps;

      // Render component with mock props
      const { asFragment } = render(<TopLayoutCareers {...mockProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});