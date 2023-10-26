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
    createCandlestickChart(totalData, "candlestick-chart");
    createVolumeHistogram(totalData, "volume-histogram");
    createLogReturnChart(totalData, "log-return-line-chart");
    createATRChart(totalData, "atr-line-chart");
    createVerticalLine(totalData);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}

async function updateDashboard() {
    await selectData();
    updateCandlestickChart(totalData, "candlestick-chart");
    updateVolumeHistogram(totalData, "volume-histogram");
    updateLogReturnChart(totalData, "log-return-line-chart");
    updateATRChart(totalData, "atr-line-chart");
    updateVerticalLine(totalData);
    toggleElement('sma20-toggle');
    toggleElement('sma50-toggle');
    toggleElement('bollinger-toggle');
    toggleElement('news-toggle');
}
