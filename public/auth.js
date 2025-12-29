async function actualizarInterfaz(user) {
    document.getElementById('btnLogin')?.classList.add('hidden');
    const info = document.getElementById('userInfo');
    
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    let rol = "MAESTRO";
    
    if (userDoc.exists && userDoc.data().rol) {
        rol = userDoc.data().rol;
    } else {
        await db.collection("usuarios").doc(user.uid).set({
            nombre: user.displayName,
            email: user.email,
            rol: "MAESTRO"
        }, { merge: true });
    }

    if(info) {
        info.innerText = `${rol}: ${user.displayName.toUpperCase()}`;
        info.classList.remove('hidden');
    }

    // LÓGICA DE ADMIN: Mostrar panel de control
    if (rol === "ADMIN") {
        document.body.classList.add('es-admin');
        console.log("Acceso de Administrador activado");
        // Aquí podrías mostrar un botón oculto para escribir en el blog
        const btnAdmin = document.createElement('button');
        btnAdmin.innerText = "➕ NUEVO POST";
        btnAdmin.className = "bg-red-600 text-white px-3 py-1 rounded-full text-xs ml-4";
        btnAdmin.onclick = () => abrirEditorBlog(); // Función para crear contenido
        info.appendChild(btnAdmin);
    }

    document.getElementById('userDashboard')?.classList.remove('hidden');
}