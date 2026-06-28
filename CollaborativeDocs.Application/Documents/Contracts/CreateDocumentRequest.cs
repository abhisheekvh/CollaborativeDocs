using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Contracts
{
    public class CreateDocumentRequest
    {
        public string Title { get; set; } = string.Empty;
    }
}
