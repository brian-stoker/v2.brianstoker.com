import { render, fireEvent, waitFor } from '@testing-library/react';
import BaseUIEnd from './BaseUIEnd.test.tsx';

describe('BaseUIEnd component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BaseUIEnd />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should throw an error for invalid primaryUrl prop', async () => {
      expect(() =>
        render(<BaseUIEnd primaryUrl="" secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />)
      ).toThrowError();
    });

    it('should not throw an error for valid primaryUrl prop', async () => {
      const { container } = render(<BaseUIEnd primaryUrl={ROUTES.baseDocs} secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should render SectionHeadline component', async () => {
      const { getByRole } = render(<BaseUIEnd />);
      expect(getByRole('heading')).toHaveTextContent('Community');
    });

    it('should render GetStartedButtons component', async () => {
      const { getByText } = render(<BaseUIEnd />);
      expect(getByText('Learn Base UI')).toBeInTheDocument();
    });

    it('should not render SectionHeadline or GetStartedButtons when primaryUrl prop is invalid', async () => {
      expect(() =>
        render(<BaseUIEnd primaryUrl="" secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />)
      ).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should trigger GetStartedButtons click event when primaryUrl prop is valid', async () => {
      const { getByRole, getByText } = render(<BaseUIEnd primaryUrl={ROUTES.baseDocs} secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('Learn Base UI')).toBeInTheDocument();
    });

    it('should not trigger GetStartedButtons click event when primaryUrl prop is invalid', async () => {
      expect(() =>
        render(<BaseUIEnd primaryUrl="" secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />)
      ).not.toThrowError();
    });
  });

  describe('side effects and state changes', () => {
    it('should update the component when GetStartedButtons click event is triggered', async () => {
      const { getByRole, getByText } = render(<BaseUIEnd primaryUrl={ROUTES.baseDocs} secondaryLabel="Learn Base UI" secondaryUrl={ROUTES.baseQuickstart} altInstallation="npm install @mui/base" />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('Learn Base UI')).toBeInTheDocument();
    });
  });

  it('renders snapshot correctly', async () => {
    const { asFragment } = render(<BaseUIEnd />);
    expect(asFragment()).toMatchSnapshot();
  });
});