import { Component, OnInit } from '@angular/core';
import { CoutService } from 'src/app/services/cout.service';
import { DelaiService } from 'src/app/services/delai.service';
import { QualiteService } from 'src/app/services/qualite.service';
import { KpiIpService } from 'src/app/services/kpi-ip.service';
import { OtdService, OTD } from 'src/app/services/otd.service';
import { KPI_IP } from 'src/app/models/KPI_IP';
import { KpiAlertService } from 'src/app/services/kpi-alert-service.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}
interface ProjectStats {
  project: string;

  qualite: number | null;
  qualiteCount: number;
  qualiteMin: number | null;
  qualiteMax: number | null;
  qualiteStdDev: number | null;
  qualiteAlertCount: number;
  qualitePassPct: number | null;

  delai: number | null;
  delaiCount: number;
  delaiMin: number | null;
  delaiMax: number | null;
  delaiStdDev: number | null;
  delaiAlertCount: number;
  delaiPassPct: number | null;

  cout: number | null;
  coutCount: number;
  coutMin: number | null;
  coutMax: number | null;
  coutStdDev: number | null;
  coutAlertCount: number;
  coutPassPct: number | null;

  totalAverage: number | null;
}
interface WeeklyEfficacite {
  week: number;
  debut: string;
  fin: string;
  totalATemps: number;
  totalPlanifiees: number;
  resultat: number;
  objectif: number;
}

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.css']
})
export class DashboardStatsComponent implements OnInit {
    alertMessage: string | null = null;


  stats: ProjectStats[] = [];
  loading = true;
  threshold = 90; // threshold for pass/fail

  // KPI IP totals
  totalKpiIp = 0;
  totalHseTag = 0;
  totalIp = 0;

  // OTD avg tauxRealisation
  avgCoutResultat = 0;

  // Delai avg efficacité
  avgEfficacite = 0;

  constructor(
    private qualiteService: QualiteService,
    private delaiService: DelaiService,
    private coutService: CoutService,
    private kpiIpService: KpiIpService,
    private otdService: OtdService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private filterByProject(arr: any[], project: string) {
    return arr.filter(i => i.kpi === project);
  }

  private minByProject(arr: any[], project: string): number | null {
    const filtered = this.filterByProject(arr, project);
    if (!filtered.length) return null;
    return Math.min(...filtered.map(i => i.resultat ?? 0));
  }

  private maxByProject(arr: any[], project: string): number | null {
    const filtered = this.filterByProject(arr, project);
    if (!filtered.length) return null;
    return Math.max(...filtered.map(i => i.resultat ?? 0));
  }

  private countByProject(arr: any[], project: string): number {
    return this.filterByProject(arr, project).length;
  }

  private stdDevByProject(arr: any[], project: string): number | null {
    const filtered = this.filterByProject(arr, project);
    if (!filtered.length) return null;
    const mean = filtered.reduce((acc, i) => acc + (i.resultat ?? 0), 0) / filtered.length;
    const variance = filtered.reduce((acc, i) => acc + Math.pow((i.resultat ?? 0) - mean, 2), 0) / filtered.length;
    return Math.sqrt(variance);
  }

  private alertCountByProject(arr: any[], project: string): number {
    return this.filterByProject(arr, project).filter(i => (i.resultat ?? 0) < this.threshold).length;
  }

  private passCountByProject(arr: any[], project: string): number {
    return this.filterByProject(arr, project).filter(i => (i.resultat ?? 0) >= this.threshold).length;
  }

  private passPercentageByProject(arr: any[], project: string): number | null {
    const filtered = this.filterByProject(arr, project);
    if (!filtered.length) return null;
    return this.passCountByProject(arr, project) / filtered.length * 100;
  }

  private averageByProject(arr: any[], project: string): number | null {
    const filtered = this.filterByProject(arr, project);
    if (!filtered.length) return null;
    const sum = filtered.reduce((acc, item) => acc + (item.resultat ?? 0), 0);
    return sum / filtered.length;
  }

  progressBarColor(value: number | null): string {
    if (value === null) return '#ccc';
    if (value >= this.threshold) return '#198754'; // green
    if (value >= this.threshold * 0.7) return '#ffc107'; // orange
    return '#FF0000 '; // red
  }

  async loadStats() {
    this.loading = true;
    try {
      const qualites = await this.qualiteService.getAll().toPromise() || [];
      const delais = await this.delaiService.getAll().toPromise() || [];
      const couts = await this.coutService.getAll().toPromise() || [];

      // Projects set
      const projects = new Set<string>();
      qualites.forEach(q => { if (q.kpi) projects.add(q.kpi); });
      delais.forEach(d => { if (d.kpi) projects.add(d.kpi); });
      couts.forEach(c => { if (c.kpi) projects.add(c.kpi); });

      this.stats = Array.from(projects).map(project => {
        const qualiteAvg = this.averageByProject(qualites, project);
        const qualiteMin = this.minByProject(qualites, project);
        const qualiteMax = this.maxByProject(qualites, project);
        const qualiteCount = this.countByProject(qualites, project);
        const qualiteStdDev = this.stdDevByProject(qualites, project);
        const qualiteAlertCount = this.alertCountByProject(qualites, project);
        const qualitePassPct = this.passPercentageByProject(qualites, project);

        const delaiAvg = this.averageByProject(delais, project);
        const delaiMin = this.minByProject(delais, project);
        const delaiMax = this.maxByProject(delais, project);
        const delaiCount = this.countByProject(delais, project);
        const delaiStdDev = this.stdDevByProject(delais, project);
        const delaiAlertCount = this.alertCountByProject(delais, project);
        const delaiPassPct = this.passPercentageByProject(delais, project);

        const coutAvg = this.averageByProject(couts, project);
        const coutMin = this.minByProject(couts, project);
        const coutMax = this.maxByProject(couts, project);
        const coutCount = this.countByProject(couts, project);
        const coutStdDev = this.stdDevByProject(couts, project);
        const coutAlertCount = this.alertCountByProject(couts, project);
        const coutPassPct = this.passPercentageByProject(couts, project);

        const avgs = [qualiteAvg, delaiAvg, coutAvg].filter(v => v !== null) as number[];
        const totalAverage = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;

        return {
          project,
          qualite: qualiteAvg,
          qualiteCount,
          qualiteMin,
          qualiteMax,
          qualiteStdDev,
          qualiteAlertCount,
          qualitePassPct,

          delai: delaiAvg,
          delaiCount,
          delaiMin,
          delaiMax,
          delaiStdDev,
          delaiAlertCount,
          delaiPassPct,

          cout: coutAvg,
          coutCount,
          coutMin,
          coutMax,
          coutStdDev,
          coutAlertCount,
          coutPassPct,

          totalAverage
        };
      });

      // KPI IP
      const kpiIpData = await this.kpiIpService.getAll().toPromise() || [];
      this.totalKpiIp = kpiIpData.length;
      this.totalHseTag = kpiIpData.filter(kpi => kpi.hseTag).length;
      this.totalIp = kpiIpData.filter(kpi => !kpi.hseTag).length;

      // OTD
      const otdData = await this.otdService.getAll().toPromise() || [];
      const tauxRealisationValues = otdData
        .map(item => item.tauxRealisation)
        .filter(tr => tr !== undefined && tr !== null) as number[];

      this.avgCoutResultat = tauxRealisationValues.length
        ? tauxRealisationValues.reduce((sum, val) => sum + val, 0) / tauxRealisationValues.length
        : 0;

      // Efficacité (Delai)
      this.avgEfficacite = this.calculateAvgEfficacite(delais);

    } catch (err) {
      console.error('Failed to load KPI stats', err);
      this.stats = [];
    } finally {
      this.loading = false;
    }
  }

  calculateAvgEfficacite(delais: any[]): number {
    if (!delais.length) return 0;
    const totalATemps = delais.reduce((acc, d) => acc + (d.nombrePiecesATemps || 0), 0);
    const totalPlanifiees = delais.reduce((acc, d) => acc + (d.nombrePiecesPlanifiees || 0), 0);
    return totalPlanifiees > 0 ? (totalATemps / totalPlanifiees) * 100 : 0;
  }

  getAverage(field: 'qualite' | 'delai' | 'cout'): number {
    const vals = this.stats
      .map(s => s[field])
      .filter(v => v !== null) as number[];
    if (!vals.length) return 0;
    return vals.reduce((a,b) => a+b, 0) / vals.length;
  }

  getPassRate(field: 'qualite' | 'delai' | 'cout'): number {
    const totalPass = this.stats.reduce((acc, s) => {
      const passPct = s[`${field}PassPct` as keyof ProjectStats] as number | null;
      const count = s[`${field}Count` as keyof ProjectStats] as number;
      return acc + (passPct ? (passPct * count) / 100 : 0);
    }, 0);

    const totalCount = this.stats.reduce((acc, s) => {
      const count = s[`${field}Count` as keyof ProjectStats] as number;
      return acc + count;
    }, 0);

    return totalCount ? (totalPass / totalCount) * 100 : 0;
  }



generatePDF(): void {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const marginY = 15;
  let currentY = marginY;

  try {
    // === PAGE DE COUVERTURE ===
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Titre principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor('#FFFFFF');
    doc.text('RAPPORT DE PERFORMANCE', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(18);
    doc.text('Indicateurs Clés de Performance', pageWidth / 2, 40, { align: 'center' });

    // Logo (avec fallback)
    try {
      doc.addImage('assets/logo2.png', 'PNG', pageWidth / 2 - 25, 60, 50, 25, undefined, 'FAST');
    } catch {
      doc.setFillColor('#E8F4F8');
      doc.roundedRect(pageWidth / 2 - 25, 60, 50, 25, 5, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor('#003366');
      doc.text('SAFRAN', pageWidth / 2, 75, { align: 'center' });
    }

    // Informations de date et entreprise
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor('#333333');
    const formattedDate = new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Généré le : ${formattedDate}`, pageWidth / 2, 100, { align: 'center' });

    // Informations entreprise
    doc.setFontSize(12);
    doc.setTextColor('#666666');
    doc.text('Safran Group', pageWidth / 2, 120, { align: 'center' });
    doc.text('KM6 ROUTE DE TUNIS DHARI', pageWidth / 2, 130, { align: 'center' });
    doc.text('Soliman - Nabeul - 8020, Tunisie', pageWidth / 2, 140, { align: 'center' });
    doc.text('www.safran-group.com | contact@safran-group.com', pageWidth / 2, 150, { align: 'center' });

    // Badge confidentiel
    doc.setFillColor('#DC3545');
    doc.roundedRect(pageWidth / 2 - 40, pageHeight - 50, 80, 15, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#FFFFFF');
    doc.text('DOCUMENT CONFIDENTIEL', pageWidth / 2, pageHeight - 42, { align: 'center' });

    // === TABLE DES MATIÈRES ===
    doc.addPage();
    currentY = marginY;
    
    // En-tête
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('TABLE DES MATIÈRES', marginX, 18);

    currentY = 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor('#333333');
    
    const toc = [
      { title: '1. Résumé Exécutif', page: 3 },
      { title: '2. Statistiques Générales', page: 4 },
      { title: '3. Analyse Détaillée par Programme', page: 5 },
      { title: '4. Indicateurs de Performance Globaux', page: 6 },
      { title: '5. Analyse des Seuils et Alertes', page: 7 },
      { title: '6. Recommandations et Actions', page: 8 }
    ];
    
    toc.forEach((item, idx) => {
      const yPos = currentY + idx * 15;
      doc.text(item.title, marginX, yPos);
      doc.text(`Page ${item.page}`, pageWidth - marginX, yPos, { align: 'right' });
      
      // Ligne pointillée
      doc.setDrawColor('#CCCCCC');
      doc.setLineWidth(0.2);
      for (let x = marginX + 120; x < pageWidth - marginX - 30; x += 3) {
        doc.line(x, yPos - 1, x + 1, yPos - 1);
      }
    });

    // === RÉSUMÉ EXÉCUTIF ===
    doc.addPage();
    currentY = marginY;
    
    // En-tête de section
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('1. RÉSUMÉ EXÉCUTIF', marginX, 18);

    currentY = 40;
    
    // Encadré résumé
    doc.setFillColor('#F8F9FA');
    doc.setDrawColor('#003366');
    doc.setLineWidth(1);
    doc.roundedRect(marginX, currentY, pageWidth - 2 * marginX, 100, 5, 5, 'FD');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#003366');
    doc.text('Vue d\'ensemble des Performances', marginX + 10, currentY + 15);
    
    // Métriques principales
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#333333');
    
    const summaryData = [
      { label: 'Nombre total de programmes', value: this.stats.length.toString() },
      { label: 'Performance Qualité moyenne', value: `${this.getAverage('qualite').toFixed(1)}%` },
      { label: 'Taux de conformité Qualité', value: `${this.getPassRate('qualite').toFixed(1)}%` },
      { label: 'Performance Délai moyenne', value: `${this.getAverage('delai').toFixed(1)}%` },
      { label: 'Taux de conformité Délai', value: `${this.getPassRate('delai').toFixed(1)}%` },
      { label: 'Performance Coût moyenne', value: `${this.getAverage('cout').toFixed(1)}%` },
      { label: 'Taux de conformité Coût', value: `${this.getPassRate('cout').toFixed(1)}%` },
      { label: 'Efficacité globale', value: `${this.avgEfficacite.toFixed(1)}%` }
    ];
    
    summaryData.forEach((item, idx) => {
      const yPos = currentY + 25 + (idx * 8);
      doc.text(`• ${item.label}:`, marginX + 10, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, marginX + 120, yPos);
      doc.setFont('helvetica', 'normal');
    });

    // === STATISTIQUES GÉNÉRALES ===
    doc.addPage();
    currentY = marginY;
    
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('2. STATISTIQUES GÉNÉRALES', marginX, 18);

    currentY = 40;
    
    // Tableau des statistiques KPI IP
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#003366');
    doc.text('Indicateurs KPI IP', marginX, currentY);
    currentY += 15;

    const kpiData = [
      ['Indicateur', 'Valeur', 'Pourcentage'],
      ['Total KPI IP', this.totalKpiIp.toString(), '100%'],
      ['Indicateurs HSE', this.totalHseTag.toString(), `${((this.totalHseTag / this.totalKpiIp) * 100).toFixed(1)}%`],
      ['Indicateurs IP Standard', this.totalIp.toString(), `${((this.totalIp / this.totalKpiIp) * 100).toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [kpiData[0]],
      body: kpiData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: '#003366',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: '#F9FBFF'
      },
      margin: { left: marginX, right: marginX }
    });

    currentY = doc.lastAutoTable?.finalY || currentY + 60;
    currentY += 20;

    // OTD et Efficacité
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#003366');
    doc.text('Indicateurs de Performance Opérationnelle', marginX, currentY);
    currentY += 15;

    const perfData = [
      ['Métrique', 'Valeur', 'Statut'],
      ['Taux de Réalisation OTD Moyen', `${this.avgCoutResultat.toFixed(1)}%`, this.avgCoutResultat >= 90 ? 'Conforme' : 'Non-conforme'],
      ['Efficacité Délai Globale', `${this.avgEfficacite.toFixed(1)}%`, this.avgEfficacite >= 90 ? 'Conforme' : 'Non-conforme']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [perfData[0]],
      body: perfData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: '#003366',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: '#F9FBFF'
      },
      willDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const status = data.cell.text[0];
          if (status === 'Conforme') {
            data.cell.styles.textColor = '#198754';
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Non-conforme') {
            data.cell.styles.textColor = '#DC3545';
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: marginX, right: marginX }
    });

    // === ANALYSE DÉTAILLÉE PAR PROGRAMME ===
    doc.addPage();
    currentY = marginY;
    
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('3. ANALYSE DÉTAILLÉE PAR PROGRAMME', marginX, 18);

    currentY = 40;

    // Tableau principal détaillé
    const detailedColumns = [
      { header: 'Programme', dataKey: 'project' },
      { header: 'Qualité (%)', dataKey: 'qualite' },
      { header: 'Délai (%)', dataKey: 'delai' },
      { header: 'Coût (%)', dataKey: 'cout' },
      { header: 'Moyenne (%)', dataKey: 'totalAverage' },
      { header: 'Alertes', dataKey: 'alerts' }
    ];

    const detailedRows = this.stats.map(s => ({
      project: s.project,
      qualite: s.qualite !== null ? s.qualite.toFixed(1) : 'N/A',
      delai: s.delai !== null ? s.delai.toFixed(1) : 'N/A',
      cout: s.cout !== null ? s.cout.toFixed(1) : 'N/A',
      totalAverage: s.totalAverage !== null ? s.totalAverage.toFixed(1) : 'N/A',
      alerts: (s.qualiteAlertCount + s.delaiAlertCount + s.coutAlertCount).toString()
    }));

    autoTable(doc, {
      startY: currentY,
      head: [detailedColumns.map(c => c.header)],
      body: detailedRows.map(row => detailedColumns.map(c => row[c.dataKey as keyof typeof row])),
      theme: 'grid',
      headStyles: {
        fillColor: '#003366',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: '#333333'
      },
      alternateRowStyles: {
        fillColor: '#F9FBFF'
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' }
      },
      willDrawCell: (data) => {
        if (data.section === 'body') {
          if (data.column.index >= 1 && data.column.index <= 4) {
            const value = parseFloat(data.cell.text[0]);
            if (!isNaN(value)) {
              if (value >= this.threshold) {
                data.cell.styles.textColor = '#198754';
                data.cell.styles.fontStyle = 'bold';
              } else if (value >= this.threshold * 0.7) {
                data.cell.styles.textColor = '#FFC107';
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.textColor = '#DC3545';
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
          if (data.column.index === 5) {
            const alerts = parseInt(data.cell.text[0]);
            if (alerts > 0) {
              data.cell.styles.textColor = '#DC3545';
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      },
      margin: { left: marginX, right: marginX }
    });

    // === STATISTIQUES DÉTAILLÉES ===
    doc.addPage();
    currentY = marginY;
    
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('4. STATISTIQUES DÉTAILLÉES', marginX, 18);

    currentY = 40;

    // Tableau des statistiques complètes
    const statsColumns = [
      { header: 'Programme', dataKey: 'project' },
      { header: 'Q Min', dataKey: 'qualiteMin' },
      { header: 'Q Max', dataKey: 'qualiteMax' },
      { header: 'Q Écart-Type', dataKey: 'qualiteStdDev' },
      { header: 'D Min', dataKey: 'delaiMin' },
      { header: 'D Max', dataKey: 'delaiMax' },
      { header: 'C Min', dataKey: 'coutMin' },
      { header: 'C Max', dataKey: 'coutMax' }
    ];

    const statsRows = this.stats.map(s => ({
      project: s.project,
      qualiteMin: s.qualiteMin !== null ? s.qualiteMin.toFixed(1) : 'N/A',
      qualiteMax: s.qualiteMax !== null ? s.qualiteMax.toFixed(1) : 'N/A',
      qualiteStdDev: s.qualiteStdDev !== null ? s.qualiteStdDev.toFixed(1) : 'N/A',
      delaiMin: s.delaiMin !== null ? s.delaiMin.toFixed(1) : 'N/A',
      delaiMax: s.delaiMax !== null ? s.delaiMax.toFixed(1) : 'N/A',
      coutMin: s.coutMin !== null ? s.coutMin.toFixed(1) : 'N/A',
      coutMax: s.coutMax !== null ? s.coutMax.toFixed(1) : 'N/A'
    }));

    autoTable(doc, {
      startY: currentY,
      head: [statsColumns.map(c => c.header)],
      body: statsRows.map(row => statsColumns.map(c => row[c.dataKey as keyof typeof row])),
      theme: 'grid',
      headStyles: {
        fillColor: '#003366',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: '#333333',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: '#F9FBFF'
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'left' }
      },
      margin: { left: marginX, right: marginX }
    });

    // === ANALYSE DES SEUILS ET ALERTES ===
    doc.addPage();
    currentY = marginY;
    
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('5. ANALYSE DES SEUILS ET ALERTES', marginX, 18);

    currentY = 40;

    // Paramètres du système
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#003366');
    doc.text('Paramètres du Système d\'Alertes', marginX, currentY);
    currentY += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#333333');
    doc.text(`• Seuil de performance: ${this.threshold}%`, marginX, currentY);
    doc.text(`• Seuil d'alerte: ${this.threshold * 0.7}%`, marginX, currentY + 10);
    doc.text(`• Seuil critique: < ${this.threshold * 0.7}%`, marginX, currentY + 20);
    
    currentY += 40;

    // Tableau des alertes par programme
    const alertColumns = [
      { header: 'Programme', dataKey: 'project' },
      { header: 'Alertes Qualité', dataKey: 'qualiteAlerts' },
      { header: 'Alertes Délai', dataKey: 'delaiAlerts' },
      { header: 'Alertes Coût', dataKey: 'coutAlerts' },
      { header: 'Total Alertes', dataKey: 'totalAlerts' },
      { header: 'Statut', dataKey: 'status' }
    ];

    const alertRows = this.stats.map(s => {
      const totalAlerts = s.qualiteAlertCount + s.delaiAlertCount + s.coutAlertCount;
      return {
        project: s.project,
        qualiteAlerts: s.qualiteAlertCount.toString(),
        delaiAlerts: s.delaiAlertCount.toString(),
        coutAlerts: s.coutAlertCount.toString(),
        totalAlerts: totalAlerts.toString(),
        status: totalAlerts === 0 ? 'Conforme' : totalAlerts <= 2 ? 'Attention' : 'Critique'
      };
    });

    autoTable(doc, {
      startY: currentY,
      head: [alertColumns.map(c => c.header)],
      body: alertRows.map(row => alertColumns.map(c => row[c.dataKey as keyof typeof row])),
      theme: 'grid',
      headStyles: {
        fillColor: '#003366',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: '#333333',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: '#F9FBFF'
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' }
      },
      willDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const status = data.cell.text[0];
          if (status === 'Conforme') {
            data.cell.styles.textColor = '#198754';
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Attention') {
            data.cell.styles.textColor = '#FFC107';
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Critique') {
            data.cell.styles.textColor = '#DC3545';
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: marginX, right: marginX }
    });

    // === RECOMMANDATIONS ET ACTIONS ===
    doc.addPage();
    currentY = marginY;
    
    doc.setFillColor('#003366');
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text('6. RECOMMANDATIONS ET ACTIONS', marginX, 18);

    currentY = 40;

    // Sections pour les notes
    const sections = [
      { title: 'Observations Générales', height: 50 },
      { title: 'Recommandations Prioritaires', height: 50 },
      { title: 'Plan d\'Actions Correctives', height: 50 },
      { title: 'Suivi et Échéances', height: 50 }
    ];

    sections.forEach((section, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#003366');
      doc.text(section.title, marginX, currentY);
      
      doc.setDrawColor('#CCCCCC');
      doc.setLineWidth(0.5);
      doc.rect(marginX, currentY + 5, pageWidth - 2 * marginX, section.height);
      
      currentY += section.height + 20;
    });

    // Pied de page pour toutes les pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor('#777777');
      doc.text(`Page ${i} sur ${totalPages}`, pageWidth - marginX, pageHeight - 10, { align: 'right' });
      doc.text('Safran Group - Rapport Confidentiel', marginX, pageHeight - 10);
      doc.text(formattedDate, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Sauvegarde du fichier
    const filename = `Rapport_Performance_KPI_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    this.alertMessage = `Rapport PDF généré avec succès : ${filename}`;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    this.alertMessage = 'Erreur lors de la génération du PDF. Veuillez réessayer.';
  }
}
exportToExcel(): void {
  try {
    // Prepare data for project cards
    const projectData = this.stats.map(stat => ({
      Programme: stat.project,
      'Qualité (%)': stat.qualite !== null ? stat.qualite.toFixed(1) : 'N/A',
      'Délai (%)': stat.delai !== null ? stat.delai.toFixed(1) : 'N/A',
      'Coût (%)': stat.cout !== null ? stat.cout.toFixed(1) : 'N/A',
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(projectData, {
      header: ['Programme', 'Qualité (%)', 'Délai (%)', 'Coût (%)']
    });

    // Apply basic styling
    ws['!cols'] = [
      { wch: 30 }, // Programme
      { wch: 15 }, // Qualité
      { wch: 15 }, // Délai
      { wch: 15 }, // Coût
    ];

    // Create workbook and add worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projets');

    // Generate filename with timestamp
    const filename = `Rapport_Projets_KPI_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    this.alertMessage = `Fichier Excel généré avec succès : ${filename}`;
  } catch (error) {
    console.error('Erreur lors de l\'exportation Excel:', error);
    this.alertMessage = 'Erreur lors de la génération du fichier Excel. Veuillez réessayer.';
  }
}
// Add these methods to your DashboardStatsComponent class

// Get alert status for main dashboard cards
getCardAlertClass(value: number): string {
  if (value === null || value === undefined) return '';
  
  if (value < this.threshold * 0.5) {
    return 'alert-critical pulse-critical';
  } else if (value < this.threshold * 0.7) {
    return 'alert-critical';
  } else if (value < this.threshold) {
    return 'alert-warning';
  } else {
    return 'alert-success';
  }
}

// Get alert status for project cards
getProjectCardAlertClass(stat: ProjectStats): string {
  const criticalCount = this.getCriticalMetricsCount(stat);
  const warningCount = this.getWarningMetricsCount(stat);
  
  if (criticalCount > 0) {
    return criticalCount >= 2 ? 'critical-alert pulse-critical' : 'critical-alert';
  } else if (warningCount > 0) {
    return 'warning-alert';
  } else {
    return 'success';
  }
}

// Get table cell alert class
getTableCellAlertClass(value: number | null): string {
  if (value === null || value === undefined) return '';
  
  if (value < this.threshold * 0.7) {
    return 'flash-critical';
  } else if (value < this.threshold) {
    return 'flash-warning';
  }
  return '';
}

// Count critical metrics (below 70% of threshold)
getCriticalMetricsCount(stat: ProjectStats): number {
  let count = 0;
  const criticalThreshold = this.threshold * 0.7;
  
  if (stat.qualite !== null && stat.qualite < criticalThreshold) count++;
  if (stat.delai !== null && stat.delai < criticalThreshold) count++;
  if (stat.cout !== null && stat.cout < criticalThreshold) count++;
  
  return count;
}

// Count warning metrics (below threshold but above 70%)
getWarningMetricsCount(stat: ProjectStats): number {
  let count = 0;
  const criticalThreshold = this.threshold * 0.7;
  
  if (stat.qualite !== null && stat.qualite >= criticalThreshold && stat.qualite < this.threshold) count++;
  if (stat.delai !== null && stat.delai >= criticalThreshold && stat.delai < this.threshold) count++;
  if (stat.cout !== null && stat.cout >= criticalThreshold && stat.cout < this.threshold) count++;
  
  return count;
}

// Get alert status text
getAlertStatus(value: number | null): { text: string; class: string } {
  if (value === null || value === undefined) {
    return { text: 'N/A', class: '' };
  }
  
  if (value < this.threshold * 0.5) {
    return { text: 'CRITIQUE', class: 'critical' };
  } else if (value < this.threshold * 0.7) {
    return { text: 'URGENT', class: 'critical' };
  } else if (value < this.threshold) {
    return { text: 'ATTENTION', class: 'warning' };
  } else {
    return { text: 'CONFORME', class: 'success' };
  }
}

// Check if there are any critical alerts
hasCriticalAlerts(): boolean {
  return this.stats.some(stat => 
    this.getCriticalMetricsCount(stat) > 0 ||
    this.getAverage('qualite') < this.threshold * 0.7 ||
    this.getAverage('delai') < this.threshold * 0.7 ||
    this.getAverage('cout') < this.threshold * 0.7 ||
    this.avgEfficacite < this.threshold * 0.7
  );
}

// Get alert summary
getAlertSummary(): { critical: number; warning: number; total: number } {
  let critical = 0;
  let warning = 0;
  
  this.stats.forEach(stat => {
    const criticalCount = this.getCriticalMetricsCount(stat);
    const warningCount = this.getWarningMetricsCount(stat);
    
    if (criticalCount > 0) critical++;
    else if (warningCount > 0) warning++;
  });
  
  return { critical, warning, total: this.stats.length };
}

// Get progress bar color with enhanced logic
progressBarColor1(value: number | null): string {
  if (value === null) return '#ccc';
  
  if (value < this.threshold * 0.5) return '#8B0000'; // Dark red for very critical
  if (value < this.threshold * 0.7) return '#FF0000'; // Red for critical
  if (value < this.threshold) return '#FF8C00'; // Orange for warning
  if (value < this.threshold * 1.1) return '#32CD32'; // Light green for good
  return '#228B22'; // Dark green for excellent
}

// Enhanced method to get metric status with more granular alerts
getMetricStatusIcon(value: number | null): string {
  if (value === null) return '❓';
  
  if (value < this.threshold * 0.5) return '🔴'; // Critical
  if (value < this.threshold * 0.7) return '🟠'; // Urgent
  if (value < this.threshold) return '🟡'; // Warning
  if (value < this.threshold * 1.1) return '🟢'; // Good
  return '✅'; // Excellent
}

// Get alert message for dashboard banner
getAlertBannerMessage(): string {
  const summary = this.getAlertSummary();
  
  if (summary.critical > 0) {
    return `🚨 ALERTE CRITIQUE: ${summary.critical} projet(s) en situation critique nécessitent une action immédiate!`;
  } else if (summary.warning > 0) {
    return `⚠️ ATTENTION: ${summary.warning} projet(s) nécessitent une surveillance renforcée.`;
  }
  
  return '';
}

// Get alert banner class
getAlertBannerClass(): string {
  const summary = this.getAlertSummary();
  
  if (summary.critical > 0) {
    return 'alert-banner';
  } else if (summary.warning > 0) {
    return 'alert-banner warning';
  }
  
  return '';
}

}

