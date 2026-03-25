const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let states = [];
let transitions = [];

/* Add State */
function addState() {
    const name = document.getElementById("stateName").value;

    if (!name) return;

    states.push({
        name: name,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50
    });

    draw();
}

/* Add Transition */
function addTransition() {
    const from = document.getElementById("fromState").value;
    const to = document.getElementById("toState").value;
    const symbol = document.getElementById("symbol").value;

    if (!from || !to || !symbol) return;

    transitions.push({ from, to, symbol });

    draw();
}

/* Draw Graph */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw transitions first
    transitions.forEach(t => {
        const s1 = states.find(s => s.name === t.from);
        const s2 = states.find(s => s.name === t.to);

        if (!s1 || !s2) return;

        drawArrow(s1.x, s1.y, s2.x, s2.y, t.symbol);
    });

    // Draw states
    states.forEach(s => {
        drawState(s);
    });
}

/* Draw State */
function drawState(state) {
    ctx.beginPath();
    ctx.arc(state.x, state.y, 25, 0, 2 * Math.PI);

    ctx.fillStyle = "#1e1e1e";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ffcc";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(state.name, state.x, state.y + 5);
}

/* Draw Arrow with SIDE LABEL */
function drawArrow(x1, y1, x2, y2, label) {
    let angle = Math.atan2(y2 - y1, x2 - x1);

    let offset = 25;

    let startX = x1 + offset * Math.cos(angle);
    let startY = y1 + offset * Math.sin(angle);

    let endX = x2 - offset * Math.cos(angle);
    let endY = y2 - offset * Math.sin(angle);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - 10 * Math.cos(angle - Math.PI / 6),
        endY - 10 * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - 10 * Math.cos(angle + Math.PI / 6),
        endY - 10 * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = "#00ffcc";
    ctx.fill();

    // 🔥 LABEL SIDE OFFSET (MAIN FIX)
    let midX = (startX + endX) / 2;
    let midY = (startY + endY) / 2;

    let dx = endX - startX;
    let dy = endY - startY;
    let length = Math.sqrt(dx * dx + dy * dy);

    dx /= length;
    dy /= length;

    // perpendicular shift
    let offsetX = -dy * 15;
    let offsetY = dx * 15;

    ctx.fillStyle = "#ffcc00";
    ctx.font = "14px Arial";
    ctx.fillText(label, midX + offsetX, midY + offsetY);
}
