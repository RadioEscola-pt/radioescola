import json
import re

input_json_files = ['question1.json', 'question2.json', 'question3.json']

for input_json in input_json_files:
    with open(input_json, 'r') as file:
        data = json.load(file)
    print(f"Processing file '{input_json}'")
    for question in data['questions']:
        if 'calc' not in question:
            question['calc'] = None

        if 'tutorial' not in question:
            question['tutorial'] = None
        if 'materia' not in question:
            question['materia'] = None

    with open(input_json, 'w') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)