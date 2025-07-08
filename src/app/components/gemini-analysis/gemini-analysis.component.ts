import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin, of, from } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CoutService } from 'src/app/services/cout.service';
import { DelaiService } from 'src/app/services/delai.service';
import { QualiteService } from 'src/app/services/qualite.service';
import { KpiInfo, SharedKpiService } from 'src/app/services/shared-kpi.service';


export interface GeminiAnalysisRequest {
  kpiData: any[];
  analysisType: 'prediction' | 'recommendation' | 'trend' | 'performance';
  filters: {
    pilote?: string;
    kpi?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface GeminiAnalysisResponse {
  analysis: string;
  recommendations: string[];
  predictions: {
    nextPeriod: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  };
  insights: string[];
  riskFactors: string[];
}

@Component({
  selector: 'app-gemini-analysis',
  templateUrl: './gemini-analysis.component.html',
  styleUrls: ['./gemini-analysis.component.css']
})
export class GeminiAnalysisComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  analysisForm!: FormGroup;
  kpiInfos: KpiInfo[] = [];
  pilotes: string[] = [];
  
  // Data states
  loading = false;
  analyzing = false;
  error: string | null = null;
  
  // Analysis results
  analysisResult: GeminiAnalysisResponse | null = null;
  
  // Raw data for display
  rawData: any[] = [];
  
  // Analysis types
  analysisTypes = [
    { value: 'performance', label: 'Analyse de Performance' },
    { value: 'prediction', label: 'Prédictions' },
    { value: 'recommendation', label: 'Recommandations' },
    { value: 'trend', label: 'Analyse de Tendances' }
  ];

  constructor(
    private fb: FormBuilder,
    private qualiteService: QualiteService,
    private coutService: CoutService,
    private delaiService: DelaiService,
    private sharedKpiService: SharedKpiService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadKpiData();
    this.loadPilotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.analysisForm = this.fb.group({
      analysisType: ['performance', Validators.required],
      pilote: [''],
      kpi: [''],
      dateStart: [''],
      dateEnd: [''],
      includeQualite: [true],
      includeCout: [true],
      includeDelai: [true]
    });
  }

  private loadKpiData(): void {
    this.sharedKpiService.kpis$
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => {
        this.kpiInfos = kpis;
      });
  }

  private loadPilotes(): void {
    this.sharedKpiService.getPilotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(pilotes => {
        this.pilotes = pilotes;
      });
  }

  onAnalyze(): void {
    if (!this.analysisForm || this.analysisForm.invalid) {
      return;
    }

    this.analyzing = true;
    this.error = null;
    this.analysisResult = null;

    const formValue = this.analysisForm.value;
    
    // Collect data from selected services
    this.collectKpiData(formValue)
      .pipe(
        finalize(() => this.analyzing = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.rawData = data;
          this.sendToGemini(data, formValue);
        },
        error: (error) => {
          this.error = 'Erreur lors de la récupération des données: ' + error.message;
        }
      });
  }

  private collectKpiData(formValue: any) {
    const requests = [];
    
    // Collect data based on selected services
    if (formValue.includeQualite) {
      requests.push(
        this.qualiteService.getAll().pipe(
          catchError(err => {
            console.error('Error loading qualite data:', err);
            return of([]);
          })
        )
      );
    }
    
    if (formValue.includeCout) {
      requests.push(
        this.coutService.getAll().pipe(
          catchError(err => {
            console.error('Error loading cout data:', err);
            return of([]);
          })
        )
      );
    }
    
    if (formValue.includeDelai) {
      requests.push(
        this.delaiService.getAll().pipe(
          catchError(err => {
            console.error('Error loading delai data:', err);
            return of([]);
          })
        )
      );
    }

    return forkJoin(requests).pipe(
      catchError(err => {
        console.error('Error in forkJoin:', err);
        return of([]);
      })
    );
  }

  private sendToGemini(data: any[], formValue: any): void {
    // Filter data based on form selections
    const filteredData = this.filterData(data, formValue);
    
    const request: GeminiAnalysisRequest = {
      kpiData: filteredData,
      analysisType: formValue.analysisType,
      filters: {
        pilote: formValue.pilote || undefined,
        kpi: formValue.kpi || undefined,
        dateRange: formValue.dateStart && formValue.dateEnd ? {
          start: formValue.dateStart,
          end: formValue.dateEnd
        } : undefined
      }
    };

    // Simulate Gemini API call - replace with actual API call
    from(this.callGeminiApi(request))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeminiAnalysisResponse) => {
          this.analysisResult = response;
        },
        error: (error: any) => {
          this.error = 'Erreur lors de l\'analyse Gemini: ' + error.message;
        }
      });
  }

  private filterData(data: any[], formValue: any): any[] {
    let filteredData = data.flat();

    // Filter by pilote
    if (formValue.pilote) {
      filteredData = filteredData.filter(item => item.pilote === formValue.pilote);
    }

    // Filter by KPI
    if (formValue.kpi) {
      filteredData = filteredData.filter(item => item.kpi === formValue.kpi);
    }

    // Filter by date range
    if (formValue.dateStart && formValue.dateEnd) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        const startDate = new Date(formValue.dateStart);
        const endDate = new Date(formValue.dateEnd);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return filteredData;
  }

  private callGeminiApi(request: GeminiAnalysisRequest) {
    // This is a mock implementation - replace with actual Gemini API call
    return new Promise<GeminiAnalysisResponse>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate for demo
          const mockResponse: GeminiAnalysisResponse = {
            analysis: this.generateMockAnalysis(request),
            recommendations: this.generateMockRecommendations(request),
            predictions: {
              nextPeriod: Math.random() * 100,
              confidence: Math.random() * 100,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
            },
            insights: this.generateMockInsights(request),
            riskFactors: this.generateMockRiskFactors(request)
          };
          resolve(mockResponse);
        } else {
          reject(new Error('Erreur de communication avec Gemini AI'));
        }
      }, 2000);
    });
  }

  private generateMockAnalysis(request: GeminiAnalysisRequest): string {
    const dataCount = request.kpiData.length;
    const analysisType = request.analysisType;
    
    return `Analyse ${analysisType} basée sur ${dataCount} points de données. 
    ${request.filters.pilote ? `Pilote: ${request.filters.pilote}. ` : ''}
    ${request.filters.kpi ? `KPI: ${request.filters.kpi}. ` : ''}
    Les données montrent une tendance générale avec des variations saisonnières observées.
    Performance actuelle: ${(Math.random() * 100).toFixed(1)}% par rapport aux objectifs.`;
  }

  private generateMockRecommendations(request: GeminiAnalysisRequest): string[] {
    const recommendations = [
      'Améliorer la collecte de données pour une meilleure précision',
      'Mettre en place un système d\'alerte précoce pour les écarts',
      'Optimiser les processus identifiés comme critiques',
      'Renforcer la formation des équipes sur les KPI prioritaires'
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateMockInsights(request: GeminiAnalysisRequest): string[] {
    const insights = [
      'Corrélation forte entre les KPI de qualité et de délai',
      'Tendance saisonnière détectée sur les 6 derniers mois',
      'Performance supérieure à la moyenne du secteur',
      'Opportunité d\'amélioration identifiée dans le processus'
    ];
    
    return insights.slice(0, Math.floor(Math.random() * 2) + 2);
  }

  private generateMockRiskFactors(request: GeminiAnalysisRequest): string[] {
    const risks = [
      'Variabilité élevée dans les résultats récents',
      'Dépendance critique sur un pilote spécifique',
      'Écart croissant par rapport aux objectifs fixés',
      'Manque de données historiques pour certains KPI'
    ];
    
    return risks.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  onReset(): void {
    this.analysisForm?.reset();
    this.analysisResult = null;
    this.error = null;
    this.rawData = [];
    this.initializeForm();
  }

  onExportResults(): void {
    if (this.analysisResult) {
      const results = {
        timestamp: new Date().toISOString(),
        filters: this.analysisForm?.value,
        analysis: this.analysisResult
      };
      
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gemini-analysis-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-unknown';
    }
  }

  getUniqueKpiCount(): number {
    const uniqueKpis = new Set(this.rawData.map(item => item.kpi));
    return uniqueKpis.size;
  }

  getUniquePiloteCount(): number {
    const uniquePilotes = new Set(this.rawData.map(item => item.pilote));
    return uniquePilotes.size;
  }

  
 
}