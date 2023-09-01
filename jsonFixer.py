import json
import re
import os

# Define a function to remove <img> tags from HTML and extract the src attribute
def remove_img_tags_and_extract_src(html_content):
    cleanr = re.compile('<img [^>]*src=[\'"]?([^\'" >]+)[\'"]?[^>]*>')
    img_src = re.findall(cleanr, html_content)
    cleaned_html = re.sub(cleanr, '', html_content)
    return cleaned_html, img_src[0] if img_src else None  # Use the first URL if found

# Load the JSON data from a file
json_filename = 'question3.json'

if os.path.exists(json_filename):
    with open(json_filename, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

    # Flag to track if changes have been made
    changes_made = False

    # Initialize a unique ID counter
    unique_id_counter = 1

    # Iterate through the questions
    for question in data['questions']:
        question_text = question.get('question', '')

        # Add an empty "img" field to questions that don't have it
        if 'img' not in question:
            question['img'] = None

        # Add a "uniqueID" field with a number sequence to questions that don't have it
        if 'uniqueID' not in question:
            question['uniqueID'] = unique_id_counter
            unique_id_counter += 1

        # Remove <img> tags from the question and extract the src attribute
        cleaned_question_text, img_src = remove_img_tags_and_extract_src(question_text)

        # Check if the text has changed (i.e., <img> tags were removed)
        if cleaned_question_text != question_text:
            # Update the 'question' field with the modified text
            question['question'] = cleaned_question_text

            # Add a new 'img' field with the extracted image source
            question['img'] = img_src

            # Set the flag to indicate changes have been made
            changes_made = True

            # Display a message indicating the change and print the image
            print(f"Question {question['numb']} has been modified.")
            if img_src:
                print("Image Source(s):")
                for src in img_src:
                    print(src)
            print(f"UniqueID: {question['uniqueID']}\n")

    if changes_made:
        # Save the updated JSON data to the same file
        with open(json_filename, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

        print(f"Saved changes to '{json_filename}'.")
    else:
        print("No changes were made.")

else:
    print(f"The file '{json_filename}' does not exist.")
