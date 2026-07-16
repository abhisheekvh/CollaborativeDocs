import {Component,DestroyRef,HostListener,inject,OnInit,signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { DocumentCollaborationService } from './Services/document-collaboration.service';
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

  //Inject
  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(DocumentService);
  private readonly collaborationService = inject(DocumentCollaborationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly autoSaveSubject = new Subject<void>();

  readonly SaveStatus = SaveStatus;

  //Signal
  saveStatus = signal(SaveStatus.Idle);
  lastSaveTime = signal<Date | null>(null);
  typingUsers = signal<string[]>([]);

  documentRequest = signal<UpdateDocument>({
    DocumentId: '',
    title: '',
    content: ''
  });

  private isLoaded = false;
  private isRemoteUpdate = false;
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
  ngOnInit(): void 
  {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
      return;
  }

  // Initialize SignalR
  this.collaborationService.initialize(id);

  // Load document
  this.documentService.getDocumentById(id).subscribe({
    next: (document) => 
    {
        this.documentRequest.set({
        DocumentId: document.id,
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
 
  // Auto Save to SQL Pipeline (2 seconds)
  this.autoSaveSubject
    .pipe(
      debounceTime(2000),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(() => {
      this.saveDocument();
    });

  // Receive document updates from SignalR
  this.collaborationService.documentUpdates$
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((update: UpdateDocument) => {
      this.isRemoteUpdate = true;
      this.documentRequest.update(document => ({
        ...document,
        title: update.title,
        content: update.content
      }));
      this.lastSavedDocument = structuredClone(this.documentRequest());
      this.lastSaveTime.set(new Date());
      console.log('Document updated from SignalR:', update);
      this.isRemoteUpdate = false;
    });
 
  // Receive typing updates from SignaR
  this.collaborationService.typingUpdates$
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(userTyping => {
      console.log(`${userTyping.userName} is typing...`);
      this.typingUsers.set([userTyping.userName]);
      setTimeout(() => {
        this.typingUsers.set([]);
      }, 2000);
    });
}

// Updating the Title when User types
  updateTitle(title: string): void 
  {
      if(this.isRemoteUpdate) {
        return;
      }
      this.documentRequest.update(document => ({
        ...document,
        title
      }));

      this.saveStatus.set(SaveStatus.Editing);

      if (!this.isLoaded) {
      return;
      }
      // Notify the Typing when someone type
      this.collaborationService.notifyTyping(
      this.documentRequest().DocumentId,
      'Abhishek');
      this.collaborationService.notifyDocumentChanged(
      this.documentRequest());
      this.autoSaveSubject.next();
  }
 
  // Updating the Content when User types
  updateContent(content: string): void 
  {
      if(this.isRemoteUpdate) {
        return;
      }

      this.documentRequest.update(document => ({
        ...document,
        content
      }));

      this.saveStatus.set(SaveStatus.Editing);
      if (!this.isLoaded) {
      return;
      }

      this.collaborationService.notifyTyping(
      this.documentRequest().DocumentId,
      'Abhishek');

      this.collaborationService.notifyDocumentChanged(
      this.documentRequest());
      this.autoSaveSubject.next();
  }

  //Save the document to Database
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
    // Save the updated document
    this.documentService.updateDocument(this.documentRequest()).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveFailure()
    });
  }

  //Once save success
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

  //If document saving is failed
  private onSaveFailure(): void 
  {
      this.isSaving = false;
      // Retry logic with exponential backoff
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

  //Checking if the document is modified
  private isDocumentModified(): boolean {

    // Check if the current document state differs from the last saved state
    const current = this.documentRequest();
    return current.title !== this.lastSavedDocument?.title ||
           current.content !== this.lastSavedDocument?.content;
  }

  // Implement the canDeactivate method to prevent navigation if there are unsaved changes
  canDeactivate(): boolean {
    return this.saveStatus() !== SaveStatus.Editing &&
           this.saveStatus() !== SaveStatus.Saving;
  }
}