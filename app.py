from flask import Flask
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

def getBiggestNum(files):
    numbers = []
    for file in files:
        if file.endswith(".json") and file[:-5].isdigit():
            numbers.append(int(file[:-5]))
    return max(numbers) if numbers else -1

@app.route("/")
def std():
    return {"error":"Bad Request"}, 400

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
        return {"error": "Item not found"}, 404

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
        return {"error":"Item not found"}, 404

    with open(file_path, 'r') as f:
        content = f.read()
        json_content = json.loads(content)
        return json_content

@app.route("/additem/<item_name>/<item_description>/<item_scheme>")
def additem(item_name, item_description, item_scheme):
    files = os.listdir("data/")
    max_num = getBiggestNum(files)
    id = max_num + 1
    toWrite = {
        "id": id,
        "name": item_name,
        "description": item_description,
        "items": []
    }
    toWriteScheme = []
    scheme_parts = item_scheme.split(",")

    for i, part in enumerate(scheme_parts):
        toWriteScheme.append({"position": i, part.strip(): "text"})

    toWriteScheme.append({"position": len(scheme_parts), "Lagerort": "text"})

    with open(os.path.join("data/", f"{id}.scheme.json"), "x") as f:
        f.write(json.dumps(toWriteScheme))

    with open(os.path.join("data/", f"{id}.json"), "x") as f:
        f.write(json.dumps(toWrite))

    return {"status": "success", "id": id}

@app.route("/adddetail/<item_id>/<detail_payload>")
def adddetail(item_id, detail_payload):
    file_path = os.path.join("data/", f"{item_id}.json")
    if not os.path.exists(file_path):
        return {"error": "Item not found"}, 404

    detail_parts = detail_payload.split(",")
    detail_dict = {}
    for part in detail_parts:
        key_value = part.split("=")
        if len(key_value) == 2:
            key, value = key_value
            detail_dict[key] = value

    with open(file_path, 'r') as f:
        content = f.read()
        json_content = json.loads(content)
        json_content["items"].append(detail_dict)

    with open(file_path, 'w') as f:
        f.write(json.dumps(json_content))

    return {"status": "success"}