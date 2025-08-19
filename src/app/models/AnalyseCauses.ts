import { PlanAction } from "./PlanAction";


export interface AnalyseCauses {
  programme: any;
  id?: number;
  date: string;
  semaine: number;
  indicateur: string;
  probleme: string;
  pourquoi: string;
  planAction: PlanAction; // <-- This links the one-to-one relation
}
