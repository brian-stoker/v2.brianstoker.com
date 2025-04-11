import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SvgSuiX from './SvgSuiX';

type RootSvgProps = {
  // props
};

interface MockedComponentProps {
  value: string;
}

const MockedRootSvg = (props: MockedComponentProps) => (
  <svg>
    <path d="M8 7.748L4.15 14.415H1.585l3.849-6.667-2.566-4.444h2.566L8 7.748zm0 0l2.566 4.445h2.566l-2.566-4.445 3.849-6.666h-2.566L8 7.748z" fill="#265D97" />
    <input type="text" value={props.value} onChange={(e) => (props.value = e.target.value)} />
  </svg>
);

const MockedRootSvgProps: RootSvgProps = {
  // props
};

describe('SvgSuiX', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SvgSuiX />);
    expect(container).toBeTruthy();
  });

  it('renders root svg correctly', async () => {
    const { getByRole } = render(<SvgSuiX />);
    expect(getByRole('svg')).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(getByRole('svg')).toHaveAttribute('width', '16');
    expect(getByRole('svg')).toHaveAttribute('height', '16');
    expect(getByRole('svg')).toHaveAttribute('viewBox', '0 0 16 16');
    expect(getByRole('svg')).not.toHaveAttribute('fill');
    expect(getByRole('svg')).toHaveClass('svg-sui-x');
  });

  it('renders path correctly', async () => {
    const { getByPath } = render(<SvgSuiX />);
    expect(getByPath('M8 7.748L4.15 14.415H1.585l3.849-6.667-2.566-4.444h2.566L8 7.748zm0 0l2.566 4.445h2.566l-2.566-4.445 3.849-6.666h-2.566L8 7.748z')).toHaveAttribute('fill', '#265D97');
  });

  it('renders with valid props', async () => {
    const { getByText } = render(<SvgSuiX title="test" />);
    expect(getByText('test')).toBeInTheDocument();
  });

  it('renders without props', async () => {
    const { container } = render(<SvgSuiX />);
    expect(container).toBeTruthy();
  });

  it('renders with invalid props', async () => {
    const { getByText } = render(<SvgSuiX invalidProp="test" />);
    expect(getByText('Invalid prop')).toBeInTheDocument();
  });

  it('handles click event', async () => {
    const onClickMock = jest.fn();
    const { getByRole, getByText } = render(<SvgSuiX onClick={onClickMock} />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('handles input change event', async () => {
    const onChangeMock = jest.fn();
    const { getByText, getByPath } = render(<SvgSuiX onChange={onChangeMock} />);
    const inputField = getByPath('input[type="text"]');
    fireEvent.change(inputField, { target: { value: 'test' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('renders with mock props', async () => {
    const { getByRole } = render(<SvgSuiX {...MockedRootSvgProps} />);
    expect(getByRole('svg')).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(getByRole('svg')).toHaveAttribute('width', '16');
    expect(getByRole('svg')).toHaveAttribute('height', '16');
    expect(getByRole('svg')).toHaveAttribute('viewBox', '0 0 16 16');
    expect(getByRole('svg')).not.toHaveAttribute('fill');
    expect(getByRole('svg')).toHaveClass('svg-sui-x');

    const input = getByPath('input[type="text"]');
    expect(input).toHaveValue(MockedRootSvgProps.value);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(MockedRootSvgProps.value).toBe('test');
  });

  it('renders with mock props and change event', async () => {
    const onChangeMock = jest.fn();
    const { getByRole } = render(<SvgSuiX {...MockedRootSvgProps} onChange={onChangeMock} />);
    expect(getByRole('svg')).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(getByRole('svg')).toHaveAttribute('width', '16');
    expect(getByRole('svg')).toHaveAttribute('height', '16');
    expect(getByRole('svg')).toHaveAttribute('viewBox', '0 0 16 16');
    expect(getByRole('svg')).not.toHaveAttribute('fill');
    expect(getByRole('svg')).toHaveClass('svg-sui-x');

    const input = getByPath('input[type="text"]');
    expect(input).toHaveValue(MockedRootSvgProps.value);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(MockedRootSvgProps.value).toBe('test');
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('snapshot test', async () => {
    const { asFragment } = render(<SvgSuiX />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});