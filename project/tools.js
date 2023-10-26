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
