import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-mui-values.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders when docs prop is truthy', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toHaveTextContent(/Title/i);
    });

    it('does not render when docs prop is falsy', async () => {
      const { container } = render(<TopLayoutBlog docs={undefined} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toHaveTextContent(/Title/i);
    });

    it('rejects invalid docs prop', async () => {
      expect(() => <TopLayoutBlog docs="invalid" />).toThrowError();
    });
  });

  describe('user interactions', () => {
    const mockSetDoc = jest.fn();

    beforeEach(() => {
      mockSetDoc.mockReset();
    });

    it('calls setDoc when rendered with props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const docButton = getByText('doc');
      fireEvent.click(docButton);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('does not call setDoc when rendered without props', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      const docButton = getByText('doc');
      fireEvent.click(docButton);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  describe('side effects and state changes', () => {
    it('calls setDoc when form is submitted', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const form = getByRole('form');
      fireEvent.change(form, { target: { value: 'new doc' } });
      fireEvent.submit(form);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('does not call setDoc when form is not submitted', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const form = getByRole('form');
      fireEvent.change(form, { target: { value: 'new doc' } });
      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});