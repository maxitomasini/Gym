// Variables globales
let currentStreak = 0;
let exercises = [];
let currentRoutine = null;

// Lista de ejercicios predefinidos
const predefinedExercises = [
    'Press banco plano',
    'Press banco inclinado',
    'Sentadilla libre',
    'Estocadas',
    'Peso muerto',
    'Abdominales',
    'Gemelos',
    'Vuelos laterales',
    'Remo con barra',
    'Remo unilateral',
    'Curl de bíceps',
    'Rompe cráneos'
];

// Días de la semana
const weekDays = [
    { id: 'monday', name: 'Lunes' },
    { id: 'tuesday', name: 'Martes' },
    { id: 'wednesday', name: 'Miércoles' },
    { id: 'thursday', name: 'Jueves' },
    { id: 'friday', name: 'Viernes' },
    { id: 'saturday', name: 'Sábado' },
    { id: 'sunday', name: 'Domingo' }
];

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth(); // Verificar autenticación
    
    loadUserData();
    updateStreakDisplay();
    loadExercises();
    loadSavedRoutine();
    initializeProgressSection();
});

// Cargar datos del usuario
function loadUserData() {
    const userData = localStorage.getItem('gym_user_data');
    if (userData) {
        const data = JSON.parse(userData);
        currentStreak = data.streak || 0;
        exercises = data.exercises || [];
    }
}

// Guardar datos del usuario
function saveUserData() {
    const userData = {
        streak: currentStreak,
        exercises: exercises,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('gym_user_data', JSON.stringify(userData));
}

// Racha de entrenamiento
function updateStreakDisplay() {
    document.getElementById('streakCount').textContent = currentStreak;
    
    const today = new Date().toDateString();
    const lastTraining = localStorage.getItem('last_training_date');
    
    const markTrainingBtn = document.getElementById('markTrainingBtn');
    if (lastTraining === today) {
        markTrainingBtn.disabled = true;
        markTrainingBtn.textContent = '✅ Entrenamiento de hoy registrado';
    } else {
        markTrainingBtn.disabled = false;
        markTrainingBtn.textContent = '✅ Marcar entrenamiento de hoy';
    }
}

function markTrainingDone() {
    const today = new Date().toDateString();
    const lastTraining = localStorage.getItem('last_training_date');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastTraining === yesterday.toDateString()) {
        // Día consecutivo
        currentStreak++;
    } else if (!lastTraining || lastTraining !== today) {
        // Nuevo día o primer entrenamiento
        currentStreak = 1;
    }
    
    localStorage.setItem('last_training_date', today);
    saveUserData();
    updateStreakDisplay();
    
    alert('¡Entrenamiento registrado! 🔥');
}

// Navegación entre secciones
function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Mostrar sección seleccionada
    const section = document.getElementById(`${sectionName}-section`);
    section.classList.remove('hidden');
    
    // Inicializar componentes específicos de cada sección
    if (sectionName === 'routines') {
        loadSavedRoutine();
    } else if (sectionName === 'loads') {
        initializeLoadsSection();
    } else if (sectionName === 'progress') {
        initializeProgressSection();
    }
}

// =============================================
// GESTIÓN DE RUTINAS SEMANALES
// =============================================

// Cargar rutina guardada
function loadSavedRoutine() {
    const savedRoutine = localStorage.getItem('current_routine');
    const noRoutineMessage = document.getElementById('noRoutineMessage');
    const savedRoutineDiv = document.getElementById('savedRoutine');
    const routinePreview = document.getElementById('routinePreview');
    
    if (savedRoutine) {
        currentRoutine = JSON.parse(savedRoutine);
        noRoutineMessage.classList.add('hidden');
        savedRoutineDiv.classList.remove('hidden');
        
        // Mostrar preview de la rutina
        routinePreview.innerHTML = '';
        weekDays.forEach(day => {
            const dayExercises = currentRoutine[day.id] || [];
            const dayElement = document.createElement('div');
            dayElement.className = 'routine-day-preview';
            
            let exercisesText = 'Día de descanso';
            let exerciseClass = 'rest-day';
            
            if (dayExercises.length > 0 && !dayExercises.includes('Día de descanso')) {
                exercisesText = dayExercises.join(', ');
                exerciseClass = 'training-day';
            }
            
            dayElement.innerHTML = `
                <strong>${day.name}:</strong>
                <span class="${exerciseClass}">${exercisesText}</span>
            `;
            routinePreview.appendChild(dayElement);
        });
    } else {
        noRoutineMessage.classList.remove('hidden');
        savedRoutineDiv.classList.add('hidden');
    }
    
    // Asegurarse de que el formulario esté oculto
    document.getElementById('routineForm').classList.add('hidden');
}

// Mostrar formulario de rutina
function showRoutineForm() {
    document.getElementById('routineState').classList.add('hidden');
    document.getElementById('routineForm').classList.remove('hidden');
    loadRoutineTable();
}

// Cancelar edición
function cancelEdit() {
    document.getElementById('routineForm').classList.add('hidden');
    document.getElementById('routineState').classList.remove('hidden');
}

// Cargar tabla de rutina semanal con checkboxes
function loadRoutineTable() {
    const tbody = document.getElementById('routineTableBody');
    
    tbody.innerHTML = weekDays.map(day => {
        const dayExercises = currentRoutine ? (currentRoutine[day.id] || []) : [];
        const isRestDay = dayExercises.includes('Día de descanso');
        const selectedExercises = dayExercises.filter(ex => ex !== 'Día de descanso');
        
        return `
            <tr>
                <td class="day-cell">
                    <strong>${day.name}</strong>
                </td>
                <td class="exercises-cell">
                    <!-- Lista de checkboxes -->
                    <div class="exercises-checkbox-list" id="checkbox-${day.id}">
                        <div class="checkbox-item">
                            <input type="checkbox" id="${day.id}-descanso" 
                                   value="Día de descanso" 
                                   ${isRestDay ? 'checked' : ''}
                                   onchange="toggleRestDay('${day.id}')">
                            <label for="${day.id}-descanso" class="rest-day-label">
                                🛌 Día de descanso
                            </label>
                        </div>
                        ${predefinedExercises.map(exercise => {
                            const isChecked = selectedExercises.includes(exercise);
                            return `
                                <div class="checkbox-item">
                                    <input type="checkbox" id="${day.id}-${exercise.replace(/\s+/g, '-')}" 
                                           value="${exercise}" 
                                           ${isChecked ? 'checked' : ''}
                                           onchange="updateSelectedTags('${day.id}')">
                                    <label for="${day.id}-${exercise.replace(/\s+/g, '-')}">
                                        ${exercise}
                                    </label>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- Tags de ejercicios seleccionados -->
                    <div class="selected-exercises" id="selected-${day.id}">
                        ${renderSelectedTags(day.id, isRestDay, selectedExercises)}
                    </div>
                </td>
                <td class="actions-cell">
                    <button onclick="markAsRestDay('${day.id}')" class="btn-small">
                        🛌 Solo descanso
                    </button>
                    <button onclick="clearDay('${day.id}')" class="btn-small btn-secondary">
                        ✗ Limpiar día
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Renderizar tags seleccionados
function renderSelectedTags(dayId, isRestDay, selectedExercises) {
    if (isRestDay) {
        return `
            <span class="exercise-tag rest-day">
                🛌 Día de descanso
                <button class="btn-remove-tag" onclick="removeExerciseTag('${dayId}', 'Día de descanso')">×</button>
            </span>
        `;
    } else if (selectedExercises.length > 0) {
        return selectedExercises.map(exercise => `
            <span class="exercise-tag">
                ${exercise}
                <button class="btn-remove-tag" onclick="removeExerciseTag('${dayId}', '${exercise}')">×</button>
            </span>
        `).join('');
    } else {
        return '<span class="no-exercises">No hay ejercicios seleccionados</span>';
    }
}

// Actualizar tags cuando cambian los checkboxes
function updateSelectedTags(dayId) {
    const checkboxes = document.querySelectorAll(`#checkbox-${dayId} input[type="checkbox"]`);
    const selectedContainer = document.getElementById(`selected-${dayId}`);
    
    const selectedExercises = [];
    let hasRestDay = false;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            if (checkbox.value === 'Día de descanso') {
                hasRestDay = true;
            } else {
                selectedExercises.push(checkbox.value);
            }
        }
    });
    
    // Si se selecciona día de descanso, deseleccionar otros checkboxes
    if (hasRestDay) {
        checkboxes.forEach(checkbox => {
            if (checkbox.value !== 'Día de descanso') {
                checkbox.checked = false;
            }
        });
        selectedExercises.length = 0;
    }
    
    selectedContainer.innerHTML = renderSelectedTags(dayId, hasRestDay, selectedExercises);
}

// Toggle día de descanso
function toggleRestDay(dayId) {
    const restCheckbox = document.getElementById(`${dayId}-descanso`);
    
    if (restCheckbox.checked) {
        // Si se activa día de descanso, deseleccionar otros checkboxes
        const otherCheckboxes = document.querySelectorAll(`#checkbox-${dayId} input[type="checkbox"]:not([value="Día de descanso"])`);
        otherCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    updateSelectedTags(dayId);
}

// Remover tag de ejercicio
function removeExerciseTag(dayId, exercise) {
    const checkbox = document.getElementById(`${dayId}-${exercise.replace(/\s+/g, '-')}`);
    if (checkbox) {
        checkbox.checked = false;
    } else if (exercise === 'Día de descanso') {
        const restCheckbox = document.getElementById(`${dayId}-descanso`);
        restCheckbox.checked = false;
    }
    
    updateSelectedTags(dayId);
}

// Marcar día como descanso (exclusivo)
function markAsRestDay(dayId) {
    const checkboxes = document.querySelectorAll(`#checkbox-${dayId} input[type="checkbox"]`);
    
    // Deseleccionar todos los checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Seleccionar solo día de descanso
    const restCheckbox = document.getElementById(`${dayId}-descanso`);
    restCheckbox.checked = true;
    
    updateSelectedTags(dayId);
}

// Limpiar día
function clearDay(dayId) {
    const checkboxes = document.querySelectorAll(`#checkbox-${dayId} input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectedTags(dayId);
}

// Guardar rutina
function saveRoutine() {
    const routine = {};
    let hasData = false;
    
    weekDays.forEach(day => {
        const checkboxes = document.querySelectorAll(`#checkbox-${day.id} input[type="checkbox"]:checked`);
        const selectedExercises = Array.from(checkboxes).map(checkbox => checkbox.value);
        
        if (selectedExercises.length > 0) {
            routine[day.id] = selectedExercises;
            hasData = true;
        }
    });
    
    if (!hasData) {
        alert('Por favor, selecciona ejercicios para al menos un día de la semana');
        return;
    }
    
    // Guardar en localStorage
    localStorage.setItem('current_routine', JSON.stringify(routine));
    currentRoutine = routine;
    
    // Volver al estado de visualización
    cancelEdit();
    loadSavedRoutine();
    
    alert('✅ Rutina guardada correctamente');
}

// Eliminar rutina
function deleteRoutine() {
    if (confirm('¿Estás seguro de que quieres eliminar tu rutina actual?')) {
        localStorage.removeItem('current_routine');
        currentRoutine = null;
        loadSavedRoutine();
        alert('Rutina eliminada correctamente');
    }
}

// =============================================
// GESTIÓN DE EJERCICIOS Y CARGAS
// =============================================

// Inicializar select de ejercicios en cargas
function initializeLoadsSection() {
    const exerciseSelect = document.getElementById('exerciseSelectLoad');
    
    // Limpiar opciones existentes
    exerciseSelect.innerHTML = '<option value="">Selecciona un ejercicio</option>';
    
    // Agregar ejercicios predefinidos
    predefinedExercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        exerciseSelect.appendChild(option);
    });
}

function addExercise() {
    const exerciseSelect = document.getElementById('exerciseSelectLoad');
    const selectedExercise = exerciseSelect.value;
    const weight = parseFloat(document.getElementById('exerciseWeight').value);
    
    if (!selectedExercise) {
        alert('Por favor, selecciona un ejercicio');
        return;
    }
    
    if (isNaN(weight) || weight <= 0) {
        alert('Por favor, ingresa un peso válido mayor a 0');
        return;
    }
    
    const exercise = {
        id: Date.now(),
        name: selectedExercise,
        weight: weight,
        date: new Date().toISOString(),
        history: [{ weight: weight, date: new Date().toISOString() }]
    };
    
    // Verificar si el ejercicio ya existe
    const existingIndex = exercises.findIndex(ex => ex.name.toLowerCase() === selectedExercise.toLowerCase());
    
    if (existingIndex !== -1) {
        // Actualizar ejercicio existente
        exercises[existingIndex].weight = weight;
        exercises[existingIndex].history.unshift({
            weight: weight,
            date: new Date().toISOString()
        });
    } else {
        // Agregar nuevo ejercicio
        exercises.push(exercise);
    }
    
    saveUserData();
    loadExercises();
    initializeProgressSection();
    
    // Limpiar formulario pero mantener el ejercicio seleccionado
    document.getElementById('exerciseWeight').value = '';
    
    alert(`✅ ${selectedExercise} actualizado a ${weight} kg`);
}

function loadExercises() {
    const exercisesList = document.getElementById('exercisesList');
    
    if (exercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="no-exercises-message">
                <p>No hay ejercicios registrados.</p>
                <p>¡Selecciona un ejercicio y agrega tu primer peso!</p>
            </div>
        `;
        return;
    }
    
    // Ordenar ejercicios alfabéticamente
    const sortedExercises = exercises.sort((a, b) => a.name.localeCompare(b.name));
    
    exercisesList.innerHTML = sortedExercises.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-info">
                <h4>${exercise.name}</h4>
                <p>Peso actual: <strong>${exercise.weight} kg</strong></p>
                <div class="exercise-history">
                    <small>Historial: ${exercise.history.slice(0, 3).map(record => 
                        `${record.weight}kg (${new Date(record.date).toLocaleDateString()})`
                    ).join(' → ')}</small>
                </div>
            </div>
            <div class="exercise-actions">
                <button onclick="editExercise(${exercise.id})" class="btn-edit">✏️ Editar</button>
                <button onclick="deleteExercise(${exercise.id})" class="btn-delete">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function editExercise(id) {
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
        const newWeight = prompt(`Editar peso para ${exercise.name} (kg):`, exercise.weight);
        if (newWeight && !isNaN(parseFloat(newWeight)) && parseFloat(newWeight) > 0) {
            const weight = parseFloat(newWeight);
            exercise.weight = weight;
            exercise.history.unshift({
                weight: weight,
                date: new Date().toISOString()
            });
            saveUserData();
            loadExercises();
            initializeProgressSection();
            
            alert(`✅ ${exercise.name} actualizado a ${weight} kg`);
        }
    }
}

function deleteExercise(id) {
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise && confirm(`¿Estás seguro de que quieres eliminar ${exercise.name} y todo su historial?`)) {
        exercises = exercises.filter(ex => ex.id !== id);
        saveUserData();
        loadExercises();
        initializeProgressSection();
        alert('Ejercicio eliminado correctamente');
    }
}

// =============================================
// SECCIÓN DE PROGRESO Y GRÁFICOS
// =============================================

let progressChart = null;
let currentChartView = 'all'; // 'all' o 'individual'

// Inicializar sección de progreso
function initializeProgressSection() {
    const exerciseSelect = document.getElementById('exerciseSelect');
    const noDataMessage = document.getElementById('noDataMessage');
    const chartViewSelect = document.getElementById('chartViewSelect');
    
    // Configurar vista por defecto
    chartViewSelect.value = 'all';
    currentChartView = 'all';
    document.getElementById('individualExerciseGroup').style.display = 'none';
    
    // Limpiar y llenar select de ejercicios individuales
    exerciseSelect.innerHTML = '<option value="">Selecciona un ejercicio</option>' +
        exercises.map(exercise => 
            `<option value="${exercise.id}">${exercise.name}</option>`
        ).join('');
    
    if (exercises.length > 0) {
        exerciseSelect.value = exercises[0].id;
        updateChart();
        noDataMessage.classList.add('hidden');
        generateMiniCharts();
    } else {
        noDataMessage.classList.remove('hidden');
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        document.getElementById('miniChartsContainer').innerHTML = '';
    }
}

// Cambiar vista del gráfico
function changeChartView() {
    const chartViewSelect = document.getElementById('chartViewSelect');
    const individualExerciseGroup = document.getElementById('individualExerciseGroup');
    
    currentChartView = chartViewSelect.value;
    
    if (currentChartView === 'individual') {
        individualExerciseGroup.style.display = 'block';
        updateIndividualChart();
    } else {
        individualExerciseGroup.style.display = 'none';
        updateAllExercisesChart();
    }
}

// Actualizar gráfico individual
function updateIndividualChart() {
    if (currentChartView !== 'individual') return;
    
    const exerciseId = parseInt(document.getElementById('exerciseSelect').value);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (!exercise) {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        noDataMessage.classList.remove('hidden');
        return;
    }
    
    noDataMessage.classList.add('hidden');
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Preparar datos para el gráfico individual
    const historyData = exercise.history.slice().reverse();
    const labels = historyData.map(record => new Date(record.date).toLocaleDateString());
    const weights = historyData.map(record => record.weight);
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Progreso en ${exercise.name} (kg)`,
                data: weights,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Progreso en ${exercise.name}`,
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Peso (kg)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Actualizar gráfico con todos los ejercicios
function updateAllExercisesChart() {
    if (currentChartView !== 'all') return;
    
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (exercises.length === 0) {
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        noDataMessage.classList.remove('hidden');
        return;
    }
    
    noDataMessage.classList.add('hidden');
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Preparar datos para todos los ejercicios
    const allData = prepareAllExercisesData();
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allData.labels,
            datasets: allData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Progreso General - Todos los Ejercicios',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 6,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Peso (kg)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Preparar datos para todos los ejercicios
function prepareAllExercisesData() {
    // Obtener todas las fechas únicas de todos los ejercicios
    const allDates = new Set();
    exercises.forEach(exercise => {
        exercise.history.forEach(record => {
            allDates.add(new Date(record.date).toLocaleDateString());
        });
    });
    
    // Ordenar fechas
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
    
    // Colores para los diferentes ejercicios
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3',
        '#ff9a9e', '#fad0c4', '#ffecd2', '#fcb69f'
    ];
    
    // Crear datasets para cada ejercicio
    const datasets = exercises.map((exercise, index) => {
        const color = colors[index % colors.length];
        
        // Mapear datos del ejercicio a las fechas comunes
        const data = sortedDates.map(date => {
            const record = exercise.history.find(r => 
                new Date(r.date).toLocaleDateString() === date
            );
            return record ? record.weight : null;
        });
        
        return {
            label: exercise.name,
            data: data,
            borderColor: color,
            backgroundColor: color + '20', // Agregar transparencia
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: color,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    return {
        labels: sortedDates,
        datasets: datasets
    };
}

// Generar mini gráficos para cada ejercicio
function generateMiniCharts() {
    const container = document.getElementById('miniChartsContainer');
    
    if (exercises.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h3>📈 Progreso por Ejercicio</h3>
        <div class="mini-charts-grid">
            ${exercises.map(exercise => `
                <div class="mini-chart-card">
                    <h4>${exercise.name}</h4>
                    <div class="mini-chart-container">
                        <canvas id="mini-chart-${exercise.id}"></canvas>
                    </div>
                    <div class="mini-chart-info">
                        <span class="current-weight">Actual: ${exercise.weight} kg</span>
                        <span class="progress-indicator ${getProgressIndicator(exercise)}">
                            ${getProgressText(exercise)}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Generar los mini gráficos
    exercises.forEach(exercise => {
        generateMiniChart(exercise);
    });
}

// Generar mini gráfico individual
function generateMiniChart(exercise) {
    const ctx = document.getElementById(`mini-chart-${exercise.id}`).getContext('2d');
    
    const historyData = exercise.history.slice().reverse().slice(-6); // Últimos 6 registros
    const labels = historyData.map(record => 
        new Date(record.date).toLocaleDateString().split('/').slice(0, 2).join('/')
    );
    const weights = historyData.map(record => record.weight);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: weights,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                pointRadius: 2,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    bodyFont: { size: 12 },
                    padding: 8,
                    cornerRadius: 4
                }
            },
            scales: {
                y: {
                    display: false
                },
                x: {
                    display: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Obtener indicador de progreso
function getProgressIndicator(exercise) {
    if (exercise.history.length < 2) return 'neutral';
    
    const currentWeight = exercise.weight;
    const previousWeight = exercise.history[1].weight; // Segundo registro más reciente
    
    if (currentWeight > previousWeight) return 'positive';
    if (currentWeight < previousWeight) return 'negative';
    return 'neutral';
}

// Obtener texto de progreso
function getProgressText(exercise) {
    if (exercise.history.length < 2) return 'Sin historial';
    
    const currentWeight = exercise.weight;
    const previousWeight = exercise.history[1].weight;
    const difference = currentWeight - previousWeight;
    
    if (difference > 0) return `+${difference.toFixed(1)}kg ↗`;
    if (difference < 0) return `${difference.toFixed(1)}kg ↘`;
    return 'Sin cambio';
}

// Actualizar gráfico general (para mantener compatibilidad)
function updateChart() {
    if (currentChartView === 'all') {
        updateAllExercisesChart();
    } else {
        updateIndividualChart();
    }
    
    if (exercises.length > 0) {
        generateMiniCharts();
    }
}