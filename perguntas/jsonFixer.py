import json
import re

input_json_files = ['question1.json', 'question2.json', 'question3.json']

for input_json in input_json_files:
    with open(input_json, 'r') as file:
        data = json.load(file)
    print(f"Processing file '{input_json}'")
    for question in data['questions']:
        if 'fonte' not in question:
            notes = question.get('notes', '')

            # Check if notes contain HTML link
            link_matches = re.findall(r"<a[^>]*>([^<]+)<\/a>", notes)
            fonte_matches = [match for match in link_matches if re.search(r"\b\d{4}_\d{2}_\d{2}p\d+\b", match)]
            if fonte_matches:
                print(fonte_matches)
                question['fonte'] = fonte_matches
            else:
                question['fonte'] = None

        if 'tutorial' not in question:
            question['tutorial'] = None
        if 'materia' not in question:
            question['materia'] = None

    with open(input_json, 'w') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)