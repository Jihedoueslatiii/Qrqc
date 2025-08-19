import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './bar/bar.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { KpiIpListComponent } from './components/kpi-ip-list/kpi-ip-list.component';
import { ExcelUploadComponent } from './components/excel-upload/excel-upload.component';
import { PlanActionComponent } from './components/plan-action/plan-action.component';
import { QualiteListComponent } from './qualite-list/qualite-list.component';
import { AnalyseCausesComponent } from './components/analyse-causes/analyse-causes.component';
import { DelaiComponent } from './components/delai/delai.component';
import { LoginComponent } from './login/login.component';
import { CoutComponent } from './components/cout/cout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FullDashboardComponent } from './components/full-dashboard/full-dashboard.component';
import { OtdComponent } from './components/otd/otd.component';
import { EfficaciteComponent } from './components/efficacite/efficacite.component';
import { OtdProjetComponent } from './components/otd-projet/otd-projet.component';
import { KpiIpProjetComponent } from './components/kpi-ip-projet/kpi-ip-projet.component';
import { KpiListComponent } from './components/kpi-list/kpi-list.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { SendKpiComponent } from './components/send-kpi/send-kpi.component';
import { GeminiAnalysisComponent } from './components/gemini-analysis/gemini-analysis.component';
import { monitorEventLoopDelay } from 'perf_hooks';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ProjectMonitoringComponent } from './components/project-monitoring/project-monitoring.component';

const routes: Routes = [
    {path:'',component:WelcomeComponent},
    {path:'kpi-ip',component:KpiIpListComponent},
    {path:'xl',component:ExcelUploadComponent},
       {path:'pa',component:PlanActionComponent},
       {path:'produitQ',component:QualiteListComponent},
       { path: 'analyse-causes', component: AnalyseCausesComponent },
      { path: 'Delai', component: DelaiComponent },
            { path: 'login', component: LoginComponent },
             { path: 'cout', component: CoutComponent },
     { path: 'dashboard', component: DashboardComponent },
{ path: 'kpi-ip/otd', component: OtdComponent },
    { path: 'visuals', component: FullDashboardComponent },
   { path: 'efficacite', component: EfficaciteComponent },
   { path: 'projetotd', component: OtdProjetComponent },
      { path: 'projetip', component: KpiIpProjetComponent },
   { path: 'kpi', component: KpiListComponent },
 { path: 'doc', component: DocumentationComponent },
 {path: 'stats', component: DashboardStatsComponent },
{path: 'mail', component: SendKpiComponent },

    {path: 'gemini', component: GeminiAnalysisComponent },
  {path: 'projetDashboard', component: ProjectMonitoringComponent },



                                                {path: 'mon', component: MonitoringComponent },




  {path:'bar',component:BarComponent}



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
