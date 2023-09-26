import json
import os
from collections import Counter

def find_and_print_highest_uniqueID_in_current_directory():
    current_directory = os.getcwd()

    # Listar todos os arquivos no diretório atual
    for filename in os.listdir(current_directory):
        if filename.endswith(".json"):  # Verificar se o arquivo é um JSON
            json_file_path = os.path.join(current_directory, filename)

            # Ler o arquivo JSON
            with open(json_file_path, "r") as file:
                data = json.load(file)

            # Encontrar o `uniqueID` mais alto neste arquivo JSON
            max_uniqueID_in_file = max([q["uniqueID"] for q in data["questions"]])

            # Imprimir o nome do arquivo e o `uniqueID` máximo
            print(f"O arquivo '{filename}' possui o uniqueID mais alto, que é {max_uniqueID_in_file}.")

            # Contar os `uniqueID` neste arquivo JSON
            unique_ids_in_file = [q["uniqueID"] for q in data["questions"]]
            unique_id_counts = Counter(unique_ids_in_file)

            # Encontrar e imprimir os `uniqueID` repetidos neste arquivo
            repeated_uniqueIDs = [unique_id for unique_id, count in unique_id_counts.items() if count > 1]
            if repeated_uniqueIDs:
                print(f"No arquivo '{filename}':")
                for uniqueID in repeated_uniqueIDs:
                    print(f"  UniqueID: {uniqueID}, Número de repetições: {unique_id_counts[uniqueID]}")

if __name__ == "__main__":
    find_and_print_highest_uniqueID_in_current_directory()
