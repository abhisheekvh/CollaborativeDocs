using CollaborativeDocs.Application.Documents.Contracts;
using MediatR;

namespace CollaborativeDocs.Application.Documents.Queries.GetDocumentById
{
    public  record GetDocumentByIdQuery(Guid id):IRequest<DocumentResponse?>;
    
}
