function createCandlestickChart(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().domain([d3.min(data, d => d.Low), d3.max(data, d => d.High)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(Math.max(d.Open, d.Close)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d.Open) - yScale(d.Close)))
        .attr("fill", d => d.Open > d.Close ? "red" : "green");

    svg.selectAll(".line")
        .data(data)
        .enter().append("line")
        .attr("class", "line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", d => yScale(d.High))
        .attr("y2", d => yScale(d.Low))
        .attr("stroke", d => d.Open > d.Close ? "red" : "green");

    const xAxis = xAxisGenerator(xScale);
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    const horizontalLinesData = yAxisGenerator(yScale, 12);
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
        .text(d => d.toFixed(5));
}

function updateCandlestickChart(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().domain([d3.min(data, d => d.Low), d3.max(data, d => d.High)]).range([height, 0]);

    const svg = d3.select(`#${containerId} svg g`);

    const t = d3.transition().duration(750);

    const bars = svg.selectAll(".bar").data(data);
    bars.enter().append("rect")
        .attr("x", d => xScale(d.Time))
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .merge(bars)
        .transition(t)
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(Math.max(d.Open, d.Close)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d.Open) - yScale(d.Close)))
        .attr("fill", d => d.Open > d.Close ? "red" : "green");
    bars.exit()
        .transition(t)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    const lines = svg.selectAll(".line").data(data);
    lines.enter().append("line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", height)
        .attr("y2", height)
        .merge(lines)
        .transition(t)
        .attr("class", "line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", d => yScale(d.High))
        .attr("y2", d => yScale(d.Low))
        .attr("stroke", d => d.Open > d.Close ? "red" : "green");
    lines.exit()
        .transition(t)
        .attr("y1", height)
        .attr("y2", height)
        .remove();

    const xAxis = xAxisGenerator(xScale);
    svg.select(".x-axis").transition(t).call(xAxis);

    const yAxis = yAxisGenerator(yScale, 12)
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
        .text(d => d.toFixed(5));
    horizontalLabels.exit().remove();
}
