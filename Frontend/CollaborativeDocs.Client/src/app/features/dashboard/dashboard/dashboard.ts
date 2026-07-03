import { Component, inject, OnInit, signal } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { Document } from '../../../models/document';
import { CreateDocument } from '../../documents/create-document/create-document';

@Component({
  selector: 'app-dashboard',
  imports: [CreateDocument],
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private readonly documentService = inject(DocumentService);

  documents = signal<Document[]>([]);

  showCreateModal = signal(false);

  ngOnInit(): void {
    this.loadDocuments();
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  private loadDocuments(): void {

    this.documentService.getAllDocument().subscribe({

      next: (documents: Document[]) => {

        this.documents.set(documents);

        console.log('Documents fetched:', documents);

      },

      error: (error: any) => {

        console.error('Error fetching documents:', error);

      }

    });

  }

}