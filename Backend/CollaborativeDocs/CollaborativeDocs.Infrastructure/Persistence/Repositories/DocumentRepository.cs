using CollaborativeDocs.Application.Interfaces.Repositories;
using CollaborativeDocs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
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
        public async Task<DomainDocument?> GetByIdAsync(Guid id,CancellationToken cancellationToken)
        {
            var document=  await _context.Documents.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken);
            return document;
        }

        public async Task<List<DomainDocument>> GetAllAsync(CancellationToken cancellationToken)
        {
            var documents = await _context.Documents.Where(x=>!x.IsDeleted).OrderByDescending(d => d.CreatedAt).ToListAsync();
            return documents;
        }
        public async Task UpdateAsync(DomainDocument document,CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        public async Task DeleteAsync(DomainDocument document, CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

    }
}
