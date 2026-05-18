# TENAMS - Technical Asset Management Platform

## � **CONFIGURATION INITIALE (Première fois uniquement)**

### Autoriser l'exécution des scripts PowerShell :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Confirmer avec `Y` + Entrée.

---

## 🚀 **LANCER LE PROJET**

### **IMPORTANT : Utiliser 2 terminaux PowerShell SÉPARÉS**

**Terminal 1 - Backend (à faire en premier) :**
```powershell
cd backend
py -3.10 index.py
```
Attendre le message : `INFO:     Application startup complete.`

**Terminal 2 - Frontend (après le backend) :**
```powershell
cd frontend\tenams
npm run dev
```

### **Ouvrir dans le navigateur :**
```
http://localhost:5173
```

### **Login :**
- **Username:** `admin`
- **Password:** `admin123`

---

## ⚠️ **Troubleshooting**

### Port occupé :
```powershell
taskkill /PID 8001 /F   # Backend
taskkill /PID 5173 /F   # Frontend
```

### npm ne fonctionne pas :
Alternative au lieu de `npm run dev` :
```powershell
npm.cmd run dev
```

### Venv non activé (backend) :
```powershell
.\venv\Scripts\Activate.ps1
cd backend
py -3.10 index.py
```

---

## 📍 **Points d'accès**
- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8001
- **API Docs:** http://127.0.0.1:8001/docs

---

## ✅ **Configuration testée**
- Python 3.10.18
- Node.js 18+
- FastAPI 0.104.1
- React + Vite 7.1.9
- SQLite
