window.onload = function() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 550; 

    // Desenha um retângulo branco
    context.fillStyle = 'white';
    context.fillRect(10, 100, 10, 50); // Posição x, y e largura e altura do retângulo
};