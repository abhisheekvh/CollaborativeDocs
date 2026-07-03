import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environment/environment';
import { Document } from '../models/document';

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

}