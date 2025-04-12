import { render, screen } from '@testing-library/react';
import LicensingModelSwitch from './LicensingModelSwitch.test.tsx';
import { useLicensingModel } from 'src/components/pricing/LicensingModelContext';
import { createMockLicensingModel, createMockSetLicensingModel } from 'src/components/pricing/testUtils';

jest.mock('src/components/pricing/LicensingModelContext');

describe('LicensingModelSwitch', () => {
  const mockUseLicensingModel = useLicensingModel as jest.Mock;

  beforeEach(() => {
    mockUseLicensingModel.mockReset();
  });

  afterEach(() => {
    mockUseLicensingModel.mockClear();
  });

  it('renders without crashing', async () => {
    render(<LicensingModelSwitch />);
    expect(screen.getByRole('tab')).toBeInTheDocument();
  });

  describe('prop validation', () => {
    const invalidLicenses = 'invalid-license';

    it('should not accept invalid license type', async () => {
      render(<LicensingModelSwitch licensingModel={invalidLicenses} />);
      expect(mockUseLicensingModel).not.toHaveBeenCalledWith(invalidLicenses);
    });

    it('should pass valid licenses', async () => {
      const validLicense = 'perpetual';
      render(<LicensingModelSwitch licensingModel={validLicense} />);
      expect(mockUseLicensingModel).toHaveBeenCalledWith(validLicense);
    });
  });

  describe('conditional rendering', () => {
    const perpetualProps = { value: 'perpetual' };
    const annualProps = { value: 'annual' };

    it('should render perpetual tab', async () => {
      render(<LicensingModelSwitch licensingModel={perpetualProps.value} />);
      expect(screen.getByRole('tab')).toHaveAttribute('aria-label', 'Perpetual');
    });

    it('should render annual tab', async () => {
      render(<LicensingModelSwitch licensingModel={annualProps.value} />);
      expect(screen.getByRole('tab')).toHaveAttribute('aria-label', 'Annual');
    });
  });

  describe('user interactions', () => {
    const handleChangeMock = jest.fn();
    const mockSetLicensingModel = createMockSetLicensingModel();

    beforeEach(() => {
      mockUseLicensingModel.mockImplementation((license) => ({ license, setLicensingModel: mockSetLicensingModel }));
      render(<LicensingModelSwitch licensingModel="perpetual" onChange={handleChangeMock} />);
    });

    it('should call onchange when changing tab', async () => {
      const newTab = 'annual';
      const event = { target: { value: newTab } };
      handleChangeMock(event);
      expect(mockSetLicensingModel).toHaveBeenCalledTimes(1);
      expect(mockSetLicensingModel).toHaveBeenCalledWith(newTab);
    });
  });

  describe('side effects', () => {
    it('should update licensing model state when changing tab', async () => {
      const mockUseLicensingModel = useLicensingModel as jest.Mock;
      render(<LicensingModelSwitch licensingModel="perpetual" />);
      expect(mockUseLicensingModel).toHaveBeenCalledTimes(1);
      expect(mockUseLicensingModel).toHaveBeenCalledWith('perpetual');
    });
  });

  it('should match snapshot', async () => {
    const { container } = render(<LicensingModelSwitch />);
    expect(container).toMatchSnapshot();
  });
});