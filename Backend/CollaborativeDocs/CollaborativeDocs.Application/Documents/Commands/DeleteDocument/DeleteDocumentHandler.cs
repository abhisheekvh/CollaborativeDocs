using CollaborativeDocs.Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Commands.DeleteDocument
{
    public class DeleteDocumentHandler:IRequestHandler<DeleteDocumentCommand,bool>
    {
        private readonly IDocumentRepository _repository;
        public DeleteDocumentHandler(IDocumentRepository repository)
        {
            _repository = repository;
        }
        public async Task<bool> Handle(DeleteDocumentCommand request, CancellationToken cancellationToken)
        {
            var document = await _repository.GetByIdAsync(request.id, cancellationToken);
            if(document is null)
            {
                return false;
            }
            document.Delete();
            await _repository.DeleteAsync(document, cancellationToken);
            return true;
        }
    }
}
