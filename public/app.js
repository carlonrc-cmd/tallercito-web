document.getElementById('btnOptimizar').addEventListener('click', optimizarCorte);
document.getElementById('btnDescargar').addEventListener('click', descargarPDF);

async function optimizarCorte() {
    const canvas = document.getElementById('canvasCorte');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('resultadoInfo');

    const [largoT, anchoT] = document.getElementById('medidaTablero').value.split('x').map(n => parseInt(n));
    const lineas = document.getElementById('listaPiezas').value.split('\n');

    let piezas = [];
    lineas.forEach(l => {
        const [dim, cant] = l.split(',');
        if (!dim) return;
        const [w, h] = dim.split('x').map(n => parseInt(n.trim()));
        for (let i = 0; i < (parseInt(cant) || 1); i++) piezas.push({ w, h });
    });

    // Algoritmo de Acomodo
    const escala = Math.min(canvas.parentElement.clientWidth / largoT, 450 / anchoT);
    canvas.width = largoT * escala; canvas.height = anchoT * escala;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = 2, y = 2, maxH = 0, colocadas = [];
    const kerf = 3;

    piezas.forEach(p => {
        if (x + p.w > largoT) { x = 2; y += maxH + kerf; maxH = 0; }
        if (y + p.h <= anchoT) {
            ctx.fillStyle = "#fbbf24"; ctx.fillRect(x * escala, y * escala, p.w * escala, p.h * escala);
            ctx.strokeStyle = "#0f172a"; ctx.strokeRect(x * escala, y * escala, p.w * escala, p.h * escala);
            colocadas.push({ x, y, w: p.w, h: p.h });
            if (p.h > maxH) maxH = p.h;
            x += p.w + kerf;
        }
    });

    localStorage.setItem('ultimo_plan_corte', JSON.stringify({ largoT, anchoT, piezas: colocadas }));
    info.innerText = `Piezas colocadas: ${colocadas.length}`;

    // Guardar en la nube si hay usuario
    if (auth.currentUser) {
        const proyecto = {
            nombre: "Corte " + new Date().toLocaleDateString(),
            fecha: new Date().toISOString(),
            eficiencia: Math.round((colocadas.length / piezas.length) * 100),
            configuracion: { tablero: document.getElementById('medidaTablero').value, piezas: document.getElementById('listaPiezas').value }
        };
        await db.collection("usuarios").doc(auth.currentUser.uid).collection("proyectos").add(proyecto);
        cargarProyectos(auth.currentUser.uid); // Función de auth.js
    }
}

async function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const datos = JSON.parse(localStorage.getItem('ultimo_plan_corte'));
    if (!datos) return alert("Optimiza un diseño primero.");

    doc.text("TALLERCITO.MX - PLAN DE PRODUCCIÓN", 10, 20);
    doc.addImage(document.getElementById('canvasCorte').toDataURL('image/png'), 'PNG', 10, 30, 190, 0);

    // Segunda hoja: Etiquetas QR
    doc.addPage();
    doc.text("ETIQUETAS QR PARA PIEZAS", 10, 20);
    let xPos = 10, yPos = 30;

    for (let i = 0; i < datos.piezas.length; i++) {
        const id = `PZ-${i+1}`;
        doc.rect(xPos, yPos, 90, 40);
        doc.setFontSize(10);
        doc.text(id, xPos + 5, yPos + 10);
        
        const qrDiv = document.createElement("div");
        new QRCode(qrDiv, { text: id, width: 100, height: 100 });
        await new Promise(r => setTimeout(r, 100)); // Esperar generación de QR
        doc.addImage(qrDiv.querySelector("img").src, 'PNG', xPos + 60, yPos + 5, 25, 25);

        xPos += 100;
        if (xPos > 150) { xPos = 10; yPos += 50; }
        if (yPos > 240) { doc.addPage(); yPos = 30; }
    }
    doc.save("Tallercito_Produccion.pdf");
}