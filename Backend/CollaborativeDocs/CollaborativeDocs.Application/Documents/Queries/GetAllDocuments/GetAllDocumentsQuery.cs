using CollaborativeDocs.Application.Documents.Contracts;
using MediatR;


namespace CollaborativeDocs.Application.Documents.Queries.GetAllDocuments
{
    public record GetAllDocumentsQuery:IRequest<List<DocumentResponse>>;
    
}
