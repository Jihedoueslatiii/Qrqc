import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlanAction } from 'src/app/models/PlanAction';
import { PlanActionService } from 'src/app/services/plan-action.service';

@Component({
  selector: 'app-plan-action',
  templateUrl: './plan-action.component.html',
  styleUrls: ['./plan-action.component.css']
})
export class PlanActionComponent implements OnInit {
  notStartedPlans: PlanAction[] = [];
  inProgressPlans: PlanAction[] = [];
  completedPlans: PlanAction[] = [];

  constructor(private planService: PlanActionService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.planService.getAll().subscribe(data => {
      this.notStartedPlans = data.filter(p => p.statut === 'NOT_STARTED');
      this.inProgressPlans = data.filter(p => p.statut === 'IN_PROGRESS');
      this.completedPlans = data.filter(p => p.statut === 'COMPLETED');
    });
  }

  deletePlan(id: number): void {
    this.planService.delete(id).subscribe(() => {
      this.loadPlans();
    });
  }

  drop(event: CdkDragDrop<PlanAction[]>) {
    // If dropped in same container, do nothing
    if (event.previousContainer === event.container) {
      return;
    }

    const plan = event.previousContainer.data[event.previousIndex];
    const newStatus = event.container.id as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

    // Save current arrays in case update fails
    const prevData = [...event.previousContainer.data];
    const currData = [...event.container.data];

    // Update the status locally
    plan.statut = newStatus;

    // Call update API
    this.planService.update(plan.id!, plan).subscribe({
      next: () => {
        // Move item visually only on successful backend update
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      },
      error: (err) => {
        console.error('Update failed:', err);
        // On error, reload plans to revert UI to backend state
        this.loadPlans();
      }
    });
  }
  
}
