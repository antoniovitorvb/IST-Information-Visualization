function createATRChart(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => +d.ATR)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.ATR));

    svg.append("path")
        .datum(data)
        .attr("class", "atrLine")
        .attr("fill", "none")
        .attr("stroke", "#20B2AA")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    const xAxis = xAxisGenerator(xScale);
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    const horizontalLinesData = yAxisGenerator(yScale, 5);
    svg.selectAll(".horizontalLine")
        .data(horizontalLinesData)
        .enter().append("line")
        .attr("class", "horizontalLine")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "5,5");

    const averageClose = d3.mean(data, d => +d.Close);
    const pipSize = averageClose > 2 ? 0.01 : 0.0001;

    svg.selectAll(".horizontalLabel")
        .data(horizontalLinesData)
        .enter().append("text")
        .attr("class", "horizontalLabel")
        .attr("x", -5)
        .attr("y", d => yScale(d))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .text(d => formatATRinPips(d, pipSize));


    svg.append("text")
        .attr("class", "chartLabel")
        .attr("x", width + 10)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(90, ${width + 10}, ${height / 2})`)
        .attr("font-size", "14px")
        .style("font-weight", "bold")
        .text("Average True Range");
}

function updateATRChart(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => +d.ATR)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`).select("svg").select("g");

    const t = d3.transition().duration(750);

    const line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.ATR));

    svg.select(".atrLine")
        .datum(data)
        .transition()
        .duration(750)
        .attr("d", line);

    const xAxis = xAxisGenerator(xScale);
    svg.select(".x-axis").transition().duration(750).call(xAxis);

    const yAxis = yAxisGenerator(yScale, 5);
    const horizontalLines = svg.selectAll(".horizontalLine").data(yAxis);
    horizontalLines.enter().append("line")
        .attr("class", "horizontalLine")
        .attr("x1", 0)
        .attr("x2", width)
        .merge(horizontalLines)
        .transition(t)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "5,5");
    horizontalLines.exit().remove();

    const averageClose = d3.mean(data, d => +d.Close);
    const pipSize = averageClose > 2 ? 0.01 : 0.0001;

    const horizontalLabels = svg.selectAll(".horizontalLabel").data(yAxis);
    horizontalLabels.enter().append("text")
        .attr("class", "horizontalLabel")
        .attr("x", -5)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .merge(horizontalLabels)
        .transition(t)
        .attr("y", d => yScale(d))
        .text(d => formatATRinPips(d, pipSize));

}

function formatATRinPips(value, pipSize) {
    return (value / pipSize).toFixed(2) + " Pips";
}

