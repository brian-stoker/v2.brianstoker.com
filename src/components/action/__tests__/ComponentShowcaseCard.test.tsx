import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ComponentShowcaseCard from './ComponentShowcaseCard.test.tsx';

describe('ComponentShowcaseCard', () => {
  const props = {
    imgLoading: 'eager',
    link: 'https://example.com',
    md1: <Chip label="MD1" size="small" variant="outlined" color="primary" />,
    md2: <Chip label="MD2" size="small" variant="outlined" color="primary" />,
    md3: <Chip label="MD3" size="small" variant="outlined" color="success" />,
    name: 'John Doe',
    noGuidelines: <Chip label="No guidelines" size="small" variant="outlined" color="info" />,
    srcDark: 'https://example.com/dark.jpg',
    srcLight: 'https://example.com/light.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ComponentShowcaseCard {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct styles', async () => {
    const { getByText, getByRole } = render(<ComponentShowcaseCard {...props} />);
    expect(getByText(props.name)).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
    expect(getByText('MD1')).toBeInTheDocument();
    expect(getByText('MD2')).toBeInTheDocument();
    expect(getByText('MD3')).toBeInTheDocument();
  });

  it('renders conditional guidelines', async () => {
    const { getByText } = render(<ComponentShowcaseCard {...props} />);
    expect(getByText(props.name)).toBeInTheDocument();
    expect(getByText('No guidelines')).toBeInTheDocument();
  });

  it('handles invalid props', async () => {
    const invalidProps = { link: 'invalid' };
    const { container } = render(<ComponentShowcaseCard {...invalidProps} />);
    expect(container).toBeInTheDocument();
  });

  it('calls prefetch function on hover', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.mouseOver(card);
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls prefetch function on click', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.click(card);
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not call prefetch function on no click', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    expect(prefetchMock).not.toHaveBeenCalled();
  });

  it('does not call prefetch function on invalid click', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.click(card);
    expect(prefetchMock).not.toHaveBeenCalled();
  });

  it('calls prefetch function on scroll', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    await waitFor(() => card.scrollIntoView());
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls prefetch function on mouse enter', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.mouseEnter(card);
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls prefetch function on mouse leave', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.mouseLeave(card);
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls prefetch function on key press', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.keyPress(card, 'Enter');
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('calls prefetch function on key down', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.keyDown(card, 'Enter');
    expect(prefetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not call prefetch function on key up', async () => {
    const prefetchMock = jest.fn();
    props.prefetch = prefetchMock;
    const { getByRole, getByText } = render(<ComponentShowcaseCard {...props} />);
    const card = getByRole('card');
    fireEvent.keyUp(card, 'Enter');
    expect(prefetchMock).not.toHaveBeenCalled();
  });
});