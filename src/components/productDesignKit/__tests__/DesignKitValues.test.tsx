import { render, fireEvent } from '@testing-library/react';
import DesignKitValues from './DesignKitValues';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@stoked-ui/docs/InfoCard', () => ({
  InfoCard: ({ children }) => <>{children}</>,
}));

const component = () => (
  <DesignKitValues />
);

describe('DesignKitValues Component Tests', () => {
  const initialContent = [...content];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(render(component)).not.toThrowError();
  });

  describe('conditional rendering', () => {
    const conditionalContent = [
      { icon: <Palette fontSize="small" color="primary" />, title: 'For designers' },
      { icon: <LibraryBooks fontSize="small" color="primary" />, title: 'For product managers' },
    ];

    it('renders correct content', async () => {
      const { getByText } = render(component);
      expect(getByText(conditionalContent[0].title)).toBeInTheDocument();
      expect(getByText(conditionalContent[1].title)).not.toBeInTheDocument();
    });

    it('renders all content when conditional prop is false', async () => {
      const { getByText } = render(<DesignKitValues conditional={false} />);
      for (const item of initialContent) {
        expect(getByText(item.title)).toBeInTheDocument();
      }
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', () => {
      const { container } = render(component);
      expect(container).toHaveStyle('grid-template-columns: 1fr 1fr 1fr');
    });

    it('throws error for invalid props', async () => {
      try {
        render(<DesignKitValues invalidProp="test" />);
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toBe('Invalid prop passed, expected type ReactNode');
      }
    });
  });

  describe('user interactions', () => {
    it('renders correctly when clicked', async () => {
      const { getByText } = render(component);
      fireEvent.click(getByText(conditionalContent[0].title));
      expect(getByText(conditionalContent[1].title)).not.toBeInTheDocument();
    });

    it('allows input changes on cards', async () => {
      const { getByRole, getByText } = render(component);
      fireEvent.change(getByRole('textbox'));
      expect(getByText(conditionalContent[0].title)).toHaveAttribute('data-input-value', 'test');
    });
  });

  describe('side effects or state changes', () => {
    it('does not have any side effects', async () => {
      const { queryAllText } = render(component);
      expect(queryAllText()).toEqual(initialContent.map(item => item.title));
    });
  });
});