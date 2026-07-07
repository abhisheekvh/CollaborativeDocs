import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';

import { DocumentService } from '../../../services/document.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly autoSaveSubject = new Subject<void>();

  readonly SaveStatus = SaveStatus;

  saveStatus = signal(SaveStatus.Saved);

  lastSaveTime = signal<Date | null>(null);

  private isLoaded = false;

  private lastSavedDocument: UpdateDocument | null = null;

  documentRequest = signal<UpdateDocument>({
    id: '',
    title: '',
    content: ''
  });

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.documentService.getDocumentById(id).subscribe({

      next: (document) => {

        this.documentRequest.set({
          id: document.id,
          title: document.title,
          content: document.content
        });

        this.lastSavedDocument = structuredClone(this.documentRequest());

        this.lastSaveTime.set(new Date());

        this.isLoaded = true;

      },

      error: (error) => {

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

  }

  updateTitle(title: string): void {

    this.documentRequest.update(document => ({
      ...document,
      title
    }));

    this.saveStatus.set(SaveStatus.Editing);

    if (this.isLoaded) {

      this.autoSaveSubject.next();

    }

  }

  updateContent(content: string): void {

    this.documentRequest.update(document => ({
      ...document,
      content
    }));

    this.saveStatus.set(SaveStatus.Editing);

    if (this.isLoaded) {

      this.autoSaveSubject.next();

    }

  }

  public saveDocument(): void {

    if (JSON.stringify(this.documentRequest()) ===JSON.stringify(this.lastSavedDocument)) 
    {
      return;
    }

    this.saveStatus.set(SaveStatus.Saving);

    this.documentService.updateDocument(this.documentRequest()).subscribe({

      next: () => {

        this.lastSavedDocument = structuredClone(this.documentRequest());

        this.lastSaveTime.set(new Date());

        this.saveStatus.set(SaveStatus.Saved);

        console.log('Document updated successfully');

      },

      error: (error) => {

        this.saveStatus.set(SaveStatus.Failed);

      }

    });

  }

  canDeactivate(): boolean {
    return this.saveStatus()!==this.SaveStatus.Editing && this.saveStatus()!==SaveStatus.Saving;
  }

}