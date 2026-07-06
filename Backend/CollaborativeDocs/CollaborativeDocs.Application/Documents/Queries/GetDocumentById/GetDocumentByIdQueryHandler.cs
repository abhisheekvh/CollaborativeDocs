using CollaborativeDocs.Application.Documents.Contracts;
using CollaborativeDocs.Application.Interfaces.Repositories;
using CollaborativeDocs.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Queries.GetDocumentById
{
    public class GetDocumentByIdQueryHandler:IRequestHandler<GetDocumentByIdQuery, DocumentResponse?>
    {
        private readonly IDocumentRepository _repository;

        public GetDocumentByIdQueryHandler(IDocumentRepository documentRepository)
        {
            _repository = documentRepository;
        }
        public async Task<DocumentResponse?> Handle(GetDocumentByIdQuery request, CancellationToken cancellationToken)
        {
            var document = await _repository.GetByIdAsync(request.id, cancellationToken);
            if(document==null)
            {
                return null;
            }
            return new DocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content=document.Content,
            };
        }
    }
}
