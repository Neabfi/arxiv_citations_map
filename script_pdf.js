var __PDF_DOC,
    __CURRENT_PAGE,
    __TOTAL_PAGES,
    __PAGE_RENDERING_IN_PROGRESS = 0,
    __CANVAS = $('#pdf-canvas').get(0),
    __CANVAS_CTX = __CANVAS.getContext('2d');


function showPDF(paper, cy, resolve) {

    cytoscape.stylesheet().selector('#n0').css();

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
        var scale_required = __CANVAS.width / page.getViewport(1).width;

        // Get viewport of the page at required scale
        var viewport = page.getViewport(scale_required);

        // Set canvas height
        __CANVAS.height = viewport.height;

        var renderContext = {
            canvasContext: __CANVAS_CTX,
            viewport: viewport
        };

        // Render the page contents in the canvas
        page.render(renderContext).then(function () {
            resolve(__CANVAS.toDataURL('image/png'));
        });
        // page.render(renderContext).then(function () {
        //     __PAGE_RENDERING_IN_PROGRESS = 0;
        //
        //
        //     cy.add([
        //         {
        //             group: "nodes",
        //             data: {
        //                 id: paper.id,
        //             },
        //             style: {
        //                 'label': paper.title,
        //                 'shape': 'square',
        //                 'width': '149px',
        //                 'height': '211px',
        //                 'background-image': __CANVAS.toDataURL('image/png'),
        //                 "text-valign": "bottom",
        //                 'text-margin-y': '10px',
        //                 "text-wrap": "wrap",
        //                 "text-max-width": 300
        //             }
        //         }]
        //     );
        //
        //
        //     var layout = cy.layout({
        //         name: 'breadthfirst',
        //         directed: true,
        //         padding: 0.1,
        //         spacingFactor: 0.8
        //     });
        //     layout.run();
        //
        //     // FOR CITATION
        //     gettext(paper.url).then(function (text) {
        //         paper.text = text.toLowerCase().replace(/\s|,|:|-/g, '');
        //
        //
        //         papers.forEach(function (p) {
        //
        //
        //             if (p.title !== paper.title) {
        //
        //                 if (p.text.indexOf(paper.title.replace(/\s|,|:|-/g, '').toLowerCase().trim()) >= 0) {
        //
        //
        //                     cy.add([
        //                             {
        //                                 group: "edges",
        //                                 data: {source: paper.id, target: p.id}
        //                             }
        //                         ]
        //                     );
        //
        //                     var layout = cy.layout({
        //                         name: 'breadthfirst',
        //                         directed: true,
        //                         padding: 1,
        //                         spacingFactor: 1.75
        //
        //
        //                     });
        //                     layout.run();
        //                 }
        //
        //                 if (paper.text.indexOf(p.title.replace(/\s|,|:|-/g, '').toLowerCase().trim()) >= 0) {
        //                     cy.add([
        //                             {
        //                                 group: "edges",
        //                                 data: {source: p.id, target: paper.id}
        //                             }
        //                         ]
        //                     );
        //
        //                     var layout = cy.layout({
        //                         name: 'breadthfirst',
        //                         directed: true,
        //                         padding: 0.1,
        //                         spacingFactor: 1.75
        //
        //
        //                     });
        //                     layout.run();
        //                 }
        //             }
        //         });
        //     }, function (reason) {
        //         console.error(reason);
        //     });
        // });
    });


    function gettext(pdfUrl) {
        var pdf = PDFJS.getDocument(pdfUrl);
        return pdf.then(function (pdf) { // get all pages text
            var maxPages = pdf.pdfInfo.numPages;
            var countPromises = []; // collecting all page promises
            for (var j = 1; j <= maxPages; j++) {
                var page = pdf.getPage(j);

                var txt = "";
                countPromises.push(page.then(function (page) { // add page promise
                    var textContent = page.getTextContent();
                    return textContent.then(function (text) { // return content promise
                        return text.items.map(function (s) {
                            return s.str;
                        }).join(''); // value page text

                    });
                }));
            }
            // Wait for all pages and join text
            return Promise.all(countPromises).then(function (texts) {

                return texts.join('');
            });
        });
    }


}
