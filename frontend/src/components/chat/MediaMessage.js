/**
 * MediaMessage.js - Composant d'affichage de média avec CTA
 * 
 * Affiche un média (image, vidéo YouTube, Google Drive) avec :
 * - Miniature ou lecteur intégré
 * - Description/texte
 * - Bouton d'action (CTA) configurable
 * 
 * === TYPES DE CTA ===
 * - RESERVER : Lien vers la page de réservation
 * - OFFRE : Lien vers une URL de paiement
 * - PERSONNALISE : Texte et URL libres
 */

import React, { memo, useState, useCallback } from 'react';
import { parseMediaUrl } from '../services/MediaParser';

// === ICÔNES FILAIRES FINES ===
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ShoppingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

// === CONFIGURATIONS CTA ===
const CTA_CONFIG = {
  RESERVER: {
    icon: CalendarIcon,
    defaultText: 'RÉSERVER MA PLACE',
    color: '#9333ea', // Violet Afroboost
    hoverColor: '#7c3aed'
  },
  OFFRE: {
    icon: ShoppingIcon,
    defaultText: 'VOIR L\'OFFRE',
    color: '#d91cd2', // Rose Afroboost
    hoverColor: '#c026d3'
  },
  PERSONNALISE: {
    icon: LinkIcon,
    defaultText: 'EN SAVOIR PLUS',
    color: '#6366f1', // Indigo
    hoverColor: '#4f46e5'
  }
};

/**
 * Composant MediaMessage
 * @param {string} mediaUrl - URL du média (YouTube, Drive, image, vidéo)
 * @param {string} description - Texte accompagnant le média
 * @param {object} cta - { type: 'RESERVER'|'OFFRE'|'PERSONNALISE', text: string, url: string }
 * @param {function} onReservationClick - Handler pour le bouton RESERVER (optionnel)
 * @param {boolean} isCompact - Mode compact pour les listes
 */
const MediaMessage = ({
  mediaUrl,
  description,
  cta,
  onReservationClick,
  isCompact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Parser le média
  const mediaInfo = parseMediaUrl(mediaUrl);

  // Gérer le clic sur le CTA
  const handleCtaClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cta?.type === 'RESERVER' && onReservationClick) {
      onReservationClick();
    } else if (cta?.url) {
      window.open(cta.url, '_blank', 'noopener,noreferrer');
    }
  }, [cta, onReservationClick]);

  // Obtenir la config du CTA
  const ctaConfig = cta?.type ? CTA_CONFIG[cta.type] : null;
  const CtaIcon = ctaConfig?.icon || LinkIcon;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(99, 102, 241, 0.15))',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        maxWidth: isCompact ? '280px' : '100%'
      }}
      data-testid="media-message"
    >
      {/* === ZONE MÉDIA === */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: mediaInfo.type === 'youtube' ? '56.25%' : 'auto', // 16:9 pour YouTube
          background: '#000',
          minHeight: isCompact ? '120px' : '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* YouTube - Miniature ou iframe */}
        {mediaInfo.type === 'youtube' && (
          <>
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `url(${mediaInfo.thumbnailUrl}) center/cover no-repeat`,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                data-testid="youtube-play-btn"
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transition: 'transform 0.2s, background 0.2s'
                }}>
                  <PlayIcon />
                </div>
              </button>
            ) : (
              <iframe
                src={`${mediaInfo.embedUrl}&autoplay=1`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video"
              />
            )}
          </>
        )}

        {/* Google Drive - Iframe ou image */}
        {mediaInfo.type === 'drive' && (
          !imageError ? (
            <img
              src={mediaInfo.directUrl}
              alt="Média Google Drive"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <iframe
              src={mediaInfo.embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Google Drive Media"
            />
          )
        )}

        {/* Image directe */}
        {mediaInfo.type === 'image' && (
          <img
            src={mediaInfo.directUrl}
            alt="Média"
            style={{
              width: '100%',
              height: isCompact ? '120px' : '180px',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
          />
        )}

        {/* Vidéo directe */}
        {mediaInfo.type === 'video' && (
          <video
            src={mediaInfo.directUrl}
            controls
            style={{
              width: '100%',
              height: isCompact ? '120px' : '180px',
              objectFit: 'cover'
            }}
          />
        )}

        {/* Fallback si erreur */}
        {(imageError || mediaInfo.type === 'link') && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: '#888'
          }}>
            <LinkIcon />
            <span style={{ fontSize: '12px', marginTop: '8px' }}>Média externe</span>
          </div>
        )}
      </div>

      {/* === DESCRIPTION === */}
      {description && (
        <div style={{
          padding: isCompact ? '8px 12px' : '12px 16px',
          color: '#fff',
          fontSize: isCompact ? '13px' : '14px',
          lineHeight: '1.4'
        }}>
          {description}
        </div>
      )}

      {/* === BOUTON CTA === */}
      {cta && ctaConfig && (
        <div style={{ padding: isCompact ? '8px 12px 12px' : '0 16px 16px' }}>
          <button
            onClick={handleCtaClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '100%',
              padding: isCompact ? '10px 16px' : '12px 20px',
              borderRadius: '12px',
              background: isHovered ? ctaConfig.hoverColor : ctaConfig.color,
              border: 'none',
              color: '#fff',
              fontSize: isCompact ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s, transform 0.1s',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)'
            }}
            data-testid={`cta-${cta.type?.toLowerCase()}`}
          >
            <CtaIcon />
            <span>{cta.text || ctaConfig.defaultText}</span>
            <ExternalIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(MediaMessage);
