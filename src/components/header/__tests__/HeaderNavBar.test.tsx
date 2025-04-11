import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import HeaderNavBar from './HeaderNavBar.test.tsx';

describe('HeaderNavBar', () => {
  beforeEach(() => {
    global.document = { element: () => ({}) };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<HeaderNavBar />);
    expect(getByText('Art')).toBeInTheDocument();
    expect(getByText('Photography')).toBeInTheDocument();
    expect(getByText('Drums')).toBeInTheDocument();
    expect(getByText('blog')).toBeInTheDocument();
    expect(getByText('Resume')).toBeInTheDocument();
  });

  it('renders navigation links', async () => {
    const { getByRole } = render(<HeaderNavBar />);
    expect(screen.getByRole('listitem', { name: 'Art' })).toHaveAttribute(
      'href',
      '/art'
    );
    expect(screen.getByRole('listitem', { name: 'Photography' })).toHaveAttribute(
      'href',
      '/photography'
    );
    expect(screen.getByRole('listitem', { name: 'Drums' })).toHaveAttribute(
      'href',
      '/drums'
    );
    expect(screen.getByRole('listitem', { name: 'blog' })).toHaveAttribute(
      'href',
      '/blog'
    );
    expect(screen.getByRole('listitem', { name: 'Resume' })).toHaveAttribute(
      'href',
      '/resume'
    );
  });

  it('opens and closes submenu on keydown', async () => {
    const { getByText, getByRole } = render(<HeaderNavBar />);
    const productsMenuRef = document.getElementById(getProductIds()[0]) as HTMLButtonElement;
    fireEvent.keyDown(productsMenuRef, 'ArrowDown');
    expect(screen.getByRole('listitem', { name: 'Art' })).toHaveAttribute(
      'href',
      '/art'
    );
    fireEvent.keyDown(productsMenuRef, 'ArrowUp');
    expect(screen.getByRole('listitem', { name: 'Photography' })).toHaveAttribute(
      'href',
      '/photography'
    );
  });

  it('opens and closes submenu on click', async () => {
    const { getByText, getByRole } = render(<HeaderNavBar />);
    const productsMenuRef =
      document.getElementById(getProductIds()[0]) as HTMLButtonElement;
    fireEvent.click(productsMenuRef);
    expect(screen.getByRole('listitem', { name: 'Art' })).toHaveAttribute(
      'href',
      '/art'
    );
    fireEvent.click(productsMenuRef);
    expect(screen.getByRole('listitem', { name: 'Photography' })).toHaveAttribute(
      'href',
      '/photography'
    );
  });

  it('closes submenu when escape key is pressed', async () => {
    const { getByText, getByRole } = render(<HeaderNavBar />);
    const productsMenuRef =
      document.getElementById(getProductIds()[0]) as HTMLButtonElement;
    fireEvent.keyDown(productsMenuRef, 'ArrowDown');
    expect(screen.getByRole('listitem', { name: 'Art' })).toHaveAttribute(
      'href',
      '/art'
    );
    fireEvent.keyDown(productsMenuRef, 'Escape');
    expect(screen.queryByRole('listitem', { name: 'Art' })).null;
  });
});