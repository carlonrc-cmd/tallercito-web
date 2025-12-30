let planActual = null;
let indiceTableroActual = 0;

window.addEventListener('load', () => {
    const bOpt = document.getElementById('btnOptimizar');
    const bPdf = document.getElementById('btnDescargar');
    if (bOpt) bOpt.onclick = optimizarCorte;
    if (bPdf) bPdf.onclick = descargarPDF;
});

async function optimizarCorte() {
    const canvas = document.getElementById('canvasCorte');
    const nomProy = document.getElementById('nombreProyecto').value || "Proyecto Nuevo";
    const [lT, aT] = document.getElementById('medidaTablero').value.split('x').map(Number);
    const lineas = document.getElementById('listaPiezas').value.split('\n');

    let piezas = [];
    lineas.forEach(l => {
        const parts = l.split(',');
        if (parts.length < 2) return;
        const [w, h] = parts[0].split('x').map(n => parseInt(n.trim()));
        const cant = parseInt(parts[1]) || 1;
        const nombre = (parts[2] || "Pieza").trim();
        for (let i = 0; i < cant; i++) {
            piezas.push({ w, h, nombre: `${nombre} ${i+1}` });
        }
    });

    piezas.sort((a, b) => (b.w * b.h) - (a.w * a.h));

    let tableros = [];
    let restantes = [...piezas];
    const kerf = 3;

    while (restantes.length > 0) {
        let colocadas = [], x = 2, y = 2, maxH = 0, noCaben = [];
        restantes.forEach(p => {
            if (x + p.w > lT) { x = 2; y += maxH + kerf; maxH = 0; }
            if (y + p.h <= aT) {
                colocadas.push({ ...p, x, y });
                if (p.h > maxH) maxH = p.h;
                x += p.w + kerf;
            } else { noCaben.push(p); }
        });
        if (colocadas.length === 0) break; // Evita bucle infinito si la pieza no cabe en un tablero vacío
        tableros.push(colocadas);
        restantes = noCaben;
    }

    planActual = { nombre: nomProy, largoT: lT, anchoT: aT, tableros };
    localStorage.setItem('ultimo_plan_corte', JSON.stringify(planActual));
    
    window.dibujarTablero(0);
    crearMiniaturas();
    
    if (window.auth?.currentUser) {
        await window.db.collection("usuarios").doc(window.auth.currentUser.uid).collection("proyectos").add({
            nombre: nomProy, fecha: new Date().toISOString(), numTableros: tableros.length
        });
        window.cargarProyectos(window.auth.currentUser.uid);
    }
}

window.dibujarTablero = function(index) {
    indiceTableroActual = index;
    const canvas = document.getElementById('canvasCorte');
    const ctx = canvas.getContext('2d');
    const t = planActual.tableros[index];
    const escala = Math.min(canvas.parentElement.clientWidth / planActual.largoT, 450 / planActual.anchoT);
    
    canvas.width = planActual.largoT * escala;
    canvas.height = planActual.anchoT * escala;
    ctx.fillStyle = "#fff"; ctx.fillRect(0,0, canvas.width, canvas.height);
    
    t.forEach(p => {
        ctx.fillStyle = "#fbbf24"; ctx.fillRect(p.x*escala, p.y*escala, p.w*escala, p.h*escala);
        ctx.strokeStyle = "#0f172a"; ctx.strokeRect(p.x*escala, p.y*escala, p.w*escala, p.h*escala);
    });
    document.getElementById('resultadoInfo').innerText = `VISTA: TABLERO ${index + 1} DE ${planActual.tableros.length}`;
}

function crearMiniaturas() {
    const contenedor = document.getElementById('selectorTableros');
    contenedor.innerHTML = planActual.tableros.map((_, i) => 
        `<button onclick="window.dibujarTablero(${i})" class="w-10 h-10 bg-slate-800 text-white rounded-lg font-bold hover:bg-amber-500 transition">${i+1}</button>`
    ).join('');
}

async function descargarPDF() {
    if (!planActual) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < planActual.tableros.length; i++) {
        if (i > 0) doc.addPage();
        doc.setFontSize(14);
        doc.text(`TALLERCITO.MX - ${planActual.nombre} (T${i+1})`, 10, 20);
        
        const temp = document.createElement('canvas');
        temp.width = 1200; temp.height = 600;
        const tCtx = temp.getContext('2d');
        const esc = 1200 / planActual.largoT;
        tCtx.fillStyle = "#fff"; tCtx.fillRect(0,0, 1200, 600);
        planActual.tableros[i].forEach(p => {
            tCtx.fillStyle = "#fbbf24"; tCtx.fillRect(p.x*esc, p.y*esc, p.w*esc, p.h*esc);
            tCtx.strokeRect(p.x*esc, p.y*esc, p.w*esc, p.h*esc);
        });
        doc.addImage(temp.toDataURL('image/png'), 'PNG', 10, 30, 190, 0);
    }

    doc.addPage();
    doc.text("ETIQUETAS QR", 10, 20);
    let x = 10, y = 30;
    const piezas = planActual.tableros.flat();
    for (let i = 0; i < piezas.length; i++) {
        doc.rect(x, y, 90, 45);
        doc.setFontSize(8); doc.text(piezas[i].nombre, x+5, y+10);
        doc.text(`${piezas[i].w}x${piezas[i].h}mm`, x+5, y+15);
        
        const q = document.createElement("div");
        new QRCode(q, { text: piezas[i].nombre, width: 100, height: 100 });
        await new Promise(r => setTimeout(r, 60)); // Compatibilidad Mac
        const img = q.querySelector("img")?.src;
        if (img) doc.addImage(img, 'PNG', x+60, y+5, 25, 25);

        x += 100; if (x > 150) { x = 10; y += 50; }
        if (y > 240 && i < piezas.length - 1) { doc.addPage(); y = 30; }
    }
    doc.save(`${planActual.nombre}_Produccion.pdf`);
}