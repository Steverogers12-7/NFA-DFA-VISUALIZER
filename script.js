function convert() {

    const states = document.getElementById("states").value.split(",");
    const alphabet = document.getElementById("alphabet").value.split(",");
    const start = document.getElementById("start").value;
    const final = document.getElementById("final").value.split("\n");

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

    // Cytoscape graph
    cytoscape({
        container: document.getElementById("nfaGraph"),

        elements: elements,

        style: [
            {
                selector: "node",
                style: {
                    "background-color": "#00ffcc",
                    "label": "data(id)",
                    "color": "#000",
                    "text-valign": "center",
                    "text-halign": "center"
                }
            },
            {
                selector: "edge",
                style: {
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle",
                    "line-color": "#00ffcc",
                    "target-arrow-color": "#00ffcc",
                    "label": "data(label)",
                    "font-size": "12px",
                    "text-background-color": "#121212",
                    "text-background-opacity": 1,
                    "text-background-padding": "3px",
                    "text-margin-y": "-10px"   // 🔥 SIDE OFFSET FIX
                }
            }
        ],

        layout: {
            name: "circle"
        }
    });

}
