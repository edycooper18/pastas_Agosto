document.addEventListener('DOMContentLoaded', () => {
    const codeDataInput = document.getElementById('code-data');
    const toolButtons = document.querySelectorAll('.tool-button');
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const saveCodeBtn = document.getElementById('save-code-btn');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const codeCanvas = document.getElementById('code-canvas');
    const ctx = codeCanvas.getContext('2d');
    const canvasMessage = document.getElementById('canvas-message');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = messageBox.querySelector('.action-button');
    let selectedCodeType = 'barcode';
    const QR_CODE_SIZE = 256;
    const BARCODE_WIDTH = 400;
    const BARCODE_HEIGHT = 150;

    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'flex';
    }
    function hideMessage() {
        messageBox.style.display = 'none';
    }
    function clearCanvas() {
        ctx.clearRect(0, 0, codeCanvas.clientWidth, codeCanvas.height);
        codeCanvas.style.display = 'none';
        canvasMessage.style.display = 'block';
    }
    async function generateCode() {
        const data = codeDataInput.value.trim();
        if (!data) {
            showMessage('Por favor, digite od dados para gerar o código.');
            return;
        }
        clearCanvas();
        codeCanvas.style.display = 'block';
        canvasMessage.style.display = 'none';
        if (selectedCodeType === 'barcode') {
            codeCanvas.width = BARCODE_WIDTH;
            codeCanvas.height = BARCODE_HEIGHT;
            try {
                JsBarcode(codeCanvas, data, {
                    format: 'CODE128',
                    displayValue: true,
                    fontSize: 18,
                    height: BARCODE_HEIGHT * 0.7,
                    width: 2,
                    margin: 10,
                    lineColor: '#000000'
                });
                showMessage('Código de barras gerado com sucesso!');
            } catch (error) {
                showMessage(`Erro ao gerar Código de Barras: ${error.message}. Verifique os dados.`);
                clearCanvas();
            }
        } else if (selectedCodeType === 'qrcode') {
            codeCanvas.width = QR_CODE_SIZE;
            codeCanvas.height = QR_CODE_SIZE;
            try {
                const tempDiv = document.createElement('div');
                const qrcodeSvgInstange = new QRcode(tempDiv, {
                    text: data,
                    width: QR_CODE_SIZE,
                    height: QR_CODE_SIZE,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRcode.CorrenctLevel.H,
                });
                await new Promise(resolve => setTimeout(resolve, 50));
                const qrCanvas = tempDiv.querySelector('canvas');
                if (qrCanvas) {
                    ctx.clearRect(0, 0, codeCanvas.width, codeCanvas.height);
                    ctx.drawImage(qrCanvas, 0, 0, QR_CODE_SIZE, QR_CODE_SIZE);
                    showMessage('QR Code gerado com sucesso!');
                } else {
                    showMessage('Erro: Não for possível renderizar o QR Code no canvas temporário.');
                    clearCanvas();
                }
            } catch (error) {
                showMessage(`Erro ao gerar QR Code: ${error.message}. verifique os dados.`);
                clearCanvas();
            }
        }
    }
    async function saveCode() {
        if (!codeCanvas || codeCanvas.width === 0 || codeCanvas.height === 0 || codeCanvas.style.display === 'none' || codeCanvas.offsetHeight === 0 || codeCanvas.offsetWidth === 0) {
            showMessage('Nenhum código gerado apra salvar ou o código não está pronto. Por favor, gere um código primeiro.');
            return;
        }
        const dataURL = codeCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${selectedCodeType}_${Data.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('Imagem salva com sucesso!');
    }
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedCodeType = button.dataset.codeType;
            showMessage(`Tipo de código selecionado: ${button.textContent.trim()}`);
            clearCanvas();
        });
    });
    generateCodeBtn.addEventListener('click',generateCode);
    saveCodeBtn.addEventListener('click',saveCode);
    clearCanvasBtn.addEventListener('click',clearCanvas);
    closeMessageBtn.addEventListener('click',hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            hideMessage();
        }
    });
    generateCode();
});