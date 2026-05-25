# Quantum Chip Designer
Chatbot that takes natural language descriptions and renders quantum chip layouts
matching the reference image style (sinusoidal CPW resonators, qubit boxes, launch pads).
Generates real GDS-II files for fabrication.

---

## Folder structure
```
quantum-chip-app/
├── backend/
│   ├── app.py              ← Flask API server
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        └── App.js          ← React chatbot + canvas renderer
```

---

## Step-by-step setup

### 1. Add your API key
Open `backend/app.py` and replace line 10:
```python
API_KEY = "sk-ant-XXXXXXXXXXXXXXXXXXXXXXXX"
```
with your actual Anthropic API key.

---

### 2. Set up and run the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
✅ Quantum Chip Designer Backend
   Running at: http://localhost:5000
```

---

### 3. Set up and run the frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Browser opens automatically at http://localhost:3000

---

## How to use

1. Type a chip description in the chat box, for example:
   - "3 qubits in a line with meandering CPW resonators and launch pads"
   - "2 transmon qubits coupled through a central coupler with readout pads"
   - "H-shaped layout with 4 qubits and sinusoidal resonators"

2. The layout renders on the right canvas — matching the reference image style.

3. Click **Export GDS-II** to download the `.gds` file for fabrication.
   Open it in KLayout (free): https://www.klayout.de

4. Click **Export JSON** for the raw design data.

---

## View GDS files
```bash
# Install KLayout (free, cross-platform)
# https://www.klayout.de/build.html
klayout chip_design.gds
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node.js from https://nodejs.org |
| `pip: command not found` | Use `pip3` instead |
| CORS error in browser | Make sure backend is running on port 5000 |
| `gdstk` install fails | Run `pip install gdstk --pre` or skip — JSON export still works |
