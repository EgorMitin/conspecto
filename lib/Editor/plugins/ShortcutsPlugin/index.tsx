'use client';

export type KeyboardEventModifiers = Pick<
  KeyboardEvent,
  'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'
>;

/**
 * A record of keyboard modifiers that must be enabled.
 * If the value is `'any'` then the modifier key's state is ignored.
 * If the value is `true` then the modifier key must be pressed.
 * If the value is `false` or the property is omitted then the modifier key must
 * not be pressed.
 */
export type KeyboardEventModifierMask = {
  [K in Exclude<keyof KeyboardEventModifiers, 'key'>]?:
    | boolean
    | undefined
    | 'any';
};

function matchModifier(
  event: KeyboardEventModifiers,
  mask: KeyboardEventModifierMask,
  prop: keyof KeyboardEventModifierMask,
): boolean {
  const expected = mask[prop] || false;
  return expected === 'any' || expected === event[prop];
}

/**
 * Match a KeyboardEvent with its expected modifier state
 *
 * @param event A KeyboardEvent, or structurally similar object
 * @param mask An object specifying the expected state of the modifiers
 * @returns true if the event matches
 */
export function isModifierMatch(
  event: KeyboardEventModifiers,
  mask: KeyboardEventModifierMask,
): boolean {
  return (
    matchModifier(event, mask, 'altKey') &&
    matchModifier(event, mask, 'ctrlKey') &&
    matchModifier(event, mask, 'shiftKey') &&
    matchModifier(event, mask, 'metaKey')
  );
}

import {TOGGLE_LINK_COMMAND} from '@lexical/link';
import {HeadingTagType} from '@lexical/rich-text';
import {
  COMMAND_PRIORITY_NORMAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import {Dispatch, useEffect} from 'react';

import {useToolbarState} from '../../context/ToolbarContext';
import {sanitizeUrl} from '../../utils/url';
import {INSERT_INLINE_COMMAND} from '../CommentPlugin';
import {
  clearFormatting,
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
  updateFontSize,
  UpdateFontSizeType,
} from '../ToolbarPlugin/utils';
import {
  isAddComment,
  isCapitalize,
  isCenterAlign,
  isClearFormatting,
  isDecreaseFontSize,
  isFormatBulletList,
  isFormatCheckList,
  isFormatCode,
  isFormatHeading,
  isFormatNumberedList,
  isFormatParagraph,
  isFormatQuote,
  isIncreaseFontSize,
  isIndent,
  isInsertCodeBlock,
  isInsertLink,
  isJustifyAlign,
  isLeftAlign,
  isLowercase,
  isOutdent,
  isRightAlign,
  isStrikeThrough,
  isSubscript,
  isSuperscript,
  isUppercase,
} from './shortcuts';

export default function ShortcutsPlugin({
  editor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  setIsLinkEditMode: Dispatch<boolean>;
}): null {
  const {toolbarState} = useToolbarState();

  useEffect(() => {
    const keyboardShortcutsHandler = (event: KeyboardEvent) => {
      // Short-circuit, a least one modifier must be set
      if (isModifierMatch(event, {})) {
        return false;
      } else if (isFormatParagraph(event)) {
        formatParagraph(editor);
      } else if (isFormatHeading(event)) {
        const {code} = event;
        const headingSize = `h${code[code.length - 1]}` as HeadingTagType;
        formatHeading(editor, toolbarState.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        formatBulletList(editor, toolbarState.blockType);
      } else if (isFormatNumberedList(event)) {
        formatNumberedList(editor, toolbarState.blockType);
      } else if (isFormatCheckList(event)) {
        formatCheckList(editor, toolbarState.blockType);
      } else if (isFormatCode(event)) {
        formatCode(editor, toolbarState.blockType);
      } else if (isFormatQuote(event)) {
        formatQuote(editor, toolbarState.blockType);
      } else if (isStrikeThrough(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      } else if (isLowercase(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase');
      } else if (isUppercase(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase');
      } else if (isCapitalize(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize');
      } else if (isIndent(event)) {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      } else if (isOutdent(event)) {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      } else if (isCenterAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      } else if (isLeftAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      } else if (isRightAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      } else if (isJustifyAlign(event)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      } else if (isSubscript(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      } else if (isSuperscript(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      } else if (isInsertCodeBlock(event)) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      } else if (isIncreaseFontSize(event)) {
        updateFontSize(
          editor,
          UpdateFontSizeType.increment,
          toolbarState.fontSizeInputValue,
        );
      } else if (isDecreaseFontSize(event)) {
        updateFontSize(
          editor,
          UpdateFontSizeType.decrement,
          toolbarState.fontSizeInputValue,
        );
      } else if (isClearFormatting(event)) {
        clearFormatting(editor);
      } else if (isInsertLink(event)) {
        const url = toolbarState.isLink ? null : sanitizeUrl('https://');
        setIsLinkEditMode(!toolbarState.isLink);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      } else if (isAddComment(event)) {
        editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
      } else {
        // No match for any of the event handlers
        return false;
      }
      event.preventDefault();
      return true;
    };

    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      keyboardShortcutsHandler,
      COMMAND_PRIORITY_NORMAL,
    );
  }, [
    editor,
    toolbarState.isLink,
    toolbarState.blockType,
    toolbarState.fontSizeInputValue,
    setIsLinkEditMode,
  ]);

  return null;
}
