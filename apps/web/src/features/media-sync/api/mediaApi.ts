import { MEDIA_TYPE, mediaCreatedSchema } from '@kids-chores/contracts';
import { API_PREFIX } from '@kids-chores/contracts';
import type { Download } from '../model/types';

export const uploadMedia = async (body: Blob): Promise<string | null> => {
  try {
    const response = await fetch(`${API_PREFIX}/media`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': MEDIA_TYPE },
      body,
    });
    return response.ok ? mediaCreatedSchema.parse(await response.json()).id : null;
  } catch {
    return null;
  }
};

export const downloadMedia = async (id: string): Promise<Download> => {
  try {
    const response = await fetch(`${API_PREFIX}/media/${encodeURIComponent(id)}`, { credentials: 'same-origin' });
    if (response.status === 404) {
      return { status: 'gone' };
    }
    return response.ok ? { status: 'ok', blob: await response.blob() } : { status: 'failed' };
  } catch {
    return { status: 'failed' };
  }
};

export const deleteMedia = async (id: string): Promise<void> => {
  try {
    await fetch(`${API_PREFIX}/media/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin' });
  } catch {
    return;
  }
};
