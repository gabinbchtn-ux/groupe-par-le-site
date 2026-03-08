/* -------------------------------------------------
   Helper : connexion Firebase + références DB
------------------------------------------------- */
const firebaseConfig = {
  // 👉 Remplacez ces valeurs par celles de votre projet Firebase
  apiKey: "AIzaSyCFFI_TOzVlWX1GCAZW4tsx-Z80qqgkXpM",
  authDomain: "partage-e313d.firebaseapp.com",
  databaseURL: "https://partage-e313d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "partage-e313d",
  storageBucket: "partage-e313d.firebasestorage.app",
  messagingSenderId: "815247760270",
  appId: "1:815247760270:web:f079ba6b1a8e22439462df"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------- Auth anonyme ----------
firebase.auth().signInAnonymously().catch(err => console.error(err));

// ---------- Attendre que l'utilisateur soit connecté ----------
firebase.auth().onAuthStateChanged(user => {
  if (!user) return;               // pas encore prêt

  // --- Références DB ---
  const chatRef      = db.ref('chat/messages');
  const todoRef      = db.ref('todo/items');
  const notesRef     = db.ref('notes/content');
  const calendarRef  = db.ref('calendar/events');
  const visitsRef    = db.ref('stats/visits');

   const statusEl = document.getElementById('authStatus');
statusEl.textContent = `Connecté·e en tant que visiteur (${user.uid.slice(0, 8)}…)`;

   <p id="authStatus"></p>

  // --- UI (identique à la version précédente) ---
  document.addEventListener('DOMContentLoaded', () => {
    /* Tout le code que vous aviez déjà (chat, todo, notes, …) */
    /* … */
    
    // Exemple du compteur de visites (reste le même) :
    const visitSpan = document.getElementById('visitCount');
    visitsRef.transaction(cur => (cur || 0) + 1).then(r => {
      visitSpan.textContent = r.snapshot.val();
    });
  });
});
/* -------------------------------------------------
   DOMContentLoaded – tout le code UI
------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1️⃣ Chat (Firebase) ---------- */
  const chatWindow = document.getElementById('chatWindow');
  const chatInput  = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('sendBtn');

  // Rendu en temps réel
  chatRef.on('value', snap => {
    const msgs = snap.val() || [];
    chatWindow.innerHTML = '';
    msgs.forEach(m => {
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.textContent = m.text;
      chatWindow.appendChild(div);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });

  sendBtn.addEventListener('click', () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    const newMsg = { text: txt, timestamp: Date.now() };
    chatRef.push(newMsg);
    chatInput.value = '';
  });

  /* ---------- 2️⃣ Todo‑list (Firebase) ---------- */
  const newTask   = document.getElementById('newTask');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList   = document.getElementById('taskList');

  // Affichage en temps réel
  todoRef.on('value', snap => {
    const tasks = snap.val() || [];
    taskList.innerHTML = '';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.textContent = t;
      li.addEventListener('click', () => {
        // Supprimer la tâche cliquée
        todoRef.once('value').then(s => {
          const arr = s.val() || [];
          arr.splice(i, 1);
          todoRef.set(arr);
        });
      });
      taskList.appendChild(li);
    });
  });

  addTaskBtn.addEventListener('click', () => {
    const txt = newTask.value.trim();
    if (!txt) return;
    todoRef.once('value').then(s => {
      const arr = s.val() || [];
      arr.push(txt);
      todoRef.set(arr);
      newTask.value = '';
    });
  });

  /* ---------- 3️⃣ Bloc‑notes (Firebase) ---------- */
  const noteArea   = document.getElementById('noteArea');
  const saveNoteBtn = document.getElementById('saveNoteBtn');

  // Charger la note au démarrage
  notesRef.once('value').then(s => {
    noteArea.innerHTML = s.val() || '';
  });

  saveNoteBtn.addEventListener('click', () => {
    notesRef.set(noteArea.innerHTML).then(() => {
      alert('Note enregistrée');
    });
  });

  /* ---------- 4️⃣ Calendrier (Firebase) ---------- */
  const eventDate   = document.getElementById('eventDate');
  const eventDesc   = document.getElementById('eventDesc');
  const addEventBtn = document.getElementById('addEventBtn');
  const eventList   = document.getElementById('eventList');

  // Affichage en temps réel
  calendarRef.on('value', snap => {
    const evts = snap.val() || [];
    eventList.innerHTML = '';
    evts.forEach((e, i) => {
      const li = document.createElement('li');
      li.textContent = `${e.date} – ${e.desc}`;
      li.addEventListener('click', () => {
        // Supprimer l'événement cliqué
        calendarRef.once('value').then(s => {
          const arr = s.val() || [];
          arr.splice(i, 1);
          calendarRef.set(arr);
        });
      });
      eventList.appendChild(li);
    });
  });

  addEventBtn.addEventListener('click', () => {
    if (!eventDate.value || !eventDesc.value.trim()) return;
    const newEvt = { date: eventDate.value, desc: eventDesc.value.trim() };
    calendarRef.once('value').then(s => {
      const arr = s.val() || [];
      arr.push(newEvt);
      calendarRef.set(arr);
      eventDate.value = '';
      eventDesc.value = '';
    });
  });

  /* ---------- 7️⃣ Compteur de jours (local – pas besoin de Firebase) ---------- */
  const targetDate = document.getElementById('targetDate');
  const calcBtn    = document.getElementById('calcBtn');
  const resultP    = document.getElementById('result');

  calcBtn.addEventListener('click', () => {
    if (!targetDate.value) return;
    const today  = new Date();
    const target = new Date(targetDate.value);
    const diffMs = target - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      resultP.textContent = `Il reste ${diffDays} jour(s)`;
    } else if (diffDays < 0) {
      resultP.textContent = `${Math.abs(diffDays)} jour(s) déjà écoulé(s)`;
    } else {
      resultP.textContent = "C’est aujourd’hui !";
    }
  });

  /* ---------- 11️⃣ Recherche interne (Firebase) ---------- */
  const searchBox = document.getElementById('searchBox');
  const searchRes = document.getElementById('searchResults');

  function performSearch(query) {
    const q = query.toLowerCase();
    const hits = [];

    // Note
    notesRef.once('value').then(s => {
      const note = s.val() || '';
      if (note && note.toLowerCase().includes(q)) {
        hits.push({type:'Note', snippet: note.substring(0,30)+'…'});
      }

      // Todo
      todoRef.once('value').then(ts => {
        (ts.val()||[]).forEach(t => {
          if (t.toLowerCase().includes(q)) hits.push({type:'Todo', snippet:t});
        });

        // Events
        calendarRef.once('value').then(es => {
          (es.val()||[]).forEach(e => {
            if (e.desc.toLowerCase().includes(q) || e.date.includes(q)) {
              hits.push({type:'Événement', snippet:`${e.date} – ${e.desc}`});
            }
          });

          // Render
          searchRes.innerHTML = '';
          if (hits.length===0) {
            searchRes.innerHTML = '<li>Aucun résultat</li>';
            return;
          }
          hits.forEach(h => {
            const li = document.createElement('li');
            li.textContent = `[${h.type}] ${h.snippet}`;
            searchRes.appendChild(li);
          });
        });
      });
    });
  }

  searchBox.addEventListener('input', e => performSearch(e.target.value));

  /* ---------- 12️⃣ Mode sombre / clair ---------- */
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? 'dark' : '';
    localStorage.setItem('darkMode', isDark);
  }

  themeToggle.addEventListener('click', () => {
    const currentlyDark = document.documentElement.dataset.theme === 'dark';
    applyTheme(!currentlyDark);
  });

  // Init theme from localStorage
  applyTheme(localStorage.getItem('darkMode') === 'true');

  /* ---------- 15️⃣ À faire ce week‑end ---------- */
  const showWeekendBtn = document.getElementById('showWeekendBtn');
  const weekendList    = document.getElementById('weekendList');

  showWeekendBtn.addEventListener('click', () => {
    todoRef.once('value').then(s => {
      const tasks = s.val() || [];
      const filtered = tasks.filter(t =>
        /week[-\s]?end|samedi|dimanche/i.test(t)
      );
      weekendList.innerHTML = '';
      if (filtered.length===0) {
        weekendList.innerHTML = '<li>Aucune tâche prévue pour le week‑end</li>';
        return;
      }
      filtered.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        weekendList.appendChild(li);
      });
    });
  });

  /* ---------- 17️⃣ Statistiques d’usage (visites) ---------- */
  const visitSpan = document.getElementById('visitCount');

  // Incrémenter le compteur à chaque chargement
  visitsRef.transaction(current => (current || 0) + 1).then(res => {
    visitSpan.textContent = res.snapshot.val();
  });

}); // ← fin DOMContentLoaded
visits += 1;
localStorage.setItem('visits', visits);
visitSpan.textContent = visits;




