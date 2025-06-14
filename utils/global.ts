import { Price } from '@/types/Subscription';
import { format, isToday, isTomorrow, isBefore, startOfToday } from "date-fns";
import { type ClassValue, clsx } from 'clsx';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function postData({ url, data, }: {
  url: string;
  data?: Record<string, unknown>;
}): Promise<{ [key: string]: any; }> {
  console.log('posting,', url, data);
  const res: Response = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    console.log('Error in postData', { url, data, res });
    throw Error(res.statusText);
  }
  return res.json();
};


export function formatPrice(price: Price) {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || undefined,
    minimumFractionDigits: 0,
  }).format((price?.unitAmount || 0) / 100);
  return priceString;
};

export function extractPlainTextFromState(editorState: SerializedEditorState<SerializedLexicalNode>): string {
  let plainText = '';

  // Traverse root and its children recursively
  function extractTextFromNode(node: SerializedLexicalNode): void {
    if (node.type === 'text') {
      plainText += (node as unknown as { text: string }).text;
    }

    if ('children' in node && Array.isArray((node as any).children)) {
      (node as any).children.forEach(extractTextFromNode);
    }
  }

  if (editorState && editorState.root) {
    extractTextFromNode(editorState.root);
  }

  return plainText;
}

export function toDateTime(secs: number) {
  var t = new Date('1970-01-01T00:30:00Z');
  t.setSeconds(secs);
  return t;
};

export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000/';

  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export function formatNextReviewDate(reviewDate: Date | string | undefined): string {
  if (!reviewDate) return "Not scheduled";

  const date = new Date(reviewDate);
  const today = startOfToday();

  if (isToday(date) || isBefore(date, today)) {
    return "Next review today";
  }
  if (isTomorrow(date)) {
    return "Next review tomorrow";
  }
  return `Next review on ${format(date, "MMMM d")}`;
}