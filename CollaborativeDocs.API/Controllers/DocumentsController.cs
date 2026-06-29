using CollaborativeDocs.Application.Documents.Commands.CreateDocument;
using CollaborativeDocs.Application.Documents.Contracts;
using CollaborativeDocs.Application.Documents.Queries;
using CollaborativeDocs.Application.Documents.Queries.GetAllDocuments;
using CollaborativeDocs.Application.Documents.Queries.GetDocumentById;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;
using System.Threading.Tasks;

namespace CollaborativeDocs.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DocumentsController(IMediator handler)
        {
            _mediator = handler;
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateDocumentCommand command, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(command, cancellationToken);

            return CreatedAtAction(nameof(GetById), new
            {
                id = response.Id
            }, response);
        }
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(new GetDocumentByIdQuery(id),cancellationToken);

            if (response is null)
                return NotFound();

            return Ok(response);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var response = await _mediator.Send(new GetAllDocumentsQuery(), cancellationToken);
            return Ok(response);
        }


    }
}
