class ColorSquaresGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.attempts = 0;
        this.maxAttempts = 10;
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
        this.animationFrameId = null;

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

        // Добавляем обработчики для кнопок выбора количества раундов
        document.getElementById('rounds10').addEventListener('click', () => this.setMaxAttempts(10));
        document.getElementById('rounds20').addEventListener('click', () => this.setMaxAttempts(20));
        document.getElementById('rounds30').addEventListener('click', () => this.setMaxAttempts(30));
        document.getElementById('rounds40').addEventListener('click', () => this.setMaxAttempts(40));

        document.getElementById('stopButton').addEventListener('click', () => {
            this.stopGame();
        });

        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        window.addEventListener('resize', () => {
            this.initializeCanvas();
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.hideStartButton();
            this.startGame();
        });
    }

    setMaxAttempts(attempts) {
        this.maxAttempts = attempts;
        // Обновляем все кнопки выбора раундов
        document.querySelectorAll('.rounds-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === attempts.toString()) {
                btn.classList.add('active');
            }
        });
        // Обновляем отображение счета
        this.updateScore();
    }

    showStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.classList.remove('hidden');
        this.gameActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    hideStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.classList.add('hidden');
    }

    stopGame() {
        this.gameActive = false;
        this.showStartButton();
        this.score = 0;
        this.attempts = 0;
        this.squares = {
            falling: null,
            bottom: []
        };
        this.updateScore();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.draw();
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

        this.squares = {
            bottom: [
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
            ],
            falling: {
                x: this.canvas.width / 2 - this.squareSize / 2,
                y: 0,
                color: Math.random() < 0.5 ? color1 : color2
            }
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameActive && this.squares) {
            if (this.squares.bottom) {
                this.squares.bottom.forEach(square => {
                    this.ctx.fillStyle = square.color;
                    this.ctx.fillRect(square.x, square.y, this.squareSize, this.squareSize);
                    this.ctx.strokeStyle = '#000';
                    this.ctx.strokeRect(square.x, square.y, this.squareSize, this.squareSize);
                });
            }

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
        if (!this.gameActive || !this.squares || !this.squares.falling || !this.squares.bottom) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;

        for (let i = 0; i < this.squares.bottom.length; i++) {
            const square = this.squares.bottom[i];
            if (canvasX >= square.x && canvasX <= square.x + this.squareSize &&
                canvasY >= square.y && canvasY <= square.y + this.squareSize) {
                this.handleChoice(i);
                break;
            }
        }
    }

    async handleChoice(choiceIndex) {
        if (!this.gameActive || !this.squares || !this.squares.falling || !this.squares.bottom) return;

        const chosenColor = this.squares.bottom[choiceIndex].color;
        const correctColor = this.squares.falling.color;

        if (chosenColor === correctColor) {
            this.score++;
            window.gameAudio.playCorrect();
        } else {
            window.gameAudio.playIncorrect();
        }

        this.attempts++;
        this.updateScore();

        if (this.attempts >= this.maxAttempts) {
            this.endGame();
        } else {
            this.createNewRound();
        }
    }

    handleMiss() {
        if (!this.gameActive) return;

        window.gameAudio.playIncorrect();
        this.attempts++;
        this.updateScore();

        if (this.attempts >= this.maxAttempts) {
            this.endGame();
        } else {
            this.createNewRound();
        }
    }

    updateScore() {
        document.getElementById('score').textContent = `${this.score} из ${this.maxAttempts}`;
        document.getElementById('roundsRemaining').textContent = `${this.maxAttempts - this.attempts}`;
    }

    async startGame() {
        await window.gameAudio.init();
        window.gameAudio.playGameStart();
        this.score = 0;
        this.attempts = 0;
        this.gameActive = true;
        this.createNewRound();
        this.updateScore();
        this.gameLoop();
    }

    endGame() {
        this.gameActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.gameAudio.playGameOver();
        setTimeout(() => {
            alert(`Игра окончена! Ваш результат: ${this.score} из ${this.maxAttempts}`);
            this.showStartButton();
        }, 500);
    }

    gameLoop() {
        if (!this.gameActive) return;

        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new ColorSquaresGame();
});