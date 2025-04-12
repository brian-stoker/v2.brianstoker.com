import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { configureBabelPluginTestEnvironment } from 'jest-configure-babel-plugin-test-environment';
import { BabelPluginTestEnvironmentProvider } from 'babel-plugin-macros/lib/test-utils';

describe('configurer', () => {
  const mockErrorCodesPath = '/mock/error-codes.json';

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and renders the expected error codes', async () => {
    configureBabelPluginTestEnvironment();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <p>Mock Component</p>
      </BabelPluginTestEnvironmentProvider>,
    );

    expect(await fse.readJSONAsync(mockErrorCodesPath)).not.toBeNull();
  });

  it('renders conditional rendering paths', async () => {
    configureBabelPluginTestEnvironment();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <div>
          <p>Mock Component</p>
          <h1>Heading 1</h1>
          <p>Conditional rendering path 1</p>
          {false && <p>Conditional rendering path 2</p>}
          {true && <p>Conditional rendering path 3</p>}
        </div>
      </BabelPluginTestEnvironmentProvider>,
    );

    expect(document.querySelector('p')).not.toBeNull();
    expect(document.querySelector('#heading-1')).not.toBeNull();
    expect(document.querySelector('p:contains("Conditional rendering path 2")')).toBeNull();
    expect(document.querySelector('p:contains("Conditional rendering path 3")')).not.toBeNull();
  });

  it('prop validation', async () => {
    configureBabelPluginTestEnvironment();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent prop1="value1" prop2={undefined} />
      </BabelPluginTestEnvironmentProvider>,
    );

    expect(document.querySelector('p')).not.toBeNull();
    expect(document.querySelector('p:contains("prop2 is required")')).not.toBeNull();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent prop1="value1" prop2={null} />
      </BabelPluginTestEnvironmentProvider>,
    );

    expect(document.querySelector('p')).not.toBeNull();
    expect(document.querySelector('p:contains("prop2 is required")')).toBeNull();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent prop1="value1" />
      </BabelPluginTestEnvironmentProvider>,
    );

    expect(document.querySelector('p')).not.toBeNull();
    expect(document.querySelector('p:contains("prop2 is required")')).toBeNull();
  });

  it('handles user interactions', async () => {
    configureBabelPluginTestEnvironment();

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent />
        <button onClick={() => console.log('Button clicked')}>Click me</button>
      </BabelPluginTestEnvironmentProvider>,
    );

    await fireEvent.click(document.querySelector('button'));

    expect(console).toHaveBeenCalledWith('Button clicked');

    await render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent />
        <input type="text" onChange={(e) => console.log(e.target.value)} />
      </BabelPluginTestEnvironmentProvider>,
    );

    await fireEvent.change(document.querySelector('input'));

    expect(console).toHaveBeenCalledWith(document.querySelector('input').value);
  });

  it('should be able to take a snapshot', async () => {
    configureBabelPluginTestEnvironment();

    const { getByText } = render(
      <BabelPluginTestEnvironmentProvider
        value={{
          muiError: {
            errorCodesPath,
          },
        }}
      >
        <MockComponent />
      </BabelPluginTestEnvironmentProvider>,
    );

    await waitFor(() => expect(getByText('Mock Component')).not.toBeNull());

    expect(getByText('Mock Component')).toMatchSnapshot();
  });
});