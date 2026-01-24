#!/bin/bash
# =========================================
# Script de démarrage du Scheduler Afroboost
# =========================================
# Usage:
#   ./start_scheduler.sh           # Mode boucle (toutes les 60s)
#   ./start_scheduler.sh --once    # Exécution unique
#   ./start_scheduler.sh --dry-run # Mode test sans envoi réel

cd /app/backend

if [ "$1" == "--once" ]; then
    echo "📧 Exécution unique du scheduler..."
    python3 scheduler.py
elif [ "$1" == "--dry-run" ]; then
    echo "🧪 Mode test (dry-run)..."
    python3 scheduler.py --dry-run
else
    echo "🔄 Démarrage du scheduler en mode boucle (CTRL+C pour arrêter)..."
    python3 scheduler.py --loop --interval 60
fi
