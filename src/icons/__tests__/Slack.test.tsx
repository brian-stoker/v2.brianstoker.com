import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Slack from './Slack.test.tsx';

describe('Slack component', () => {
  const props = {
    variant: 'default',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Slack {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders monochrome variant correctly', async () => {
    props.variant = 'monochrome';
    const { getByText } = render(<Slack {...props} />);
    expect(getByText('Monochrome')).toBeInTheDocument();
  });

  it('renders hover-color variant correctly', async () => {
    props.variant = 'hover-color';
    const { getByText } = render(<Slack {...props} />);
    expect(getByText('Hover Color')).toBeInTheDocument();
  });

  it('calls onMouseEnter handler when mouse enters the icon', async () => {
    const onMouseEnterMock = jest.fn();
    props.onMouseEnter = onMouseEnterMock;
    const { getByRole } = render(<Slack {...props} />);
    const icon = getByRole('img');
    fireEvent.mouseOver(icon);
    expect(onMouseEnterMock).toHaveBeenCalledTimes(1);
  });

  it('calls onMouseLeave handler when mouse leaves the icon', async () => {
    const onMouseLeaveMock = jest.fn();
    props.onMouseLeave = onMouseLeaveMock;
    const { getByRole } = render(<Slack {...props} />);
    const icon = getByRole('img');
    fireEvent.mouseOut(icon);
    expect(onMouseLeaveMock).toHaveBeenCalledTimes(1);
  });

  it('renders paths correctly', async () => {
    const { getAllByRole } = render(<Slack {...props} />);
    const paths = getAllByRole('path');
    expect(paths.length).toBe(4);
  });
});