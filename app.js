const svg = d3.select('#plot');
const width = +svg.attr('width');
const height = +svg.attr('height');
const margin = {left: 40, right: 20, top: 20, bottom: 30};

let xScale = d3.scaleLinear().domain([0, 10]).range([margin.left, width - margin.right]);
let yScale = d3.scaleLinear().domain([0, 10]).range([height - margin.bottom, margin.top]);

let points = [];
let nextId = 1;
let dragState = null;
let marquee = null;
let marqueeStart = null;
let justSelected = false;

const axes = {
    x: svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`),
    y: svg.append('g').attr('transform', `translate(${margin.left},0)`)
};

drawAxes();
render();

function drawAxes() {
    axes.x.call(d3.axisBottom(xScale));
    axes.y.call(d3.axisLeft(yScale));
}

function render() {
    const circles = svg.selectAll('circle.point').data(points, d => d.id);

    circles.join(
        enter => enter.append('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded))
            .on('click', pointClicked),
        update => update
            .attr('class', d => 'point' + (d.selected ? ' selected' : ''))
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y)),
        exit => exit.remove()
    );

    if (points.length > 1) {
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);
        const sorted = points.slice().sort((a, b) => a.x - b.x);
        svg.selectAll('path.curve').data([sorted])
            .join('path')
            .attr('class', 'curve')
            .attr('fill', 'none')
            .attr('stroke', 'tomato')
            .attr('stroke-width', 2)
            .attr('pointer-events', 'none')
            .attr('d', line)
            .lower();
    } else {
        svg.selectAll('path.curve').remove();
    }
}

function pointClicked(event, d) {
    if (!event.shiftKey) points.forEach(p => p.selected = false);
    d.selected = !d.selected;
    render();
    event.stopPropagation();
}

function dragStarted(event, d) {
    if (event.sourceEvent.shiftKey) { dragState = null; return; }
    const targets = d.selected ? points.filter(p => p.selected) : [d];
    dragState = targets.map(p => ({ p, x: p.x, y: p.y }));
    dragState.startX = xScale.invert(event.x);
    dragState.startY = yScale.invert(event.y);
}

function dragged(event) {
    if (!dragState) return;
    const dx = xScale.invert(event.x) - dragState.startX;
    const dy = yScale.invert(event.y) - dragState.startY;
    dragState.forEach(item => {
        item.p.x = item.x + dx;
        item.p.y = item.y + dy;
    });
    render();
}

function dragEnded() {
    dragState = null;
}

svg.on('mousedown', event => {
    if (!event.shiftKey) return;
    marqueeStart = d3.pointer(event);
    marquee = svg.append('rect')
        .attr('class', 'marquee')
        .attr('x', marqueeStart[0])
        .attr('y', marqueeStart[1])
        .attr('width', 0)
        .attr('height', 0);
    justSelected = false;
});

svg.on('mousemove', event => {
    if (!marquee) return;
    const [mx, my] = d3.pointer(event);
    const x = Math.min(marqueeStart[0], mx);
    const y = Math.min(marqueeStart[1], my);
    const w = Math.abs(mx - marqueeStart[0]);
    const h = Math.abs(my - marqueeStart[1]);
    marquee.attr('x', x).attr('y', y).attr('width', w).attr('height', h);
});

svg.on('mouseup', event => {
    if (!marquee) return;
    const [mx, my] = d3.pointer(event);
    const x0 = Math.min(marqueeStart[0], mx);
    const x1 = Math.max(marqueeStart[0], mx);
    const y0 = Math.min(marqueeStart[1], my);
    const y1 = Math.max(marqueeStart[1], my);
    points.forEach(p => {
        const px = xScale(p.x);
        const py = yScale(p.y);
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) p.selected = true;
    });
    marquee.remove();
    marquee = null;
    justSelected = true;
    render();
});

svg.on('click', event => {
    if (marquee || event.target.tagName === 'circle') return;
    if (justSelected) { justSelected = false; return; }
    if (points.some(p => p.selected)) {
        points.forEach(p => p.selected = false);
        render();
        return;
    }
    const [mx, my] = d3.pointer(event);
    addPoint(xScale.invert(mx), yScale.invert(my));
});

function addPoint(x, y) {
    points.push({ id: nextId++, x, y });
    render();
}

function deleteSelected() {
    points = points.filter(p => !p.selected);
    render();
}

function moveSelected(dx, dy) {
    points.forEach(p => { if (p.selected) { p.x += dx; p.y += dy; } });
    render();
}

d3.select('#applyRange').on('click', () => {
    xScale.domain([
        parseFloat(document.getElementById('xmin').value),
        parseFloat(document.getElementById('xmax').value)
    ]);
    yScale.domain([
        parseFloat(document.getElementById('ymin').value),
        parseFloat(document.getElementById('ymax').value)
    ]);
    drawAxes();
    render();
});

d3.select('#exportData').on('click', () => {
    let content = '# x\ty\n';
    content += points.map(p => `${p.x.toFixed(6)}\t${p.y.toFixed(6)}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curve_data.dat';
    a.click();
    URL.revokeObjectURL(url);
});

d3.select('#clearPlot').on('click', () => {
    points = [];
    svg.selectAll('*').remove();
    axes.x = svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`);
    axes.y = svg.append('g').attr('transform', `translate(${margin.left},0)`);
    drawAxes();
    render();
});

document.getElementById('importData').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        points = [];
        const lines = ev.target.result.split(/\r?\n/);
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const [x, y] = line.split(/\s+/).map(Number);
            if (!isNaN(x) && !isNaN(y)) points.push({ id: nextId++, x, y });
        });
        if (points.length) {
            const xs = points.map(p => p.x);
            const ys = points.map(p => p.y);
            xScale.domain([Math.min(...xs), Math.max(...xs)]);
            yScale.domain([Math.min(...ys), Math.max(...ys)]);
            document.getElementById('xmin').value = xScale.domain()[0];
            document.getElementById('xmax').value = xScale.domain()[1];
            document.getElementById('ymin').value = yScale.domain()[0];
            document.getElementById('ymax').value = yScale.domain()[1];
        }
        drawAxes();
        render();
        e.target.value = '';
    };
    reader.readAsText(file);
});

document.addEventListener('keydown', e => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
    }
    const step = e.shiftKey ? 0.1 : 0.01;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (points.some(p => p.selected)) {
            e.preventDefault();
            if (e.key === 'ArrowLeft') moveSelected(-step, 0);
            if (e.key === 'ArrowRight') moveSelected(step, 0);
            if (e.key === 'ArrowUp') moveSelected(0, step);
            if (e.key === 'ArrowDown') moveSelected(0, -step);
        }
    }
});
