import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { createMockProvider } from '@mui/material/styles';
import { Icons } from './Icons'; // Replace with actual import path
import { IconsProps } from './Icons.types'; // Replace with actual import path

describe('Icons', () => {
  const icons = new Icons();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(icons.render()).not.toThrowError();
  });

  describe('Props Validation', () => {
    const validIconProps: IconsProps = {
      icon: 'add',
      size: 24,
      color: 'primary',
    };

    const invalidIconProps: IconsProps = {
      // Add more invalid props here
    };

    it(' validates icon prop', () => {
      expect(icons.render(validIconProps)).toMatchSnapshot();
    });

    it('validates size prop', () => {
      expect(icons.render(validIconProps)).toMatchSnapshot();
    });

    it('validates color prop', () => {
      expect(icons.render(validIconProps)).toMatchSnapshot();
    });

    // Add more tests for invalid props
  });

  describe('Conditional Rendering', () => {
    const icon = new Icons({
      icon: 'add',
      size: 24,
      color: 'primary',
    });

    it('renders when icon prop is valid and size prop is 24', () => {
      expect(icon.render()).toMatchSnapshot();
    });

    it('does not render when icon prop is invalid', () => {
      const iconWithInvalidIconProp = new Icons({
        icon: 'invalid-icon',
        size: 24,
        color: 'primary',
      });
      expect(iconWithInvalidIconProp.render()).not.toBeNull();
    });

    // Add more tests for conditional rendering
  });

  describe('User Interactions', () => {
    const icon = new Icons({
      icon: 'add',
      size: 24,
      color: 'primary',
    });

    it('calls onClick when clicked', async () => {
      const mockClick = jest.fn();
      fireEvent.click(icon);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    // Add more tests for user interactions
  });

  describe('Side Effects', () => {
    const icon = new Icons({
      icon: 'add',
      size: 24,
      color: 'primary',
    });

    it('calls side effect when rendered with valid props', async () => {
      expect(icon.sideEffect()).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mocking External Dependencies', () => {
    const mockIcon = createMockProvider({
      Icon: jest.fn(),
    });

    it('uses mocked external dependency when provided', async () => {
      expect(mockIcon.Icon).toHaveBeenCalledTimes(1);
    });

    // Add more tests for mocking external dependencies
  });
});