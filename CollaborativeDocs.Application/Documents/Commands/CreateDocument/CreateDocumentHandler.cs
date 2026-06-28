using CollaborativeDocs.Application.Documents.Contracts;
using CollaborativeDocs.Application.Interfaces.Repositories;
using CollaborativeDocs.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Commands.CreateDocument
{
    public class CreateDocumentHandler
    {
        private readonly IDocumentRepository _documentRepository;
        public CreateDocumentHandler(IDocumentRepository documentRepository)
        {
            _documentRepository= documentRepository;
        }
        public async Task<DocumentResponse> HandleAsync(CreateDocumentRequest request, CancellationToken cancellationToken)
        {
            DomainDocument domainDocument = new DomainDocument(request.Title);

            var createdDocument=await _documentRepository.CreateAsync(domainDocument, cancellationToken);

            return new DocumentResponse
            {
                Id = createdDocument.Id,
                Title = createdDocument.Title,
            };
        }
    }
}
