using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Application.Documents.Contracts
{
    public class UserTypingDTO
    {
        public string? documentId { get; set; }
        public string? connectionId { get; set; }
        public string? userName { get; set; }
    }
}
