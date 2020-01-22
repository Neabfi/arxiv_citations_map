class Paper {

    static CreatePaper(url, graph) {
        if (!this.isUrlValid(url) || this.isPaperDuplicated(url, graph.papers)) {
            return null;
        }
        return new Paper(url, graph)
    }

    static isUrlValid(url) {
        if (url.indexOf('arxiv.org/abs') < 0) {
            swal({
                position: 'top',
                title: 'This is not a valid arXiv link (Do not use directly the PDF).',
                showConfirmButton: false,
            });
            return false;
        }
        return true;
    }

    static isPaperDuplicated(url, papers) {
        if (papers.some(e => e.arxivUrl === url)) {
            swal({
                position: 'top',
                title: 'This paper is already added.',
                showConfirmButton: false,
            });
            return true;
        }
        return false;
    }

    constructor(url, graph) {
        this.arxivUrl = url;
        this.arxivId = url.split('/').pop();
        this.pdfUrl = 'https://arxiv.org/pdf/' + this.arxivId + '.pdf';

        let promises = [
            this.semanticscholarGetInfos(),
            this.getThumbnail()
        ];

        Promise.all(promises).then((sucess) => {
            this.thumbnail = sucess[1];
            this.add(graph);
        }, function (err) {
            console.error('ERROR')
        });

    }

    semanticscholarGetInfos() {
        return new Promise((resolve, reject) => {
            let that = this;
            $.get({
                url: 'http://api.semanticscholar.org/v1/paper/arXiv:' + this.arxivId,
                success: (res) => {
                    that.title = res.title;
                    that.references = new Set(res.references.map(reference => reference.arxivId));
                    that.citations = new Set(res.citations.map(citation => citation.arxivId));
                    resolve();
                }
            });
        })
    }

    getThumbnail() {
        return new Promise((resolve, reject) => {
            showPDF(this, cy, resolve);
        });
    }

    add(graph) {

        ///*
        //   Add the node
        ///*
        graph.cy.add([
            {
                group: "nodes",
                data: {
                    id: this.arxivId.replace('.', '-'),
                },
                style: {
                    'label': this.title,
                    'shape': 'square',
                    'width': '149px',
                    'height': '211px',
                    'background-image': this.thumbnail,
                    "text-valign": "bottom",
                    'text-margin-y': '10px',
                    "text-wrap": "wrap",
                    "text-max-width": 300
                }
            }]
        );

        ///*
        //   Add the edges
        ///*

        for (let i = 0; i < graph.papers.length; i++) {
            if (graph.papers[i].references.has(this.arxivId)) {
                graph.cy.add([
                        {
                            group: "edges",
                            data: {source: this.arxivId.replace('.', '-'), target: graph.papers[i].arxivId.replace('.', '-')}
                        }
                    ]
                );
            }

            if (graph.papers[i].citations.has(this.arxivId)) {
                graph.cy.add([
                        {
                            group: "edges",
                            data: {source: graph.papers[i].arxivId.replace('.', '-'), target: this.arxivId.replace('.', '-')}
                        }
                    ]
                );
            }
        }

        graph.papers.push(this);
        graph.refresh();

        $('#form_text').removeAttr("disabled");
        $('#form_submit').removeAttr("disabled");
        $('#loader').hide();
    }
}