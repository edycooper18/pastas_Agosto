document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stock-chart');
    const ctx = canvas.getContext('2d');
    const currentPriceSpan = document.getElementById('current-price');
    const priceChangeSpan = document.getElementById('price-change');
    const startSimulationBtn = document.getElementById('start-simulation-btn');
    const stopSimulationBtn = document.getElementById('stop-simulation-btn');
    const resetChartBtn = document.getElementById('reset-chart-btn');
    const MAX_DATA_POINTS = 50;
    const UPDATE_INTERVAL_MS = 500;
    let priceHistory = [];
    let animationFrameId = null;
    let isSimulating = false;
    let lastPrice = 100.00;
    let timeIndex = 0;
    function formatCurrency(value){
        return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    }
    function drawChart() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        if (priceHistory.length < 2) {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhum dado para exibir no gráfico.', canvas.width / 2, canvas.height / 2);
            return;
        }
        const minPrice = Math.min(...priceHistory);
        const maxPrice = Math.max(...priceHistory);
        const priceRange = maxPrice - minPrice;
        const padding = 30;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const effectivePriceRange = priceRange === 0 ? (maxPrice === 0 ? 0 : maxPrice * 0.1) : priceRange;
        const effectiveMinPrince = priceRange === 0 ? (maxPrice === 0 ? 0 : minPrice - (maxPrice * 0.05)) : minPrice;
        const yAxisSteps = 5;
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= yAxisSteps; i++) {
            const y = padding + chartHeight - (i / yAxisSteps) * chartHeight;
            const priceValue = effectiveMinPrince + (i / yAxisSteps) * effectivePriceRange;
            ctx.fillText(formatCurrency(priceValue), padding - 5, y);
            ctx.beginPath();
            ctx.strokeStyle = '#eee';
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#007bff';
        if (priceHistory.length > 1) {
            const initialVisiblePrice = priceHistory[0];
            const finalVisiblePrice = priceHistory[priceHistory.length - 1];
            if (finalVisiblePrice > initialVisiblePrice) {
                ctx.strokeStyle = '#28a745';
            } else if (finalVisiblePrice < initialVisiblePrice) {
                ctx.strokeStyle = '#dc3545';
            }
        }
        priceHistory.forEach((price, index) => {
            const x = padding + (index / (MAX_DATA_POINTS - 1)) * chartWidth;
            const y = padding + chartHeight - ((price - effectiveMinPrince)/ effectivePriceRange) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        const lastX = padding + ((priceHistory.length - 1) / (MAX_DATA_POINTS - 1)) * chartWidth;
        const lastY = padding + chartHeight - ((priceHistory[priceHistory.length - 1] - effectiveMinPrince) / effectivePriceRange) * chartHeight;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4,0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
    }
    function generateNextPrice(currentPrice) {
        const volatility = 0.5;
        const trendFactor = 0.0005;
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const trendChange = currentPrice * trendFactor * (Math.random() > 0.5 ? 1 : -1);
        let newPrice = currentPrice + randomChange + trendChange;
        if (newPrice < 1.00) {
            newPrice = 1.00 + Math.random() * 0.5;
        }
        return parseFloat(newPrice.toFixed(2));
    }
    function updateStockData() {
        const newPrice = generateNextPrice(lastPrice);
        const change = newPrice - lastPrice;
        const percentageChange = (change / lastPrice) * 100;
        currentPriceSpan.textContent = formatCurrency(newPrice);
        priceChangeSpan.textContent = `(${change > 0 ? '+' : ''}${percentageChange.toFixed(2)}%)`;
        priceChangeSpan.classList.remove('change-positive', 'change-negative', 'change-neutral');
        if (change > 0) {
            priceChangeSpan.classList.add('change-positive');
            currentPriceSpan.style.color = COLORS.POSITIVE_PRICE;
        } else if (change < 0) {
            priceChangeSpan.classList.add('change-negative');
            currentPriceSpan.style.color = COLORS.NEGATIVE_PRICE;
        } else {
            priceChangeSpan.classList.add('change-neutral');
            currentPriceSpan.style.color = COLORS.NEUTRAL_PRICE;
        }
        lastPrice = newPrice;
        priceHistory.push(newPrice);
        if (priceHistory.length > MAX_DATA_POINTS) {
            priceHistory.shift();
        }
        drawChart();
    }
    const COLORS = {
        POSITIVE_PRICE: '#28A745',
        NEGATIVE_PRICE: '#DC3545',
        NEUTRAL_PRICE: '#333'
    };
    let intervalId = null;
    function startSimulation() {
        if (isSimulating) return;

        isSimulating = true;
        startSimulationBtn.disabled = true;
        stopSimulationBtn.disabled = false;
        resetChartBtn.disabled = true;
        updateStockData();
        intervalId = setInterval(updateStockData, UPDATE_INTERVAL_MS);
    }
    function stopSimulation() {
        if (!isSimulating) return;

        isSimulating = false;
        clearInterval(intervalId);
        intervalId = null;
        startSimulationBtn.disabled = false;
        stopSimulationBtn.disabled = true;
        resetChartBtn.disabled = false;
    }
    function resetChart() {
        stopSimulation();
        priceHistory = [];
        lastPrice = 100.00;
        timeIndex = 0;
        currentPriceSpan.textContent = formatCurrency(lastPrice);
        priceChangeSpan.textContent = '(+0,00%)';
        priceChangeSpan.className = 'change-neutral';
        currentPriceSpan.style.color = COLORS.NEUTRAL_PRICE;
        drawChart();
        startSimulationBtn.disabled = false;
        stopSimulationBtn.disabled = true;
        resetChartBtn.disabled = false;
    }
    startSimulationBtn.addEventListener('click', startSimulation);
    stopSimulationBtn.addEventListener('click', stopSimulation);
    resetChartBtn.addEventListener('click', resetChart);

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawChart();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    stopSimulation();
    drawChart();
});