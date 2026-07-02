using CollaborativeDocs.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Domain.Entities
{
    public class DomainDocument: AuditableEntity
    {
        public string Title { get; private set; } = string.Empty;

        public string Content { get; private set; } = string.Empty;

        public bool IsDeleted { get; private set; }

        private DomainDocument()
        {
            // Required by EF Core
        }

        public DomainDocument(string title)
        {
            Title = title;
            Content = string.Empty;
        }

        public void UpdateContent(string content)
        {
            Content = content;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateTitle(string title)
        {
            Title = title;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Delete()
        {
            IsDeleted = true;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}

