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

        runSubsetConstruction(nfa, start, finalStates, alphabet);
        saveNFA(nfa, start, finalStates);

    } catch (e) {
        console.error(e);
        alert("Input format is incorrect. Please check the format and try again.");
    }
}

/* ── SUBSET CONSTRUCTION ────────────────────────────────────── */
function runSubsetConstruction(nfa, start, finalStates, alphabet) {
    let queue   = [[start]];
    let visited = [[start]];
    let dfa     = {};
    let stepData = [];
    let stepNum = 1;

    while (queue.length > 0) {
        let current = queue.shift();
        let name    = current.join("");
        dfa[name] = {};

        let stepTransitions = [];

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
                stepTransitions.push({ symbol, from: current, to: [], isDead: true, isNew: false });
            } else {
                let next = newState.join("");
                dfa[name][symbol] = next;
                let exists = visited.some(v => v.join("") === next);
                if (!exists) {
                    visited.push(newState);
                    queue.push(newState);
                }
                stepTransitions.push({ symbol, from: current, to: newState, isDead: false, isNew: !exists });
            }
        });

        stepData.push({
            num: stepNum,
            current,
            transitions: stepTransitions,
            isFinal: finalStates.some(f => current.includes(f))
        });
        stepNum++;
    }

    renderAnimatedSteps(stepData, finalStates);
    renderDFATable(dfa, finalStates, alphabet);
    saveDFA(dfa, start, finalStates);

    // ── Persist results so they survive navigation ──
    localStorage.setItem("savedStepsHTML",  document.getElementById("steps").innerHTML);
    localStorage.setItem("savedTableHTML",  document.getElementById("dfaTable").innerHTML);
    localStorage.setItem("savedInputStart", document.getElementById("start").value);
    localStorage.setItem("savedInputFinal", document.getElementById("final").value);
    localStorage.setItem("savedInputTrans", document.getElementById("transitions").value);
}

/* ── ANIMATED STEPS RENDERER ────────────────────────────────── */
function renderAnimatedSteps(stepData, finalStates) {
    const container = document.getElementById("steps");
    container.innerHTML = "";
    container.className = "";

    stepData.forEach((step, idx) => {
        const block = document.createElement("div");
        block.className = "step-block";
        block.style.animationDelay = `${idx * 0.18}s`;

        const currentLabel = `{ ${step.current.join(", ")} }`;
        const finalBadge = step.isFinal
            ? `<span class="final-badge">✦ Final</span>` : "";

        let transHTML = step.transitions.map(t => {
            if (t.isDead) {
                return `<div class="trans-row dead">
                    <span class="sym-pill">${t.symbol}</span>
                    <span class="arrow">→</span>
                    <span class="dead-state">∅</span>
                </div>`;
            }
            const toLabel = `{ ${t.to.join(", ")} }`;
            const badge = t.isNew
                ? `<span class="new-badge">✔ new</span>`
                : `<span class="old-badge">↺ visited</span>`;
            const isTgtFinal = finalStates.some(f => t.to.includes(f));
            const tgtClass = isTgtFinal ? "to-state final-state-pill" : "to-state";
            return `<div class="trans-row">
                <span class="sym-pill">${t.symbol}</span>
                <span class="arrow">→</span>
                <span class="${tgtClass}">${toLabel}</span>
                ${badge}
            </div>`;
        }).join("");

        const miniSVG = buildMiniStateSVG(step, finalStates);

        block.innerHTML = `
          <div class="step-layout">
            <div class="step-text-col">
              <div class="step-header">
                <span class="step-num">${step.num}</span>
                <span class="step-title">Processing <strong>${currentLabel}</strong></span>
                ${finalBadge}
              </div>
              <div class="trans-list">${transHTML}</div>
              <div class="step-divider"></div>
            </div>
            <div class="step-mini-col">
              ${miniSVG}
            </div>
          </div>`;

        container.appendChild(block);
    });
}

/* ── MINI SVG STATE DIAGRAM ─────────────────────────────────── */
function buildMiniStateSVG(step, finalStates) {
    const nodeSet = new Set(step.current.map(s => s));
    step.transitions.forEach(t => {
        if (!t.isDead) t.to.forEach(s => nodeSet.add(s));
    });
    const nodeList = [...nodeSet];
    const n = nodeList.length;
    if (n === 0) return "";

    const W = 300, H = 200;
    const cx = W / 2, cy = H / 2;
    const r = 28;

    const positions = {};
    if (n === 1) {
        positions[nodeList[0]] = [cx, cy];
    } else {
        const angStep = (2 * Math.PI) / n;
        const rad = Math.min(W, H) * 0.30;
        nodeList.forEach((nd, i) => {
            const angle = -Math.PI / 2 + i * angStep;
            positions[nd] = [cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)];
        });
    }

    const markerId = `arr${step.num}`;
    const glowId   = `glow${step.num}`;
    const glowGId  = `glowg${step.num}`;

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="mini-state-svg">
      <defs>
        <marker id="${markerId}" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="#818cf8"/>
        </marker>
        <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="${glowGId}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`;

    // Draw edges
    step.transitions.forEach(t => {
        if (t.isDead) return;
        t.to.forEach(target => {
            if (!positions[target]) return;
            const [x1, y1] = positions[t.from[0]] || [cx, cy];
            const [x2, y2] = positions[target];
            const stroke = t.isNew ? "#10b981" : "#818cf8";
            const isSelf = t.from[0] === target;

            if (isSelf) {
                svg += `<path d="M${x1-7},${y1-r} C${x1-30},${y1-55} ${x1+30},${y1-55} ${x1+7},${y1-r}"
                    fill="none" stroke="${stroke}" stroke-width="1.4"
                    marker-end="url(#${markerId})" class="edge-anim" opacity="0.9"/>
                <text x="${x1}" y="${y1-r-14}" text-anchor="middle" fill="#a5b4fc" font-size="12" font-family="Fira Code">${t.symbol}</text>`;
            } else {
                const dx = x2-x1, dy = y2-y1;
                const len = Math.sqrt(dx*dx+dy*dy) || 1;
                const ux = dx/len, uy = dy/len;
                const sx = x1+ux*r, sy = y1+uy*r;
                const ex = x2-ux*(r+3), ey = y2-uy*(r+3);
                const mx = (sx+ex)/2 - uy*12, my = (sy+ey)/2 + ux*12;
                svg += `<path d="M${sx},${sy} Q${mx},${my} ${ex},${ey}"
                    fill="none" stroke="${stroke}" stroke-width="1.4"
                    marker-end="url(#${markerId})" class="edge-anim" opacity="0.9"/>
                <text x="${mx}" y="${my-4}" text-anchor="middle" fill="#a5b4fc" font-size="12" font-family="Fira Code">${t.symbol}</text>`;
            }
        });
    });

    // Draw nodes
    nodeList.forEach((nd, i) => {
        if (!positions[nd]) return;
        const [px, py] = positions[nd];
        const isActive = step.current.includes(nd);
        const isFinal  = finalStates.some(f => nd.includes(f));
        const isNew    = step.transitions.some(t => !t.isDead && t.isNew && t.to.includes(nd));
        const delay    = `${i * 0.1}s`;

        const fill   = isActive ? "rgba(99,102,241,0.4)" : "rgba(30,41,59,0.9)";
        const stroke = isActive ? "#6366f1" : isFinal ? "#10b981" : "#475569";
        const fw     = isActive ? 2.5 : 1.5;
        const gf     = isActive ? `filter="url(#${glowId})"` : "";

        if (isFinal) {
            svg += `<circle cx="${px}" cy="${py}" r="${r+5}" fill="none" stroke="#10b981" stroke-width="1" opacity="0.35"
                class="node-pop" style="animation-delay:${delay}"/>`;
        }
        svg += `<circle cx="${px}" cy="${py}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${fw}" ${gf}
            class="node-pop" style="animation-delay:${delay}"/>`;

        if (isActive) {
            svg += `<circle cx="${px}" cy="${py}" r="${r}" fill="none" stroke="#6366f1" stroke-width="2.5"
                class="pulse-ring" style="animation-delay:${delay}"/>`;
        }
        if (isNew) {
            svg += `<circle cx="${px}" cy="${py}" r="${r}" fill="none" stroke="#10b981" stroke-width="2"
                class="pulse-ring-green" style="animation-delay:0.3s"/>`;
        }

        const label = nd.length > 5 ? nd.slice(0,4)+"…" : nd;
        svg += `<text x="${px}" y="${py+4}" text-anchor="middle"
            fill="${isActive ? '#c7d2fe' : '#94a3b8'}" font-size="13" font-family="Fira Code" font-weight="600"
            class="node-pop" style="animation-delay:${delay}">${label}</text>`;
    });

    svg += `</svg>`;
    return svg;
}

/* ── DFA TABLE ──────────────────────────────────────────────── */
function renderDFATable(dfa, finalStates, alphabet) {
    let html = `<table class="modern-table"><thead><tr><th>DFA State</th>`;
    alphabet.forEach(a => html += `<th>${a}</th>`);
    html += `</tr></thead><tbody>`;
    for (let state in dfa) {
        const isFinal = finalStates.some(f => state.includes(f));
        html += `<tr>${isFinal
            ? `<td class="final-state">{ ${state} } ✦</td>`
            : `<td>{ ${state} }</td>`}`;
        alphabet.forEach(a => {
            const next = dfa[state][a];
            if (next === "∅") { html += `<td class="empty-state">∅</td>`; }
            else {
                const nf = finalStates.some(f => next.includes(f));
                html += `<td ${nf ? 'class="final-state"' : ''}>{  ${next}  }</td>`;
            }
        });
        html += `</tr>`;
    }
    html += `</tbody></table>`;
    document.getElementById("dfaTable").innerHTML = html;
}

/* ── SAVE NFA DOT ───────────────────────────────────────────── */
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
            nfa[s][a].forEach(t => dot += `${s} -> ${t} [label=" ${a} "];\n`);
        }
    }
    dot += "}";
    localStorage.setItem("nfaGraphDOT", dot);
}

/* ── SAVE DFA DOT ───────────────────────────────────────────── */
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
        if (finalStates.some(f => s.includes(f))) {
            dot += `"${s}" [shape=doublecircle color="#10b981" fillcolor="#0f2a1e" fontcolor="#6ee7b7"];\n`;
        }
    });
    for (let s in dfa) {
        for (let a in dfa[s]) {
            const t = dfa[s][a];
            if (t !== "∅") dot += `"${s}" -> "${t}" [label=" ${a} "];\n`;
        }
    }
    dot += "}";
    localStorage.setItem("dfaGraphDOT", dot);
}

/* ── EXAMPLE GRAPH ──────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════
   REGEX → NFA (Thompson's Construction)
   Supports: concat, | (union), * (Kleene star), + (one-or-more),
             ? (optional), (), [abc] char classes, literals
   ══════════════════════════════════════════════════════════════ */

let _sc = 0;
function freshState() { return "s" + (_sc++); }

function _merge(a, b) {
    const t = JSON.parse(JSON.stringify(a));
    for (let s in b) {
        if (!t[s]) t[s] = {};
        for (let sym in b[s]) {
            if (!t[s][sym]) t[s][sym] = [];
            b[s][sym].forEach(x => { if (!t[s][sym].includes(x)) t[s][sym].push(x); });
        }
    }
    return t;
}
function _add(trans, from, sym, to) {
    if (!trans[from]) trans[from] = {};
    if (!trans[from][sym]) trans[from][sym] = [];
    if (!trans[from][sym].includes(to)) trans[from][sym].push(to);
}

function epsClosure(states, trans) {
    const v = new Set(states), st = [...states];
    while (st.length) {
        const s = st.pop();
        ((trans[s] || {})["ε"] || []).forEach(t => { if (!v.has(t)) { v.add(t); st.push(t); } });
    }
    return [...v].sort();
}
function move(states, sym, trans) {
    const r = new Set();
    states.forEach(s => ((trans[s] || {})[sym] || []).forEach(t => r.add(t)));
    return [...r];
}

function nfaLit(sym) {
    const s = freshState(), a = freshState(), t = {};
    _add(t, s, sym, a);
    return { start: s, accept: a, trans: t };
}
function nfaConcat(f1, f2) {
    const t = _merge(f1.trans, f2.trans);
    _add(t, f1.accept, "ε", f2.start);
    return { start: f1.start, accept: f2.accept, trans: t };
}
function nfaUnion(f1, f2) {
    const s = freshState(), a = freshState();
    const t = _merge(f1.trans, f2.trans);
    _add(t, s, "ε", f1.start); _add(t, s, "ε", f2.start);
    _add(t, f1.accept, "ε", a); _add(t, f2.accept, "ε", a);
    return { start: s, accept: a, trans: t };
}
function nfaStar(f) {
    const s = freshState(), a = freshState(), t = JSON.parse(JSON.stringify(f.trans));
    _add(t, s, "ε", f.start); _add(t, s, "ε", a);
    _add(t, f.accept, "ε", f.start); _add(t, f.accept, "ε", a);
    return { start: s, accept: a, trans: t };
}
function nfaPlus(f) { return nfaConcat(JSON.parse(JSON.stringify(f)), nfaStar(JSON.parse(JSON.stringify(f)))); }
function nfaOpt(f)  { const e = nfaEps(); return nfaUnion(f, e); }
function nfaEps()   { const s = freshState(), a = freshState(), t = {}; _add(t, s, "ε", a); return { start: s, accept: a, trans: t }; }

/* Tokenizer */
function tokenize(p) {
    const toks = [];
    for (let i = 0; i < p.length; i++) {
        if (p[i] === '[') {
            let j = i+1, chars = [];
            while (j < p.length && p[j] !== ']') chars.push(p[j++]);
            toks.push({ type: 'class', chars });
            i = j;
        } else {
            toks.push({ type: 'char', val: p[i] });
        }
    }
    return toks;
}

function parseExpr(toks, pos) {
    let { frag, pos: p } = parseConcat(toks, pos);
    while (p < toks.length && toks[p].type === 'char' && toks[p].val === '|') {
        const { frag: r2, pos: p2 } = parseConcat(toks, p+1);
        frag = nfaUnion(frag, r2); p = p2;
    }
    return { frag, pos: p };
}
function parseConcat(toks, pos) {
    let { frag, pos: p } = parseQuant(toks, pos);
    while (p < toks.length) {
        const t = toks[p];
        if (t.type === 'char' && (t.val === ')' || t.val === '|')) break;
        const { frag: r2, pos: p2 } = parseQuant(toks, p);
        if (p2 === p) break;
        frag = nfaConcat(frag, r2); p = p2;
    }
    return { frag, pos: p };
}
function parseQuant(toks, pos) {
    const { frag, pos: p } = parseAtom(toks, pos);
    if (p < toks.length && toks[p].type === 'char') {
        if (toks[p].val === '*') return { frag: nfaStar(frag), pos: p+1 };
        if (toks[p].val === '+') return { frag: nfaPlus(frag), pos: p+1 };
        if (toks[p].val === '?') return { frag: nfaOpt(frag),  pos: p+1 };
    }
    return { frag, pos: p };
}
function parseAtom(toks, pos) {
    if (pos >= toks.length) return { frag: nfaEps(), pos };
    const t = toks[pos];
    if (t.type === 'char' && t.val === '(') {
        const { frag, pos: p } = parseExpr(toks, pos+1);
        return { frag, pos: (p < toks.length && toks[p].val === ')') ? p+1 : p };
    }
    if (t.type === 'class') {
        let frag = nfaLit(t.chars[0]);
        for (let i = 1; i < t.chars.length; i++) frag = nfaUnion(frag, nfaLit(t.chars[i]));
        return { frag, pos: pos+1 };
    }
    if (t.type === 'char' && !'|)*+?'.includes(t.val)) {
        return { frag: nfaLit(t.val), pos: pos+1 };
    }
    return { frag: nfaEps(), pos: pos+1 };
}

/* Convert Thompson ε-NFA → plain NFA transition lines for display */
function thompsonToNFA(frag) {
    const { start, accept, trans } = frag;
    const alphaSet = new Set();
    for (let s in trans) for (let sym in trans[s]) if (sym !== "ε") alphaSet.add(sym);
    const alph = [...alphaSet].sort();

    const startSet = epsClosure([start], trans);
    const queue = [startSet], visited = [startSet], dfaTrans = {}, dfaFinals = [];

    while (queue.length) {
        const cur = queue.shift();
        const nm = cur.join(",");
        dfaTrans[nm] = {};
        if (cur.includes(accept)) dfaFinals.push(nm);
        alph.forEach(sym => {
            const nxt = epsClosure(move(cur, sym, trans), trans).sort();
            if (!nxt.length) return;
            const nn = nxt.join(",");
            dfaTrans[nm][sym] = [nn];
            if (!visited.some(v => v.join(",") === nn)) { visited.push(nxt); queue.push(nxt); }
        });
    }

    const lines = [];
    for (let s in dfaTrans) for (let sym in dfaTrans[s]) dfaTrans[s][sym].forEach(t => lines.push(`${s},${sym}=${t}`));
    return { startState: startSet.join(","), finalStates: dfaFinals.join(", "), transitions: lines.join("\n") };
}

/* ── PUBLIC: CONVERT FROM REGEX ─────────────────────────────── */
function convertFromRegex() {
    const pattern = document.getElementById("regexInput").value.trim();
    if (!pattern) { alert("Please enter a regular expression."); return; }
    try {
        _sc = 0;
        const frag = (() => { const toks = tokenize(pattern); return parseExpr(toks, 0).frag; })();
        const { startState, finalStates, transitions } = thompsonToNFA(frag);

        document.getElementById("start").value = startState;
        document.getElementById("final").value = finalStates;
        document.getElementById("transitions").value = transitions;

        if (typeof showToast === "function") showToast("✓ Regex parsed — NFA fields auto-populated!");
        runConvert();
    } catch(err) {
        console.error(err);
        alert("Could not parse regex.\n\nSupported: literals, | + * ? () [abc]\nExample: (a|b)*abb");
    }
}

