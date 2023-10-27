function pearsonCorrelation(x, y) {
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const num = d3.sum(x, (d, i) => (d - meanX) * (y[i] - meanY));
    const den = Math.sqrt(d3.sum(x, d => Math.pow(d - meanX, 2)) * d3.sum(y, d => Math.pow(d - meanY, 2)));
    return num / den;
}

function computeCorrelationMatrix(data) {
    const assets = Object.keys(data);
    const matrix = [];
    for (let i = 0; i < assets.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < assets.length; j++) {
            const asset1Returns = data[assets[i]].map(d => d.Log_Return).filter(d => d);
            const asset2Returns = data[assets[j]].map(d => d.Log_Return).filter(d => d);
            matrix[i][j] = pearsonCorrelation(asset1Returns, asset2Returns);
        }
    }
    return [assets, matrix];
}

function createCorrelationHeatmap(containerId, data) {
    const container = document.getElementById(containerId);
    const [assets, matrix] = computeCorrelationMatrix(data);
    const labelMargin = 20;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const size = Math.min((width - labelMargin) / assets.length, (height - labelMargin) / assets.length);

    const svg = d3.select(`#${containerId}`).append("svg")
        .attr("width", width)
        .attr("height", width);

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([-1, 1]);

    const tooltip = d3.select(`#${containerId}`)
        .append("div")
        .attr("class", "heatmap-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid 1px #ccc")
        .style("padding", "5px")
        .style("border-radius", "3px");

    svg.selectAll("rect")
        .data(matrix.flat())
        .enter().append("rect")
        .attr("x", (d, i) => labelMargin + (i % assets.length) * size)
        .attr("y", (d, i) => labelMargin + Math.floor(i / assets.length) * size)
        .attr("width", size)
        .attr("height", size)
        .attr("fill", d => colorScale(d))
        .on("mouseover", function (event, d) {
            const i = Math.floor(event.currentTarget.getAttribute("x") / size);
            const j = Math.floor(event.currentTarget.getAttribute("y") / size);
            tooltip.html(`Asset1: ${assets[j]}<br>Asset2: ${assets[i]}<br>Correlation: ${d.toFixed(2)}`)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    svg.selectAll(".xLabel")
        .data(assets)
        .enter().append("text")
        .attr("class", "xLabel")
        .attr("x", (d, i) => labelMargin + i * size + size / 2)
        .attr("y", labelMargin)
        .attr("dy", "-2px")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(d => d);

    svg.selectAll(".yLabel")
        .data(assets)
        .enter().append("text")
        .attr("class", "yLabel")
        .attr("x", labelMargin)
        .attr("y", (d, i) => labelMargin + i * size + size / 2)
        .attr("dy", "-2px")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("transform", (d, i) => `rotate(-90, ${labelMargin}, ${labelMargin + i * size + size / 2})`)
        .text(d => d);
}

function updateCorrelationHeatmap(containerId, data) {
    const container = document.getElementById(containerId);
    const [assets, matrix] = computeCorrelationMatrix(data);

    const svg = d3.select(`#${containerId} svg`);
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);
    const cells = svg.selectAll("rect").data(matrix.flat());
    cells.transition().duration(1000)
        .attr("fill", d => colorScale(d));
}
