using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Commands.DeleteDocument
{
    public record DeleteDocumentCommand(Guid id):IRequest<bool>;

}
