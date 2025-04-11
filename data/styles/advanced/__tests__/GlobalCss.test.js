import { render, fireEvent, screen } from '@testing-library/react';
import GlobalCss from './GlobalCss.test.js';
import { MockedMUIStylesProvider } from './mock/MockMUIStylesProvider';

describe('GlobalCss component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss />
      </MockedMUIStylesProvider>
    );
    expect(screen.getByText('cssjss-advanced-global-root')).toBeInTheDocument();
    expect(screen.getByText('cssjss-advanced-global-child')).toBeInTheDocument();
  });

  it('renders global child when class is present', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss className="cssjss-advanced-global-child" />
      </MockedMUIStylesProvider>
    );
    expect(screen.getByText('cssjss-advanced-global-root')).toBeInTheDocument();
    expect(screen.getByText('cssjss-advanced-global-child')).toBeInTheDocument();
  });

  it('renders global child when class is not present', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss />
      </MockedMUIStylesProvider>
    );
    expect(screen.getByText('cssjss-advanced-global-root')).toBeInTheDocument();
    expect(screen.queryByText('cssjss-advanced-global-child')).not.toBeInTheDocument();
  });

  it('renders global root when class is present', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss className="cssjss-advanced-global-root" />
      </MockedMUIStylesProvider>
    );
    expect(screen.getByText('cssjss-advanced-global-root')).toBeInTheDocument();
    expect(screen.queryByText('cssjss-advanced-global-child')).not.toBeInTheDocument();
  });

  it('renders global root when class is not present', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss className="invalid-class" />
      </MockedMUIStylesProvider>
    );
    expect(screen.getByText('cssjss-advanced-global-root')).toBeInTheDocument();
    expect(screen.queryByText('cssjss-advanced-global-child')).not.toBeInTheDocument();
  });

  it('handle global root class change', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss className="cssjss-advanced-global-root" />
      </MockedMUIStylesProvider>
    );

    const element = screen.getByText('cssjss-advanced-global-root');
    fireEvent.change(element, { target: { value: 'new-class' } });

    expect(screen.getByText('cssjss-advanced-global-root')).toHaveStyle('height', '100px');

    expect(screen.queryByText('cssjss-advanced-global-child')).not.toBeInTheDocument();
  });

  it('handle global child class change', () => {
    render(
      <MockedMUIStylesProvider>
        <GlobalCss className="cssjss-advanced-global-child" />
      </MockedMUIStylesProvider>
    );

    const element = screen.getByText('cssjss-advanced-global-child');
    fireEvent.change(element, { target: { value: 'new-class' } });

    expect(screen.queryByText('cssjss-advanced-global-root')).not.toBeInTheDocument();
    expect(screen.getByText('cssjss-advanced-global-child')).toHaveStyle('height', '8px');

    const element2 = screen.getByText('cssjss-advanced-global-child');
    fireEvent.change(element2, { target: { value: '' } });

    expect(screen.queryByText('cssjss-advanced-global-root')).not.toBeInTheDocument();
    expect(screen.queryByText('cssjss-advanced-global-child')).not.toBeInTheDocument();
  });
});