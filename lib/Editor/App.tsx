'use client';

import type {JSX} from 'react';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {
  SerializedEditorState,
  SerializedLexicalNode,
  $isTextNode,
  DOMConversionMap,
  TextNode,
} from 'lexical';

import {SettingsContext} from './context/SettingsContext';
import {SharedHistoryContext} from './context/SharedHistoryContext';
import {ToolbarContext} from './context/ToolbarContext';
import Editor from './Editor';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import {TableContext} from './plugins/TablePlugin';
import {parseAllowedFontSize} from './plugins/ToolbarPlugin/fontSize';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import {parseAllowedColor} from './ui/ColorPicker';

import './index.css';

function getExtraStyles(element: HTMLElement): string {
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
}

function buildImportMap(): DOMConversionMap {
  const importMap: DOMConversionMap = {};

  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const {forChild} = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
}

function App({
  save,
  initialContent = ''
}:{
  save?: (content: SerializedEditorState<SerializedLexicalNode>) => Promise<{success: boolean; id?: string; message?: string}>,
  initialContent?: string }): JSX.Element {

  const initialConfig = {
    editorState: initialContent || null,
    html: {import: buildImportMap()},
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <ToolbarContext>
            <div className="editor-shell shadow-md">
              <Editor save={save} />
            </div>
          </ToolbarContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export default function EditorApp({
  save,
  content = '',
}:{
  save?: (content: SerializedEditorState<SerializedLexicalNode>) => Promise<{success: boolean; id?: string; message?: string}>,
  content?: string,
}): JSX.Element {

  return (
    <SettingsContext>
      <App save={save} initialContent={content} />
    </SettingsContext>
  );
}
