# Quantum Chip Designer

A full-stack AI-powered quantum chip layout generator built using React, Flask, and NetworkX.

The application allows users to describe a quantum processor architecture in natural language and visualize the generated chip topology interactively.

---

# Features

- Generate quantum chip layouts from text prompts
- Supports:
  - Ring topology
  - Grid topology
  - Fully connected topology
- Interactive chip visualization using HTML5 Canvas
- Qubit and resonator rendering
- Export generated layouts as JSON
- Flask backend with graph-based topology generation
- React frontend with real-time rendering

---

# Tech Stack

## Frontend
- React.js
- HTML5 Canvas
- JavaScript

## Backend
- Flask
- Flask-CORS
- NetworkX
- NumPy

---

# Project Structure

```text
quantum-chip-app/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── env/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
