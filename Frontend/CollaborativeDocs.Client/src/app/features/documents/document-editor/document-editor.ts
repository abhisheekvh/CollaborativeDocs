import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';

import { DocumentService } from '../../../services/document.service';
import { SignalRService } from '../../../services/signalr.service';

import { UpdateDocument } from '../../../models/update-document';
import { SaveStatus } from '../../../models/save-status';
import { CanDeactivateComponent } from '../../../models/can-deactivate';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css'
})
export class DocumentEditor implements OnInit, CanDeactivateComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(DocumentService);
  private readonly signalRService = inject(SignalRService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly autoSaveSubject = new Subject<void>();

  readonly SaveStatus = SaveStatus;

  saveStatus = signal(SaveStatus.Idle);

  lastSaveTime = signal<Date | null>(null);

  private isRemoteUpdate = false;
  private isLocalUpdate = false;
  documentRequest = signal<UpdateDocument>({
    id: '',
    title: '',
    content: ''
  });

  private isLoaded = false;

  private lastSavedDocument: UpdateDocument | null = null;

  private isSaving = false;
  private hasPendingChanges = false;

  private retryCount = 0;
  private readonly maxRetries = 3;

  private isOffline = false;

  @HostListener('window:offline')
  onOffline(): void {

    this.isOffline = true;
    this.saveStatus.set(SaveStatus.Offline);

  }

  @HostListener('window:online')
  onOnline(): void {

    this.isOffline = false;

    if (this.hasPendingChanges) {

      this.hasPendingChanges = false;
      this.saveDocument();

    }

  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.initializeSignalR(id).catch(error => {
      console.error('Error initializing SignalR:', error);
    });

    this.documentService.getDocumentById(id).subscribe({

      next: (document) => {

        this.documentRequest.set({
          id: document.id,
          title: document.title,
          content: document.content
        });

        this.lastSavedDocument = structuredClone(this.documentRequest());

        this.lastSaveTime.set(new Date());

        this.saveStatus.set(SaveStatus.Saved);

        this.isLoaded = true;

      },

      error: error => {

        console.error(error);

      }

    });

    this.autoSaveSubject
      .pipe(
        debounceTime(2000),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {

        this.saveDocument();

      });

      this.signalRService.documentUpdate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((update: UpdateDocument) => {
        this.isRemoteUpdate = true;
        this.documentRequest.set({
          id: update.id,
          title: update.title,
          content: update.content
        });

        this.lastSavedDocument = structuredClone(this.documentRequest());

        this.lastSaveTime.set(new Date());

       // this.saveStatus.set(SaveStatus.Saved);

        console.log('Document updated from SignalR:', update);
      });
      this.isRemoteUpdate = false;
  }

  updateTitle(title: string): void {
    if(this.isRemoteUpdate) {
      return;
    }
    this.documentRequest.update(document => ({
      ...document,
      title
    }));

    this.saveStatus.set(SaveStatus.Editing);

    if (this.isLoaded) {

      this.sendDocumentUpdate().catch(console.error);

      this.autoSaveSubject.next();

    }

  }

  updateContent(content: string): void {
    if(this.isRemoteUpdate) {
      return;
    }

    this.documentRequest.update(document => ({
      ...document,
      content
    }));

    this.saveStatus.set(SaveStatus.Editing);

    if (this.isLoaded) {

      this.sendDocumentUpdate().catch(console.error);

      this.autoSaveSubject.next();

    }

  }

  public saveDocument(): void {

    if (this.isOffline) {

      this.hasPendingChanges = true;
      this.saveStatus.set(SaveStatus.Offline);

      return;

    }

    if (!this.isDocumentModified()) {
      return;
    }

    if (this.isSaving) {

      this.hasPendingChanges = true;
      return;

    }

    this.isSaving = true;

    this.saveStatus.set(SaveStatus.Saving);

    this.documentService.updateDocument(this.documentRequest()).subscribe({

      next: () => this.onSaveSuccess(),

      error: () => this.onSaveFailure()

    });

  }

  private onSaveSuccess(): void {

    this.isSaving = false;

    this.retryCount = 0;

    this.lastSavedDocument = structuredClone(this.documentRequest());

    this.lastSaveTime.set(new Date());

    this.saveStatus.set(SaveStatus.Saved);

    console.log('Document updated successfully');

    if (this.hasPendingChanges) {

      this.hasPendingChanges = false;

      this.saveDocument();

    }

  }

  private onSaveFailure(): void {

    this.isSaving = false;

    if (this.retryCount < this.maxRetries) {

      this.retryCount++;

      this.saveStatus.set(SaveStatus.Retrying);

      const delay = Math.pow(2, this.retryCount) * 1000;

      console.log(`Retrying in ${delay / 1000} seconds...`);

      setTimeout(() => {

        this.saveDocument();

      }, delay);

      return;

    }

    this.saveStatus.set(SaveStatus.Failed);

    console.error('Failed to update document.');

  }

  private isDocumentModified(): boolean {

    const current = this.documentRequest();

    return current.title !== this.lastSavedDocument?.title ||
           current.content !== this.lastSavedDocument?.content;

  }

  canDeactivate(): boolean {

    return this.saveStatus() !== SaveStatus.Editing &&
           this.saveStatus() !== SaveStatus.Saving;

  }

  private async initializeSignalR(documentId: string): Promise<void> {

    await this.signalRService.startConnection();

    this.signalRService.registerDocumentUpdateListener();

    await this.signalRService.JoinDocumentGroup(documentId);

  }

  private async sendDocumentUpdate(): Promise<void> {

    await this.signalRService.SendDocumentUpdate({

      id: this.documentRequest().id,

      title: this.documentRequest().title,

      content: this.documentRequest().content

    });

  }

}