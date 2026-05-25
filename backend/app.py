from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx
import math

app = Flask(__name__)
CORS(app)


# -----------------------------
# Prompt Parser
# -----------------------------
def parse_prompt(prompt):

    prompt = prompt.lower()

    qubits = 4
    topology = "grid"

    words = prompt.split()

    # detect qubit count
    for word in words:
        if word.isdigit():
            qubits = int(word)
            break

    # detect topology
    if "ring" in prompt:
        topology = "ring"

    elif "fully" in prompt:
        topology = "fully_connected"

    elif "grid" in prompt:
        topology = "grid"

    return {
        "qubits": qubits,
        "topology": topology
    }


# -----------------------------
# Generate Graph
# -----------------------------
def generate_topology(qubits, topology):

    if topology == "ring":

        G = nx.cycle_graph(qubits)

    elif topology == "fully_connected":

        G = nx.complete_graph(qubits)

    else:
        # grid

        size = math.ceil(math.sqrt(qubits))

        G = nx.grid_2d_graph(size, size)

        mapping = {}

        count = 0

        for node in G.nodes():

            if count >= qubits:
                break

            mapping[node] = count
            count += 1

        G = G.subgraph(mapping.keys()).copy()

        G = nx.relabel_nodes(G, mapping)

    return G


# -----------------------------
# Create Frontend Components
# -----------------------------
def generate_components(G):

    positions = nx.spring_layout(G, seed=42)

    components = []

    # qubits
    for node, pos in positions.items():

        x = float(pos[0] * 2.5)
        y = float(pos[1] * 2.0)

        components.append({
            "type": "qubit",
            "x": x,
            "y": y,
            "width": 0.7,
            "height": 0.7,
            "label": f"Q{node}"
        })

    # resonators / connections
    for edge in G.edges():

        p1 = positions[edge[0]]
        p2 = positions[edge[1]]

        components.append({
            "type": "resonator",
            "x1": float(p1[0] * 2.5),
            "y1": float(p1[1] * 2.0),
            "x2": float(p2[0] * 2.5),
            "y2": float(p2[1] * 2.0),
            "amplitude": 0.15,
            "periods": 5
        })

    return components


# -----------------------------
# API ROUTE
# -----------------------------
@app.route("/generate-chip", methods=["POST"])
def generate_chip():

    try:

        data = request.get_json()

        prompt = data.get("prompt", "")

        parsed = parse_prompt(prompt)

        G = generate_topology(
            parsed["qubits"],
            parsed["topology"]
        )

        components = generate_components(G)

        design = {
            "substrate": "silicon",
            "description": f"{parsed['qubits']} qubit {parsed['topology']} quantum chip",
            "components": components
        }

        return jsonify({
            "job_id": "001",
            "design": design,
            "gds_url": None
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------
# Health Check
# -----------------------------
@app.route("/")
def home():

    return jsonify({
        "message": "Quantum Chip AI Backend Running"
    })


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":

    print("Quantum Chip Designer Backend Running")

    app.run(debug=True, port=5000)