'use client';

let isDevPlaygroundValue = false;

if (typeof window !== 'undefined') {
  const hostName = window.location.hostname;
  isDevPlaygroundValue = 
    hostName !== 'playground.lexical.dev' &&
    hostName !== 'lexical-playground.vercel.app';
}

export const isDevPlayground: boolean = isDevPlaygroundValue;

export const DEFAULT_SETTINGS = {
  disableBeforeInput: false,
  emptyEditor: false,
  hasLinkAttributes: false,
  isAutocomplete: true,
  isCharLimit: false,
  isCharLimitUtf8: false,
  isCollab: false,
  isMaxLength: false,
  isRichText: true,
  listStrictIndent: false,
  measureTypingPerf: false,
  selectionAlwaysOnDisplay: false,
  shouldAllowHighlightingWithBrackets: false,
  shouldPreserveNewLinesInMarkdown: false,
  shouldUseLexicalContextMenu: true,
  showNestedEditorTreeView: false,
  showTableOfContents: false,
  showTreeView: false,
  tableCellBackgroundColor: true,
  tableCellMerge: true,
  tableHorizontalScroll: true,
} as const;

// These are mutated in setupEnv
export const INITIAL_SETTINGS: Record<SettingName, boolean> = {
  ...DEFAULT_SETTINGS,
};

export type SettingName = keyof typeof DEFAULT_SETTINGS;

export type Settings = typeof INITIAL_SETTINGS;
