// /components/ChatWidget.js - Widget IA flottant avec capture de leads
// Architecture modulaire Afroboost

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

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

/**
 * Widget de chat IA flottant avec capture de leads
 */
export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'chat'
  const [leadData, setLeadData] = useState({ firstName: '', whatsapp: '', email: '' });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll vers le bas des messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      // Enregistrer le lead dans MongoDB
      await axios.post(`${API}/leads`, {
        firstName: leadData.firstName.trim(),
        whatsapp: leadData.whatsapp.trim(),
        email: leadData.email.trim(),
        source: 'widget_ia'
      });
      
      // Passer en mode chat avec message d'accueil
      setStep('chat');
      setMessages([{
        type: 'ai',
        text: `Enchanté ${leadData.firstName} ! 👋 Je suis l'assistant IA d'Afroboost. Comment puis-je t'aider aujourd'hui ?`
      }]);
      
    } catch (err) {
      console.error('Error saving lead:', err);
      // Même en cas d'erreur, on passe en mode chat
      setStep('chat');
      setMessages([{
        type: 'ai',
        text: `Enchanté ${leadData.firstName} ! 👋 Je suis l'assistant IA d'Afroboost. Comment puis-je t'aider aujourd'hui ?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Envoyer un message au chat
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        firstName: leadData.firstName,
        leadId: ''
      });
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: response.data.response || "Désolé, je n'ai pas pu traiter votre message."
      }]);
      
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

  // Réinitialiser le widget
  const handleClose = () => {
    setIsOpen(false);
    // Garder les données du lead pour ne pas les redemander
  };

  return (
    <>
      {/* Bouton flottant WhatsApp */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            bottom: '80px', // Au-dessus du footer
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366', // Vert WhatsApp
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
          }}
          data-testid="chat-widget-button"
        >
          <WhatsAppIcon />
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className="fixed z-50 shadow-2xl overflow-hidden"
          style={{
            bottom: '80px',
            right: '20px',
            width: '340px',
            maxWidth: 'calc(100vw - 40px)',
            height: '450px',
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: '16px',
            background: '#0a0a0a',
            border: '1px solid rgba(217, 28, 210, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}
          data-testid="chat-widget-window"
        >
          {/* Header */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
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
                <WhatsAppIcon />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Afroboost</div>
                <div className="text-white text-xs" style={{ opacity: 0.8 }}>Assistant IA</div>
              </div>
            </div>
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

          {/* Contenu */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Formulaire de capture */}
            {step === 'form' && (
              <form 
                onSubmit={handleSubmitLead}
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  height: '100%'
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
                  className="mt-auto py-3 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  data-testid="lead-submit"
                >
                  {isLoading ? 'Chargement...' : 'Commencer le chat 💬'}
                </button>
                
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Vos données sont protégées et utilisées uniquement pour vous contacter.
                </p>
              </form>
            )}
            
            {/* Zone de chat */}
            {step === 'chat' && (
              <>
                <div 
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%'
                      }}
                    >
                      <div
                        style={{
                          background: msg.type === 'user' 
                            ? 'linear-gradient(135deg, #d91cd2, #8b5cf6)' 
                            : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '10px 14px',
                          borderRadius: msg.type === 'user' 
                            ? '16px 16px 4px 16px' 
                            : '16px 16px 16px 4px',
                          fontSize: '13px',
                          lineHeight: '1.4'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  
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
                
                {/* Input message */}
                <div 
                  style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: '8px'
                  }}
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#25D366',
                      border: 'none',
                      cursor: isLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isLoading || !inputMessage.trim() ? 0.5 : 1
                    }}
                    data-testid="chat-send-btn"
                  >
                    <SendIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
