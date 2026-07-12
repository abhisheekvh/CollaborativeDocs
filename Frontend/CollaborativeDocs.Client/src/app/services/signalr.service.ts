import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { UpdateDocument } from '../models/update-document';
import { Subject } from 'rxjs/internal/Subject';


@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection?: signalR.HubConnection;
  private readonly documentUpdateSubject=new Subject<UpdateDocument>();

  public readonly documentUpdate$ = this.documentUpdateSubject.asObservable();
  async startConnection(): Promise<void> {
    //if the connection is already established? if yes then return;
    if(this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {

        return;
    }
    //Create a connection
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7197/hubs/document')
      .withAutomaticReconnect().build();

      try
      {
         await this.hubConnection.start();
         console.log('SignalR connection established.');
      }
       catch (error) {

      console.error('SignalR Connection Failed', error);

    }
  }
   async JoinDocumentGroup(documentId: string): Promise<void> {
    if (!this.hubConnection) {
        return;
    }

    await this.hubConnection.invoke(
        "JoinDocument",
        documentId
    );

    console.log(`Joined document ${documentId}`);
}

async SendDocumentUpdate(document:UpdateDocument):Promise<void>
{
    if(!this.hubConnection)
    {
        return;
    }
    await this.hubConnection.invoke(
        "SendDocumentUpdate",
        document
    );
    console.log(`Document update sent for document ${document.id}`);
}
registerDocumentUpdateListener():void
{
    if(!this.hubConnection)
    {
        return;
    }
    this.hubConnection.on("ReceiveDocumentUpdate",update=>
    {
        this.documentUpdateSubject.next(update);
    }
    )
}



}