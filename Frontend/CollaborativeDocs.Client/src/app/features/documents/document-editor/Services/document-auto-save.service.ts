import { Injectable, inject, signal } from '@angular/core';
import { Subject, debounceTime, fromEvent } from 'rxjs';
import { DocumentService } from '../../../../services/document.service';
import { UpdateDocument } from '../../../../models/update-document';
import { SaveStatus } from '../../../../models/save-status';

@Injectable({
  providedIn: 'root'
})
export class DocumentAutoSaveService {

  private readonly documentService = inject(DocumentService);

  private readonly saveSubject = new Subject<UpdateDocument>();

  readonly saveStatus = signal(SaveStatus.Idle);

  readonly lastSaveTime = signal<Date | null>(null);

  private lastSavedDocument: UpdateDocument | null = null;

  private isSaving = false;

  private hasPendingChanges = false;

  private isOffline = false;

  private retryCount = 0;

  private readonly maxRetries = 3;

  constructor() {

    fromEvent(window, 'offline').subscribe(() => {

      this.isOffline = true;

      this.saveStatus.set(SaveStatus.Offline);

    });

    fromEvent(window, 'online').subscribe(() => {

      this.isOffline = false;

      if (this.hasPendingChanges && this.lastSavedDocument) {

        this.hasPendingChanges = false;

        this.saveDocument(this.lastSavedDocument);

      }

    });

    this.saveSubject
      .pipe(
        debounceTime(2000)
      )
      .subscribe(document => {

        this.saveDocument(document);

      });

  }

  initialize(document: UpdateDocument): void {

    this.lastSavedDocument = structuredClone(document);

    this.lastSaveTime.set(new Date());

    this.saveStatus.set(SaveStatus.Saved);

  }

  queueSave(document: UpdateDocument): void {

    this.saveStatus.set(SaveStatus.Editing);

    this.saveSubject.next(structuredClone(document));

  }

  forceSave(document: UpdateDocument): void {

    this.saveDocument(document);

  }

  hasUnsavedChanges(document: UpdateDocument): boolean {

    return document.title !== this.lastSavedDocument?.title ||
           document.content !== this.lastSavedDocument?.content;

  }

  private saveDocument(document: UpdateDocument): void {

    if (this.isOffline) {

      this.hasPendingChanges = true;

      this.saveStatus.set(SaveStatus.Offline);

      return;

    }

    if (!this.hasUnsavedChanges(document)) {

      return;

    }

    if (this.isSaving) {

      this.hasPendingChanges = true;

      return;

    }

    this.isSaving = true;

    this.saveStatus.set(SaveStatus.Saving);

    this.documentService.updateDocument(document)
      .subscribe({

        next: () => this.onSaveSuccess(document),

        error: () => this.onSaveFailure(document)

      });

  }

  private onSaveSuccess(document: UpdateDocument): void {

    this.isSaving = false;

    this.retryCount = 0;

    this.lastSavedDocument = structuredClone(document);

    this.lastSaveTime.set(new Date());

    this.saveStatus.set(SaveStatus.Saved);

    if (this.hasPendingChanges) {

      this.hasPendingChanges = false;

      this.saveDocument(document);

    }

  }

  private onSaveFailure(document: UpdateDocument): void {

    this.isSaving = false;

    if (this.retryCount < this.maxRetries) {

      this.retryCount++;

      this.saveStatus.set(SaveStatus.Retrying);

      const delay = Math.pow(2, this.retryCount) * 1000;

      setTimeout(() => {

        this.saveDocument(document);

      }, delay);

      return;

    }

    this.saveStatus.set(SaveStatus.Failed);

  }

}