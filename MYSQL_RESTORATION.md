# Guide: Revenir à MySQL

Ce document explique comment revenir à MySQL après la phase de développement initial avec SQLite.

## État actuel
- **Base de données**: SQLite (`tenams.db`)
- **Fichier config**: `backend/db.py`

## Comment revenir à MySQL

### Étape 1: Modifier `backend/db.py`

Remplacez la configuration SQLite par MySQL:

```python
# ❌ Commentaire: Configuration actuelle (SQLite)
# DATABASE_URL = "sqlite:///./tenams.db"

# ✅ Décommenter: Configuration MySQL originale
DATABASE_URL = "mysql+pymysql://root:Fa2023word@localhost/tenams"

# Et modifiez le create_engine:
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True  # Simplifié pour MySQL
)
```

### Étape 2: Installer le driver MySQL

```bash
pip install pymysql
# ou
pip install -r requirements.txt  # après avoir décommenté pymysql
```

### Étape 3: Configurer MySQL

1. Assurez-vous que MySQL Server est en cours d'exécution
2. Créez la base de données:
```sql
CREATE DATABASE tenams;
```

### Étape 4: Redémarrer le serveur

```bash
python backend/index.py
```

## Notes importantes

- Les modèles SQLAlchemy doivent être les mêmes (compatible avec MySQL et SQLite)
- Les identifiants de connexion MySQL: `root:Fa2023word@localhost`
- Base de données: `tenams`

## Dépannage

Si vous avez des erreurs de connexion:
- Vérifiez que MySQL Server est en cours d'exécution
- Vérifiez les identifiants (utilisateur et mot de passe)
- Vérifiez que la base de données `tenams` existe
- Installez `pymysql`: `pip install pymysql`

## Fichiers affectés

- `backend/db.py` - Configuration de la base de données
- `backend/requirements.txt` - Dépendances Python (décommenter pymysql)
- `backend/index.py` - Serveur FastAPI
