import { Component } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent {
  sections = [
    { id: 'produits', title: '🧾 Produits' },
    { id: 'kpi', title: '📊 KPI' },
    { id: 'projets', title: '📁 Projets' },
    { id: 'dashboard', title: '📈 Dashboard' },
    { id: 'analyse', title: '🧠 Analyse de cause' },
    { id: 'actions', title: '🛠️ Plan d’action' }
  ];

  scrollTo(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
    currentDate = new Date();

}
