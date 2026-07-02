using CollaborativeDocs.Application.Interfaces.Repositories;
using MediatR;
using CollaborativeDocs.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Commands.UpdateDocument
{
    public class UpdateDocumentHandler:IRequestHandler<UpdateDocumentCommand,bool>
    {
        private readonly IDocumentRepository _repository;
        public UpdateDocumentHandler(IDocumentRepository repository)
        {
            _repository = repository;   
        }
        public async Task<bool> Handle(UpdateDocumentCommand request, CancellationToken cancellationToken)
        {
            var document = await _repository.GetByIdAsync(request.id, cancellationToken);
            if (document is null)
            {
                return false;
            }
            document.UpdateTitle(request.title);
            await _repository.UpdateAsync(document, cancellationToken);
            return true;
        }
    }
}
