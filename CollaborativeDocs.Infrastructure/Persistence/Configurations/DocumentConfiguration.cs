using CollaborativeDocs.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CollaborativeDocs.Infrastructure.Persistence.Configurations
{
    public class DocumentConfiguration:IEntityTypeConfiguration<DomainDocument>
    {
        public void Configure(EntityTypeBuilder<DomainDocument> builder)
        {
            builder.ToTable("Documents");
            builder.HasKey(e => e.Id);
            builder.Property(t => t.Title).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Content).IsRequired();
            builder.Property(d => d.IsDeleted).HasDefaultValue(false);
        }
    }
}
