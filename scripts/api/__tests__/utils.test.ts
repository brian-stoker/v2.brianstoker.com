import { Annotation } from 'doctrine';
import kebabCase from 'lodash/kebabCase';
import * as prettier from 'prettier';
import * as fse from 'fs-extra';
import * as ts from 'typescript';
import { XTypeScriptProject, XProjectNames } from '../createXTypeScriptProjects';

describe('formatType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should format a valid type with correct prettier settings', async () => {
    const rawType = 'type FakeType = ';
    const formattedType = await formatType(rawType);
    expect(formattedType).toBe('type FakeType =');
  });

  it('should handle an empty string input', async () => {
    const rawType = '';
    const formattedType = await formatType(rawType);
    expect(formattedType).toBe('');
  });

  it('should handle a type with a prettier configuration error', async () => {
    jest.spyOn(prettier, 'format').mockImplementationOnce(() => {
      throw new Error('Prettier config error');
    });
    const rawType = 'type FakeType = ';
    expect.assertions(1);
    try {
      await formatType(rawType);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('stringifySymbol', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should stringify a property signature with correct prettier settings', async () => {
    const symbol = ts.createPropertySignature(
      ts.createTypeReferenceNode(ts.StringLiteral, [ts.TypeReferenceNode.tsNumber]),
    );
    const project = { checker: ts.getPreferedProjectChecker() };
    const formattedType = await stringifySymbol(symbol, project);
    expect(formattedType).toBe('type FakeType = number');
  });

  it('should stringify a type alias with correct prettier settings', async () => {
    const symbol = ts.createTypeAlias(
      ts.TypeReferenceNode.tsNumber,
      ts.CreateTypeAliasKind.typeAlias,
      ts.createTypeLiteral(ts.StringLiteral, [ts.TypeReferenceNode.tsString]),
    );
    const project = { checker: ts.getPreferedProjectChecker() };
    const formattedType = await stringifySymbol(symbol, project);
    expect(formattedType).toBe('type FakeType = string | number');
  });

  it('should handle an undefined declaration', async () => {
    const symbol = ts.createPropertySignature(
      ts.createTypeReferenceNode(ts.StringLiteral, []),
    );
    const project = { checker: ts.getPreferedProjectChecker() };
    expect.assertions(1);
    try {
      await stringifySymbol(symbol, project);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('linkify', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should link a valid markdown reference', async () => {
    const text = '[[]](http://example.com)';
    const documentedInterfaces: DocumentedInterfaces = new Map();
    const formattedText = await linkify(text, documentedInterfaces);
    expect(formattedText).toBe('[[]](http://example.com)');
  });

  it('should not link an invalid markdown reference', async () => {
    const text = '[Invalid Reference]';
    const documentedInterfaces: DocumentedInterfaces = new Map();
    const formattedText = await linkify(text, documentedInterfaces);
    expect(formattedText).toBe('[Invalid Reference]');
  });
});

describe('writePrettifiedFile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should write a prettified file with correct prettier settings', async () => {
    const filename = 'test.ts';
    const data = `type FakeType = number`;
    const project = { prettierConfigPath: 'path/to/config' };
    await writePrettifiedFile(filename, data, project);
    expect(fse.readFileSync(filename)).toBe('type FakeType =\nnumber\n');
  });

  it('should handle a prettier configuration error', async () => {
    jest.spyOn(prettier, 'format').mockImplementationOnce(() => {
      throw new Error('Prettier config error');
    });
    const filename = 'test.ts';
    const data = `type FakeType = number`;
    const project = { prettierConfigPath: 'path/to/config' };
    expect.assertions(1);
    try {
      await writePrettifiedFile(filename, data, project);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('resolveExportSpecifier', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should resolve an export specifier to its corresponding symbol', async () => {
    const symbol = ts.createExportSpecifier(
      ts.createIdentifier('x'),
      ts.createTypeReferenceNode(ts.StringLiteral, []),
    );
    const project = { checker: ts.getPreferedProjectChecker() };
    const resolvedSymbol = await resolveExportSpecifier(symbol, project);
    expect(resolvedSymbol).toBe(symbol);
  });

  it('should throw an error when the export specifier cannot be resolved', async () => {
    jest.spyOn(project.checker, 'getImmediateAliasedSymbol').mockImplementationOnce(() => null);
    const symbol = ts.createExportSpecifier(
      ts.createIdentifier('x'),
      ts.createTypeReferenceNode(ts.StringLiteral, []),
    );
    const project = { checker: ts.getPreferedProjectChecker() };
    expect.assertions(1);
    try {
      await resolveExportSpecifier(symbol, project);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});