import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-core-v5.md?muiMarkdown';

describe('Page component', () => {
  const props = { docs: docs };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect.assertions(1);
    expect(screen).not.toThrowError();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component when props are provided', () => {
      render(<TopLayoutBlog docs={props.docs} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('does not render anything when no props are passed', () => {
      render(<TopLayoutBlog />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('allows valid props to be passed', () => {
      render(<Page docs={props.docs} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('throws an error when invalid props are passed', () => {
      expect(() => <TopLayoutBlog docs="invalid" />).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onChange prop when a new value is entered', async () => {
      const onChangeMock = jest.fn();
      render(<Page docs={props.docs} onChange={onChangeMock} />);
      fireEvent.change(screen.getByRole('textbox'), { target: 'new value' });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSubmit prop when the form is submitted', async () => {
      const onSubmitMock = jest.fn();
      render(<Page docs={props.docs} onSubmit={onSubmitMock} />);
      fireEvent.change(screen.getByRole('textbox'), { target: 'new value' });
      fireEvent.submit(screen.getByRole('form'));
      await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1));
    });

    it('does not call onChange or onSubmit props when no input is provided', async () => {
      const onChangeMock = jest.fn();
      const onSubmitMock = jest.fn();
      render(<Page docs={props.docs} onChange={onChangeMock} onSubmit={onSubmitMock} />);
      fireEvent.change(screen.getByRole('textbox'), { target: 'new value' });
      expect(onChangeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();

      fireEvent.change(screen.getByRole('textbox'), { target: '' });
      expect(onChangeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });
  });

  describe('side effects or state changes', () => {
    it('calls useEffect hook with provided deps array', async () => {
      const useEffectMock = jest.fn();
      render(<Page docs={props.docs} useEffect={useEffectMock} />);
      expect(useEffectMock).toHaveBeenCalledTimes(1);
      expect(useEffectMock).toHaveBeenCalledWith([props.docs]);
    });
  });

  it('renders snapshot correctly', () => {
    const { asFragment } = render(<TopLayoutBlog docs={props.docs} />);
    expect(screen.getByRole('heading')).toHaveTextContent('');
    expect(asFragment()).toMatchSnapshot();
  });
});