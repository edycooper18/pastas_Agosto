document.addEventListener('DOMContentLoaded', () => {

        const elements = {
            puzzleBoard: document.getElementById('puzzle-board'),
            shuffleButton: document.getElementById('shuffle-button'),
            resetButton: document.getElementById('reset-button'),
            winModal: document.getElementById('win-modal'),
            closeModalButton: document.getElementById('close-modal'),
        };


        const config = {
            imagePath: './img/cu.jpg',
            gridSize: 3,
            boardSize: 500
        };

        const { puzzleBoard, winModal} = elements;
        const { gridSize, boardSize, imagePath } = config;
        const totalTiles = gridSize * gridSize;
        const tileSize = boardSize / gridSize;
        let tiles = [];
        let emptyTileIndex = totalTiles - 1;

        Object.assign(puzzleBoard.style, {
            width: `${boardSize}px`,
            height: `${boardSize}px`,
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
        });

        const getPosition = index => ({
            row: Math.floor(index / gridSize),
            col: index % gridSize,
            bgX: -(index % gridSize) * tileSize,
            bgY: -Math.floor(index / gridSize) * tileSize
        });

        const createTile = (index) => {
            const tile = document.createElement('div');
            const { bgX, bgY } = getPosition(index);

            tile.className = 'puzzle-tile';
            tile.dataset.position = tile.dataset.currentPosition = index;

            Object.assign(tile.style, {
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                backgroundImage: `url(${imagePath})`,
                backgroundPosition: `${bgX}px ${bgY}px`,
                backgroundSize: `${boardSize}px`
            });

            if (index === emptyTileIndex) {
                tile.classList.add('empty');
                tile.style.backgroundImage = 'none';
            }

            tile.addEventListener('click', handleTileClick);
            return tile;
        };

        function initializePuzzle() {
            puzzleBoard.innerHTML = '';
            tiles = Array.from({ length: totalTiles }, (_, i) => {
                const tile = createTile(i);
                puzzleBoard.appendChild(tile);
                return tile;
            });
            shufflePuzzle();
        }
    function handleTileClick(e) {
        const clickedTile = e.target;
        if (clickedTile.classList.contains('empty')) return;

        const clickedIndex = +clickedTile.dataset.currentPosition;
        const {row: clickedRow, col: clickedCol } = getPosition(clickedIndex);
        const { row: emptyRow, col: emptyCol } = getPosition(emptyTileIndex);

        const isAdjacent = (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) || (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);
        if (isAdjacent) {
            swapTiles(clickedIndex, emptyTileIndex);
            if (checkWin()) showWinModal();
        }
    }
    function swapTiles(index1, index2) {
        const tile1 = tiles.find(t => +t.dataset.currentPosition === index1);
        const tile2 = tiles.find(t => +t.dataset.currentPosition === index2);
        if (!tile1 || !tile2) return;
        [tile1.style.order, tile2.style.order] = [tile2.style.order, tile1.style.order];
        [tile1.dataset.currentPosition, tile2.dataset.currentPosition] = [index2, index1];
        emptyTileIndex = index1;
    }
    function shufflePuzzle() {
        let currentPositions = Array.from({ length: totalTiles }, (_, i) => i);
        for (let i = currentPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentPositions[i], currentPositions[j]] = [currentPositions[j], currentPositions[i]];
        }
        const emptyPos = currentPositions.indexOf(totalTiles - 1);
        if (emptyPos !== totalTiles - 1) {
            [currentPositions[emptyPos], currentPositions[totalTiles - 1]] = [currentPositions[totalTiles - 1], currentPositions[emptyPos]];
        }
        tiles.forEach((tile, i) => {
            const newPos = currentPositions[i];
            tile.style.order = tile.dataset.currentPosition = newPos;
            if (newPos === totalTiles - 1) {
                tile.classList.add('empty');
                tile.style.backgroundImage = 'none';
                emptyTileIndex = newPos;
            } else {
                tile.classList.remove('empty');
                const { bgX, bgY } = getPosition(i);
                Object.assign(tile.style, {
                    backgroundImage: `url(${imagePath})`,
                    backgroundPosition: `${bgX}px ${bgY}px`
                });
            }
        });
    }
    const checkWin = () => tiles.every(tile => +tile.dataset.currentPosition === +tile.dataset.position);
    const showWinModal = () => winModal.style.display = 'flex';
    const hideWinModal = () => {
        winModal.style.display = 'none';
        resetGame();
    };
    function resetGame() {
        puzzleBoard.innerHTML = '';
        tiles = Array.from({length: totalTiles }, (_, i) => {
            const tile = createTile(i);
            tile.style.order = i;
            puzzleBoard.appendChild(tile);
            return tile;
        });
        emptyTileIndex = totalTiles - 1;
    }
    elements.shuffleButton.addEventListener('click', shufflePuzzle);
    elements.resetButton.addEventListener('click', resetGame);
    elements.closeModalButton.addEventListener('click', hideWinModal);
    
    initializePuzzle();
});