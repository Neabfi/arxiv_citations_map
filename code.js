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
            padding: 10,
        },
        zoom:{
            level: 10
        }
    });

    ////
    //  Right click on nodes
    ////
    cy.on('cxttap', 'node', function () {

        let paperid = this.id();

        cy.remove(cy.elements("node#" + paperid.replace('.', '-') + "]"));

        console.log(paperid)
        papers = papers.filter(function (paper) {
            console.log(paper.arxivId);
            return paper.arxivId !== paperid;
        });


        // Refresh graph
        var layout = cy.layout({
            name: 'breadthfirst',
            directed: true,
            padding: 1,
            spacingFactor: 1.75
        });
        layout.run();
        console.log(papers.length);
        if(papers.length === 0) {
            cy.fit(cy.filter('node'), 250);
        } else if(papers.length < 4) {
            cy.fit(cy.filter('node'), 150);
        }

    });


    ////
    // Add a paper
    ////
    $('#form').submit(function (event) {
        event.preventDefault();
        $('#form_text').prop("disabled", true);
        $('#form_submit').prop("disabled", true);
        $('#loader').show().css("display", 'inline-block');

        let form_text = $('#form_text');
        let url = form_text.val();
        form_text.val('');

        let paper = Paper.CreatePaper(url, papers, cy);

        console.log(paper);
        if (paper == null) {
            $('#form_text').removeAttr("disabled");
            $('#form_submit').removeAttr("disabled");
            $('#loader').hide();
            return;
        }

    });
});


