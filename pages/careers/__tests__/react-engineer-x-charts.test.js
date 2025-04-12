import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/react-engineer-x-charts.md?muiMarkdown';

jest.mock('pages/careers/react-engineer-x-charts.md', () => ({
  default: {
    name: '',
    description: '',
  },
}));

describe('TopLayoutCareers component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toMatchSnapshot();
  });

  describe('props validation', () => {
    it('should validate props', async () => {
      // @ts-ignore
      TopLayoutCareers.defaultProps = {};

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" />
      );

      expect(getByText('').toBeInTheDocument()).toBeTrue();
      expect(getByRole('img')).toBeInTheDocument();

      // @ts-ignore
      TopLayoutCareers.defaultProps = pageProps;
    });

    it('should not validate props', async () => {
      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" />
      );

      expect(getByText('').toBeInTheDocument()).toBeFalse();
      expect(getByRole('img')).not.toBeInTheDocument();

      // @ts-ignore
      TopLayoutCareers.defaultProps = pageProps;
    });
  });

  describe('conditional rendering', () => {
    it('renders children when name and description are provided', async () => {
      const { getByText } = render(
        <TopLayoutCareers {...pageProps} name="test" description="test" />
      );

      expect(getByText('test')).toBeInTheDocument();
    });

    it('does not render children when name and description are empty', async () => {
      const { queryByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(queryByText('')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChangeProp with new props on input change', async () => {
      const onChangePropMock = jest.fn();

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" onChangeProp={onChangePropMock} />
      );

      fireEvent.change(getByText(''), { target: { value: 'test' } });

      expect(onChangePropMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onChangeProp with new props on default click', async () => {
      const onChangePropMock = jest.fn();

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" onChangeProp={onChangePropMock} />
      );

      fireEvent.click(getByText(''));

      expect(onChangePropMock).not.toHaveBeenCalled();
    });

    it('should call onChangeProp with new props on form submission', async () => {
      const onChangePropMock = jest.fn();

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" onChangeProp={onChangePropMock} />
      );

      fireEvent.change(getByText(''), { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));

      expect(onChangePropMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onChangeProp on initial render', async () => {
      const onChangePropMock = jest.fn();

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" onChangeProp={onChangePropMock} />
      );

      expect(onChangePropMock).not.toHaveBeenCalled();
    });
  });

  describe('side effects', () => {
    it('should update state with new props on render', async () => {
      const [state, setState] = React.useState({});

      const { getByText } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" />,
        { initialState: { state } }
      );

      expect(state).toEqual(pageProps);
    });

    it('should not update state on input change', async () => {
      const [state, setState] = React.useState({});

      const { getByText, getByRole } = render(
        <TopLayoutCareers {...pageProps} name={''} description="" onChangeProp={(props) => setState(props)} />,
        { initialState: { state } }
      );

      fireEvent.change(getByText(''), { target: { value: 'test' } });

      expect(state).toEqual(pageProps);
    });
  });
});