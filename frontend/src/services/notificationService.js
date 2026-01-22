// /services/notificationService.js - Service de notifications sonores et visuelles
// Pour le système de chat Afroboost - Optimisé pour iOS et Android

/**
 * Sons de notification utilisant Web Audio API
 * Optimisé pour iOS (Safari) et Android
 */

// Contexte Audio global avec gestion iOS
let audioContext = null;
let isAudioUnlocked = false;

/**
 * Obtient le contexte audio, le créant si nécessaire
 */
const getAudioContext = () => {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContext = new AudioContext();
    }
  }
  return audioContext;
};

/**
 * Déverrouille l'audio sur iOS (nécessite une interaction utilisateur)
 * À appeler lors du premier clic/tap de l'utilisateur
 */
export const unlockAudio = () => {
  if (isAudioUnlocked) return Promise.resolve();
  
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!ctx) {
      resolve();
      return;
    }
    
    // Créer un son silencieux pour débloquer l'audio sur iOS
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    
    // Résumer le contexte si suspendu
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlocked = true;
        resolve();
      });
    } else {
      isAudioUnlocked = true;
      resolve();
    }
  });
};

/**
 * Joue un son de notification pour les messages entrants
 * Optimisé pour iOS et Android
 * @param {string} type - 'message' | 'coach' | 'user'
 */
export const playNotificationSound = async (type = 'message') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn('Web Audio API not supported');
      return;
    }
    
    // Résumer le contexte audio si suspendu (politique navigateur iOS/Chrome)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Ajouter un filtre pour un son plus doux sur mobile
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    
    const now = ctx.currentTime;

    // Différents sons selon le type
    switch (type) {
      case 'coach':
        // Son distinctif pour réponse coach (double bip harmonieux)
        oscillator.frequency.setValueAtTime(523, now); // Do5
        oscillator.frequency.setValueAtTime(659, now + 0.12); // Mi5
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.setValueAtTime(0.3, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
        break;
      
      case 'user':
        // Son aigu pour message utilisateur (notification subtile)
        oscillator.frequency.setValueAtTime(784, now); // Sol5
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;
      
      default:
        // Son standard (bip agréable)
        oscillator.frequency.setValueAtTime(587, now); // Ré5
        gainNode.gain.setValueAtTime(0.28, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        oscillator.start(now);
        oscillator.stop(now + 0.12);
    }

  } catch (err) {
    console.warn('Notification sound failed:', err);
  }
};

/**
 * Joue un son de notification plus long et distinct (pour les notifications push)
 */
export const playPushNotificationSound = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Créer un son de notification plus élaboré
    const notes = [523, 659, 784]; // Do, Mi, Sol (accord majeur)
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });

  } catch (err) {
    console.warn('Push notification sound failed:', err);
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
    silent: false, // Permet le son système
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
  
  // Si le texte contient déjà du HTML (emojis img), le préserver
  // D'abord, extraire les balises img pour les protéger
  const imgTags = [];
  let protectedText = text.replace(/<img[^>]+>/gi, (match) => {
    imgTags.push(match);
    return `__IMG_PLACEHOLDER_${imgTags.length - 1}__`;
  });
  
  // Regex pour détecter les URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  // Convertir les URLs en liens
  protectedText = protectedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
  });
  
  // Restaurer les balises img
  imgTags.forEach((img, index) => {
    protectedText = protectedText.replace(`__IMG_PLACEHOLDER_${index}__`, img);
  });
  
  return protectedText;
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
  playPushNotificationSound,
  unlockAudio,
  requestNotificationPermission,
  showBrowserNotification,
  linkifyText,
  containsLinks
};
