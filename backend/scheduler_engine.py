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


def validate_cta_link(cta_link):
    """
    Valide et normalise un lien CTA.
    Force le préfixe https:// si absent.
    
    Args:
        cta_link: URL du bouton CTA
        
    Returns:
        str: URL validée avec préfixe https://
    """
    if not cta_link:
        return None
    
    validated_link = cta_link.strip()
    if validated_link and not validated_link.startswith(('http://', 'https://', '#')):
        validated_link = 'https://' + validated_link
    return validated_link


def scheduler_send_email_sync(to_email, to_name, subject, message, media_url=None):
    """
    Envoi synchrone d'email pour le scheduler (utilise requests).
    Appelle l'API interne /api/campaigns/send-email
    """
    import requests
    try:
        response = requests.post(
            "http://localhost:8001/api/campaigns/send-email",
            json={
                "to_email": to_email,
                "to_name": to_name,
                "subject": subject,
                "message": message,
                "media_url": media_url
            },
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                return True, None
            return False, result.get("error", "Unknown error")
        return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)


def scheduler_send_internal_message_sync(scheduler_db, conversation_id, message_text, conversation_name="", media_url=None, cta_type=None, cta_text=None, cta_link=None):
    """
    Envoi synchrone de message INTERNE dans une conversation.
    
    Args:
        scheduler_db: Connexion MongoDB synchrone
        conversation_id: ID de la session/conversation cible
        message_text: Contenu du message
        conversation_name: Nom de la conversation (pour logs)
        media_url: URL du média (YouTube, Drive, image)
        cta_type: Type de CTA ('reserver', 'offre', 'personnalise')
        cta_text: Texte du bouton CTA
        cta_link: URL du bouton CTA
    
    Returns:
        (success: bool, error: str|None, session_id: str|None)
    """
    import requests
    import uuid as uuid_module
    
    try:
        # Remplacer {prénom} par le nom de la conversation ou "ami(e)"
        processed_message = message_text.replace("{prénom}", conversation_name or "ami(e)").replace("{prenom}", conversation_name or "ami(e)")
        
        # Vérifier si la conversation existe
        session = scheduler_db.chat_sessions.find_one(
            {"id": conversation_id, "is_deleted": {"$ne": True}},
            {"_id": 0, "id": 1, "mode": 1}
        )
        
        if not session:
            # Vérifier si c'est un groupe standard
            if conversation_id in ["community", "vip", "promo"]:
                new_session_id = str(uuid_module.uuid4())
                new_session = {
                    "id": new_session_id,
                    "participant_ids": [],
                    "mode": conversation_id,
                    "is_ai_active": False,
                    "is_deleted": False,
                    "link_token": str(uuid_module.uuid4())[:12],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "title": f"💬 Groupe {conversation_id.capitalize()}"
                }
                scheduler_db.chat_sessions.insert_one(new_session)
                session = new_session
                conversation_id = new_session_id
                print(f"[SCHEDULER-INTERNAL] ✅ Nouvelle session '{conversation_id}' créée")
            else:
                print(f"[SCHEDULER-INTERNAL] ❌ Session non trouvée: {conversation_id}")
                return False, f"Session non trouvée: {conversation_id}", None
        else:
            conversation_id = session.get("id")
        
        mode = session.get("mode", "user")
        
        # Créer le message du Coach avec média et CTA
        coach_message = {
            "id": str(uuid_module.uuid4()),
            "session_id": conversation_id,
            "sender_id": "coach",
            "sender_name": "💪 Coach Bassi",
            "sender_type": "coach",
            "content": processed_message,
            "mode": mode,
            "is_deleted": False,
            "notified": False,
            "scheduled": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Ajouter les champs média et CTA si présents
        if media_url:
            coach_message["media_url"] = media_url
        if cta_type:
            coach_message["cta_type"] = cta_type
        if cta_text:
            coach_message["cta_text"] = cta_text
        if cta_link:
            coach_message["cta_link"] = validate_cta_link(cta_link)
        
        # Insertion dans la base
        scheduler_db.chat_messages.insert_one(coach_message)
        
        print(f"[SCHEDULER-INTERNAL] ✅ Message inséré dans DB - Session: {conversation_id}")
        
        # Émettre via Socket.IO
        try:
            socket_message = {
                "id": coach_message["id"],
                "type": "coach",
                "text": processed_message,
                "sender": "💪 Coach Bassi",
                "senderId": "coach",
                "sender_type": "coach",
                "scheduled": True,
                "created_at": coach_message["created_at"]
            }
            
            if media_url:
                socket_message["media_url"] = media_url
            if cta_type:
                socket_message["cta_type"] = cta_type
            if cta_text:
                socket_message["cta_text"] = cta_text
            if cta_link:
                socket_message["cta_link"] = validate_cta_link(cta_link)
            
            response = requests.post(
                "http://localhost:8001/api/scheduler/emit-group-message",
                json={"session_id": conversation_id, "message": socket_message},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"[SCHEDULER-INTERNAL] ✅ Socket.IO émis")
        except Exception as socket_err:
            print(f"[SCHEDULER-INTERNAL] ⚠️ Socket.IO exception: {socket_err}")
        
        return True, None, conversation_id
        
    except Exception as e:
        print(f"[SCHEDULER-INTERNAL] ❌ Exception: {e}")
        return False, str(e), None


def scheduler_send_group_message_sync(scheduler_db, target_group_id, message_text, media_url=None, cta_type=None, cta_text=None, cta_link=None):
    """
    Envoie un message dans le groupe de chat communautaire.
    
    Args:
        scheduler_db: Connexion MongoDB synchrone
        target_group_id: ID du groupe cible
        message_text: Contenu du message
        media_url: URL du média
        cta_type, cta_text, cta_link: Données CTA
    
    Returns:
        (success: bool, error: str|None, session_id: str|None)
    """
    import requests
    import uuid as uuid_module
    
    try:
        # Remplacer {prénom} par "Communauté"
        processed_message = message_text.replace("{prénom}", "Communauté").replace("{prenom}", "Communauté")
        
        # Trouver ou créer la session communautaire
        community_session = scheduler_db.chat_sessions.find_one({
            "mode": "community",
            "is_deleted": {"$ne": True}
        }, {"_id": 0})
        
        if not community_session:
            new_session_id = str(uuid_module.uuid4())
            new_session = {
                "id": new_session_id,
                "participant_ids": [],
                "mode": "community",
                "is_ai_active": False,
                "is_deleted": False,
                "link_token": str(uuid_module.uuid4())[:12],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "title": "💬 Communauté Afroboost"
            }
            scheduler_db.chat_sessions.insert_one(new_session)
            session_id = new_session_id
            print(f"[SCHEDULER-GROUP] ✅ Nouvelle session communautaire créée: {session_id}")
        else:
            session_id = community_session.get("id")
        
        # Créer le message
        coach_message = {
            "id": str(uuid_module.uuid4()),
            "session_id": session_id,
            "sender_id": "coach",
            "sender_name": "💪 Coach Bassi",
            "sender_type": "coach",
            "content": processed_message,
            "mode": "community",
            "is_deleted": False,
            "notified": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        if media_url:
            coach_message["media_url"] = media_url
        if cta_type:
            coach_message["cta_type"] = cta_type
        if cta_text:
            coach_message["cta_text"] = cta_text
        if cta_link:
            coach_message["cta_link"] = validate_cta_link(cta_link)
        
        scheduler_db.chat_messages.insert_one(coach_message)
        
        print(f"[SCHEDULER-GROUP] ✅ Message inséré pour session {session_id}")
        
        # Émission Socket.IO
        socket_message = {
            "id": coach_message["id"],
            "type": "coach",
            "text": processed_message,
            "sender": "💪 Coach Bassi",
            "senderId": "coach",
            "sender_type": "coach",
            "created_at": coach_message["created_at"]
        }
        
        if media_url:
            socket_message["media_url"] = media_url
        if cta_type:
            socket_message["cta_type"] = cta_type
        if cta_text:
            socket_message["cta_text"] = cta_text
        if cta_link:
            socket_message["cta_link"] = validate_cta_link(cta_link)
        
        response = requests.post(
            "http://localhost:8001/api/scheduler/emit-group-message",
            json={"session_id": session_id, "message": socket_message},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"[SCHEDULER-GROUP] ✅ Socket.IO OK")
            return True, None, session_id
        else:
            print(f"[SCHEDULER-GROUP] ⚠️ Socket.IO: {response.status_code}")
            return True, "Message saved but Socket.IO failed", session_id
            
    except Exception as e:
        print(f"[SCHEDULER-GROUP] ❌ Exception: {e}")
        return False, str(e), None
