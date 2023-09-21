import json
import os

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

if __name__ == "__main__":
    find_and_print_highest_uniqueID_in_current_directory()
