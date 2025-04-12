import { render, fireEvent, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/user-event';
import CompaniesGrid from './References';

describe('References component', () => {
  const companies = CORE_CUSTOMERS;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    render(<CompaniesGrid companies={companies} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders CompaniesGrid with valid data', async () => {
      render(<CompaniesGrid companies={companies} />);
      expect(screen.getByRole('griditem')).toBeInTheDocument();
    });

    it('does not render CompaniesGrid with invalid data', async () => {
      const invalidCompanies = 'invalid-data';
      render(<CompaniesGrid companies={invalidCompanies} />);
      expect(screen.queryByRole('griditem')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid company type prop', async () => {
      render(<CompaniesGrid companies={companies} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('rejects invalid company type prop', async () => {
      const invalidCompanyType = 'invalid-type';
      expect(() => render(<CompaniesGrid companies={{ type: invalidCompanyType }} />)).toThrowError(
        'Invalid company type',
      );
    });
  });

  describe('user interactions', () => {
    it('calls CompaniesGrid data prop on click', async () => {
      const onClickMock = jest.fn();
      render(<CompaniesGrid companies={companies} onClick={onClickMock} />);
      fireEvent.click(screen.getByRole('griditem'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('updates CompaniesGrid data prop on input change', async () => {
      const onChangeMock = jest.fn();
      render(<CompaniesGrid companies={companies} onChange={onChangeMock} />);
      const inputField = screen.getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new-value' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('submits form on submit', async () => {
      const onSubmitMock = jest.fn();
      render(<CompaniesGrid companies={companies} onSubmit={onSubmitMock} />);
      fireEvent.submit(screen.getByRole('form'));
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls CompaniesGrid data prop on data change', async () => {
      const onChangeMock = jest.fn();
      render(<CompaniesGrid companies={companies} onChange={onChangeMock} />);
      screen.getByRole('griditem').textContent = 'new-data';
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });
  });

  it('renders typography text', async () => {
    render(<CompaniesGrid companies={companies} />);
    const typographyText = screen.getByText(/industry leaders trust/);
    expect(typographyText).toBeInTheDocument();
  });
});