import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { DocumentEditor } from './features/documents/document-editor/document-editor';
export const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
  {
    path: 'documents/:id',
    component: DocumentEditor
  },
  {
    path: '**',
    redirectTo: ''
  }
];