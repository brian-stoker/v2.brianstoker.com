import { render, fireEvent, waitFor } from '@testing-library/react';
import IconImage from './IconImage.test.tsx';

describe('IconImage', () => {
  it('renders without crashing', () => {
    const { container } = render(<IconImage name="product-core" />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders light mode image when mode is light', async () => {
      const { getBySrc } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          mode="light"
          sx={{ color: 'red' }}
        />
      );
      await waitFor(() => expect(getBySrc('/static/branding/product-core-light.svg')).toBeInTheDocument());
    });

    it('renders dark mode image when mode is dark', async () => {
      const { getBySrc } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          mode="dark"
          sx={{ color: 'red' }}
        />
      );
      await waitFor(() => expect(getBySrc('/static/branding/product-core-dark.svg')).toBeInTheDocument());
    });

    it('renders default image when no light or dark mode available', async () => {
      const { getBySrc } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          sx={{ color: 'red' }}
        />
      );
      await waitFor(() => expect(getBySrc('/static/branding/product-core.svg')).toBeInTheDocument());
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when name is invalid', async () => {
      const { getByText } = render(
        <IconImage
          name="invalid"
          height={36}
          width={36}
          mode="light"
          sx={{ color: 'red' }}
        />
      );
      expect(getByText('Invalid prop: name')).toBeInTheDocument();
    });

    it('throws an error when invalid props are passed', async () => {
      const { getByText } = render(
        <IconImage
          name="product-core"
          height={36}
          width={100}
          mode="light"
          sx={{ color: 'red' }}
        />
      );
      expect(getByText('Invalid prop: width')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick handler when image is clicked', async () => {
      const { getBySrc, getByRole } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          mode="light"
          onClick={() => console.log('Icon clicked!')}
        />
      );
      const img = getBySrc('/static/branding/product-core-light.svg');
      fireEvent.click(img);
      expect(getByRole('button')).toHaveProperty('onClick', () => console.log('Icon clicked!'));
    });

    it('calls onInput handler when input value changes', async () => {
      const { getBySrc, getByValue } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          mode="light"
          onInput={(e) => console.log(e.target.value)}
        />
      );
      const img = getBySrc('/static/branding/product-core-light.svg');
      fireEvent.change(getByValue('height'), { target: { value: '100' } });
      expect(getByRole('button')).toHaveProperty('onInput', (e) => console.log(e.target.value));
    });

    it('calls onSubmit handler when form is submitted', async () => {
      const { getBySrc, getByRole } = render(
        <IconImage
          name="product-core"
          height={36}
          width={36}
          mode="light"
          onSubmit={() => console.log('Form submitted!')}
        />
      );
      const img = getBySrc('/static/branding/product-core-light.svg');
      fireEvent.change(img, { target: { value: '100' } });
      fireEvent.submit(getByRole('button'));
      expect(getByRole('button')).toHaveProperty('onSubmit', () => console.log('Form submitted!'));
    });
  });
});