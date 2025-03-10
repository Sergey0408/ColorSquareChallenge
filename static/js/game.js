class ColorSquaresGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.attempts = 0;
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
            '#FF00FF', '#00FFFF', '#FFA500', '#800080',
            '#008000', '#FFC0CB'
        ];
        this.speeds = {
            slow: 20,
            medium: 30,
            fast: 40
        };
        this.currentSpeed = this.speeds.slow;
        this.squares = {
            falling: null,
            bottom: []
        };
        this.gameActive = false;

        this.initializeCanvas();
        this.setupEventListeners();
        this.showStartButton();
    }

    initializeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;

        this.squareSize = Math.min(this.canvas.width / 4, this.canvas.height / 8);
    }

    setupEventListeners() {
        document.getElementById('speed1').addEventListener('click', () => this.setSpeed('slow'));
        document.getElementById('speed2').addEventListener('click', () => this.setSpeed('medium'));
        document.getElementById('speed3').addEventListener('click', () => this.setSpeed('fast'));

        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        window.addEventListener('resize', () => {
            this.initializeCanvas();
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.hideStartButton();
            this.startGame();
        });
    }

    showStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.classList.remove('hidden');
        this.gameActive = false;
    }

    hideStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.classList.add('hidden');
    }

    setSpeed(speed) {
        const speeds = {
            'slow': this.speeds.slow,
            'medium': this.speeds.medium,
            'fast': this.speeds.fast
        };
        this.currentSpeed = speeds[speed];

        document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`speed${Object.keys(speeds).indexOf(speed) + 1}`).classList.add('active');
    }

    getRandomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    createNewRound() {
        const color1 = this.getRandomColor();
        let color2;
        do {
            color2 = this.getRandomColor();
        } while (color2 === color1);

        this.squares.bottom = [
            {
                x: this.canvas.width * 0.25 - this.squareSize / 2,
                y: this.canvas.height - this.squareSize * 1.5,
                color: color1
            },
            {
                x: this.canvas.width * 0.75 - this.squareSize / 2,
                y: this.canvas.height - this.squareSize * 1.5,
                color: color2
            }
        ];

        this.squares.falling = {
            x: this.canvas.width / 2 - this.squareSize / 2,
            y: 0,
            color: Math.random() < 0.5 ? color1 : color2
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameActive) {
            // Draw bottom squares
            this.squares.bottom.forEach(square => {
                this.ctx.fillStyle = square.color;
                this.ctx.fillRect(square.x, square.y, this.squareSize, this.squareSize);
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(square.x, square.y, this.squareSize, this.squareSize);
            });

            // Draw falling square
            if (this.squares.falling) {
                this.ctx.fillStyle = this.squares.falling.color;
                this.ctx.fillRect(
                    this.squares.falling.x,
                    this.squares.falling.y,
                    this.squareSize,
                    this.squareSize
                );
                this.ctx.strokeStyle = '#000';
                this.ctx.strokeRect(
                    this.squares.falling.x,
                    this.squares.falling.y,
                    this.squareSize,
                    this.squareSize
                );
            }
        }
    }

    update() {
        if (!this.squares.falling || !this.gameActive) return;

        this.squares.falling.y += this.currentSpeed * 0.1;

        if (this.squares.falling.y >= this.canvas.height - this.squareSize * 1.5) {
            this.handleMiss();
        }
    }

    handleClick(e) {
        if (!this.gameActive || !this.squares.falling) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.squares.bottom.forEach((square, index) => {
            if (x >= square.x && x <= square.x + this.squareSize &&
                y >= square.y && y <= square.y + this.squareSize) {
                this.handleChoice(index);
            }
        });
    }

    handleChoice(choiceIndex) {
        const chosenColor = this.squares.bottom[choiceIndex].color;
        const correctColor = this.squares.falling.color;

        if (chosenColor === correctColor) {
            this.score++;
        }

        this.attempts++;
        this.updateScore();

        if (this.attempts >= 10) {
            this.endGame();
        } else {
            this.createNewRound();
        }
    }

    handleMiss() {
        this.attempts++;
        this.updateScore();

        if (this.attempts >= 10) {
            this.endGame();
        } else {
            this.createNewRound();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = `${this.score} из 10`;
    }

    startGame() {
        this.score = 0;
        this.attempts = 0;
        this.gameActive = true;
        this.createNewRound();
        this.updateScore();
        this.gameLoop();
    }

    endGame() {
        this.gameActive = false;
        setTimeout(() => {
            alert(`Игра окончена! Ваш результат: ${this.score} из 10`);
            this.showStartButton();
        }, 500);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new ColorSquaresGame();
});