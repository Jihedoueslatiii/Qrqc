export interface Qualite {
  id?: number;
  kpi: string;
  date: string; // ISO string
  nombrePiecesNc: number;
  nombrePiecesTotal: number;
  resultat?: number;
  objectif: number;
  pilote: string;
}