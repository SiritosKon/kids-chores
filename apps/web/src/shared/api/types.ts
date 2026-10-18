export interface CatalogueRow {
  id: string;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}
