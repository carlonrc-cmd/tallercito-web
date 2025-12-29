document.getElementById('btnOptimizar').addEventListener('click', optimizarCorte);

function optimizarCorte() {
    const canvas = document.getElementById('canvasCorte');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('resultadoInfo');

    // 1. Obtener medidas del tablero
    const txtTablero = document.getElementById('medidaTablero').value || "2440x1220";
    const [largoT, anchoT] = txtTablero.split('x').map(num => parseInt(num.trim()));

    // 2. Obtener y procesar lista de piezas
    const txtPiezas = document.getElementById('listaPiezas').value;
    if (!txtPiezas) return alert("Por favor, ingresa al menos una pieza (ej: 500x300, 5)");

    let piezasParaCortar = [];
    const lineas = txtPiezas.split('\n');
    
    lineas.forEach(linea => {
        // Formato esperado: "Largo x Ancho, Cantidad"
        const [medidas, cantidad] = linea.split(',');
        const [l, a] = medidas.split('x').map(n => parseInt(n.trim()));
        const cant = parseInt(cantidad) || 1;
        
        for (let i = 0; i < cant; i++) {
            piezasParaCortar.push({ w: l, h: a, area: l * a });
        }
    });

    // 3. Ordenar piezas de mayor a menor (Estrategia: Descending Area)
    piezasParaCortar.sort((a, b) => b.area - a.area);

    // 4. Configurar Lienzo
    const escala = Math.min(700 / largoT, 400 / anchoT);
    canvas.width = largoT * escala;
    canvas.height = anchoT * escala;

    // Dibujar Tablero Base
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 5. Algoritmo de Acomodo (Next-Fit Simple)
    let xActual = 2; // Margen pequeño
    let yActual = 2;
    let filaMasAlta = 0;
    let piezasColocadas = 0;

    piezasParaCortar.forEach(p => {
        // ¿Cabe en la fila actual?
        if (xActual + p.w > largoT) {
            xActual = 2;
            yActual += filaMasAlta + 2; // Nueva fila
            filaMasAlta = 0;
        }

        // ¿Cabe en el tablero (verticalmente)?
        if (yActual + p.h <= anchoT) {
            // Dibujar pieza
            ctx.fillStyle = "#fbbf24"; // Color Ámbar
            ctx.strokeStyle = "#92400e";
            ctx.lineWidth = 1;
            
            ctx.fillRect(xActual * escala, yActual * escala, p.w * escala, p.h * escala);
            ctx.strokeRect(xActual * escala, yActual * escala, p.w * escala, p.h * escala);
            
            // Texto de medidas dentro de la pieza (si cabe)
            if (p.w * escala > 40) {
                ctx.fillStyle = "#78350f";
                ctx.font = `${Math.max(8, 10 * escala)}px Arial`;
                ctx.fillText(`${p.w}x${p.h}`, (xActual + 5) * escala, (yActual + 15) * escala);
            }

            xActual += p.w + 2; // Espacio entre piezas
            if (p.h > filaMasAlta) filaMasAlta = p.h;
            piezasColocadas++;
        }
    });

    info.innerHTML = `✅ Se acomodaron ${piezasColocadas} de ${piezasParaCortar.length} piezas. <br> 
                      Tablero usado: ${largoT}x${anchoT}mm.`;
}