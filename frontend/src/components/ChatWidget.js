// /components/ChatWidget.js - Widget IA flottant avec capture de leads et reconnaissance automatique
// Architecture modulaire Afroboost - Utilise l'API chat améliorée
// Fonctionnalités: Socket.IO temps réel, notifications push, sons, liens cliquables, suppression historique

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  playNotificationSound, 
  parseMessageContent, 
  notifyPrivateMessage,
  stopTitleFlash 
} from '../services/notificationService';
import { 
  isPushSupported, 
  promptForNotifications, 
  registerServiceWorker,
  isSubscribed 
} from '../services/pushNotificationService';
import EmojiPicker from './EmojiPicker';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const SOCKET_URL = process.env.REACT_APP_BACKEND_URL; // URL Socket.IO (même que backend)

// Clés localStorage pour la mémorisation client (persistance de session)
const CHAT_CLIENT_KEY = 'af_chat_client';
const CHAT_SESSION_KEY = 'af_chat_session';
const AFROBOOST_IDENTITY_KEY = 'afroboost_identity'; // Clé unifiée pour l'identité
const AFROBOOST_PROFILE_KEY = 'afroboost_profile'; // Profil abonné avec code promo validé

// Icône Plein Écran
const FullscreenIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
  </svg>
);

// Icône Réduire Plein Écran
const ExitFullscreenIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
  </svg>
);

// Icône Emoji
const EmojiIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm8.5-3c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/>
  </svg>
);

// Icône WhatsApp SVG
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Icône Fermer
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// Icône Envoyer
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

// Icône Corbeille
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

// Icône Groupe
const GroupIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

/**
 * Composant pour afficher un message avec liens cliquables et emojis
 * Affiche le nom de l'expéditeur au-dessus de chaque bulle
 * Couleurs: Violet (#8B5CF6) pour le Coach, Gris foncé pour les membres/IA
 */
const MessageBubble = ({ msg, isUser, onParticipantClick, isCommunity, currentUserId, profilePhotoUrl }) => {
  // Convertir le texte en HTML avec liens cliquables ET emojis parsés
  const htmlContent = parseMessageContent(msg.text);
  const isOtherUser = isCommunity && msg.type === 'user' && msg.senderId && msg.senderId !== currentUserId;
  
  // Déterminer si c'est un message du Coach HUMAIN (pas l'IA)
  const isCoachMessage = msg.type === 'coach' || msg.is_admin === true || msg.role === 'coach';
  
  // Message IA (assistant automatique - Coach Bassi)
  const isAIMessage = msg.type === 'ai';
  
  // Déterminer le nom à afficher
  const getDisplayName = () => {
    if (isCoachMessage) return '💪 Coach Bassi';
    if (isAIMessage) return '💪 Coach Bassi';
    return msg.sender || msg.senderName || 'Membre';
  };
  const displayName = getDisplayName();
  
  // Couleur du nom selon le type
  const getNameColor = () => {
    if (isCoachMessage) return '#FBBF24'; // Jaune/Or pour Coach
    if (isAIMessage) return '#A78BFA';    // Violet clair pour IA
    return '#22D3EE';                      // Cyan pour membres
  };
  
  // Couleur de la bulle selon le type
  const getBubbleBackground = () => {
    if (isUser) {
      // Messages envoyés par l'utilisateur actuel (à droite)
      return 'linear-gradient(135deg, #d91cd2, #8b5cf6)';
    }
    if (isCoachMessage) {
      // Messages du Coach HUMAIN: Violet solide
      return '#8B5CF6';
    }
    // Messages IA et autres membres: Gris foncé
    return '#2D2D2D';
  };
  
  // Récupérer l'avatar (photo ou initiale)
  const getAvatar = () => {
    // Si c'est un message de l'utilisateur actuel avec une photo
    if (isUser && profilePhotoUrl) {
      return (
        <img 
          src={profilePhotoUrl} 
          alt="avatar"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        />
      );
    }
    // Avatar par défaut (initiale)
    if (msg.senderPhotoUrl) {
      return (
        <img 
          src={msg.senderPhotoUrl} 
          alt="avatar"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        />
      );
    }
    return null;
  };
  
  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '8px',
        alignItems: 'flex-end'
      }}
    >
      {/* Avatar rond si disponible */}
      {getAvatar()}
      
      <div style={{ flex: 1 }}>
        {/* NOM AU-DESSUS DE LA BULLE - Toujours visible pour les messages reçus */}
        {!isUser && (
          <div
            style={{
              fontSize: '10px',
              fontWeight: '600',
              marginBottom: '3px',
              marginLeft: '4px',
              color: getNameColor(),
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isOtherUser && onParticipantClick ? (
              <button
                onClick={() => onParticipantClick(msg.senderId, msg.sender)}
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  color: '#22D3EE',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Cliquer pour envoyer un message privé"
              >
                {/* Icône DM */}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                {displayName}
              </button>
            ) : (
              displayName
            )}
          </div>
        )}
        
        <div
          style={{
            background: getBubbleBackground(),
            color: '#fff',
            padding: '10px 14px',
            borderRadius: isUser 
              ? '16px 16px 4px 16px' 
              : '16px 16px 16px 4px',
            fontSize: '13px',
            lineHeight: '1.4',
            // Bordure subtile dorée pour les bulles Coach
            border: isCoachMessage && !isUser ? '1px solid rgba(251, 191, 36, 0.4)' : 'none'
          }}
        >
          {/* Rendu du texte avec liens cliquables */}
          <span 
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{ wordBreak: 'break-word' }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Widget de chat IA flottant avec reconnaissance automatique et historique
 * Utilise l'API /api/chat/smart-entry pour identifier les utilisateurs
 */
export const ChatWidget = () => {
  // === VÉRIFICATION DU PROFIL ABONNÉ (afroboost_profile) ===
  const getStoredProfile = () => {
    try {
      const savedProfile = localStorage.getItem(AFROBOOST_PROFILE_KEY);
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile && profile.code && profile.name) {
          return profile;
        }
      }
    } catch (e) {
      console.warn('[PROFILE] ⚠️ Erreur lecture profil:', e.message);
    }
    return null;
  };

  // === VÉRIFICATION PERSISTANCE AU MONTAGE (AVANT tout render) ===
  // Déterminer le step initial IMMÉDIATEMENT basé sur localStorage
  // AVEC FALLBACK ROBUSTE pour données corrompues
  const getInitialStep = () => {
    try {
      // PRIORITÉ 1: Vérifier si c'est un abonné identifié (afroboost_profile)
      const profile = getStoredProfile();
      if (profile) {
        console.log('[PERSISTENCE] ✅ Abonné reconnu:', profile.name, '- Code:', profile.code);
        return 'chat'; // Abonné → DIRECT au chat en mode plein écran
      }
      
      const savedIdentity = localStorage.getItem(AFROBOOST_IDENTITY_KEY);
      const savedClient = localStorage.getItem(CHAT_CLIENT_KEY);
      
      if (savedIdentity || savedClient) {
        const rawData = savedIdentity || savedClient;
        
        // Vérification de la validité JSON
        if (!rawData || rawData === 'undefined' || rawData === 'null') {
          throw new Error('Données localStorage invalides');
        }
        
        const data = JSON.parse(rawData);
        
        // Vérification des données minimales requises
        if (data && typeof data === 'object' && data.firstName && typeof data.firstName === 'string' && data.firstName.trim()) {
          console.log('[PERSISTENCE] ✅ Utilisateur reconnu:', data.firstName);
          return 'chat'; // Utilisateur déjà identifié → DIRECT au chat
        } else {
          throw new Error('Données utilisateur incomplètes');
        }
      }
    } catch (e) {
      // FALLBACK: Nettoyer les données corrompues et rediriger vers le formulaire
      console.warn('[PERSISTENCE] ⚠️ Données corrompues détectées, nettoyage...', e.message);
      try {
        localStorage.removeItem(AFROBOOST_IDENTITY_KEY);
        localStorage.removeItem(CHAT_CLIENT_KEY);
        localStorage.removeItem(CHAT_SESSION_KEY);
        localStorage.removeItem(AFROBOOST_PROFILE_KEY);
      } catch (cleanupError) {
        console.error('[PERSISTENCE] Erreur lors du nettoyage localStorage:', cleanupError);
      }
    }
    return 'form'; // Nouvel utilisateur ou données corrompues → formulaire
  };
  
  // === DÉTERMINER SI MODE PLEIN ÉCRAN INITIAL (Abonné = plein écran) ===
  const getInitialFullscreen = () => {
    const profile = getStoredProfile();
    return !!profile; // Abonné reconnu → plein écran activé
  };

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(getInitialStep); // Initialisation DYNAMIQUE
  const [leadData, setLeadData] = useState(() => {
    // Charger les données du localStorage IMMÉDIATEMENT
    try {
      const savedIdentity = localStorage.getItem(AFROBOOST_IDENTITY_KEY);
      const savedClient = localStorage.getItem(CHAT_CLIENT_KEY);
      if (savedIdentity || savedClient) {
        const data = JSON.parse(savedIdentity || savedClient);
        if (data && data.firstName) {
          return {
            firstName: data.firstName || '',
            email: data.email || '',
            whatsapp: data.whatsapp || ''
          };
        }
      }
    } catch (e) {}
    return { firstName: '', whatsapp: '', email: '' };
  });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReturningClient, setIsReturningClient] = useState(() => {
    // Déterminer si c'est un client de retour IMMÉDIATEMENT
    try {
      const savedIdentity = localStorage.getItem(AFROBOOST_IDENTITY_KEY);
      const savedClient = localStorage.getItem(CHAT_CLIENT_KEY);
      return !!(savedIdentity || savedClient);
    } catch (e) {}
    return false;
  });
  const [sessionData, setSessionData] = useState(() => {
    // Charger la session depuis localStorage IMMÉDIATEMENT
    try {
      const savedSession = localStorage.getItem(CHAT_SESSION_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (e) {}
    return null;
  });
  const [participantId, setParticipantId] = useState(() => {
    try {
      const savedIdentity = localStorage.getItem(AFROBOOST_IDENTITY_KEY);
      const savedClient = localStorage.getItem(CHAT_CLIENT_KEY);
      if (savedIdentity || savedClient) {
        const data = JSON.parse(savedIdentity || savedClient);
        return data?.participantId || null;
      }
    } catch (e) {}
    return null;
  });
  const [showMenu, setShowMenu] = useState(false);
  const [isCommunityMode, setIsCommunityMode] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [privateChatTarget, setPrivateChatTarget] = useState(null);
  const [messageCount, setMessageCount] = useState(0); // Compteur de messages pour prompt notif
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isCoachMode, setIsCoachMode] = useState(() => {
    // Vérifier si c'est le coach IMMÉDIATEMENT
    try {
      const savedIdentity = localStorage.getItem(AFROBOOST_IDENTITY_KEY);
      const savedClient = localStorage.getItem(CHAT_CLIENT_KEY);
      if (savedIdentity || savedClient) {
        const data = JSON.parse(savedIdentity || savedClient);
        return data?.email?.toLowerCase() === 'contact.artboost@gmail.com';
      }
    } catch (e) {}
    return false;
  });
  const [coachSessions, setCoachSessions] = useState([]); // Liste des sessions pour le coach
  const [selectedCoachSession, setSelectedCoachSession] = useState(null); // Session sélectionnée par le coach
  const [isFullscreen, setIsFullscreen] = useState(getInitialFullscreen); // Mode plein écran (ABONNÉ = activé)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Sélecteur d'emojis (composant EmojiPicker)
  
  // === FORMULAIRE ABONNÉ (4 champs: Nom, WhatsApp, Email, Code Promo) ===
  const [showSubscriberForm, setShowSubscriberForm] = useState(false); // Afficher le formulaire abonné
  const [subscriberFormData, setSubscriberFormData] = useState({ name: '', whatsapp: '', email: '', code: '' });
  const [validatingCode, setValidatingCode] = useState(false); // Loading pendant validation du code
  
  // === PROFIL ABONNÉ VALIDÉ (afroboost_profile) ===
  const [afroboostProfile, setAfroboostProfile] = useState(getStoredProfile);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      const profile = getStoredProfile();
      return profile?.photoUrl || null;
    } catch { return null; }
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // === MODALE RECADRAGE PHOTO ===
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0, scale: 1 });
  const cropCanvasRef = useRef(null);
  
  // === MENU UTILISATEUR (Partage + Mode Visiteur) ===
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCoachMenu, setShowCoachMenu] = useState(false); // Menu coach minimaliste
  const [linkCopied, setLinkCopied] = useState(false);
  const [isVisitorMode, setIsVisitorMode] = useState(false); // Mode visiteur (chat réduit mais profil conservé)
  
  // Fonction pour copier le lien du site
  const handleShareLink = async () => {
    try {
      const shareUrl = window.location.origin;
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      console.log('[SHARE] ✅ Lien copié:', shareUrl);
    } catch (err) {
      console.error('[SHARE] ❌ Erreur copie:', err);
      // Fallback pour navigateurs sans clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.origin;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
    setShowUserMenu(false);
  };
  
  // Fonction pour passer en mode visiteur (réduit le chat sans effacer le profil)
  const handleVisitorMode = () => {
    setIsFullscreen(false);
    setIsVisitorMode(true);
    setShowUserMenu(false);
    setShowReservationPanel(false);
    console.log('[MODE] 🏃 Mode visiteur activé (profil conservé)');
  };
  
  // Fonction pour réactiver le mode abonné
  const handleReactivateSubscriber = () => {
    if (afroboostProfile?.code) {
      setIsFullscreen(true);
      setIsVisitorMode(false);
      console.log('[MODE] 💎 Mode abonné réactivé');
    }
  };
  
  // === OUVRIR UN DM (Message Privé) ===
  const openDirectMessage = async (memberId, memberName) => {
    if (!participantId) return;
    
    try {
      console.log('[DM] 📩 Ouverture DM avec:', memberName);
      
      // Créer ou récupérer la conversation privée
      const res = await axios.post(`${API}/private/conversations`, {
        participant_1_id: participantId,
        participant_1_name: afroboostProfile?.name || leadData?.firstName || 'Moi',
        participant_2_id: memberId,
        participant_2_name: memberName
      });
      
      const conversation = res.data;
      setActivePrivateChat(conversation);
      
      // Charger les messages existants
      const messagesRes = await axios.get(`${API}/private/messages/${conversation.id}`);
      setPrivateMessages(messagesRes.data || []);
      
      // Rejoindre la room Socket.IO pour les mises à jour temps réel
      if (socketRef.current) {
        socketRef.current.emit('join_private_conversation', {
          conversation_id: conversation.id,
          participant_id: participantId
        });
      }
      
      // Marquer comme lu
      await axios.put(`${API}/private/messages/read/${conversation.id}?reader_id=${participantId}`);
      
      // Persister la conversation active pour F5
      localStorage.setItem('afroboost_active_dm', JSON.stringify(conversation));
      
      console.log('[DM] ✅ Conversation ouverte:', conversation.id);
    } catch (err) {
      console.error('[DM] ❌ Erreur ouverture DM:', err);
    }
  };
  
  // === FERMER LE DM ===
  const closeDirectMessage = () => {
    if (activePrivateChat && socketRef.current) {
      socketRef.current.emit('leave_private_conversation', {
        conversation_id: activePrivateChat.id
      });
    }
    setActivePrivateChat(null);
    setPrivateMessages([]);
    setPrivateInput('');
    localStorage.removeItem('afroboost_active_dm');
    console.log('[DM] 📭 DM fermé');
  };
  
  // === ENVOYER UN MESSAGE PRIVÉ ===
  const sendPrivateMessage = async () => {
    if (!privateInput.trim() || !activePrivateChat) return;
    
    try {
      const recipientId = activePrivateChat.participant_1_id === participantId 
        ? activePrivateChat.participant_2_id 
        : activePrivateChat.participant_1_id;
      const recipientName = activePrivateChat.participant_1_id === participantId
        ? activePrivateChat.participant_2_name
        : activePrivateChat.participant_1_name;
      
      const res = await axios.post(`${API}/private/messages`, {
        conversation_id: activePrivateChat.id,
        sender_id: participantId,
        sender_name: afroboostProfile?.name || leadData?.firstName || 'Moi',
        recipient_id: recipientId,
        recipient_name: recipientName,
        content: privateInput.trim()
      });
      
      // Ajouter le message localement
      setPrivateMessages(prev => [...prev, res.data]);
      setPrivateInput('');
      
      console.log('[DM] ✅ Message envoyé');
    } catch (err) {
      console.error('[DM] ❌ Erreur envoi message:', err);
    }
  };
  
  // === COMPRESSION IMAGE CÔTÉ CLIENT ===
  const compressImage = (file, maxWidth = 200, maxHeight = 200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculer les nouvelles dimensions
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          // Créer le canvas pour la compression
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en blob compressé
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // === OUVRIR MODALE DE RECADRAGE ===
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }
    
    // Lire l'image et ouvrir la modale de recadrage
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImageSrc(event.target.result);
      setCropPosition({ x: 0, y: 0, scale: 1 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };
  
  // === RECADRER ET UPLOADER LA PHOTO ===
  const handleCropAndUpload = async () => {
    if (!cropImageSrc) return;
    
    setUploadingPhoto(true);
    setShowCropModal(false);
    
    try {
      // Créer le canvas de recadrage circulaire
      const canvas = document.createElement('canvas');
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Charger l'image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = cropImageSrc;
      });
      
      // Calculer les dimensions de recadrage
      const minDim = Math.min(img.width, img.height);
      const scale = cropPosition.scale;
      const cropSize = minDim / scale;
      const offsetX = ((img.width - cropSize) / 2) + (cropPosition.x * img.width / 200);
      const offsetY = ((img.height - cropSize) / 2) + (cropPosition.y * img.height / 200);
      
      // Dessiner l'image recadrée dans un cercle
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(
        img, 
        Math.max(0, offsetX), 
        Math.max(0, offsetY), 
        cropSize, 
        cropSize,
        0, 0, size, size
      );
      
      // Convertir en blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      });
      
      const compressedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      console.log('[PHOTO] ✅ Recadrage terminé:', Math.round(compressedFile.size / 1024), 'KB');
      
      // Upload
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('participant_id', participantId || 'guest');
      
      const res = await axios.post(`${API}/upload/profile-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.url) {
        const photoUrl = res.data.url;
        setProfilePhoto(photoUrl);
        
        const profile = getStoredProfile() || {};
        profile.photoUrl = photoUrl;
        localStorage.setItem(AFROBOOST_PROFILE_KEY, JSON.stringify(profile));
        setAfroboostProfile(profile);
        
        // === ÉMETTRE LA MISE À JOUR D'AVATAR EN TEMPS RÉEL ===
        emitAvatarUpdate(photoUrl);
        
        console.log('[PHOTO] ✅ Photo uploadée:', photoUrl);
      }
    } catch (err) {
      console.error('[PHOTO] ❌ Erreur:', err);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploadingPhoto(false);
      setCropImageSrc(null);
    }
  };
  
  // === UPLOAD PHOTO DE PROFIL (legacy - rediriger vers crop) ===
  const handlePhotoUpload = async (e) => {
    handlePhotoSelect(e);
  };
  
  // === RESTAURER DM ACTIVE APRÈS F5 ===
  useEffect(() => {
    const savedDM = localStorage.getItem('afroboost_active_dm');
    if (savedDM && participantId) {
      try {
        const conversation = JSON.parse(savedDM);
        openDirectMessage(
          conversation.participant_1_id === participantId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id,
          conversation.participant_1_id === participantId
            ? conversation.participant_2_name
            : conversation.participant_1_name
        );
      } catch (e) {}
    }
  }, [participantId]);
  
  // === INDICATEUR DE SAISIE (Typing Indicator) ===
  const [typingUser, setTypingUser] = useState(null); // Qui est en train d'écrire
  const typingTimeoutRef = useRef(null); // Timer pour cacher l'indicateur après 3s
  const lastTypingEmitRef = useRef(0); // Éviter le spam d'événements typing
  
  // === MESSAGERIE PRIVÉE (MP) ===
  const [privateChats, setPrivateChats] = useState([]); // Liste des conversations MP actives
  const [activePrivateChat, setActivePrivateChat] = useState(null); // MP actuellement ouverte
  const [privateMessages, setPrivateMessages] = useState([]); // Messages de la MP active
  const [privateInput, setPrivateInput] = useState(''); // Input de la MP
  const [unreadPrivateCount, setUnreadPrivateCount] = useState(0); // Compteur MP non lus (pastille rouge)
  const [dmTypingUser, setDmTypingUser] = useState(null); // Indicateur "en train d'écrire" pour DM
  const dmTypingTimeoutRef = useRef(null); // Timer pour cacher l'indicateur DM après 3s
  const lastDmTypingEmitRef = useRef(0); // Éviter le spam d'événements DM typing
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null); // Référence Socket.IO
  const chatContainerRef = useRef(null); // Ref pour le mode plein écran
  
  // === SUBSCRIBER DATA (Mémorisation code promo) ===
  const [subscriberData, setSubscriberData] = useState(() => {
    try {
      const saved = localStorage.getItem('subscriber_data');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [showReservationPanel, setShowReservationPanel] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]); // Cours pour réservation
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // Cours sélectionné
  const [reservationLoading, setReservationLoading] = useState(false); // Chargement réservation
  const [reservationError, setReservationError] = useState(''); // Erreur réservation

  // Email du coach autorisé
  const COACH_EMAIL = 'contact.artboost@gmail.com';
  
  // Sauvegarder subscriber_data quand un code promo est validé
  const saveSubscriberData = useCallback((code, name, type = 'abonné') => {
    const data = { code, name, type, savedAt: new Date().toISOString() };
    localStorage.setItem('subscriber_data', JSON.stringify(data));
    setSubscriberData(data);
    console.log('[SUBSCRIBER] ✅ Données abonné sauvegardées:', data);
  }, []);
  
  // === VALIDATION DU CODE PROMO ET ENREGISTREMENT PROFIL ABONNÉ ===
  const handleSubscriberFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { name, whatsapp, email, code } = subscriberFormData;
    
    // Validation des champs
    if (!name?.trim() || !whatsapp?.trim() || !email?.trim() || !code?.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    setValidatingCode(true);
    
    try {
      // Valider le code promo via l'API
      const res = await axios.post(`${API}/discount-codes/validate`, {
        code: code.trim(),
        email: email.trim()
      });
      
      if (!res.data?.valid) {
        setError(res.data?.message || 'Code promo invalide');
        setValidatingCode(false);
        return;
      }
      
      // ✅ Code valide ! Sauvegarder le profil abonné
      const profile = {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        code: code.trim().toUpperCase(),
        codeDetails: res.data.code, // Détails du code (type, valeur, etc.)
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(AFROBOOST_PROFILE_KEY, JSON.stringify(profile));
      setAfroboostProfile(profile);
      
      // Sauvegarder aussi dans subscriber_data pour compatibilité
      saveSubscriberData(profile.code, profile.name, 'abonné');
      
      // Mettre à jour leadData pour le chat
      setLeadData({ firstName: profile.name, whatsapp: profile.whatsapp, email: profile.email });
      
      console.log('[SUBSCRIBER] ✅ Profil abonné validé et sauvegardé:', profile.name);
      
      // Activer le mode plein écran et passer au chat
      setIsFullscreen(true);
      setShowSubscriberForm(false);
      
      // Démarrer le chat avec smart-entry
      await handleSmartEntry({ 
        firstName: profile.name, 
        whatsapp: profile.whatsapp, 
        email: profile.email 
      });
      
    } catch (err) {
      console.error('[SUBSCRIBER] ❌ Erreur validation:', err);
      setError(err.response?.data?.message || 'Erreur lors de la validation du code');
    } finally {
      setValidatingCode(false);
    }
  };
  
  // Charger les cours disponibles
  const loadAvailableCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get(`${API}/courses`);
      const courses = res.data || [];
      setAvailableCourses(courses);
      console.log('[COURSES] ✅ Chargés:', courses.length);
    } catch (err) {
      console.error('[COURSES] ❌ Erreur:', err);
    }
    setLoadingCourses(false);
  }, []);

  // === FONCTIONS MODE PLEIN ÉCRAN (CSS - plus fiable) ===
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Écouter les changements de fullscreen (touche Escape, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Enregistrer le Service Worker au montage
  useEffect(() => {
    if (isPushSupported()) {
      registerServiceWorker().then(() => {
        setPushEnabled(isSubscribed());
      });
    }
  }, []);

  // Extraire le token de lien depuis l'URL si présent
  const getLinkTokenFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/chat\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  // === SOCKET.IO CONNEXION ET GESTION TEMPS RÉEL ===
  useEffect(() => {
    // Connexion Socket.IO quand on a une session active
    if (sessionData?.id && step === 'chat' && !socketRef.current) {
      console.log('[SOCKET.IO] 🔌 Connexion WebSocket à', SOCKET_URL);
      
      const socket = io(SOCKET_URL, {
        transports: ['websocket'], // WEBSOCKET UNIQUEMENT - Zéro polling
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 500,
        timeout: 5000,
        upgrade: false // Pas de fallback
      });
      
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('[SOCKET.IO] ✅ WebSocket connecté! Session:', sessionData.id);
        // Rejoindre la room de la session
        socket.emit('join_session', {
          session_id: sessionData.id,
          participant_id: participantId
        });
      });
      
      socket.on('joined_session', (data) => {
        console.log('[SOCKET.IO] 🎉 Session rejointe:', data);
      });
      
      // Gestion erreur WebSocket
      socket.on('connect_error', (error) => {
        console.error('[SOCKET.IO] ❌ Erreur WebSocket:', error.message);
        // Tenter une reconnexion avec polling en dernier recours
        if (socket.io.opts.transports[0] === 'websocket') {
          console.log('[SOCKET.IO] 🔄 Tentative fallback polling...');
          socket.io.opts.transports = ['polling', 'websocket'];
          socket.connect();
        }
      });
      
      // Écouter les nouveaux messages en temps réel
      socket.on('message_received', (messageData) => {
        console.log('[SOCKET.IO] 📩 Message reçu:', messageData);
        
        // Quand un message est reçu, cacher l'indicateur de saisie
        setTypingUser(null);
        
        // Ne pas dupliquer nos propres messages (déjà ajoutés localement)
        if (messageData.senderId === participantId && messageData.type === 'user') {
          return;
        }
        
        // Ajouter le message à la liste
        setMessages(prev => {
          // Éviter les doublons
          const exists = prev.some(m => m.id === messageData.id);
          if (exists) return prev;
          
          return [...prev, {
            id: messageData.id,
            type: messageData.type,
            text: messageData.text,
            sender: messageData.sender,
            senderId: messageData.senderId
          }];
        });
        
        // Notification sonore si message d'un autre
        if (messageData.senderId !== participantId) {
          playNotificationSound(messageData.type === 'coach' ? 'coach' : 'message');
        }
      });
      
      // === ÉCOUTER L'INDICATEUR DE SAISIE ===
      socket.on('user_typing', (data) => {
        console.log('[SOCKET.IO] ⌨️ Typing event:', data);
        
        if (data.is_typing) {
          // Afficher l'indicateur
          setTypingUser({
            name: data.user_name,
            type: data.user_type
          });
          
          // Cacher automatiquement après 3 secondes d'inactivité
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        } else {
          // Cacher l'indicateur
          setTypingUser(null);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('[SOCKET.IO] ❌ Déconnecté');
      });
      
      socket.on('connect_error', (error) => {
        console.warn('[SOCKET.IO] ⚠️ Erreur connexion:', error.message);
      });
    }
    
    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log('[SOCKET.IO] 🔌 Déconnexion...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [sessionData?.id, step, participantId]);

  // === MESSAGERIE PRIVÉE (MP) - FENÊTRE FLOTTANTE ===
  const openPrivateChat = async (targetId, targetName) => {
    if (!participantId || !targetId || targetId === participantId) return;
    
    setIsLoading(true);
    try {
      // Créer ou récupérer la conversation privée
      const response = await axios.post(`${API}/private/conversations`, {
        participant_1_id: participantId,
        participant_1_name: leadData.firstName,
        participant_2_id: targetId,
        participant_2_name: targetName
      });
      
      const conversation = response.data;
      
      // Charger les messages existants
      const messagesRes = await axios.get(`${API}/private/messages/${conversation.id}`);
      
      // Ouvrir la fenêtre flottante MP
      setActivePrivateChat({
        id: conversation.id,
        recipientId: targetId,
        recipientName: targetName
      });
      setPrivateMessages(messagesRes.data.map(m => ({
        id: m.id,
        text: m.content,
        sender: m.sender_name,
        senderId: m.sender_id,
        isMine: m.sender_id === participantId,
        createdAt: m.created_at
      })));
      
      // === SOCKET.IO: Rejoindre la room de conversation privée ===
      if (socketRef.current) {
        socketRef.current.emit('join_private_conversation', {
          conversation_id: conversation.id,
          participant_id: participantId
        });
      }
      
      console.log(`💬 MP ouverte avec ${targetName}`);
      
    } catch (err) {
      console.error('Erreur ouverture MP:', err);
      alert('Erreur lors de l\'ouverture de la conversation privée');
    } finally {
      setIsLoading(false);
    }
  };

  // Fermer la fenêtre MP
  const closePrivateChat = () => {
    // === SOCKET.IO: Quitter la room de conversation privée ===
    if (socketRef.current && activePrivateChat?.id) {
      socketRef.current.emit('leave_private_conversation', {
        conversation_id: activePrivateChat.id
      });
    }
    setActivePrivateChat(null);
    setPrivateMessages([]);
    setPrivateInput('');
  };

  // === SOCKET.IO pour les MP - Remplace le polling ===
  useEffect(() => {
    if (!socketRef.current) return;
    
    const socket = socketRef.current;
    
    // Handler principal pour les messages privés
    const handlePrivateMessage = (data) => {
      console.log('[SOCKET.IO] 📩 Message privé reçu:', data);
      
      // Ne pas compter nos propres messages
      if (data.senderId === participantId) return;
      
      // Vérifier si c'est pour notre conversation active
      if (activePrivateChat && data.conversation_id === activePrivateChat.id) {
        // Message dans la conversation ouverte -> ajouter à la liste
        setPrivateMessages(prev => {
          const exists = prev.some(m => m.id === data.id);
          if (exists) return prev;
          
          return [...prev, {
            id: data.id,
            text: data.text,
            sender: data.sender,
            senderId: data.senderId,
            isMine: false,
            createdAt: data.created_at
          }];
        });
        
        // Son de notification (fenêtre déjà ouverte)
        playNotificationSound('message');
        
        // Marquer comme lu
        axios.put(`${API}/private/messages/read/${activePrivateChat.id}?reader_id=${participantId}`).catch(() => {});
      } else {
        // Message pour une autre conversation ou pas de conversation ouverte
        // -> NOTIFICATION COMPLÈTE (son + titre clignotant + badge)
        setUnreadPrivateCount(prev => prev + 1);
        notifyPrivateMessage(data.sender || 'Quelqu\'un');
      }
    };
    
    socket.on('private_message_received', handlePrivateMessage);
    
    return () => {
      socket.off('private_message_received', handlePrivateMessage);
    };
  }, [activePrivateChat, participantId]);

  // === SOCKET.IO pour le TYPING INDICATOR dans les DM ===
  useEffect(() => {
    if (!socketRef.current) return;
    
    const socket = socketRef.current;
    
    const handleDmTyping = (data) => {
      // Ignorer nos propres événements de frappe
      if (data.user_id === participantId) return;
      
      // Vérifier si c'est pour notre conversation active
      if (activePrivateChat && data.conversation_id === activePrivateChat.id) {
        if (data.is_typing) {
          setDmTypingUser({ name: data.user_name });
          
          // Auto-hide après 3 secondes
          if (dmTypingTimeoutRef.current) {
            clearTimeout(dmTypingTimeoutRef.current);
          }
          dmTypingTimeoutRef.current = setTimeout(() => {
            setDmTypingUser(null);
          }, 3000);
        } else {
          setDmTypingUser(null);
        }
      }
    };
    
    socket.on('dm_typing', handleDmTyping);
    
    return () => {
      socket.off('dm_typing', handleDmTyping);
      if (dmTypingTimeoutRef.current) {
        clearTimeout(dmTypingTimeoutRef.current);
      }
    };
  }, [activePrivateChat, participantId]);

  // === SOCKET.IO pour la mise à jour d'AVATAR en temps réel ===
  useEffect(() => {
    if (!socketRef.current) return;
    
    const socket = socketRef.current;
    
    const handleAvatarChanged = (data) => {
      console.log('[SOCKET.IO] 📷 Avatar mis à jour:', data);
      
      // Mettre à jour les messages privés si l'avatar de l'interlocuteur change
      if (activePrivateChat && data.user_id !== participantId) {
        setPrivateMessages(prev => prev.map(msg => {
          if (msg.senderId === data.user_id) {
            return { ...msg, senderPhotoUrl: data.photo_url };
          }
          return msg;
        }));
      }
    };
    
    socket.on('user_avatar_changed', handleAvatarChanged);
    
    return () => {
      socket.off('user_avatar_changed', handleAvatarChanged);
    };
  }, [activePrivateChat, participantId]);

  // === DÉMARRER UNE DISCUSSION PRIVÉE (COMPAT ANCIEN CODE) ===
  const startPrivateChat = async (targetId, targetName) => {
    // Utilise la nouvelle fonction openPrivateChat avec fenêtre flottante
    // Réinitialiser le compteur et arrêter le clignotement quand on ouvre une conversation
    setUnreadPrivateCount(0);
    stopTitleFlash();
    openPrivateChat(targetId, targetName);
  };

  // Insérer un emoji dans l'input (utilisé par EmojiPicker)
  const insertEmoji = (emojiName) => {
    // Si c'est un emoji natif (🔥), l'ajouter directement
    if (emojiName.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(emojiName)) {
      setInputMessage(prev => prev + emojiName);
    } else {
      // Sinon c'est un emoji personnalisé -> tag
      const emojiTag = `[emoji:${emojiName}]`;
      setInputMessage(prev => prev + emojiTag);
    }
    setShowEmojiPicker(false);
  };

  // === MÉMORISATION CLIENT: Charger la session et configurer le chat ===
  useEffect(() => {
    const savedSession = localStorage.getItem(CHAT_SESSION_KEY);

    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setSessionData(session);
        setIsCommunityMode(session.mode === 'community');
      } catch (err) {
        localStorage.removeItem(CHAT_SESSION_KEY);
      }
    }

    // Si on arrive via un lien partagé, ouvrir automatiquement le widget
    const linkToken = getLinkTokenFromUrl();
    if (linkToken) {
      setIsOpen(true);
    }
  }, []);
  
  // === FERMER LE MENU UTILISATEUR AU CLIC EXTÉRIEUR ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.afro-share-menu')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // === MODE COACH: Charger les sessions actives ===
  const loadCoachSessions = async () => {
    try {
      const res = await axios.get(`${API}/chat/sessions`);
      // Filtrer les sessions non supprimées avec des messages récents
      const activeSessions = res.data.filter(s => !s.is_deleted);
      setCoachSessions(activeSessions);
    } catch (err) {
      console.error('Error loading coach sessions:', err);
    }
  };

  // === MODE COACH: Charger les messages d'une session ===
  const loadCoachSessionMessages = async (session) => {
    setSelectedCoachSession(session);
    try {
      const res = await axios.get(`${API}/chat/sessions/${session.id}/messages`);
      const formattedMessages = res.data.map(m => ({
        id: m.id,
        type: m.sender_type === 'user' ? 'user' : m.sender_type === 'coach' ? 'coach' : 'ai',
        text: m.content,
        sender: m.sender_name,
        senderId: m.sender_id
      }));
      setMessages(formattedMessages);
      setLastMessageCount(formattedMessages.length);
    } catch (err) {
      console.error('Error loading session messages:', err);
    }
  };

  // === MODE COACH: Envoyer une réponse ===
  const sendCoachResponse = async () => {
    if (!selectedCoachSession || !inputMessage.trim()) return;
    
    setIsLoading(true);
    try {
      await axios.post(`${API}/chat/coach-response`, {
        session_id: selectedCoachSession.id,
        message: inputMessage.trim(),
        coach_name: 'Coach'
      });
      setInputMessage('');
      // Recharger les messages
      await loadCoachSessionMessages(selectedCoachSession);
      playNotificationSound('message');
    } catch (err) {
      console.error('Error sending coach response:', err);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les sessions quand le mode coach est activé
  useEffect(() => {
    if (isCoachMode && isOpen) {
      loadCoachSessions();
      setStep('coach');
    }
  }, [isCoachMode, isOpen]);
  
  // === FERMER LES MENUS AU CLIC EXTÉRIEUR ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCoachMenu && !e.target.closest('.coach-icons-menu')) {
        setShowCoachMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCoachMenu]);

  // Scroll vers le bas des messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // === SMART ENTRY: Point d'entrée intelligent avec reconnaissance ===
  const handleSmartEntry = async (clientData, linkToken = null) => {
    try {
      const response = await axios.post(`${API}/chat/smart-entry`, {
        name: clientData.firstName,
        email: clientData.email,
        whatsapp: clientData.whatsapp,
        link_token: linkToken
      });

      const { participant, session, is_returning, chat_history, message } = response.data;

      // Sauvegarder les données
      const fullClientData = {
        ...clientData,
        participantId: participant.id
      };
      // Sauvegarder avec les deux clés pour compatibilité
      localStorage.setItem(CHAT_CLIENT_KEY, JSON.stringify(fullClientData));
      localStorage.setItem(AFROBOOST_IDENTITY_KEY, JSON.stringify({
        ...fullClientData,
        savedAt: new Date().toISOString()
      }));
      localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));

      setParticipantId(participant.id);
      setSessionData(session);
      setIsReturningClient(is_returning);
      setIsCommunityMode(session.mode === 'community');
      
      // === MISE À JOUR DU MODE COACH APRÈS CONNEXION ===
      const isCoach = clientData.email?.toLowerCase() === COACH_EMAIL;
      setIsCoachMode(isCoach);
      console.log(`[AUTH] Email: ${clientData.email}, isCoach: ${isCoach}`);

      // Restaurer l'historique si utilisateur reconnu
      if (is_returning && chat_history && chat_history.length > 0) {
        const restoredMessages = chat_history.map(msg => ({
          id: msg.id,
          type: msg.sender_type === 'user' ? 'user' : msg.sender_type === 'coach' ? 'coach' : 'ai',
          text: msg.content,
          sender: msg.sender_name
        }));
        setMessages([
          { type: 'ai', text: message },
          ...restoredMessages
        ]);
        setLastMessageCount(chat_history.length + 1);
      } else {
        setMessages([{
          type: 'ai',
          text: message
        }]);
        setLastMessageCount(1);
      }

      setStep('chat');
      return { success: true, session, participant };

    } catch (err) {
      console.error('Smart entry error:', err);
      // Fallback: continuer sans le backend amélioré
      setMessages([{
        type: 'ai',
        text: `Enchanté ${clientData.firstName} ! 👋 Comment puis-je t'aider ?`
      }]);
      setStep('chat');
      return { success: false };
    }
  };

  // Valider et enregistrer le lead
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!leadData.firstName.trim()) {
      setError('Le prénom est requis');
      return;
    }
    if (!leadData.whatsapp.trim()) {
      setError('Le numéro WhatsApp est requis');
      return;
    }
    if (!leadData.email.trim() || !leadData.email.includes('@')) {
      setError('Un email valide est requis');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const clientData = {
        firstName: leadData.firstName.trim(),
        whatsapp: leadData.whatsapp.trim(),
        email: leadData.email.trim().toLowerCase()
      };

      // Utiliser le smart entry pour la reconnaissance automatique
      const linkToken = getLinkTokenFromUrl();
      await handleSmartEntry(clientData, linkToken);

      // Backup: créer aussi un lead (ancien système)
      try {
        await axios.post(`${API}/leads`, {
          firstName: clientData.firstName,
          whatsapp: clientData.whatsapp,
          email: clientData.email,
          source: linkToken ? `link_${linkToken}` : 'widget_ia'
        });
      } catch (leadErr) {
        console.warn('Lead creation failed, continuing anyway:', leadErr);
      }
      
    } catch (err) {
      console.error('Error:', err);
      // Fallback
      localStorage.setItem(CHAT_CLIENT_KEY, JSON.stringify({
        firstName: leadData.firstName.trim(),
        whatsapp: leadData.whatsapp.trim(),
        email: leadData.email.trim().toLowerCase()
      }));
      
      setStep('chat');
      setMessages([{
        type: 'ai',
        text: `Enchanté ${leadData.firstName} ! 👋 Comment puis-je t'aider ?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // === CLIENT RECONNU: Ouvrir directement le chat ===
  const handleReturningClientStart = async () => {
    setIsLoading(true);
    
    try {
      const linkToken = getLinkTokenFromUrl();
      await handleSmartEntry(leadData, linkToken);
    } catch (err) {
      console.error('Error:', err);
      setStep('chat');
      setMessages([{
        type: 'ai',
        text: `Bonjour ${leadData.firstName} ! 😊 Comment puis-je t'aider ?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // === Ouvrir le widget ===
  const handleOpenWidget = () => {
    setIsOpen(true);
    
    // Si client reconnu et pas encore en mode chat, ouvrir directement le chat
    if (isReturningClient && step === 'form') {
      handleReturningClientStart();
    }
  };

  // Envoyer un message au chat avec contexte de session
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    // Ajouter le senderId pour identifier les messages de l'utilisateur actuel
    setMessages(prev => [...prev, { type: 'user', text: userMessage, senderId: participantId }]);
    setLastMessageCount(prev => prev + 1);
    setMessageCount(prev => prev + 1);
    setIsLoading(true);
    
    try {
      // Si on a une session active, utiliser l'API améliorée
      if (sessionData && participantId) {
        const response = await axios.post(`${API}/chat/ai-response`, {
          session_id: sessionData.id,
          participant_id: participantId,
          message: userMessage
        });
        
        if (response.data.response) {
          // Jouer un son pour la réponse
          playNotificationSound('message');
          
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: response.data.response
          }]);
          setLastMessageCount(prev => prev + 1);
        } else if (!response.data.ai_active) {
          // IA désactivée - message en attente
          setMessages(prev => [...prev, { 
            type: 'ai', 
            text: isCommunityMode 
              ? "Message envoyé au groupe ! 👥 Les autres participants verront votre message."
              : "Message reçu ! Le coach vous répondra bientôt. 💬"
          }]);
        }
      } else {
        // Fallback: ancien système - maintenant avec CRM auto-save
        const response = await axios.post(`${API}/chat`, {
          message: userMessage,
          firstName: leadData.firstName,
          email: leadData.email || '',       // Pour CRM auto-save
          whatsapp: leadData.whatsapp || '', // Pour CRM auto-save
          source: 'chat_ia',                 // Source pour tracking
          leadId: ''
        });
        
        playNotificationSound('message');
        
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: response.data.response || "Désolé, je n'ai pas pu traiter votre message."
        }]);
      }
      
      // === PROMPT NOTIFICATIONS PUSH après le premier message ===
      if (messageCount === 1 && participantId && !pushEnabled) {
        // Attendre un peu avant de demander (non intrusif)
        setTimeout(async () => {
          const result = await promptForNotifications(participantId);
          if (result.subscribed) {
            setPushEnabled(true);
            console.log('✅ Push notifications enabled');
          }
        }, 2000);
      }
      
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: "Désolé, une erreur s'est produite. Veuillez réessayer."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // === SUPPRIMER L'HISTORIQUE - ROUTE SÉCURISÉE ADMIN ===
  const handleDeleteHistory = async () => {
    if (!sessionData?.id) return;
    
    const confirm = window.confirm('Êtes-vous sûr de vouloir supprimer votre historique de conversation ?');
    if (!confirm) return;
    
    try {
      // Utiliser la route sécurisée qui vérifie l'email
      const response = await axios.post(`${API}/admin/delete-history`, {
        session_id: sessionData.id,
        email: leadData.email || ''
      });
      
      if (response.data.success) {
        // Vider l'affichage local
        setMessages([{
          type: 'ai',
          text: '🗑️ Historique supprimé. Comment puis-je vous aider ?'
        }]);
        setLastMessageCount(1);
        setShowMenu(false);
        console.log('[ADMIN] ✅ Historique supprimé:', response.data.deleted_count, 'messages');
      }
      
    } catch (err) {
      console.error('[SECURITY] ❌ Delete history error:', err.response?.data?.detail || err.message);
      if (err.response?.status === 403) {
        alert('⛔ Accès refusé. Seul le coach peut supprimer l\'historique.');
      } else {
        alert('Erreur lors de la suppression de l\'historique');
      }
    }
  };

  // Réinitialiser le widget
  const handleClose = () => {
    setIsOpen(false);
    setShowMenu(false);
  };

  // === CHANGER D'IDENTITÉ - ROUTE SÉCURISÉE ADMIN ===
  const handleChangeIdentity = async () => {
    try {
      // Vérifier côté serveur (optionnel mais recommandé)
      await axios.post(`${API}/admin/change-identity`, {
        participant_id: participantId,
        email: leadData.email || ''
      });
      
      // Réinitialiser localement (y compris le profil abonné)
      localStorage.removeItem(CHAT_CLIENT_KEY);
      localStorage.removeItem(CHAT_SESSION_KEY);
      localStorage.removeItem(AFROBOOST_IDENTITY_KEY);
      localStorage.removeItem(AFROBOOST_PROFILE_KEY);
      localStorage.removeItem('subscriber_data');
      setLeadData({ firstName: '', whatsapp: '', email: '' });
      setIsReturningClient(false);
      setStep('form');
      setMessages([]);
      setSessionData(null);
      setParticipantId(null);
      setShowMenu(false);
      setLastMessageCount(0);
      setIsCoachMode(false);
      setAfroboostProfile(null);
      setSubscriberData(null);
      setIsFullscreen(false);
      setShowSubscriberForm(false);
      setSubscriberFormData({ name: '', whatsapp: '', email: '', code: '' });
      console.log('[ADMIN] ✅ Identité et profil abonné réinitialisés');
      
    } catch (err) {
      console.error('[SECURITY] ❌ Change identity error:', err.response?.data?.detail || err.message);
      if (err.response?.status === 403) {
        alert('⛔ Accès refusé. Seul le coach peut changer l\'identité.');
      } else {
        // En cas d'erreur réseau, on fait quand même le reset local (coach mode)
        localStorage.removeItem(CHAT_CLIENT_KEY);
        localStorage.removeItem(CHAT_SESSION_KEY);
        localStorage.removeItem(AFROBOOST_IDENTITY_KEY);
        localStorage.removeItem(AFROBOOST_PROFILE_KEY);
        localStorage.removeItem('subscriber_data');
        setLeadData({ firstName: '', whatsapp: '', email: '' });
        setStep('form');
        setMessages([]);
        setSessionData(null);
        setParticipantId(null);
        setShowMenu(false);
        setIsCoachMode(false);
        setAfroboostProfile(null);
        setSubscriberData(null);
        setIsFullscreen(false);
      }
    }
  };

  // === FONCTION POUR ÉMETTRE L'ÉVÉNEMENT TYPING ===
  const emitTyping = (isTyping) => {
    if (!socketRef.current || !sessionData?.id) return;
    
    const now = Date.now();
    // Éviter le spam (max 1 événement par seconde)
    if (isTyping && now - lastTypingEmitRef.current < 1000) return;
    lastTypingEmitRef.current = now;
    
    const eventName = isTyping ? 'typing_start' : 'typing_stop';
    socketRef.current.emit(eventName, {
      session_id: sessionData.id,
      user_name: isCoachMode ? '💪 Coach Bassi' : leadData.firstName || 'Utilisateur',
      user_type: isCoachMode ? 'coach' : 'user'
    });
  };

  // === FONCTION POUR ÉMETTRE L'ÉVÉNEMENT TYPING DANS LES DM ===
  const emitDmTyping = (isTyping) => {
    if (!socketRef.current || !activePrivateChat?.id) return;
    
    const now = Date.now();
    // Éviter le spam (max 1 événement par seconde)
    if (isTyping && now - lastDmTypingEmitRef.current < 1000) return;
    lastDmTypingEmitRef.current = now;
    
    try {
      const eventName = isTyping ? 'dm_typing_start' : 'dm_typing_stop';
      socketRef.current.emit(eventName, {
        conversation_id: activePrivateChat.id,
        user_id: participantId,
        user_name: afroboostProfile?.name || leadData?.firstName || 'Utilisateur'
      });
    } catch (e) {
      // NULL-SAFE: Ne pas bloquer le chat si l'événement échoue
      console.warn('[DM-TYPING] ⚠️ Erreur émission:', e.message);
    }
  };

  // === FONCTION POUR ÉMETTRE LA MISE À JOUR D'AVATAR ===
  const emitAvatarUpdate = (photoUrl) => {
    if (!socketRef.current || !participantId) return;
    
    try {
      socketRef.current.emit('avatar_updated', {
        user_id: participantId,
        user_name: afroboostProfile?.name || leadData?.firstName || 'Utilisateur',
        photo_url: photoUrl
      });
      console.log('[AVATAR] 📷 Diffusion mise à jour avatar');
    } catch (e) {
      console.warn('[AVATAR] ⚠️ Erreur diffusion avatar:', e.message);
    }
  };

  // Handler pour l'input avec émission typing
  const handleInputChangeWithTyping = (e) => {
    const value = e.target.value;
    setInputMessage(value);
    
    // Émettre l'événement typing
    if (value.length > 0) {
      emitTyping(true);
    }
  };

  // Arrêter l'indicateur typing quand on perd le focus ou envoie
  const handleInputBlur = () => {
    emitTyping(false);
  };

  return (
    <>
      {/* Style pour les liens dans les messages et responsive mobile */}
      <style>{`
        .chat-link {
          color: #a78bfa;
          text-decoration: underline;
          word-break: break-all;
        }
        .chat-link:hover {
          color: #c4b5fd;
        }
        
        /* Emoji inline dans les messages */
        .chat-emoji {
          width: 20px;
          height: 20px;
          vertical-align: middle;
          display: inline-block;
          margin: 0 2px;
        }
        
        /* Animation pastille notification MP */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
        
        /* Animation points typing DM (minimaliste) */
        @keyframes dmTypingDot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Chat widget responsive - plus grand sur mobile */
        @media (max-width: 640px) {
          .chat-widget-window {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 85vh !important;
            max-height: 85vh !important;
            border-radius: 16px 16px 0 0 !important;
          }
          .chat-widget-button {
            bottom: 20px !important;
            right: 16px !important;
            width: 60px !important;
            height: 60px !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .chat-widget-window {
            width: 400px !important;
            height: 70vh !important;
            max-height: 70vh !important;
          }
        }
      `}</style>

      {/* Bouton flottant WhatsApp */}
      {!isOpen && (
        <button
          onClick={handleOpenWidget}
          className="chat-widget-button fixed z-50 shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            bottom: '80px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
            position: 'relative'
          }}
          data-testid="chat-widget-button"
        >
          <WhatsAppIcon />
          
          {/* Badge MP non lus (pastille rouge) */}
          {unreadPrivateCount > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                minWidth: '22px',
                height: '22px',
                borderRadius: '11px',
                background: '#ef4444',
                border: '2px solid #0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#fff',
                padding: '0 4px',
                animation: 'pulse 1.5s infinite'
              }}
              data-testid="unread-mp-badge"
            >
              {unreadPrivateCount > 99 ? '99+' : unreadPrivateCount}
            </span>
          )}
          
          {/* Badge si client reconnu (affiché seulement si pas de MP non lus) */}
          {isReturningClient && unreadPrivateCount === 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#d91cd2',
                border: '2px solid #0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff'
              }}
            >
              ✓
            </span>
          )}
        </button>
      )}

      {/* Fenêtre de chat - Responsive */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="chat-widget-window fixed z-50 shadow-2xl"
          style={{
            bottom: isFullscreen ? '0' : '80px',
            right: isFullscreen ? '0' : '20px',
            left: isFullscreen ? '0' : 'auto',
            top: isFullscreen ? '0' : 'auto',
            width: isFullscreen ? '100vw' : '380px',
            maxWidth: isFullscreen ? '100vw' : 'calc(100vw - 40px)',
            height: isFullscreen ? '100vh' : '70vh',
            maxHeight: isFullscreen ? '100vh' : '85vh',
            minHeight: isFullscreen ? '100vh' : '400px',
            borderRadius: isFullscreen ? '0' : '16px',
            background: '#0a0a0a',
            border: isFullscreen ? 'none' : '1px solid rgba(217, 28, 210, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          data-testid="chat-widget-window"
        >
          {/* Header */}
          <div 
            style={{
              background: isCommunityMode 
                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' 
                : 'linear-gradient(135deg, #25D366, #128C7E)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCommunityMode ? <GroupIcon /> : <WhatsAppIcon />}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {isCommunityMode ? 'Communauté Afroboost' : 'Afroboost'}
                </div>
                <div className="text-white text-xs" style={{ opacity: 0.8 }}>
                  {/* Afficher le statut abonné si profil validé */}
                  {afroboostProfile?.code && step === 'chat'
                    ? `💎 Abonné • ${afroboostProfile.name}`
                    : isReturningClient && step === 'chat' 
                      ? `👋 ${leadData.firstName}` 
                      : isCommunityMode 
                        ? '👥 Chat Groupe'
                        : sessionData?.is_ai_active === false 
                          ? '👤 Mode Coach'
                          : '💪 Coach Bassi'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Bouton Plein Écran - TOUJOURS visible en mode abonné */}
              {step === 'chat' && (
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Quitter le plein écran" : "Mode plein écran"}
                  style={{
                    background: afroboostProfile?.code 
                      ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(99, 102, 241, 0.4))'
                      : 'rgba(255,255,255,0.2)',
                    border: afroboostProfile?.code ? '1px solid rgba(147, 51, 234, 0.5)' : 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                  data-testid="fullscreen-btn"
                >
                  {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                </button>
              )}
              
              {/* === ICÔNES MINIMALISTES (Partage + Menu) === */}
              {step === 'chat' && (
                <div className="relative afro-share-menu" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Icône Partager (filaire fine) */}
                  <button
                    onClick={handleShareLink}
                    title={linkCopied ? "Lien copié !" : "Partager"}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: linkCopied ? 1 : 0.6,
                      transition: 'opacity 0.2s ease'
                    }}
                    data-testid="share-link-btn"
                  >
                    {linkCopied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                    )}
                  </button>
                  
                  {/* Icône Menu (⋮) filaire fine */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.6,
                      transition: 'opacity 0.2s ease'
                    }}
                    data-testid="user-menu-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </button>
                  
                  {/* Menu déroulant utilisateur */}
                  {showUserMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '35px',
                        right: '0',
                        background: '#1a1a1a',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        minWidth: '180px',
                        zIndex: 100,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                      }}
                    >
                      {/* Upload Photo de profil */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-white/10"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handlePhotoUpload(e);
                            setShowUserMenu(false);
                          }}
                          style={{ display: 'none' }}
                        />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        {uploadingPhoto ? 'Upload...' : 'Photo de profil'}
                        {profilePhoto && (
                          <img 
                            src={profilePhoto} 
                            alt="" 
                            style={{ width: '20px', height: '20px', borderRadius: '50%', marginLeft: 'auto' }}
                          />
                        )}
                      </label>
                      
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                      
                      {/* Mode Visiteur - seulement si abonné */}
                      {afroboostProfile?.code && (
                        <>
                          <button
                            onClick={() => { handleVisitorMode(); setShowUserMenu(false); }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#fff',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                            className="hover:bg-white/10"
                            data-testid="visitor-mode-btn"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <polyline points="4 14 10 14 10 20"></polyline>
                              <polyline points="20 10 14 10 14 4"></polyline>
                              <line x1="14" y1="10" x2="21" y2="3"></line>
                              <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            Mode Visiteur
                          </button>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                        </>
                      )}
                      
                      {/* Rafraîchir */}
                      <button
                        onClick={() => { window.location.reload(); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontSize: '12px',
                          color: '#fff',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                        className="hover:bg-white/10"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        </svg>
                        Rafraîchir
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Menu burger - VISIBLE UNIQUEMENT POUR LE COACH/ADMIN */}
              {(step === 'chat' || step === 'coach') && isCoachMode && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '16px'
                    }}
                    data-testid="chat-menu-btn"
                  >
                    ⋮
                  </button>
                  
                  {/* Menu déroulant - ADMIN ONLY */}
                  {showMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '0',
                        background: '#1a1a1a',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        minWidth: '180px',
                        zIndex: 100
                      }}
                    >
                      <button
                        onClick={handleDeleteHistory}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                        style={{ color: '#ef4444', border: 'none', background: 'none' }}
                        data-testid="delete-history-btn"
                      >
                        <TrashIcon /> Supprimer l'historique
                      </button>
                      <button
                        onClick={handleChangeIdentity}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                        style={{ color: '#fff', border: 'none', background: 'none' }}
                        data-testid="change-identity-btn"
                      >
                        🔄 Changer d'identité
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                data-testid="chat-close-btn"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Contenu avec scroll */}
          <div style={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0
          }}>
            
            {/* Formulaire de capture avec scroll */}
            {step === 'form' && (
              <div 
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* === FORMULAIRE ABONNÉ (4 champs avec code promo) === */}
                {showSubscriberForm ? (
                  <form 
                    onSubmit={handleSubscriberFormSubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      minHeight: 'min-content'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '28px' }}>💎</span>
                      <p className="text-white text-sm mt-2">
                        Identifiez-vous comme abonné
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>
                        Accès à vos avantages et réservations rapides
                      </p>
                    </div>
                    
                    {error && (
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.2)', 
                        color: '#ef4444', 
                        padding: '8px 12px', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Nom complet *</label>
                      <input
                        type="text"
                        value={subscriberFormData.name}
                        onChange={(e) => setSubscriberFormData({ ...subscriberFormData, name: e.target.value })}
                        placeholder="Votre nom complet"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="subscriber-name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Numéro WhatsApp *</label>
                      <input
                        type="tel"
                        value={subscriberFormData.whatsapp}
                        onChange={(e) => setSubscriberFormData({ ...subscriberFormData, whatsapp: e.target.value })}
                        placeholder="+41 79 123 45 67"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="subscriber-whatsapp"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Email *</label>
                      <input
                        type="email"
                        value={subscriberFormData.email}
                        onChange={(e) => setSubscriberFormData({ ...subscriberFormData, email: e.target.value })}
                        placeholder="votre@email.com"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="subscriber-email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Code Promo *</label>
                      <input
                        type="text"
                        value={subscriberFormData.code}
                        onChange={(e) => setSubscriberFormData({ ...subscriberFormData, code: e.target.value.toUpperCase() })}
                        placeholder="Votre code abonné"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(147, 51, 234, 0.2)',
                          border: '1px solid rgba(147, 51, 234, 0.4)',
                          color: '#fff',
                          outline: 'none',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          letterSpacing: '1px'
                        }}
                        data-testid="subscriber-code"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={validatingCode}
                      className="py-3 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                        color: '#fff',
                        border: 'none',
                        cursor: validatingCode ? 'wait' : 'pointer',
                        opacity: validatingCode ? 0.7 : 1,
                        marginTop: '8px'
                      }}
                      data-testid="subscriber-submit"
                    >
                      {validatingCode ? '⏳ Validation...' : '💎 Valider mon abonnement'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { setShowSubscriberForm(false); setError(''); }}
                      className="py-2 text-sm"
                      style={{
                        background: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      data-testid="back-to-visitor"
                    >
                      ← Retour au chat visiteur
                    </button>
                  </form>
                ) : (
                  /* === FORMULAIRE VISITEUR CLASSIQUE (3 champs) === */
                  <form 
                    onSubmit={handleSubmitLead}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      minHeight: 'min-content'
                    }}
                  >
                    <p className="text-white text-sm text-center mb-2">
                      👋 Avant de commencer, présentez-vous !
                    </p>
                    
                    {error && (
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.2)', 
                        color: '#ef4444', 
                        padding: '8px 12px', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Prénom *</label>
                      <input
                        type="text"
                        value={leadData.firstName}
                        onChange={(e) => setLeadData({ ...leadData, firstName: e.target.value })}
                        placeholder="Votre prénom"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="lead-firstname"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Numéro WhatsApp *</label>
                      <input
                        type="tel"
                        value={leadData.whatsapp}
                        onChange={(e) => setLeadData({ ...leadData, whatsapp: e.target.value })}
                        placeholder="+41 79 123 45 67"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="lead-whatsapp"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-xs mb-1" style={{ opacity: 0.7 }}>Email *</label>
                      <input
                        type="email"
                        value={leadData.email}
                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                        placeholder="votre@email.com"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          outline: 'none'
                        }}
                        data-testid="lead-email"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-3 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        cursor: isLoading ? 'wait' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        marginTop: '8px'
                      }}
                      data-testid="lead-submit"
                    >
                      {isLoading ? 'Chargement...' : 'Commencer le chat 💬'}
                    </button>
                    
                    {/* === SÉPARATEUR === */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      margin: '8px 0'
                    }}>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>ou</span>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    
                    {/* === BOUTON ABONNÉ === */}
                    <button
                      type="button"
                      onClick={() => { setShowSubscriberForm(true); setError(''); }}
                      className="py-3 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(99, 102, 241, 0.3))',
                        color: '#a855f7',
                        border: '1px solid rgba(147, 51, 234, 0.4)',
                        cursor: 'pointer'
                      }}
                      data-testid="subscriber-btn"
                    >
                      💎 S'identifier comme abonné
                    </button>
                    
                    <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                      Vos données sont protégées et utilisées uniquement pour vous contacter.
                    </p>
                  </form>
                )}
              </div>
            )}

            {/* === MODE COACH: Interface de gestion des conversations === */}
            {step === 'coach' && isCoachMode && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Header Coach MINIMALISTE - Icônes uniquement */}
                <div style={{ 
                  background: 'rgba(217, 28, 210, 0.2)', 
                  padding: '8px 16px', 
                  borderBottom: '1px solid rgba(217, 28, 210, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#d91cd2', fontSize: '12px', fontWeight: 'bold' }}>
                    💪 Mode Coach
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="coach-icons-menu">
                    {/* Icône Partage (SVG minimaliste) */}
                    <button
                      onClick={handleShareLink}
                      title={linkCopied ? "Lien copié !" : "Partager"}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: linkCopied ? 1 : 0.7,
                        transition: 'opacity 0.2s ease'
                      }}
                      data-testid="coach-chat-share"
                    >
                      {linkCopied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      )}
                    </button>
                    
                    {/* Icône Menu (⋮) avec badge notifications */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowCoachMenu(!showCoachMenu)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7,
                          transition: 'opacity 0.2s ease'
                        }}
                        data-testid="coach-chat-menu"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                          <circle cx="12" cy="5" r="2"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                          <circle cx="12" cy="19" r="2"></circle>
                        </svg>
                      </button>
                      
                      {/* Badge notification (point rouge) */}
                      {coachSessions.length > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          border: '1px solid rgba(0,0,0,0.3)'
                        }} />
                      )}
                      
                      {/* Menu déroulant coach */}
                      {showCoachMenu && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '30px',
                            right: '0',
                            background: '#1a1a1a',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            minWidth: '160px',
                            zIndex: 100,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                          }}
                        >
                          <button
                            onClick={async () => {
                              setShowCoachMenu(false);
                              console.log('[COACH] 🔄 Rafraîchissement...');
                              await loadCoachSessions();
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#fff',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            className="hover:bg-white/10"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="23 4 23 10 17 10"></polyline>
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Rafraîchir
                          </button>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                          <button
                            onClick={() => {
                              setShowCoachMenu(false);
                              // Nettoyer localStorage/sessionStorage
                              localStorage.removeItem('afroboost_coach_mode');
                              localStorage.removeItem('afroboost_coach_user');
                              localStorage.removeItem('afroboost_coach_tab');
                              localStorage.removeItem(AFROBOOST_IDENTITY_KEY);
                              localStorage.removeItem(CHAT_CLIENT_KEY);
                              localStorage.removeItem(CHAT_SESSION_KEY);
                              sessionStorage.clear();
                              
                              setIsCoachMode(false);
                              setStep('form');
                              setMessages([]);
                              setSessionData(null);
                              setLeadData({ firstName: '', whatsapp: '', email: '' });
                              setSelectedCoachSession(null);
                              setCoachSessions([]);
                              
                              console.log('[COACH] 🚪 Déconnexion');
                              window.location.reload();
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              fontSize: '12px',
                              color: '#ef4444',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            className="hover:bg-white/10"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Déconnexion
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Liste des sessions ou messages */}
                {!selectedCoachSession ? (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    <div style={{ color: '#fff', fontSize: '12px', marginBottom: '12px', opacity: 0.7 }}>
                      Conversations actives ({coachSessions.length})
                    </div>
                    {coachSessions.length === 0 ? (
                      <div style={{ color: '#fff', opacity: 0.5, textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                        Aucune conversation active
                      </div>
                    ) : (
                      coachSessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => loadCoachSessionMessages(session)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '10px',
                            marginBottom: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                            {session.title || `Session ${session.id.slice(0, 8)}`}
                          </div>
                          <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
                            {session.mode === 'human' ? '👤 Mode Humain' : session.mode === 'community' ? '👥 Communauté' : '🤖 IA'}
                            {' • '}
                            {new Date(session.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <>
                    {/* Header session sélectionnée */}
                    <div style={{ 
                      padding: '8px 12px', 
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => setSelectedCoachSession(null)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#d91cd2', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ← Retour
                      </button>
                      <span style={{ color: '#fff', fontSize: '12px' }}>
                        {selectedCoachSession.title || `Session ${selectedCoachSession.id.slice(0, 8)}`}
                      </span>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {messages.map((msg, idx) => (
                        <MessageBubble 
                          key={idx} 
                          msg={msg} 
                          isUser={msg.type === 'coach'}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input coach */}
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendCoachResponse()}
                        placeholder="Votre réponse..."
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          sendCoachResponse();
                        }}
                        disabled={isLoading || !inputMessage.trim()}
                        style={{
                          background: inputMessage.trim() ? 'linear-gradient(135deg, #d91cd2, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: inputMessage.trim() ? 1 : 0.5
                        }}
                        data-testid="coach-widget-send-btn"
                      >
                        <span style={{ pointerEvents: 'none' }}><SendIcon /></span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Zone de chat */}
            {step === 'chat' && (
              <>
                {/* Indicateur mode non-IA */}
                {sessionData && !sessionData.is_ai_active && (
                  <div 
                    style={{
                      background: isCommunityMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      padding: '8px 16px',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: isCommunityMode ? '#a78bfa' : '#fbbf24',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {isCommunityMode 
                      ? '👥 Mode Communauté - Plusieurs participants' 
                      : privateChatTarget
                      ? `💬 Discussion privée avec ${privateChatTarget.name}`
                      : '👤 Mode Humain - Le coach vous répondra'}
                  </div>
                )}

                <div 
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    minHeight: 0
                  }}
                >
                  {messages.map((msg, idx) => (
                    <MessageBubble 
                      key={idx} 
                      msg={msg} 
                      isUser={msg.type === 'user' && msg.senderId === participantId}
                      onParticipantClick={startPrivateChat}
                      isCommunity={isCommunityMode}
                      currentUserId={participantId}
                      profilePhotoUrl={profilePhoto}
                    />
                  ))}
                  
                  {/* === INDICATEUR DE SAISIE (Typing Indicator) === */}
                  {typingUser && (
                    <div style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                      <div
                        style={{
                          background: 'rgba(167, 139, 250, 0.2)',
                          color: '#a78bfa',
                          padding: '8px 14px',
                          borderRadius: '16px 16px 16px 4px',
                          fontSize: '12px',
                          fontStyle: 'italic',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span className="animate-pulse">💪</span>
                        <span>{typingUser.type === 'coach' ? 'Coach Bassi' : typingUser.name} est en train d'écrire...</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>.</span>
                      </div>
                    </div>
                  )}
                  
                  {isLoading && (
                    <div style={{ alignSelf: 'flex-start' }}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '10px 14px',
                          borderRadius: '16px 16px 16px 4px',
                          fontSize: '13px'
                        }}
                      >
                        <span className="animate-pulse">...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* === PANNEAU DE RÉSERVATION - SESSIONS DU COACH (ABONNÉS UNIQUEMENT) === */}
                {showReservationPanel && afroboostProfile && (
                  <div style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(147, 51, 234, 0.3)',
                    background: 'rgba(0,0,0,0.7)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ color: '#a855f7', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                        📅 {selectedCourse ? 'Confirmer la réservation' : 'Choisir un cours'}
                        <span style={{ opacity: 0.7, marginLeft: '8px' }}>({afroboostProfile?.name})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => { setShowReservationPanel(false); setSelectedCourse(null); }}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}
                      >×</button>
                    </div>
                    
                    {/* Badge code promo actif */}
                    {afroboostProfile?.code && (
                      <div style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        fontSize: '12px',
                        color: '#22c55e'
                      }}>
                        💎 Abonné • Code: <strong>{afroboostProfile.code}</strong>
                      </div>
                    )}
                    
                    {/* Chargement */}
                    {loadingCourses && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        ⏳ Chargement des sessions...
                      </div>
                    )}
                    
                    {/* Liste des cours */}
                    {!loadingCourses && !selectedCourse && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {availableCourses.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            Aucune session disponible
                          </div>
                        )}
                        {availableCourses.map(course => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(99, 102, 241, 0.3))',
                              border: '1px solid rgba(147, 51, 234, 0.4)',
                              color: '#fff',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            data-testid={`course-${course.id}`}
                          >
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{course.name || 'Session'}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', gap: '12px' }}>
                              <span>🕐 {course.time || '18:30'}</span>
                              <span>📍 {course.location || 'Genève'}</span>
                              {course.price && <span>💰 CHF {course.price}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Confirmation du cours sélectionné */}
                    {selectedCourse && (
                      <div>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'rgba(147, 51, 234, 0.2)',
                          border: '1px solid rgba(147, 51, 234, 0.4)',
                          marginBottom: '12px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#a855f7', marginBottom: '8px' }}>{selectedCourse.name}</div>
                          <div style={{ fontSize: '12px', color: '#ccc' }}>
                            🕐 {selectedCourse.time} | 📍 {selectedCourse.location || 'Genève'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => { setSelectedCourse(null); setReservationError(''); }}
                            disabled={reservationLoading}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.1)',
                              border: 'none',
                              color: '#fff',
                              cursor: reservationLoading ? 'not-allowed' : 'pointer',
                              opacity: reservationLoading ? 0.5 : 1
                            }}
                          >
                            ← Retour
                          </button>
                          <button
                            type="button"
                            disabled={reservationLoading}
                            onClick={async () => {
                              // Reset error state
                              setReservationError('');
                              setReservationLoading(true);
                              
                              // Utiliser les données du profil abonné (afroboostProfile)
                              const reservationData = {
                                userName: afroboostProfile?.name?.trim() || leadData?.firstName?.trim() || 'Abonné',
                                userEmail: (afroboostProfile?.email || leadData?.email || '').trim(),
                                userWhatsapp: (afroboostProfile?.whatsapp || leadData?.whatsapp || '').trim(),
                                userId: participantId || `guest-${Date.now()}`, // ID utilisateur requis
                                courseId: selectedCourse.id,
                                courseName: selectedCourse.name,
                                courseTime: selectedCourse.time,
                                datetime: new Date().toISOString(),
                                promoCode: (afroboostProfile?.code || '').trim().toUpperCase(),
                                source: 'chat_widget_abonne',
                                type: 'abonné',
                                offerId: selectedCourse.id,
                                offerName: selectedCourse.name,
                                price: selectedCourse.price || 0,
                                totalPrice: selectedCourse.price || 0
                              };
                              
                              // LOG pour debug
                              console.log('[RESERVATION] 📤 Envoi des données:', JSON.stringify(reservationData, null, 2));
                              
                              try {
                                const res = await axios.post(`${API}/reservations`, reservationData);
                                console.log('[RESERVATION] ✅ Réponse serveur:', res.data);
                                
                                if (res.data) {
                                  // Succès : fermer le panneau et afficher message
                                  setShowReservationPanel(false);
                                  setSelectedCourse(null);
                                  setReservationError('');
                                  
                                  // Message de confirmation dans le chat
                                  const confirmMsg = {
                                    type: 'ai',
                                    text: `✅ Réservation confirmée !\n📅 ${selectedCourse.name}\n🕐 ${selectedCourse.time}\n💎 Code: ${afroboostProfile?.code || 'N/A'}\n👤 ${reservationData.userName}`,
                                    sender: 'Coach Bassi'
                                  };
                                  setMessages(prev => [...prev, confirmMsg]);
                                }
                              } catch (err) {
                                console.error('[RESERVATION] ❌ Erreur:', err.response?.data || err.message);
                                // Afficher l'erreur dans l'UI (pas alert)
                                const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Erreur serveur, réessayez.';
                                setReservationError(errorMsg);
                              } finally {
                                // TOUJOURS réactiver le bouton
                                setReservationLoading(false);
                              }
                            }}
                            style={{
                              flex: 2,
                              padding: '10px',
                              borderRadius: '8px',
                              background: reservationLoading 
                                ? 'rgba(34, 197, 94, 0.5)' 
                                : 'linear-gradient(135deg, #22c55e, #16a34a)',
                              border: 'none',
                              color: '#fff',
                              fontWeight: '600',
                              cursor: reservationLoading ? 'wait' : 'pointer',
                              opacity: reservationLoading ? 0.7 : 1
                            }}
                            data-testid="confirm-reservation-btn"
                          >
                            {reservationLoading ? '⏳ Envoi en cours...' : '✅ Confirmer'}
                          </button>
                        </div>
                        
                        {/* Message d'erreur */}
                        {reservationError && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#ef4444',
                            fontSize: '12px',
                            textAlign: 'center'
                          }}>
                            ❌ {reservationError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* === BOUTON RÉACTIVATION MODE ABONNÉ (Visible en mode visiteur avec profil) === */}
                {!isFullscreen && isVisitorMode && afroboostProfile?.code && step === 'chat' && (
                  <div 
                    style={{
                      padding: '8px 12px',
                      borderTop: '1px solid rgba(147, 51, 234, 0.3)',
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(99, 102, 241, 0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <button
                      onClick={handleReactivateSubscriber}
                      style={{
                        background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 10px rgba(147, 51, 234, 0.3)'
                      }}
                      data-testid="reactivate-subscriber-btn"
                    >
                      💎 Repasser en mode Réservation
                    </button>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                      ({afroboostProfile.name})
                    </span>
                  </div>
                )}
                
                {/* Input message */}
                <div 
                  style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                >
                  {/* === SÉLECTEUR D'EMOJIS (Composant externe) === */}
                  <EmojiPicker 
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onSelect={insertEmoji}
                    position="bottom"
                  />
                  
                  {/* Bouton Emoji */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: showEmojiPicker ? '#9333ea' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '18px'
                    }}
                    data-testid="emoji-btn"
                  >
                    😊
                  </button>
                  
                  {/* Icône Calendrier (Réservation) - UNIQUEMENT visible pour abonnés avec code promo */}
                  {afroboostProfile?.code && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!showReservationPanel) {
                          loadAvailableCourses();
                        }
                        setShowReservationPanel(!showReservationPanel);
                        setSelectedCourse(null);
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: showReservationPanel ? '#9333ea' : 'rgba(147, 51, 234, 0.3)',
                        border: '1px solid rgba(147, 51, 234, 0.5)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Réserver un cours (Abonné)"
                      data-testid="calendar-btn"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showReservationPanel ? '#fff' : '#a855f7'} strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </button>
                  )}
                  
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChangeWithTyping}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        emitTyping(false); // Arrêter typing avant d'envoyer
                        handleSendMessage();
                      }
                    }}
                    onBlur={handleInputBlur}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-3 py-2 rounded-full text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      outline: 'none'
                    }}
                    data-testid="chat-input"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }}
                    disabled={isLoading || !inputMessage.trim()}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#25D366',
                      border: 'none',
                      cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isLoading || !inputMessage.trim() ? 0.5 : 1,
                      flexShrink: 0
                    }}
                    data-testid="chat-send-btn"
                  >
                    <span style={{ pointerEvents: 'none' }}><SendIcon /></span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* === FENÊTRE FLOTTANTE MP (Style Messenger) === */}
      {activePrivateChat && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: isOpen ? '420px' : '20px',
            width: '320px',
            height: '400px',
            borderRadius: '12px',
            background: '#1a1a1a',
            border: '1px solid rgba(147, 51, 234, 0.5)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 60
          }}
          data-testid="private-chat-window"
        >
          {/* Header MP */}
          <div style={{
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                💬 {activePrivateChat.recipientName}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                Message privé
              </div>
            </div>
            <button
              onClick={closePrivateChat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px'
              }}
              data-testid="close-private-chat"
            >
              ✕
            </button>
          </div>

          {/* Messages MP */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {privateMessages.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '50px' }}>
                Commencez la conversation...
              </div>
            ) : (
              privateMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  {!msg.isMine && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
                      {msg.sender}
                    </div>
                  )}
                  <div style={{
                    background: msg.isMine ? '#9333ea' : '#2d2d2d',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: msg.isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '13px'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            
            {/* === INDICATEUR DE FRAPPE DM (minimaliste) === */}
            {dmTypingUser && (
              <div 
                style={{ 
                  alignSelf: 'flex-start', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '4px 0'
                }}
                data-testid="dm-typing-indicator"
              >
                <div style={{
                  display: 'flex',
                  gap: '3px',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px'
                }}>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.4)',
                    animation: 'dmTypingDot 1.4s infinite ease-in-out',
                    animationDelay: '0s'
                  }}></span>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.4)',
                    animation: 'dmTypingDot 1.4s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }}></span>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.4)',
                    animation: 'dmTypingDot 1.4s infinite ease-in-out',
                    animationDelay: '0.4s'
                  }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input MP */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={privateInput}
              onChange={(e) => {
                setPrivateInput(e.target.value);
                // Émettre l'événement typing si l'utilisateur tape
                if (e.target.value.length > 0) {
                  emitDmTyping(true);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  emitDmTyping(false); // Arrêter le typing avant d'envoyer
                  sendPrivateMessage();
                }
              }}
              onBlur={() => emitDmTyping(false)}
              placeholder="Message privé..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '13px'
              }}
              data-testid="private-message-input"
            />
            <button
              onClick={() => {
                emitDmTyping(false); // Arrêter le typing avant d'envoyer
                sendPrivateMessage();
              }}
              disabled={!privateInput.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: privateInput.trim() ? '#9333ea' : '#444',
                border: 'none',
                cursor: privateInput.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
              data-testid="send-private-btn"
            >
              →
            </button>
          </div>
        </div>
      )}
      
      {/* === MODALE RECADRAGE PHOTO DE PROFIL === */}
      {showCropModal && cropImageSrc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          data-testid="crop-modal"
        >
          {/* Header minimaliste */}
          <div style={{ 
            color: '#fff', 
            fontSize: '14px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Centrer votre visage
          </div>
          
          {/* Zone de prévisualisation circulaire */}
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
            position: 'relative',
            background: '#1a1a1a'
          }}>
            <img
              src={cropImageSrc}
              alt="Aperçu"
              style={{
                position: 'absolute',
                width: `${100 * cropPosition.scale}%`,
                height: 'auto',
                minHeight: `${100 * cropPosition.scale}%`,
                objectFit: 'cover',
                left: `${50 - (50 * cropPosition.scale) + cropPosition.x}%`,
                top: `${50 - (50 * cropPosition.scale) + cropPosition.y}%`,
                transform: 'translate(0, 0)',
                cursor: 'move'
              }}
              draggable={false}
            />
          </div>
          
          {/* Contrôle de zoom */}
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: '#888',
            fontSize: '12px'
          }}>
            <span>-</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={cropPosition.scale}
              onChange={(e) => setCropPosition(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              style={{
                width: '150px',
                accentColor: '#9333ea'
              }}
            />
            <span>+</span>
          </div>
          
          {/* Boutons de position */}
          <div style={{ 
            marginTop: '16px', 
            display: 'flex', 
            gap: '8px' 
          }}>
            <button
              onClick={() => setCropPosition(prev => ({ ...prev, y: prev.y - 5 }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '8px', color: '#fff', cursor: 'pointer' }}
            >↑</button>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px' 
          }}>
            <button
              onClick={() => setCropPosition(prev => ({ ...prev, x: prev.x - 5 }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '8px', color: '#fff', cursor: 'pointer' }}
            >←</button>
            <button
              onClick={() => setCropPosition({ x: 0, y: 0, scale: 1 })}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '8px', color: '#888', cursor: 'pointer', fontSize: '10px' }}
            >Reset</button>
            <button
              onClick={() => setCropPosition(prev => ({ ...prev, x: prev.x + 5 }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '8px', color: '#fff', cursor: 'pointer' }}
            >→</button>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px' 
          }}>
            <button
              onClick={() => setCropPosition(prev => ({ ...prev, y: prev.y + 5 }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '8px', color: '#fff', cursor: 'pointer' }}
            >↓</button>
          </div>
          
          {/* Boutons d'action */}
          <div style={{ 
            marginTop: '24px', 
            display: 'flex', 
            gap: '12px' 
          }}>
            <button
              onClick={() => { setShowCropModal(false); setCropImageSrc(null); }}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleCropAndUpload}
              disabled={uploadingPhoto}
              style={{
                background: 'linear-gradient(135deg, #9333ea, #6366f1)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#fff',
                cursor: uploadingPhoto ? 'wait' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                opacity: uploadingPhoto ? 0.7 : 1
              }}
              data-testid="crop-confirm-btn"
            >
              {uploadingPhoto ? '⏳ Upload...' : '✓ Valider'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
