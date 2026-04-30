from flask import Flask, request, jsonify
from flask_cors import CORS
from generator import generate_links

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend

@app.route("/generate", methods=["GET"])
def generate():
    year = int(request.args.get("year", 2026))
    month = int(request.args.get("month", 1))
    data = generate_links(year, month)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)