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


$(function () {

    ////
    //  cy init
    ////
    let graph = new Graph();


    ////
    //  Right click on nodes
    ////
    graph.cy.on('cxttap', 'node', function () {

        let paperid = this.id();

        graph.cy.remove(graph.cy.elements("node#" + paperid.replace('.', '-') + "]"));

        graph.papers = graph.papers.filter(function (paper) {
            return paper.arxivId !== paperid;
        });

        graph.refresh();

    });


    ////
    // Add a paper
    ////
    $('#form').submit((event) => {
        event.preventDefault();
        $('#form_text').prop("disabled", true);
        $('#form_submit').prop("disabled", true);
        $('#loader').show().css("display", 'inline-block');
        let form_text = $('#form_text');
        let url = form_text.val();
        form_text.val('');

        let paper = Paper.CreatePaper(url, graph);

        if (paper == null) {
            $('#form_text').removeAttr("disabled");
            $('#form_submit').removeAttr("disabled");
            $('#loader').hide();
            return;
        }

    });

    // Save
    $('#save_button').click((event) => {
        graph.save();
    });

    // Load
    $('#load_button').click(() => {
        $('#file_input').click();
    });

    $('#file_input').change(() => {

        let file = $('#file_input').prop('files')[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            reader.result.trim().split('\n').forEach((arxivUrl) => {
                Paper.CreatePaper(arxivUrl, graph);
            });
        };
        reader.readAsText(file)
    });


});


