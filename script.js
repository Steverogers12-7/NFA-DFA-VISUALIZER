function convert() {
    try {
        // Inputs ko read karna
        let statesInput = document.getElementById("states").value.trim();
        let alphabetInput = document.getElementById("alphabet").value.trim();
        let startInput = document.getElementById("start").value.trim();
        let transInput = document.getElementById("transitions").value.trim();

        if (!statesInput || !alphabetInput || !startInput || !transInput) {
            alert("Fill all fields properly!");
            return;
        }

        let states = statesInput.split(",").map(s => s.trim());
        let alphabet = alphabetInput.split(",").map(a => a.trim());
        let start = startInput;
        let lines = transInput.split("\n");

        let nfa = {};
        states.forEach(s => {
            nfa[s] = {};
            alphabet.forEach(a => nfa[s][a] = []);
        });

        lines.forEach(l => {
            if (l.includes("=") && l.includes(",")) {
                let [left, right] = l.split("=");
                let [state, symbol] = left.split(",").map(x => x.trim());
                if (nfa[state] && nfa[state][symbol]) {
                    nfa[state][symbol] = right.split(",").map(x => x.trim());
                }
            }
        });

        let queue = [[start]];
        let visited = [[start]];
        let dfa = {};
        let steps = "";

        while (queue.length > 0) {
            let current = queue.shift();
            let name = current.join("");
            steps += `Processing {${current.join(", ")}}\n`;
            dfa[name] = {};

            alphabet.forEach(symbol => {
                let newSet = new Set();
                current.forEach(s => {
                    if (nfa[s] && nfa[s][symbol]) {
                        nfa[s][symbol].forEach(t => newSet.add(t));
                    }
                });

                let newState = [...newSet].sort();
                
                // FIX: 'return' ki jagah sirf skip karna hai agar empty ho
                if (newState.length === 0) {
                    dfa[name][symbol] = "∅"; 
                    steps += `  → Input '${symbol}': No transitions (Dead state)\n`;
                } else {
                    let nextStateName = newState.join("");
                    dfa[name][symbol] = nextStateName;
                    steps += `  → Input '${symbol}': {${current.join(", ")}} moves to {${newState.join(", ")}}\n`;

                    let exists = visited.some(v => v.join("") === nextStateName);
                    if (!exists) {
                        visited.push(newState);
                        queue.push(newState);
                    }
                }
            });
            steps += "\n-----------------------------------\n";
        }

        // Display Results
        document.getElementById("steps").innerText = steps;

        // Render Table
        let tableHTML = `<table class="modern-table">
            <thead>
                <tr>
                    <th>DFA State</th>`;
        alphabet.forEach(a => { tableHTML += `<th>Input: ${a}</th>`; });
        tableHTML += `</tr></thead><tbody>`;

        for (let state in dfa) {
            tableHTML += `<tr><td class="state-name">{${state}}</td>`;
            alphabet.forEach(a => {
                let next = dfa[state][a];
                tableHTML += `<td>${next === "∅" ? "∅" : "{" + next + "}"}</td>`;
            });
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody></table>`;
        document.getElementById("dfaTable").innerHTML = tableHTML;

        // Draw Graphs
        drawNFA(nfa, states, alphabet);
        drawDFA(dfa);

    } catch (error) {
        console.error(error);
        alert("Kuch galat hai! Transitions check karo (Format: q0,0=q1)");
    }
}



function drawNFA(nfa, states, alphabet) {
    let elements = [];
    states.forEach(s => elements.push({ data: { id: s } }));
    states.forEach(s => {
        alphabet.forEach(a => {
            if (nfa[s] && nfa[s][a]) {
                nfa[s][a].forEach(t => {
                    elements.push({ data: { source: s, target: t, label: a } });
                });
            }
        });
    });
    renderGraph('nfaGraph', elements, '#2196f3');
}

function drawDFA(dfa) {
    let elements = [];
    Object.keys(dfa).forEach(s => elements.push({ data: { id: s } }));
    Object.keys(dfa).forEach(s => {
        Object.keys(dfa[s]).forEach(symbol => {
            if (dfa[s][symbol] !== "∅") {
                elements.push({ data: { source: s, target: dfa[s][symbol], label: symbol } });
            }
        });
    });
    renderGraph('dfaGraph', elements, '#4caf50');
}

function renderGraph(id, elements, color) {
    cytoscape({
        container: document.getElementById(id),
        elements: elements,
        
        // --- Fix for Zoom/Gayab hona ---
        zoomingEnabled: false,      
        panningEnabled: false,      
        userZoomingEnabled: false,  
        autoungrabify: true,        

        style: [
            { 
                selector: 'node', 
                style: { 
                    'label': 'data(id)', 
                    'background-color': color, 
                    'color': '#fff', 
                    'text-valign': 'center', 
                    'text-halign': 'center', 
                    'width': '65px', 
                    'height': '65px', 
                    'font-size': '18px', /* Bada font */
                    'font-weight': 'bold'
                } 
            },
            { 
                selector: 'edge', 
                style: { 
                    'label': 'data(label)', 
                    'target-arrow-shape': 'triangle', 
                    'curve-style': 'bezier', 
                    'line-color': '#444', 
                    'target-arrow-color': '#444', 
                    'font-size': '16px', 
                    'text-margin-y': '-12px',
                    'width': 2.5, /* Line thodi moti */
                    'arrow-scale': 1.5
                } 
            }
        ],
        layout: { 
            name: 'circle', 
            padding: 60 
        }
    });
}
