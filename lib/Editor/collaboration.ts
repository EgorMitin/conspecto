'use client';

import {Provider} from '@lexical/yjs';
import {WebsocketProvider} from 'y-websocket';
import {Doc} from 'yjs';

// Default values for server-side rendering
let WEBSOCKET_ENDPOINT = 'ws://localhost:1234';
const WEBSOCKET_SLUG = 'playground';
let WEBSOCKET_ID = '0';

// Only run this code in the browser
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  
  // Now safely access URL parameters
  WEBSOCKET_ENDPOINT = params.get('collabEndpoint') || 'ws://localhost:1234';
  WEBSOCKET_ID = params.get('collabId') || '0';
}

// parent dom -> child doc
export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Doc>,
): Provider {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  // @ts-expect-error
  return new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    WEBSOCKET_SLUG + '/' + WEBSOCKET_ID + '/' + id,
    doc,
    {
      connect: false,
    },
  );
}