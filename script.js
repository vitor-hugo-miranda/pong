window.onload = function() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.width = 1100;
    canvas.height = 500; 


   
    // Desenha um retângulo branco
    context.fillStyle = 'white';
    context.fillRect(100, 100, 11, 100); // Posição x, y e largura e altura do retângulo

    // Desenha um retângulo branco
    context.fillStyle = 'white';
    context.fillRect(960, 100, 11, 100); // Posição x, y e largura e altura do retângulo

    
    // Propriedades dos retângulos
    var rect1 = { x: 10, y: 100, width: 11, height: 100, dy: 5, upKey: 'w', downKey: 's' };
    var rect2 = { x: 1080, y: 300, width: 11, height: 100, dy: -5, upKey: 'ArrowUp', downKey: 'ArrowDown' };

    // Propriedades da linha
    var lineX = canvas.width / 2; // Posição horizontal da linha (meio do canvas)
    var lineYStart = 45;           // Ponto inicial da linha (y)
    var lineYEnd = 450; // Ponto final da linha (y)
    var lineWidth = 4;            // Largura da linha

    // Propriedades da esfera
    var initialSpherePosition = { x: canvas.width / 2, y: canvas.height / 2 };
    var sphere = {
        x: initialSpherePosition.x,
        y: initialSpherePosition.y,
        radius: 12,
        dx: 7,
        dy: 7,
        baseSpeed: 3, // Velocidade base da esfera
        speedIncrease: 3.0 * 60 * 1000 // Tempo em milissegundos (1.5 minutos)
    };

    // Propriedades do placar
    var scoreLeft = 0;
    var scoreRight = 0;
    var scoreLimit = 15;
    var scorePositionLeft = { x: 400, y: 30 };
    var scorePositionRight = { x: canvas.width - 400, y: 30 };
    var scoreColorLeft = 'yellow';    // Cor do placar esquerdo
    var scoreColorRight = 'red'; // Cor do placar direito

    // Propriedades da mensagem de vitória
    var winMessage = "Você goixta da derrotaum? ";
    var winMessageFontSize = 20; // Tamanho da fonte
    var winMessageColor = "orange"; // Cor da mensagem
    var showWinMessage = false;

    // Propriedades do cronômetro
    var startTime = Date.now();
    var elapsedTime = 0;
    var timerFontSize = 20; // Tamanho da fonte do cronômetro
    var timerColor = "green"; // Cor do cronômetro
    var timerPosition = { x: canvas.width / 2 - 50, y: 30 }; // Posição do cronômetro

    // Propriedades do áudio
    var som_guitarrinha = new Audio('guitarrinha.mp3');
    som_guitarrinha.volume = 0.9
   
       
            
   
    // Estado das teclas pressionadas
    var keysPressed = {};

    // Estado de pausa
    var isPaused = false;
   

    // Evento para detectar teclas pressionadas
    document.addEventListener('keydown', function(event) {
        keysPressed[event.key] = true;

        // Verifica se a tecla "espaço" foi pressionada
        if (event.key === ' ') {
            isPaused = !isPaused; // Alterna o estado de pausa
        }

    });

    // Evento para detectar teclas liberadas
    document.addEventListener('keyup', function(event) {
        keysPressed[event.key] = false;
    });

    function drawRectangle(rect) {
        context.fillStyle = 'white';
        context.fillRect(rect.x, rect.y, rect.width, rect.height);
    }

    function drawLine() {
        context.beginPath();
        context.moveTo(lineX, lineYStart);
        context.lineTo(lineX, lineYEnd);
        context.strokeStyle = 'white';
        context.lineWidth = lineWidth;
        context.stroke();
    }

    function drawSphere() {
        context.beginPath();
        context.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2, false);
        context.fillStyle = 'gray';
        context.fill();
        context.closePath();
    }

    function drawScore() {
        context.font = '20px Arial';
        context.fillStyle = scoreColorLeft;
        context.fillText(scoreLeft, scorePositionLeft.x, scorePositionLeft.y);
        context.fillStyle = scoreColorRight;
        context.fillText(scoreRight, scorePositionRight.x, scorePositionRight.y);
    }

    function drawWinMessage() {
        context.font = `${winMessageFontSize}px Arial`;
        context.fillStyle = winMessageColor;
        context.fillText(
            winMessage.replace('[scoreLeft]', scoreLeft).replace('[scoreRight]', scoreRight),
            canvas.width / 3.1 - context.measureText(winMessage).width / 2,
            canvas.height / 2
        );
    }

    function drawTimer() {
        var time = elapsedTime;
        var milliseconds = time % 1000;
        time = (time - milliseconds) / 1000;
        var seconds = time % 60;
        time = (time - seconds) / 60;
        var minutes = time % 60;
        var hours = (time - minutes) / 60;

        context.font = `${timerFontSize}px Arial`;
        context.fillStyle = timerColor;
        context.fillText(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`,
            timerPosition.x,
            timerPosition.y
        );
    }

    function updateRectangle(rect) {
        // Movimenta o retângulo de acordo com as teclas pressionadas
        if (keysPressed[rect.upKey]) {
            rect.y -= 5;
        }
        if (keysPressed[rect.downKey]) {
            rect.y += 5;
        }

        // Verifica colisões com as bordas do canvas
        if (rect.y < 0) {
            rect.y = 0;
        }
        if (rect.y + rect.height > canvas.height) {
            rect.y = canvas.height - rect.height;
        }
    }

    function detectCollision(sphere, rect) {
        // Verifica colisões contínuas
        var nearestX = Math.max(rect.x, Math.min(sphere.x, rect.x + rect.width));
        var nearestY = Math.max(rect.y, Math.min(sphere.y, rect.y + rect.height));

        var deltaX = sphere.x - nearestX;
        var deltaY = sphere.y - nearestY;

        if ((deltaX * deltaX + deltaY * deltaY) < (sphere.radius * sphere.radius)) {
            return true;
        }

        return false;
    }

    function updateSphere() {
        // Aumenta a velocidade da esfera após 1.5 minutos
        if (elapsedTime >= sphere.speedIncrease && !sphere.speedIncreased) {
            sphere.dx = sphere.dx > 0 ? sphere.dx + 2 : sphere.dx - 2;
            sphere.dy = sphere.dy > 0 ? sphere.dy + 2 : sphere.dy - 2;
            sphere.speedIncreased = true;
        }

        sphere.x += sphere.dx;
        sphere.y += sphere.dy;

        // Verifica colisões com as bordas do canvas
        if (sphere.x + sphere.radius > canvas.width) {
            // Incrementa o placar esquerdo
            scoreLeft++;
            // Reseta a posição da esfera ao ponto inicial
            sphere.x = initialSpherePosition.x;
            sphere.y = initialSpherePosition.y;
        } else if (sphere.x - sphere.radius < 0) {
            // Incrementa o placar direito
            scoreRight++;
            // Reseta a posição da esfera ao ponto inicial
            sphere.x = initialSpherePosition.x;
            sphere.y = initialSpherePosition.y;
        }

        if (sphere.y + sphere.radius > canvas.height || sphere.y - sphere.radius < 0) {
            sphere.dy *= -1; // Inverte a direção vertical
        }

        // Verifica colisões com os retângulos
        if (detectCollision(sphere, rect1)) {
            sphere.dx *= -1; // Inverte a direção horizontal
        }

        if (detectCollision(sphere, rect2)) {
            sphere.dx *= -1; // Inverte a direção horizontal
        }

        // Verifica se algum jogador alcançou o limite de pontuação
        if (scoreLeft >= scoreLimit || scoreRight >= scoreLimit) {
            showWinMessage = true;
            isPaused = true;
        }
    }

    function update() {
        // Limpa o canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Atualiza as posições dos retângulos
        updateRectangle(rect1);
        updateRectangle(rect2);

        // Atualiza a posição da esfera
        updateSphere();

        // Desenha os retângulos, a linha, a esfera, o placar e o cronômetro
        drawRectangle(rect1);
        drawRectangle(rect2);
        drawLine();
        drawSphere();
        drawScore();
        drawTimer();

        // Desenha a mensagem de vitória se necessário
        if (showWinMessage) {
            drawWinMessage();
        }
    }

    function animate() { 
        if (!isPaused) {
            som_guitarrinha.play();
            elapsedTime = Date.now() - startTime;
            update();
        }
        requestAnimationFrame(animate);
    }

    // Inicia a animação
    animate();
 }
