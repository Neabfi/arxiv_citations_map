class Paper {

    static CreatePaper(url, papers, cy) {
        if (!this.isUrlValid(url) || this.isPaperDuplicated(url, papers)) {
            return null;
        }
        return new Paper(url, papers, cy)
    }

    static isUrlValid(url) {
        if (url.indexOf('arxiv.org/abs') < 0) {
            swal({
                position: 'top',
                icon: 'error',
                title: 'arXiv link required (do not use the pdf\'s link)',
                showConfirmButton: false,
                timer: 1500
            });
            return false;
        }
        return true;
    }

    static isPaperDuplicated(url, papers) {
        if (papers.some(e => e.arxivUrl === url)) {
            swal({
                position: 'top',
                icon: 'error',
                title: 'This paper is already in the graph',
                showConfirmButton: false,
                timer: 1500
            });
            return true;
        }
        return false;
    }

    constructor(url, papers, cy) {
        this.arxivUrl = url;
        this.arxivId = url.split('/').pop();
        console.log(this.arxivId);
        this.pdfUrl = 'https://arxiv.org/pdf/' + this.arxivId + '.pdf';

        let promises = [
            this.semanticscholarGetInfos(),
            this.getThumbnail()
        ];

        Promise.all(promises).then((sucess) => {
            this.thumbnail = sucess[1];
            this.add(papers, cy);
            papers.push(this);
        }, function (err) {
            console.log('ERROR')
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

    add(papers, cy) {

        ///*
        //   Add the node
        ///*
        cy.add([
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

        console.log(papers)
        for(let i = 0; i < papers.length; i++) {
            if(papers[i].references.has(this.arxivId)) {
                console.log('references!')
                cy.add([
                        {
                            group: "edges",
                            data: {source: this.arxivId.replace('.', '-'), target: papers[i].arxivId.replace('.', '-')}
                        }
                    ]
                );
            }

            if(papers[i].citations.has(this.arxivId)) {
                console.log('citations!')
                cy.add([
                        {
                            group: "edges",
                            data: {source: papers[i].arxivId.replace('.', '-'), target: this.arxivId.replace('.', '-')}
                        }
                    ]
                );
            }
        }

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
            cy.fit(cy.$('#' + this.arxivId.replace('.', '-')), 250);
        } else if(papers.length < 4) {
            cy.fit(cy.filter('node'), 150);
        }
    }
}