using CollaborativeDocs.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Interfaces.Repositories
{
    public interface IDocumentRepository
    {
        Task<DomainDocument> CreateAsync(DomainDocument document, CancellationToken cancellationToken);
        
        
    }
}
