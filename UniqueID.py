import json
import os
from collections import Counter

def find_and_print_highest_uniqueID_in_current_directory():
    current_directory = os.getcwd()

    # List all files in the current directory
    for filename in os.listdir(current_directory):
        if filename.endswith(".json"):  # Check if the file is a JSON file
            json_file_path = os.path.join(current_directory, filename)

            # Read the JSON file with 'utf-8' encoding
            with open(json_file_path, "r", encoding="utf-8") as file:
                data = json.load(file)

            # Find the highest `uniqueID` in this JSON file
            max_uniqueID_in_file = max([q["uniqueID"] for q in data["questions"]])

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

if __name__ == "__main__":
    find_and_print_highest_uniqueID_in_current_directory()
