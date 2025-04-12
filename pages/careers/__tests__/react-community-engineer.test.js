import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-community-engineer.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div></div>';
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders correctly when props are provided', () => {
      const props = pageProps;
      render(<TopLayoutCareers {...props} />);
      expect(page).toMatchSnapshot();
    });

    it('does not render with invalid props', () => {
      const props = { invalid: 'prop' };
      render(<TopLayoutCareers {...props} />);
      expect(page).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls onClick prop when clicked', async () => {
      const onClickMock = jest.fn();
      page.getByTestId('test').onClick = onClickMock;
      fireEvent.click(page.getByTestId('test'));
      await waitFor(() => expect(onClickMock).toHaveBeenCalledTimes(1));
    });

    it('calls onChange prop when input changes', async () => {
      const onChangeMock = jest.fn();
      page.getByTestId('input').value = 'test';
      fireEvent.change(page.getByTestId('input'), { target: { value: 'new test' } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSubmit prop when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      page.getByTestId('form').submit({ preventDefault: () => {} });
      await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects and state changes', () => {
    it('calls useEffect hook with correct props', async () => {
      const effectHook = jest.fn();
      page.getByTestId('useEffect').useEffect = effectHook;
      render(<Page />);
      await waitFor(() => expect(effectHook).toHaveBeenCalledTimes(1));
    });

    it('calls useState hook with correct initial value', async () => {
      const stateMock = { test: 'state' };
      page.getByTestId('useState').useState = (initialValue) => [initialValue, jest.fn()];
      render(<Page />);
      await waitFor(() => expect(stateMock).toEqual([stateMock.test, jest.fn()]);
    });
  });

  describe('prop validation', () => {
    it('throws error with invalid prop type', async () => {
      const props = { invalid: 'prop' };
      await expect(render(<TopLayoutCareers {...props} />)).rejects.toThrow();
    });

    it('does not throw error with valid prop type', async () => {
      const props = pageProps;
      await expect(render(<TopLayoutCareers {...props} />)).not.toThrow();
    });
  });
});