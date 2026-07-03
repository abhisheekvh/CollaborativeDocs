import { Component, inject, OnInit } from '@angular/core';
import{DocumentService} from '../../../services/document.service';
import { Document } from '../../../models/document';


@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly documentService=inject(DocumentService);
  documents:Document[]=[];

  ngOnInit():void
  {
    this.LoadDocuments();
  }
  private LoadDocuments():void
  {
    this.documentService.getAllDocument().subscribe({
      next:(documents:Document[])=>{
        this.documents=documents;
      },
      error:(error:any)=>{
        console.error('Error fetching documents:',error);
      }
    });
  }
}
