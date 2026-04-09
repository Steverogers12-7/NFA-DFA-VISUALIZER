function convert() {
    try {
        let start = document.getElementById("start").value.trim();
        let finalStates = document.getElementById("final").value.split(",").map(f => f.trim());
        let lines = document.getElementById("transitions").value.trim().split("\n");

        let statesSet = new Set();
        let alphabetSet = new Set();
        let nfa = {};

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

        states.forEach(s => {
            nfa[s] = {};
            alphabet.forEach(a => nfa[s][a] = []);
        });

        lines.forEach(l => {
            if (l.includes("=")) {
                let [left, right] = l.split("=");
                let [state, symbol] = left.split(",").map(x => x.trim());
                nfa[state][symbol] = right.split(",").map(x => x.trim());
            }
        });

        // ── SUBSET CONSTRUCTION ──
       // ── SUBSET CONSTRUCTION ──
let queue   = [[start]];
let visited = [[start]];
let dfa     = {};
let steps   = "";
let stepNum = 1;

while (queue.length > 0) {
    let current = queue.shift();
    let name    = current.join("");
    
    steps += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    steps += `STEP ${stepNum}: Processing State { ${current.join(", ")} }\n`;
    steps += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

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
            steps += `\n→ On input '${symbol}': No transition → ∅\n`;
        } else {
            let next = newState.join("");
            dfa[name][symbol] = next;

            steps += `\n→ On input '${symbol}': { ${current.join(", ")} } → { ${newState.join(", ")} }\n`;

            let exists = visited.some(v => v.join("") === next);
            if (!exists) {
                visited.push(newState);
                queue.push(newState);
                steps += `   ✔ New DFA state discovered → { ${newState.join(", ")} }\n`;
            } else {
                steps += `   ↺ Already visited\n`;
            }
        }
    });

    stepNum++;
}

document.getElementById("steps").textContent = steps;

        // ── DFA TABLE ──
        let tableHTML = `<table class="modern-table">
            <thead><tr><th>DFA State</th>`;
        alphabet.forEach(a => tableHTML += `<th>${a}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        for (let state in dfa) {
            let isFinal = finalStates.some(f => state.includes(f));
            let stateDisplay = isFinal
                ? `<td class="final-state">{ ${state} } ✦</td>`
                : `<td>{ ${state} }</td>`;
            tableHTML += `<tr>${stateDisplay}`;
            alphabet.forEach(a => {
                let next = dfa[state][a];
                if (next === "∅") {
                    tableHTML += `<td class="empty-state">∅</td>`;
                } else {
                    let nextFinal = finalStates.some(f => next.includes(f));
                    tableHTML += `<td ${nextFinal ? 'class="final-state"' : ''}>{  ${next}  }</td>`;
                }
            });
            tableHTML += `</tr>`;
        }

        tableHTML += `</tbody></table>`;
        document.getElementById("dfaTable").innerHTML = tableHTML;

        saveNFA(nfa, start, finalStates);
        saveDFA(dfa, start, finalStates);

    } catch (e) {
        console.error(e);
        alert("Input format is incorrect. Please check the format and try again.");
    }
}

// ── SAVE NFA DOT ──
function saveNFA(nfa, start, finalStates) {
    let dot = `digraph NFA {
rankdir=LR;
bgcolor="transparent";
node [fontname="Fira Code, monospace" fontsize=13 fontcolor="#e2e8f0"
      style=filled fillcolor="#1e293b" color="#6366f1" penwidth=2];
edge [fontname="Fira Code, monospace" fontsize=12 color="#818cf8" fontcolor="#a5b4fc" arrowsize=0.9];
start [shape=point color="#6366f1" fillcolor="#6366f1" width=0.2];
start -> ${start} [color="#6366f1"];
`;
    finalStates.forEach(f => {
        dot += `${f} [shape=doublecircle color="#10b981" fillcolor="#0f2a1e" fontcolor="#6ee7b7"];\n`;
    });
    for (let s in nfa) {
        for (let a in nfa[s]) {
            nfa[s][a].forEach(t => {
                dot += `${s} -> ${t} [label=" ${a} "];\n`;
            });
        }
    }
    dot += "}";
    localStorage.setItem("nfaGraphDOT", dot);
}

// ── SAVE DFA DOT ──
function saveDFA(dfa, start, finalStates) {
    let dot = `digraph DFA {
rankdir=LR;
bgcolor="transparent";
node [fontname="Fira Code, monospace" fontsize=13 fontcolor="#e2e8f0"
      style=filled fillcolor="#1e293b" color="#6366f1" penwidth=2];
edge [fontname="Fira Code, monospace" fontsize=12 color="#818cf8" fontcolor="#a5b4fc" arrowsize=0.9];
start [shape=point color="#6366f1" fillcolor="#6366f1" width=0.2];
start -> "${start}" [color="#6366f1"];
`;
    Object.keys(dfa).forEach(s => {
        let isFinal = finalStates.some(f => s.includes(f));
        if (isFinal) {
            dot += `"${s}" [shape=doublecircle color="#10b981" fillcolor="#0f2a1e" fontcolor="#6ee7b7"];\n`;
        }
    });
    for (let s in dfa) {
        for (let a in dfa[s]) {
            let t = dfa[s][a];
            if (t !== "∅") {
                dot += `"${s}" -> "${t}" [label=" ${a} "];\n`;
            }
        }
    }
    dot += "}";
    localStorage.setItem("dfaGraphDOT", dot);
}

// ── EXAMPLE GRAPH ──
function loadExampleGraph() {
    let dot = `digraph NFA {
rankdir=LR;
bgcolor="transparent";
node [fontname="Fira Code, monospace" fontsize=12 fontcolor="#e2e8f0"
      style=filled fillcolor="#1e293b" color="#6366f1" penwidth=2];
edge [fontname="Fira Code, monospace" fontsize=11 color="#818cf8" fontcolor="#a5b4fc" arrowsize=0.8];
start [shape=point color="#6366f1" fillcolor="#6366f1" width=0.15];
start -> q0;
q2 [shape=doublecircle color="#10b981" fillcolor="#0f2a1e" fontcolor="#6ee7b7"];
q0 -> q0 [label=" 0,1 "];
q0 -> q1 [label=" 0 "];
q1 -> q2 [label=" 0 "];
q2 -> q2 [label=" 1 "];
}`;
    let viz = new Viz();
    viz.renderSVGElement(dot).then(svg => {
        let c = document.getElementById("exampleGraph");
        if (c) { c.innerHTML = ""; c.appendChild(svg); }
    }).catch(console.error);
}
