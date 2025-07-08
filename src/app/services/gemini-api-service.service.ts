import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private readonly API_KEY = 'AIzaSyApaHGdLvu_S52FijIOKwd_T1gGjEdYdJg'; // À remplacer par votre clé API

  constructor(private http: HttpClient) {}

  analyzeKpiData(request: GeminiAnalysisRequest): Observable<GeminiAnalysisResponse> {
    const prompt = this.buildPrompt(request);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-goog-api-key': this.API_KEY
    });

    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    return this.http.post<any>(this.GEMINI_API_URL, payload, { headers })
      .pipe(
        map(response => this.parseGeminiResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  private buildPrompt(request: GeminiAnalysisRequest): string {
    const { kpiData, analysisType, filters } = request;
    
    let prompt = `
Agis comme un expert en analyse de données KPI et business intelligence. 
Tu dois analyser les données KPI suivantes et fournir une réponse structurée en JSON.

Type d'analyse demandée: ${analysisType}
Filtres appliqués: ${JSON.stringify(filters)}

Données KPI à analyser:
${JSON.stringify(kpiData, null, 2)}

Fournis une réponse UNIQUEMENT en format JSON valide avec la structure suivante:
{
  "analysis": "Une analyse détaillée des données (200-300 mots)",
  "recommendations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
  "predictions": {
    "nextPeriod": 85.5,
    "confidence": 78.2,
    "trend": "up"
  },
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "riskFactors": ["Facteur de risque 1", "Facteur de risque 2"]
}

Instructions spécifiques selon le type d'analyse:
`;

    switch (analysisType) {
      case 'performance':
        prompt += `
- Évalue la performance actuelle par rapport aux objectifs
- Identifie les KPI performants et ceux en difficulté
- Analyse les écarts et leurs causes potentielles
- Propose des actions correctives
`;
        break;
      case 'prediction':
        prompt += `
- Prédis les valeurs futures basées sur les tendances historiques
- Évalue la confiance dans les prédictions
- Identifie les facteurs qui pourraient influencer les résultats futurs
- Propose des scénarios optimistes et pessimistes
`;
        break;
      case 'recommendation':
        prompt += `
- Propose des actions concrètes pour améliorer les KPI
- Priorise les recommandations par impact potentiel
- Identifie les ressources nécessaires pour l'implémentation
- Suggère un plan d'action avec timeline
`;
        break;
      case 'trend':
        prompt += `
- Analyse les tendances temporelles des KPI
- Identifie les patterns cycliques ou saisonniers
- Évalue la stabilité des performances
- Prédis l'évolution future des tendances
`;
        break;
    }

    prompt += `
Assure-toi que:
- L'analyse est basée sur les données fournies
- Les recommandations sont actionables et spécifiques
- Les prédictions incluent un niveau de confiance réaliste
- Les insights sont pertinents pour l'amélioration continue
- La réponse est en français
- Le JSON est valide et bien formaté
`;

    return prompt;
  }

  private parseGeminiResponse(response: any): GeminiAnalysisResponse {
    try {
      const content = response.candidates[0].content.parts[0].text;
      
      // Nettoyer la réponse pour extraire le JSON
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      const jsonString = content.substring(jsonStart, jsonEnd);
      
      const parsedResponse = JSON.parse(jsonString);
      
      // Valider la structure de la réponse
      return {
        analysis: parsedResponse.analysis || 'Analyse non disponible',
        recommendations: Array.isArray(parsedResponse.recommendations) 
          ? parsedResponse.recommendations 
          : ['Aucune recommandation disponible'],
        predictions: {
          nextPeriod: parsedResponse.predictions?.nextPeriod || 0,
          confidence: parsedResponse.predictions?.confidence || 0,
          trend: parsedResponse.predictions?.trend || 'stable'
        },
        insights: Array.isArray(parsedResponse.insights) 
          ? parsedResponse.insights 
          : ['Aucun insight disponible'],
        riskFactors: Array.isArray(parsedResponse.riskFactors) 
          ? parsedResponse.riskFactors 
          : ['Aucun facteur de risque identifié']
      };
      
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse Gemini:', error);
      return this.getDefaultResponse();
    }
  }

  private getDefaultResponse(): GeminiAnalysisResponse {
    return {
      analysis: 'Analyse par défaut: Les données KPI montrent des variations normales. Une analyse plus approfondie nécessite des données supplémentaires.',
      recommendations: [
        'Améliorer la collecte de données',
        'Mettre en place des seuils d\'alerte',
        'Réviser les objectifs KPI'
      ],
      predictions: {
        nextPeriod: 85,
        confidence: 60,
        trend: 'stable'
      },
      insights: [
        'Tendance générale stable',
        'Variabilité dans les résultats',
        'Potentiel d\'amélioration identifié'
      ],
      riskFactors: [
        'Manque de données historiques',
        'Variabilité des processus'
      ]
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API Gemini:', error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'analyse';
    
    if (error.status === 401) {
      errorMessage = 'Clé API invalide ou expirée';
    } else if (error.status === 429) {
      errorMessage = 'Limite de requêtes atteinte. Veuillez réessayer plus tard';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur Gemini. Veuillez réessayer';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Méthode pour tester la connexion à l'API
  testConnection(): Observable<boolean> {
    const testPrompt = "Test de connexion. Réponds simplement 'OK'.";
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-goog-api-key': this.API_KEY
    });

    const payload = {
      contents: [{
        parts: [{
          text: testPrompt
        }]
      }]
    };

    return this.http.post<any>(this.GEMINI_API_URL, payload, { headers })
      .pipe(
        map(response => true),
        catchError(error => {
          console.error('Test de connexion échoué:', error);
          return throwError(() => false);
        })
      );
  }
}