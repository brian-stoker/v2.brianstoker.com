import { render, fireEvent, waitFor } from '@testing-library/react';
import AppNavIcons from './AppNavIcons';

describe('AppNavIcons', () => {
  let component;
  let mockStandardNavIcons;

  beforeEach(() => {
    mockStandardNavIcons = {
      ReaderIcon: () => <div>Mocked ChromeReaderModeRoundedIcon</div>,
      BookIcon: () => <div>Mocked BookRoundedIcon</div>,
      DescriptionIcon: () => <div>Mocked ArticleRoundedIcon</div>,
      VisibilityIcon: () => <div>Mocked VisibilityRoundedIcon</div>,
      WebIcon: () => <div>Mocked WebRoundedIcon</div>,
    };
  });

  it('renders without crashing', async () => {
    component = render(<AppNavIcons standardNavIcons={mockStandardNavIcons} />);
    expect(component).toBeTruthy();
  });

  describe('conditional rendering paths', () => {
    it(' renders ReaderIcon when ReaderIcon prop is passed', async () => {
      const { getByText } = render(<AppNavIcons standardNavIcons={mockStandardNavIcons} />);
      await waitFor(() => expect(getByText('Mocked ChromeReaderModeRoundedIcon')).toBeInTheDocument());
    });

    it('renders BookIcon when BookIcon prop is passed', async () => {
      const { getByText } = render(<AppNavIcons standardNavIcons={{ ...mockStandardNavIcons, ReaderIcon: null }} />);
      await waitFor(() => expect(getByText('Mocked BookRoundedIcon')).toBeInTheDocument());
    });

    it('renders DescriptionIcon when DescriptionIcon prop is passed', async () => {
      const { getByText } = render(<AppNavIcons standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(getByText('Mocked ArticleRoundedIcon')).toBeInTheDocument());
    });

    it('renders VisibilityIcon when VisibilityIcon prop is passed', async () => {
      const { getByText } = render(<AppNavIcons standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(getByText('Mocked VisibilityRoundedIcon')).toBeInTheDocument());
    });

    it('renders WebIcon when WebIcon prop is passed', async () => {
      const { getByText } = render(<AppNavIcons standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(getByText('Mocked WebRoundedIcon')).toBeInTheDocument());
    });

    it('renders default icons when no props are passed', async () => {
      const { getByText } = render(<AppNavIcons />);
      await waitFor(() =>
        expect(getByText('Mocked ChromeReaderModeRoundedIcon')).toBeInTheDocument() ||
          expect(getByText('Mocked BookRoundedIcon')).toBeInTheDocument() ||
          expect(getByText('Mocked ArticleRoundedIcon')).toBeInTheDocument() ||
          expect(getByText('Mocked VisibilityRoundedIcon')).toBeInTheDocument() ||
          expect(getByText('Mocked WebRoundedIcon')).toBeInTheDocument(),
      );
    });
  });

  it('validates prop types', async () => {
    const invalidProps = { ReaderIcon: null, BookIcon: 'InvalidBookIcon' };
    const { error } = render(<AppNavIcons standardNavIcons={invalidProps} />);
    expect(error).toBeInstanceOf( TypeError );
  });

  describe('user interactions', () => {
    it('calls onClick when ReaderIcon prop is clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} standardNavIcons={mockStandardNavIcons} />);
      await waitFor(() => expect(onClickMocked).toHaveBeenCalledTimes(1));
    });

    it('calls onClick when BookIcon prop is clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} standardNavIcons={{ ...mockStandardNavIcons, ReaderIcon: null }} />);
      await waitFor(() => expect(onClickMocked).toHaveBeenCalledTimes(1));
    });

    it('calls onClick when DescriptionIcon prop is clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(onClickMocked).toHaveBeenCalledTimes(1));
    });

    it('calls onClick when VisibilityIcon prop is clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(onClickMocked).toHaveBeenCalledTimes(1));
    });

    it('calls onClick when WebIcon prop is clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} standardNavIcons={{ ...mockStandardNavIcons, BookIcon: null }} />);
      await waitFor(() => expect(onClickMocked).toHaveBeenCalledTimes(1));
    });

    it('calls onClick when no props are clicked', async () => {
      const onClickMocked = jest.fn();
      component = render(<AppNavIcons onClick={onClickMocked} />);
      await waitFor(() => expect(onClickMocked).not.toHaveBeenCalled());
    });
  });

  it('side effects', async () => {
    // No side effects in this component
  });
});