import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import { Document } from '../models/document';
import { CreateDocuments } from '../models/create-document';
import { UpdateDocument } from '../models/update-document';

@Injectable({
  providedIn: 'root'
})

export class DocumentService 
{
    private readonly http=inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/documents`;

    getAllDocument():Observable<Document[]> {
        return this.http.get<Document[]>(this.apiUrl);
    }
    createDocument(request: CreateDocuments):Observable<Document> {
        return this.http.post<Document>(this.apiUrl, request);
    }
    getDocumentById(id: string): Observable<Document> {
        return this.http.get<Document>(`${this.apiUrl}/${id}`);
    }
    updateDocument(request: UpdateDocument) {
        return this.http.put(`${this.apiUrl}/${request.id}`, request);
    }
}

