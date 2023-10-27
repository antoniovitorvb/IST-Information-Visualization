let lastNearestDataPoint = null;
let lastClickedDate = null;
let lastHighlightedDate = null;

function getNearestDataPoint(mouseX, data, xScale) {
    const dates = data.map(d => xScale(d.Time) + xScale.bandwidth() / 2);
    const nearestDate = dates.reduce((a, b) => {
        return Math.abs(b - mouseX) < Math.abs(a - mouseX) ? b : a;
    });
    return data[dates.indexOf(nearestDate)];
}

function attachMouseEvents(data, container, verticalLine, xScale, yScales, paddingLeft) {
    d3.select(container)
        .on("mouseover", function() {
            verticalLine.style("display", "block");
        })
        .on("mouseout", function() {
            verticalLine.style("display", "none");
            lastNearestDataPoint = null;
        })
        .on("mousemove", function(event) {
            const mouseX = event.layerX - margin.left - paddingLeft;
            const nearestDataPoint = getNearestDataPoint(mouseX, data, xScale);
            if (!lastNearestDataPoint || nearestDataPoint.Time !== lastNearestDataPoint.Time) {
                verticalLine.style("left", `${xScale(nearestDataPoint.Time) + xScale.bandwidth() / 2 + margin.left + paddingLeft}px`);
                updateAnimatedLabels(nearestDataPoint);
                updateAnimatedHighlight(nearestDataPoint, xScale, yScales);
                lastNearestDataPoint = nearestDataPoint;
            }
        })
        .on("click", function(event) {
            const mouseX = event.layerX - margin.left - paddingLeft;
            const nearestDataPoint = getNearestDataPoint(mouseX, data, xScale);
            updateSelectionLabels(nearestDataPoint);
            updateSelectedHighlight(nearestDataPoint, xScale, yScales);
        });
}

function updateAnimatedLabels(data) {
    d3.select("#candlestick-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">Date/Time:</tspan> ${data.Time} &emsp; <tspan font-weight="bold">Open:</tspan> ${data.Open} &emsp; <tspan font-weight="bold">High:</tspan> ${data.High} &emsp; <tspan font-weight="bold">Low:</tspan> ${data.Low} &emsp; <tspan font-weight="bold">Close:</tspan> ${data.Close}`);
    d3.select("#volume-histogram").select(".animated-label")
        .html(`<tspan font-weight="bold">Volume:</tspan> ${formatVolume(data.Volume)}`);
    d3.select("#log-return-line-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">Log-Return:</tspan> ${formatLogReturn(data.Log_Return)}`);
    d3.select("#atr-line-chart").select(".animated-label")
        .html(`<tspan font-weight="bold">ATR:</tspan> ${formatPriceInPips(data.ATR)}`);
}

function updateSelectionLabels(data) {
    const candlestickLabel = d3.select("#candlestick-chart").select(".selection-label");
    const volumeLabel = d3.select("#volume-histogram").select(".selection-label");
    const logReturnLabel = d3.select("#log-return-line-chart").select(".selection-label");
    const atrLabel = d3.select("#atr-line-chart").select(".selection-label");
    if (lastClickedDate === data.Time) {
        const isHidden = candlestickLabel.style("display") === "none";
        const displayValue = isHidden ? "block" : "none";
        candlestickLabel.style("display", displayValue);
        volumeLabel.style("display", displayValue);
        logReturnLabel.style("display", displayValue);
        atrLabel.style("display", displayValue);
        lastClickedDate = isHidden ? data.Time : null;
    } else {
        candlestickLabel.html(`<tspan font-weight="bold">Date/Time:</tspan> ${data.Time} &emsp; <tspan font-weight="bold">Open:</tspan> ${data.Open} &emsp; <tspan font-weight="bold">High:</tspan> ${data.High} &emsp; <tspan font-weight="bold">Low:</tspan> ${data.Low} &emsp; <tspan font-weight="bold">Close:</tspan> ${data.Close}`).style("display", "block");
        volumeLabel.html(`<tspan font-weight="bold">Volume:</tspan> ${formatVolume(data.Volume)}`).style("display", "block");
        logReturnLabel.html(`<tspan font-weight="bold">Log-Return:</tspan> ${formatLogReturn(data.Log_Return)}`).style("display", "block");
        atrLabel.html(`<tspan font-weight="bold">ATR:</tspan> ${formatPriceInPips(data.ATR)}`).style("display", "block");
        lastClickedDate = data.Time;
    }
}

function updateAnimatedHighlight(nearestDataPoint, xScale, yScales) {
    d3.selectAll(".highlighted").classed("highlighted", false);
    d3.selectAll(".highlighted-circle").remove();

    const candlestickSvg = d3.select("#candlestick-chart svg g");
    candlestickSvg.selectAll(".bar, .line")
        .filter(d => d.Time === nearestDataPoint.Time)
        .classed("highlighted", true);

    const volumeSvg = d3.select("#volume-histogram svg g");
    volumeSvg.selectAll(".bar")
        .filter(d => d.Time === nearestDataPoint.Time)
        .classed("highlighted", true);

    const logReturnSvg = d3.select("#log-return-line-chart svg g");
    const logReturnCircle = logReturnSvg.selectAll(".highlighted-circle")
        .data([nearestDataPoint]);

    logReturnCircle.enter().append("circle")
        .attr("class", "highlighted-circle")
        .attr("r", 5)
        .attr("fill", "#ad2aee")
        .merge(logReturnCircle)
        .attr("cx", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("cy", d => yScales.logReturn(d.Log_Return));

    logReturnCircle.exit().remove();

    const atrSvg = d3.select("#atr-line-chart svg g");
    const atrCircle = atrSvg.selectAll(".highlighted-circle")
        .data([nearestDataPoint]);

    atrCircle.enter().append("circle")
        .attr("class", "highlighted-circle")
        .attr("r", 5)
        .attr("fill", "#ad2aee")
        .merge(atrCircle)
        .attr("cx", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("cy", d => yScales.atr(d.ATR));

    atrCircle.exit().remove();
}

function updateSelectedHighlight(nearestDataPoint, xScale, yScales) {
    d3.selectAll(".selected").classed("selected", false);
    d3.selectAll(".selected-circle").remove();

    if (lastHighlightedDate !== nearestDataPoint.Time) {
        const candlestickSvg = d3.select("#candlestick-chart svg g");
        candlestickSvg.selectAll(".bar, .line")
            .filter(d => d.Time === nearestDataPoint.Time)
            .classed("selected", true);

        const volumeSvg = d3.select("#volume-histogram svg g");
        volumeSvg.selectAll(".bar")
            .filter(d => d.Time === nearestDataPoint.Time)
            .classed("selected", true);

        const logReturnSvg = d3.select("#log-return-line-chart svg g");
        logReturnSvg.append("circle")
            .attr("class", "selected-circle")
            .attr("r", 5)
            .attr("fill", "#ad2aee")
            .attr("cx", xScale(nearestDataPoint.Time) + xScale.bandwidth() / 2)
            .attr("cy", yScales.logReturn(nearestDataPoint.Log_Return));

        const atrSvg = d3.select("#atr-line-chart svg g");
        atrSvg.append("circle")
            .attr("class", "selected-circle")
            .attr("r", 5)
            .attr("fill", "#ad2aee")
            .attr("cx", xScale(nearestDataPoint.Time) + xScale.bandwidth() / 2)
            .attr("cy", yScales.atr(nearestDataPoint.ATR));

        lastHighlightedDate = nearestDataPoint.Time;
    } else {
        lastHighlightedDate = null;
    }
}


function createVerticalLine(data, xScale, yScales) {
    const container = document.getElementById("charts-section");
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const height = container.offsetHeight - margin.top - margin.bottom;

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
    attachMouseEvents(data, container, verticalLine, xScale, yScales, paddingLeft);
}

function updateVerticalLine(data, xScale, yScales) {
    const container = document.getElementById("charts-section");
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const verticalLine = d3.select(container).select(".vertical-line");
    attachMouseEvents(data, container, verticalLine, xScale, yScales, paddingLeft);
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