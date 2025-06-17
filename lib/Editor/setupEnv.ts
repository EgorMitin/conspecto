import {INITIAL_SETTINGS, Settings} from './appSettings';

// Export a function so this is not tree-shaken,
// but evaluate it immediately so it executes before
// lexical computes CAN_USE_BEFORE_INPUT
export default (() => {
  // override default options with query parameters if any
  const urlSearchParams = new URLSearchParams(window.location.search);

  for (const param of Object.keys(INITIAL_SETTINGS)) {
    if (urlSearchParams.has(param)) {
      try {
        const value = JSON.parse(urlSearchParams.get(param) ?? 'true');
        INITIAL_SETTINGS[param as keyof Settings] = Boolean(value);
      } catch {
        console.warn(`Unable to parse query parameter "${param}"`);
      }
    }
  }

  if (INITIAL_SETTINGS.disableBeforeInput) {
    // @ts-expect-error Ignoring TypeScript error: Setting a non-standard global property EXCALIDRAW_ASSET_PATH on window for Excalidraw asset configuration.
    delete window.InputEvent.prototype.getTargetRanges;
  }

  // @ts-expect-error EXCALIDRAW_ASSET_PATH is not a standard property defined on the Window interfac
  window.EXCALIDRAW_ASSET_PATH = process.env.EXCALIDRAW_ASSET_PATH;

  return INITIAL_SETTINGS;
})();
