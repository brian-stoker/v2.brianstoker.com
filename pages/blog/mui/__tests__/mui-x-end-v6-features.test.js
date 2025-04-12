import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-end-v6-features.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(screen.getByText('Top Layout Blog')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders docs prop when provided', () => {
      const props = { docs: docs };
      render(<Page {...props} />);
      expect(screen.getByRole('doc')).toBeInTheDocument();
    });

    it('does not render docs prop when not provided', () => {
      const props = {};
      render(<Page {...props} />);
      expect(screen.queryByRole('doc')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is invalid', () => {
      const props = { docs: null };
      expect(() => render(<Page {...props} />)).toThrowError();
    });

    it('does not throw an error when docs prop is valid', () => {
      const props = { docs: docs };
      expect(() => render(<Page {...props} />)).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    let page;

    beforeEach(() => {
      page = render(<Page />);
    });

    it('calls onClick prop when clicked', () => {
      const onClickMock = jest.fn();
      const props = { docs: docs, onClick: onClickMock };
      render(<Page {...props} />);
      fireEvent.click(screen.getByText('Top Layout Blog'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick prop when no such element exists', () => {
      const onClickMock = jest.fn();
      const props = { docs: docs, onClick: onClickMock };
      render(<Page {...props} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClickMock).not.toHaveBeenCalled();
    });
  });

  describe('side effects or state changes', () => {
    let page;

    beforeEach(() => {
      page = render(<Page />);
    });

    it('does not change any state when no user interaction occurs', () => {
      const stateChangeMock = jest.spyOn(page, 'setState');
      render(<Page />);
      expect(stateChangeMock).not.toHaveBeenCalled();
    });
  });
});

export default {};