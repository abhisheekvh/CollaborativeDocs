using CollaborativeDocs.Application.Documents.Contracts;
using CollaborativeDocs.Application.Interfaces.Repositories;
using CollaborativeDocs.Domain.Entities;
using MediatR;

namespace CollaborativeDocs.Application.Documents.Commands.CreateDocument;

public class CreateDocumentCommandHandler : IRequestHandler<CreateDocumentCommand, DocumentResponse>
{
    private readonly IDocumentRepository _repository;

    public CreateDocumentCommandHandler(IDocumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<DocumentResponse> Handle(CreateDocumentCommand request,CancellationToken cancellationToken)
    {
        var document = new DomainDocument(request.Title);

        await _repository.CreateAsync(document, cancellationToken);

        return new DocumentResponse
        {
            Id = document.Id,
            Title = document.Title
        };
    }
}