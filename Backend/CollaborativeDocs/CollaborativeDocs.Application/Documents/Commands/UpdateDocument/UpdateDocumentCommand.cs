using CollaborativeDocs.Application.Documents.Contracts;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Commands.UpdateDocument
{
    public record UpdateDocumentCommand(Guid id,string title):IRequest<bool>;
   
}
