const firebaseConfig = {
    apiKey: "AIzaSyB68ZwmRztpy9FtmZOJzZQ0BrKjK-bSFH8",
    authDomain: "tallercito-mx.firebaseapp.com",
    projectId: "tallercito-mx",
    storageBucket: "tallercito-mx.firebasestorage.app",
    appId: "1:247223458112:web:f89109d69ff59faa1a42a5"
};

// Inicialización
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Función que dispara el botón de Acceso Maestro
async function loginConGoogle() {
    console.log("Iniciando flujo de autenticación...");
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        console.log("Login exitoso:", result.user.displayName);
        actualizarInterfaz(result.user);
    } catch (error) {
        console.error("Error en login:", error.code);
        alert("Error de autenticación: " + error.message);
    }
}

// Detectar sesión activa al cargar
auth.onAuthStateChanged(user => {
    if (user) {
        actualizarInterfaz(user);
        cargarProyectos(user.uid);
    }
});

// Actualizar UI y gestionar Roles
async function actualizarInterfaz(user) {
    document.getElementById('btnLogin')?.classList.add('hidden');
    const info = document.getElementById('userInfo');
    const dashboard = document.getElementById('userDashboard');
    
    // Consulta de Rol en Firestore
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    let rol = "MAESTRO";
    
    if (userDoc.exists && userDoc.data().rol) {
        rol = userDoc.data().rol;
    } else {
        // Registro inicial
        await db.collection("usuarios").doc(user.uid).set({
            nombre: user.displayName,
            email: user.email,
            rol: "MAESTRO",
            fechaRegistro: new Date().toISOString()
        }, { merge: true });
    }

    if(info) {
        info.innerText = `${rol}: ${user.displayName.toUpperCase()}`;
        info.classList.remove('hidden');
    }
    if(dashboard) dashboard.classList.remove('hidden');
}

// Cargar Blog dinámico
async function cargarBlog() {
    const contenedor = document.getElementById('contenedorArticulos');
    if(!contenedor) return;
    try {
        const snap = await db.collection("blog").orderBy("fecha", "desc").limit(6).get();
        contenedor.innerHTML = "";
        snap.forEach(doc => {
            const art = doc.data();
            contenedor.innerHTML += `
                <article class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition">
                    <span class="text-amber-600 text-[10px] font-bold uppercase">${art.categoria || 'TECNOLOGÍA'}</span>
                    <h3 class="text-xl font-bold mt-1">${art.titulo}</h3>
                    <p class="text-slate-600 mt-2 text-sm">${art.resumen}</p>
                    <a href="${art.url || '#'}" class="inline-block mt-4 text-xs font-bold border-b-2 border-amber-500">LEER MÁS</a>
                </article>`;
        });
    } catch (e) {
        console.log("Colección blog vacía o no encontrada.");
    }
}

// Cargar Proyectos del usuario
async function cargarProyectos(uid) {
    const grid = document.getElementById('gridProyectos');
    if(!grid) return;
    const snap = await db.collection("usuarios").doc(uid).collection("proyectos").orderBy("fecha", "desc").limit(6).get();
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        grid.innerHTML += `
            <div class="bg-white p-5 rounded-2xl shadow-sm border-t-4 border-amber-500">
                <h4 class="font-bold text-slate-800 text-sm uppercase">${p.nombre}</h4>
                <p class="text-[10px] text-slate-400 font-mono">${new Date(p.fecha).toLocaleDateString()}</p>
                <p class="text-xs font-bold text-amber-600 mt-2">${p.eficiencia}% Eficiencia</p>
            </div>`;
    });
}

// Ejecución inicial
cargarBlog();