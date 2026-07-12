using CollaborativeDocs.Application.Documents.Contracts;
using Microsoft.AspNetCore.SignalR;

namespace CollaborativeDocs.API.Hubs
{
    public class DocumentHub:Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Disconnected: {Context.ConnectionId}");

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinDocument(string documentId)
        {
            var groupName = $"document-{documentId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"{Context.ConnectionId} Joined: {groupName}");
        }
        public async Task LeaveDocument(string documentId)
        {
            var groupName = $"document-{documentId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"{Context.ConnectionId} left {groupName}");
        }
        public async Task SendDocumentUpdate(DocumentUpdateDto document)
        {
            var groupName = $"document-{document.DocumentId}";
            await Clients.OthersInGroup(groupName).SendAsync("ReceiveDocumentUpdate", document);
        }
    }
}
