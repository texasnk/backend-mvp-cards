Atue como Business Analyst sênior especializado em produtos educacionais e sistemas backend.

Analise o contexto abaixo e produza requisitos claros, verificáveis e rastreáveis.

Contexto:
Será criado apenas o backend MVP de um sistema para auxiliar estudos usando cards de memória espaçada.
O sistema deve permitir:
- CRUD de domínios de estudo. Exemplo de um domínio: "Sistema Cardiovascular", "Injeção eletronica" e "Finanças".
- CRUD de cards dentro de um domínio.
- Permitir o: 
	1. Upload de PDFs para extração de texto.
	2. Upload de imagens para OCR.
    3. Envio de texto puro.
    4. Informar de forma opcional o domínio.
Depois deve enviar do conteúdo extraído para a API da OpenAI e gerar um resumo geral, e criar cards (número de cards configurável no endpoint) seguindo uma das abordagens:
  - definição
  - comparação
  - causa/efeito
  - aplicação prática
  - armadilha conceitual
  - verdadeiro/falso
Após gerar os cards, caso não seja especificado um domínio deve avaliar baseado nos domínios existentes no banco o que pode ser aplicado, caso não tenha nenhum correspondente, retorne uma sugestão.

Objetivo:
Gerar um arquivo ".md" chamado "USs" com os requisitos funcionais, não funcionais, regras de negócio, user stories e critérios de aceitação do MVP.

Restrições:
- Não invente funcionalidades fora do contexto.
- Não incluir frontend.
- Não assumir tecnologia específica ainda.
- Se faltar informação, escreva “informação insuficiente”.
- Separar requisitos obrigatórios de sugestões futuras.

Formato de saída:
1. Escopo do MVP
2. Fora do escopo
3. Requisitos funcionais
4. Requisitos não funcionais
5. Regras de negócio
6. User stories
7. Critérios de aceitação
8. Ambiguidades
9. Perguntas pendentes

--------------------------

Uso de 2x:
› O arquivo USs.md dentro de docs, possuia perguntas e ambiguidades, foram respondidas com "Resposta:" e textos depois de perguntas, revise o conteúdo e atualize a US levando em consideração as respostas.