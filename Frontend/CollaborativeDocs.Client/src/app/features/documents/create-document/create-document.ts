import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DocumentService } from '../../../services/document.service';
import { CreateDocuments } from '../../../models/create-document';
import { Document } from '../../../models/DocumentModel';

@Component({
  selector: 'app-create-document',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-document.html',
  styleUrl: './create-document.css'
})
export class CreateDocument {

  private readonly documentService = inject(DocumentService);

  title = '';

  close = output<void>();

  documentCreated = output<Document>();

  create(): void {

    const request: CreateDocuments = {
      title: this.title
    };

    this.documentService.createDocument(request).subscribe({

      next: (document: Document) => {

        console.log('Document created:', document);

        this.title = '';

        this.documentCreated.emit(document);

        this.close.emit();

      },

      error: (error) => {

        console.error('Error creating document:', error);

      }

    });

  }

  cancel(): void {

    this.close.emit();

  }

}