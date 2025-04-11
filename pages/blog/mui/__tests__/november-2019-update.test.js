import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './november-2019-update.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  const props = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render without crashing', () => {
    it('should render without crashing', () => {
      render(<TopLayoutBlog {...props} />);
      expect(screen).not.toThrowError();
    });
  });

  describe('Conditional rendering', () => {
    it('should render correctly when docs are provided', () => {
      const wrapper = render(<TopLayoutBlog {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should not render when docs are not provided', () => {
      const propsWithoutDocs = { ...props, docs: null };
      render(<TopLayoutBlog {...propsWithoutDocs} />);
      expect(screen).not.toHaveAnyElements();
    });
  });

  describe('Prop validation', () => {
    it('should validate that docs is required prop', () => {
      // @ts-expect-error
      const wrapper = render(<TopLayoutBlog {...props} />);
      expect(wrapper.props).toHaveProperty('docs');
    });

    it('should throw an error when docs is not provided as a prop', () => {
      props.docs = undefined;
      expect(() => render(<TopLayoutBlog {...props} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('should call onChangeProp when input changes', () => {
      const onChangeMock = jest.fn();
      props.onChangeProp = onChangeMock;

      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog {...props} />);
      const input = getByPlaceholderText('Input');
      fireEvent.change(input, { target: { value: 'New text' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('should call onButtonClick when button is clicked', () => {
      const onButtonClickMock = jest.fn();
      props.onButtonClick = onButtonClickMock;

      const { getByText, getByRole } = render(<TopLayoutBlog {...props} />);
      const button = getByText('Button');
      fireEvent.click(button);
      expect(onButtonClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects or state changes', () => {
    it('should update the component when a new prop is provided', () => {
      const wrapper = render(<TopLayoutBlog {...props} />);
      props.docs = { ...props.docs, updatedProp: 'New value' };
      expect(wrapper).toMatchSnapshot();
    });
  });

  afterAll(() => {
    jest.closeAllMocks();
  });
});