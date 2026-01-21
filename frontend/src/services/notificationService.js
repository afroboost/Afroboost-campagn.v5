// /services/notificationService.js - Service de notifications sonores et visuelles
// Pour le système de chat Afroboost

/**
 * Sons de notification encodés en base64 (courts bips)
 * Utilise l'API Web Audio pour générer des sons sans fichiers externes
 */

// Contexte Audio global
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Joue un son de notification pour les messages entrants
 * @param {string} type - 'message' | 'coach' | 'user'
 */
export const playNotificationSound = (type = 'message') => {
  try {
    const ctx = getAudioContext();
    
    // Résumer le contexte audio si suspendu (politique navigateur)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Différents sons selon le type
    switch (type) {
      case 'coach':
        // Son plus grave pour réponse coach (double bip)
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // La
        oscillator.frequency.setValueAtTime(523, ctx.currentTime + 0.1); // Do
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      
      case 'user':
        // Son aigu pour message utilisateur (bip simple)
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // La aigu
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      
      default:
        // Son standard
        oscillator.frequency.setValueAtTime(660, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    oscillator.type = 'sine';

  } catch (err) {
    console.warn('Notification sound failed:', err);
  }
};

/**
 * Demande la permission pour les notifications browser
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

/**
 * Affiche une notification browser (si autorisée)
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps du message
 * @param {object} options - Options supplémentaires
 */
export const showBrowserNotification = async (title, body, options = {}) => {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return null;
  }

  const notification = new Notification(title, {
    body,
    icon: options.icon || '/favicon.ico',
    badge: options.badge || '/favicon.ico',
    tag: options.tag || 'afroboost-chat',
    requireInteraction: options.requireInteraction || false,
    ...options
  });

  // Fermer automatiquement après 5 secondes
  setTimeout(() => notification.close(), 5000);

  // Callback au clic
  if (options.onClick) {
    notification.onclick = options.onClick;
  }

  return notification;
};

/**
 * Convertit une URL en lien cliquable
 * @param {string} text - Texte à analyser
 * @returns {string} - Texte avec liens HTML
 */
export const linkifyText = (text) => {
  if (!text) return '';
  
  // Regex pour détecter les URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
  });
};

/**
 * Vérifie si le texte contient des URLs
 * @param {string} text - Texte à vérifier
 * @returns {boolean}
 */
export const containsLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

export default {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
  linkifyText,
  containsLinks
};
