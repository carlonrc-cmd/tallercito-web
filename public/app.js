document.querySelector('button').addEventListener('click', optimizarCorte);

function optimizarCorte() {
    const canvas = document.getElementById('canvasCorte');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('resultadoInfo');

    // 1. Obtener medidas (limpiando el texto)
    const medidaTablero = document.querySelector('input').value.split('x');
    const largoTablero = parseInt(medidaTablero[0]) || 2440;
    const anchoTablero = parseInt(medidaTablero[1]) || 1220;

    // 2. Configurar escala del dibujo (para que quepa en pantalla)
    const escala = Math.min(600 / largoTablero, 400 / anchoTablero);
    canvas.width = largoTablero * escala;
    canvas.height = anchoTablero * escala;

    // 3. Dibujar el tablero base
    ctx.fillStyle = "#e2e8f0"; // Color gris claro
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#94a3b8";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 4. Lógica simple de dibujo de piezas (Demo)
    // Aquí es donde en el futuro pondremos el algoritmo matemático complejo
    ctx.fillStyle = "#fbbf24"; // Color ámbar de Tallercito
    ctx.strokeStyle = "#b45309";
    
    // Dibujamos una pieza de ejemplo de 500x300
    const pLargo = 500 * escala;
    const pAncho = 300 * escala;
    
    ctx.fillRect(5, 5, pLargo, pAncho);
    ctx.strokeRect(5, 5, pLargo, pAncho);

    info.innerHTML = `Visualizando tablero de ${largoTablero}x${anchoTablero}mm. <br> Pieza demo dibujada.`;
}