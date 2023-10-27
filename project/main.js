let priceData, newsData, totalData;
let pipSize, pipDigits;

const margin = { top: 10, right: 20, bottom: 20, left: 60 };

const parseSelectorDate = d3.timeParse("%Y-%m-%d %H:%M");
const parsePriceDate = d3.timeParse("%d.%m.%Y %H:%M:%S.%L");
const parseNewsDate = d3.timeParse("%m/%d/%Y %H:%M:%S");

async function selectPriceData(asset, start, end) {
    await d3.csv("data/" + asset + ".csv").then(data => {
        priceData = data.filter(d => {
            const date = parsePriceDate(d.Time);
            return date >= start && date <= end;
        });
    });
}

async function selectNewsData(base, quote, impact, start, end) {
    await d3.csv("data/news.csv").then(data => {
        newsData = data.filter(d => {
            const date = parseNewsDate(d.Time);
            return date >= start && date <= end && (d.Currency === base || d.Currency === quote) && d.Impact === impact
        });
    });
}

function mergePriceAndNewsData() {
    totalData = priceData.map(price => {
        const priceTime = parsePriceDate(price.Time);
        const newsForPrice = newsData.filter(news => {
            const newsTime = parseNewsDate(news.Time);
            newsTime.setMinutes(0, 0, 0);
            return newsTime.getTime() === priceTime.getTime();
        });
        return {
            ...price,
            News: newsForPrice
        };
    });
}

function determinePipSizeDigits() {
    const averageClose = d3.mean(priceData, d => +d.Close);
    if (averageClose > 2) {
        pipSize = 0.01;
        pipDigits = 3;
    } else {
        pipSize = 0.0001;
        pipDigits = 5;
    }
}

async function selectData() {
    const asset = document.getElementById("asset-selector").value;
    const base = asset.slice(0, 3);
    const quote = asset.slice(3);
    const startDate = document.getElementById("start-date").value;
    const startTime = document.getElementById("start-time").value;
    const endDate = document.getElementById("end-date").value;
    const endTime = document.getElementById("end-time").value;
    const impact = document.getElementById("news-selector").value;
    const start = parseSelectorDate(`${startDate} ${startTime}`);
    const end = parseSelectorDate(`${endDate} ${endTime}`);
    await selectPriceData(asset, start, end);
    determinePipSizeDigits();
    await selectNewsData(base, quote, impact, start, end);
    mergePriceAndNewsData();
}

async function createDashboard() {
    await selectData();
    const width = widthGenerator("charts-section", margin);
    const xScale = xScaleGenerator(totalData, width);
    const yScales = {
        candlestick: createCandlestickChart("candlestick-chart", totalData, width, xScale),
        volume: createVolumeHistogram("volume-histogram", totalData, width, xScale),
        logReturn: createLogReturnChart("log-return-line-chart", totalData, width, xScale),
        atr: createATRChart("atr-line-chart", totalData, width, xScale)
    }
    createVerticalLine(totalData, xScale, yScales);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}

async function updateDashboard() {
    await selectData();
    const width = widthGenerator("charts-section", margin);
    const xScale = xScaleGenerator(totalData, width);
    const yScales = {
        candlestick: updateCandlestickChart("candlestick-chart", totalData, width, xScale),
        volume: updateVolumeHistogram("volume-histogram", totalData, width, xScale),
        logReturn: updateLogReturnChart("log-return-line-chart", totalData, width, xScale),
        atr: updateATRChart("atr-line-chart", totalData, width, xScale)
    }
    updateVerticalLine(totalData, xScale, yScales);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}
