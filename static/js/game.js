class ColorSquaresGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.attempts = 0;
        this.maxAttempts = 10;
        this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        this.speeds = {
            slow: 34,
            medium: 51,
            fast: 68,
            veryfast: 101
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

        this.canvas.width = containerWidth * 1.5;
        this.canvas.height = containerHeight * 1.5;

        const baseSize = Math.min(this.canvas.width / 2, this.canvas.height / 4);
        this.squareSize = baseSize * 0.8; 
    }

    setupEventListeners() {
        document.getElementById('speed1').addEventListener('click', () => this.setSpeed('slow'));
        document.getElementById('speed2').addEventListener('click', () => this.setSpeed('medium'));
        document.getElementById('speed3').addEventListener('click', () => this.setSpeed('fast'));
        document.getElementById('speed4').addEventListener('click', () => this.setSpeed('veryfast'));

        document.getElementById('rounds10').addEventListener('click', () => this.setMaxAttempts(10));
        document.getElementById('rounds20').addEventListener('click', () => this.setMaxAttempts(20));
        document.getElementById('rounds30').addEventListener('click', () => this.setMaxAttempts(30));
        document.getElementById('rounds40').addEventListener('click', () => this.setMaxAttempts(40));


        document.getElementById('stopButton').addEventListener('click', () => this.stopGame());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('resize', () => this.initializeCanvas());
        document.getElementById('startButton').addEventListener('click', () => {
            this.hideStartButton();
            this.startGame();
        });
    }

    setMaxAttempts(attempts) {
        this.maxAttempts = attempts;
        document.querySelectorAll('.rounds-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === attempts.toString()) {
                btn.classList.add('active');
            }
        });
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    hideStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.classList.add('hidden');
    }

    stopGame() {
        this.gameActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.score = 0;
        this.attempts = 0;
        this.squares = {
            falling: null,
            bottom: []
        };
        this.updateScore();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const startButton = document.getElementById('startButton');
        startButton.classList.remove('hidden');
    }

    setSpeed(speed) {
        const speeds = {
            'slow': this.speeds.slow,
            'medium': this.speeds.medium,
            'fast': this.speeds.fast,
            'veryfast': this.speeds.veryfast
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

        const offset = -125; 
        this.squares = {
            bottom: [
                {
                    x: (this.canvas.width * 0.35 + offset + 19) - this.squareSize / 2, 
                    y: this.canvas.height - this.squareSize * 1.5,
                    color: color1
                },
                {
                    x: (this.canvas.width * 0.85 + offset) - this.squareSize / 2,
                    y: this.canvas.height - this.squareSize * 1.5,
                    color: color2
                }
            ],
            falling: {
                x: (this.canvas.width * 0.6 + offset) - this.squareSize / 2,
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
                    this.ctx.beginPath();
                    this.ctx.roundRect(square.x, square.y, this.squareSize, this.squareSize, 10);
                    this.ctx.fillStyle = square.color;
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#000';
                    this.ctx.stroke();
                });
            }

            if (this.squares.falling) {
                this.ctx.beginPath();
                this.ctx.roundRect(
                    this.squares.falling.x,
                    this.squares.falling.y,
                    this.squareSize,
                    this.squareSize,
                    10
                );
                this.ctx.fillStyle = this.squares.falling.color;
                this.ctx.fill();
                this.ctx.strokeStyle = '#000';
                this.ctx.stroke();
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const startButton = document.getElementById('startButton');
        startButton.classList.remove('hidden');
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