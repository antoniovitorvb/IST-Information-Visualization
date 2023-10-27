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

function widthGenerator(containerId, margin) {
    const container = document.getElementById(containerId);
    const style = window.getComputedStyle(container);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return container.clientWidth - padding - margin.left - margin.right;
}

function xScaleGenerator(data, width) {
    return d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]).padding(0.1);
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
