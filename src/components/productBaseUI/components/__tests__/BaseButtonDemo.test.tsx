import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BaseButtonDemo from './BaseButtonDemo';
import { Button } from '@mui/base/Button';
import { styled, GlobalStyles } from '@mui/system';

describe('BaseButtonDemo', () => {
  it('renders without crashing with system styling', async () => {
    const result = render(<BaseButtonDemo styling="system" />);
    expect(result.container).toBeTruthy();
  });

  it('renders without crashing with css styling', async () => {
    const result = render(<BaseButtonDemo styling="css" />);
    expect(result.container).toBeTruthy();
  });

  it('renders without crashing with tailwindcss styling', async () => {
    const result = render(<BaseButtonDemo styling="tailwindcss" />);
    expect(result.container).toBeTruthy();
  });

  it('renders Button with system styling', async () => {
    const { getByText } = render(<BaseButtonDemo styling="system" />);
    const button = getByText('Button');
    expect(button).toHaveClass('base-Button-root');
  });

  it('renders Disabled Button with system styling', async () => {
    const { getByText } = render(<BaseButtonDemo styling="system" />);
    const disabledButton = getByText('Disabled');
    expect(disabledButton).toHaveClass('base-Button-root');
  });

  it('renders Button with css styling', async () => {
    const result = render(<BaseButtonDemo styling="css" />);
    const button = getByText('Button');
    expect(button).toHaveStyle({ background: '--primary' });
  });

  it('renders Disabled Button with css styling', async () => {
    const result = render(<BaseButtonDemo styling="css" />);
    const disabledButton = getByText('Disabled');
    expect(disabledButton).toHaveClass('base-Button-root');
  });

  it('renders Button with tailwindcss styling', async () => {
    const { getByText } = render(<BaseButtonDemo styling="tailwindcss" />);
    const button = getByText('Button');
    expect(button).toHaveClass('cursor-pointer select-none rounded-[8px] border-none bg-indigo-600 p-[6px_12px] text-[0.875rem] leading-[1.5] font-bold text-white [font-family:IBM_Plex_sans]');
  });

  it('renders Disabled Button with tailwindcss styling', async () => {
    const { getByText } = render(<BaseButtonDemo styling="tailwindcss" />);
    const disabledButton = getByText('Disabled');
    expect(disabledButton).toHaveClass('cursor-pointer select-none rounded-[8px] border-none bg-indigo-600 p-[6px_12px] text-[0.875rem] leading-[1.5] font-bold text-white [font-family:IBM_Plex_sans]');
  });

  it('calls getCode with system styling', () => {
    expect(BaseButtonDemo.getCode).toThrow('import { Button } from @mui/base/Button');
    expect(BaseButtonDemo.getCode).toHaveBeenCalledWith('system');
  });

  it('calls getCode with css styling', () => {
    expect(BaseButtonDemogetCode).toThrow('import { Button } from @mui/base/Button');
    expect(BaseButtonDemo.getCode).toHaveBeenCalledWith('css');
  });

  it('calls getCode with tailwindcss styling', () => {
    expect(BaseButtonDemo.getCode).toThrow('import { Button } from @mui/base/Button');
    expect(BaseButtonDemo.getCode).toHaveBeenCalledWith('tailwindcss');
  });

  it('fires click on Button with system styling', async () => {
    const result = render(<BaseButtonDemo styling="system" />);
    const button = getByText('Button');
    fireEvent.click(button);
    expect(result.getByRole('button')).toHaveBeenClicked();
  });

  it('fires click on Disabled Button with system styling', async () => {
    const result = render(<BaseButtonDemo styling="system" />);
    const disabledButton = getByText('Disabled');
    fireEvent.click(disabledButton);
    expect(result.getByRole('button')).not.toHaveBeenClicked();
  });
});