# ⚙ NFA → DFA Converter & Visualizer

## Project Overview

This is a fully browser-based web application that converts a **Non-Deterministic Finite Automaton (NFA)** into an equivalent **Deterministic Finite Automaton (DFA)** using the **Subset Construction Algorithm**. The tool is designed to help students of Automata Theory visually understand how NFA-to-DFA conversion works — with step-by-step output, a transition table, and interactive graph rendering.

No installation or server is required. All processing happens client-side in the browser.

---
## Live Pages

| Page | File | Description |
|------|------|-------------|
| Main Tool | `index.html` | NFA input form + conversion output |
| Graph View | `graphs.html` | Visual NFA and DFA graph rendering |
| Theory | `theory.html` | Theoretical background and concepts |

---

## Live Pages

| Page | File | Description |
|------|------|-------------|
| Main Tool | `index.html` | NFA input form + conversion output |
| Graph View | `graphs.html` | Visual NFA and DFA graph rendering |
| Theory | `theory.html` | Theoretical background and concepts |

---



<div align="center">

![Hero](Screenshot_2026-04-14_101013.png)


## 📸 Screenshots

| Input Panel | Subset Construction Steps |
|:-----------:|:-------------------------:|
| ![Input](Screenshot_2026-04-14_101027.png) | ![Steps](Screenshot_2026-04-14_101049.png) |

| DFA Transition Table | Full Graph View |
|:--------------------:|:---------------:|
| ![Table](Screenshot_2026-04-14_101058.png) | ![Graph](Screenshot_2026-04-14_101114.png) |

---

## ✨ Features

### Core
- **NFA → DFA Conversion** using the Subset Construction (Powerset Construction) algorithm
- **Regular Expression input** — Thompson's Construction converts RE to NFA automatically
- Handles **dead states (∅)** explicitly
- Correctly identifies **DFA final states** from NFA accepting states

### Step-by-Step Visualization
- Each subset construction step rendered as an **animated mini state diagram**
- Active states glow **purple**, newly discovered states pulse **green**
- Transition rows show symbol pills, arrow, target state, and new/visited badge
- Results **persist across page navigation** via localStorage

### Graph Output (`graphs.html`)
- NFA and DFA rendered as full directed graphs via **Viz.js (Graphviz)**
- Purple/indigo nodes · green double-circle for accepting states · transparent background

### Theory Page (`theory.html`)
- Regular Languages, NFA, DFA formal definitions
- Side-by-side DFA vs NFA comparison
- Full Subset Construction walkthrough with reference images

---

## 🚀 Getting Started

### Run Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/nfa-dfa-visualizer.git
cd nfa-dfa-visualizer

# Open in browser — no build step needed
open index.html
# or use VS Code Live Server
```

### Input Format
```
# Start State
q0

# Final States (comma-separated)
q2

# Transitions (one per line)
state,symbol=next1,next2
q0,0=q0,q1
q0,1=q0
q1,0=q2
q2,1=q2
```

### Regex Input
Switch to the **Regular Expression** tab and enter an expression:

| Expression | Matches |
|-----------|---------|
| `(0\|1)*00` | Binary strings ending in 00 |
| `(a\|b)*abb` | Strings ending in abb |
| `a*b+` | Zero or more a's followed by one or more b's |
| `[01]*1` | Binary strings ending in 1 |

**Supported operators:** `\|` union · `*` Kleene star · `+` one-or-more · `?` optional · `()` groups · `[abc]` character class

---

## 📁 File Structure

```
project/
├── index.html       ← Main converter tool (homepage)
├── graphs.html      ← Graph visualization page
├── theory.html      ← Theory and concepts page
├── script.js        ← NFA→DFA algorithm + Graphviz DOT + Regex parser
├── style.css        ← All styling, animations, layout
├── README.md        ← This file
└── images/          ← Theory reference images
```

---

## ⚙ Algorithm

### Subset Construction
Converts NFA `N = (Q, Σ, δ, q₀, F)` to DFA `D = (2^Q, Σ, δ', {q₀}, F')`:

1. Start with `{q₀}` as the initial DFA state
2. For each unprocessed DFA state and each input symbol, compute the union of all reachable NFA states
3. Mark a DFA state as accepting if it contains any NFA accepting state
4. Repeat until no new states are discovered

**Time complexity:** O(2ⁿ) worst case · **Space complexity:** O(2ⁿ)

### Thompson's Construction (Regex → NFA)
Parses the regular expression into an ε-NFA using recursive descent, then collapses ε-transitions via ε-closure to produce a plain NFA ready for subset construction.

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 + CSS3 | Structure, animations, responsive layout |
| Vanilla JavaScript | NFA→DFA algorithm, DOM manipulation |
| Viz.js v2.1.2 | Graphviz graph rendering in browser |
| Font Awesome 6 | Icons |
| Google Fonts (Outfit + Fira Code) | Typography |
| localStorage | Persisting graph data & results between pages |

---

## 👨‍💻 Author

**Ashutosh Kumar**  
Roll No: `2024UCM2304`  
B.Tech — Mathematics and Computing, 4th Semester  
Netaji Subhas University of Technology (NSUT), New Delhi

---

## 📚 Academic Context

| Field | Value |
|-------|-------|
| Subject | Theory of Computation / Formal Languages & Automata |
| Topic | Finite Automata — NFA to DFA Conversion |
| Algorithm | Subset Construction |
| Semester | 4th Semester, B.Tech Mathematics and Computing |
| University | NSUT, Delhi |

---

<div align="center">
  <sub>Developed by Ashutosh Kumar(2024UCM2304) · NSUT Delhi · 2024</sub>
</div>

