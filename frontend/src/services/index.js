// /services/index.js - Export centralisé des services Afroboost
// Compatible Vercel - Données persistées dans MongoDB

// === EMAIL SERVICE (EmailJS + localStorage) ===
export {
  getEmailJSConfig,
  saveEmailJSConfig,
  isEmailJSConfigured,
  initEmailJS,
  sendEmail,
  sendBulkEmails,
  testEmailJSConfig
} from './emailService';

// === WHATSAPP SERVICE (Twilio + MongoDB) ===
export {
  getWhatsAppConfig,
  getWhatsAppConfigSync,
  saveWhatsAppConfig,
  isWhatsAppConfigured,
  formatPhoneE164,
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  testWhatsAppConfig
} from './whatsappService';

// === AI RESPONSE SERVICE ===
export {
  getAIConfig,
  saveAIConfig,
  isAIEnabled,
  setLastMediaUrl,
  addAILog,
  getAILogs,
  clearAILogs,
  findClientByPhone,
  buildAIContext
} from './aiResponseService';

// === MESSAGING GATEWAY - Passerelles techniques pour l'agent IA ===
// Ces fonctions sont des canaux de sortie PURS
// L'agent IA reste le déclencheur et utilise ces passerelles pour expédier
export {
  sendEmailGateway,
  sendWhatsAppGateway,
  sendMessageGateway
} from './messagingGateway';
