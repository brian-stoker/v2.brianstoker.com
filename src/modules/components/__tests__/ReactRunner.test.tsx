import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react-hooks';
import { useRunner } from 'react-runner';
import { ReactRunnerProps } from './ReactRunner';

describe('ReactRunner component', () => {
  const mockOnError = jest.fn();
  const scopeProp = {
    process: {},
    import: {},
  };
  const code = `
    function foo() {}
  `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should render with process proxy when in development mode', () => {
      jest.spyOn(process, 'env').mockValue('NODE_ENV', 'development');
      const { container } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      expect(container).toBeTruthy();
    });

    it('should not render with process proxy when in production mode', () => {
      jest.spyOn(process, 'env').mockValue('NODE_ENV', 'production');
      const { container } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      expect(container).toBeFalsy();
    });
  });

  describe('prop validation', () => {
    it('should validate code prop as string', () => {
      const props: ReactRunnerProps = { code: undefined, scope: scopeProp, onError: mockOnError };
      render(<ReactRunner {...props} />);
      expect(props.code).toBeUndefined();
    });

    it('should validate scope prop as object', () => {
      const props: ReactRunnerProps = { code: code, scope: undefined, onError: mockOnError };
      render(<ReactRunner {...props} />);
      expect(props.scope).toEqual(scopeProp);
    });
  });

  describe('user interactions', () => {
    it('should call onError prop with error when component fails to run', async () => {
      jest.spyOn(useRunner, 'useRunner').mockImplementationOnce(() => ({ error: 'Test Error' }));
      const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      await act(async () => {
        fireEvent.click(getByText('Run'));
      });
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    it('should update scope prop when scope changes', async () => {
      const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      await act(async () => {
        fireEvent.change(getByText('Process'), 'new process value');
      });
      expect(useRunner.useRunner).toHaveBeenCalledTimes(1);
    });

    it('should update scope prop when import changes', async () => {
      const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      await act(async () => {
        fireEvent.change(getByText('Import'), 'new import value');
      });
      expect(useRunner.useRunner).toHaveBeenCalledTimes(1);
    });

    it('should call onError prop with null when component fails to run', async () => {
      jest.spyOn(useRunner, 'useRunner').mockImplementationOnce(() => ({ error: null }));
      const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
      await act(async () => {
        fireEvent.click(getByText('Run'));
      });
      expect(mockOnError).toHaveBeenCalledTimes(1);
    });
  });

  it('should update state with error when component fails to run', async () => {
    jest.spyOn(useRunner, 'useRunner').mockImplementationOnce(() => ({ error: 'Test Error' }));
    const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
    await act(async () => {
      fireEvent.click(getByText('Run'));
    });
    expect(useRunner.useRunner).toHaveBeenCalledTimes(1);
  });

  it('should update state with no error when component succeeds', async () => {
    jest.spyOn(useRunner, 'useRunner').mockImplementationOnce(() => ({ element: <div>Test Element</div>, error: null }));
    const { getByText } = render(<ReactRunner code={code} scope={scopeProp} onError={mockOnError} />);
    await act(async () => {
      fireEvent.click(getByText('Run'));
    });
    expect(useRunner.useRunner).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when code is invalid', async () => {
    jest.spyOn(useRunner, 'useRunner').mockImplementationOnce(() => ({ error: 'Test Error' }));
    const { getByText } = render(<ReactRunner code={undefined} scope={scopeProp} onError={mockOnError} />);
    expect(() => render(<ReactRunner code={undefined} scope={scopeProp} onError={mockOnError} />)).toThrow();
  });
});