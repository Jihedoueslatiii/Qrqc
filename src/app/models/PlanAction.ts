export interface PlanAction {
  id?: number;
  action: string;
  pilote: string;
  delai: string;
  statut: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
