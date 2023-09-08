import json
import re
import os

# Define a function to remove <img> tags from HTML and extract the src attribute
def remove_img_tags_and_extract_src(html_content):
    cleanr = re.compile('<img [^>]*src=[\'"]?([^\'" >]+)[\'"]?[^>]*>')
    img_src = re.findall(cleanr, html_content)
    cleaned_html = re.sub(cleanr, '', html_content)
    return cleaned_html, img_src[0] if img_src else None  # Use the first URL if found, or None if no img tag

# Load the JSON data from a file
json_filename = 'question1.json'

if os.path.exists(json_filename):
    with open(json_filename, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

    # Flag to track if changes have been made
    changes_made = False

    # Initialize a unique ID counter
    unique_id_counter = 1

    # Initialize a variable to store the highest unique ID
    highest_unique_id = 0  # Initialize to 0

    # Iterate through the questions
    for question in data['questions']:
        question_text = question.get('question', '')
        # Add an empty "img" field to questions that don't have it
        if 'img' not in question:
            question['img'] = None  # Set "img" to None if missing
            changes_made = True  # Set changes_made to True


        # Add a "uniqueID" field with a number sequence to questions that don't have it
        if 'uniqueID' not in question:
            question['uniqueID'] = unique_id_counter
            unique_id_counter += 1
            changes_made = True  # Set changes_made to True

        # Update the highest_unique_id if a higher unique ID is found
        highest_unique_id = max(highest_unique_id, question['uniqueID'])

        # Remove <img> tags from the question and extract the src attribute
        cleaned_question_text, img_src = remove_img_tags_and_extract_src(question_text)

        # Check if the text has changed (i.e., <img> tags were removed)
        if cleaned_question_text != question_text:
            # Update the 'question' field with the modified text
            question['question'] = cleaned_question_text

            # Add a new 'img' field with the extracted image source
            question['img'] = img_src if img_src else None  # Set "img" to None if no img source
            changes_made = True  # Set changes_made to True

            # Display a message indicating the change and print the image
            print(f"Question {question['numb']} has been modified.")
            if img_src:
                print("Image Source(s):")
                for src in img_src:
                    print(src)
            else:
                print("No image source found.")  # Add this message

            print(f"UniqueID: {question['uniqueID']}\n")

    if changes_made:
        # Save the updated JSON data to the same file
        with open(json_filename, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

        print(f"Saved changes to '{json_filename}'.")
    else:
        print("No changes were made.")

    # Print the highest unique ID
    print(f"Highest Unique ID: {highest_unique_id}")

else:
    print(f"The file '{json_filename}' does not exist.")