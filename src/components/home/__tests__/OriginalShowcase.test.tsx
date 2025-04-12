import React from 'react';
import { render } from 'vitest';
import '@testing-library/jest-dom';
import CoreShowcase from './CoreShowcase';

describe('Core Showcase', () => {
  beforeEach(() => {
    global.document = { createElement: jest.fn() };
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<CoreShowcase />);
    expect(getByText('Material Design')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders pointer container when element is changed', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(queryByRole('dialog')).toBeInTheDocument();
    });

    it('renders code box when element is not changed', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(getByText('Code Box')).toBeInTheDocument();
    });

    it('renders button when customized is true', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(queryByRole('button')).toBeInTheDocument();
    });
  });

  describe('theme rendering', () => {
    it('renders theme switcher with correct colors', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(queryByRole('button')).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 255, 0.5)',
      });
    });

    it('renders highlighted code with correct colors', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(queryByRole('pre')).toHaveStyle({
        backgroundColor: 'transparent',
      });
    });

    it('renders styling info with correct colors', async () => {
      const { queryByRole, getByText } = render(<CoreShowcase />);
      await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
      expect(queryByRole('div')).toHaveStyle({
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
      });
    });
  });

  it('calls onElementChange when element is changed', async () => {
    const setElement = jest.fn();
    const { getByText } = render(<CoreShowcase />);
    await Promise.all([getByText('Material Design').click(), getByText('Custom Theme').click()]);
    expect(setElement).toHaveBeenCalledTimes(1);
  });
});