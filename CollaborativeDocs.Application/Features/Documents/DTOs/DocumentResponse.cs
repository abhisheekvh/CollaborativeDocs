using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Features.Documents.DTOs
{
    public class DocumentResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
    }
}
