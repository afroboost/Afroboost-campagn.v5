// messagingGateway.js - Passerelles techniques pour l'envoi de messages
// Ces fonctions sont des canaux de sortie PURS - aucune logique de décision
// L'agent IA reste le déclencheur principal et utilise ces passerelles pour expédier

import emailjs from '@emailjs/browser';

// === CONSTANTES EMAILJS - NE PAS MODIFIER ===
const EMAILJS_SERVICE_ID = "service_8mrmxim";
const EMAILJS_TEMPLATE_ID = "template_3n1u86p";
const EMAILJS_PUBLIC_KEY = "5LfgQSIEQoqq_XSqt";

// === INITIALISATION SDK AU CHARGEMENT DU MODULE ===
let emailjsInitialized = false;
try {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  emailjsInitialized = true;
  console.log('✅ [Gateway] EmailJS SDK initialisé');
} catch (e) {
  console.error('❌ [Gateway] Erreur init EmailJS:', e);
}

/**
 * PASSERELLE EMAIL - Canal technique pur
 * Reçoit les paramètres de l'agent IA et les transmet à EmailJS
 * AUCUNE logique de décision - juste transmission
 * 
 * @param {string} to_email - Email du destinataire
 * @param {string} to_name - Nom du destinataire (défaut: 'Client')
 * @param {string} subject - Sujet (défaut: 'Afroboost')
 * @param {string} message - Corps du message généré par l'IA
 * @returns {Promise<{success: boolean, response?: any, error?: string}>}
 */
export const sendEmailGateway = async (to_email, to_name = 'Client', subject = 'Afroboost', message = '') => {
  // Payload plat - texte uniquement, aucun objet complexe
  const params = {
    to_email: String(to_email),
    to_name: String(to_name),
    subject: String(subject),
    message: String(message)
  };
  
  console.log('[Gateway] ========================================');
  console.log('[Gateway] DEMANDE EMAILJS - Canal de sortie IA');
  console.log('[Gateway] Destination:', to_email);
  console.log('[Gateway] Payload:', JSON.stringify(params));
  console.log('[Gateway] ========================================');
  
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      params,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('[Gateway] ✅ Email transmis:', response.status);
    return { success: true, response, channel: 'email' };
  } catch (error) {
    console.error('[Gateway] ❌ Erreur transmission email:', error);
    return { 
      success: false, 
      error: error?.text || error?.message || 'Erreur inconnue',
      channel: 'email'
    };
  }
};

/**
 * PASSERELLE WHATSAPP - Canal technique pur
 * Reçoit les paramètres de l'agent IA et les transmet à Twilio
 * AUCUNE logique de décision - juste transmission
 * 
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} message - Message généré par l'IA
 * @param {object} twilioConfig - {accountSid, authToken, fromNumber}
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
export const sendWhatsAppGateway = async (phoneNumber, message, twilioConfig = {}) => {
  const { accountSid, authToken, fromNumber } = twilioConfig;
  
  console.log('[Gateway] ========================================');
  console.log('[Gateway] DEMANDE WHATSAPP/TWILIO - Canal de sortie IA');
  console.log('[Gateway] Destination:', phoneNumber);
  console.log('[Gateway] Message:', message?.substring(0, 50) + '...');
  console.log('[Gateway] Config présente:', !!accountSid && !!authToken && !!fromNumber);
  console.log('[Gateway] ========================================');
  
  // Si pas de config Twilio, mode simulation (pour développement)
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Gateway] ⚠️ Twilio non configuré - Mode simulation');
    // Ne pas bloquer l'agent IA, retourner succès simulé
    return { 
      success: true, 
      simulated: true, 
      channel: 'whatsapp',
      message: `WhatsApp prêt pour: ${phoneNumber}` 
    };
  }
  
  // Formater le numéro au format E.164
  let formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.startsWith('0') 
      ? '+41' + formattedPhone.substring(1) 
      : '+' + formattedPhone;
  }
  
  // Payload plat - URLSearchParams pour Twilio
  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${fromNumber.startsWith('+') ? fromNumber : '+' + fromNumber}`);
  formData.append('To', `whatsapp:${formattedPhone}`);
  formData.append('Body', String(message));
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Gateway] ❌ Erreur Twilio:', data);
      return { 
        success: false, 
        error: data.message || `HTTP ${response.status}`,
        channel: 'whatsapp'
      };
    }
    
    console.log('[Gateway] ✅ WhatsApp transmis, SID:', data.sid);
    return { success: true, sid: data.sid, channel: 'whatsapp' };
  } catch (error) {
    console.error('[Gateway] ❌ Erreur transmission WhatsApp:', error);
    return { 
      success: false, 
      error: error.message,
      channel: 'whatsapp'
    };
  }
};

/**
 * PASSERELLE UNIFIÉE - Point d'entrée unique pour l'agent IA
 * L'IA choisit le canal (email ou whatsapp) et cette fonction route
 * 
 * @param {string} channel - 'email' ou 'whatsapp'
 * @param {object} params - Paramètres selon le canal
 * @returns {Promise<{success: boolean, ...}>}
 */
export const sendMessageGateway = async (channel, params) => {
  console.log('[Gateway] 🤖 Agent IA demande envoi via canal:', channel);
  
  if (channel === 'email') {
    return sendEmailGateway(
      params.to_email,
      params.to_name,
      params.subject,
      params.message
    );
  }
  
  if (channel === 'whatsapp') {
    return sendWhatsAppGateway(
      params.phoneNumber,
      params.message,
      params.twilioConfig
    );
  }
  
  return { success: false, error: `Canal inconnu: ${channel}` };
};

// === EXPORTS ===
export default {
  sendEmailGateway,
  sendWhatsAppGateway,
  sendMessageGateway,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  isInitialized: () => emailjsInitialized
};
