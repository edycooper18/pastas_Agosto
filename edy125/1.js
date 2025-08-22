document.addEventListener('DOMContentLoaded', () => {
    // 1. Definição dos elementos HTML
    const playerNameEl = document.getElementById('player-name');
    const playerHealthBar = document.getElementById('player-health-bar');
    const playerHealthText = document.getElementById('player-health-text');
    const playerImage = document.getElementById('player-image');
    const playerAbilitiesContainer = document.getElementById('player-abilities');
    
    const monsterNameEl = document.getElementById('monster-name');
    const monsterHealthBar = document.getElementById('monster-health-bar');
    const monsterHealthText = document.getElementById('monster-health-text');
    const monsterImage = document.getElementById('monster-image');
    
    const combatLogEl = document.getElementById('combat-log');
    
    const gameOverModal = document.getElementById('game-over-modal');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');
    const restartGameBtn = document.getElementById('restart-game-btn');

    // 2. Definição das classes de personagens e variáveis de estado
    let player = {};
    let monster = {};
    let currentTurn = 'player';
    let gameEnded = false;

    const playerBase = {
        name: 'Sir Galahad',
        maxHp: 100,
        currentHp: 100,
        attack: 15,
        defense: 5,
        abilities: [
            { name: 'Espadada', damage: 20, effect: null, description: 'Um golpe forte de espada.' },
            { name: 'Escudo Protetor', damage: 0, effect: 'defense_boost', description: 'Aumenta sua defesa por um turno.' },
            { name: 'Ataque Rápido', damage: 10, effect: 'double_attack', description: 'Causa dano menos duas vezes.' }
        ],
        effects: {
            defense_boost: 0
        }
    };

    const monsterBase = {
        name: 'Goblin Bruto',
        maxHp: 80,
        currentHp: 80,
        attack: 12,
        defense: 3,
        abilities: [
            { name: 'Clava Pesada', damage: 18, effect: null },
            { name: 'Grito Ameaçador', damage: 0, effect: 'weaken_player' }
        ],
        effects: {
            weaken_player: 0
        }
    };

    // 3. Funções de controle do jogo
    function getHealthColor(currentHp, maxHp) {
        const percentage = (currentHp / maxHp) * 100;
        if (percentage > 50) return '#2ecc71';
        if (percentage > 20) return '#f1c40f';
        return '#e74c3c';
    }

    function updateUI() {
        playerNameEl.textContent = player.name;
        playerHealthBar.style.width = `${(player.currentHp / player.maxHp) * 100}%`;
        playerHealthText.textContent = `${player.currentHp}/${player.maxHp}HP`;
        playerHealthBar.style.backgroundColor = getHealthColor(player.currentHp, player.maxHp);

        monsterNameEl.textContent = monster.name;
        monsterHealthBar.style.width = `${(monster.currentHp / monster.maxHp) * 100}%`;
        monsterHealthText.textContent = `${monster.currentHp}/${monster.maxHp}HP`;
        monsterHealthBar.style.backgroundColor = getHealthColor(monster.currentHp, monster.maxHp);
    }

    function addLogMessage(message, type) {
        const logEntry = document.createElement('p');
        logEntry.classList.add('log-message', type);
        logEntry.textContent = message;
        combatLogEl.appendChild(logEntry);
        combatLogEl.scrollTop = combatLogEl.scrollHeight;
    }

    function enablePlayerAbilities(enable) {
        playerAbilitiesContainer.querySelectorAll('.ability-button').forEach(button => {
            button.disabled = !enable;
        });
    }

    function checkGameEnd() {
        if (player.currentHp <= 0) {
            player.currentHp = 0;
            updateUI();
            endGame('Derrota!', 'Você foi derrotado pelo monstro!');
            return true;
        }
        if (monster.currentHp <= 0) {
            monster.currentHp = 0;
            updateUI();
            endGame('Vitória!', 'Você derrotou o monstro!');
            return true;
        }
        return false;
    }

    function endGame(title, message) {
        gameEnded = true;
        enablePlayerAbilities(false);
        gameOverTitle.textContent = title;
        gameOverMessage.textContent = message;
        gameOverModal.style.display = 'flex';
    }

    async function playerAttack(ability) {
        if (currentTurn !== 'player' || gameEnded) return;

        enablePlayerAbilities(false);
        addLogMessage(`${player.name} usou ${ability.name}!`, 'player-turn');
        
        let damageDealt = ability.damage;
        let actualDamage = Math.max(0, damageDealt - monster.defense);

        if (ability.effect === 'defense_boost') {
            player.effects.defense_boost = 2; // Dura 2 turnos (1 para o jogador e 1 para o monstro)
            addLogMessage(`${player.name} aumentou sua defesa!`, 'player-turn');
            actualDamage = 0;
        } else if (ability.effect === 'double_attack') {
            monster.currentHp -= actualDamage;
            addLogMessage(`${player.name} causou ${actualDamage} de dano.`, 'player-turn');
            updateUI();
            
            if (checkGameEnd()) return;
            await new Promise(resolve => setTimeout(resolve, 700));

            addLogMessage(`${player.name} atacou novamente!`, 'player-turn');
            actualDamage = Math.max(0, ability.damage - monster.defense);
            monster.currentHp -= actualDamage;
            addLogMessage(`${player.name} causou ${actualDamage} de dano.`, 'player-turn');
        } else {
            monster.currentHp -= actualDamage;
            addLogMessage(`${player.name} causou ${actualDamage} de dano.`, 'player-turn');
        }

        updateUI();
        if (checkGameEnd()) return;

        applyEffects();
        await new Promise(resolve => setTimeout(resolve, 1500));
        currentTurn = 'monster';
        monsterTurn();
    }

    async function monsterTurn() {
        if (gameEnded) return;

        addLogMessage(`${monster.name}'s turno!`, 'monster-turn');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const randomAbility = monster.abilities[Math.floor(Math.random() * monster.abilities.length)];
        addLogMessage(`${monster.name} usou ${randomAbility.name}!`, 'monster-turn');

        let damageDealt = randomAbility.damage;
        let actualDamage = Math.max(0, damageDealt - player.defense);

        if (player.effects.defense_boost > 0) {
            const boostedDamage = Math.floor(actualDamage * 0.5);
            addLogMessage(`O ${player.name} defendeu parte do ataque! (-${actualDamage - boostedDamage} de dano)`, 'player-turn');
            actualDamage = boostedDamage;
        }

        if (randomAbility.effect === 'weaken_player') {
            monster.effects.weaken_player = 2; // Dura 2 turnos (1 para o jogador e 1 para o monstro)
            addLogMessage(`${monster.name} enfraqueceu o ${player.name}!`, 'monster-turn');
            actualDamage = 0;
        }
        
        player.currentHp -= actualDamage;
        addLogMessage(`${monster.name} causou ${actualDamage} de dano.`, 'monster-turn');

        updateUI();
        if (checkGameEnd()) return;
        
        applyEffects();
        await new Promise(resolve => setTimeout(resolve, 1500));

        currentTurn = 'player';
        enablePlayerAbilities(true);
    }

    function applyEffects() {
        if (player.effects.defense_boost > 0) {
            player.effects.defense_boost--;
            if (player.effects.defense_boost === 0) {
                addLogMessage(`${player.name}'s defesa voltou ao normal.`, 'game-event');
            }
        }
        if (monster.effects.weaken_player > 0) {
            monster.effects.weaken_player--;
            if (monster.effects.weaken_player === 0) {
                addLogMessage(`${player.name} não está mais enfraquecido.`, 'game-event');
            }
        }
    }

    function createAbilityButtons() {
        playerBase.abilities.forEach(ability => {
            const button = document.createElement('button');
            button.classList.add('ability-button');
            button.textContent = ability.name;
            button.title = ability.description;
            button.addEventListener('click', () => playerAttack(ability));
            playerAbilitiesContainer.appendChild(button);
        });
    }

    function initializeGame() {
        player = JSON.parse(JSON.stringify(playerBase));
        monster = JSON.parse(JSON.stringify(monsterBase));
        currentTurn = 'player';
        gameEnded = false;
        combatLogEl.innerHTML = '';
        gameOverModal.style.display = 'none';
        updateUI();
        addLogMessage('A batalha começou!', 'game-event');
        enablePlayerAbilities(true);
    }

    // 4. Inicialização do jogo e eventos de clique
    createAbilityButtons();
    restartGameBtn.addEventListener('click', initializeGame);
    initializeGame();

});