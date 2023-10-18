 import { PrismaClient } from "@prisma/client";
 import { promises as fs } from 'fs'; 

 const prisma = new PrismaClient();
  let file = await fs.readFile(process.cwd() + '/../src/question3.json', 'utf8');
  let data = JSON.parse(file);
  for (let questao of data["questions"]){
      await prisma.pergunta.create({
          data: {
              pergunta: questao["question"],
              nota: questao["notes"],
              categoria: 3,
              imagem: questao["img"],
              resposta: {
                  create: 
                      [
                          {resposta: String(questao["answers"][0]), correta: Number(questao["correctIndex"]) == 1 ? true : false},
                          {resposta: String(questao["answers"][1]), correta: Number(questao["correctIndex"]) == 2 ? true : false},
                          {resposta: String(questao["answers"][2]), correta: Number(questao["correctIndex"]) == 3 ? true : false},
                          {resposta: String(questao["answers"][3]), correta: Number(questao["correctIndex"]) == 4 ? true : false},
                      ]
                  
              }

          }
      })
      console.log("Cat 3 - " + questao["question"])
  }

  file = await fs.readFile(process.cwd() + '/../src/question2.json', 'utf8');
  data = JSON.parse(file);
  for (let questao of data["questions"]){
      await prisma.pergunta.create({
          data: {
              pergunta: questao["question"],
              nota: questao["notes"],
              categoria: 2,
              imagem: questao["img"],
              resposta: {
                  create: 
                      [
                          {resposta: String(questao["answers"][0]), correta: Number(questao["correctIndex"]) == 1 ? true : false},
                          {resposta: String(questao["answers"][1]), correta: Number(questao["correctIndex"]) == 2 ? true : false},
                          {resposta: String(questao["answers"][2]), correta: Number(questao["correctIndex"]) == 3 ? true : false},
                          {resposta: String(questao["answers"][3]), correta: Number(questao["correctIndex"]) == 4 ? true : false},
                      ]
                  
              }

          }
      })
      console.log("Cat 2 - " + questao["question"])
  }

  file = await fs.readFile(process.cwd() + '/../src/question1.json', 'utf8');
  data = JSON.parse(file);
  for (let questao of data["questions"]){
      await prisma.pergunta.create({
          data: {
              pergunta: questao["question"],
              nota: questao["notes"],
              categoria: 1,
              imagem: questao["img"],
              resposta: {
                  create: 
                      [
                          {resposta: String(questao["answers"][0]), correta: Number(questao["correctIndex"]) == 1 ? true : false},
                          {resposta: String(questao["answers"][1]), correta: Number(questao["correctIndex"]) == 2 ? true : false},
                          {resposta: String(questao["answers"][2]), correta: Number(questao["correctIndex"]) == 3 ? true : false},
                          {resposta: String(questao["answers"][3]), correta: Number(questao["correctIndex"]) == 4 ? true : false},
                      ]
                  
              }

          }
      })

      console.log("Cat 1 - " + questao["question"])
  }