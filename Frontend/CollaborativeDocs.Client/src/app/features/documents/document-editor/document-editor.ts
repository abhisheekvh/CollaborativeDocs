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
import { DocumentAutoSaveService } from './Services/document-auto-save.service';

@Component({
  selector: 'app-document-editor',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css'
})
export class DocumentEditor implements OnInit, CanDeactivateComponent {

  // Inject
private readonly route = inject(ActivatedRoute);
private readonly documentService = inject(DocumentService);
private readonly collaborationService = inject(DocumentCollaborationService);
public readonly autoSaveService = inject(DocumentAutoSaveService);
private readonly destroyRef = inject(DestroyRef);

readonly SaveStatus = SaveStatus;

// Signals
typingUsers = signal<string[]>([]);

documentRequest = signal<UpdateDocument>({
  DocumentId: '',
  title: '',
  content: ''
});

private isLoaded = false;
private isRemoteUpdate = false;

ngOnInit(): void {

  const id = this.route.snapshot.paramMap.get('id');

  if (!id) {
    return;
  }

  // Initialize SignalR
  this.collaborationService.initialize(id);

  // Load document
  this.documentService.getDocumentById(id).subscribe({

    next: document => {

      this.documentRequest.set({
        DocumentId: document.id,
        title: document.title,
        content: document.content
      });

      // Initialize Auto Save Service
      this.autoSaveService.initialize(
        this.documentRequest()
      );

      this.isLoaded = true;

    },

    error: error => {

      console.error(error);

    }

  });

  // Receive document updates
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

      // Update Auto Save baseline
      this.autoSaveService.initialize(
        this.documentRequest()
      );

      console.log('Document updated from SignalR:', update);

      this.isRemoteUpdate = false;

    });

  // Receive typing updates
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
updateTitle(title: string): void {

  if (this.isRemoteUpdate) {
    return;
  }

  this.documentRequest.update(document => ({
    ...document,
    title
  }));

  if (!this.isLoaded) {
    return;
  }

  // Notify other users that someone is typing
  this.collaborationService.notifyTyping(
    this.documentRequest().DocumentId,
    'Abhishek'
  );

  // Notify other users about document changes
  this.collaborationService.notifyDocumentChanged(
    this.documentRequest()
  );

  // Queue document for auto save
  this.autoSaveService.queueSave(
    this.documentRequest()
  );

}

// Updating the Content when User types
updateContent(content: string): void {

  if (this.isRemoteUpdate) {
    return;
  }

  this.documentRequest.update(document => ({
    ...document,
    content
  }));

  if (!this.isLoaded) {
    return;
  }

  // Notify other users that someone is typing
  this.collaborationService.notifyTyping(
    this.documentRequest().DocumentId,
    'Abhishek'
  );

  // Notify other users about document changes
  this.collaborationService.notifyDocumentChanged(
    this.documentRequest()
  );

  // Queue document for auto save
  this.autoSaveService.queueSave(
    this.documentRequest()
  );

}

// Prevent navigation while saving or when there are unsaved changes
canDeactivate(): boolean {

  return this.autoSaveService.saveStatus() !== SaveStatus.Editing &&
         this.autoSaveService.saveStatus() !== SaveStatus.Saving;

}
}