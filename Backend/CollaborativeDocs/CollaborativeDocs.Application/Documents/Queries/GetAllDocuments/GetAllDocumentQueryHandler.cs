using CollaborativeDocs.Application.Documents.Contracts;
using CollaborativeDocs.Application.Interfaces.Repositories;
using MediatR;

namespace CollaborativeDocs.Application.Documents.Queries.GetAllDocuments
{
    public class GetAllDocumentQueryHandler:IRequestHandler<GetAllDocumentsQuery, List<DocumentResponse>>
    {
        private readonly IDocumentRepository _repository;
        public GetAllDocumentQueryHandler(IDocumentRepository documentRepository)
        {
            _repository = documentRepository;
        }
        public async Task<List<DocumentResponse>> Handle(GetAllDocumentsQuery request, CancellationToken cancellationToken)
        {
            var Documents=await _repository.GetAllAsync(cancellationToken);
            return Documents.Select(x => new DocumentResponse
            {
                Id = x.Id,
                Title = x.Title
            }).ToList();
        }
    }
   
}
