from flask import Flask
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

@app.route("/")
def std():
    return "Bad Request", 400

@app.route("/items")
def items():
    files = os.listdir("data/")
    toReturn = []
    for file in files:
        if file.endswith(".json") and file[:-5].isdigit():
            with open(os.path.join("data/", file), 'r') as f:
                content = f.read()
                json_content = json.loads(content)
                places = []
                for item in json_content["items"]:
                    places.append(item["Lagerort"])
                places = list(dict.fromkeys(places))
                toReturn.append({
                    "id": json_content["id"],
                    "name": json_content["name"],
                    "description": json_content["description"],
                    "places": places
                })

    return {"items": toReturn}

@app.route("/item/<item_id>")
def item(item_id):
    file_path = os.path.join("data/", f"{item_id}.json")
    if not os.path.exists(file_path):
        return "Item not found", 404

    with open(file_path, 'r') as f:
        content = f.read()
        json_content = json.loads(content)
        return {"id":json_content["id"], "name": json_content["name"], "description": json_content["description"]}

@app.route("/item/<item_id>/details")
def item_details(item_id):
    file_path = os.path.join("data/", f"{item_id}.json")
    if not os.path.exists(file_path):
        return "Item not found", 404

    with open(file_path, 'r') as f:
        content = f.read()
        json_content = json.loads(content)
        return json_content["items"]
    
@app.route("/item/<item_id>/scheme")
def item_scheme(item_id):
    file_path = os.path.join("data/", f"{item_id}.scheme.json")
    if not os.path.exists(file_path):
        return "Item not found", 404

    with open(file_path, 'r') as f:
        content = f.read()
        json_content = json.loads(content)
        return json_content