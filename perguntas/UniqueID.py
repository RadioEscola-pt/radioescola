import json
import os
from collections import Counter
def check_pdf_existence(fonte, catNum):
    parent_directory = os.path.abspath(os.path.join(os.getcwd(), os.pardir))
    doc_directory = os.path.join(parent_directory, 'exams')
    
    print(doc_directory)

    checked_files = set()  # To keep track of checked files
    
    for items in fonte:
        if items is None:
            continue
        
        for item in items:
            if 'p' not in item:
                continue  # Skip items without 'p'

            pdf_name = item.split('p')[0] + '.pdf'
            pdf_path = os.path.join(doc_directory, pdf_name)

            # Check if the file has already been checked
            if pdf_name in checked_files:
                continue
            
            checked_files.add(pdf_name)  # Add to the set of checked files
            
            if os.path.exists(pdf_path) and os.path.isfile(pdf_path):
                NotImplemented
                #print(f"PDF file '{pdf_name}' exists in the upper directory.")
            else:
                print(f"PDF file '{pdf_name}' does not exist in the upper directory.")



def find_and_print_highest_uniqueID_in_current_directory():
    json_files = ['question1.json', 'question2.json', 'question3.json']

    for filename in json_files:
        json_file_path = os.path.join(os.getcwd(), filename)
        questionNum=filename.split('.')[0][-1]

        # Read the JSON file with 'utf-8' encoding
        with open(json_file_path, "r", encoding="utf-8") as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                print(f"Error reading JSON in file '{filename}'")
                continue  # Skip to the next file

        if "questions" in data:
            # Find the highest `uniqueID` in this JSON file
            max_uniqueID_in_file = max([q["uniqueID"] for q in data["questions"]])
            fonte = [q["fonte"] for q in data["questions"]]


            check_pdf_existence(fonte,questionNum )

            # Print the filename and the maximum `uniqueID`
            print(f"The file '{filename}' has the highest uniqueID, which is {max_uniqueID_in_file}.")

            # Count the `uniqueID` occurrences in this JSON file
            unique_ids_in_file = [q["uniqueID"] for q in data["questions"]]
            unique_id_counts = Counter(unique_ids_in_file)

            # Find and print repeated `uniqueID` in this file
            repeated_uniqueIDs = [unique_id for unique_id, count in unique_id_counts.items() if count > 1]
            if repeated_uniqueIDs:
                print(f"In the file '{filename}':")
                for uniqueID in repeated_uniqueIDs:
                    print(f"  UniqueID: {uniqueID}, Number of occurrences: {unique_id_counts[uniqueID]}")
        else:
            print(f"The file '{filename}' does not contain 'questions' key.")


if __name__ == "__main__":
    find_and_print_highest_uniqueID_in_current_directory()
