const svg = d3.select('#plot');
const width = +svg.attr('width');
const height = +svg.attr('height');

let xScale = d3.scaleLinear().domain([0, 10]).range([40, width - 20]);
let yScale = d3.scaleLinear().domain([0, 10]).range([height - 30, 20]);

let points = [];
let nextId = 1;

let isSelecting = false;
let selectStart = null;
let selectionRect;
let justSelected = false;
let dragState = null;

function updateLine() {
    if (points.length > 1) {
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);
        const sorted = points.slice().sort((a, b) => a.x - b.x);
        svg.selectAll('path.curve')
            .data([sorted])
            .join('path')
            .attr('class', 'curve')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('pointer-events', 'none')
            .attr('d', line)
            .lower();
    } else {
        svg.selectAll('path.curve').remove();
    }
}

let xAxisG = svg.append('g').attr('transform', `translate(0,${height - 30})`);
let yAxisG = svg.append('g').attr('transform', 'translate(40,0)');

function drawAxes() {
    xAxisG.call(d3.axisBottom(xScale));
    yAxisG.call(d3.axisLeft(yScale));
}


function render() {
    svg.selectAll('circle.point').remove();
    points.forEach(p => {
        svg.append('circle')
            .datum(p)
            .attr('class', 'point' + (p.selected ? ' selected' : ''))
            .attr('data-id', p.id)
            .attr('cx', xScale(p.x))
            .attr('cy', yScale(p.y))
            .attr('r', 4)
            .attr('fill', 'steelblue')
            .call(
                d3.drag()
                    .subject(d => ({ x: xScale(d.x), y: yScale(d.y) }))
                    .on('start', function(event, d) {
                        if (event.sourceEvent.shiftKey) { dragState = null; return; }
                        const targets = d.selected ? points.filter(p => p.selected) : [d];
                        dragState = {
                            startX: xScale.invert(event.x),
                            startY: yScale.invert(event.y),
                            items: targets.map(p => ({ p, x: p.x, y: p.y }))
                        };
                    })
                    .on('drag', function(event) {
                        if (!dragState) return;
                        if (event.sourceEvent.shiftKey) return;
                        const dx = xScale.invert(event.x) - dragState.startX;
                        const dy = yScale.invert(event.y) - dragState.startY;
                        dragState.items.forEach(item => {
                            item.p.x = item.x + dx;
                            item.p.y = item.y + dy;
                            svg.select(`circle[data-id='${item.p.id}']`)
                                .attr('cx', xScale(item.p.x))
                                .attr('cy', yScale(item.p.y));
                        });
                        updateLine();
                    })
                    .on('end', function(event) {
                        if (event.sourceEvent.shiftKey) { dragState = null; return; }
                        dragState = null;
                        render();
                    })
            )
            .on('click', (event, d) => {
                if (!event.shiftKey) points.forEach(p => p.selected = false);
                d.selected = !d.selected;
                render();
            });
    });
    updateLine();
}

function addPoint(x, y) {
    points.push({id: nextId++, x, y});
    render();
}

function deleteSelected() {
    if (points.some(p => p.selected)) {
        points = points.filter(p => !p.selected);
        render();
    }
}

function moveSelected(dx, dy) {
    if (points.some(p => p.selected)) {
        points.forEach(p => {
            if (p.selected) {
                p.x += dx;
                p.y += dy;
            }
        });
        render();
    }
}






drawAxes();
render();

svg.on('mousedown', function(event) {
    if (!event.shiftKey) return;
    isSelecting = true;
    selectStart = d3.pointer(event);
    selectionRect = svg.append('rect')
        .attr('class', 'marquee')
        .attr('x', selectStart[0])
        .attr('y', selectStart[1])
        .attr('width', 0)
        .attr('height', 0);
    justSelected = false;
});

svg.on('mousemove', function(event) {
    if (!isSelecting) return;
    const [mx, my] = d3.pointer(event);
    const x = Math.min(selectStart[0], mx);
    const y = Math.min(selectStart[1], my);
    const w = Math.abs(mx - selectStart[0]);
    const h = Math.abs(my - selectStart[1]);
    selectionRect.attr('x', x).attr('y', y)
        .attr('width', w).attr('height', h);
});

svg.on('mouseup', function(event) {
    if (!isSelecting) return;
    const [mx, my] = d3.pointer(event);
    const x0 = Math.min(selectStart[0], mx);
    const x1 = Math.max(selectStart[0], mx);
    const y0 = Math.min(selectStart[1], my);
    const y1 = Math.max(selectStart[1], my);
    points.forEach(p => {
        const px = xScale(p.x);
        const py = yScale(p.y);
        if (px >= x0 && px <= x1 && py >= y0 && py <= y1) p.selected = true;
    });
    selectionRect.remove();
    isSelecting = false;
    justSelected = true;
    render();
});

svg.on('click', function(event) {
    if (isSelecting || event.target.tagName === 'circle') return;
    if (justSelected) { justSelected = false; return; }
    if (points.some(p => p.selected)) {
        points.forEach(p => p.selected = false);
        render();
        return;
    }
    const [mx, my] = d3.pointer(event);
    const x = xScale.invert(mx);
    const y = yScale.invert(my);
    addPoint(x, y);
});

d3.select('#applyRange').on('click', () => {
    const xmin = parseFloat(document.getElementById('xmin').value);
    const xmax = parseFloat(document.getElementById('xmax').value);
    const ymin = parseFloat(document.getElementById('ymin').value);
    const ymax = parseFloat(document.getElementById('ymax').value);

    xScale.domain([xmin, xmax]);
    yScale.domain([ymin, ymax]);

    drawAxes();
    render();
});


d3.select('#exportData').on('click', () => {
    let content = '# x\ty\n';
    content += points.map(p => `${p.x.toFixed(6)}\t${p.y.toFixed(6)}`).join('\n');
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curve_data.dat';
    a.click();
    URL.revokeObjectURL(url);
});

d3.select('#clearPlot').on('click', () => {
    points = [];
    svg.selectAll('circle.point').remove();
    svg.selectAll('path.curve').remove();
    drawAxes();
    render();
});

document.getElementById('importData').addEventListener('change', event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/);
        points = [];
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                if (!isNaN(x) && !isNaN(y)) points.push({id: nextId++, x, y});
            }
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
        svg.selectAll('circle.point').remove();
        svg.selectAll('path.curve').remove();
        drawAxes();
        render();
        event.target.value = '';
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

