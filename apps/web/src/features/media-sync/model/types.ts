export type Download = { status: 'ok'; blob: Blob } | { status: 'gone' } | { status: 'failed' };

export interface PhotoSlot {
  photo: string;
  photoId?: string;
  photoSyncedId?: string;
  photoPending?: boolean;
}

export type PhotoAction = 'upload' | 'clear' | 'download' | 'drop' | 'none';

export interface SlotStore {
  currentPhoto: () => Promise<string | undefined>;
  share: (photoId: string | undefined) => Promise<void>;
  keep: (patch: Partial<Omit<PhotoSlot, 'photoId'>>) => Promise<void>;
}
