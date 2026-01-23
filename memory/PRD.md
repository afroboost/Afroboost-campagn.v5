# Afroboost - Product Requirements Document

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

### Système de Lecteur Média Unifié (V4 - 23 Jan 2026)
- [x] **MediaViewer Mode Cinéma V4** : Player ZÉRO PUB via Google Drive
- [x] **Bouton Play rose #E91E63** : Design personnalisé au centre de la thumbnail
- [x] **Support Google Drive** : Lecture native sans marquage externe
- [x] **Support vidéos directes** : MP4/WebM via `<video>` HTML5 natif
- [x] **Bouton CTA rose #E91E63** : Point focal sous la vidéo, cliquable
- [x] **Responsive mobile** : Design adaptatif vérifié sur iPhone X
- [x] **Template Email V3** : Ratio texte/image amélioré, salutation personnalisée

---

## What's Been Implemented (23 Jan 2026)

### MediaViewer V4 - Lecture ZÉRO PUB
1. ✅ **Support Google Drive** : Conversion automatique des liens en URL de preview/streaming
2. ✅ **AUCUN marquage YouTube** : La vidéo Google Drive se lit sans logo externe
3. ✅ **Bouton Play personnalisé** : SVG rose #E91E63 au centre de la thumbnail
4. ✅ **Support multi-sources** : Google Drive, MP4/WebM directs, YouTube (fallback)
5. ✅ **Bouton CTA proéminent** : Rose #E91E63, uppercase, letter-spacing
6. ✅ **Responsive mobile** : Testé sur viewport 375x812 (iPhone X)

### Template Email V3 - Délivrabilité Maximale
1. ✅ **Salutation personnalisée** : "Salut {prénom},"
2. ✅ **Texte AVANT image** : Améliore ratio texte/image
3. ✅ **Structure table HTML** : Compatibilité email maximale
4. ✅ **Bouton CTA #E91E63** : Cohérent avec la marque

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py       # FastAPI avec Media API, Google Drive support
│   └── .env            # MONGO_URL, RESEND_API_KEY, FRONTEND_URL
└── frontend/
    ├── src/
    │   ├── App.js      # Point d'entrée, routage /v/{slug}
    │   ├── components/
    │   │   ├── CoachDashboard.js # Monolithe ~6000 lignes
    │   │   └── MediaViewer.js    # Lecteur vidéo V4 - ZÉRO PUB
    │   └── services/
    └── .env            # REACT_APP_BACKEND_URL
```

### Key API Endpoints - Media
- `POST /api/media/create`: Crée un lien média
- `GET /api/media`: Liste tous les liens
- `GET /api/media/{slug}`: Récupère les détails + incrémente vues
- `PUT /api/media/{slug}`: Modifie video_url, title, description, cta_text, cta_link
- `DELETE /api/media/{slug}`: Supprime un lien
- `GET /api/share/{slug}`: Page HTML OpenGraph pour aperçus WhatsApp

### Data Model - media_links
```json
{
  "id": "uuid",
  "slug": "string",
  "video_url": "https://drive.google.com/file/d/{ID}/view | https://example.com/video.mp4",
  "youtube_id": "xxx (optionnel, fallback)",
  "title": "string",
  "description": "string",
  "thumbnail": "url",
  "cta_text": "RÉSERVER MA PLACE",
  "cta_link": "https://afroboosteur.com",
  "views": 0,
  "created_at": "ISO date"
}
```

### Sources Vidéo Supportées
| Source | Méthode de lecture | Marquage |
|--------|-------------------|----------|
| Google Drive | iframe preview | Aucun logo externe |
| MP4/WebM directs | `<video>` HTML5 | Aucun |
| YouTube (fallback) | iframe embed | Logo YouTube (après clic) |

---

## Prioritized Backlog

### P0 - Completed ✅
- [x] MediaViewer V4 avec Google Drive (ZÉRO PUB)
- [x] Template Email V3 avec ratio texte/image
- [x] Responsive mobile vérifié

### P1 - À faire
- [ ] **Refactoring CoachDashboard.js** : Extraire composants (>6000 lignes)
- [ ] **Export CSV contacts CRM** : Valider le flux de bout en bout

### P2 - Backlog
- [ ] Dashboard analytics pour le coach
- [ ] Support upload vidéo direct depuis le dashboard
- [ ] Manuel utilisateur

---

## Credentials & URLs de Test
- **Coach Access**: 3 clics rapides sur "© Afroboost 2025" → Login Google OAuth
- **Email autorisé**: contact.artboost@gmail.com
- **Test Media Slug**: session-finale
- **URL de test**: https://mediahub-973.preview.emergentagent.com/v/session-finale
- **Vidéo Google Drive**: https://drive.google.com/file/d/1AkjHltEq-PAnw8OE-dR-lPPcpP44qvHv/view

---

## Known Limitations
- **Google Drive** : Petite icône "ouvrir dans un nouvel onglet" visible (limitation Google Drive embed)
- **YouTube fallback** : Si YouTube est utilisé, le branding apparaît après clic sur Play
