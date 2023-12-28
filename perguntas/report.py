import json

# Lista dos arquivos JSON codificados diretamente
arquivos_json_input = ['question1.json', 'question2.json', 'question3.json']




# Itera por cada arquivo JSON
total_questoes = 0  # Variável para armazenar a contagem total de questões
# Prepare conteúdo HTML para a tabela
html_conteudo = "<!DOCTYPE html>\n<html>\n<head>\n<title>Resumo das Questões</title>\n</head>\n<body>\n"
html_conteudo += "<h1>Resumo das Questões</h1>\n<table border='1'>\n"
html_conteudo += "<tr><th>Nome do Arquivo</th><th>Total de Questões</th><th>Questões Verificadas</th></tr>\n"

for arquivo_input_json in arquivos_json_input:
    # Carrega os dados JSON do arquivo
    try:
        with open(arquivo_input_json, 'r') as arquivo:
            dados = json.load(arquivo)
    except FileNotFoundError:
        print(f"Arquivo '{arquivo_input_json}' não encontrado.")
        continue



    # Conta o número total de questões
    num_total_questoes = len(dados['questions'])
    # Conta questões verificadas
    questoes_verificadas = [questao for questao in dados['questions'] if questao.get('fonte') is not None]
    contagem_questoes_verificadas = len(questoes_verificadas)

    html_conteudo += f"<tr><td>{arquivo_input_json}</td><td>{num_total_questoes}</td><td>{contagem_questoes_verificadas}</td></tr>\n"









html_conteudo += "</table>\n</body>\n</html>"

# Escreve conteúdo HTML em um arquivo
arquivo_output_html = "relatorio_resumo_questoes.html"
with open(arquivo_output_html, 'w') as arquivo_html:
    arquivo_html.write(html_conteudo)

print(f"Relatório escrito em '{arquivo_output_html}'")
