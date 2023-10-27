function createLogReturnChart(containerId, data, width, xScale) {
    const container = document.getElementById(containerId);
    const height = container.offsetHeight - margin.top - margin.bottom;
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => +d.Log_Return)).range([height, 0]);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Log_Return));

    svg.append("path")
        .datum(data)
        .attr("class", "logReturnLine")
        .attr("fill", "none")
        .attr("stroke", "#FF4500")
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

    svg.selectAll(".horizontalLabel")
        .data(horizontalLinesData)
        .enter().append("text")
        .attr("class", "horizontalLabel")
        .attr("x", -5)
        .attr("y", d => yScale(d))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .text(d => formatLogReturn(d));

    svg.append("line")
        .attr("class", "zeroLine")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

    svg.append("text")
        .attr("class", "zeroLabel")
        .attr("x", -5)
        .attr("y", yScale(0))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .text("Zero");

    svg.append("text")
        .attr("class", "chartLabel")
        .attr("x", width + 10)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(90, ${width + 10}, ${height / 2})`)
        .attr("font-size", "14px")
        .style("font-weight", "bold")
        .text("Log - Returns");

    svg.append("text")
        .attr("class", "animated-label")
        .attr("x", 10)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("font-size", "14px");

    svg.append("text")
        .attr("class", "selection-label")
        .attr("x", 10)
        .attr("y", 25)
        .attr("text-anchor", "start")
        .attr("font-size", "14px")
        .attr("fill", "#ad2aee");

    return yScale;
}

function updateLogReturnChart(containerId, data, width, xScale) {
    const container = document.getElementById(containerId);
    const height = container.offsetHeight - margin.top - margin.bottom;
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => +d.Log_Return)).range([height, 0]);

    const svg = d3.select(`#${containerId}`).select("svg").select("g");
    const t = d3.transition().duration(750);

    const line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Log_Return));

    svg.select(".logReturnLine")
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
        .text(d => formatLogReturn(d));
    horizontalLabels.exit().remove();

    svg.select(".zeroLine")
        .transition()
        .duration(750)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0));

    svg.select(".zeroLabel")
        .transition()
        .duration(750)
        .attr("y", yScale(0));

    return yScale;
}
