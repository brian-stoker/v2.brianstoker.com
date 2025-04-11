import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MaterialDesignDemo from './MaterialDesignDemo';

jest.mock('@mui/material', () => ({
  CardMedia: jest.fn(),
  Card: jest.fn(),
  Stack: jest.fn(),
  Typography: jest.fn(),
  Chip: jest.fn(),
  Rating: jest.fn(),
  Switch: jest.fn(),
}));

describe('Material Design Demo Component', () => {
  const renderComponent = (props: any) =>
    render(
      <MaterialDesignDemo {...props} />,
      { wrapper: expect.any(Function) }
    );

  beforeEach(() => {
    global.document = {
      createAttribute: jest.fn(),
      removeAttribute: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const props = {};
    renderComponent(props);
    expect(render().container).not.toBeNull();
  });

  it('renders with Chip correctly', () => {
    const props = { active: true };
    const { getByText } = renderComponent(props);
    expect(getByText('Active')).toBeInTheDocument();
  });

  it('renders with Rating correctly', () => {
    const props = { active: true };
    const { getByText } = renderComponent(props);
    expect(getByText('Rating component')).toBeInTheDocument();
  });

  it('renders with Switch correctly', () => {
    const props = { active: false };
    const { getByText } = renderComponent(props);
    expect(getByText('Inactive')).toBeInTheDocument();
  });

  it('updates state when Switch is clicked', () => {
    const props = { active: true };
    const onSwitchChange = jest.fn();
    const { re-render, getByText } = render(
      <MaterialDesignDemo {...props} onChange={onSwitchChange} />,
    );
    fireEvent.click(getByText('Inactive'));
    expect(onSwitchChange).toHaveBeenCalledTimes(1);
  });

  it('renders with Stack correctly', () => {
    const props = {};
    const { queryAllByRole, getByText } = renderComponent(props);
    expect(queryAllByRole('listitem')).not.toBeNull();
    expect(getByText('Yosemite National Park, California, USA')).toBeInTheDocument();
  });

  it('renders with Typography correctly', () => {
    const props = {};
    const { queryAllByRole, getByText } = renderComponent(props);
    expect(queryAllByRole('heading')).not.toBeNull();
    expect(getByText('Yosemite National Park, California, USA')).toBeInTheDocument();
  });

  it('renders with Stack2 correctly', () => {
    const props = {};
    const { queryAllByRole, getByText } = renderComponent(props);
    expect(queryAllByRole('listitem')).not.toBeNull();
    expect(getByText('Yosemite National Park, California, USA')).toBeInTheDocument();
  });

  it('renders with Stack3 correctly', () => {
    const props = {};
    const { queryAllByRole, getByText } = renderComponent(props);
    expect(queryAllByRole('listitem')).not.toBeNull();
    expect(getByText('Yosemite National Park, California, USA')).toBeInTheDocument();
  });
});