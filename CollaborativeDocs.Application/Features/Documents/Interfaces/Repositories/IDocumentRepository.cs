using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;
using CollaborativeDocs.Domain.Entities;

namespace CollaborativeDocs.Application.Features.Documents.Interfaces.Repositories
{
    public interface IDocumentRepository
    {
        Task<DomainDocument> AddAsync(DomainDocument document);
        Task SaveChangesAsync();
    }
}
