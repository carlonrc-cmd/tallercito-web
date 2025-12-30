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
    auth.signInWithPopup(provider).then((res) => actualizarInterfaz(res.user));
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

window.cargarProyectos = async function(uid) {
    const grid = document.getElementById('gridProyectos');
    if (!grid) return;
    const snap = await db.collection("usuarios").doc(uid).collection("proyectos").orderBy("fecha", "desc").limit(9).get();
    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        return `<div class="bg-white p-5 rounded-2xl shadow-md border-t-4 border-amber-500">
                    <h4 class="font-bold uppercase text-sm">${p.nombre}</h4>
                    <p class="text-xs text-amber-600 font-bold mt-1">${p.numTableros} Tableros</p>
                </div>`;
    }).join('');
};