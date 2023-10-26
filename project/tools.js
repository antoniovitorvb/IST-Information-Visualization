function xAxisGenerator(scale, ticks = 10) {
    const tickInterval = Math.ceil(scale.domain().length / ticks);
    return d3.axisBottom(scale)
        .tickValues(scale.domain().filter((_, i) => i % tickInterval === 0))
        .tickFormat(d => {
            const date = parsePriceDate(d);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${hours}:${minutes}`;
        })
        .tickSizeOuter(0);
}

function yAxisGenerator(scale, ticks = 10) {
    const domain = scale.domain();
    const interval = (domain[1] - domain[0]) / (ticks - 1);
    return Array.from({length: ticks}, (_, i) => domain[0] + i * interval);
}

function attachMouseEvents(data, container, verticalLine, xScale, paddingLeft) {
    d3.select(container).on("mouseover", function() {
        verticalLine.style("display", "block");
    }).on("mousemove", function(event) {
        const mouseX = event.layerX - margin.left - paddingLeft;
        const dates = data.map(d => xScale(d.Time) + xScale.bandwidth() / 2);
        const nearestDate = dates.reduce((a, b) => {
            return Math.abs(b - mouseX) < Math.abs(a - mouseX) ? b : a;
        });
        verticalLine.style("left", `${nearestDate + margin.left + paddingLeft}px`);
    }).on("mouseout", function() {
        verticalLine.style("display", "none");
    });
}

function createVerticalLine(data, containerId) {
    const container = document.getElementById(containerId);
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const width = container.offsetWidth - margin.left - margin.right - paddingLeft - paddingRight;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]);

    const verticalLine = d3.select(container).append("div")
        .attr("class", "vertical-line")
        .style("position", "absolute")
        .style("top", `${margin.top}px`)
        .style("left", `${margin.left}px`)
        .style("width", "2px")
        .style("height", `${height}px`)
        .style("background-color", "rgba(128, 128, 128, 0.5)")
        .style("display", "none")
        .style("pointer-events", "none");

    attachMouseEvents(data, container, verticalLine, xScale, paddingLeft);
}

function updateVerticalLine(data, containerId) {
    const container = document.getElementById(containerId);
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const width = container.offsetWidth - margin.left - margin.right - paddingLeft - paddingRight;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]);

    const verticalLine = d3.select(container).select(".vertical-line");

    d3.select(container).on("mousemove", null);

    attachMouseEvents(data, container, verticalLine, xScale, paddingLeft);
}

function toggleElement(toggleId) {
    let targetClass;
    switch (toggleId) {
        case 'sma20-toggle':
            targetClass = '.sma20';
            break;
        case 'sma50-toggle':
            targetClass = '.sma50';
            break;
        case 'bollinger-toggle':
            targetClass = '.upperBollinger, .lowerBollinger';
            break;
        case 'news-toggle':
            targetClass = '.news-warning';
            break;
        default:
            return;
    }
    const isDisplayed = document.getElementById(toggleId).checked;
    d3.selectAll(targetClass).style('display', isDisplayed ? 'block' : 'none');
}
