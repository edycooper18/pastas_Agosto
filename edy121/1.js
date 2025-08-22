document.addEventListener('DOMContentLoaded', () => {
    const metricsGridEl = document.getElementById('metrics-grid');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = messageBox.querySelector('.action-button');
    const metrics = [
        {
            id: 'sales',
            title: 'Vendas Mensais',
            value: 12500,
            unit: 'R$',
            trend: 0,
            updateFn: (currentValue) => {
                const change = Math.random() * 500 - 250;
                return Math.max(0, currentValue + change);
            }
        },
        { 
            id: 'visitors',
            title: 'Visitantes Online',
            value: 850,
            unit: '$',
            trend: 0,
            updateFn: (currentValue) => {
                const change = Math.random() * 50 - 25;
                return Math.max(0, Math.round(currentValue + change));
            }
        },
        {
            id: 'conversion',
            title: 'Conversões em Clientes',
            value: 2.5,
            unit: '$',
            trend: 0,
            updateFn: (currentValue) => {
                const change = Math.random() * 0.2 - 0.1;
                return Math.max(0, Math.min(100, parseFloat((currentValue + change).toFixed(2))));
            }
        },
        {
            id: 'support-tickets',
            title: 'Suportes Realizados',
            value: 15,
            unit: '',
            trend: 0,
            updateFn: (currentValue) => {
                const change = Math.random() * 5 - 2;
                return Math.max(0, Math.round(currentValue + change));
            }
        }
    ];
    const UPDATE_INTERVAL = 3000;
    let updateIntervalId = null;
    //@param {string} message
    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'flex';
    }
    function hideMessage() {
        messageBox.style.display = 'none';
    }
    function renderMetrics() {
        metricsGridEl.innerHTML = '';
        metrics.forEach(metric => {
            const metricBlock = document.createElement('div');
            metricBlock.classList.add('metric-block');
            metricBlock.dataset.metricId = metric.id;

            let trendIcon = '';
            let trendClass = '';
            if (metric.trend === 1) {
                trendIcon = '⬆';
                trendClass = 'up';
            } else if (metric.trend === -1) {
                trendIcon = '⬇';
                trendClass = 'down';
            }
            metricBlock.innerHTML = `
            <h3>${metric.title}</h3>
            <p class='metric-value'>${metric.unit}${metric.value.toLocaleString('pt-BR')}</p>
            <p class='metric-trend ${trendClass}'>${trendIcon} Última Atualização</p>`;
            metricsGridEl.appendChild(metricBlock);
        });
    }
    //@param {Object} metric
    function updateMetricValue(metric) {
        const oldValue = metric.value;
        metric.value = metric.updateFn(oldValue);
        if (metric.value > oldValue) {
            metric.trend = 1;
        } else if (metric.value < oldValue) {
            metric.trend = -1;
        } else {
            metric.trend = 0;
        }
        const metricBlockEl = document.querySelector(`.metric-block[data-metric-id='${metric.id}']`);
        if (metricBlockEl) {
            const valueEl = metricBlockEl.querySelector('.metric-value');
            const trendEl = metricBlockEl.querySelector('.metric-trend');

            valueEl.textContent = `${metric.unit}${metric.value.toLocaleString('pt-BR')}`;

            trendEl.classList.remove('up', 'down');
            let trendIcon = '';
            if (metric.trend === 1) {
                trendIcon = '⬆';
                trendEl.classList.add('up');
            } else if (metric.trend === -1) {
                trendIcon = '⬇';
                trendEl.classList.add('down');
            }
            trendEl.textContent = `${trendIcon} Última Atualização`;

            metricBlockEl.classList.remove('updating');
            void metricBlockEl.offsetWidth;
            metricBlockEl.classList.add('updating');
        }
    }

    function updateAllMetric() {
        metrics.forEach(metric => {
            updateMetricValue(metric);
        });
    }

    function startUpdating() {
        if (updateIntervalId) {
            clearInterval(updateIntervalId);
        }
        updateIntervalId = setInterval(updateAllMetric, UPDATE_INTERVAL);
        showMessage('Atualização em tempo real iniciada!');
    }

    function stopUpdating() {
        if (updateIntervalId) {
            clearInterval(updateIntervalId);
            updateIntervalId = null;
            showMessage('Atualização em tempo real pausada.');
        }
    }

    closeMessageBtn.addEventListener('click', hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            hideMessage();
        }
    });

    function initializeDashboard() {
        renderMetrics();
        startUpdating();
    }

    initializeDashboard();
});