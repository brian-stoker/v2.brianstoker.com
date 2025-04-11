import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import DemoErrorBoundary from './DemoErrorBoundary.test.js';

const mockT = jest.fn();
const mockOnResetDemoClick = jest.fn();

describe('DemoErrorBoundary', () => {
  beforeEach(() => {
    // Setup props for the component
    const children = <div />; // any valid children should work

    // Test rendering without error
    render(<DemoErrorBoundary children={children} name="DemoName" t={mockT} onResetDemoClick={mockOnResetDemoClick} />);
  });

  it('renders without crashing', () => {
    expect(mockT).not.toHaveBeenCalled();
    expect(mockOnResetDemoClick).not.toHaveBeenCalled();
  });

  describe('Conditional Rendering', () => {
    const validChildren = <div />;
    const invalidChildren = <span />;

    it('should render children when no error occurs', () => {
      const { getByText } = render(<DemoErrorBoundary children={validChildren} name="DemoName" t={mockT} onResetDemoClick={mockOnResetDemoClick} />);
      expect(getByText('This demo had a runtime error!')).not.toHaveBeenCalled();
    });

    it('should display error message and provide issue link when an error occurs', () => {
      const { getByText } = render(<DemoErrorBoundary children={invalidChildren} name="DemoName" t={mockT} onResetDemoClick={mockOnResetDemoClick} />);
      expect(getByText('This demo had a runtime error!')).toBeInTheDocument();
      expect(getByText(`We would appreciate it if you `)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    const validProps = { children: validChildren, name: 'DemoName', t: mockT, onResetDemoClick: mockOnResetDemoClick };

    it('should validate props when no error occurs', () => {
      render(<DemoErrorBoundary {...validProps} />);
      expect(mockT).not.toHaveBeenCalled();
      expect(mockOnResetDemoClick).not.toHaveBeenCalled();
    });

    const invalidChildren = <span />;
    const invalidName = 'invalid-name';
    const invalidT = 'invalid-t';

    it('should not allow incorrect props', () => {
      expect(() =>
        render(<DemoErrorBoundary children={invalidChildren} name={invalidName} t={invalidT} onResetDemoClick={mockOnResetDemoClick} />)
      ).toThrow(PropTypesTypeOf);
    });
  });

  describe('User Interactions', () => {
    const validProps = { children: validChildren, name: 'DemoName', t: mockT, onResetDemoClick: mockOnResetDemoClick };

    it('should not trigger error when no error occurs', async () => {
      render(<DemoErrorBoundary {...validProps} />);
      await waitFor(() => expect(mockT).not.toHaveBeenCalled());
    });

    it('should reset demo when reset button is clicked', async () => {
      const { getByText } = render(<DemoErrorBoundary {...validProps} />);
      const resetButton = getByText('Reset Demo');
      fireEvent.click(resetButton);
      await waitFor(() => expect(mockOnResetDemoClick).toHaveBeenCalledTimes(1));
    });
  });

  afterAll(() => {
    // Clean up mocks
    mockT.mockClear();
    mockOnResetDemoClick.mockClear();
  });
});