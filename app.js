/* =========================================================
   STYLE TERMINAL (VERT/NOIR)
   ========================================================= */
// Injection dynamique du style pour l'effet terminal rétro
const styleTerminal = document.createElement('style');
styleTerminal.innerHTML = `
  body {
    background-color: #000000;
    color: #00ff00;
    font-family: 'Courier New', Courier, monospace;
    margin: 0;
    padding: 20px;
  }

  /* Conteneur principal du chat */
  #chatContainer {
    max-width: 800px;
    margin: 0 auto;
    border: 2px solid #00ff00;
    padding: 10px;
    box-shadow: 0 0 10px #00ff00;
  }

  /* Zone d'affichage des messages */
  #chatWindow {
    background-color: #000000;
    color: #00ff00;
    border: 1px solid #003300;
    height: 400px;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 15px;
    font-family: 'Courier New', Courier, monospace;
    text-shadow: 0 0 2px #00ff00; /* Effet de lueur CRT */
  }

  /* Style d'un message individuel */
  .chat-msg {
    margin-bottom: 8px;
    line-height: 1.4;
    word-wrap: break-word;
  }

  /* Pseudo de l'utilisateur */
  .chat-author {
    color: #00ff00;
    font-weight: bold;
    text-transform: uppercase;
  }

  /* Heure du message */
  .chat-time {
    color: #008f11; /* Vert plus foncé */
    font-size: 0.85em;
    margin-right: 8px;
  }

  /* Zone de saisie (inputs et boutons) */
  .input-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  input[type="text"], input[type="date"] {
    background-color: #000;
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 8px;
    font-family: 'Courier New', Courier, monospace;
    outline: none;
  }

  input::placeholder {
    color: #005500;
  }

  button {
    background-color: #003300;
    color: #00ff00;
    border: 1px solid #00ff00;
    padding: 8px 16px;
    cursor: pointer;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    transition: all 0.2s;
  }

  button:hover {
    background-color: #00ff00;
    color: #000;
  }

  /* Scrollbar style terminal */
  #chatWindow::-webkit-scrollbar {
    width: 10px;
  }
  #chatWindow::-webkit-scrollbar-track {
    background: #000;
    border-left: 1px solid #003300;
  }
  #chatWindow::-webkit-scrollbar-thumb {
    background: #00ff00;
    border: 1px solid #000;
  }
`;
document.head.appendChild(styleTerminal);

/* =========================================================
   CONFIGURATION FIREBASE (À garder telle quelle)
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyCFFI_TOzVlWX1GCAZW4tsx-Z80qqgkXpM",
  authDomain: "partage-e313d.firebaseapp.com",
  databaseURL: "https://partage-e313d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "partage-e313d",
  storageBucket: "partage-e313d.firebasestorage.app",
  messagingSenderId: "815247760270",
  appId: "1:815247760270:web:f079ba6b1a8e22439462df"
};

// Initialisation (assurez-vous que la librairie Firebase est chargée avant ce script)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const chatRef = db.ref('chat/messages');

  /* =========================================================
     LOGIQUE CHAT
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    
    // Récupération des éléments DOM
    const chatWindow = document.getElementById('chatWindow');
    const chatInput  = document.getElementById('chatInput');
    const sendBtn    = document.getElementById('sendBtn');
    const pseudoInput = document.getElementById('userPseudo'); // Nouveau champ pour le pseudo

    // 1. Écoute en temps réel des messages
    chatRef.on('value', snap => {
      const raw = snap.val();
      const msgs = raw ? Object.values(raw) : [];
      chatWindow.innerHTML = '';

      msgs.forEach(m => {
        const div = document.createElement('div');
        div.className = 'chat-msg';
        
        const time = new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        // Récupération du pseudo (avec fallback "Anonyme" si manquant)
        const author = m.author || "Anonyme"; 
        
        // Affichage formaté : [HEURE] PSEUDO: Message
        div.innerHTML = `<span class="chat-time">[${time}]</span><span class="chat-author">&lt;${author}&gt;</span> ${m.text}`;
        
        chatWindow.appendChild(div);
      });

      // Scroll automatique vers le bas
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });

    // 2. Envoi d'un nouveau message
    sendBtn.addEventListener('click', () => {
      const txt = chatInput.value.trim();
      const author = pseudoInput.value.trim(); // Récupération du pseudo saisi

      if (!txt) return;
      if (!author) {
        alert("Veuillez entrer un pseudo avant d'envoyer un message.");
        pseudoInput.focus();
        return;
      }

      const newMsg = {
        text: txt,
        author: author, // Le pseudo est sauvegardé dans la base
        timestamp: Date.now()
      };

      chatRef.push(newMsg)
        .then(() => { 
          chatInput.value = ''; 
          chatInput.focus();
        })
        .catch(err => console.error('Erreur d’envoi du chat :', err));
    });

    // Permettre l'envoi avec la touche Entrée
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.click();
    });
  });
} else {
  console.error("Firebase n'est pas chargé. Veuillez inclure le SDK Firebase avant ce script.");
}
