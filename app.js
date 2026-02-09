/* -------------------------------------------------
   Helper – simple local storage wrapper
------------------------------------------------- */
const LS = {
    get(key, def) {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

/* -------------------------------------------------
   1️⃣ Chat (local only)
------------------------------------------------- */
const chatWindow = document.getElementById('chatWindow');
const chatInput  = document.getElementById('chatInput');
const sendBtn    = document.getElementById('sendBtn');

function renderChat() {
    const msgs = LS.get('chatMsgs', []);
    chatWindow.innerHTML = '';
    msgs.forEach(m => {
        const div = document.createElement('div');
        div.className = 'chat-msg';
        div.textContent = m;
        chatWindow.appendChild(div);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
sendBtn.addEventListener('click', () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    const msgs = LS.get('chatMsgs', []);
    msgs.push(txt);
    LS.set('chatMsgs', msgs);
    chatInput.value = '';
    renderChat();
});
renderChat();

/* -------------------------------------------------
   2️⃣ Todo‑list
------------------------------------------------- */
const taskInput = document.getElementById('newTask');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList   = document.getElementById('taskList');

function renderTasks() {
    const tasks = LS.get('tasks', []);
    taskList.innerHTML = '';
    tasks.forEach((t, i) => {
        const li = document.createElement('li');
        li.textContent = t;
        li.addEventListener('click', () => {
            const arr = LS.get('tasks', []);
            arr.splice(i, 1);
            LS.set('tasks', arr);
            renderTasks();
        });
        taskList.appendChild(li);
    });
}
addTaskBtn.addEventListener('click', () => {
    const txt = taskInput.value.trim();
    if (!txt) return;
    const arr = LS.get('tasks', []);
    arr.push(txt);
    LS.set('tasks', arr);
    taskInput.value = '';
    renderTasks();
});
renderTasks();

/* -------------------------------------------------
   3️⃣ Bloc‑notes
------------------------------------------------- */
const noteArea   = document.getElementById('noteArea');
const saveNoteBtn = document.getElementById('saveNoteBtn');

noteArea.innerHTML = LS.get('note', '');
saveNoteBtn.addEventListener('click', () => {
    LS.set('note', noteArea.innerHTML);
    alert('Note enregistrée');
});

/* -------------------------------------------------
   4️⃣ Calendrier simple
------------------------------------------------- */
const eventDate = document.getElementById('eventDate');
const eventDesc = document.getElementById('eventDesc');
const addEventBtn = document.getElementById('addEventBtn');
const eventList = document.getElementById('eventList');

function renderEvents() {
    const evts = LS.get('events', []);
    eventList.innerHTML = '';
    evts.forEach((e, i) => {
        const li = document.createElement('li');
        li.textContent = `${e.date} – ${e.desc}`;
        li.addEventListener('click', () => {
            const arr = LS.get('events', []);
            arr.splice(i, 1);
            LS.set('events', arr);
            renderEvents();
        });
        eventList.appendChild(li);
    });
}
addEventBtn.addEventListener('click', () => {
    if (!eventDate.value || !eventDesc.value.trim()) return;
    const evts = LS.get('events', []);
    evts.push({date: eventDate.value, desc: eventDesc.value.trim()});
    LS.set('events', evts);
    eventDate.value = '';
    eventDesc.value = '';
    renderEvents();
});
renderEvents();

/* -------------------------------------------------
   7️⃣ Compteur de jours depuis / jusqu’à
------------------------------------------------- */
const targetDate = document.getElementById('targetDate');
const calcBtn    = document.getElementById('calcBtn');
const resultP    = document.getElementById('result');

calcBtn.addEventListener('click', () => {
    if (!targetDate.value) return;
    const today = new Date();
    const target = new Date(targetDate.value);
    const diffMs = target - today;               // positive = future, negative = past
    const diffDays = Math.round(diffMs / (1000*60*60*24));
    if (diffDays > 0) {
        resultP.textContent = `Il reste ${diffDays} jour(s)`;
    } else if (diffDays < 0) {
        resultP.textContent = `${Math.abs(diffDays)} jour(s) déjà écoulé(s)`;
    } else {
        resultP.textContent = "C’est aujourd’hui !";
    }
});

/* -------------------------------------------------
   11️⃣ Recherche interne (dans notes, tâches, événements)
------------------------------------------------- */
const searchBox = document.getElementById('searchBox');
const searchRes = document.getElementById('searchResults');

function performSearch(q) {
    const lower = q.toLowerCase();
    const results = [];

    // notes
    const note = LS.get('note', '');
    if (note && note.toLowerCase().includes(lower)) {
        results.push({type: 'Note', snippet: note.substring(0, 30) + '…'});
    }

    // tasks
    const tasks = LS.get('tasks', []);
    tasks.forEach(t => {
        if (t.toLowerCase().includes(lower)) results.push({type: 'Todo', snippet: t});
    });

    // events
    const evts = LS.get('events', []);
    evts.forEach(e => {
        if (e.desc.toLowerCase().includes(lower) || e.date.includes(lower))
            results.push({type: 'Événement', snippet: `${e.date} – ${e.desc}`});
    });

    // render
    searchRes.innerHTML = '';
    if (results.length === 0) {
        searchRes.innerHTML = '<li>Aucun résultat</li>';
        return;
    }
    results.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `[${r.type}] ${r.snippet}`;
        searchRes.appendChild(li);
    });
}
searchBox.addEventListener('input', e => performSearch(e.target.value));

/* -------------------------------------------------
   12️⃣ Mode sombre / clair (toggle in header)
------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : '';
    localStorage.setItem('darkMode', dark);
}
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    setTheme(!isDark);
});
// initialise from storage
setTheme(localStorage.getItem('darkMode') === 'true');

/* -------------------------------------------------
   15️⃣ À faire ce week‑end (filter todo‑list)
------------------------------------------------- */
const showWeekendBtn = document.getElementById('showWeekendBtn');
const weekendList = document.getElementById('weekendList');

showWeekendBtn.addEventListener('click', () => {
    const tasks = LS.get('tasks', []);
    const today = new Date();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7)); // next Saturday
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    // Simple heuristic: keep tasks that contain keywords like "week‑end", "samedi", "dimanche"
    const weekendTasks = tasks.filter(t =>
        /week[-\s]?end|samedi|dimanche/i.test(t)
    );

    weekendList.innerHTML = '';
    if (weekendTasks.length === 0) {
        weekendList.innerHTML = '<li>Aucune tâche prévue pour le week‑end</li>';
        return;
    }
    weekendTasks.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        weekendList.appendChild(li);
    });
});

/* -------------------------------------------------
   17️⃣ Statistiques d’usage (visites)
------------------------------------------------- */
const visitSpan = document.getElementById('visitCount');
let visits = Number(localStorage.getItem('visits') || 0);
visits += 1;
localStorage.setItem('visits', visits);
visitSpan.textContent = visits;
