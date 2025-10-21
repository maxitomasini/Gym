let progressChart = null;

function updateChart() {
    const exerciseId = parseInt(document.getElementById('exerciseSelect').value);
    const exercise = exercises.find(ex => ex.id === exerciseId);
    
    if (!exercise) {
        if (progressChart) {
            progressChart.destroy();
        }
        return;
    }
    
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Preparar datos para el gráfico
    const labels = exercise.history
        .slice()
        .reverse()
        .map(record => new Date(record.date).toLocaleDateString());
    
    const weights = exercise.history
        .slice()
        .reverse()
        .map(record => record.weight);
    
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
                tension: 0.4
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
                        size: 16
                    }
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Peso (kg)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            }
        }
    });
}