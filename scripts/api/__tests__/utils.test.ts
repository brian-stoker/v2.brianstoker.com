import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { getSymbolDescription, getSymbolJSDocTags, formatType, stringifySymbol, linkify, writePrettifiedFile, resolveExportSpecifier } from './utils';

describe('utils', () => {
  describe('getSymbolDescription', () => {
    it('should return the symbol description', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      const description = getSymbolDescription(symbol, project);
      expect(description).toBe('string');
    });

    it('should return an empty string for a TODO comment', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      const description = getSymbolDescription(symbol, project) && !symbol.getDocumentationComment(project.checker).find(comment => comment.text.startsWith('TODO'));
      expect(description).toBe('');
    });

    it('should return an empty string for a symbol without documentation', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      symbol.getDocumentationComment(project.checker).forEach(comment => comment.text = '');
      const description = getSymbolDescription(symbol, project);
      expect(description).toBe('');
    });
  });

  describe('getSymbolJSDocTags', () => {
    it('should return the JSDoc tags for a symbol', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      const tags = getSymbolJSDocTags(symbol);
      expect(tags).toEqual({ name: 'tag1', description: 'value1' });
    });

    it('should return an empty object for a symbol without JSDoc tags', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      symbol.getJsDocTags().forEach(tag => tag.name = '');
      const tags = getSymbolJSDocTags(symbol);
      expect(tags).toEqual({});
    });
  });

  describe('getJsdocDefaultValue', () => {
    it('should return the default JSDoc value for a tag', async () => {
      const project = new XTypeScriptProject();
      const jsdoc = Annotation.createTag('default', 'value');
      const defaultValue = getJsdocDefaultValue(jsdoc);
      expect(defaultValue).toBe('value');
    });

    it('should return undefined if the default JSDoc value is not set', async () => {
      const project = new XTypeScriptProject();
      const jsdoc = Annotation.createTag('tag1', '');
      const defaultValue = getJsdocDefaultValue(jsdoc);
      expect(defaultValue).toBeUndefined();
    });
  });

  describe('formatType', () => {
    it('should return the formatted type string', async () => {
      const project = new XTypeScriptProject();
      const type = formatType(ts.TypeReference.CreateTypeLiteral, { typeElement: 'string' });
      expect(type).toBe('string');
    });

    it('should return an empty string for a symbol without a type element', async () => {
      const project = new XTypeScriptProject();
      const type = formatType(ts.TypeReference.CreateTypeLiteral);
      expect(type).toBe('');
    });
  });

  describe('stringifySymbol', () => {
    it('should return the formatted symbol string', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateTypeLiteral, typeElement: 'string' });
      const stringifiedSymbol = stringifySymbol(symbol, project);
      expect(stringifiedSymbol).toBe('string');
    });

    it('should return an empty string for a symbol without a type element', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, {});
      const stringifiedSymbol = stringifySymbol(symbol, project);
      expect(stringifiedSymbol).toBe('');
    });
  });

  describe('linkify', () => {
    it('should return the linkified text for a markdown format', async () => {
      const project = new XTypeScriptProject();
      const text = 'Hello World';
      const linkifiedText = linkify(text, { format: 'markdown' });
      expect(linkifiedText).toBe('[Hello World](https://example.com)');
    });

    it('should return the linkified text for an HTML format', async () => {
      const project = new XTypeScriptProject();
      const text = 'Hello World';
      const linkifiedText = linkify(text, { format: 'html' });
      expect(linkifiedText).toBe('<a href="https://example.com">Hello World</a>');
    });
  });

  describe('writePrettifiedFile', () => {
    it('should write the prettified file to disk', async () => {
      const project = new XTypeScriptProject();
      const filename = 'example.ts';
      const data = 'export function example() { }';
      await writePrettifiedFile(filename, data, project);
      expect(await fse.readFileSync(filename)).toBe('export function example() {\n  }\n');
    });

    it('should throw an error if the prettier config path is not found', async () => {
      const project = new XTypeScriptProject();
      const filename = 'example.ts';
      const data = 'export function example() { }';
      await expect(writePrettifiedFile(filename, data, project)).rejects.toThrow(
        `Could not resolve config for '${filename}' using prettier config path '${project.prettierConfigPath}'.`,
      );
    });
  });

  describe('resolveExportSpecifier', () => {
    it('should return the resolved export specifier symbol', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateExportSpecifier, module: true, variableName: 'example' });
      const resolvedSymbol = resolveExportSpecifier(symbol, project);
      expect(resolvedSymbol).toBe(symbol);
    });

    it('should return the first aliased export specifier symbol', async () => {
      const project = new XTypeScriptProject();
      const symbol1 = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateExportSpecifier, module: true, variableName: 'example' });
      const symbol2 = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateAliasedSymbol, name: 'example', alias: 'aliasedExample' });
      const resolvedSymbol = resolveExportSpecifier(symbol1, project);
      expect(resolvedSymbol).toBe(symbol2);
    });

    it('should throw an error if the export specifier cannot be resolved', async () => {
      const project = new XTypeScriptProject();
      const symbol = ts.Symbol.createTypeAnnotation(ts.TypeReference, { type: ts.TypeReference.CreateExportSpecifier, module: true, variableName: 'example' });
      await expect(resolveExportSpecifier(symbol, project)).rejects.toThrow('Impossible to resolve export specifier');
    });
  });
});