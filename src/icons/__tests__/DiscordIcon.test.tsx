import { render, fireEvent } from '@testing-library/react';
import SvgDiscord from './SvgDiscord';

describe('SvgDiscord component', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = render(<SvgDiscord />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  it('renders correctly when props are valid', () => {
    const { getByTitle } = render(<SvgDiscord title="Discord" />);
    expect(getByTitle('Discord')).toBeInTheDocument();
  });

  it('renders incorrectly when invalid prop is provided', () => {
    const { getByText } = render(<SvgDiscord title="Invalid Title" />);
    expect(getByText('Invalid Title')).toBeInTheDocument();
  });

  it('calls onClick event handler correctly', () => {
    const onClickHandlerMock = jest.fn();
    const { getByTitle } = render(<SvgDiscord title="Discord" onClick={onClickHandlerMock} />);
    const icon = getByTitle('Discord');
    fireEvent.click(icon);
    expect(onClickHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('calls onChange event handler correctly', () => {
    const onChangeHandlerMock = jest.fn();
    const { getByTitle } = render(<SvgDiscord title="Discord" onChange={onChangeHandlerMock} />);
    const inputField = getByTitle('Input Field');
    fireEvent.change(inputField, { target: 'new value' });
    expect(onChangeHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit event handler correctly', () => {
    const onSubmitHandlerMock = jest.fn();
    const { getByTitle } = render(<SvgDiscord title="Discord" onSubmit={onSubmitHandlerMock} />);
    const inputField = getByTitle('Input Field');
    fireEvent.change(inputField, { target: 'new value' });
    fireEvent.submit(inputField);
    expect(onSubmitHandlerMock).toHaveBeenCalledTimes(1);
  });

  it('snapshot test for correct rendering', () => {
    render(<SvgDiscord title="Discord" />);
    const icon = document.querySelector('svg');
    expect(icon).toMatchSnapshot();
  });
});