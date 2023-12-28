import json

# List of hardcoded JSON files
input_json_files = ['question1.json', 'question2.json', 'question3.json']

# Initialize lists to store counts and file names
file_names = []
question_counts = []
questions_with_exames_counts = []

# Iterate through each JSON file
total_questions = 0  # Variable to store total questions count
total_questions_with_exames = 0  # Variable to store total questions with 'Exames:(' count

for input_json in input_json_files:
    # Load JSON data from file
    try:
        with open(input_json, 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"File '{input_json}' not found.")
        continue

    # Find questions with 'Exames:(' in notes
    questions_with_exames = [question['question'] for question in data['questions'] if 'Exames:(' in question['notes']]
    num_questions_with_exames = len(questions_with_exames)
    total_questions_with_exames += num_questions_with_exames

    # Count total number of questions
    num_total_questions = len(data['questions'])
    total_questions += num_total_questions

    # Append file name and counts to respective lists
    file_names.append(input_json)
    question_counts.append(num_total_questions)
    questions_with_exames_counts.append(num_questions_with_exames)

# Prepare HTML content for table
html_content = "<!DOCTYPE html>\n<html>\n<head>\n<title>Questions Summary</title>\n</head>\n<body>\n"
html_content += "<h1>Questions Summary</h1>\n<table border='1'>\n"
html_content += "<tr><th>File Name</th><th>Total Questions</th><th>Questions with 'Exames:('</th></tr>\n"

# Add data to the table
for i in range(len(file_names)):
    html_content += f"<tr><td>{file_names[i]}</td><td>{question_counts[i]}</td><td>{questions_with_exames_counts[i]}</td></tr>\n"

# Add row for total counts
html_content += f"<tr><td>Total</td><td>{total_questions}</td><td>{total_questions_with_exames}</td></tr>\n"

html_content += "</table>\n</body>\n</html>"

# Write HTML content to a file
output_html = "questions_summary_report.html"
with open(output_html, 'w') as html_file:
    html_file.write(html_content)

print(f"Report written to '{output_html}'")
