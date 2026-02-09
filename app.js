/* -------------------------------------------------
   Gestion du thème (clair / sombre)
------------------------------------------------- */
const themeBtn = document.getElementById('themeToggle');
const setTheme = (dark) => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', dark ? '1' : '0');
};
themeBtn.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
if (localStorage.getItem('darkMode') === '1') setTheme(true);

/* -------------------------------------------------
   TODO‑LIST
------------------------------------------------- */
const taskInput = document.getElementById('newTask');
const addBtn    = document.getElementById('addTaskBtn');
const taskList  = document.getElementById('tasks');

// Charger les tâches depuis localStorage
const loadTasks = () => {
    const saved = JSON.parse(localStorage.getItem('tasks') || '[]');
    saved.forEach(txt => createTaskElement(txt));
};
const saveTasks = () => {
    const items = Array.from(taskList.children).map(li => li.textContent);
    localStorage.setItem('tasks', JSON.stringify(items));
};
const createTaskElement = (text) => {
    const li = document.createElement('li');
    li.textContent = text;
    // Clic = supprimer / cocher
    li.addEventListener('click', () => { li.remove(); saveTasks(); });
    taskList.appendChild(li);
};

addBtn.addEventListener('click', () => {
    const txt = taskInput.value.trim();
    if (txt) {
        createTaskElement(txt);
        taskInput.value = '';
        saveTasks();
    }
});
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

loadTasks();

/* -------------------------------------------------
   BLOC‑NOTES (contenteditable)
------------------------------------------------- */
const editor = document.getElementById('noteEditor');
const NOTE_KEY = 'sharedNote';

// Charger le texte sauvegardé
editor.innerHTML = localStorage.getItem(NOTE_KEY) || 'Commencez à écrire ici…';

// Sauvegarder à chaque modification (debounce 300 ms)
let debounceTimer;
editor.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        localStorage.setItem(NOTE_KEY, editor.innerHTML);
    }, 300);
});