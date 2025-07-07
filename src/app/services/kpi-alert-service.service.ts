// src/app/services/kpi-alert.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KpiAlertService {
  private stompClient: Client;
  private alertSubject = new Subject<string>();

  alertMessages$ = this.alertSubject.asObservable();

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/kpi-websocket'),
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/kpi-alert', (message: IMessage) => {
        this.alertSubject.next(message.body);
      });
    };

    this.stompClient.activate();
  }
}
