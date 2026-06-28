using CollaborativeDocs.Application.Interfaces.Repositories;
using CollaborativeDocs.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Infrastructure.Persistence.Repositories
{
    public class DocumentRepository:IDocumentRepository
    {
        private readonly ApplicationDbContext _context;
        public DocumentRepository(ApplicationDbContext applicationDbContext) 
            => _context = applicationDbContext;

        public async Task<DomainDocument> CreateAsync(DomainDocument document, CancellationToken cancellationToken)
        {
            await _context.Documents.AddAsync(document,cancellationToken);
            await _context.SaveChangesAsync();
            return document;

        }

    }
}
