function formatVolume(volume) {
    if (volume >= 1e6) {
        return (volume / 1e6).toFixed(1) + 'M';
    } else if (volume >= 1e3) {
        return (volume / 1e3).toFixed(1) + 'K';
    } else {
        return volume;
    }
}

function formatLogReturn(value) {
    return (value * 100).toFixed(2) + '%';
}

function formatPriceInPips(value) {
    return (value / pipSize).toFixed(2) + " Pips";
}

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

        const nearestDataPoint = data[dates.indexOf(nearestDate)];
        updateChartLabels(nearestDataPoint);

    }).on("mouseout", function() {
        verticalLine.style("display", "none");
    });
}

function updateChartLabels(data) {
    // Update the text label on the candlestick chart
    d3.select("#candlestick-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">Date/Time:</tspan> ${data.Time} &emsp; <tspan font-weight="bold">Open:</tspan> ${data.Open} &emsp; <tspan font-weight="bold">High:</tspan> ${data.High} &emsp; <tspan font-weight="bold">Low:</tspan> ${data.Low} &emsp; <tspan font-weight="bold">Close:</tspan> ${data.Close}`);

    // Update the text label on the Volume histogram
    d3.select("#volume-histogram").select(".animated-label")
        .html(`<tspan font-weight="bold">Volume:</tspan> ${formatVolume(data.Volume)}`);

    // Update the text label on the Log Return chart
    d3.select("#log-return-line-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">Log-Return:</tspan> ${formatLogReturn(data.Log_Return)}`);

    // Update the text label on the ATR chart
    d3.select("#atr-line-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">ATR:</tspan> ${formatPriceInPips(data.ATR)}`);
}

function createVerticalLine(data) {
    const container = document.getElementById("charts-section");
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

function updateVerticalLine(data) {
    const container = document.getElementById("charts-section");
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
