import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarComponent } from './bar/bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';


import { WelcomeComponent } from './components/welcome/welcome.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { KpiIpListComponent } from './components/kpi-ip-list/kpi-ip-list.component';
import { ToastrModule } from 'ngx-toastr';
import { ExcelUploadComponent } from './components/excel-upload/excel-upload.component';
import { AnalyseCausesComponent } from './components/analyse-causes/analyse-causes.component';
import { PlanActionComponent } from './components/plan-action/plan-action.component';
import { QualiteListComponent } from './qualite-list/qualite-list.component';
import { AnalyseCausesBoardComponent } from './components/analyse-causes-board/analyse-causes-board.component';
import { DelaiComponent } from './components/delai/delai.component';
import { LoginComponent } from './login/login.component';
import { NgChartsModule } from 'ng2-charts';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { CoutComponent } from './components/cout/cout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FullDashboardComponent } from './components/full-dashboard/full-dashboard.component';
import { OtdComponent } from './components/otd/otd.component';
import { EfficaciteComponent } from './components/efficacite/efficacite.component';
import { OtdProjetComponent } from './components/otd-projet/otd-projet.component';
import { KpiIpProjetComponent } from './components/kpi-ip-projet/kpi-ip-projet.component';
import { KpiListComponent } from './components/kpi-list/kpi-list.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    WelcomeComponent,
    KpiIpListComponent,
    ExcelUploadComponent,
    AnalyseCausesComponent,
    PlanActionComponent,
    QualiteListComponent,
    AnalyseCausesBoardComponent,
    DelaiComponent,
    LoginComponent,
    CoutComponent,
    DashboardComponent,
    FullDashboardComponent,
    OtdComponent,
    EfficaciteComponent,
    OtdProjetComponent,
    KpiIpProjetComponent,
    KpiListComponent,
    DocumentationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    NgChartsModule ,
    ReactiveFormsModule,
    
    BrowserAnimationsModule,
      ToastrModule.forRoot({
      positionClass: 'toast-top-right',
       timeOut: 3000,
      progressBar: true
    }), 
    // Add this

  
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
