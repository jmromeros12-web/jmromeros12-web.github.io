// 1. IMPORTACIONES DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. CONFIGURACIÓN DE TU PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyBemn4iioAe9qgO-1czldTnmG3o4wS8DfY",
  authDomain: "lista-de-tareas-fea8f.firebaseapp.com",
  projectId: "lista-de-tareas-fea8f",
  storageBucket: "lista-de-tareas-fea8f.firebasestorage.app",
  messagingSenderId: "363727448987",
  appId: "1:363727448987:web:73da06f456adec65dccf3e",
  measurementId: "G-1HTRCGETSY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. CAPTURA DE ELEMENTOS DEL DOM
const taskInput = document.getElementById('task-input');
const catSelect = document.getElementById('cat-select');
const prioSelect = document.getElementById('prio-select');
const addBtn = document.getElementById('add-btn');
const tasksList = document.getElementById('tasks-list');
const dateLabel = document.getElementById('date-label');

// Elementos de Estadísticas
const sTotal = document.getElementById('s-total');
const sPending = document.getElementById('s-pending');
const sDone = document.getElementById('s-done');

// Variables de estado local
let todasLasTareas = [];
let filtroActual = 'all';

// Mapeos visuales para las categorías y prioridades
const iconosCategorias = { work: '💼', personal: '🧠', health: '🩿', other: '📌' };

// 4. MOSTRAR LA FECHA ACTUAL
const opcionesFecha = { weekday: 'short', day: 'numeric', month: 'short' };
dateLabel.textContent = new Date().toLocaleDateString('es-ES', opcionesFecha).replace('.', '');

// 5. ESCUCHAR CAMBIOS EN TIEMPO REAL DESDE FIREBASE
// Trae las tareas y actualiza la pantalla de forma automática
onSnapshot(collection(db, "tareas"), (snapshot) => {
    todasLasTareas = [];
    snapshot.forEach((docSnapshot) => {
        todasLasTareas.push({
            id: docSnapshot.id,
            ...docSnapshot.data()
        });
    });
    
    // Ordenar por fecha de creación para que las nuevas salgan al principio
    todasLasTareas.sort((a, b) => b.fechaCreacion?.toDate() - a.fechaCreacion?.toDate());
    
    renderizarTareas();
});

// 6. FUNCIÓN PARA PINTAR LAS TAREAS Y ACTUALIZAR CONTADORES
function renderizarTareas() {
    tasksList.innerHTML = '';
    let total = todasLasTareas.length;
    let completadas = 0;
    let pendientes = 0;

    todasLasTareas.forEach(tarea => {
        if (tarea.completada) completadas++;
        else pendientes++;

        // Aplicar la lógica de los filtros
        let mostrar = false;
        if (filtroActual === 'all') mostrar = true;
        else if (filtroActual === 'pending' && !tarea.completada) mostrar = true;
        else if (filtroActual === 'done' && tarea.completada) mostrar = true;
        else if (filtroActual === tarea.categoria) mostrar = true;

        if (!mostrar) return;

        // Construcción de la estructura HTML de cada tarea
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${tarea.completada ? 'completed' : ''}`;

        taskCard.innerHTML = `
            <div class="task-left">
                <button class="check-btn" data-id="${tarea.id}">
                    <i class="ti ${tarea.completada ? 'ti-circle-check-filled' : 'ti-circle'}" style="font-size: 20px;"></i>
                </button>
                <div class="task-content">
                    <span class="task-title">${tarea.titulo}</span>
                    <div class="task-tags">
                        <span class="tag-cat">${iconosCategorias[tarea.categoria] || '📌'} ${tarea.categoria}</span>
                        <span class="tag-prio prio-${tarea.prioridad}">${tarea.prioridad}</span>
                    </div>
                </div>
            </div>
            <button class="delete-btn" data-id="${tarea.id}">
                <i class="ti ti-trash"></i>
            </button>
        `;

        // Asignar los eventos de completar y borrar a los botones internos de la tarea
        taskCard.querySelector('.check-btn').addEventListener('click', () => cambiarEstadoTarea(tarea.id, tarea.completada));
        taskCard.querySelector('.delete-btn').addEventListener('click', () => borrarTarea(tarea.id));

        tasksList.appendChild(taskCard);
    });

    // Actualizar contadores numéricos en la interfaz
    sTotal.textContent = total;
    sPending.textContent = pendientes;
    sDone.textContent = completadas;
}

// 7. OPERACIONES ACCIONADAS POR EL USUARIO

// Añadir tarea a la base de datos
addBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const texto = taskInput.value.trim();
    if (!texto) return;

    try {
        await addDoc(collection(db, "tareas"), {
            titulo: texto,
            categoria: catSelect.value,
            prioridad: prioSelect.value,
            completada: false,
            fechaCreacion: new Date()
        });
        taskInput.value = ''; // Limpiar el input
    } catch (error) {
        console.error("Error al añadir tarea:", error);
    }
});

// Cambiar estado de completado (true / false) en Firebase
async function cambiarEstadoTarea(id, estadoActual) {
    try {
        const tareaRef = doc(db, "tareas", id);
        await updateDoc(tareaRef, { completada: !estadoActual });
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
    }
}

// Eliminar tarea permanentemente de Firebase
async function borrarTarea(id) {
    try {
        await deleteDoc(doc(db, "tareas", id));
    } catch (error) {
        console.error("Error al borrar tarea:", error);
    }
}

// 8. CONTROLADOR DE FILTROS
document.getElementById('filters-container').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;

    // Cambiar la clase activa visualmente
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Cambiar el filtro y redibujar
    filtroActual = e.target.getAttribute('data-filter');
    renderizarTareas();
});