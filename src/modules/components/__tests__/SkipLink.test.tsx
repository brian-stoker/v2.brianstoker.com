import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SkipLink from './SkipLink';
import { styled as materialStyled } from '@mui/material/styles';
import { useTranslate } from '@stoked-ui/docs/i18n';

const StyledLink = materialStyled(MuiLink)(({ theme }) => ({
  position: 'fixed',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary[50],
  border: '1px solid',
  borderColor: theme.palette.primary[100],
  color: theme.palette.primary[600],
  outlineOffset: 5,
  outlineColor: theme.palette.primary[300],
  borderRadius: theme.shape.borderRadius,
  left: theme.spacing(2),
  zIndex: theme.zIndex.tooltip + 1,
  top: theme.spacing(-10),
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeIn,
    duration: theme.transitions.duration.leavingScreen,
  }),
  '&:hover': {
    backgroundColor: theme.palette.primary[100],
    color: theme.palette.primary[700],
  },
  '&:focus': {
    top: theme.spacing(2),
    transition: theme.transitions.create('top', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: theme.transitions.create('opacity'),
    opacity: 0,
    '&:focus': {
      top: theme.spacing(2),
      opacity: 1,
      transition: theme.transitions.create('opacity'),
    },
  },
  '@media print': {
    display: 'none',
  },
  ...theme.applyDarkStyles({
    backgroundColor: theme.palette.primaryDark[600],
    borderColor: theme.palette.primaryDark[400],
    color: theme.palette.grey[100],
    outlineColor: theme.palette.primary[500],
    '&:hover': {
      backgroundColor: theme.palette.primaryDark[500],
      color: theme.palette.grey[50],
    },
  }),
}));

describe('SkipLink', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="main-content"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    const { container } = render(<SkipLink />);
    expect(container).toBeTruthy();
  });

  it('renders with correct styles', () => {
    const { container } = render(<SkipLink />);
    const linkElement = container.querySelector(StyledLink);
    expect(linkElement.style.position).toBe('fixed');
    expect(linkElement.style.backgroundColor).toBe('rgba(0, 0, 255, 0.5)');
  });

  it('renders with correct href', () => {
    const { getByText } = render(<SkipLink />);
    const linkElement = getByText('appFrame.skipToContent');
    expect(linkElement.getAttribute('href')).toBe('#main-content');
  });

  it('calls useTranslate hook correctly', () => {
    const tMock = jest.fn();
    useTranslate.mockReturnValue(tMock);
    const { getByText } = render(<SkipLink />);
    const linkElement = getByText('appFrame.skipToContent');
    expect(tMock).toHaveBeenCalledTimes(1);
    expect(tMock).toHaveBeenCalledWith('appFrame.skipToContent');
  });

  it('does not pass invalid props', () => {
    expect(
      render(<SkipLink href="#" disableHydration={false} variant="contained" />),
    ).toThrowError(/Missing prop "href"./i);
  });

  it('renders correctly when disabled', () => {
    const { container } = render(<SkipLink disabled />);
    expect(container.querySelector(StyledLink).disabled).toBe(true);
  });

  it('calls onClick callback when clicked', () => {
    const handleClickMock = jest.fn();
    const { getByText } = render(
      <SkipLink onClick={handleClickMock}>
        {() => <SkipLink />}
      </SkipLink>,
    );
    const linkElement = getByText('');
    fireEvent.click(linkElement);
    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });

  it('calls onChange callback when input changes', () => {
    const handleChangeMock = jest.fn();
    const { getByText } = render(<SkipLink />);
    const linkElement = getByText('appFrame.skipToContent');
    fireEvent.change(linkElement, { target: { value: 'new-value' } });
    expect(handleChangeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit callback when form submitted', () => {
    const handleSubmitMock = jest.fn();
    const { getByText } = render(
      <SkipLink onSubmit={handleSubmitMock}>
        {() => <SkipLink />}
      </SkipLink>,
    );
    const linkElement = getByText('');
    fireEvent.submit(linkElement);
    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
  });
});