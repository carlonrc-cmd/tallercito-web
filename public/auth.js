const firebaseConfig = {
    apiKey: "AIzaSyB68ZwmRztpy9FtmZOJzZQ0BrKjK-bSFH8",
    authDomain: "tallercito-mx.firebaseapp.com",
    projectId: "tallercito-mx",
    storageBucket: "tallercito-mx.firebasestorage.app",
    appId: "1:247223458112:web:f89109d69ff59faa1a42a5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

window.loginConGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((res) => actualizarInterfaz(res.user))
        .catch((err) => console.error("Error Auth:", err));
};

auth.onAuthStateChanged(user => {
    if (user) {
        actualizarInterfaz(user);
        window.cargarProyectos(user.uid);
    }
});

async function actualizarInterfaz(user) {
    document.getElementById('btnLogin')?.classList.add('hidden');
    const info = document.getElementById('userInfo');
    const dash = document.getElementById('userDashboard');
    
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    let rol = userDoc.exists && userDoc.data().rol ? userDoc.data().rol : "MAESTRO";

    if (info) {
        info.innerText = `${rol}: ${user.displayName.toUpperCase()}`;
        info.classList.remove('hidden');
    }
    if (dash) dash.classList.remove('hidden');
}

// FUNCIÓN DEL BLOG REINCORPORADA
async function cargarBlog() {
    const contenedor = document.getElementById('contenedorArticulos');
    if (!contenedor) return;
    try {
        const snap = await db.collection("blog").orderBy("fecha", "desc").limit(6).get();
        contenedor.innerHTML = "";
        snap.forEach(doc => {
            const art = doc.data();
            contenedor.innerHTML += `
                <article class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition">
                    <span class="text-amber-600 text-[10px] font-bold uppercase tracking-widest">${art.categoria || 'TECNOLOGÍA'}</span>
                    <h3 class="text-xl font-bold mt-1 uppercase tracking-tighter">${art.titulo}</h3>
                    <p class="text-slate-600 mt-2 text-sm line-clamp-3">${art.resumen}</p>
                    <a href="${art.url || '#'}" class="inline-block mt-4 text-xs font-bold border-b-2 border-amber-500">LEER MÁS</a>
                </article>`;
        });
    } catch (e) {
        contenedor.innerHTML = "<p class='text-slate-400'>No hay artículos publicados aún.</p>";
    }
}

window.cargarProyectos = async function(uid) {
    const grid = document.getElementById('gridProyectos');
    if (!grid) return;
    const snap = await db.collection("usuarios").doc(uid).collection("proyectos").orderBy("fecha", "desc").limit(9).get();
    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        return `<div class="bg-white p-5 rounded-2xl shadow-md border-t-4 border-amber-500">
                    <h4 class="font-bold uppercase text-sm text-slate-800">${p.nombre}</h4>
                    <p class="text-[10px] text-slate-400 font-bold">${new Date(p.fecha).toLocaleDateString()}</p>
                    <p class="text-xs text-amber-600 font-bold mt-2">${p.numTableros} Tableros Generados</p>
                </div>`;
    }).join('');
};

// Cargar blog al cargar el script
cargarBlog();