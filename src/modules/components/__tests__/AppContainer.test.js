import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AppContainer from './AppContainer.test.js';
import mockedComponentProps from './mockedComponentProps.js';

describe('AppContainer component', () => {
  afterEach(() => jest.clearAllMocks());
  beforeEach(() => {
    document.body.innerHTML = '<div id="main-content"></div>';
  });

  it('renders without crashing', async () => {
    const { container } = render(<AppContainer />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct maxWidth prop value', async () => {
    const { getByText } = render(<AppContainer maxWidth={105} />);
    expect(getByText('maxWidth')).toHaveAttribute('value', '105');
  });

  it('renders without maxWidth prop value', async () => {
    const { getByText } = render(<AppContainer />);
    expect(getByText('maxWidth')).not.toBeInTheDocument();
  });

  it('renders with id prop value', async () => {
    const { getByText } = render(<AppContainer id="custom-id" />);
    expect(getByText('id')).toHaveAttribute('value', 'custom-id');
  });

  it('renders without id prop value', async () => {
    const { getByText } = render(<AppContainer />);
    expect(getByText('id')).not.toBeInTheDocument();
  });

  it('handles invalid maxWidth prop value', async () => {
    const { getByText } = render(<AppContainer maxWidth="invalid" />);
    expect(getByText('maxWidth')).toHaveAttribute('value', '105');
  });

  it(' handles invalid id prop value', async () => {
    const { getByText } = render(<AppContainer id={null} />);
    expect(getByText('id')).not.toBeInTheDocument();
  });

  it('should call a side effect when maxWidth is set to true', async () => {
    const mockSetMaxWidth = jest.fn();
    render(<AppContainer maxWidth={true} setMaxWidth={mockSetMaxWidth} />);
    expect(mockSetMaxWidth).toHaveBeenCalledTimes(1);
  });

  it('should not call the side effect when maxWidth is set to false', async () => {
    const mockSetMaxWidth = jest.fn();
    render(<AppContainer maxWidth={false} setMaxWidth={mockSetMaxWidth} />);
    expect(mockSetMaxWidth).not.toHaveBeenCalled();
  });

  it('should update state correctly', async () => {
    const { getByText } = render(<AppContainer />);
    fireEvent.change(getByText('input'), { target: { value: 'new-value' } });
    await waitFor(() => expect(getByText('input')).toHaveValue('new-value'));
  });

  it('should trigger a click event on the container', async () => {
    const mockClick = jest.fn();
    render(<AppContainer onClick={mockClick} />);
    fireEvent.click(document.querySelector('#main-content'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});