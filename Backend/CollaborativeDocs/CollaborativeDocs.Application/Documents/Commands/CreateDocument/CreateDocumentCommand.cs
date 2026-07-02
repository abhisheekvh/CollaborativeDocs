using CollaborativeDocs.Application.Documents.Contracts;
using MediatR;

namespace CollaborativeDocs.Application.Documents.Commands.CreateDocument;

public record CreateDocumentCommand(string Title): IRequest<DocumentResponse>;