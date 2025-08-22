const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const toggleTheme = document.getElementById('toggleTheme');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    toggleTheme.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});