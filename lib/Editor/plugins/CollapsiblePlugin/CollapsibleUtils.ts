
export function setDomHiddenUntilFound(dom: HTMLElement): void {
  // @ts-expect-error: Setting until-found on hidden attribute is not in TypeScript definitions yet
  dom.hidden = 'until-found';
}

export function domOnBeforeMatch(dom: HTMLElement, callback: () => void): void {
  // @ts-expect-error: onbeforematch is experimental and not in TypeScript definitions yet
  dom.onbeforematch = callback;
}
