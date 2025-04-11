import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2019.md?muiMarkdown';

const mockDocs = docs;

describe('Page Component', () => {
  const props = {
    docs: mockDocs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { getByText } = render(<TopLayoutBlog {...props} />);
      expect(getByText('doc title')).toBeInTheDocument();
    });

    it('does not render anything if docs prop is falsy', () => {
      props.docs = false;
      const { container } = render(<TopLayoutBlog {...props} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('renders with valid docs prop', () => {
      const { getByText } = render(<TopLayoutBlog {...props} />);
      expect(getByText('doc title')).toBeInTheDocument();
    });

    it('does not render if docs prop is invalid (not an object)', () => {
      props.docs = 'invalid';
      const { container } = render(<TopLayoutBlog {...props} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('user interactions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does not trigger change event with valid docs prop', async () => {
      const onChangeMock = jest.fn();
      props.docs = mockDocs;
      render(<TopLayoutBlog {...props} onChange={onChangeMock} />);
      fireEvent.change(props.docs, { target: 'doc title' });
      expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('triggers change event with invalid docs prop', async () => {
      const onChangeMock = jest.fn();
      props.docs = null;
      render(<TopLayoutBlog {...props} onChange={onChangeMock} />);
      fireEvent.change(props.docs, { target: 'doc title' });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('triggers change event when docs prop changes', async () => {
      const onChangeMock = jest.fn();
      props.docs = mockDocs;
      render(<TopLayoutBlog {...props} onChange={onChangeMock} />);
      expect(onChangeMock).not.toHaveBeenCalled();

      props.docs = 'new doc title';
      fireEvent.change(props.docs, { target: 'new doc title' });
      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledTimes(1);
      });
    });

    it('does not trigger click event with valid docs prop', async () => {
      const onClickMock = jest.fn();
      props.docs = mockDocs;
      render(<TopLayoutBlog {...props} onClick={onClickMock} />);
      fireEvent.click(props.docs);
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('triggers click event with invalid docs prop', async () => {
      const onClickMock = jest.fn();
      props.docs = null;
      render(<TopLayoutBlog {...props} onClick={onClickMock} />);
      fireEvent.click(props.docs);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    // Add tests for any side effects or state changes that should occur
  });
});