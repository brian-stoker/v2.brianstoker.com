import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CoreHero from './CoreHero';

jest.mock('@mui/material/Stack', () => ({
  Stack: ({ children, ...props }) => (
    <div style={{ {...props, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' } }}>
      {children}
    </div>
  ),
}));

describe('CoreHero component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<CoreHero />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct typography props', async () => {
    const { getByText, getAllByRole } = render(<CoreHero />);
    expect(getByText('SUI Core')).toHaveStyle('font-size: 14px');
    expect(getByText('Ready to use components free forever')).toHaveStyle('color: #333333');
    expect(getAllByRole('heading', { level: 'h2' })).toHaveLength(1);
  });

  it('renders with correct icon image props', async () => {
    const { getByAltText, getAllByRole } = render(<CoreHero />);
    expect(getByAltText('product-core')).toHaveStyle('width: 28px; height: 28px');
    expect(getAllByRole('img', { alt: 'product-core' })).toHaveLength(1);
  });

  it('renders with correct section props', async () => {
    const { getByText, getAllByRole } = render(<CoreHero />);
    expect(getByText('Section')).toHaveStyle('border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)');
    expect(getAllByRole('section', { className: 'cozy' })).toHaveLength(1);
  });

  it('renders with correct gradient text props', async () => {
    const { getByText } = render(<CoreHero />);
    expect(getByText('free forever')).toHaveStyle('color: #333333; background-color: #fff;');
  });

  it('renders with description', async () => {
    const { getByText, getAllByRole } = render(<CoreHero />);
    expect(getByText('Get a growing list of React components and utilities')).toBeInTheDocument();
  });

  it('calls SectionHeadline props on render', async () => {
    jest.spyOn(CoreHero.prototype, 'SectionHeadline');
    const { container } = render(<CoreHero />);
    expect(CoreHero.prototype.SectionHeadline).toHaveBeenCalledTimes(1);
    expect(CoreHero.prototype.SectionHeadline).toHaveBeenCalledWith(expect.objectContaining({
      alwaysCenter: true,
      overline: expect.anything(),
      title: expect.anything(),
    }));
  });

  it('calls SectionHeadline props with correct type', async () => {
    jest.spyOn(CoreHero.prototype, 'SectionHeadline');
    const { container } = render(<CoreHero />);
    expect(CoreHero.prototype.SectionHeadline).toHaveBeenCalledTimes(1);
    expect(CoreHero.prototype.SectionHeadline).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.any(Typeography),
      description: expect.any(String),
    }));
  });

  it('calls Section props on render', async () => {
    jest.spyOn(CoreHero.prototype, 'Section');
    const { container } = render(<CoreHero />);
    expect(CoreHero.prototype.Section).toHaveBeenCalledTimes(1);
    expect(CoreHero.prototype.Section).toHaveBeenCalledWith(expect.objectContaining({
      noPaddingBottom: true,
    }));
  });

  it('renders with correct gradient text props when prop is passed', async () => {
    const { getByText } = render(<CoreHero >{<GradientText> Gradient Text </GradientText>} </CoreHero>);
    expect(getByText('Gradient Text')).toHaveStyle('color: #333333; background-color: #fff;');
  });

  it('renders without crashing when no props are passed', async () => {
    const { container } = render(<CoreHero />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct section props when no props are passed', async () => {
    const { getByText, getAllByRole } = render(<CoreHero />);
    expect(getByText('Section')).toHaveStyle('border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)');
    expect(getAllByRole('section', { className: 'cozy' })).toHaveLength(1);
  });
});