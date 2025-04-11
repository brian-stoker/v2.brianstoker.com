Here is an example of how you could write unit tests for this component using Jest and React Testing Library:
```
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store'; // assuming you have a Redux store set up
import Component from './Component';

describe('Component', () => {
  const setup = (props = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Component {...props} />
        </MemoryRouter>
      </Provider>,
      document.getElementById('root')
    );
  };

  it('renders correctly', () => {
    const { getByText } = setup();
    expect(getByText('Title')).toBeInTheDocument();
  });

  it('has correct styles', () => {
    const { getByClass } = setup();
    expect(getByClass('header-style')).toHaveStyle({ color: '#333' });
  });

  it('calls event handlers correctly', () => {
    const onClickHandler = jest.fn();
    const props = { onClickHandler };
    setup(props);
    const buttonElement = getByText('Button Text');
    fireEvent.click(buttonElement);
    expect(onClickHandler).toHaveBeenCalledTimes(1);
  });

  it('renders all sections', () => {
    const { getAllByRole } = setup();
    const sections = getAllByRole('region');
    expect(sections.length).toBeGreaterThan(0); // assuming you have at least one section
  });
});
```
Note that this is just an example and you may need to modify it to fit your specific use case. Additionally, you will likely want to write more tests to cover different scenarios.

Also, make sure to import the `Component` and adjust the path according to your project structure.

You can also test the component's functionality by mocking some of its dependencies or using a library like `react-testing-library-mock-act` to simulate user interactions.

For example:
```
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

describe('Component', () => {
  it('calls API when button is clicked', async () => {
    const apiMock = jest.fn();
    const props = { apiMock };
    await act(async () => {
      render(<Component {...props} />);
      fireEvent.click(getByText('Button Text'));
      await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1));
    });
  });
});
```
This is just a basic example, and you should adjust it according to your component's behavior.

You can also use a library like `react-testing-library` which provides more advanced features for testing React components.