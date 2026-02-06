"""
scheduler_engine.py - Moteur de scheduler pour Afroboost

Ce fichier contient les fonctions utilitaires pour le scheduler de campagnes.
Extrait de server.py pour améliorer la maintenabilité.

Date de création: 6 Février 2026
"""

import pytz
from datetime import datetime, timezone
import logging

logger = logging.getLogger("scheduler_engine")

# Fuseau horaire Europe/Paris pour les utilisateurs
PARIS_TZ = pytz.timezone('Europe/Paris')


def parse_campaign_date(date_str):
    """
    Parse une date ISO et la convertit en datetime UTC.
    
    IMPORTANT: Les dates sans fuseau horaire explicite sont interprétées 
    comme Europe/Paris (fuseau horaire de l'utilisateur).
    
    Args:
        date_str: Chaîne de date au format ISO (ex: "2026-02-06T14:30:00")
        
    Returns:
        datetime: Date en UTC ou None si parsing échoué
    """
    if not date_str:
        return None
    try:
        if 'Z' in date_str:
            # Déjà en UTC
            date_str = date_str.replace('Z', '+00:00')
            dt = datetime.fromisoformat(date_str)
        elif '+' in date_str or (len(date_str) > 10 and '-' in date_str[-6:] and ':' in date_str[-3:]):
            # A un fuseau horaire explicite
            dt = datetime.fromisoformat(date_str)
        else:
            # PAS de fuseau = heure Europe/Paris (saisie utilisateur)
            dt = datetime.fromisoformat(date_str)
            dt = PARIS_TZ.localize(dt)  # Interpréter comme heure Paris
        
        # Convertir en UTC pour comparaison uniforme
        if dt.tzinfo is None:
            dt = PARIS_TZ.localize(dt)
        
        dt_utc = dt.astimezone(pytz.UTC)
        return dt_utc
    except Exception as e:
        logger.warning(f"[SCHEDULER] Date parsing error '{date_str}': {e}")
        return None


def get_current_times():
    """
    Retourne les heures actuelles en UTC et Paris.
    
    Returns:
        tuple: (now_utc, now_paris, now_str_utc, now_str_paris)
    """
    now_utc = datetime.now(timezone.utc)
    now_paris = datetime.now(PARIS_TZ)
    now_str_utc = now_utc.strftime('%H:%M:%S')
    now_str_paris = now_paris.strftime('%H:%M:%S')
    return now_utc, now_paris, now_str_utc, now_str_paris


def should_process_campaign_date(date_str, sent_dates, now_utc, campaign_name=""):
    """
    Détermine si une date de campagne doit être traitée.
    
    Args:
        date_str: Date programmée (ISO string)
        sent_dates: Liste des dates déjà envoyées
        now_utc: Heure actuelle en UTC
        campaign_name: Nom de la campagne (pour logging)
        
    Returns:
        tuple: (should_process: bool, parsed_date: datetime or None)
    """
    parsed_date = parse_campaign_date(date_str)
    if not parsed_date:
        print(f"[DEBUG] ⚠️ '{campaign_name}' | Date invalide: {date_str} | SKIP")
        return False, None
    
    is_past = parsed_date <= now_utc
    already_sent = date_str in sent_dates
    should_process = is_past and not already_sent
    
    # Convertir la date prévue en heure Paris pour l'affichage
    parsed_paris = parsed_date.astimezone(PARIS_TZ)
    now_str_paris = now_utc.astimezone(PARIS_TZ).strftime('%H:%M:%S')
    
    # LOG DE DIAGNOSTIC TEMPOREL CLAIR
    status_icon = "✅ ENVOI!" if should_process else ("⏳ Attente" if not is_past else "📨 Déjà envoyé")
    print(f"[DEBUG] {status_icon} '{campaign_name}' | Prévu: {parsed_paris.strftime('%H:%M')} Paris | Maintenant: {now_str_paris} Paris")
    
    return should_process, parsed_date


def format_campaign_result(contact_id, contact_name, channel, success, error=None, session_id=None, sent_at=None):
    """
    Formate un résultat d'envoi de campagne.
    
    Returns:
        dict: Résultat formaté
    """
    return {
        "contactId": contact_id,
        "contactName": contact_name,
        "channel": channel,
        "status": "sent" if success else "failed",
        "error": error if not success else None,
        "sessionId": session_id,
        "sentAt": sent_at or datetime.now(timezone.utc).isoformat()
    }
