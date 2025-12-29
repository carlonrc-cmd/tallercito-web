// public/auth.js (Actualizado con Roles)

async function actualizarInterfaz(user) {
    document.getElementById('btnLogin').classList.add('hidden');
    const info = document.getElementById('userInfo');
    
    // Consultar el rol del usuario en la base de datos
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    let rol = "MAESTRO"; // Rol por defecto

    if (userDoc.exists && userDoc.data().rol) {
        rol = userDoc.data().rol;
    } else {
        // Si es nuevo, lo registramos como MAESTRO
        await db.collection("usuarios").doc(user.uid).set({
            nombre: user.displayName,
            email: user.email,
            rol: "MAESTRO"
        }, { merge: true });
    }

    // Mostrar el rol en la interfaz
    info.innerText = `${rol}: ${user.displayName.toUpperCase()}`;
    info.classList.remove('hidden');
    
    // Si es ADMIN, podrías mostrar botones extra
    if (rol === "ADMIN") {
        console.log("Acceso de administrador concedido");
        // Aquí podrías activar un panel de estadísticas globales
    }

    document.getElementById('userDashboard').classList.remove('hidden');
}