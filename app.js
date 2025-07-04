const svg = d3.select('#plot');
const width = +svg.attr('width');
const height = +svg.attr('height');

let xScale = d3.scaleLinear().domain([0, 10]).range([40, width - 20]);
let yScale = d3.scaleLinear().domain([0, 10]).range([height - 30, 20]);

let points = [];

const xAxisG = svg.append('g').attr('transform', `translate(0,${height - 30})`);
const yAxisG = svg.append('g').attr('transform', 'translate(40,0)');

function drawAxes() {
    xAxisG.call(d3.axisBottom(xScale));
    yAxisG.call(d3.axisLeft(yScale));
}

drawAxes();

svg.on('click', function(event) {
    const [mx, my] = d3.pointer(event);
    const x = xScale.invert(mx);
    const y = yScale.invert(my);
    points.push({x, y});
    svg.append('circle')
       .attr('cx', xScale(x))
       .attr('cy', yScale(y))
       .attr('r', 3)
       .attr('fill', 'steelblue');
});

d3.select('#applyRange').on('click', () => {
    const xmin = parseFloat(document.getElementById('xmin').value);
    const xmax = parseFloat(document.getElementById('xmax').value);
    const ymin = parseFloat(document.getElementById('ymin').value);
    const ymax = parseFloat(document.getElementById('ymax').value);

    xScale.domain([xmin, xmax]);
    yScale.domain([ymin, ymax]);

    svg.selectAll('circle').remove();
    svg.selectAll('path.curve').remove();
    points = [];
    drawAxes();
});

d3.select('#drawCurve').on('click', () => {
    if (points.length < 2) return;
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
    const sorted = points.slice().sort((a, b) => a.x - b.x);
    svg.selectAll('path.curve').remove();
    svg.append('path')
       .datum(sorted)
       .attr('class', 'curve')
       .attr('fill', 'none')
       .attr('stroke', 'red')
       .attr('stroke-width', 2)
       .attr('d', line);
});

d3.select('#exportData').on('click', () => {
    let content = '# x\t y\n';
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
    svg.selectAll('circle').remove();
    svg.selectAll('path.curve').remove();
    points = [];
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
                if (!isNaN(x) && !isNaN(y)) points.push({x, y});
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
            svg.selectAll('circle').remove();
            svg.selectAll('path.curve').remove();
            drawAxes();
            points.forEach(p => {
                svg.append('circle')
                   .attr('cx', xScale(p.x))
                   .attr('cy', yScale(p.y))
                   .attr('r', 3)
                   .attr('fill', 'steelblue');
            });
        }
        event.target.value = '';
    };
    reader.readAsText(file);
});
