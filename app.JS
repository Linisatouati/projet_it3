// =======================================================================
// PARTIE 1 : INITIALISATION ET AUTHENTIFICATION
// =======================================================================

// Votre configuration Firebase (copiée depuis la console)
const firebaseConfig = {
    apiKey: "AIzaSyDM2jPaCv30Goat6_labd6Eszc--u7g8xE",
    authDomain: "cloudit3-4722b.firebaseapp.com",
    projectId: "cloudit3-4722b",
    storageBucket: "cloudit3-4722b.firebasestorage.app",
    messagingSenderId: "301313914854",
    appId: "1:301313914854:web:a53151373120b16b260827",
    measurementId: "G-ZWVZM08EBG"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Références aux éléments du DOM
const authStatus = document.getElementById('auth-status');
const loginFormsDiv = document.getElementById('login-forms');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const postingArea = document.getElementById('posting-area');
const messageForm = document.getElementById('message-form');
const messagesList = document.getElementById('messages-list');
const showSignupBtn = document.getElementById('show-signup-btn');
const hideSignupBtn = document.getElementById('hide-signup-btn');

// --- Logique d'affichage des formulaires d'inscription/connexion ---
showSignupBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

hideSignupBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
});


// --- Fonctions d'Authentification ---

// S'inscrire
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Inscription réussie ! Vous êtes connecté.');
    } catch (error) {
        console.error("Erreur d'inscription:", error);
        alert(`Erreur d'inscription: ${error.message}`);
    }
});

// Se connecter
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error("Erreur de connexion:", error);
        alert(`Erreur de connexion: ${error.message}`);
    }
});

// Se déconnecter
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        alert('Déconnexion réussie.');
    } catch (error) {
        console.error("Erreur de déconnexion:", error);
        alert(`Erreur de déconnexion: ${error.message}`);
    }
});

// Gérer les changements d'état d'authentification (Mise à jour de l'UI)
// onAuthStateChanged est le pivot de l'interface utilisateur pour l'Auth.
auth.onAuthStateChanged((user) => {
    if (user) {
        // Utilisateur connecté
        authStatus.innerHTML = `Connecté en tant que: <strong>${user.email}</strong>`;
        loginFormsDiv.style.display = 'none';
        logoutBtn.style.display = 'block';
        postingArea.style.display = 'block'; // Afficher le formulaire de publication
    } else {
        // Utilisateur déconnecté
        authStatus.innerHTML = 'Actuellement déconnecté.';
        loginFormsDiv.style.display = 'block';
        logoutBtn.style.display = 'none';
        postingArea.style.display = 'none'; // Cacher le formulaire de publication
        // S'assurer que seul le formulaire de connexion est visible
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }
});


// =======================================================================
// PARTIE 2 : PUBLICATION (Écriture dans Firestore)
// =======================================================================

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageContent = document.getElementById('message-content').value;
    const user = auth.currentUser;

    if (!user) {
        alert("Vous devez être connecté pour publier un message.");
        return;
    }

    try {
        // Ajout d'un nouveau document dans la collection "messages"
        await db.collection("messages").add({
            content: messageContent,
            userId: user.uid,
            userEmail: user.email,
            // Utilisation du serverTimestamp pour un horodatage fiable
            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
        });

        document.getElementById('message-content').value = ''; // Réinitialiser le champ
        console.log("Message publié avec succès.");

    } catch (error) {
        console.error("Erreur lors de la publication du message:", error);
        alert(`Erreur de publication: ${error.message}`);
    }
});


// =======================================================================
// PARTIE 3 : AFFICHAGE (Lecture en temps réel depuis Firestore)
// =======================================================================

function formatTimestamp(timestamp) {
    // Si le timestamp n'est pas encore défini (en attente du serveur), on affiche un placeholder
    if (!timestamp || !timestamp.toDate) return 'En cours...'; 
    
    const date = timestamp.toDate(); 
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
}

/**
 * Fonction pour écouter les messages en temps réel.
 * Utilisation de onSnapshot pour la mise à jour instantanée.
 */
function subscribeToMessages() {
    // Requête: Collection 'messages', ordonnée par 'timestamp' descendant (plus récent en haut).
    db.collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        // Vider la liste existante
        messagesList.innerHTML = ''; 

        if (snapshot.empty) {
            messagesList.innerHTML = '<p>Aucun message pour l\'instant. Soyez le premier !</p>';
            return;
        }

        // Parcourir les documents et créer les éléments HTML
        snapshot.forEach((doc) => {
            const messageData = doc.data();

            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            
            const content = document.createElement('p');
            content.textContent = messageData.content;
            
            const info = document.createElement('small');
            info.innerHTML = `Publié par <strong>${messageData.userEmail}</strong>` +
                             ` le ${formatTimestamp(messageData.timestamp)}`;
            
            messageItem.appendChild(content);
            messageItem.appendChild(info);
            messagesList.appendChild(messageItem);
        });
    }, (error) => {
        console.error("Erreur lors de la récupération des messages:", error);
        messagesList.innerHTML = '<p>Erreur de chargement des messages.</p>';
    });
}

// Lancer l'écoute des messages au démarrage
subscribeToMessages();