/**
 * MediaViewer Component
 * Lecteur média unifié Afroboost - masque YouTube derrière afroboosteur.com
 */
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const MediaViewer = ({ slug }) => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const response = await axios.get(`${API}/api/media/${slug}`);
        setMedia(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Média non trouvé');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMedia();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl mb-4">❌ {error}</div>
        <a 
          href="https://afroboosteur.com" 
          className="px-6 py-3 rounded-lg text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #d91cd2, #8b5cf6)' }}
        >
          Retour à l'accueil
        </a>
      </div>
    );
  }

  // Construire l'URL YouTube embed épurée
  const youtubeEmbedUrl = media.youtube_id 
    ? `https://www.youtube.com/embed/${media.youtube_id}?autoplay=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0`
    : media.video_url;

  return (
    <div className="min-h-screen bg-black">
      {/* Header Afroboost */}
      <header className="py-4 px-6" style={{ background: 'linear-gradient(135deg, #d91cd2, #8b5cf6)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="https://afroboosteur.com" className="text-white text-xl font-bold">
            Afroboost
          </a>
          <span className="text-white/70 text-sm">
            {media.views} vue{media.views > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Titre */}
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-6 text-center">
          {media.title}
        </h1>

        {/* Lecteur vidéo */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-xl"
            src={youtubeEmbedUrl}
            title={media.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ 
              boxShadow: '0 0 40px rgba(217, 28, 210, 0.3)',
              border: '2px solid rgba(217, 28, 210, 0.5)'
            }}
          />
        </div>

        {/* Description */}
        {media.description && (
          <p className="text-white/80 text-center mt-6 text-lg leading-relaxed">
            {media.description}
          </p>
        )}

        {/* Bouton CTA */}
        {media.cta_text && media.cta_link && (
          <div className="mt-8 text-center">
            <a
              href={media.cta_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-xl text-white text-lg font-bold transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #d91cd2, #8b5cf6)',
                boxShadow: '0 0 30px rgba(217, 28, 210, 0.5)'
              }}
            >
              {media.cta_text}
            </a>
          </div>
        )}

        {/* Partage */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm mb-3">Partager cette vidéo</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://afroboosteur.com/v/${media.slug}`);
                alert('Lien copié !');
              }}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20"
            >
              📋 Copier le lien
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(media.title + ' - https://afroboosteur.com/v/' + media.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
            >
              📱 WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <a 
          href="https://afroboosteur.com" 
          className="text-white/50 text-sm hover:text-white"
        >
          © Afroboost 2026
        </a>
      </footer>
    </div>
  );
};

export default MediaViewer;
