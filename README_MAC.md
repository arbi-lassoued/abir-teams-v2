# TENAMS - macOS quick start (zsh)

This file provides macOS (zsh) focused instructions to run the TENAMS project locally.

Prerequisites
- macOS with zsh (default)
- Python 3.9 or 3.10 (project tested with 3.10; Python 3.9 also works with small compatibility fixes already applied)
- Node.js 18+ and npm
- git

Quick steps (copy-paste into 2 terminals)

Terminal A — Backend

```bash
# from repo root
cd "$(pwd)/backend"
# create a venv if it doesn't exist
python3 -m venv .venv
# activate the venv
source .venv/bin/activate
# upgrade pip/tools and install requirements
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
# install a few optional dependencies that the project uses
python -m pip install python-jose[cryptography] argon2_cffi python-dateutil pandas openpyxl
# start the backend
python index.py
```

Expected backend output:

```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

Terminal B — Frontend

```bash
# from repo root
cd "$(pwd)/frontend/tenams"
# install node deps
npm install
# start vite dev server
npm run dev
```

Expected frontend output:

```
VITE v7.x.x ready
Local:   http://localhost:5173/
```

Open the app in your browser:
- Frontend: http://localhost:5173/
- Backend API docs: http://127.0.0.1:8001/docs

Default admin credentials (created automatically by backend on first run):
- Username: admin
- Password: admin123

Troubleshooting
- If Python 3.10 isn't installed, you can run with system `python3` (project has minor compatibility backports applied).
- If ports 8001 or 5173 are occupied, find and kill the process:

```bash
# find process listening on a port
lsof -i :8001
# kill PID
kill -9 <PID>
```

- If you see errors related to missing modules, activate the backend venv and run pip install for the missing package.

Notes
- This README mirrors the Windows PowerShell instructions in `README_SIMPLE.md` but uses zsh/POSIX commands appropriate for macOS.
- If you want the backend to run in background, you can use `nohup python -u index.py > ../backend_server.log 2>&1 &` from the `backend` folder.

Contact / Next steps
- After starting both servers you can sign in using the default admin account and explore the admin panel.

