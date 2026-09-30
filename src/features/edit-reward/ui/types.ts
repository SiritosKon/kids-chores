import type { VariantDraft } from '@/entities/reward';

export interface EditableVariant extends VariantDraft {
  key: string;
}
