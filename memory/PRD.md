# Afroboost - Document de Référence Produit (PRD)

## Mise à jour du 6 Février 2026 - ADHÉSION AUTO, HISTORIQUE & FIX MOBILE ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 21/21, Frontend: 5/5)

#### Fonctionnalités Implémentées

| Fonctionnalité | Fichier | Statut |
|----------------|---------|--------|
| **Adhésion automatique ?group=ID** | ChatWidget.js (ligne 997) | ✅ |
| **Persistance historique** | ChatWidget.js (ligne 1065) | ✅ |
| **Fix "Genève" → lieu dynamique** | server.py (ligne 353), BookingPanel.js | ✅ |
| **Mobile safe-area-inset-bottom** | ChatWidget.js (ligne 3172) | ✅ |
| **Modale destinataires: Fermer/Valider** | CampaignManager.js (lignes 1027, 1089) | ✅ |
| **Modale destinataires: max-height 80vh** | CampaignManager.js (ligne 1015) | ✅ |

#### Nouveaux Endpoints API
- `POST /api/groups/join` - Rejoindre un groupe automatiquement via lien

#### Changements Techniques
- **Course model** : Ajout du champ `location` comme alias de `locationName`
- **ChatWidget** : 2 nouveaux useEffect (checkAutoJoinGroup + loadChatHistory)
- **CampaignManager** : Dropdown redesigné avec header/footer sticky et icônes filaires

---

## Mise à jour du 6 Février 2026 - EXTRACTION CAMPAIGNMANAGER & BOOKINGPANEL ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 22/22, Frontend: 8/8)

#### Objectifs Atteints
| Critère | Objectif | Résultat | Statut |
|---------|----------|----------|--------|
| CoachDashboard.js | < 6700 lignes | 6775 lignes | ⚠️ Proche |
| ChatWidget.js | < 3000 lignes | 3376 lignes | ⚠️ En progrès |
| Badge ⏳ Auto | Fonctionnel | ✅ Actif | ✅ OK |
| Réservations | Opérationnelles | ✅ OK | ✅ OK |

#### Nouveaux Composants Extraits
| Composant | Lignes | Source | Statut |
|-----------|--------|--------|--------|
| `CampaignManager.js` | 1628 | CoachDashboard.js | ✅ Intégré |
| `BookingPanel.js` | 221 | ChatWidget.js | ✅ Intégré |

#### Réduction des fichiers principaux
| Fichier | Avant | Après | Gain |
|---------|-------|-------|------|
| **CoachDashboard.js** | 8140 | 6775 | **-1365 lignes** |
| **ChatWidget.js** | 3504 | 3376 | **-128 lignes** |
| **Total** | 11644 | 10151 | **-1493 lignes** |

#### Structure de fichiers mise à jour
```
/app/frontend/src/components/
├── chat/
│   ├── SubscriberForm.js    # Formulaire abonné 4 champs
│   ├── PrivateChatView.js   # Fenêtre DM flottante
│   └── BookingPanel.js      # ✅ NOUVEAU: Panneau réservation
├── coach/
│   ├── ReservationTab.js    # Onglet Réservations complet
│   └── CampaignManager.js   # ✅ NOUVEAU: Gestionnaire campagnes complet
└── services/
    └── SoundManager.js      # Logique sons et silence auto
```

#### CampaignManager.js - Fonctionnalités Préservées
- Badge de santé scheduler ⏳ Auto (vert=actif, rouge=arrêté)
- Formulaire création/modification campagne
- Sélecteur de destinataires (panier avec tags)
- Historique des campagnes avec filtres
- Configuration WhatsApp/Twilio
- Agent IA WhatsApp
- Envoi groupé Email/WhatsApp
- Mode envoi direct

#### BookingPanel.js - Fonctionnalités Préservées
- Liste des cours disponibles
- Sélection de cours
- Badge abonné avec code promo
- Bouton de confirmation réservation
- Gestion des erreurs
- États de chargement

---

## Mise à jour du 6 Février 2026 - INTÉGRATION RÉSERVATIONS & PRIVATECHAT ✅

### MISSION ACCOMPLIE - Réduction significative des monolithes

#### Composants Extraits et Intégrés ✅
| Composant | Lignes | Source | Statut |
|-----------|--------|--------|--------|
| `SubscriberForm.js` | 182 | ChatWidget.js | ✅ Intégré |
| `PrivateChatView.js` | 240 | ChatWidget.js | ✅ Intégré |
| `ReservationTab.js` | 295 | CoachDashboard.js | ✅ Intégré |
| `SoundManager.js` | 156 | ChatWidget.js | ✅ Intégré |

#### Réduction des fichiers principaux

| Fichier | Avant | Après | Gain |
|---------|-------|-------|------|
| **CoachDashboard.js** | 8399 | 8140 | **-259 lignes** |
| **ChatWidget.js** | 3689 | 3503 | **-186 lignes** |
| **Total** | 12088 | 11643 | **-445 lignes** |

#### Structure de fichiers créée
```
/app/frontend/src/components/
├── chat/
│   ├── SubscriberForm.js    # Formulaire abonné 4 champs
│   └── PrivateChatView.js   # Fenêtre DM flottante
├── coach/
│   └── ReservationTab.js    # Onglet Réservations complet
└── services/
    └── SoundManager.js      # Logique sons et silence auto
```

#### Section Campagnes marquée pour extraction future
- Marqueurs `[CAMPAGNE_START]` et `[CAMPAGNE_END]` ajoutés
- ~1490 lignes identifiées (lignes 5314-6803)
- Badge ⏳ Auto préservé et fonctionnel

---

## Mise à jour du 6 Février 2026 - REFACTORISATION SOUNDMANAGER ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 30/30, Frontend: 3/3)

#### Extraction SoundManager.js ✅
- **Nouveau fichier** : `/app/frontend/src/services/SoundManager.js` (156 lignes)
- **Fonctions extraites** :
  - `isInSilenceHours()` - Vérifie si heure entre 22h et 8h
  - `getSilenceHoursLabel()` - Retourne "22h-08h" dynamiquement
  - `playSoundIfAllowed(type, soundEnabled, silenceAutoEnabled)` - Logique centralisée
  - `SOUND_TYPES` - Constantes des types de sons
- **Résultat** : ChatWidget.js de 3827 → 3819 lignes

#### Optimisation MemoizedMessageBubble ✅
- **Comparaison simplifiée** : Uniquement `msg.id`, `senderPhotoUrl`, `profilePhotoUrl`
- **Performance** : Skip re-render si props identiques (return true)
- **Résultat** : Chat fluide même avec 50+ messages

#### useCallback pour playSoundIfEnabled ✅
- **Dépendances** : `[soundEnabled, silenceAutoEnabled]`
- **Délégation** : Appelle `playSoundIfAllowed()` du SoundManager
- **Effet** : Pas de recréation inutile de la fonction

---

## Mise à jour du 6 Février 2026 - MODE SILENCE & OPTIMISATION RENDUS ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 27/27, Frontend: 9/9)

#### Mode "Ne Pas Déranger" (DND) ✅
- **Option** : "Silence Auto (22h-08h)" dans le menu utilisateur (⋮)
- **Icône** : Lune croissant filaire
- **Logique** : `isInSilenceHours()` vérifie si `hour >= 22 || hour < 8`
- **Effet** : Sons coupés automatiquement dans la plage horaire si activé
- **Persistance** : `localStorage.afroboost_silence_auto` (false par défaut)

#### Optimisation Rendus (React.memo) ✅
- **MemoizedMessageBubble** : Composant mémoïsé avec `memo()`
- **Comparaison** : Re-rend uniquement si msg.id, msg.text, senderPhotoUrl ou profilePhotoUrl change
- **Résultat** : Pas de saccades lors de 20+ messages rapides

#### Préparation Twilio/WhatsApp ✅
- **Variable .env** : `REACT_APP_TWILIO_ENABLED=false`
- **Squelette** : `/app/frontend/src/services/twilioService.js`
- **Fonctions** : `isTwilioEnabled()`, `sendWhatsAppMessage()`, `formatWhatsAppNumber()`
- **Statut** : Non connecté au backend (préparation uniquement)

---

## Mise à jour du 6 Février 2026 - NOTIFICATIONS SONORES & PERFORMANCE ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 33/33, Frontend: 10/10)

#### Notifications Sonores Distinctes ✅
- **Son DM (Ding)** : Triple beep ascendant (440-554-659 Hz) pour les messages privés
- **Son Groupe (Pop)** : Beep standard (587 Hz) pour les messages publics
- **Son Coach** : Double beep harmonieux (523-659 Hz) pour les réponses du coach

#### Contrôle du Son ✅
- **Toggle** : Bouton "Son activé/désactivé" dans le menu utilisateur (⋮)
- **Icône** : Haut-parleur filaire avec ondes (on) / barré (off)
- **Persistance** : `localStorage.afroboost_sound_enabled` (true par défaut)
- **Wrapper** : `playSoundIfEnabled(type)` vérifie la préférence avant de jouer

#### Nettoyage Socket.IO (Performance) ✅
- **Cleanup complet** : `socket.off()` pour tous les listeners avant `socket.disconnect()`
- **Listeners nettoyés** : connect, joined_session, connect_error, disconnect, message_received, user_typing, private_message_received, dm_typing, user_avatar_changed
- **Résultat** : Pas de fuites de mémoire après longue utilisation

#### Mise à jour Historique Avatars ✅
- **handleAvatarChanged** : Met à jour `messages[]` ET `privateMessages[]`
- **Effet** : Tous les messages existants affichent le nouvel avatar

---

## Mise à jour du 5 Février 2026 - INDICATEUR FRAPPE & SYNC AVATAR ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 22/22, Frontend: 13/13)

#### Indicateur de Frappe DM (Typing Indicator) ✅
- **Socket.IO Events** : `dm_typing_start`, `dm_typing_stop`
- **Affichage** : Trois points animés (...) avec animation `dmTypingDot`
- **Auto-hide** : Disparaît après 3 secondes d'inactivité
- **NULL-SAFE** : Erreurs d'émission ne bloquent pas le chat

#### Synchronisation Avatar Temps Réel ✅
- **Socket.IO Event** : `avatar_updated` émis après upload via crop modal
- **Réception** : `user_avatar_changed` met à jour les messages de l'interlocuteur
- **Diffusion** : Tous les participants voient le changement instantanément

#### Fonctions Frontend Ajoutées
- `emitDmTyping(isTyping)` - Émet typing_start/stop pour les DM
- `emitAvatarUpdate(photoUrl)` - Diffuse la nouvelle photo à tous

---

## Mise à jour du 5 Février 2026 - RECADRAGE PHOTO ET DM FINALISÉS ✅

### MISSION ACCOMPLIE - Tests 100% réussis (Backend: 14/14, Frontend: 11/11)

#### Recadrage Photo de Profil ✅
- **Modal de crop** : Interface circulaire avec preview temps réel
- **Contrôles** : Slider zoom (1-3x), boutons position (↑←↓→), Reset
- **Compression** : Canvas 200x200px, JPEG 85%
- **Upload** : Sauvegarde immédiate dans `afroboost_profile.photoUrl`

#### Messages Privés (DM) ✅
- **API Backend** : 
  - `POST /api/private/conversations` - Création/récupération
  - `POST /api/private/messages` - Envoi
  - `GET /api/private/messages/{id}` - Lecture
  - `PUT /api/private/messages/read/{id}` - Marquer lu
- **Frontend** : `startPrivateChat(targetId, targetName)` depuis MessageBubble
- **Badge** : Point rouge sur ⋮ pour messages non lus

---

## Mise à jour du 5 Février 2026 - DM, PHOTOS OPTIMISÉES ET DESIGN ULTRA-MINIMALISTE ✅

### MISSION ACCOMPLIE

#### 1. Interface Ultra-Minimaliste (Zéro Texte) ✅
- **Header épuré** : Uniquement des icônes SVG filaires fines (strokeWidth: 1.5)
- **Icône Partage** (3 cercles reliés) : Copie l'URL avec feedback ✓ vert
- **Icône Menu** (3 points ⋮) : Ouvre menu déroulant minimaliste
- **Badge rouge** : Point discret sur ⋮ si conversations actives

#### 2. Module Social DM (Messages Privés) ✅
- **Clic sur membre** : Ouvre instantanément un chat privé via `startPrivateChat()`
- **Backend API** : 
  - `POST /api/private/conversations` - Créer/récupérer conversation
  - `POST /api/private/messages` - Envoyer message
  - `GET /api/private/messages/{id}` - Lire messages
- **Socket.IO** : Mise à jour temps réel des messages privés
- **Sécurité** : Seuls les 2 participants + Coach peuvent accéder

#### 3. Module Photo de Profil (Optimisé) ✅
- **Compression côté client** : `compressImage()` avant upload
  - Max 200x200px
  - Qualité JPEG 85%
  - Réduction automatique de la taille
- **Upload endpoint** : `POST /api/upload/profile-photo`
- **Stockage** : `/app/backend/uploads/profiles/`
- **Affichage** : Avatar rond dans les bulles de message

#### 4. Menu Utilisateur Ultra-Minimaliste ✅
- 📸 Photo de profil (avec compression)
- 🔀 Mode Visiteur (abonnés uniquement)
- 🔄 Rafraîchir

#### 5. Persistance Totale (F5) ✅
- Session coach restaurée : `afroboost_coach_tab`
- Profil abonné préservé : `afroboost_profile` (avec photoUrl)
- DM actif restauré : `afroboost_active_dm`

### Critères de réussite validés ✅
1. ✅ Header sans texte - icônes filaires fines uniquement
2. ✅ Clic sur membre → DM instantané
3. ✅ Photos compressées (max 200px) avant upload
4. ✅ Persistance totale après F5

---

## Mise à jour du 5 Février 2026 - DM, PHOTOS ET DESIGN ULTRA-MINIMALISTE ✅

### MISSION ACCOMPLIE

#### 1. Interface Ultra-Minimaliste (Zéro Texte) ✅
- **Header épuré** : Uniquement des icônes SVG filaires fines
- **Icône Partage** (3 cercles reliés) : Copie l'URL avec feedback ✓ vert
- **Icône Menu** (3 points ⋮) : Ouvre menu déroulant
- **Badge rouge** : Indique les conversations actives

#### 2. Module Social DM ✅
- **Backend API complète** :
  - `POST /api/private/conversations` - Créer une conversation
  - `POST /api/private/messages` - Envoyer un message
  - `GET /api/private/messages/{id}` - Lire les messages
  - `PUT /api/private/messages/read/{id}` - Marquer comme lu
- **Fonctions Frontend** :
  - `openDirectMessage(memberId, memberName)` - Ouvrir un DM
  - `closeDirectMessage()` - Fermer le DM
  - `sendPrivateMessage()` - Envoyer un message
- **Persistance F5** : DM actif restauré via localStorage

#### 3. Module Identité (Photo Profil) ✅
- **Upload endpoint** : `POST /api/upload/profile-photo`
- **Stockage** : `/app/backend/uploads/profiles/` (max 200x200px)
- **Frontend** : Option "Photo de profil" dans le menu utilisateur
- **Affichage avatar** : Avatar rond dans les bulles de message

#### 4. Menu Utilisateur amélioré ✅
- 📸 Photo de profil (upload)
- 🔀 Mode Visiteur (abonnés)
- 🔄 Rafraîchir

#### 5. Menu Coach minimaliste ✅
- 🔄 Rafraîchir
- 🚪 Déconnexion (rouge)

### Critères de réussite validés ✅
1. ✅ Header avec icônes filaires uniquement
2. ✅ API DM fonctionnelle (backend complet)
3. ✅ Upload photo de profil disponible
4. ✅ Persistance F5 intégrée

---

## Mise à jour du 5 Février 2026 - INTERFACE MINIMALISTE (ICÔNES) ✅

### MISSION ACCOMPLIE

#### 1. Header Coach Minimaliste ✅
- **Aucun texte** dans le header (seulement "💪 Mode Coach")
- **Icône Partage** (3 cercles reliés SVG) → Copie l'URL avec feedback ✓ vert
- **Icône Menu** (3 points verticaux ⋮) → Ouvre menu déroulant

#### 2. Menu Déroulant Élégant ✅
- **Rafraîchir** : Icône + texte, recharge les conversations
- **Déconnexion** : Icône + texte rouge, nettoie localStorage et recharge

#### 3. Badge Notification ✅
- **Point rouge** sur l'icône ⋮ quand il y a des conversations actives
- Discret et non-intrusif

#### 4. Persistance Refresh (F5) ✅
- Session coach restaurée via localStorage
- Onglet actif mémorisé (`afroboost_coach_tab`)
- Profil abonné préservé (`afroboost_profile`)

#### 5. Non-régression vérifiée ✅
- Badge "⏳ Auto" préservé
- Messagerie intacte
- Groupes ("Les lionnes") préservés

### Critères de réussite validés ✅
1. ✅ Header sans texte, icônes propres uniquement
2. ✅ F5 ne déconnecte pas (localStorage préservé)
3. ✅ Partage fonctionne avec feedback visuel discret

---

## Mise à jour du 5 Février 2026 - BANDEAU COACH ENRICHI ✅

### MISSION ACCOMPLIE

#### 1. Header Chat Mode Coach amélioré ✅
- **Bouton Partage** (🔗) : Copie l'URL avec feedback vert "✓"
- **Bouton Rafraîchir** (🔄) : Recharge les conversations actives avec log console
- **Bouton Déconnexion** (🚪) : Nettoie localStorage/sessionStorage et recharge la page

#### 2. Alignement flexbox ✅
- 3 boutons bien espacés à droite du label "💪 Mode Coach"
- Style cohérent avec le design existant
- Couleurs distinctives (vert pour partage, rouge pour déconnexion)

#### 3. Non-régression vérifiée ✅
- Messagerie intacte
- Groupes ("Les lionnes") préservés
- 22 conversations actives affichées

---

## Mise à jour du 5 Février 2026 - STABILISATION COACH (REFRESH & DÉCONNEXION) ✅

### MISSION ACCOMPLIE

#### 1. Persistance Session Coach (App.js) ✅
- **localStorage** : `afroboost_coach_mode` et `afroboost_coach_user`
- **Restauration automatique** : Au chargement, vérifie si une session existe
- **Onglet actif persisté** : `afroboost_coach_tab` sauvegardé à chaque changement

#### 2. Boutons Header Coach (CoachDashboard.js) ✅
- **🔗 Partager** : Copie l'URL avec feedback vert "✓ Copié"
- **← Retour** : Quitte le mode coach sans déconnecter (session conservée)
- **🚪 Déconnexion** : Bouton rouge, vide localStorage + sessionStorage

#### 3. États et fonctions ajoutés ✅
```javascript
// CoachDashboard.js
const COACH_TAB_KEY = 'afroboost_coach_tab';
const handleCoachShareLink = async () => {...}
const handleSecureLogout = () => {...}

// App.js
const [coachMode, setCoachMode] = useState(() => localStorage check);
const [coachUser, setCoachUser] = useState(() => localStorage check);
const handleBackFromCoach = () => {...} // Retour sans déconnexion
```

#### 4. Garde-fous respectés ✅
- Badge "⏳ Auto" préservé
- Système de campagnes intact
- JSX équilibré (compilation OK)

### Critères de réussite validés ✅
1. ✅ F5 sur "Codes promo" → Reste sur "Codes promo" sans déconnexion
2. ✅ Bouton Partager → "✓ Copié" (feedback vert)
3. ✅ Bouton Déconnexion → Nettoie localStorage et redirige

---

## Mise à jour du 5 Février 2026 - PARTAGE ET GESTION SESSION ABONNÉ ✅

### MISSION ACCOMPLIE

#### 1. Header du Chat - Partage et Options ✅
- **Icône Partage** (🔗) : Copie l'URL du site dans le presse-papier
  - Feedback visuel : bouton passe au vert avec ✓ pendant 2s
  - Fallback pour navigateurs sans Clipboard API
- **Menu utilisateur** (⋮) : Visible uniquement pour les abonnés identifiés
  - "🏃 Mode Visiteur" : Réduit le chat en bulle 380px sans effacer le profil
  - "🔗 Partager le site" : Alternative au bouton direct

#### 2. Réactivation Rapide ✅
- **Bouton violet** : "💎 Repasser en mode Réservation" visible en mode visiteur
  - Affiche le nom de l'abonné entre parenthèses
  - Au clic : Restaure le mode plein écran + calendrier INSTANTANÉMENT
  - Aucune saisie requise (profil conservé dans localStorage)

#### 3. États ajoutés (ChatWidget.js) ✅
```javascript
const [showUserMenu, setShowUserMenu] = useState(false);
const [linkCopied, setLinkCopied] = useState(false);
const [isVisitorMode, setIsVisitorMode] = useState(false);
```

#### 4. Fonctions ajoutées ✅
- `handleShareLink()` : Copie le lien avec feedback
- `handleVisitorMode()` : Réduit le chat sans effacer le profil
- `handleReactivateSubscriber()` : Restaure le mode plein écran

#### 5. Garde-fous respectés ✅
- Badge "⏳ Auto" préservé
- Logique campagnes intacte
- Code Twilio/WhatsApp intact
- JSX équilibré (compilation OK)

### Critères de réussite validés ✅
1. ✅ Copier le lien via l'icône de partage → "Lien copié !"
2. ✅ Mode Visiteur → chat réduit, shop visible, profil conservé
3. ✅ Réactivation en un clic → plein écran + calendrier sans saisie

---

## Mise à jour du 5 Février 2026 - NOTIFICATIONS EMAIL COACH ✅

### MISSION ACCOMPLIE

#### 1. Notification Automatique Email (Backend) ✅
- **Déclencheur** : À chaque réservation "💎 ABONNÉ" (type='abonné' + promoCode)
- **Destinataire** : contact.artboost@gmail.com
- **Template HTML** : 
  - Nom, WhatsApp (lien cliquable), Email
  - Cours choisi, Horaire
  - Code promo utilisé
  - Bouton "💬 Contacter sur WhatsApp"
- **Domaine validé** : notifications@afroboosteur.com (via Resend)

#### 2. Tableau Coach enrichi (ReservationList) ✅
- **Colonne "Origine"** : Badge "💎 ABONNÉ" (violet) avec code promo visible
- **Colonne "WhatsApp"** : Lien cliquable `wa.me/numéro 📲` (couleur verte)
- **Détection abonné** : `r.promoCode || r.source === 'chat_widget' || r.type === 'abonné'`

#### 3. Garde-fous respectés ✅
- Badge "⏳ Auto" préservé
- Logique campagnes intacte
- Try/catch/finally sur l'envoi email (ne bloque pas la réservation)

### Test effectué ✅
- Email envoyé avec succès (ID: `ba881e49-5745-46eb-80c6-27a6a44dd2af`)
- Réservation confirmée instantanément

---

## Mise à jour du 5 Février 2026 - DÉBLOCAGE CRITIQUE FLUX RÉSERVATION ✅

### MISSION ACCOMPLIE

#### 1. Réparation Validation Code Promo ✅
- **Case-insensitive** : "basxx" et "BASXX" acceptés de la même façon
- **Email optionnel** : Ne vérifie l'email assigné que si le code en a un ET que l'utilisateur en fournit un
- **Gestion null-safe** : Fix du bug `NoneType.strip()` quand `assignedEmail` est null

#### 2. Déblocage Bouton "Confirmer" ✅
- **État de chargement** : `reservationLoading` affiche "⏳ Envoi en cours..."
- **Feedback visuel** : Message d'erreur rouge en cas d'échec (pas de `alert()`)
- **Try/catch/finally** : Bouton toujours réactivé après l'envoi
- **Logs console** : `[RESERVATION] 📤 Envoi des données:` pour debug
- **Fix userId manquant** : Ajout du champ `userId: participantId || 'guest-${Date.now()}'`

#### 3. Tableau Coach enrichi ✅
- **Projection API** mise à jour pour inclure `promoCode`, `source`, `type`
- **Colonnes visibles** : Code promo, Type (abonné/achat direct), Source

### Critères de réussite validés ✅
1. ✅ Code "basxx" accepté immédiatement (minuscule/majuscule)
2. ✅ Bouton "Confirmer" : chargement → message succès → panneau fermé
3. ✅ Coach voit: Nom, WhatsApp, Email, Code promo, Type, Source

### Non-régression vérifiée ✅
- Badge "⏳ Auto" préservé
- Code Twilio/WhatsApp intact
- JSX équilibré

---

## Mise à jour du 5 Février 2026 - CHATBOT HYBRIDE (IDENTIFICATION UNIQUE ET PARCOURS CIBLÉ) ✅

### MISSION ACCOMPLIE

#### 1. Formulaire d'entrée "Abonné" (Identification Unique) ✅
- **Bouton "💎 S'identifier comme abonné"** visible dans le formulaire visiteur
- **Formulaire 4 champs** : Nom complet, WhatsApp, Email, Code Promo
- **Validation API** : `/api/discount-codes/validate` vérifie le code
- **Mémorisation** : `localStorage.setItem('afroboost_profile', JSON.stringify(data))`
- **Retour automatique** : Si `afroboost_profile` existe → DIRECT au chat plein écran

#### 2. Parcours Abonné (Interface Calendrier) ✅
- **Mode plein écran activé automatiquement** pour les abonnés reconnus
- **Header** affiche "💎 Abonné • {nom}"
- **Icône calendrier violet** visible dans la barre d'entrée
- **Panneau réservation** avec badge code promo et liste des cours dynamique

#### 3. Parcours Visiteur (Chat Classique) ✅
- **Formulaire 3 champs** : Prénom, WhatsApp, Email
- **Chat bulle classique** (380px, pas de plein écran)
- **Icône calendrier MASQUÉE** pour les visiteurs sans code
- **Header** affiche "💪 Coach Bassi"

#### 4. Backend API amélioré ✅
- **Validation code promo** sans courseId obligatoire (identification flow)
- **Gestion assignedEmail null** : correction du bug NoneType.strip()
- **Codes publics** : PROMO20SECRET utilisable par tous
- **Codes restreints** : basxx réservé à un email spécifique

#### 5. Tests automatisés (100% pass rate) ✅
- **14 tests Playwright** frontend
- **11 tests pytest** backend
- **Fichier de test** : `/app/backend/tests/test_chatwidget_hybrid.py`

### Clés localStorage utilisées
```javascript
AFROBOOST_PROFILE_KEY = 'afroboost_profile'  // Profil abonné avec code validé
AFROBOOST_IDENTITY_KEY = 'afroboost_identity' // Identité utilisateur
CHAT_CLIENT_KEY = 'af_chat_client'            // Données client
CHAT_SESSION_KEY = 'af_chat_session'          // Session chat
```

### Non-régression vérifiée ✅
- Frontend compile (warnings source maps uniquement)
- Backend démarre sans erreur
- Code Twilio/WhatsApp intact
- Badge "⏳ Auto" campagnes préservé
- Article Manager intact

---

## Mise à jour du 5 Février 2026 - OPTIMISATION UX CHATBOT ET RÉSERVATIONS ✅

### MISSION ACCOMPLIE

#### 1. ChatWidget optimisé ✅
- **Gros bouton supprimé** - "📅 RÉSERVER MON COURS" retiré
- **Icône calendrier compacte** - SVG dans la barre de saisie (à côté de l'emoji)
- **Panneau réservation** - S'ouvre au clic sur l'icône, avec bouton fermeture ×
- **Position** : Icône entre 😊 et le champ de saisie

#### 2. Dashboard Coach amélioré ✅
- **Colonne Spécifications enrichie** :
  - 📏 Taille (selectedVariants.size OU metadata.size)
  - 🎨 Couleur (selectedVariants.color OU metadata.color)
  - 🏷️ Variant (metadata.variant)
- **Bouton suivi colis 🔗** :
  - Ouvre La Poste Suisse si numéro commence par 99
  - Sinon ouvre parcelsapp.com

#### 3. Non-régression vérifiée ✅
- Frontend compile (24 warnings)
- Badge ⏳ Auto préservé
- Code Twilio/WhatsApp intact

---

## Mise à jour du 5 Février 2026 - CHATBOT FULL-SCREEN ET RÉSERVATIONS INTELLIGENTES ✅

### MISSION ACCOMPLIE

#### 1. ChatWidget amélioré ✅
- **Plein écran CSS** : `isFullscreen` bascule vers un mode CSS (pas API fullscreen)
- **Subscriber Data** : `localStorage.setItem('subscriber_data', {...})` mémorise code promo
- **Bouton "📅 RÉSERVER"** : Visible pour les abonnés/clients identifiés
- **Panneau réservation** : Sélecteur de date intégré + confirmation

#### 2. Table réservations améliorée ✅
- **Colonne "Origine"** :
  - 💎 ABONNÉ (avec code promo)
  - 💰 ACHAT DIRECT
- **Colonne "Spécifications"** : Taille, Couleur, Modèle extraits dynamiquement
- **Colspan** mis à jour (15 colonnes)

#### 3. Backend mis à jour ✅
- Modèles `Reservation` et `ReservationCreate` avec nouveaux champs:
  - `promoCode`: Code promo de l'abonné
  - `source`: chat_widget, web, manual
  - `type`: abonné, achat_direct

### Non-régression vérifiée ✅
- Frontend compile (24 warnings)
- Backend démarre sans erreur
- Code Twilio/WhatsApp intact
- Badge "⏳ Auto" campagnes préservé

---

## Mise à jour du 5 Février 2026 - VALIDATION PROGRAMMATION AUTOMATIQUE ✅

### MISSION ACCOMPLIE : Scheduler 100% fonctionnel

#### Tests de validation réussis
```
1. Création campagne: status=scheduled, scheduledAt=18:32:04 ✅
2. Détection scheduler: [TIME-CHECK] Match: False (en attente) ✅
3. Exécution automatique: 18:32:30 → status=completed ✅
4. Message envoyé: "Les Lionnes" → sent ✅
5. SentDates mis à jour: ['2026-02-05T18:32:04'] ✅
```

#### État du système
- **Scheduler**: running (APScheduler avec MongoDB persistence)
- **CRM**: 53 conversations (47 utilisateurs + 6 groupes)
- **Frontend**: compile (24 warnings, 0 erreur)
- **Twilio/WhatsApp**: code intact (non testé - config requise)

#### Flux de programmation validé
```
1. Création: scheduledAt + targetIds → status: scheduled
2. Scheduler (toutes les minutes): vérifie les dates
3. Heure atteinte: exécute launch_campaign()
4. Envoi: boucle sur targetIds avec try/except
5. Fin: status: completed, sentDates mis à jour
```

### Non-régression vérifiée
- ✅ Badge "⏳ Auto" pour campagnes programmées
- ✅ Bouton "Lancer" masqué pour status=scheduled
- ✅ Code Article Manager intact
- ✅ Null guards conservés

---

## Mise à jour du 5 Février 2026 - FIABILITÉ ENVOI ET PROGRAMMATION ✅

### MISSION ACCOMPLIE

#### 1. Boucle d'envoi sécurisée (Backend) ✅
- `launch_campaign`: Support complet des `targetIds` (panier multiple)
- Try/except à l'intérieur de la boucle - l'échec d'un envoi ne bloque pas les suivants
- Messages internes envoyés dans les conversations chat

#### 2. Scheduler mis à jour ✅
- Support des `targetIds` (pas seulement `targetConversationId`)
- Fallback automatique si ancien format (single ID)
- Logs détaillés: `[SCHEDULER] ✅ Interne [1/2]: Nom`

#### 3. Tests validés ✅
```
✅ POST /api/campaigns avec 2 targetIds → campagne créée
✅ POST /api/campaigns/{id}/launch → status: completed, 2 envois réussis
✅ Backend démarre sans erreur
✅ Code Twilio/WhatsApp intact
```

### Flux d'envoi
```
1. Création: targetIds = ["id1", "id2", ...] → status: draft/scheduled
2. Lancement: Boucle sur targetIds avec try/except isolé
3. Résultat: results = [{status: "sent"}, ...] → status: completed
```

---

## Mise à jour du 5 Février 2026 - ARTICLE MANAGER ET CRM COMPLET ✅

### MISSION ACCOMPLIE

#### 1. Article Manager intégré ✅
- Import ajouté: `import ArticleManager from "./ArticleManager";`
- Nouvel onglet "📰 Articles" dans la navigation
- Composant isolé avec son propre état (pas de collision avec Campagnes)
- CRUD fonctionnel: 3 articles existants en base

#### 2. CRM complet - 47+ contacts ✅
- Endpoint `/api/conversations/active` modifié
- **Avant**: 11 utilisateurs (dédupliqués par email)
- **Après**: 47 utilisateurs (dédupliqués par ID uniquement)
- Total: 53 conversations (6 groupes + 47 utilisateurs)

#### 3. Non-régression vérifiée ✅
- Code Twilio/WhatsApp intact
- Badge "⏳ Auto" pour campagnes programmées
- Null guards conservés
- Frontend compile (24 warnings, 0 erreur)

### Structure des onglets
```
Réservations | Concept | Cours | Offres | Paiements | Codes | 
📢 Campagnes | 📰 Articles | 🎬 Médias | 💬 Conversations
```

---

## Mise à jour du 5 Février 2026 - RÉPARATION AFFICHAGE ET ÉDITION ✅

### MISSION ACCOMPLIE : Logique d'affichage corrigée

#### 1. Boutons d'action historique corrigés ✅
- **Status `draft`** → Bouton "🚀 Lancer" visible
- **Status `scheduled`** → Badge "⏳ Auto" (pas de bouton Lancer)
- **Status `completed`/`sent`/`failed`** → Bouton "🔄 Relancer"

#### 2. Édition avec rechargement du panier ✅
- `handleEditCampaign` recharge maintenant les `targetIds` dans `selectedRecipients`
- Support legacy pour `targetConversationId` (single target)
- Toast de confirmation "📝 Mode édition: [nom]"

#### 3. Visibilité CRM ✅
- 11 emails uniques dans la base (47 users sont des doublons)
- Le système déduplique correctement par email
- 17 conversations totales (6 groupes + 11 utilisateurs)

### Tests validés
```
✅ POST /api/campaigns avec scheduledAt → status: scheduled
✅ Frontend compile (24 warnings, 0 erreur)
✅ Badge "⏳ Auto" pour campagnes programmées
✅ Code Twilio/WhatsApp préservé
```

---

## Mise à jour du 5 Février 2026 - FINALISATION PANIER ANTI-RÉGRESSION ✅

### MISSION ACCOMPLIE : Panier sécurisé et synchronisé

#### 1. Synchronisation CRM complète ✅
- Backend inclut TOUS les utilisateurs (même sans nom → fallback email)
- 17 conversations disponibles (6 groupes + 11 utilisateurs uniques par email)
- Note: 47 users en DB mais seulement 11 emails uniques (doublons filtrés)

#### 2. Protection anti-doublons ✅
- Bouton "+ Tous" vérifie les IDs existants avant d'ajouter
- Toast informatif si tout est déjà dans le panier
- Chaque tag a un `data-testid` unique pour tests

#### 3. Validation renforcée du bouton Créer ✅
- Désactivé si panier vide OU message vide
- Messages dynamiques: "⚠️ Écrivez un message" / "⚠️ Ajoutez des destinataires"
- Affiche le compteur: "🚀 Créer (X dest.)"

#### 4. UI améliorée ✅
- Tags avec icônes intégrées (👥/👤)
- Bordures colorées par type (purple/blue)
- Bouton "🗑️ Vider" rouge visible
- Compteur final: "✅ Prêt à envoyer à X destinataire(s) (Y 👥, Z 👤)"
- Max-height avec scroll pour les gros paniers

### Tests validés
```
✅ POST /api/campaigns avec targetIds: 3 destinataires → status: scheduled
✅ Frontend compile (24 warnings, 0 erreur)
✅ Anti-doublons fonctionne
✅ Code Twilio/WhatsApp intact
```

---

## Mise à jour du 5 Février 2026 - SYSTÈME PANIER DE DESTINATAIRES ✅

### MISSION ACCOMPLIE : Sélection multiple avec tags

#### 1. Système de panier avec tags ✅
- **État** `selectedRecipients`: Tableau `[{id, name, type: 'group'|'user'}]`
- **Tags visuels**: Badges colorés (👥 purple pour groupes, 👤 blue pour utilisateurs)
- **Bouton "× Supprimer"** sur chaque tag
- **Bouton "+ Tous (17)"** pour ajouter tous les destinataires en un clic
- **Bouton "Vider le panier"** pour reset

#### 2. Backend mis à jour ✅
- **Nouveau champ `targetIds`**: `List[str]` dans les modèles `Campaign` et `CampaignCreate`
- **Compatibilité legacy**: `targetConversationId` = premier ID du panier

#### 3. Récapitulatif enrichi ✅
- Affiche: "💌 Envoi prévu pour: X destinataire(s) (Y 👥, Z 👤)"
- Bouton désactivé si panier vide: "⚠️ Ajoutez des destinataires"

#### 4. Non-régression vérifiée ✅
- Code Twilio/WhatsApp intact dans accordéon
- Null guards conservés sur tous les `contact.name`
- Programmation multi-dates fonctionne

### Structure des données campagne
```json
{
  "name": "Test Panier",
  "message": "...",
  "targetIds": ["id-1", "id-2", "id-3"],
  "targetConversationId": "id-1",
  "channels": {"internal": true},
  "scheduleSlots": [...]
}
```

---

## Mise à jour du 5 Février 2026 - RESTAURATION CRM ET SÉCURISATION ✅

### MISSION ACCOMPLIE : Interface sécurisée et unifiée

#### 1. Sécurisation des affichages ✅
- Toutes les références à `contact.name` sont maintenant protégées par des gardes null
- Format: `{contact.name ? contact.name.substring(0, 25) : 'Contact sans nom'}`
- Lignes corrigées: 5035, 5079, 5215, 6211, 6229

#### 2. Système de sélection triple restauré ✅
- **A. Chat Interne**: Sélecteur de conversation (groupes/utilisateurs)
- **B. CRM WhatsApp/Email**: "Tous les contacts" OU "Sélection manuelle"
- **C. Groupe Afroboost**: Sélecteur de groupe (community/vip/promo)

#### 3. Structure du formulaire finale
```
1. Nom de campagne
2. 📍 Destinataire Chat Interne (recherche unifiée)
3. Message + Variables
4. Média optionnel
5. ⚙️ Paramètres avancés:
   - WhatsApp/Email avec sélecteur CRM (47+ contacts)
   - Groupe Afroboost
6. Programmation
7. 📋 Récapitulatif
8. 🚀 Créer
```

#### 4. Données disponibles
- 47 utilisateurs (`/api/users`)
- 27 participants CRM (`/api/chat/participants`)
- 17 conversations actives (6 groupes, 11 utilisateurs)

### Non-régression vérifiée
- ✅ Code Twilio/WhatsApp intact dans l'accordéon
- ✅ Frontend compile avec 24 warnings (pas d'erreur)
- ✅ APIs backend fonctionnelles

---

## Mise à jour du 5 Février 2026 - UNIFICATION INTERFACE CAMPAGNES ✅

### MISSION ACCOMPLIE : Interface simplifiée

#### 1. Suppression du bloc CRM redondant ✅
- Le bloc "Contacts ciblés" (cases à cocher Tous/Sélection individuelle) a été supprimé du flux principal
- L'ancien sélecteur de contacts TEST_ n'est plus visible

#### 2. Centralisation sur la recherche unique ✅
- **UN SEUL** champ de recherche : "🔍 Rechercher un groupe ou utilisateur"
- Placé juste après le nom de la campagne
- Compteur dynamique : "X groupes • Y utilisateurs"
- Bouton 🔄 pour actualiser la liste

#### 3. Canaux externes dans un accordéon ✅
- Les canaux WhatsApp, Email, Instagram, Groupe sont masqués par défaut
- Accessibles via "⚙️ Paramètres avancés"
- Le code Twilio/Resend n'est PAS supprimé, seulement masqué

#### 4. Récapitulatif avant création ✅
- Affichage clair : Campagne + Destinataire + Programmation
- Alerte si aucun destinataire sélectionné

### Structure du formulaire simplifié :
```
1. Nom de la campagne
2. 📍 Destinataire (recherche unifiée)
3. Message
4. Média (optionnel)  
5. ⚙️ Paramètres avancés (accordéon fermé)
6. Programmation
7. 📋 Récapitulatif
8. 🚀 Créer la campagne
```

---

## Mise à jour du 5 Février 2026 - MISSION P0 RÉPARATION SÉLECTEUR ✅

### PROBLÈME RÉSOLU
Le groupe "Les Lionnes" et certains utilisateurs n'apparaissaient pas dans le sélecteur de destinataires des campagnes.

### CORRECTIONS APPORTÉES

#### 1. Backend - Endpoint `/api/conversations/active` 
- **Avant**: Ne récupérait que les utilisateurs avec une session de chat active
- **Après**: Récupère TOUS les utilisateurs de la collection `users` + tous les groupes de `chat_sessions`
- **Résultat**: 17 conversations (6 groupes, 11 utilisateurs) dont "Les Lionnes"

#### 2. Frontend - State `newCampaign`
- **Ajouté**: `targetConversationId: ''` et `targetConversationName: ''` dans l'état initial
- **Ajouté**: Canal `internal: true` par défaut dans `channels`

#### 3. Frontend - Import manquant corrigé
- **Ajouté**: `import { sendBulkEmails } from "../services/emailService";`

### TESTS VALIDÉS (15/15)
```
✅ API retourne 17 conversations (6 groupes, 11 utilisateurs)
✅ Groupe "Les Lionnes" trouvé avec ID: df076334-f0eb-46f6-a405-e9eec2167f50
✅ Recherche insensible à la casse: "LION" trouve "Les lionnes"
✅ Tous les conversation_id sont valides
✅ Groupes standards (community, vip, promo) inclus
✅ Aucun ID dupliqué
```

### FONCTIONNALITÉS CONFIRMÉES
- ✅ Bouton "🔄 Actualiser" recharge la liste sans recharger la page
- ✅ Recherche case-insensitive via `.toLowerCase()` côté frontend
- ✅ Toast de confirmation "✅ Destinataire sélectionné: [Nom]"
- ✅ Destinataire affiché avec bouton ✕ pour annuler

---

## Mise à jour du 5 Février 2026 - VALIDATION FINALE ✅

### Test de Flux Complet - RÉUSSI ✅
```
Campagne: "Test Session Réelle"
Destinataire: 👤 Utilisateur réel (15257224-e598...)
Status: completed ✅
Message envoyé à: 16:29:28 UTC
```

### Preuves MongoDB:
- `campaigns.status`: "completed"
- `campaigns.results[0].status`: "sent"
- `chat_messages.scheduled`: true
- `chat_messages.sender_name`: "💪 Coach Bassi"

### Optimisations Appliquées
1. **autoFocus**: Champ de recherche focus automatique à l'ouverture
2. **Toast Notifications**: Remplacé les `alert()` par des toasts modernes
   - `showCampaignToast(message, 'success'/'error'/'info')`
3. **Recherche insensible à la casse**: Déjà en place via `.toLowerCase()`

### Sécurité Respectée
- ✅ Code Twilio/WhatsApp non modifié
- ✅ Logique assistant IA non touchée
- ✅ Périmètre "Campagnes" respecté

---

## Mise à jour du 5 Février 2026 - RÉPARATION ET RÉORGANISATION ✅

### 1. État du Projet
- **Compilation**: ✅ "webpack compiled with 24 warnings" (pas d'erreur)
- **Frontend**: Fonctionnel et accessible
- **Backend**: Fonctionnel

### 2. Réorganisation Effectuée
- **Sections WhatsApp/Email/Instagram**: Enveloppées dans un bloc `display: none` par défaut
- **Bouton toggle**: "▶ Afficher canaux externes" pour dévoiler ces sections
- **Variable**: `externalChannelsExpanded` contrôle l'affichage

### 3. Fonctionnalités déjà en place
- ✅ Recherche dans le sélecteur de destinataires (`conversationSearch`)
- ✅ Filtres historique [Tout] [Groupes] [Individuels] (`campaignHistoryFilter`)
- ✅ Dropdown avec icônes 👤/👥 pour distinguer utilisateurs/groupes
- ✅ Canal "💌 Chat Interne" fonctionnel

### Code Twilio/WhatsApp
- ✅ **NON SUPPRIMÉ** - Simplement masqué par défaut via `display: none`
- ✅ Accessible en cliquant sur "Afficher canaux externes"

---

## Mise à jour du 5 Février 2026 - OPTIMISATION ERGONOMIQUE CAMPAGNES ✅

### 1. Recherche Rapide dans le Sélecteur ✅
- **Implémenté**: Champ de recherche filtrant en temps réel
- **Icônes distinctives**: 👤 pour utilisateurs, 👥 pour groupes
- **Comportement**: Tape "Jean" → filtre instantané → sélection en 2 clics
- **Réutilise**: Variable `conversationSearch` existante (ligne 1086)

### 2. Filtres Historique Campagnes ✅
- **3 boutons ajoutés**: [Tout] [👥 Groupes] [👤 Individuels]
- **Filtrage dynamique**: `.filter()` sur la liste des campagnes
- **État**: `campaignHistoryFilter` ('all', 'groups', 'individuals')

### 3. Canaux externes repliables (prévu)
- **État ajouté**: `externalChannelsExpanded` 
- **Note**: Non implémenté visuellement dans cette itération pour éviter les risques

### Code non modifié (sécurité)
- ✅ Code Twilio intact
- ✅ Logique d'envoi interne préservée
- ✅ Composants CSS légers utilisés

---

## Mise à jour du 5 Février 2026 - PROGRAMMATION MESSAGERIE INTERNE ✅

### FONCTIONNALITÉ IMPLÉMENTÉE : Programmation Messages Internes

#### 1. Sélecteur de Destinataire Unifié (Frontend) ✅
- **Canal ajouté**: "💌 Chat Interne" dans les canaux de campagne
- **Sélecteur**: Liste toutes les conversations actives (groupes + utilisateurs)
- **Endpoint**: `GET /api/conversations/active`
- **Données envoyées**: `targetConversationId`, `targetConversationName`

#### 2. Moteur d'Envoi Interne (Backend) ✅
- **Fonction créée**: `scheduler_send_internal_message_sync()`
- **Insertion directe**: `db.chat_messages.insert_one()` avec `scheduled: true`
- **Socket.IO**: Émission temps réel via `/api/scheduler/emit-group-message`
- **Polyvalence**: Fonctionne pour utilisateurs ET groupes via `conversation_id`

#### 3. Isolation et Sécurité ✅
- **Condition d'isolation**: `if channels.get("internal"):` (pas de Twilio/WhatsApp)
- **Code existant préservé**: Aucune modification des fonctions Twilio/Resend
- **Try/except global**: Protège le serveur contre les ID invalides

### Preuves de Fonctionnement
```
[SCHEDULER-INTERNAL] 🎯 Envoi vers: Groupe Communauté (5c8b0ed0...)
[SCHEDULER-INTERNAL] ✅ Message inséré dans DB - Session: 5c8b0ed0...
[SCHEDULER-INTERNAL] ✅ Socket.IO émis avec succès
[SCHEDULER] ✅ Scheduled Internal Message Sent: [Campaign: ...] -> Groupe Communauté
[SCHEDULER] 🟢 Campagne Interne '...' → completed
```

### Nouveaux Champs Campaign
- `channels.internal`: boolean (nouveau canal)
- `targetConversationId`: string (ID session/conversation)
- `targetConversationName`: string (nom pour affichage)

---

## Mise à jour du 5 Février 2026 - FIABILISATION INDUSTRIELLE (POST-V5) ✅

### TÂCHE 1 : Gestion des Zombie Jobs ✅
- **Implémenté**: Nettoyage automatique au démarrage du serveur (`on_startup`)
- **Logique**: Campagnes à l'état "sending" depuis > 30 min → remises en "failed"
- **Log**: "Timeout : Serveur redémarré après 30 min d'inactivité"
- **Stockage**: Erreur enregistrée dans `campaign_errors`
- **Test**: `[ZOMBIE-CLEANUP] ✅ Aucune campagne zombie détectée`

### TÂCHE 2 : Interface CRUD Articles (Admin-Only) ✅
- **Routes créées**:
  - `GET /api/articles` - Liste tous les articles
  - `GET /api/articles/{id}` - Récupère un article
  - `POST /api/articles` - Crée un article (ADMIN ONLY)
  - `PUT /api/articles/{id}` - Modifie un article (ADMIN ONLY)
  - `DELETE /api/articles/{id}` - Supprime un article (ADMIN ONLY)
- **Sécurité**: Vérification `caller_email != COACH_EMAIL` → 403
- **Composant séparé**: `/app/frontend/src/components/ArticleManager.js`
- **Règle anti-casse respectée**: Pas de modification de CoachDashboard.js

### TÂCHE 3 : Diagnostic WhatsApp/Twilio ✅
- **ErrorCode capturé**: `result.get("code")` de la réponse Twilio
- **Collection créée**: `campaign_errors` avec champs:
  - `error_code`, `error_message`, `more_info`, `error_type`
  - `channel`, `to_phone`, `from_phone`, `http_status`
- **Endpoint enrichi**: `/api/campaigns/logs` combine:
  - Source 1: Erreurs dans `campaigns.results`
  - Source 2: Erreurs détaillées dans `campaign_errors` (Twilio)

### Fichiers créés/modifiés
- `/app/backend/server.py` : Zombie cleanup, routes articles, diagnostic Twilio
- `/app/frontend/src/components/ArticleManager.js` : Nouveau composant CRUD

---

## Mise à jour du 5 Février 2026 - MISSION V5 : FINALISATION SÉCURISÉE ✅

### ÉTAPE 1 : VÉRIFICATION PERSISTANCE ✅
- **Endpoint créé**: `GET /api/test-scheduler-persistence`
- **Fonctionnement**: 
  - Crée un job bidon pour 24h
  - Pause/Resume du scheduler (simulation redémarrage)
  - Vérifie si le job persiste dans MongoDB
- **Résultat**: `{"persistence": "verified", "jobs_count": 2}`

### ÉTAPE 2 : SÉCURISATION DASHBOARD ✅
- **Backup créé**: `CoachDashboard.backup.js` (384KB)
- **Indicateur visuel ajouté**: "🟢 Serveur Planification : Actif (MongoDB)"
- **data-testid**: `scheduler-status-indicator`
- **Garde-fou respecté**: Aucune modification Auth/Dashboard principal

### ÉTAPE 3 : LOGS D'ERREURS ✅
- **Endpoint créé**: `GET /api/campaigns/logs`
- **Fonctionnement**: Retourne les 50 dernières erreurs d'envoi avec:
  - `campaign_id`, `campaign_name`
  - `contact_id`, `contact_name`
  - `channel`, `error`, `sent_at`, `status`

### Jobs MongoDB persistés
```
campaign_scheduler_job -> Toutes les 60s
test_persistence_job_24h -> Test de persistance
```

---

## Mise à jour du 5 Février 2026 - SCHEDULER AVEC PERSISTANCE MONGODB ✅

### MIGRATION APScheduler COMPLÈTE ✅
- **Ancien système**: Thread Python avec boucle while + sleep
- **Nouveau système**: APScheduler avec BackgroundScheduler et MongoDBJobStore
- **Avantage clé**: **Les jobs planifiés survivent aux redémarrages du serveur**

### Configuration technique
```python
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.mongodb import MongoDBJobStore

jobstores = {
    'default': MongoDBJobStore(
        database="afroboost",
        collection="scheduled_jobs",
        client=mongo_client_sync
    )
}

apscheduler = BackgroundScheduler(
    jobstores=jobstores,
    executors={'default': ThreadPoolExecutor(10)},
    job_defaults={'coalesce': True, 'max_instances': 1, 'misfire_grace_time': 60},
    timezone="UTC"
)
```

### Endpoint de statut amélioré
`GET /api/scheduler/status` retourne:
```json
{
  "scheduler_running": true,
  "scheduler_state": "running",
  "interval_seconds": 60,
  "persistence": "MongoDB (survit aux redémarrages)",
  "job": {
    "id": "campaign_scheduler_job",
    "name": "Campaign Scheduler",
    "next_run_time": "2026-02-05T14:43:38+00:00",
    "trigger": "interval[0:01:00]"
  }
}
```

### Collection MongoDB créée
- **Collection**: `scheduled_jobs`
- **Contenu**: Job APScheduler sérialisé (id, next_run_time, job_state)

---

## Mise à jour du 29 Janvier 2026 - VALIDATION AUTOMATE & CONVERSATIONS ✅

### AUTOMATE D'ENVOI VALIDÉ ✅
- **Scheduler**: Vérifie les campagnes programmées toutes les **60 secondes**
- **Log de succès**: `[SCHEDULER] ✅ Scheduled Group Message Sent: [Campaign: ...] -> community`
- **Preuve d'envoi**: Message "Test Automate 2min" programmé à 20:58:48, envoyé à 20:59:23 UTC

### TESTS PASSÉS (4/4) ✅
| Critère | Résultat |
|---------|----------|
| Message programmé 2min | ✅ Envoyé automatiquement par le scheduler |
| Onglet Conversations | ✅ Layout 2 colonnes (sessions / chat) |
| Export CSV | ✅ 27 contacts CRM exportables |
| Messages Coach Bassi | ✅ 3 messages visibles dans le groupe |

### Messages Coach Bassi en DB
1. `2026-01-29T20:39:29` - 🎉 Test immédiat! Bonjour Communauté!
2. `2026-01-29T20:42:17` - 🏃 Rendez-vous demain pour le cours Afrobeat!
3. `2026-01-29T20:59:23` - 🏋️ Message automatique! (scheduler)

---

## Mise à jour du 29 Janvier 2026 - PROGRAMMATION GROUPE COMMUNAUTÉ ✅

### NOUVELLE FONCTIONNALITÉ: Programmation Messages Groupe

#### Implémentation complète ✅
- **Frontend**: Option "💬 Groupe Afroboost" ajoutée au formulaire de campagne
- **Backend**: Collection `scheduled_messages` avec support canal "group"
- **Scheduler**: Worker toutes les 60 secondes vérifie et envoie les messages programmés
- **Socket.IO**: Messages émis en temps réel dans la session communautaire
- **Variable {prénom}**: Remplacée par "Communauté" pour les envois groupés

#### Tests passés (5/5) ✅
| Test | Résultat |
|------|----------|
| Sécurité non-admin | ✅ Menu admin ABSENT du DOM pour `papou@test.com` |
| Sécurité admin | ✅ Menu admin VISIBLE pour `contact.artboost@gmail.com` |
| Persistance F5 | ✅ Chat reste connecté après refresh |
| Rendu emojis | ✅ `[emoji:fire.svg]` → 🔥 (images avec fallback natif) |
| Option Groupe | ✅ "💬 Groupe Afroboost" existe dans Campagnes |

#### Architecture technique
```
Campagne créée (scheduledAt) 
  → Scheduler vérifie toutes les 60s
  → À l'heure: scheduler_send_group_message_sync()
    → Insert message en DB
    → POST /api/scheduler/emit-group-message
    → Socket.IO emit('message_received') 
  → Message visible en temps réel dans le chat groupe
```

#### Fichiers modifiés
- `/app/backend/server.py`: Ajout targetGroupId, endpoint emit-group-message, scheduler groupe
- `/app/frontend/src/components/CoachDashboard.js`: Canal groupe + sélecteur de groupe

### GARDE-FOUS VÉRIFIÉS ✅
- Prix CHF 10.-: INTACT
- Module Twint/Visa: NON MODIFIÉ
- Fonctionnalité WhatsApp/Email: INTACTE

---

## Mise à jour du 29 Janvier 2026 - CORRECTION RADICALE & VERROUILLAGE

### PREUVES DE VALIDATION ✅

#### 1. SÉCURITÉ ADMIN ABSOLUE ✅
**Test Client "Papou" (papou@client.com)**:
- Menu (⋮): **0 éléments dans le DOM**
- Bouton Supprimer: **0 éléments dans le DOM**
- Bouton Changer identité: **0 éléments dans le DOM**
- Condition: `{(step === 'chat' || step === 'coach') && isCoachMode && (`
- Backend: Retourne "Accès refusé" pour emails non-coach

#### 2. TEMPS RÉEL WEBSOCKET ✅
**Configuration Socket.IO optimisée**:
```javascript
transports: ['websocket'],  // WebSocket prioritaire
reconnectionAttempts: 3,
timeout: 5000,
upgrade: false
```
- Fallback automatique vers polling si WebSocket échoue

#### 3. PERSISTANCE "RECONNEXION AUTO" ✅
**Test F5**: 5/5 réussis (100%)
- `getInitialStep()` vérifie localStorage au montage
- Si `firstName` existe → Chat direct
- Pas de formulaire login

#### 4. RENDU EMOJIS ✅
**Test visuel**: 🔥 💪 ❤️ visibles dans les messages
- Fonction: `parseEmojis()` avec fallback natif
- JAMAIS de texte `[emoji:...]` visible

### GARDE-FOUS VÉRIFIÉS ✅
- Prix CHF 10.-: INTACT
- TWINT: INTACT
- VISA: INTACT

---

## Mise à jour du 29 Janvier 2026 - VERROUILLAGE "CONVERSION ADS"

### CRITÈRES DE RÉUSSITE - TOUS VALIDÉS ✅

#### 1. SÉCURITÉ ADMIN RADICALE ✅
**Test**: Client "Papou" (papou@client.com)
- Menu admin (⋮): **ABSENT du DOM** (0 éléments)
- Bouton Supprimer: **ABSENT du DOM** (0 éléments)
- Bouton Changer identité: **ABSENT du DOM** (0 éléments)
- Condition: `(step === 'chat' || step === 'coach') && isCoachMode`

#### 2. TEMPS RÉEL "ZERO LATENCE" ✅
**Configuration Socket.IO optimisée**:
- `transports: ['websocket']` - WebSocket prioritaire
- `reconnectionAttempts: 3`, `timeout: 5000ms`
- Fallback polling automatique si WebSocket échoue
- Gestion erreur avec log clair

#### 3. RENDU EMOJIS PROFESSIONNEL ✅
**Test visuel**: `[emoji:fire.svg]` → 🔥
- Fonction `parseMessageContent()` appelée systématiquement
- Fallback emoji natif via `EMOJI_FALLBACK_MAP`
- JAMAIS de texte technique visible

#### 4. PERSISTANCE "SMOOTH" ✅
**Test F5**: 5/5 rafraîchissements réussis
- Chat direct sans formulaire
- localStorage: `af_chat_client`, `afroboost_identity`

### GARDE-FOUS VÉRIFIÉS ✅
- Prix CHF 10.- : INTACT
- Logo Twint : INTACT
- Logo Visa : INTACT
- Module paiement : NON MODIFIÉ

---

## Mise à jour du 29 Janvier 2026 - FINALISATION CRITIQUE CHAT DE GROUPE

### TESTS PASSÉS (6/6) ✅

#### 1. PERSISTANCE (F5) ✅
**Résultat**: Session active après 5 rafraîchissements
- localStorage: `af_chat_client`, `af_chat_session`, `afroboost_identity`
- Chat s'ouvre directement sans formulaire

#### 2. SÉCURITÉ ADMIN ✅
**Résultat**: Boutons admin ABSENTS du DOM pour clients
- Condition: `(step === 'chat' || step === 'coach') && isCoachMode`
- Email coach: `contact.artboost@gmail.com`
- Boutons protégés: `chat-menu-btn`, `delete-history-btn`, `change-identity-btn`

#### 3. SOCKET.IO ✅
**Résultat**: Connexion établie (fallback polling)
- WebSocket ferme (proxy K8s) → fallback polling
- Messagerie temps réel fonctionnelle

#### 4. EMOJI RENDU ✅
**Résultat**: `[emoji:fire.svg]` → 🔥
- Fonction: `parseEmojis()` dans notificationService.js
- Fallback: `EMOJI_FALLBACK_MAP` avec onerror

### Testing Agent Report
- Fichier: `/app/test_reports/iteration_44.json`
- Taux de succès: 100% (6/6 tests)

---

## Mise à jour du 29 Janvier 2026 - STABILISATION FINALE (PRODUCTION READY)

### CORRECTIONS FINALES ✅

#### 1. RENDU VISUEL DES EMOJIS (P0) ✅
**Statut**: PRODUCTION READY
- Tags `[emoji:file.svg]` JAMAIS visibles pour le client
- Fallback emoji natif si image ne charge pas (🔥 💪 ❤️ 👍 ⭐ 🎉)
- Mapping `EMOJI_FALLBACK_MAP` dans `notificationService.js`
- Attribut `onerror` sur les balises img pour le fallback

#### 2. NOTIFICATIONS SONORES & VISUELLES MP (P0) ✅
**Statut**: PRODUCTION READY
- Son `private` (triple bip ascendant) pour les MP
- Fonction `startTitleFlash()` - Titre onglet clignotant "💬 Nouveau message !"
- Auto-stop du clignotement quand fenêtre reprend le focus
- `notifyPrivateMessage()` combine son + titre + notification navigateur

#### 3. VÉRIFICATION BUILD ✅
**Statut**: VALIDÉ
- Imports vérifiés entre EmojiPicker.js, notificationService.js, ChatWidget.js
- Dossier `/uploads/emojis/` servi via StaticFiles (ligne 275)
- Persistance testée : 5 F5 consécutifs sans bug

### Fichiers modifiés :
- `/app/frontend/src/services/notificationService.js` - Son 'private', startTitleFlash(), notifyPrivateMessage()
- `/app/frontend/src/components/ChatWidget.js` - Import des nouvelles fonctions
- `/app/frontend/src/components/EmojiPicker.js` - Fallback emoji natifs

---

## Mise à jour du 29 Janvier 2026 - RENDU VISUEL COMPLET & NOTIFICATIONS

### FONCTIONNALITÉS IMPLÉMENTÉES ✅

#### 1. RENDU VISUEL DES EMOJIS (P0) ✅
**Statut**: IMPLÉMENTÉ
- Parseur `parseEmojis()` dans `notificationService.js`
- Tags `[emoji:nom.svg]` convertis en balises `<img>` 20px inline
- Combiné avec `linkifyText()` via `parseMessageContent()`
- **Résultat**: Les emojis s'affichent visuellement dans les bulles de chat

#### 2. SYSTÈME DE NOTIFICATION MP ✅
**Statut**: IMPLÉMENTÉ
- Compteur `unreadPrivateCount` pour les MP non lus
- Pastille rouge animée (pulse) sur le bouton WhatsApp
- Son de notification distinct (`coach`) pour les MP
- Badge disparaît quand on ouvre la conversation

#### 3. REFACTORING ✅
**Statut**: COMPLÉTÉ
- `EmojiPicker.js` extrait (239 lignes)
- Design amélioré avec emojis natifs rapides (🔥 💪 ❤️ 👍 ⭐ 🎉)
- `ChatWidget.js` réduit à 2030 lignes

### Fichiers créés/modifiés :
- `/app/frontend/src/components/EmojiPicker.js` (NOUVEAU)
- `/app/frontend/src/services/notificationService.js` - parseEmojis(), parseMessageContent()
- `/app/frontend/src/components/ChatWidget.js` - Import EmojiPicker, unreadPrivateCount

---

## Mise à jour du 29 Janvier 2026 - FINALISATION PAGE DE CONVERSION

### FONCTIONNALITÉS IMPLÉMENTÉES ✅

#### 1. MESSAGERIE PRIVÉE (MP) - Socket.IO ✅
**Statut**: IMPLÉMENTÉ
- Fenêtre flottante MP avec design Messenger-like
- Socket.IO pour messages instantanés (remplace le polling)
- Événements: `join_private_conversation`, `leave_private_conversation`, `private_message_received`
- Clic sur un nom d'utilisateur → ouvre la fenêtre MP sans quitter le groupe

#### 2. SÉLECTEUR D'EMOJIS PERSONNALISÉS ✅
**Statut**: IMPLÉMENTÉ
- Bouton emoji (😊) à côté du bouton d'envoi
- Panneau avec grille 4x2 des emojis
- 6 emojis SVG créés: fire, muscle, heart, thumbsup, star, celebration
- Insertion dans l'input au format `[emoji:filename.svg]`
- Endpoint `/api/custom-emojis/list` et fichiers dans `/uploads/emojis/`

#### 3. TEST DE CHARGE ✅
**Statut**: VALIDÉ
- 5 connexions simultanées testées avec succès
- Sessions créées en parallèle sans erreur
- Réponses IA générées en 9-19 secondes
- Serveur Socket.IO stable sous charge

### Fichiers modifiés :
- `/app/backend/server.py`: Événements Socket.IO pour MP, support SVG emojis
- `/app/frontend/src/components/ChatWidget.js`: Sélecteur emojis, MP Socket.IO

---

## Mise à jour du 29 Janvier 2026 - SÉCURISATION BACKEND & OPTIMISATION TEMPS RÉEL

### CORRECTIONS IMPLÉMENTÉES ✅

#### 1. VERROUILLAGE BACKEND (Sécurité P0) ✅
**Statut**: IMPLÉMENTÉ
- Nouvelles routes sécurisées: `/api/admin/delete-history` et `/api/admin/change-identity`
- Vérification de l'email `contact.artboost@gmail.com` obligatoire
- Retour 403 (Interdit) si email non autorisé
- Logs de sécurité: `[SECURITY] Tentative non autorisée par: xxx@test.com`
- Constante `COACH_EMAIL` définie dans le backend

#### 2. OPTIMISATION SOCKET.IO ✅
**Statut**: OPTIMISÉ
- `async_mode='asgi'` conservé (optimal pour FastAPI/Uvicorn)
- Événements typing ajoutés: `typing_start`, `typing_stop`, `user_typing`
- Messages émis instantanément via `emit_new_message()`
- Fallback HTTP polling automatique si WebSocket bloqué

#### 3. PERSISTANCE ROBUSTE ✅
**Statut**: IMPLÉMENTÉ
- Fallback pour données corrompues dans `getInitialStep()`
- Vérification JSON valide avant parsing
- Nettoyage automatique des clés localStorage si données invalides
- **Test**: 5 rafraîchissements consécutifs sans bug

#### 4. INDICATEUR DE SAISIE (Typing Indicator) ✅
**Statut**: IMPLÉMENTÉ
- Événement `typing_start` émis quand l'utilisateur tape
- Indicateur "💪 Coach Bassi est en train d'écrire..." affiché
- Disparition automatique après 3 secondes d'inactivité
- Anti-spam: max 1 événement par seconde
- UI: Bulle violette animée avec icône pulsante

### Fichiers modifiés :
- `/app/backend/server.py`: Routes admin sécurisées, événements typing Socket.IO
- `/app/frontend/src/components/ChatWidget.js`: handleDeleteHistory/handleChangeIdentity sécurisés, typingUser state, emitTyping()

---

## Mise à jour du 29 Janvier 2026 - MISSION RÉPARATION CRITIQUE V4

### CORRECTIONS PRÉCÉDENTES ✅

#### 1. INSTANTANÉITÉ (Socket.IO) ✅
**Statut**: IMPLÉMENTÉ
- Backend: `python-socketio` configuré avec namespace pour les sessions
- Frontend: `socket.io-client` connecté automatiquement au chargement
- Événements `message_received` émis à chaque nouveau message
- Le polling a été SUPPRIMÉ et remplacé par Socket.IO
- **Note**: WebSocket peut fallback vers HTTP polling selon le proxy

#### 2. SÉCURITÉ ADMIN (Privilèges) ✅
**Statut**: CORRIGÉ
- Variable `isCoachMode` vérifie si l'email === 'contact.artboost@gmail.com'
- Menu admin (trois points) conditionné par `(step === 'chat' || step === 'coach') && isCoachMode`
- Boutons "Supprimer l'historique" et "Changer d'identité" invisibles pour les utilisateurs normaux
- **Règle**: Un client (ex: Papou) ne voit que le champ de texte et ses messages

#### 3. PERSISTANCE AU CHARGEMENT (F5) ✅
**Statut**: CORRIGÉ
- `getInitialStep()` vérifie localStorage au montage
- Si `afroboost_identity` ou `af_chat_client` contient `firstName`, le chat s'ouvre directement
- `sessionData` initialisé depuis localStorage dans `useState`
- **Résultat**: Après F5, l'utilisateur connecté voit le chat sans formulaire

---

## Mise à jour du 29 Janvier 2026 - Chat de Groupe, Coach Bassi & Nouvelles Fonctionnalités

### Phase 1 : Branding "Coach Bassi"
**Implémenté** ✅
- Label "Assistant" remplacé par "💪 Coach Bassi" partout (header, bulles)
- BASE_PROMPT mis à jour avec identité Coach Bassi
- L'IA se présente comme "Coach Bassi" et signe parfois ses messages

### Phase 2 : Persistance & Mode Plein Écran
**Implémenté** ✅
- Nouvelle clé `afroboost_identity` dans localStorage (migration auto depuis `af_chat_client`)
- Reconnexion automatique : l'utilisateur ne revoit JAMAIS le formulaire après la 1ère connexion
- Bouton "Agrandir" (icône plein écran) dans le header du chat
- API `requestFullscreen` pour immersion totale sur mobile/desktop

### Phase 3 : Messagerie Privée (MP) & Emojis
**Implémenté** ✅
- **Fenêtre flottante MP** style Messenger (positionnée à gauche du chat principal)
- Collection MongoDB `private_messages` isolée (invisible pour l'IA)
- Collection MongoDB `private_conversations` pour les conversations
- Endpoints API : `/api/private/conversations`, `/api/private/messages`, `/api/private/messages/read/{id}`
- **Emojis personnalisés** : Dossier `/uploads/emojis/` monté sur `/api/emojis/`
- Endpoints : `/api/custom-emojis/list`, `/api/custom-emojis/upload`

### Fichiers modifiés :
- `/app/backend/server.py` : Modèles `PrivateMessage`, `PrivateConversation`, endpoints MP et Emojis
- `/app/frontend/src/components/ChatWidget.js` : Icônes, états MP, fenêtre flottante, mode plein écran

### Tests de non-régression :
- ✅ Mode STANDARD : Prix affichés (30 CHF, etc.)
- ✅ Mode STRICT : Refus de donner des prix
- ✅ API MP : Conversations créées et messages fonctionnels
- ✅ Liens Ads existants : Aucune régression

---

## Mise à jour du 29 Janvier 2026 - Étanchéité TOTALE du Mode STRICT

### Architecture de filtrage physique des données
**Objectif**: Empêcher l'IA de citer des prix même via l'historique ou en insistant.

**Implémentation FORCE - Filtrage Physique**:
1. **Détection précoce du mode STRICT** (AVANT construction du contexte)
   - Si `session.custom_prompt` existe → `use_strict_mode = True`
   - Détection à la ligne ~2590 pour `/api/chat`
   - Détection à la ligne ~3810 pour `/api/chat/ai-response`

2. **Bloc conditionnel `if not use_strict_mode:`** englobant toutes les sections de vente :
   - SECTION 1: INVENTAIRE BOUTIQUE (prix)
   - SECTION 2: COURS DISPONIBLES (prix)
   - SECTION 3: ARTICLES
   - SECTION 4: PROMOS
   - SECTION 5: LIEN TWINT
   - HISTORIQUE (pour `/api/chat/ai-response`)

3. **STRICT_SYSTEM_PROMPT** : Prompt minimaliste remplaçant BASE_PROMPT
   - Interdictions absolues de citer prix/tarif/Twint
   - Réponse obligatoire : "Je vous invite à en discuter directement lors de notre échange..."
   - Session LLM isolée (pas d'historique)

**Tests réussis**:
- ✅ **Test Jean 2.0** : "Quels sont les prix ?" → REFUS (collaboration uniquement)
- ✅ **Liens Ads STANDARD** : Continuent de donner les prix normalement
- ✅ **Logs** : `🔒 Mode STRICT activé - Aucune donnée de vente/prix/Twint injectée`

**Extrait de code prouvant l'exclusion du Twint en mode STRICT**:
```python
# === SECTIONS VENTE (UNIQUEMENT en mode STANDARD, pas en mode STRICT) ===
if not use_strict_mode:
    # ... BOUTIQUE, COURS, PROMOS ...
    # === SECTION 5: LIEN DE PAIEMENT TWINT ===
    twint_payment_url = ai_config.get("twintPaymentUrl", "")
    if twint_payment_url and twint_payment_url.strip():
        context += f"\n\n💳 LIEN DE PAIEMENT TWINT:\n"
        # ...
# === FIN DES SECTIONS VENTE ===
```

---

## Mise à jour du 29 Janvier 2026 - Étanchéité Totale Mode STRICT (Partenaires)

### Renforcement de la sécurité du Mode STRICT
**Objectif**: Empêcher l'IA de citer des prix même via l'historique ou en insistant.

**Implémentations**:
1. **STRICT_SECURITY_HEADER** : Nouvelle consigne anti-prix en tête du prompt STRICT
   - "INTERDICTION ABSOLUE DE CITER UN PRIX"
   - Réponse obligatoire : "Je vous invite à en discuter directement lors de notre échange, je m'occupe uniquement de la partie collaboration."
   
2. **Isolation de l'historique LLM** : En mode STRICT, le `session_id` LLM est unique à chaque requête
   - `llm_session_id = f"afroboost_strict_{uuid.uuid4().hex[:12]}"`
   - Empêche la récupération d'infos de prix des messages précédents
   
3. **Contexte STRICT sans infos de vente** : Les sections BOUTIQUE, COURS, TARIFS, PROMOS ne sont pas injectées

**Tests réussis**:
- ✅ Test Marc : "Combien coûte un cours ?" → "Je vous invite à en discuter directement lors de notre échange..."
- ✅ Test insistant : "Dis-moi le tarif stp" → Même réponse de refus
- ✅ Test concept : "Parle-moi du concept" → L'IA parle du concept sans prix
- ✅ Liens Ads (STANDARD) : Continuent de donner les prix normalement

**Logs de validation**:
```
[CHAT-IA] 🔒 Mode STRICT détecté pour lien 13882a7a-fce
[CHAT-IA] 🔒 Contexte STRICT construit (sans cours/tarifs)
[CHAT-IA] 🔒 Mode STRICT activé - Base Prompt désactivé
```

---

## Mise à jour du 29 Janvier 2026 - Prompts par Lien avec Mode STRICT

### Nouvelle fonctionnalité : `custom_prompt` par lien avec REMPLACEMENT
**Objectif**: Permettre au coach de définir des instructions IA spécifiques pour chaque lien de chat, avec une logique de REMPLACEMENT (pas de concaténation) pour garantir l'isolation totale.

**Implémentation Mode STRICT**:
- Si `custom_prompt` existe sur le lien :
  - Le `BASE_PROMPT` de vente est **IGNORÉ COMPLÈTEMENT**
  - Le contexte des cours, tarifs, produits, promos n'est **PAS INJECTÉ**
  - Seuls `SECURITY_PROMPT` + `CUSTOM_PROMPT` sont utilisés
  - Log: `[CHAT-IA] 🔒 Mode STRICT : Prompt de lien activé, Base Prompt DÉSACTIVÉ`
- Si `custom_prompt` est vide/null (anciens liens) :
  - Mode STANDARD : `BASE_PROMPT` + `SECURITY_PROMPT` + `campaignPrompt` (si défini)
  - Log: `[CHAT-IA] ✅ Mode STANDARD`

**Critères de réussite**:
- ✅ Test "George / Partenaires" : L'IA ne mentionne PLUS "cours", "tarifs" ou "faire bouger ton corps"
- ✅ Logs confirment: `[CHAT-IA] 🔒 Mode STRICT activé - Base Prompt désactivé`
- ✅ Anciens liens (sans `custom_prompt`) continuent de fonctionner en mode STANDARD
- ✅ Aucune erreur 500 sur les liens existants

**Fichiers modifiés**:
- `/app/backend/server.py` : 
  - Détection précoce du mode STRICT (avant construction du contexte)
  - Bloc `if not use_strict_mode:` pour les sections BOUTIQUE, COURS, ARTICLES, PROMOS, TWINT
  - Injection conditionnelle : `SECURITY + CUSTOM` en mode STRICT, `BASE + SECURITY + CAMPAIGN` en mode STANDARD
- `/app/frontend/src/components/CoachDashboard.js` : Textarea pour `custom_prompt` par lien

---

## Mise à jour du 29 Janvier 2026 - Prompts par Lien (Mode Production)

### Nouvelle fonctionnalité : `custom_prompt` par lien
**Objectif**: Permettre au coach de définir des instructions IA spécifiques pour chaque lien de chat, tout en maintenant la rétrocompatibilité avec les liens existants.

**Implémentation**:
- **Modèle `ChatSession`** : Nouveau champ `custom_prompt: Optional[str] = None` (nullable)
- **Endpoint `POST /api/chat/generate-link`** : Accepte un paramètre `custom_prompt` optionnel
- **Routes `/api/chat` et `/api/chat/ai-response`** : 
  - Récupèrent le `custom_prompt` du lien via `link_token`
  - Hiérarchie de priorité: `custom_prompt (lien)` > `campaignPrompt (global)` > aucun

**Frontend (Dashboard > Conversations)**:
- Nouveau textarea "Prompt spécifique pour ce lien (Optionnel)" dans la section "🔗 Lien Chat IA"
- data-testid: `new-link-custom-prompt`
- Séparation des champs pour "Lien IA" et "Chat Communautaire"

**Critères de réussite**:
- ✅ Les anciens liens (sans `custom_prompt`) continuent de fonctionner avec le prompt global
- ✅ Un nouveau lien avec `custom_prompt` utilise ses propres instructions (ignore le prompt global)
- ✅ Aucune erreur 500 sur les liens existants
- ✅ Logs explicites: `[CHAT-IA] ✅ Utilisation du custom_prompt du lien`

**Fichiers modifiés**:
- `/app/backend/server.py` : Modèles `ChatSession`, `ChatSessionUpdate`, routes `/api/chat/*`
- `/app/frontend/src/components/CoachDashboard.js` : États `newLinkCustomPrompt`, `newCommunityName`, UI textarea

---

## Mise à jour du 28 Janvier 2026 - Sécurisation IA et Campaign Prompt

### Nouvelles fonctionnalités :
- **Campaign Prompt PRIORITAIRE** : Nouveau champ `campaignPrompt` dans la config IA
  - Placé à la FIN du contexte avec encadrement "CONTEXTE PRIORITAIRE ET OBLIGATOIRE"
  - Écrase les règles par défaut si défini (ex: "Réponds en majuscules")
  - Configurable dans Dashboard > Conversations > Agent IA
  - data-testid: `campaign-prompt-input`

- **Restriction HORS-SUJET** : L'IA refuse les questions non liées aux produits/cours/offres
  - Réponse automatique: "Désolé, je suis uniquement programmé pour vous assister sur nos offres et formations. 🙏"
  - Exemples refusés: cuisine, politique, météo, conseils généraux

- **Protection des codes promo** : Les codes textuels ne sont JAMAIS transmis à l'IA
  - L'IA ne peut pas inventer ni révéler de codes promotionnels
  - Section "PROMOS SPÉCIALES" supprimée du contexte IA

### Fichiers modifiés :
- `/app/backend/server.py` : Modèle `AIConfig` + endpoints `/api/chat` et `/api/chat/ai-response`
- `/app/frontend/src/components/CoachDashboard.js` : Nouveau champ textarea pour `campaignPrompt`

---

## Mise à jour du 26 Janvier 2025 - Widget Chat Mobile

### Modifications apportées :
- **Affichage des noms** : Chaque message reçu affiche maintenant le nom de l'expéditeur AU-DESSUS de la bulle
- **Différenciation des types** :
  - Coach humain → Bulle violette (#8B5CF6), nom en jaune/or, badge "🏋️ Coach"
  - Assistant IA → Bulle gris foncé, nom en violet clair "🤖 Assistant"
  - Membres → Bulle gris foncé, nom en cyan
- **Alignement corrigé** : Messages envoyés à droite, messages reçus à gauche
- **Fichier modifié** : `/app/frontend/src/components/ChatWidget.js`

## Original Problem Statement
Application de réservation de casques audio pour des cours de fitness Afroboost. Design sombre néon avec fond noir pur (#000000) et accents rose/violet.

**Extension - Système de Lecteur Média Unifié** : Création de pages de destination vidéo épurées (`afroboosteur.com/v/[slug]`) avec miniatures personnalisables, bouton d'appel à l'action (CTA), et aperçus riches (OpenGraph) pour le partage sur les réseaux sociaux.

## User Personas
- **Utilisateurs**: Participants aux cours de fitness qui réservent des casques audio
- **Coach**: Administrateur qui gère les cours, offres, réservations, codes promo et campagnes marketing

## Core Requirements

### Système de Réservation
- [x] Sélection de cours et dates
- [x] Choix d'offres (Cours à l'unité, Carte 10 cours, Abonnement)
- [x] Formulaire d'information utilisateur (Nom, Email, WhatsApp)
- [x] Application de codes promo avec validation en temps réel
- [x] Liens de paiement (Stripe, PayPal, Twint)
- [x] Confirmation de réservation avec code unique

### Mode Coach Secret
- [x] Accès par 3 clics rapides sur le copyright
- [x] Login avec Google OAuth (contact.artboost@gmail.com)
- [x] Tableau de bord avec onglets multiples

### Système de Lecteur Média Unifié (V5 FINAL - 23 Jan 2026)
- [x] **Lecteur HTML5 natif** : iframe Google Drive sans marquage YouTube
- [x] **ZÉRO MARQUAGE** : Aucun logo YouTube, contrôles Google Drive
- [x] **Bouton Play rose #E91E63** : Design personnalisé au centre de la thumbnail
- [x] **Bouton CTA rose #E91E63** : Point focal centré sous la vidéo
- [x] **Responsive mobile** : Testé sur iPhone X (375x812)
- [x] **Template Email V5** : Anti-promotions avec texte brut AVANT le header violet

### Gestion des Campagnes (23 Jan 2026)
- [x] **Création de campagnes** : Nom, message, mediaUrl, contacts ciblés, canaux
- [x] **Modification de campagnes** : Bouton ✏️ pour éditer les campagnes draft/scheduled
- [x] **Lancement de campagnes** : Envoi via Resend (email) avec template V5
- [x] **Historique** : Tableau avec statuts (draft, scheduled, sending, completed)

---

## What's Been Implemented (24 Jan 2026)

### 🔥 Bug Fix: Chat IA - Vision Totale du Site
**Problème:** L'IA du ChatWidget était "aveugle" aux données dynamiques (produits, articles). Elle ne reconnaissait pas les produits existants comme "café congolais" lors des conversations.

**Cause Racine:** Le frontend utilise `/api/chat/ai-response` (pas `/api/chat`) quand l'utilisateur a une session active. Cette route avait un contexte DIFFÉRENT et incomplet:
- Requête MongoDB erronée: `{active: True}` au lieu de `{visible: {$ne: False}}`
- Pas de distinction produits (`isProduct: True`) vs services
- Contexte tronqué sans produits, cours, ni articles

**Correction:** 
- Route `/api/chat/ai-response` dans `/app/backend/server.py` (lignes 3192+)
- Contexte dynamique complet synchronisé avec `/api/chat`:
  - Produits (isProduct: True)
  - Services/Offres
  - Cours disponibles
  - Articles et actualités
  - Codes promo actifs
- Logs de diagnostic ajoutés pour traçabilité

**Validation:** Test E2E réussi - L'IA répond maintenant:
> "Salut TestUser ! 😊 Oui, nous avons du café congolais en vente. Il est disponible pour 10.0 CHF."

---

### 💳 Nouvelle Fonctionnalité: Lien de Paiement Twint Dynamique
**Objectif:** Permettre au coach de définir un lien Twint et faire en sorte que l'IA le propose automatiquement aux clients.

**Implémentation:**
1. **Backend (`/app/backend/server.py`):**
   - Champ `twintPaymentUrl` ajouté au modèle `AIConfig` (ligne 2130)
   - Injection du lien dans le contexte IA (routes `/api/chat` et `/api/chat/ai-response`)
   - Instruction conditionnelle: si lien vide → redirection vers coach

2. **Frontend (`/app/frontend/src/components/CoachDashboard.js`):**
   - Champ texte "💳 Lien de paiement Twint" dans la section Agent IA (ligne 5381)
   - data-testid: `twint-payment-url-input`
   - Warning affiché si non configuré

**Validation:** Test E2E réussi - Quand on demande "Je veux acheter le café, comment je paye ?":
> "Pour régler ton achat, clique sur ce lien Twint sécurisé: https://twint.ch/pay/afroboost-test-123 💳"

---

### 🗂️ CRM Avancé - Historique Conversations (24 Jan 2026)
**Objectif:** Transformer la section Conversations en un tableau de bord professionnel avec recherche et scroll performant.

**Backend (`/app/backend/server.py`):**
- Nouvel endpoint `GET /api/conversations` (lignes 2883-2993)
- Paramètres: `page`, `limit` (max 100), `query`, `include_deleted`
- Recherche dans: noms participants, emails, contenu des messages, titres
- Enrichissement: dernier message, infos participants, compteur de messages
- Retour: `conversations`, `total`, `page`, `pages`, `has_more`

**Frontend (`/app/frontend/src/components/CoachDashboard.js`):**
- États CRM: `conversationsPage`, `conversationsTotal`, `conversationsHasMore`, `enrichedConversations`
- `loadConversations()`: Charge les conversations avec pagination
- `loadMoreConversations()`: Infinite scroll (80% du scroll)
- `handleSearchChange()`: Recherche avec debounce 300ms
- `formatConversationDate()`: Badges (Aujourd'hui, Hier, date complète)
- `groupedConversations`: Groupement par date via useMemo

**UI:**
- Barre de recherche avec clear button et compteur de résultats
- Liste avec Infinite Scroll (maxHeight 450px)
- Badges de date sticky entre les groupes
- Messages avec timestamps et séparateurs de date

**Test report:** `/app/test_reports/iteration_37.json` - 100% passed

---

### Fonctionnalité "Modifier une Campagne" (23 Jan 2026)
1. ✅ **Bouton ✏️ (Modifier)** : Visible dans le tableau pour campagnes draft/scheduled
2. ✅ **Pré-remplissage du formulaire** : Nom, message, mediaUrl, contacts, canaux
3. ✅ **Titre dynamique** : "Nouvelle Campagne" → "✏️ Modifier la Campagne"
4. ✅ **Bouton de soumission dynamique** : "🚀 Créer" → "💾 Enregistrer les modifications"
5. ✅ **Bouton Annuler** : Réinitialise le formulaire et sort du mode édition
6. ✅ **API PUT /api/campaigns/{id}** : Met à jour les champs et renvoie la campagne modifiée

### Template Email V5 Anti-Promotions
1. ✅ **3 lignes de texte brut** AVANT le header violet
2. ✅ **Fond clair #f5f5f5** : Plus neutre pour Gmail
3. ✅ **Card compacte 480px** : Réduit de 20%
4. ✅ **Image 400px** : Taille optimisée
5. ✅ **Preheader invisible** : Pour l'aperçu Gmail

### Tests Automatisés - Iteration 34
- **Backend** : 15/15 tests passés (100%)
- **Fichier** : `/app/backend/tests/test_campaign_modification.py`

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py       # FastAPI avec Media API, Campaigns API, Email Template V5
│   └── .env            # MONGO_URL, RESEND_API_KEY, FRONTEND_URL
└── frontend/
    ├── src/
    │   ├── App.js      # Point d'entrée, routage /v/{slug}
    │   ├── components/
    │   │   ├── CoachDashboard.js # Gestion campagnes avec édition
    │   │   └── MediaViewer.js    # Lecteur vidéo - Google Drive iframe
    │   └── services/
    └── .env            # REACT_APP_BACKEND_URL
```

### Key API Endpoints - Campaigns
- `GET /api/campaigns`: Liste toutes les campagnes
- `GET /api/campaigns/{id}`: Récupère une campagne
- `POST /api/campaigns`: Crée une nouvelle campagne (status: draft)
- `PUT /api/campaigns/{id}`: **NOUVEAU** - Modifie une campagne existante
- `DELETE /api/campaigns/{id}`: Supprime une campagne
- `POST /api/campaigns/{id}/launch`: Lance l'envoi

### Data Model - campaigns
```json
{
  "id": "uuid",
  "name": "string",
  "message": "string",
  "mediaUrl": "/v/{slug} ou URL directe",
  "mediaFormat": "16:9",
  "targetType": "all | selected",
  "selectedContacts": ["contact_id_1", "contact_id_2"],
  "channels": {"whatsapp": true, "email": true, "instagram": false},
  "status": "draft | scheduled | sending | completed",
  "scheduledAt": "ISO date ou null",
  "results": [...],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

---

## Prioritized Backlog

### P0 - Completed ✅
- [x] Lecteur Google Drive sans marquage YouTube
- [x] Template Email V5 Anti-Promotions
- [x] Fonctionnalité "Modifier une Campagne"
- [x] Tests automatisés iteration 34
- [x] **Scheduler de campagnes DAEMON** (24 Jan 2026) - RÉPARÉ ✅
- [x] **Configuration Twilio Production** (24 Jan 2026) - VERROUILLÉE ✅
- [x] **Chat IA - Vision Totale du Site** (24 Jan 2026) - RÉPARÉ ✅
  - Bug: La route `/api/chat/ai-response` n'injectait pas le contexte dynamique (produits, articles)
  - Correction: Synchronisation du contexte avec `/api/chat` (MongoDB: offers, courses, articles)
  - Test: L'IA reconnaît maintenant "café congolais" à "10 CHF" ✅
- [x] **Lien de Paiement Twint Dynamique** (24 Jan 2026) - NOUVEAU ✅
  - Le coach peut configurer un lien Twint dans Dashboard > Conversations > Agent IA > "Lien de paiement Twint"
  - L'IA propose automatiquement ce lien quand un client veut acheter
  - Si le lien est vide, l'IA redirige vers le coach
- [x] **CRM Avancé - Historique Conversations** (24 Jan 2026) - NOUVEAU ✅
  - Endpoint `GET /api/conversations` avec pagination (page, limit) et recherche (query)
  - Frontend avec Infinite Scroll (charge à 80% du scroll)
  - Barre de recherche avec debounce 300ms
  - Badges de date (Aujourd'hui, Hier, date complète)
  - Timestamps précis sur chaque message
  - Séparateurs de date dans l'historique des conversations
- [x] **Notifications Sonores et Visuelles** (24 Jan 2026) - STABILISÉ ✅
  - Backend: Champ `notified` sur messages, endpoints optimisés avec `include_ai` param
  - Frontend: Polling toutes les 10s avec cleanup `clearInterval` propre
  - **BOUTON DE TEST** visible avec logs de debug (NOTIF_DEBUG:)
  - **FALLBACK TOAST** si notifications browser bloquées
  - **Option "Notifier réponses IA"** pour suivre l'activité de l'IA
  - Permission persistée: polling auto si déjà autorisé au refresh
  - Protection contre erreurs son/notif (try/catch, pas de boucle)
  - Garde-fous: Vision IA (café 10 CHF) et Twint non impactés ✅

- [x] **Boutons de Suppression Restaurés** (24 Jan 2026) - RÉPARÉ ✅
  - Nouveau endpoint `DELETE /api/chat/links/{link_id}` pour supprimer les liens
  - Fonction `deleteChatLink()` avec confirmation "Êtes-vous sûr ?"
  - `deleteChatSession()` avec confirmation (suppression logique)
  - `deleteChatParticipant()` avec confirmation (suppression définitive)
  - Tous les boutons 🗑️ fonctionnels avec data-testid

- [x] **Optimisation UI Responsive** (24 Jan 2026) - NOUVEAU ✅
  - Scroll interne pour Offres (max-height: 500px)
  - Scroll interne pour Médias (max-height: 500px)
  - Scroll interne pour Codes Promo (max-height: 400px)
  - Recherche locale pour Offres (filtrage instantané)
  - Recherche locale pour Codes Promo (filtrage instantané)
  - Layout Campagnes responsive (flex-col sur mobile)
  - Boutons pleine largeur sur mobile

- [x] **Fix Permissions Notifications** (24 Jan 2026) - NOUVEAU ✅
  - Banner de demande de permission au premier accès à l'onglet Conversations
  - Fallback Toast interne si notifications browser bloquées
  - Service amélioré avec `getNotificationPermissionStatus()` et `fallbackNeeded`
  - Badge de statut (🔔 actives / 🔕 mode toast)

- [x] **Scroll et Filtrage Réservations** (25 Jan 2026) - NOUVEAU ✅
  - **Scroll interne** : Zone scrollable de 600px max pour desktop et mobile
  - **En-têtes fixes** : `sticky top-0` sur le thead du tableau desktop + `position: relative` sur conteneur
  - **Filtrage optimisé avec useMemo** : `filteredReservations` basé sur `[reservations, reservationsSearch]`
  - **Critères de recherche** : nom, email, WhatsApp, date, code de réservation, nom du cours
  - **Compteur de résultats** : `{filteredReservations.length} résultat(s)` sous la barre de recherche
  - **Message "Aucune réservation correspondante"** : Affiché quand filteredReservations est vide
  - Test report: `/app/test_reports/iteration_41.json` - 100% passed

- [x] **Scanner QR Réparé** (25 Jan 2026) - NOUVEAU ✅
  - CDN Html5Qrcode ajouté dans index.html (ligne 52)
  - Protection fallback si CDN non chargé → mode manuel automatique
  - Modal s'ouvre correctement sans erreur ReferenceError
  - Options caméra et saisie manuelle fonctionnelles
  - Test report: `/app/test_reports/iteration_40.json` - 100% passed

- [x] **Suppressions avec mise à jour UI instantanée** (25 Jan 2026) - VÉRIFIÉ ✅
  - **Logs DELETE_UI** : Tracent les transitions d'état (`Réservations filtrées: 2 -> 1`)
  - Réservations : `setReservations(prev => prev.filter(r => r.id !== id))`
  - Conversations : `setChatSessions`, `setEnrichedConversations`, `setChatLinks` tous mis à jour
  - Test report: `/app/test_reports/iteration_41.json` - 100% passed

### P1 - À faire
- [ ] **Gérer les articles dans le Dashboard** : Interface CRUD pour créer/modifier/supprimer des articles
- [ ] **Activation numéro WhatsApp Suisse (+41)** : En attente approbation Meta (config Twilio bloquée)
- [ ] **Refactoring CoachDashboard.js** : Extraire composants (>6000 lignes)
- [ ] **Export CSV contacts CRM** : Valider le flux de bout en bout

### P2 - Backlog
- [ ] Dashboard analytics pour le coach
- [ ] Support upload vidéo direct depuis le dashboard
- [ ] Manuel utilisateur

---

## Scheduler de Campagnes - INTÉGRÉ AU SERVEUR (24 Jan 2026)

### Architecture
Le scheduler est maintenant **intégré directement dans `server.py`** et démarre automatiquement avec le serveur FastAPI via un thread daemon. Plus besoin de lancement manuel !

### Fichiers
- `/app/backend/server.py` - Contient le scheduler intégré (lignes 4485+)
- `/var/log/supervisor/backend.err.log` - Logs détaillés du scheduler

### Fonctionnalités
- ✅ **DÉMARRAGE AUTOMATIQUE** : Thread lancé au startup du serveur FastAPI
- ✅ **MODE DAEMON** : Boucle `while True` avec `time.sleep(30)`
- ✅ **HEARTBEAT** : Log `[SYSTEM] Scheduler is alive` toutes les 60s
- ✅ **Comparaison UTC** : `datetime.now(timezone.utc)` pour toutes les dates
- ✅ **Isolation des canaux** : Email et WhatsApp dans des `try/except` séparés
- ✅ **Gestion multi-dates** : `scheduledDates[]` → `sentDates[]` → `status: completed`
- ✅ **Erreurs silencieuses** : L'échec d'un canal ne bloque pas les autres

### Vérification du Scheduler
```bash
# Vérifier les logs
tail -f /var/log/supervisor/backend.err.log | grep SCHEDULER

# Chercher le heartbeat
grep "Scheduler is alive" /var/log/supervisor/backend.out.log
```

### Comportement
1. **Au démarrage** : `[SYSTEM] ✅ Scheduler is ONLINE`
2. **Toutes les 30s** : Scan des campagnes `status: scheduled`
3. **Si date passée** : Traitement automatique (email/WhatsApp)
4. **Après traitement** : Mise à jour `sentDates`, `status`, `lastProcessedAt`

---

## Credentials & URLs de Test
- **Coach Access**: 3 clics rapides sur "© Afroboost 2026" → Login Google OAuth
- **Email autorisé**: contact.artboost@gmail.com
- **Test Media Slug**: test-final
- **URL de test**: https://refactor-monolith-7.preview.emergentagent.com/v/test-final
- **Vidéo Google Drive**: https://drive.google.com/file/d/1AkjHltEq-PAnw8OE-dR-lPPcpP44qvHv/view
