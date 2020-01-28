class Graph {
    constructor() {

        this.papers = [];
        this.cy = cytoscape({
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
            zoom: {
                level: 10
            }
        });
    }

    refresh() {
        this.cy.layout({
            name: 'breadthfirst',
            directed: true,
            padding: 1,
            spacingFactor: 1.75
        }).run();
        if (this.papers.length === 0) {
            this.cy.fit(this.cy.filter('node'), 250);
        } else if (this.papers.length < 4) {
            this.cy.fit(this.cy.filter('node'), 150);
        }
    }

    load() {

    }


    save() {
        let text = "";
        this.papers.forEach((paper) => {
            text += (paper.arxivUrl + '\n')
        });

        $('#save_file').attr({
            href: "data:text/plain;charset=utf-8," + encodeURIComponent(text),
        })[0].click();
    }
}