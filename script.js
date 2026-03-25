function convert() {

    const states = document.getElementById("states").value.split(",");
    const alphabet = document.getElementById("alphabet").value.split(",");
    const start = document.getElementById("start").value;
    const final = document.getElementById("final").value.split(",");

    const transitionsText = document.getElementById("transitions").value.trim().split("\n");

    let elements = [];

    // Nodes
    states.forEach(s => {
        elements.push({
            data: { id: s }
        });
    });

    // Edges
    transitionsText.forEach(line => {
        if (!line.trim()) return;

        let [left, right] = line.split("=");
        let [from, symbol] = left.split(",");
        let toStates = right.split(",");

        toStates.forEach(t => {
            elements.push({
                data: {
                    id: from + t + symbol,
                    source: from,
                    target: t,
                    label: symbol
                }
            });
        });
    });

    cytoscape({
        container: document.getElementById("nfaGraph"),

        elements: elements,

        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#00ffcc",
                    "label": "data(id)"
                }
            },
            {
                selector: "edge",
                style: {
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle",
                    "label": "data(label)"
                }
            }
        ],

        layout: {
            name: "circle"
        }
    });

}
