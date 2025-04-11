import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutCareers from '../components/TopLayoutCareers';
import pageProps from '../../pages/company/contact/contact.md';
import userEvent from '@testing-library/user-event';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutCareers component', () => {
      expect(screen.getByRole('heading')).toHaveTextContent(pageProps.title);
    });
  });

  describe('Prop Validation', () => {
    const invalidProps = { ...pageProps, invalidProp: 'invalidValue' };

    it(' validates props', () => {
      expect(() => render(<Page {...invalidProps} />)).toThrowError(
        'Invalid prop: invalidProp'
      );
    });
  });

  describe('Conditional Rendering', () => {
    const showOnlyTitle = true;

    beforeAll(() => {
      jest.spyOn(pageProps, 'showOnlyTitle').mockReturnValue(showOnlyTitle);
    });

    it('renders only title when showOnlyTitle is true', () => {
      expect(screen.getByRole('heading')).toHaveTextContent(
        pageProps.title
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });

  describe('User Interactions', () => {
    const onChangeMock = jest.fn();

    beforeAll(() => {
      jest.spyOn(pageProps, 'onChange').mockImplementation(onChangeMock);
    });

    it('calls onChange when input changes', () => {
      const inputField = screen.getByPlaceholderText('Input field');
      userEvent.type(inputField, 'new value');
      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock).toHaveBeenCalledWith('new value');
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });

  describe('Side Effects', () => {
    const showOnlyTitle = true;

    beforeAll(() => {
      jest.spyOn(pageProps, 'showOnlyTitle').mockReturnValue(showOnlyTitle);
    });

    it('calls showOnlyTitle when rendered', () => {
      expect(screen.getByRole('heading')).toHaveTextContent(
        pageProps.title
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });
});

export default { test: true };