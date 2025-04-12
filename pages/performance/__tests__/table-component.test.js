import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableComponent from './table-component';
import '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

const createMockComponent = (component) => {
  const MockComponent = () => <div>Mock Component</div>;
  MockComponent.propTypes = {
    component: PropTypes.elementType,
  };
  return React.forwardRef(function MyComponent(props, ref) {
    const { component: Component = defaultComponent, ...other } = props;

    return <Component ref={ref} {...other} />;
  });
};

const Table = createMockComponent('table');
const TableHead = createMockComponent('thead');
const TableRow = createMockComponent('tr');
const TableCell = createMockComponent('td');
const TableBody = createMockComponent('tbody');

const data = { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 };
const rows = Array.from(new Array(100)).map(() => data);

describe('TableComponent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    global.clearMocks;
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <ThemeProvider>
        <TableComponent />
      </ThemeProvider>,
    );
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('valid component prop', () => {
      expect(TableComponent({ component: Table })).toBeInstanceOf(React.Component);
    });

    it('invalid component prop throws error', async () => {
      const { error } = render(
        <ThemeProvider>
          <TableComponent component="div" />
        </ThemeProvider>,
      );
      expect(error).not.toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('renders TableHead when passed as prop', async () => {
      const { container } = render(
        <ThemeProvider>
          <TableComponent component={TableHead} />
        </ThemeProvider>,
      );
      expect(container).toBeInTheDocument();
    });

    it('does not render TableHead when not passed as prop', async () => {
      const { queryByText } = render(<ThemeProvider><TableComponent /></ThemeProvider>);
      expect(queryByText('Mock Component')).not.toBeInTheDocument();
    });
  });

  describe('rows prop', () => {
    it('renders rows when passed as prop', async () => {
      const { container } = render(
        <ThemeProvider>
          <TableComponent rows={rows} />
        </ThemeProvider>,
      );
      expect(container).toBeInTheDocument();
    });

    it('does not render rows when not passed as prop', async () => {
      const { queryByText } = render(<ThemeProvider><TableComponent /></ThemeProvider>);
      expect(queryByText('Frozen yoghurt')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onClick event handler on table row', async () => {
      const onClickHandler = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <TableComponent rows={rows} onClick={onClickHandler} />
        </ThemeProvider>,
      );
      expect(getByText('Frozen yoghurt')).toBeInTheDocument();

      fireEvent.click(getByText('Frozen yoghurt'));
      expect(onClickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls onChange event handler on table row', async () => {
      const onChangeHandler = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <TableComponent rows={rows} onChange={onChangeHandler} />
        </ThemeProvider>,
      );
      expect(getByText('Frozen yoghurt')).toBeInTheDocument();

      fireEvent.change(getByText('Frozen yoghurt'), { target: { value: 'New Yoghurt' } });
      expect(onChangeHandler).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit event handler on form submission', async () => {
      const onSubmitHandler = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider>
          <form>
            <TableComponent rows={rows} onSubmit={onSubmitHandler} />
          </form>
        </ThemeProvider>,
      );
      expect(getByText('Frozen yoghurt')).toBeInTheDocument();

      fireEvent.change(getByRole('textbox'), { target: { value: 'New Yoghurt' } });
      fireEvent.submit(getByRole('form'));
      expect(onSubmitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot tests', () => {
    it('renders as expected', async () => {
      const { container } = render(<ThemeProvider><TableComponent /></ThemeProvider>);
      await waitFor(() => expect(container).toMatchSnapshot());
    });
  });
});