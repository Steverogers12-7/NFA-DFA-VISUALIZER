function convert() {
    try {
        let start = document.getElementById("start").value.trim();
        let finalStates = document.getElementById("final").value.split(",").map(f => f.trim());
        let lines = document.getElementById("transitions").value.trim().split("\n");

        let statesSet = new Set();
        let alphabetSet = new Set();
        let nfa = {};

        // AUTO DETECT STATES + ALPHABET
        lines.forEach(l => {
            if (l.includes("=")) {
                let [left, right] = l.split("=");
                let [state, symbol] = left.split(",").map(x => x.trim());

                statesSet.add(state);
                alphabetSet.add(symbol);

                right.split(",").forEach(s => statesSet.add(s.trim()));
            }
        });

        let states = [...statesSet];
        let alphabet = [...alphabetSet];

        // INIT NFA
        states.forEach(s => {
            nfa[s] = {};
            alphabet.forEach(a => nfa[s][a] = []);
        });

        // FILL TRANSITIONS
        lines.forEach(l => {
            if (l.includes("=")) {
                let [left, right] = l.split("=");
                let [state, symbol] = left.split(",").map(x => x.trim());

                nfa[state][symbol] = right.split(",").map(x => x.trim());
            }
        });

        // SUBSET CONSTRUCTION
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

                if (newState.length === 0) {
                    dfa[name][symbol] = "∅";
                    steps += `  → '${symbol}' → ∅\n`;
                } else {
                    let next = newState.join("");
                    dfa[name][symbol] = next;

                    steps += `  → '${symbol}' → {${newState.join(", ")}}\n`;

                    let exists = visited.some(v => v.join("") === next);
                    if (!exists) {
                        visited.push(newState);
                        queue.push(newState);
                    }
                }
            });

            steps += "----------------------\n";
        }

        document.getElementById("steps").innerText = steps;

        // DFA TABLE
        let tableHTML = `<table class="modern-table">
            <thead>
                <tr>
                    <th>DFA State</th>`;

        alphabet.forEach(a => tableHTML += `<th>${a}</th>`);

        tableHTML += `</tr></thead><tbody>`;

        for (let state in dfa) {
            tableHTML += `<tr><td>{${state}}</td>`;
            alphabet.forEach(a => {
                let next = dfa[state][a];
                tableHTML += `<td>${next === "∅" ? "∅" : "{" + next + "}"}</td>`;
            });
            tableHTML += `</tr>`;
        }

        tableHTML += `</tbody></table>`;
        document.getElementById("dfaTable").innerHTML = tableHTML;

        // SAVE GRAPHS
        saveNFA(nfa, start, finalStates);
        saveDFA(dfa, start, finalStates);

        //alert("Conversion Done! Now click View Graphs");

    } catch (e) {
        console.error(e);
        alert("Input format galat hai!");
    }
}

// SAVE NFA GRAPH
function saveNFA(nfa, start, finalStates) {
    let dot = "digraph NFA {\nrankdir=LR;\n";

    dot += `start [shape=point];\n`;
    dot += `start -> ${start};\n`;

    finalStates.forEach(f => {
        dot += `${f} [shape=doublecircle];\n`;
    });

    for (let s in nfa) {
        for (let a in nfa[s]) {
            nfa[s][a].forEach(t => {
                dot += `${s} -> ${t} [label="${a}"];\n`;
            });
        }
    }

    dot += "}";

    localStorage.setItem("nfaGraphDOT", dot);
}

// SAVE DFA GRAPH
function saveDFA(dfa, start, finalStates) {
    let dot = "digraph DFA {\nrankdir=LR;\n";

    dot += `start [shape=point];\n`;
    dot += `start -> ${start};\n`;

    Object.keys(dfa).forEach(s => {
        let isFinal = finalStates.some(f => s.includes(f));
        if (isFinal) {
            dot += `"${s}" [shape=doublecircle];\n`;
        }
    });

    for (let s in dfa) {
        for (let a in dfa[s]) {
            let t = dfa[s][a];
            if (t !== "∅") {
                dot += `"${s}" -> "${t}" [label="${a}"];\n`;
            }
        }
    }

    dot += "}";

    localStorage.setItem("dfaGraphDOT", dot);
}

// ✅ STATIC EXAMPLE GRAPH (ONLY FOR INDEX PAGE)
function loadExampleGraph() {
    let dot = `
    digraph NFA {
        rankdir=LR;

        start [shape=point];
        start -> q0;

        q2 [shape=doublecircle];

        q0 -> q0 [label="0"];
        q0 -> q1 [label="0"];
        q0 -> q0 [label="1"];
        q1 -> q2 [label="0"];
        q2 -> q2 [label="1"];
    }
    `;

    let viz = new Viz();

    viz.renderSVGElement(dot).then(svg => {
        let container = document.getElementById("exampleGraph");
        if(container){
            container.innerHTML = "";
            container.appendChild(svg);
        }
    });
}
