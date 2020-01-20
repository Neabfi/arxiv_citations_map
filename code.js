$.ajaxPrefilter(function (options) {
    if (options.crossDomain && jQuery.support.cors) {
        var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
        options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
});

function uuid4() {
    const ho = (n, p) => n.toString(16).padStart(p, 0); /// Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const view = new DataView(new ArrayBuffer(16)); /// Create a view backed by a 16-byte buffer
    crypto.getRandomValues(new Uint8Array(view.buffer)); /// Fill the buffer with random data
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40); /// Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80); /// Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`; /// Compile the canonical textual form from the array data
}

var papers = [];

$(function () {

    ////
    //  cy init
    ////
    var cy = cytoscape({
        container: document.getElementById('cy'),
        boxSelectionEnabled: false,
        autounselectify: true,
        style: cytoscape.stylesheet()
            .selector('node')
            .css({
                'height': 80,
                'width': 80,
                'background-fit': 'cover',
                'border-color': '#000',
                'border-width': 3,
                'border-opacity': 0.5
            })
            .selector('edge')
            .css({
                'curve-style': 'bezier',
                'width': 6,
                'target-arrow-shape': 'triangle',
                'line-color': '#ffaaaa',
                'target-arrow-color': '#ffaaaa'
            }),
        elements: {
            nodes: [],
            edges: []
        },
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 10
        }
    });


    ////
    //  Right click on nodes
    ////
    cy.on('cxttap', 'node', function () {

        thisPaper = this.id();
        console.log(papers);


        cy.remove(cy.elements("node#" + thisPaper + "]"));


        papers = papers.filter(function (paper) {
            return paper.id != thisPaper;
        });

    });


    ////
    // Add a paper
    ////
    $('#form').submit(function (event) {
        event.preventDefault();

        let form_text = $('#form_text');
        let url = form_text.val();
        let pdf_url = 'https://arxiv.org/pdf/' + url.split('/').pop() + '.pdf'
        form_text.val('');

        // If not an arxiv link
        if (url.indexOf('arxiv.org/abs') < 0) {
            swal({
                position: 'top',
                icon: 'error',
                title: 'arXiv link required (not directly the pdf)',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }

        // If paper already added
        if (papers.some(e => e.url === pdf_url)) {
            swal({
                position: 'top',
                icon: 'error',
                title: 'This paper is already in the graph',
                showConfirmButton: false,
                timer: 1500
            });
            return;
        }
        
        $.get({
            url: url,
            success: function (res) {
                paper = {
                    'res': res,
                    'title': $('h1.title.mathjax', $(res))[0].innerText.slice(6),
                    'url': 'https://arxiv.org/pdf/' + url.split('/').pop() + '.pdf',
                    'id': uuid4()
                };
                papers.push(paper);
                showPDF(paper, cy);
            }
        });

    });
});


