using CollaborativeDocs.Application.Documents.Commands.CreateDocument;
using CollaborativeDocs.Application.Documents.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDocs.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly CreateDocumentHandler _handler;

        public DocumentsController(CreateDocumentHandler handler)
        {
            _handler = handler;
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateDocumentRequest createDocumentRequest, CancellationToken cancellationToken)
        {
            var response = await _handler.HandleAsync(createDocumentRequest, cancellationToken);

            return CreatedAtAction(nameof(GetBuId), new
            {
                id = response.Id
            }, response);
        }
        [HttpGet("{id:guid}")]
        public IActionResult GetBuId(Guid id)
        {
            return Ok();
        }

    }
}
