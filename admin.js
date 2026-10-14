const API_URL = 'http://localhost:3000/api/usuarios';

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    // Eventos Modal
    document.getElementById('btn-new-user').addEventListener('click', openNewUserModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('user-form').addEventListener('submit', handleFormSubmit);
    
    // Evento Exportar Excel
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
});

// ==================== CRUD OPERATIONS ====================

async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        renderUsersTable(users);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('No se pudo conectar con la base de datos. Asegúrate de que el servidor Node (server.js) esté corriendo.');
    }
}

function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td><strong>${user.nombre}</strong></td>
            <td>${user.email}</td>
            <td>${user.cargo}</td>
            <td><span class="badge" style="background:#eef2ff; color:var(--primary);">${user.departamento}</span></td>
            <td style="display: flex; gap: 5px;">
                <button class="btn btn-edit" onclick="editUser(${user.id})" style="padding: 6px 10px;"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})" style="padding: 6px 10px;"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const userData = {
        nombre: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        cargo: document.getElementById('user-cargo').value,
        departamento: document.getElementById('user-depto').value
    };

    try {
        if (id) {
            // Update
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else {
            // Create
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        }
        closeModal();
        fetchUsers();
    } catch (error) {
        console.error('Error guardando usuario:', error);
        alert('Error al guardar el usuario.');
    }
}

async function editUser(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const user = await response.json();
        
        document.getElementById('modal-title').innerText = 'Editar Usuario';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.nombre;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-cargo').value = user.cargo;
        document.getElementById('user-depto').value = user.departamento;
        
        document.getElementById('user-modal').classList.add('active');
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
    }
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
        }
    }
}

// ==================== UI & EXPORT ====================

function openNewUserModal() {
    document.getElementById('modal-title').innerText = 'Nuevo Usuario';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('user-modal').classList.remove('active');
}

function exportToExcel() {
    const table = document.getElementById('users-table');
    // Creamos una hoja de cálculo a partir de la tabla HTML (ignorando la última columna de acciones si queremos)
    const wb = XLSX.utils.table_to_book(table, {sheet: "Usuarios Tiquetera"});
    XLSX.writeFile(wb, 'Reporte_Usuarios_Tiquetera.xlsx');
}
