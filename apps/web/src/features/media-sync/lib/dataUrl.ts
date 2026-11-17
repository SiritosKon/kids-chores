import { MEDIA_TYPE } from '@kids-chores/contracts';
import { BASE64_CHUNK, DATA_URL_PATTERN } from './constants';

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [, type = MEDIA_TYPE, base64 = ''] = DATA_URL_PATTERN.exec(dataUrl) ?? [];
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type });
};

export const blobToDataUrl = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let start = 0; start < bytes.length; start += BASE64_CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(start, start + BASE64_CHUNK));
  }
  return `data:${blob.type || MEDIA_TYPE};base64,${btoa(binary)}`;
};
