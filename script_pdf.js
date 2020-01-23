var __PDF_DOC,
    __CURRENT_PAGE,
    __TOTAL_PAGES,
    __PAGE_RENDERING_IN_PROGRESS = 0,
    __CANVAS = $('#pdf-canvas').get(0),
    __CANVAS_CTX = __CANVAS.getContext('2d');


function showPDF(paper, cy, resolve) {

    PDFJS.getDocument({url: paper.pdfUrl}).then((pdf_doc) => {
        __PDF_DOC = pdf_doc;
        __TOTAL_PAGES = __PDF_DOC.numPages;

        return showPage(1, cy, paper, resolve);
    }).catch(function (error) {
        alert(error.message);
    });
}

function showPage(page_no, cy, paper, resolve) {
    __PAGE_RENDERING_IN_PROGRESS = 1;
    __CURRENT_PAGE = page_no;
    // Fetch the page
    __PDF_DOC.getPage(page_no).then(function (page) {

        // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
        let scale_required = __CANVAS.width / page.getViewport(1).width;

        // Get viewport of the page at required scale
        let viewport = page.getViewport(scale_required);

        // Set canvas height
        __CANVAS.height = viewport.height;

        let renderContext = {
            canvasContext: __CANVAS_CTX,
            viewport: viewport
        };

        // Render the page contents in the canvas
        page.render(renderContext).then(function () {
            resolve(__CANVAS.toDataURL('image/png'));
        });
    });
}
