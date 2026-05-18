# TENAMS - Technical Asset Management Platform

Plateforme de gestion des équipements et de la maintenance en maison (In-House) et en projet.

## 🚀 Démarrage rapide

### Prérequis
- Python 3.10+ (testé avec Python 3.10.18)
- Node.js 18+ et npm
- Git

---

## ⚡ Démarrage rapide (Copier-Coller)

### Terminal 1 - Backend

```bash
cd backend
python -m pip install -r requirements.txt
python index.py
```

**Attendez le message:** `Uvicorn running on http://127.0.0.1:8001`

### Terminal 2 - Frontend (ouvrir un NOUVEAU terminal)

```bash
cd frontend/tenams
npm install
npm run dev
```

**Attendez le message:** `Local: http://localhost:5173/`

---

### 🔄 Option: Nettoyer les données au démarrage

Si vous voulez supprimer toutes les données importées **à chaque démarrage** du backend:

**Terminal 1 - Backend AVEC NETTOYAGE:**

```bash
cd backend
python -m pip install -r requirements.txt
RESET_DB=true python index.py
```

Cela réinitialisera la base de données et les données CSV importées seront supprimées.

---

## 📋 Exécution manuelle détaillée

### Phase 1: Configuration du Backend (SQLite temporaire)

#### 1.1 Installer les dépendances Python

Ouvrez un terminal dans le dossier racine du projet et exécutez:

```bash
cd backend
python -m pip install -r requirements.txt
```

**Packages installés:**
- `fastapi` - Framework web
- `sqlalchemy` - ORM base de données
- `uvicorn` - Serveur ASGI
- `pydantic` - Validation des données
- `PyJWT` - Authentification JWT
- `passlib` & `bcrypt` - Hachage des mots de passe
- `python-jose` - Gestion JWT
- `python-dateutil` - Gestion des dates
- `pandas` & `openpyxl` - Traitement CSV/Excel
- `argon2-cffi` - Hachage Argon2

#### 1.2 Lancer le serveur FastAPI

```bash
python index.py
```

**Résultat attendu:**
```
Role already exists: Administrator
Roles inserted successfully.
✓ Admin user already exists
INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

**Points d'accès:**
- API REST: **http://127.0.0.1:8001**
- Swagger UI (Documentation): **http://127.0.0.1:8001/docs**
- ReDoc: **http://127.0.0.1:8001/redoc**

---

### Phase 2: Configuration du Frontend (Vite + React)

#### 2.1 Installer les dépendances npm

Ouvrez un **NOUVEAU terminal** et exécutez:

```bash
cd frontend/tenams
npm install
```

#### 2.2 Lancer le serveur de développement Vite

```bash
npm run dev
```

**Résultat attendu:**
```
  VITE v7.1.9  ready in 1785 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**URL d'accès:** **http://localhost:5173/**

---

## 👤 Création de compte utilisateur

### Compte Admin par défaut

Un compte administrateur est créé automatiquement au démarrage du backend:

**Identifiants:**
- **Username**: `admin`
- **Password**: `admin123`
- **Rôle**: Administrator

**Accès Admin Panel:**
1. Se connecter avec `admin/admin123`
2. Vous serez redirigé vers `/user/list` (Admin Panel)
3. Accès complet aux pages In-House Data

> ⚠️ **Important**: Changez le mot de passe admin en production!

### Via l'interface web

1. **Accédez à l'application**: `http://localhost:5173/`
2. **Page de connexion** s'affiche
3. **Cliquez sur**: "Don't have an account? Sign up"
4. **Remplissez le formulaire** avec:
   - Username
   - Email
   - Password
   - Department
   - Position
   - Shift
   - Rôles

5. **Cliquez sur "Sign Up"**

Vous pourrez ensuite vous connecter avec vos identifiants créés.

---

## 🧹 Utilitaires - Nettoyer les données CSV importées

### ⚠️ Important: Le nettoyage N'est PAS automatique

Les données importées via CSV **persistent** à chaque redémarrage du backend. Vous devez **nettoyer manuellement** si vous le souhaitez.

### Option 1: Script automatique (recommandé)

Avant de lancer le backend, ouvrez un terminal dans le dossier `backend` et exécutez:

```bash
python clear_all_data.py
```

**Résultat attendu:**
```
==================================================
📊 Data Before Cleanup:
==================================================
  • Equipment: 228 records
  • Planned Maintenance: 175 records
  • Spare Parts: 570 records
  • Total: 973 records

==================================================
✅ Data After Cleanup:
==================================================
  • Equipment: 0 records (deleted 228)
  • Planned Maintenance: 0 records (deleted 175)
  • Spare Parts: 0 records (deleted 570)
  • Total: 0 records

✨ All CSV data cleared successfully!
```

### Option 2: Script interactif

Pour plus de contrôle:

```bash
cd backend
python clean_data.py
```

Sélectionnez l'option que vous préférez:
- **1**: Clear ALL data
- **2**: Clear Equipment only
- **3**: Clear Maintenance Plans only
- **4**: Clear Spare Parts only
- **5**: Exit (no changes)

### Option 3: Réinitialiser complètement la base de données

Si vous voulez une base de données complètement vierge (y compris les users):

**Windows:**
```powershell
Remove-Item backend/tenams.db -Force
python index.py
```

**Linux/Mac:**
```bash
rm backend/tenams.db
python index.py
```

Le backend créera une nouvelle base de données avec l'admin par défaut.

---

## 📁 Architecture du projet

```
abir/
├── backend/                          # API FastAPI avec SQLite
│   ├── auth/                        # Authentification & JWT
│   ├── models/                      # Modèles SQLAlchemy
│   ├── routes/                      # Points d'accès API
│   ├── schemas/                     # Validation Pydantic
│   ├── utils/                       # Utilitaires
│   ├── db.py                        # Configuration BD (SQLite)
│   ├── index.py                     # Serveur FastAPI
│   ├── requirements.txt             # Dépendances Python
│   └── tenams.db                    # Base de données SQLite (local)
│
├── frontend/                         # Application React + Vite
│   └── tenams/
│       ├── src/
│       │   ├── api/                 # Appels API
│       │   ├── components/          # Composants React
│       │   ├── pages/               # Pages de l'application
│       │   ├── context/             # Contexte React (Auth)
│       │   └── utils/               # Utilitaires
│       └── package.json             # Dépendances npm
│
├── .gitignore                        # Fichiers à ignorer (BD, cache)
├── MYSQL_RESTORATION.md             # Guide pour revenir à MySQL
└── README.md                         # Ce fichier
```

---

## ⚙️ Commandes utiles

### Backend (Python)

| Commande | Description |
|----------|-------------|
| `python index.py` | Lancer le serveur FastAPI |
| `RESET_DB=true python index.py` | Lancer et réinitialiser la BD au démarrage |
| `python clear_all_data.py` | Nettoyer toutes les données CSV |
| `python clean_data.py` | Menu interactif pour nettoyer les données |
| `python -m pip install -r requirements.txt` | Installer/mettre à jour les dépendances |

### Frontend (npm)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Construire l'application pour la production |
| `npm run lint` | Vérifier la syntaxe du code |
| `npm audit` | Vérifier les vulnérabilités des dépendances |

---

## 🐛 Troubleshooting

### Le backend ne démarre pas

**Vérifier Python:**
```bash
python --version
```

Assurez-vous que Python 3.10+ est installé.

**Réinstaller les dépendances:**
```bash
cd backend
python -m pip install --upgrade -r requirements.txt
```

### Le port 8001 est déjà utilisé

Trouvez le processus qui utilise le port:
```powershell
netstat -ano | findstr :8001
```

Terminez le processus:
```powershell
taskkill /PID <PID> /F
```

### Le frontend ne démarre pas

**Clear npm cache:**
```bash
npm cache clean --force
cd frontend/tenams
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Accès refusé à la base de données

Supprimez le fichier `tenams.db` et redémarrez le backend:
```bash
rm backend/tenams.db
python index.py
```

---

## 📝 Notes importantes

- ✅ La base de données SQLite est créée automatiquement
- ✅ L'utilisateur admin est créé automatiquement au démarrage
- ⚠️ Les données sont synchronisées en temps réel entre frontend et backend
- ⚠️ N'utilisez pas en production sans changer le mot de passe admin

---

## 📞 Support

Pour toute question ou problème:
1. Vérifiez les logs du terminal
2. Consultez la documentation Swagger: **http://127.0.0.1:8001/docs**
3. Vérifiez les fichiers de configuration dans `db.py`

---

## � À chaque ouverture du projet : **4 ÉTAPES SIMPLES**

#### **ÉTAPE 1️⃣ : Nettoyer les ports (si l'app ne démarre pas)**

Ouvrez **CMD** ou **PowerShell** et exécutez :

```bash
netstat -ano | findstr :8001
netstat -ano | findstr :5173
```

Si vous voyez une sortie, tuez les processus :
```bash
taskkill /PID <PID_DU_PORT_8001> /F
taskkill /PID <PID_DU_PORT_5173> /F
```

---

## 🚀 **COMMANDES DIRECTES À COPIER-COLLER**

### **PowerShell Terminal 1 - Backend :**
```powershell
cd "C:\Users\araboudi\OneDrive - TEN\Desktop\abir\backend"; py -3.10 index.py
```

**Attends :** ✓ `Uvicorn running on http://127.0.0.1:8001`

---

### **PowerShell Terminal 2 - Frontend (NOUVEAU TERMINAL) :**
```powershell
cd "C:\Users\araboudi\OneDrive - TEN\Desktop\abir\frontend\tenams"; npm run dev
```

**Attends :** ✓ `Local: http://localhost:5173/`

---

### **Ouvrir l'application :**
```
http://localhost:5173
```

**Admin :**
- Username: `admin`
- Password: `admin123`

---

### **Si port occupé :**
```powershell
taskkill /PID 8788 /F; taskkill /PID 5173 /F
```

---

#### **ÉTAPE 2️⃣ : Démarrer le Backend** (Terminal 1)

Ouvrez **CMD** (pas PowerShell) et exécutez :

```bash
cd C:\Users\<VOTRE_NOM>\OneDrive - TEN\Desktop\abir\backend
py -3.10 -m pip install -r requirements.txt
py -3.10 index.py
```

**Résultat attendu :**
```
✓ Admin user created/updated successfully
✓ INFO:     Uvicorn running on http://127.0.0.1:8001
```

Si vous voyez cette ligne, le backend est **✅ DÉMARRÉ**.

**Points d'accès backend :**
- API: http://127.0.0.1:8001
- Swagger UI: http://127.0.0.1:8001/docs
- ReDoc: http://127.0.0.1:8001/redoc

---

#### **ÉTAPE 3️⃣ : Démarrer le Frontend** (Terminal 2)

Ouvrez un **nouveau CMD** et exécutez :

```bash
cd C:\Users\<VOTRE_NOM>\OneDrive - TEN\Desktop\abir\frontend\tenams
npm run dev
```

**Résultat attendu :**
```
✓ VITE v7.1.9  ready in 955 ms
✓ Local:   http://localhost:5173/
```

Si vous voyez cette ligne, le frontend est **✅ DÉMARRÉ**.

---

#### **ÉTAPE 4️⃣ : Accéder à l'application**

Ouvrez votre navigateur et allez à **http://localhost:5173/**

**Admin par défaut :**
- Username: `admin`
- Password: `admin123`

---

### 1. Démarrer les serveurs (dans 2 terminaux différents)

**Terminal 1 - Backend:**
```bash
cd backend
py -3.10 index.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend/tenams
npm run dev
```

### 2. Accéder à l'application
- Frontend: `http://localhost:5173`
- API Docs: `http://127.0.0.1:8001/docs`

### 3. Créer un compte et se connecter
- Aller sur `http://localhost:5173/login`
- Créer un nouveau compte
- Se connecter

### 4. Utiliser l'application
- Gérer les équipements
- Gérer la maintenance planifiée
- Gérer les pièces de rechange
- Gérer les projets

---

## 🗄️ Base de données - État actuel

### Configuration SQLite (Temporaire)
- **Type**: SQLite
- **Fichier**: `backend/tenams.db`
- **Avantages**: 
  - ✓ Pas d'installation de serveur
  - ✓ Parfait pour le développement
  - ✓ Portable
- **Limitations**:
  - Pas de ACID garanti en concurrence haute
  - Pas de authentification réseau

### Revenir à MySQL
Voir `MYSQL_RESTORATION.md` pour les instructions complètes.

---

## 🔐 Authentification & Sécurité

### Système d'authentification
- **Type**: JWT (JSON Web Tokens)
- **Hachage**: Argon2 (passlib)
- **Jetons**: Token d'accès stocké en localStorage

### Rôles et Accès
- **Administrator**: 
  - ✓ In-House Data (Équipements, Maintenance Planifiée, Pièces de rechange)
  - ✓ Admin Panel (Gestion des utilisateurs)
  - ✓ Accède via `/ih_prem_pm_list` après connexion
  
- **User** (Utilisateurs standards):
  - ✓ Engineering Tools (Gestion des projets uniquement)
  - ✓ Accède via `/project_management` après connexion

### Flux d'authentification
1. **Login**: Credentials → JWT Token
2. **Token Storage**: Stocké dans `localStorage`
3. **Auto-attach**: Token attaché automatiquement à tous les appels API
4. **Protected Routes**: Routes protégées selon le rôle
5. **Auto-redirect**: Redirection auto selon le rôle après login

### Headers Dynamiques
- **Pages Admin** (/user/*): `TECHNIP ASSET MANAGEMENT PLATFORM`
- **Pages In-House Data** (/ih_*): `TECHNIP ASSET MANAGEMENT PLATFORM_IN HOUSE DATA`
- **Pages Engineering Tools** (/project_*): `TECHNIP ASSET MANAGEMENT PLATFORM_ENGINEERING TOOLS`

---

## 📝 Commandes utiles

### Backend
```bash
# Lancer le serveur avec Python 3.10
py -3.10 index.py

# Lancer avec hot-reload
py -3.10 -m uvicorn index:app --reload --port 8001

# Réinstaller les dépendances si besoin
py -3.10 -m pip install -r requirements.txt

# Tester l'API
curl http://127.0.0.1:8001/docs
```

### Frontend
```bash
# Lancer le dev server
npm run dev

# Builder pour production
npm run build

# Preview build
npm run preview

# Linter
npm run lint
```

### Git
```bash
# Voir les changements
git status

# Créer un commit
git commit -m "message descriptif"

# Pousser les changements
git push origin main

# Voir l'historique
git log --oneline -10
```

---

## 🐛 Dépannage

### Les serveurs ne démarre pas?

1. **Vérifier si les ports sont occupés**
   ```bash
   # Windows - CMD
   netstat -ano | findstr :8001
   netstat -ano | findstr :5173
   ```

2. **Tuer les processus occupant les ports**
   ```bash
   # Windows - CMD
   taskkill /PID <PID> /F
   ```

3. **Erreur "python not found"?**
   - Utilisez `py -3.10` au lieu de `python` ou `python3`
   - L'application nécessite **Python 3.10+** (testé avec 3.10.18)
   - N'utilisez pas Python 3.14 (incompatibilités connues avec SQLAlchemy 2.0.23)

4. **Erreur "ModuleNotFoundError" après pip install?**
   ```bash
   cd backend
   py -3.10 -m pip install -r requirements.txt --no-cache-dir
   ```

5. **Erreur npm sur PowerShell?**
   - Utilisez **CMD** à la place de PowerShell pour npm
   - Ou utilisez **Git Bash**

### Erreurs de base de données?

1. **Supprimer la BD local et la recréer**
   ```bash
   rm backend/tenams.db
   py -3.10 index.py  # Va recréer la BD
   ```

2. **Vérifier que SQLite n'est pas verrouillé**
   ```bash
   # Chercher d'autres instances de l'app
   tasklist | findstr python
   ```

### CORS errors en frontend?

- Le backend est configuré pour accepter les requêtes de `http://localhost:5173`
- Vérifier que le frontend utilise cette URL exacte
- Vérifier que le backend tourne sur le port 8001

---

## 📚 Documentation supplémentaire

- **API Swagger**: `http://127.0.0.1:8001/docs`
- **Guide MySQL**: Voir `MYSQL_RESTORATION.md`
- **Modèles de données**: `backend/models/`
- **Endpoints API**: `backend/routes/`

---

## 🎯 Prochaines étapes

- [ ] Tester tous les fonctionnalités de l'interface
- [ ] Créer des utilisateurs de test
- [ ] Intégrer la vraie BD MySQL quand elle sera disponible
- [ ] Ajouter la validation des formulaires côté client
- [ ] Configurer le HTTPS pour la production
- [ ] Mettre en place des tests automatisés

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier ce README
2. Consulter `MYSQL_RESTORATION.md` pour les problèmes de BD
3. Vérifier les logs du backend et frontend
4. Consulter la documentation Swagger: `http://127.0.0.1:8001/docs`

---

## 💻 Environnement Testé

**Configuration validée le 12 mai 2026 :**

- **Python**: 3.10.18 (via `py -3.10`)
- **Node.js**: 18+
- **npm**: 10+
- **OS**: Windows 10/11
- **Backend Framework**: FastAPI 0.104.1
- **Frontend Framework**: React + Vite 7.1.9
- **Base de données**: SQLite (développement)

**Dépendances clés :**
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- sqlalchemy==2.0.23
- pydantic==2.5.0
- react@latest
- vite@7.1.9

---

**Dernière mise à jour**: 12 Mai 2026  
**Status**: ✅ Fonctionnel avec Python 3.10 et SQLite (Développement)
