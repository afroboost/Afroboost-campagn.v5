import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Translations
const translations = {
  fr: {
    title: "Réservation de casque",
    chooseSession: "Choisissez votre session",
    reserve: "Réserver maintenant",
    coachMode: "Mode Coach",
  },
  en: {
    title: "Headset Reservation",
    chooseSession: "Choose your session",
    reserve: "Reserve now",
    coachMode: "Coach Mode",
  },
  de: {
    title: "Kopfhörer-Reservierung",
    chooseSession: "Wähle deine Session",
    reserve: "Jetzt reservieren",
    coachMode: "Coach-Modus",
  },
};

const WEEKDAYS = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" }
];

const defaultConfig = {
  background_color: "#020617",
  gradient_color: "#3b0764",
  primary_color: "#d91cd2",
  secondary_color: "#8b5cf6",
  text_color: "#ffffff",
  font_family: "system-ui",
  font_size: 16,
  app_title: "Afroboost",
  app_subtitle: "Réservation de casque",
  concept_description: "Le concept Afroboost : cardio + danse afrobeat + casques audio immersifs.",
  choose_session_text: "Choisissez votre session",
  choose_offer_text: "Choisissez votre offre",
  user_info_text: "Vos informations",
  button_text: "Réserver maintenant"
};

// Helper functions
function getNextOccurrences(weekday, count = 4) {
  const now = new Date();
  const results = [];
  const day = now.getDay();
  let diff = weekday - day;
  if (diff < 0) diff += 7;
  let current = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);

  for (let i = 0; i < count; i++) {
    results.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return results;
}

function formatDate(d, time) {
  const formatted = d.toLocaleDateString("fr-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
  return `${formatted} • ${time}`;
}

// Splash Screen Component
const SplashScreen = () => (
  <div className="splash-screen">
    <div className="splash-headset">🎧</div>
    <div className="splash-text">Afroboost</div>
  </div>
);

// Coach Login Component
const CoachLogin = ({ config, onLogin, onCancel }) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/coach-auth/login`, {
        email: loginEmail,
        password: loginPassword
      });
      if (response.data.success) {
        onLogin();
      } else {
        setLoginError(response.data.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setLoginError("Erreur de connexion");
    }
  };

  const handleForgotPassword = () => {
    const subject = "🔐 Afroboost — Demande de réinitialisation Coach";
    const body = `Bonjour,\n\nJe souhaite réinitialiser mes accès pour le Mode Coach.`;
    window.location.href = `mailto:contact.artboost@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6" 
         style={{ background: `radial-gradient(circle at top, ${config.gradient_color} 0%, ${config.background_color} 45%)` }}>
      <div className="glass rounded-xl p-8 max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <h2 className="font-bold mb-6 text-center" style={{ color: config.text_color, fontSize: `${config.font_size * 1.5}px` }}>
            Connexion Coach
          </h2>
          {loginError && (
            <div className="mb-4 p-3 rounded-lg text-center" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              {loginError}
            </div>
          )}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-2" style={{ color: config.text_color }}>Email</label>
              <input 
                type="email" 
                required 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg glass" 
                style={{ color: config.text_color, borderColor: config.primary_color }} 
                placeholder="coach@afroboost.com"
                data-testid="coach-login-email"
              />
            </div>
            <div>
              <label className="block mb-2" style={{ color: config.text_color }}>Mot de passe</label>
              <input 
                type="password" 
                required 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg glass" 
                style={{ color: config.text_color, borderColor: config.primary_color }} 
                placeholder="••••••••"
                data-testid="coach-login-password"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3 rounded-lg font-bold mb-3" data-testid="coach-login-submit">
            Se connecter
          </button>
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            className="w-full text-center mb-4" 
            style={{ color: config.primary_color, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Mot de passe oublié ?
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="w-full py-2 rounded-lg glass"
            style={{ color: config.text_color }}
            data-testid="coach-login-cancel"
          >
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
};

// Coach Dashboard Component
const CoachDashboard = ({ config, onBack, onLogout }) => {
  const [coachTab, setCoachTab] = useState("reservations");
  const [reservations, setReservations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [offers, setOffers] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState({ stripe: "", paypal: "", twint: "", coachWhatsapp: "" });
  const [concept, setConcept] = useState({ description: "", heroImageUrl: "", heroVideoUrl: "" });
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeType, setNewCodeType] = useState("");
  const [newCodeValue, setNewCodeValue] = useState("");
  const [newCodeAssignedEmail, setNewCodeAssignedEmail] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [resRes, coursesRes, offersRes, linksRes, conceptRes, codesRes] = await Promise.all([
        axios.get(`${API}/reservations`),
        axios.get(`${API}/courses`),
        axios.get(`${API}/offers`),
        axios.get(`${API}/payment-links`),
        axios.get(`${API}/concept`),
        axios.get(`${API}/discount-codes`)
      ]);
      setReservations(resRes.data);
      setCourses(coursesRes.data);
      setOffers(offersRes.data);
      setPaymentLinks(linksRes.data);
      setConcept(conceptRes.data);
      setDiscountCodes(codesRes.data);
    } catch (err) {
      console.error("Error fetching coach data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportUsersCSV = () => {
    const rows = [
      ["Code", "Nom", "Email", "WhatsApp", "Cours", "Date", "Offre", "Prix", "Quantité", "Total"],
      ...reservations.map(res => [
        res.reservationCode || '', 
        res.userName, 
        res.userEmail, 
        res.userWhatsapp || '', 
        res.courseName, 
        new Date(res.datetime).toLocaleDateString('fr-CH'), 
        res.offerName, 
        res.price, 
        res.quantity || 1, 
        res.totalPrice || res.price
      ])
    ];
    const csv = rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; 
    a.download = `contacts_afroboost_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
  };

  const handleUpdatePaymentLinks = async () => {
    try {
      await axios.put(`${API}/payment-links`, paymentLinks);
      alert("Liens de paiement mis à jour !");
    } catch (err) {
      console.error("Error updating payment links:", err);
    }
  };

  const handleUpdateConcept = async () => {
    try {
      await axios.put(`${API}/concept`, concept);
      alert("Concept mis à jour !");
    } catch (err) {
      console.error("Error updating concept:", err);
    }
  };

  const handleUpdateCourse = async (course) => {
    try {
      await axios.put(`${API}/courses/${course.id}`, course);
    } catch (err) {
      console.error("Error updating course:", err);
    }
  };

  const handleAddDiscountCode = async (e) => {
    e.preventDefault();
    if (!newCodeType || !newCodeValue) return;
    try {
      const response = await axios.post(`${API}/discount-codes`, {
        code: newCodeName || `CODE-${Date.now().toString().slice(-4)}`,
        type: newCodeType,
        value: parseFloat(newCodeValue),
        assignedEmail: newCodeAssignedEmail || null,
        courses: [],
        maxUses: null
      });
      setDiscountCodes([...discountCodes, response.data]);
      setNewCodeName("");
      setNewCodeType("");
      setNewCodeValue("");
      setNewCodeAssignedEmail("");
    } catch (err) {
      console.error("Error creating discount code:", err);
    }
  };

  const toggleCodeActive = async (code) => {
    try {
      await axios.put(`${API}/discount-codes/${code.id}`, { active: !code.active });
      setDiscountCodes(discountCodes.map(c => c.id === code.id ? { ...c, active: !c.active } : c));
    } catch (err) {
      console.error("Error toggling code:", err);
    }
  };

  return (
    <div className="w-full min-h-screen p-6" 
         style={{ background: `radial-gradient(circle at top, ${config.gradient_color} 0%, ${config.background_color} 45%)` }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="font-bold" style={{ color: config.text_color, fontSize: `${config.font_size * 2}px` }}>
            Mode Coach
          </h1>
          <div className="flex gap-3">
            <button onClick={onBack} className="px-4 py-2 rounded-lg glass" style={{ color: config.text_color }} data-testid="coach-back-btn">
              ← Retour
            </button>
            <button onClick={onLogout} className="px-4 py-2 rounded-lg glass" style={{ color: config.text_color }} data-testid="coach-logout-btn">
              🚪 Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["reservations", "concept", "courses", "offers", "payments", "codes"].map(tab => (
            <button 
              key={tab} 
              onClick={() => setCoachTab(tab)} 
              className={`px-4 py-2 rounded-lg transition-all ${coachTab === tab ? 'neon-border' : 'glass'}`} 
              style={{ color: config.text_color, background: coachTab === tab ? 'rgba(217, 28, 210, 0.3)' : undefined }}
              data-testid={`coach-tab-${tab}`}
            >
              {tab === "reservations" ? "Réservations" : 
               tab === "concept" ? "Concept & Visuel" : 
               tab === "courses" ? "Cours" : 
               tab === "offers" ? "Offres" : 
               tab === "payments" ? "Paiements" : "Codes promo"}
            </button>
          ))}
        </div>

        {/* Reservations Tab */}
        {coachTab === "reservations" && (
          <div className="glass rounded-xl p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h2 className="font-semibold" style={{ color: config.text_color, fontSize: `${config.font_size * 1.5}px` }}>
                Liste des réservations
              </h2>
              <button onClick={exportUsersCSV} className="px-4 py-2 rounded-lg btn-primary text-sm" data-testid="export-csv-btn">
                📥 Télécharger CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(148, 27, 181, 0.4)' }}>
                    <th className="text-left p-3" style={{ color: config.text_color }}>Code</th>
                    <th className="text-left p-3" style={{ color: config.text_color }}>Nom</th>
                    <th className="text-left p-3" style={{ color: config.text_color }}>Email</th>
                    <th className="text-left p-3" style={{ color: config.text_color }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res.id} style={{ borderBottom: '1px solid rgba(148, 27, 181, 0.2)' }}>
                      <td className="p-3" style={{ color: config.text_color, fontWeight: 'bold' }}>{res.reservationCode || '-'}</td>
                      <td className="p-3" style={{ color: config.text_color }}>{res.userName}</td>
                      <td className="p-3" style={{ color: config.text_color }}>{res.userEmail}</td>
                      <td className="p-3" style={{ color: config.text_color, fontWeight: 'bold' }}>CHF {res.totalPrice || res.price}</td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center" style={{ color: config.text_color, opacity: 0.6 }}>
                        Aucune réservation pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Concept Tab */}
        {coachTab === "concept" && (
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color, fontSize: `${config.font_size * 1.5}px` }}>
              Concept & Visuel
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: config.text_color }}>Description du concept</label>
                <textarea 
                  value={concept.description} 
                  onChange={(e) => setConcept({ ...concept, description: e.target.value })} 
                  className="w-full px-4 py-3 rounded-lg glass" 
                  rows={4} 
                  style={{ color: config.text_color, borderColor: config.primary_color }}
                  data-testid="concept-description-input"
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: config.text_color }}>URL de l'image d'accueil</label>
                <input 
                  type="url" 
                  value={concept.heroImageUrl} 
                  onChange={(e) => setConcept({ ...concept, heroImageUrl: e.target.value })} 
                  className="w-full px-4 py-3 rounded-lg glass" 
                  style={{ color: config.text_color, borderColor: config.primary_color }}
                  data-testid="concept-hero-image-input"
                />
              </div>
              <button onClick={handleUpdateConcept} className="btn-primary px-6 py-3 rounded-lg" data-testid="save-concept-btn">
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {coachTab === "courses" && (
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color }}>Gestion des cours</h2>
            {courses.map((course, idx) => (
              <div key={course.id} className="glass rounded-lg p-4 mb-4">
                <input 
                  type="text" 
                  value={course.name} 
                  onChange={(e) => {
                    const n = [...courses]; 
                    n[idx].name = e.target.value; 
                    setCourses(n);
                  }}
                  onBlur={() => handleUpdateCourse(course)}
                  className="w-full px-4 py-3 rounded-lg glass mb-2" 
                  style={{ color: config.text_color }}
                  data-testid={`course-name-${idx}`}
                />
                <input 
                  type="text" 
                  value={course.locationName} 
                  onChange={(e) => {
                    const n = [...courses]; 
                    n[idx].locationName = e.target.value; 
                    setCourses(n);
                  }}
                  onBlur={() => handleUpdateCourse(course)}
                  className="w-full px-4 py-3 rounded-lg glass" 
                  style={{ color: config.text_color }}
                  data-testid={`course-location-${idx}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Payments Tab */}
        {coachTab === "payments" && (
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color }}>Paiements</h2>
            <div className="space-y-4">
              <input 
                type="url" 
                placeholder="Lien Stripe" 
                value={paymentLinks.stripe} 
                onChange={(e) => setPaymentLinks({ ...paymentLinks, stripe: e.target.value })} 
                className="w-full px-4 py-3 rounded-lg glass" 
                style={{ color: config.text_color }}
                data-testid="payment-stripe-input"
              />
              <input 
                type="url" 
                placeholder="Lien Twint" 
                value={paymentLinks.twint} 
                onChange={(e) => setPaymentLinks({ ...paymentLinks, twint: e.target.value })} 
                className="w-full px-4 py-3 rounded-lg glass" 
                style={{ color: config.text_color }}
                data-testid="payment-twint-input"
              />
              <input 
                type="tel" 
                placeholder="WhatsApp Coach (ex: +41791234567)" 
                value={paymentLinks.coachWhatsapp} 
                onChange={(e) => setPaymentLinks({ ...paymentLinks, coachWhatsapp: e.target.value })} 
                className="w-full px-4 py-3 rounded-lg glass" 
                style={{ color: config.text_color }}
                data-testid="payment-whatsapp-input"
              />
              <button onClick={handleUpdatePaymentLinks} className="btn-primary px-6 py-3 rounded-lg" data-testid="save-payments-btn">
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* Discount Codes Tab */}
        {coachTab === "codes" && (
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color }}>Codes promo</h2>
            <form onSubmit={handleAddDiscountCode} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Code (ex: GRATUIT)" 
                value={newCodeName} 
                onChange={(e) => setNewCodeName(e.target.value)} 
                className="glass p-3 rounded-lg" 
                style={{ color: config.text_color }}
                data-testid="new-code-name"
              />
              <select 
                value={newCodeType} 
                onChange={(e) => setNewCodeType(e.target.value)} 
                className="glass p-3 rounded-lg" 
                style={{ color: config.text_color }}
                data-testid="new-code-type"
              >
                <option value="">Type</option>
                <option value="100%">100% (Gratuit)</option>
                <option value="%">%</option>
                <option value="CHF">CHF</option>
              </select>
              <input 
                type="number" 
                placeholder="Valeur" 
                value={newCodeValue} 
                onChange={(e) => setNewCodeValue(e.target.value)} 
                className="glass p-3 rounded-lg" 
                style={{ color: config.text_color }}
                data-testid="new-code-value"
              />
              <input 
                type="email" 
                placeholder="Email assigné (optionnel)" 
                value={newCodeAssignedEmail} 
                onChange={(e) => setNewCodeAssignedEmail(e.target.value)} 
                className="glass p-3 rounded-lg md:col-span-2" 
                style={{ color: config.text_color }}
                data-testid="new-code-email"
              />
              <button type="submit" className="btn-primary p-3 rounded-lg" data-testid="add-code-btn">
                Ajouter
              </button>
            </form>
            {discountCodes.map(code => (
              <div key={code.id} className="p-3 glass rounded-lg mb-2 flex justify-between items-center flex-wrap gap-2">
                <span style={{ color: config.text_color }}>
                  {code.code} ({code.type} {code.value}) - {code.assignedEmail || "Tous"} - Utilisé: {code.used || 0}x
                </span>
                <button 
                  onClick={() => toggleCodeActive(code)} 
                  className="text-xs px-3 py-1 rounded glass"
                  style={{ color: config.text_color }}
                  data-testid={`toggle-code-${code.id}`}
                >
                  {code.active ? '✅ Actif' : '❌ Inactif'}
                </button>
              </div>
            ))}
            {discountCodes.length === 0 && (
              <p className="text-center py-4" style={{ color: config.text_color, opacity: 0.6 }}>
                Aucun code promo
              </p>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {coachTab === "offers" && (
          <div className="glass rounded-xl p-6">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color }}>Gestion des offres</h2>
            {offers.map((offer, idx) => (
              <div key={offer.id} className="glass rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="font-semibold" style={{ color: config.text_color }}>{offer.name}</p>
                  <p className="text-pink-500 font-bold">CHF {offer.price}.-</p>
                </div>
                <span style={{ color: config.text_color, opacity: 0.6 }}>
                  {offer.visible ? '👁️ Visible' : '🙈 Caché'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Success Overlay Component
const SuccessOverlay = ({ config, reservationData, onClose }) => {
  const handlePrint = () => window.print();

  const handleShareWhatsApp = () => {
    const message = `🎧 CONFIRMATION DE RÉSERVATION AFROBOOST

👤 Nom : ${reservationData.userName}
📧 Email : ${reservationData.userEmail}
💰 Offre : ${reservationData.offerName}
💵 Total : CHF ${reservationData.totalPrice}
📅 Cours : ${reservationData.courseName}
🕐 Date : ${reservationData.formattedDate}
🎫 Code réservation : ${reservationData.reservationCode}

Cette réservation est confirmée.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="success-overlay">
      <div className="success-message glass rounded-xl p-6 max-w-md w-full text-center neon-border print-proof relative" style={{ color: config.text_color }}>
        <button 
          onClick={onClose} 
          className="absolute top-2 right-4 text-2xl"
          style={{ color: config.text_color }}
          data-testid="close-success-btn"
        >
          ×
        </button>
        <div style={{ fontSize: '40px' }}>🎧</div>
        <p className="font-bold my-2">Réservation confirmée !</p>
        <div className="my-4 p-4 rounded-lg bg-white/10 border-2 border-dashed border-pink-500">
          <p className="text-xs opacity-60">Code :</p>
          <p className="text-2xl font-bold tracking-widest" data-testid="reservation-code">{reservationData.reservationCode}</p>
        </div>
        <div className="text-sm opacity-80 text-left space-y-1 mb-6">
          <p><strong>Nom :</strong> {reservationData.userName}</p>
          <p><strong>Cours :</strong> {reservationData.courseName}</p>
          <p><strong>Total :</strong> CHF {reservationData.totalPrice}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex-1 p-2 glass text-xs rounded-lg" style={{ color: config.text_color }} data-testid="print-btn">
            🖨️ Imprimer
          </button>
          <button onClick={handleShareWhatsApp} className="flex-1 p-2 glass text-xs rounded-lg" style={{ color: config.text_color }} data-testid="share-whatsapp-btn">
            📱 Partager
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Payment Overlay
const ConfirmPaymentOverlay = ({ config, onConfirm, onCancel }) => (
  <div className="success-overlay">
    <div className="success-message glass rounded-xl p-6 max-w-md w-full text-center neon-border" style={{ color: config.text_color }}>
      <div style={{ fontSize: '40px' }}>💳</div>
      <p className="font-bold my-4">Paiement effectué ?</p>
      <p className="mb-6 opacity-80">Si vous avez terminé le paiement sur Twint ou Stripe, cliquez ci-dessous pour valider officiellement votre réservation.</p>
      <button onClick={onConfirm} className="w-full btn-primary py-3 rounded-lg font-bold mb-3" data-testid="confirm-payment-btn">
        ✅ Confirmer mon paiement
      </button>
      <button onClick={onCancel} className="w-full py-2 opacity-60 rounded-lg glass" style={{ color: config.text_color }} data-testid="cancel-payment-btn">
        Annuler
      </button>
    </div>
  </div>
);

// Main App Component
function App() {
  const [lang, setLang] = useState("fr");
  const [config, setConfig] = useState(defaultConfig);
  const [concept, setConcept] = useState({ description: "", heroImageUrl: "", heroVideoUrl: "" });
  const [courses, setCourses] = useState([]);
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState({ stripe: "", paypal: "", twint: "", coachWhatsapp: "" });
  const [discountCodes, setDiscountCodes] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userWhatsapp, setUserWhatsapp] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showSplash, setShowSplash] = useState(true);
  const [showCoachLogin, setShowCoachLogin] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [codeValidationMessage, setCodeValidationMessage] = useState("");
  const [pendingReservation, setPendingReservation] = useState(null);
  const [lastReservationData, setLastReservationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = useCallback((key) => translations[lang][key] || key, [lang]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, offersRes, usersRes, linksRes, conceptRes, codesRes, configRes] = await Promise.all([
          axios.get(`${API}/courses`),
          axios.get(`${API}/offers`),
          axios.get(`${API}/users`),
          axios.get(`${API}/payment-links`),
          axios.get(`${API}/concept`),
          axios.get(`${API}/discount-codes`),
          axios.get(`${API}/config`)
        ]);
        setCourses(coursesRes.data);
        setOffers(offersRes.data);
        setUsers(usersRes.data);
        setPaymentLinks(linksRes.data);
        setConcept(conceptRes.data);
        setDiscountCodes(codesRes.data);
        setConfig({ ...defaultConfig, ...configRes.data });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isDiscountGratuit = (code) => {
    return code && (code.type === "100%" || (code.type === "%" && parseFloat(code.value) >= 100));
  };

  const resetForm = () => {
    setPendingReservation(null);
    setSelectedCourse(null);
    setSelectedDate(null);
    setSelectedOffer(null);
    setSelectedSession(null);
    setIsExistingUser(false);
    setSelectedUserId("");
    setUserName("");
    setUserEmail("");
    setUserWhatsapp("");
    setDiscountCode("");
    setQuantity(1);
    setHasAcceptedTerms(false);
  };

  const sendNotification = (target, reservation) => {
    const coachPhone = paymentLinks.coachWhatsapp;
    const dateFormatted = new Date(reservation.datetime).toLocaleDateString('fr-CH', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeFormatted = new Date(reservation.datetime).toLocaleTimeString('fr-CH', {
      hour: '2-digit', minute: '2-digit'
    });

    const message = `🎧 ${target === "coach" ? "Nouvelle réservation" : "Confirmation de réservation"} Afroboost

👤 Nom : ${reservation.userName}
📧 Email : ${reservation.userEmail}
${reservation.userWhatsapp ? `📱 WhatsApp : ${reservation.userWhatsapp}` : ''}

💰 Offre : ${reservation.offerName} (CHF ${reservation.price})
${reservation.quantity ? `🔢 Quantité : ${reservation.quantity}` : ''}
${reservation.totalPrice ? `💵 Total : CHF ${reservation.totalPrice}` : ''}
📅 Cours : ${reservation.courseName}
🕐 Date : ${dateFormatted} à ${timeFormatted}
${reservation.reservationCode ? `🎫 Code réservation : ${reservation.reservationCode}` : ''}
${reservation.discountCode ? `🎟️ Code promo : ${reservation.discountCode}` : ''}`;

    if (target === "coach" && coachPhone && coachPhone.trim()) {
      const whatsappUrl = `https://wa.me/${coachPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    if (target === "user" && reservation.userWhatsapp && reservation.userWhatsapp.trim()) {
      const whatsappUrl = `https://wa.me/${reservation.userWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 800);
    }
  };

  const handlePaymentClick = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedDate || !selectedOffer || !hasAcceptedTerms) return;

    let finalUserName, finalUserEmail, finalUserWhatsapp, finalUserId;
    let appliedDiscount = null;

    const checkEmail = isExistingUser ? users.find(u => u.id === selectedUserId)?.email : userEmail;
    const checkWhatsapp = isExistingUser ? users.find(u => u.id === selectedUserId)?.whatsapp : userWhatsapp;

    if (!checkEmail || !checkWhatsapp || checkEmail.trim() === "" || checkWhatsapp.trim() === "") {
      setCodeValidationMessage("L'email et le numéro WhatsApp sont obligatoires pour réserver.");
      setTimeout(() => setCodeValidationMessage(""), 4000);
      return;
    }

    // Validate discount code
    if (discountCode) {
      try {
        const response = await axios.post(`${API}/discount-codes/validate`, {
          code: discountCode,
          email: checkEmail,
          courseId: selectedCourse.id
        });
        if (!response.data.valid) {
          setCodeValidationMessage(response.data.message);
          setTimeout(() => setCodeValidationMessage(""), 3000);
          return;
        }
        appliedDiscount = response.data.code;
      } catch (err) {
        setCodeValidationMessage("Erreur de validation du code promo");
        setTimeout(() => setCodeValidationMessage(""), 3000);
        return;
      }
    }

    if (isExistingUser) {
      if (!selectedUserId) return;
      const user = users.find(u => u.id === selectedUserId);
      finalUserId = user.id;
      finalUserName = user.name;
      finalUserEmail = user.email;
      finalUserWhatsapp = user.whatsapp;
    } else {
      if (!userName || !userEmail) return;
      finalUserId = `user-${Date.now()}`;
      finalUserName = userName;
      finalUserEmail = userEmail;
      finalUserWhatsapp = userWhatsapp;
    }

    const [hours, minutes] = selectedCourse.time.split(':');
    const dateTimeWithCourseTime = new Date(selectedDate);
    dateTimeWithCourseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const tempReservation = {
      userId: finalUserId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userWhatsapp: finalUserWhatsapp,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      courseTime: selectedCourse.time,
      datetime: dateTimeWithCourseTime.toISOString(),
      offerId: selectedOffer.id,
      offerName: selectedOffer.name,
      price: selectedOffer.price,
      quantity: quantity,
      totalPrice: selectedOffer.price * quantity,
      discountCode: appliedDiscount ? appliedDiscount.code : null,
      discountType: appliedDiscount ? appliedDiscount.type : null,
      discountValue: appliedDiscount ? appliedDiscount.value : null,
      appliedDiscount: appliedDiscount
    };

    // Free reservation case
    if (appliedDiscount && isDiscountGratuit(appliedDiscount)) {
      if (!isExistingUser) {
        setCodeValidationMessage("Seuls les abonnés avec un profil existant peuvent utiliser ce code gratuit.");
        setTimeout(() => setCodeValidationMessage(""), 4000);
        return;
      }

      setLoading(true);
      try {
        const reservationData = {
          ...tempReservation,
          totalPrice: 0
        };
        const response = await axios.post(`${API}/reservations`, reservationData);
        
        await axios.post(`${API}/discount-codes/${appliedDiscount.id}/use`);

        const dateFormatted = new Date(response.data.datetime).toLocaleDateString('fr-CH', {
          weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
        }) + ' à ' + new Date(response.data.datetime).toLocaleTimeString('fr-CH', {
          hour: '2-digit', minute: '2-digit'
        });

        setLastReservationData({
          ...response.data,
          formattedDate: dateFormatted,
          totalPrice: "0.00"
        });

        sendNotification("coach", response.data);
        sendNotification("user", response.data);
        setShowSuccess(true);
        resetForm();
      } catch (err) {
        console.error("Error creating reservation:", err);
        setCodeValidationMessage("Erreur lors de la réservation");
      }
      setLoading(false);
      return;
    }

    // Paid reservation case
    const hasPaymentMethods = paymentLinks.stripe?.trim() || paymentLinks.paypal?.trim() || paymentLinks.twint?.trim();
    if (!hasPaymentMethods) {
      setCodeValidationMessage("Paiement requis – réservation impossible sans paiement configuré.");
      setTimeout(() => setCodeValidationMessage(""), 4000);
      return;
    }

    setPendingReservation(tempReservation);

    // Create user if new
    if (!isExistingUser) {
      try {
        await axios.post(`${API}/users`, {
          name: finalUserName,
          email: finalUserEmail,
          whatsapp: finalUserWhatsapp
        });
      } catch (err) {
        console.error("Error creating user:", err);
      }
    }

    // Open payment link
    if (paymentLinks.twint?.trim()) {
      window.open(paymentLinks.twint, '_blank');
    } else if (paymentLinks.stripe?.trim()) {
      window.open(paymentLinks.stripe, '_blank');
    } else if (paymentLinks.paypal?.trim()) {
      window.open(paymentLinks.paypal, '_blank');
    }

    setTimeout(() => setShowConfirmPayment(true), 800);
  };

  const confirmReservation = async () => {
    if (!pendingReservation) return;
    setLoading(true);

    try {
      const response = await axios.post(`${API}/reservations`, pendingReservation);

      if (pendingReservation.appliedDiscount) {
        await axios.post(`${API}/discount-codes/${pendingReservation.appliedDiscount.id}/use`);
      }

      const dateFormatted = new Date(response.data.datetime).toLocaleDateString('fr-CH', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      }) + ' à ' + new Date(response.data.datetime).toLocaleTimeString('fr-CH', {
        hour: '2-digit', minute: '2-digit'
      });

      setLastReservationData({
        ...response.data,
        formattedDate: dateFormatted
      });

      sendNotification("coach", response.data);
      sendNotification("user", response.data);
      setShowSuccess(true);
      setShowConfirmPayment(false);
      resetForm();
    } catch (err) {
      console.error("Error creating reservation:", err);
      setCodeValidationMessage("Erreur lors de la réservation");
    }
    setLoading(false);
  };

  const renderCourseDates = (course) => {
    const dates = getNextOccurrences(course.weekday);
    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {dates.map((date, idx) => {
          const sessionId = `${course.id}-${date.getTime()}`;
          const isSelected = selectedSession === sessionId;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => { 
                setSelectedCourse(course); 
                setSelectedDate(date); 
                setSelectedSession(sessionId); 
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected ? 'neon-border' : 'glass hover:border-purple-500'}`}
              style={{
                color: config.text_color,
                fontSize: `${config.font_size * 0.875}px`,
                borderColor: isSelected ? config.primary_color : 'rgba(148, 27, 181, 0.4)',
                background: isSelected ? 'rgba(217, 28, 210, 0.3)' : undefined
              }}
              data-testid={`date-btn-${course.id}-${idx}`}
            >
              {formatDate(date, course.time)} {isSelected ? '✔' : ''}
            </button>
          );
        })}
      </div>
    );
  };

  // Show splash screen
  if (showSplash) return <SplashScreen />;

  // Show coach login
  if (showCoachLogin) {
    return (
      <CoachLogin 
        config={config} 
        onLogin={() => { setCoachMode(true); setShowCoachLogin(false); }} 
        onCancel={() => setShowCoachLogin(false)} 
      />
    );
  }

  // Show coach dashboard
  if (coachMode) {
    return (
      <CoachDashboard 
        config={config} 
        onBack={() => setCoachMode(false)} 
        onLogout={() => setCoachMode(false)} 
      />
    );
  }

  const visibleOffers = offers.filter(o => o.visible !== false);
  const uniqueUsers = Array.from(new Map(users.map(u => [u.email, u])).values());
  const currentSelectedUserEmail = isExistingUser ? uniqueUsers.find(u => u.id === selectedUserId)?.email : userEmail;
  const foundDiscountCode = discountCodes.find(c => c.code === discountCode && c.active);
  const isGratuit = isExistingUser && foundDiscountCode && isDiscountGratuit(foundDiscountCode) && 
    (!foundDiscountCode.assignedEmail || foundDiscountCode.assignedEmail.toLowerCase() === (currentSelectedUserEmail || "").toLowerCase());

  return (
    <div className="w-full min-h-screen p-6" 
         style={{ background: `radial-gradient(circle at top, ${config.gradient_color} 0%, ${config.background_color} 45%)`, fontFamily: `${config.font_family}, system-ui, sans-serif` }}>
      
      {/* Confirm Payment Overlay */}
      {showConfirmPayment && (
        <ConfirmPaymentOverlay 
          config={config} 
          onConfirm={confirmReservation} 
          onCancel={() => { setShowConfirmPayment(false); setPendingReservation(null); }} 
        />
      )}

      {/* Success Overlay */}
      {showSuccess && lastReservationData && (
        <SuccessOverlay 
          config={config} 
          reservationData={lastReservationData} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bold mb-2" style={{ color: config.text_color, fontSize: `${config.font_size * 2.5}px` }} data-testid="app-title">
            {config.app_title}
          </h1>
          <p className="concept-glow max-w-2xl mx-auto opacity-80" style={{ color: config.text_color, fontSize: `${config.font_size * 0.875}px` }}>
            {concept.description || config.concept_description}
          </p>
        </div>

        {/* Hero Image */}
        {concept.heroImageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={concept.heroImageUrl} alt="Afroboost" className="w-full h-64 object-cover" />
          </div>
        )}

        {/* Courses Section */}
        <div className="mb-8">
          <h2 className="font-semibold mb-4" style={{ color: config.text_color, fontSize: `${config.font_size * 1.25}px` }}>
            {t("chooseSession")}
          </h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div 
                key={course.id} 
                className={`course-card glass rounded-xl p-5 ${selectedCourse?.id === course.id ? 'selected' : ''}`}
                data-testid={`course-card-${course.id}`}
              >
                <h3 className="font-semibold" style={{ color: config.text_color }}>{course.name}</h3>
                <p className="text-xs opacity-60 mb-3" style={{ color: config.text_color }}>📍 {course.locationName}</p>
                {renderCourseDates(course)}
              </div>
            ))}
          </div>
        </div>

        {/* Offers Section */}
        {selectedCourse && selectedDate && (
          <div className="mb-8">
            <h2 className="font-semibold mb-4" style={{ color: config.text_color, fontSize: `${config.font_size * 1.25}px` }}>
              {config.choose_offer_text}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleOffers.map(offer => (
                <div 
                  key={offer.id} 
                  onClick={() => setSelectedOffer(offer)} 
                  className={`offer-card glass rounded-xl p-5 text-center ${selectedOffer?.id === offer.id ? 'selected' : ''}`}
                  data-testid={`offer-card-${offer.id}`}
                >
                  <h3 className="font-semibold" style={{ color: config.text_color }}>{offer.name}</h3>
                  <p className="font-bold text-xl" style={{ color: config.primary_color }}>CHF {offer.price}.-</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservation Form */}
        {selectedOffer && (
          <form onSubmit={handlePaymentClick}>
            <div className="glass rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-4" style={{ color: config.text_color, fontSize: `${config.font_size * 1.25}px` }}>
                {config.user_info_text}
              </h2>
              
              {/* Existing User Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: config.text_color }}>
                  <input 
                    type="checkbox" 
                    checked={isExistingUser} 
                    onChange={(e) => setIsExistingUser(e.target.checked)}
                    data-testid="existing-user-checkbox"
                  />
                  <span className="text-sm">Je suis déjà abonné</span>
                </label>
              </div>

              <div className="space-y-4">
                {isExistingUser ? (
                  <select 
                    required 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)} 
                    className="w-full p-3 glass rounded-lg" 
                    style={{ color: config.text_color }}
                    data-testid="existing-user-select"
                  >
                    <option value="">Sélectionnez votre profil...</option>
                    {uniqueUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nom complet" 
                      value={userName} 
                      onChange={e => setUserName(e.target.value)} 
                      className="w-full p-3 glass rounded-lg" 
                      style={{ color: config.text_color }}
                      data-testid="user-name-input"
                    />
                    <input 
                      type="email" 
                      required 
                      placeholder="Email (obligatoire)" 
                      value={userEmail} 
                      onChange={e => setUserEmail(e.target.value)} 
                      className="w-full p-3 glass rounded-lg" 
                      style={{ color: config.text_color }}
                      data-testid="user-email-input"
                    />
                    <input 
                      type="tel" 
                      required 
                      placeholder="WhatsApp (obligatoire)" 
                      value={userWhatsapp} 
                      onChange={e => setUserWhatsapp(e.target.value)} 
                      className="w-full p-3 glass rounded-lg" 
                      style={{ color: config.text_color }}
                      data-testid="user-whatsapp-input"
                    />
                  </>
                )}

                {/* Discount Code */}
                <input 
                  type="text" 
                  placeholder="Code promo" 
                  value={discountCode} 
                  onChange={e => setDiscountCode(e.target.value)} 
                  className="w-full p-3 glass rounded-lg" 
                  style={{ color: config.text_color, borderColor: config.secondary_color }}
                  data-testid="discount-code-input"
                />

                {codeValidationMessage && (
                  <p className="text-red-500 text-xs font-bold" data-testid="validation-message">
                    {codeValidationMessage}
                  </p>
                )}

                {/* Total */}
                <div className="p-4 rounded-lg bg-white/5 border-l-4" style={{ borderColor: config.primary_color }}>
                  <p className="font-bold" style={{ color: config.text_color }} data-testid="total-price">
                    Total : CHF {isGratuit ? "0.00" : (selectedOffer.price * quantity).toFixed(2)}
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer text-xs opacity-70" style={{ color: config.text_color }}>
                  <input 
                    type="checkbox" 
                    required 
                    checked={hasAcceptedTerms} 
                    onChange={e => setHasAcceptedTerms(e.target.checked)}
                    data-testid="terms-checkbox"
                  />
                  <span>J'accepte les conditions et confirme ma réservation.</span>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!hasAcceptedTerms || loading} 
              className="btn-primary w-full py-4 rounded-xl font-bold uppercase tracking-wide"
              data-testid="submit-reservation-btn"
            >
              {loading ? "Chargement..." : isGratuit ? "Réserver gratuitement" : "💳 Payer et réserver"}
            </button>
          </form>
        )}

        {/* Footer */}
        <footer 
          className="mt-12 mb-8 text-center opacity-40 text-xs cursor-pointer" 
          style={{ color: config.text_color }}
          onDoubleClick={() => setShowCoachLogin(true)}
          data-testid="footer-coach-access"
        >
          © Afroboost 2026 — Accès Coach
        </footer>
      </div>
    </div>
  );
}

export default App;
