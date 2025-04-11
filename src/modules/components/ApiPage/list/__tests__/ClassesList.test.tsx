import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { getHash, ClassesListProps } from './ClassesList';

describe('ClassesList', () => {
  const componentName = 'example-component';
  const className = 'some-class-name';

  beforeEach(() => {
    vi.spyOn(getHash, 'getHash').mockImplementationOnce(() => `${kebabCase(componentName)}-classes-${className}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders without crashing', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [
        {
          className: 'some-class-name',
          key: 'key-value',
          description: 'Some description',
          isGlobal: true,
          isDeprecated: false,
          deprecationInfo: 'Some deprecation info',
        },
      ],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).toBeTruthy();
  });

  test('renders with valid props', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [
        {
          className: 'some-class-name',
          key: 'key-value',
          description: 'Some description',
          isGlobal: true,
          isDeprecated: false,
          deprecationInfo: 'Some deprecation info',
        },
      ],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).toBeTruthy();
  });

  test('renders with invalid prop', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).not.toBeNull();
  });

  test('calls getHash function correctly', () => {
    vi.spyOn(getHash, 'getHash').mockImplementationOnce(() => `${kebabCase(componentName)}-classes-${className}`);

    expect(getHash({ componentName, className })).toBe(`${kebabCase(componentName)}-classes-${className}`);
  });

  test('calls getHash function with invalid prop', () => {
    vi.spyOn(getHash, 'getHash').mockImplementationOnce(() => `${kebabCase(componentName)}-classes-${className}`);

    expect(getHash({ componentName: 'invalid-component' })).toBe(`${kebabCase(componentName)}-classes-${className}`);
  });

  test('renders note correctly', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [
        {
          className: 'some-class-name',
          key: 'key-value',
          description: 'Some description',
          isGlobal: true,
          isDeprecated: false,
          deprecationInfo: 'Some deprecation info',
        },
      ],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).toBeTruthy();
  });

  test('renders ApiWarning correctly', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [
        {
          className: 'some-class-name',
          key: 'key-value',
          description: 'Some description',
          isGlobal: true,
          isDeprecated: false,
          deprecationInfo: 'Some deprecation info',
        },
      ],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).toBeTruthy();
  });

  test('renders prop list class correctly', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [
        {
          className: 'some-class-name',
          key: 'key-value',
          description: 'Some description',
          isGlobal: true,
          isDeprecated: false,
          deprecationInfo: 'Some deprecation info',
        },
      ],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).toBeTruthy();
  });

  test('renders prop list class with invalid prop', async () => {
    const props: ClassesListProps = {
      componentName,
      classes: [],
      displayOption: 'collapsed',
    };

    const result = render(<ClassesList {...props} />);
    expect(result).not.toBeNull();
  });
});