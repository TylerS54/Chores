class ChoreManager {
    constructor() {
        this.chores = [];
        this.completedChores = [];
        this.loadFromStorage();
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.choreInput = document.getElementById('choreInput');
        this.addChoreBtn = document.getElementById('addChoreBtn');
        this.rollDiceBtn = document.getElementById('rollDiceBtn');
        this.diceContainer = document.getElementById('diceContainer');
        this.diceInfo = document.getElementById('diceInfo');
        this.selectedChore = document.getElementById('selectedChore');
        this.choresList = document.getElementById('choresList');
        this.completedChoresList = document.getElementById('completedChoresList');
        this.clearAllBtn = document.getElementById('clearAllBtn');
    }

    bindEvents() {
        this.addChoreBtn.addEventListener('click', () => this.addChore());
        this.choreInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addChore();
        });
        this.rollDiceBtn.addEventListener('click', () => this.rollDice());
        this.clearAllBtn.addEventListener('click', () => this.clearAllChores());
    }

    getDiceSides(numChores) {
        // Use the smallest die that can accommodate all chores
        if (numChores <= 6) return 6;
        if (numChores <= 8) return 8;
        if (numChores <= 10) return 10;
        if (numChores <= 12) return 12;
        if (numChores <= 20) return 20;
        // For more than 20, use a D20 and cycle through
        return 20;
    }

    updateDiceDisplay() {
        this.diceContainer.innerHTML = '';
        
        if (this.chores.length === 0) {
            this.diceInfo.textContent = '';
            return;
        }

        const sides = this.getDiceSides(this.chores.length);
        this.diceInfo.textContent = `Rolling D${sides} for ${this.chores.length} chore${this.chores.length === 1 ? '' : 's'}`;
        
        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.textContent = '?';
        this.diceContainer.appendChild(dice);
    }

    addChore() {
        const choreText = this.choreInput.value.trim();
        if (choreText === '') return;

        const chore = {
            id: Date.now(),
            text: choreText,
            completed: false
        };

        this.chores.push(chore);
        this.choreInput.value = '';
        this.saveToStorage();
        this.render();
    }

    deleteChore(id) {
        this.chores = this.chores.filter(chore => chore.id !== id);
        this.completedChores = this.completedChores.filter(chore => chore.id !== id);
        this.saveToStorage();
        this.render();
    }

    rollDice() {
        if (this.chores.length === 0) return;

        const dice = this.diceContainer.querySelector('.dice');
        const sides = this.getDiceSides(this.chores.length);
        
        // Disable button during animation
        this.rollDiceBtn.disabled = true;
        this.selectedChore.textContent = '';
        this.selectedChore.classList.remove('reveal');

        // Add dramatic effects
        this.addShakeEffect();
        this.addSpotlightEffect();

        // Add rolling animation
        dice.classList.add('rolling');

        // Simulate dice rolling with random numbers
        const rollDuration = 1200;
        const rollInterval = 80;
        let rollCount = 0;
        const maxRolls = rollDuration / rollInterval;

        const rollAnimation = setInterval(() => {
            const randomValue = Math.floor(Math.random() * sides) + 1;
            dice.textContent = randomValue;
            rollCount++;

            if (rollCount >= maxRolls) {
                clearInterval(rollAnimation);
                this.finishRoll(sides);
            }
        }, rollInterval);
    }

    addShakeEffect() {
        const diceSection = document.querySelector('.dice-section');
        diceSection.classList.add('shake');
        setTimeout(() => {
            diceSection.classList.remove('shake');
        }, 500);
    }

    addSpotlightEffect() {
        this.diceContainer.classList.add('spotlight');
        setTimeout(() => {
            this.diceContainer.classList.remove('spotlight');
        }, 2000);
    }

    createParticleExplosion() {
        const particles = document.createElement('div');
        particles.className = 'particles';
        this.diceContainer.appendChild(particles);

        // Create multiple particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position around the dice
            const angle = (i / 12) * 2 * Math.PI;
            const distance = 60 + Math.random() * 40;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.left = `calc(50% + ${x}px)`;
            particle.style.top = `calc(50% + ${y}px)`;
            
            particles.appendChild(particle);
        }

        // Remove particles after animation
        setTimeout(() => {
            if (particles.parentNode) {
                particles.parentNode.removeChild(particles);
            }
        }, 1000);
    }

    createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '1000';
        document.body.appendChild(confettiContainer);

        // Reduce confetti count on mobile for better performance
        const isMobile = window.innerWidth <= 768;
        const confettiCount = isMobile ? 30 : 50;

        // Create confetti pieces
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confettiContainer.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 4000);
    }

    finishRoll(sides) {
        const dice = this.diceContainer.querySelector('.dice');
        
        // Remove rolling animation
        dice.classList.remove('rolling');

        // Get final roll result
        const rollResult = Math.floor(Math.random() * sides) + 1;
        dice.textContent = rollResult;

        // Add final reveal animation
        dice.classList.add('final-reveal');
        setTimeout(() => {
            dice.classList.remove('final-reveal');
        }, 800);

        // Create particle explosion
        this.createParticleExplosion();

        // Map roll to chore (cycle through if more chores than sides)
        const choreIndex = (rollResult - 1) % this.chores.length;
        const selectedChore = this.chores[choreIndex];

        // Delayed reveal of the selected chore with animation
        setTimeout(() => {
            this.selectedChore.innerHTML = `
                <div style="font-size: 1.1rem; margin-bottom: 8px; color: #ffd700; font-weight: 600;">🎲 Rolled: ${rollResult}</div>
                <div style="font-size: 1.4rem; color: #28a745; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); line-height: 1.3;">${selectedChore.text}</div>
            `;
            this.selectedChore.classList.add('reveal');

            // Add confetti for extra celebration
            this.createConfetti();

            // Add haptic feedback on mobile devices
            this.addHapticFeedback();
        }, 400);

        // Move chore to completed after a delay
        setTimeout(() => {
            this.chores.splice(choreIndex, 1);
            selectedChore.completed = true;
            this.completedChores.push(selectedChore);

            // Save and render
            this.saveToStorage();
            this.render();

            // Re-enable button
            this.rollDiceBtn.disabled = false;
        }, 1500);
    }

    addHapticFeedback() {
        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    clearAllChores() {
        if (confirm('Are you sure you want to clear all chores?')) {
            this.chores = [];
            this.completedChores = [];
            this.selectedChore.textContent = '';
            this.saveToStorage();
            this.render();
        }
    }

    render() {
        this.renderChoresList();
        this.renderCompletedChoresList();
        this.updateRollButton();
        this.updateDiceDisplay();
    }

    renderChoresList() {
        this.choresList.innerHTML = '';

        if (this.chores.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No chores added yet. Add some chores to get started!';
            this.choresList.appendChild(emptyState);
            return;
        }

        this.chores.forEach(chore => {
            const li = document.createElement('li');
            li.className = 'chore-item';
            li.innerHTML = `
                <span class="chore-text">${this.escapeHtml(chore.text)}</span>
                <button class="delete-btn" onclick="choreManager.deleteChore(${chore.id})">Delete</button>
            `;
            this.choresList.appendChild(li);
        });
    }

    renderCompletedChoresList() {
        this.completedChoresList.innerHTML = '';

        if (this.completedChores.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No completed chores yet.';
            this.completedChoresList.appendChild(emptyState);
            return;
        }

        this.completedChores.forEach(chore => {
            const li = document.createElement('li');
            li.className = 'chore-item completed';
            li.innerHTML = `
                <span class="chore-text">${this.escapeHtml(chore.text)}</span>
                <button class="delete-btn" onclick="choreManager.deleteChore(${chore.id})">Delete</button>
            `;
            this.completedChoresList.appendChild(li);
        });
    }

    updateRollButton() {
        this.rollDiceBtn.disabled = this.chores.length === 0;
        if (this.chores.length === 0) {
            this.rollDiceBtn.textContent = 'Add chores to roll!';
        } else {
            this.rollDiceBtn.textContent = `Roll the Dice! (${this.chores.length} chores)`;
        }
    }

    saveToStorage() {
        const data = {
            chores: this.chores,
            completedChores: this.completedChores
        };
        localStorage.setItem('choreManager', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('choreManager');
        if (data) {
            const parsed = JSON.parse(data);
            this.chores = parsed.chores || [];
            this.completedChores = parsed.completedChores || [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.choreManager = new ChoreManager();
});