export interface Delai {
  id?: number;
  kpi: string; // e.g., "DEL_01"
  date: string; // ISO string, e.g. "2025-06-19"
  nombrePiecesATemps: number;
  nombrePiecesPlanifiees: number;
  resultat?: number;  // computed, read-only
  objectif: number;
  pilote: string;
    isDowntime?: boolean; // <== NEW
      endDate?: string;     // <-- For duration of downtime


}
