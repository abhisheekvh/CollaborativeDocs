import { Injectable, inject } from '@angular/core';
import { Subject, debounceTime, Observable } from 'rxjs';

import { SignalRService } from '../../../../services/signalr.service';

import { UpdateDocument } from '../../../../models/update-document';
import { UserTyping } from '../../../../models/UserTypingDTO';

@Injectable({
  providedIn: 'root'
})
export class DocumentCollaborationService {

  private readonly signalRService = inject(SignalRService);
  // Subjects
  private readonly documentUpdateSubject = new Subject<UpdateDocument>();
  private readonly typingSubject = new Subject<UserTyping>();

  // Constructor
  constructor() {
    // Document Updates
    this.documentUpdateSubject
      .pipe(
        debounceTime(300)
      )
      .subscribe(document => {
        this.sendDocumentUpdate(document)
          .catch(console.error);
      });

    // Typing Notifications
    this.typingSubject
      .pipe(
        debounceTime(500)
      )
      .subscribe(user => {
        this.sendTypingNotification(user)
          .catch(console.error);
      });
  }

  // Initialization
  async initialize(documentId: string): Promise<void> {
    await this.signalRService.startConnection();
    this.signalRService.registerDocumentUpdateListener();
    this.signalRService.registerTypingListener();
    await this.signalRService.JoinDocumentGroup(documentId);
  }
  // Queue Document Update
  notifyDocumentChanged(document: UpdateDocument): void {
    this.documentUpdateSubject.next(
      structuredClone(document)
    );
  }
  // Queue Typing Notification
  notifyTyping(documentId: string, userName: string): void {
    this.typingSubject.next({
      documentId,
      userName,
      connectionId: ''
    });
  }
  // Send Document Update
  private async sendDocumentUpdate(document: UpdateDocument): Promise<void> {
    await this.signalRService.SendDocumentUpdate(document);
  }
  // Send Typing Notification
  private async sendTypingNotification(user: UserTyping): Promise<void> {
    await this.signalRService.SendTyping(user);
  }
  // Incoming Document Updates
  get documentUpdates$(): Observable<UpdateDocument> {
    return this.signalRService.documentUpdate$;
  }
  // Incoming Typing Updates
  get typingUpdates$(): Observable<UserTyping> {
    return this.signalRService.userType$;
  }
}