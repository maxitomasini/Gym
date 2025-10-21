// Simulación de base de datos de usuarios
const users = {
    'admin': { password: '123', name: 'Administrador' },
    'usuario': { password: '123', name: 'Usuario' }
};

// Verificar si el usuario está logueado
function checkAuth() {
    const token = localStorage.getItem('gym_token');
    const user = localStorage.getItem('gym_user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(user);
}

// Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (users[username] && users[username].password === password) {
                // Generar token simple
                const token = btoa(JSON.stringify({
                    username: username,
                    timestamp: Date.now()
                }));
                
                const userData = {
                    username: username,
                    name: users[username].name
                };
                
                localStorage.setItem('gym_token', token);
                localStorage.setItem('gym_user', JSON.stringify(userData));
                
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        });
    }
    
    // Mostrar información del usuario en el dashboard
    const userWelcome = document.getElementById('userWelcome');
    if (userWelcome) {
        const user = checkAuth();
        if (user) {
            userWelcome.textContent = `Bienvenido, ${user.name}`;
        }
    }
});

// Logout
function logout() {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    window.location.href = 'login.html';
}