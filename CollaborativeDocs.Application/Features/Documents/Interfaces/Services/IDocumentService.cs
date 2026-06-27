using CollaborativeDocs.Application.Features.Documents.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Features.Documents.Interfaces.Services
{
    public interface IDocumentService
    {
        Task<DocumentResponse> CreateAsync(CreateDocumentRequest createDocumentRequest);
    }
}
