document.getElementById('btnOptimizar').addEventListener('click', optimizarCorte);

function optimizarCorte() {
    const canvas = document.getElementById('canvasCorte');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('resultadoInfo');

    const txtTablero = document.getElementById('medidaTablero').value || "2440x1220";
    const [largoT, anchoT] = txtTablero.split('x').map(num => parseInt(num.trim()));

    const txtPiezas = document.getElementById('listaPiezas').value;
    if (!txtPiezas) return alert("Ingresa piezas (ej: 500x300, 5)");

    let piezasParaCortar = [];
    const lineas = txtPiezas.split('\n');
    
    lineas.forEach(linea => {
        const [medidas, cantidad] = linea.split(',');
        if(!medidas) return;
        const [l, a] = medidas.split('x').map(n => parseInt(n.trim()));
        const cant = parseInt(cantidad) || 1;
        for (let i = 0; i < cant; i++) {
            piezasParaCortar.push({ w: l, h: a, area: l * a });
        }
    });

    piezasParaCortar.sort((a, b) => b.area - a.area);

    const escala = Math.min(canvas.parentElement.clientWidth / largoT, 400 / anchoT) * 0.9;
    canvas.width = largoT * escala;
    canvas.height = anchoT * escala;

    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    let xActual = 2, yActual = 2, filaMasAlta = 0, piezasColocadas = 0;

    piezasParaCortar.forEach(p => {
        if (xActual + p.w > largoT) {
            xActual = 2;
            yActual += filaMasAlta + 2;
            filaMasAlta = 0;
        }

        if (yActual + p.h <= anchoT) {
            ctx.fillStyle = "#fbbf24";
            ctx.strokeStyle = "#92400e";
            ctx.fillRect(xActual * escala, yActual * escala, p.w * escala, p.h * escala);
            ctx.strokeRect(xActual * escala, yActual * escala, p.w * escala, p.h * escala);
            
            xActual += p.w + 2;
            if (p.h > filaMasAlta) filaMasAlta = p.h;
            piezasColocadas++;
        }
    });

    info.innerHTML = `✅ Acomodadas ${piezasColocadas} piezas en tablero de ${largoT}x${anchoT}mm.`;
}