# 1. Escopo do MVP

## Obrigatório

- Disponibilizar backend para cadastro, consulta, atualização e exclusão de domínios de estudo.
- Disponibilizar backend para cadastro, consulta, atualização e exclusão de cards manuais vinculados a um domínio.
- Reutilizar a mesma camada de serviço de cards para persistência interna de cards gerados automaticamente.
- Receber conteúdo de entrada por:
  - upload de PDF para extração de texto;
  - upload de imagem para OCR;
  - envio de texto puro.
- Aceitar apenas uma origem de conteúdo por requisição.
- Permitir informar o domínio de forma opcional no envio do conteúdo.
- Enviar o conteúdo extraído para a API da OpenAI para:
  - gerar um resumo geral;
  - gerar cards em quantidade configurável por requisição;
  - gerar cards usando as abordagens: definição, comparação, causa/efeito, aplicação prática, armadilha conceitual e verdadeiro/falso;
  - classificar o conteúdo em um domínio existente quando o domínio não for informado;
  - sugerir um nome de domínio quando não houver correspondência.
- Persistir automaticamente os cards gerados apenas quando houver domínio informado válido ou domínio resolvido com aderência suficiente.
- Retornar os cards gerados mesmo quando não houver domínio aderente, sem persisti-los no banco.
- Retornar o resumo geral na resposta, sem persistência.
- Operar em idioma PT-BR para resumo, cards e sugestão de domínio.
- Adotar artefatos operacionais mínimos como `package.json`, `tsconfig.json`, configuração de testes, `.env.example`, `.gitignore`, `README.md`, `docker-compose.yml` e licença MIT.

## Sugestões futuras

- Fora de escopo.

# 2. Fora do escopo

- Frontend, telas, experiência de usuário e fluxos visuais.
- Autenticação e autorização.
- Algoritmo de revisão espaçada, agendamento de revisão e cálculo de intervalos.
- Importação de formatos além de PDF, imagem e texto puro.
- Requisições com múltiplos arquivos ou combinação de arquivo e texto puro.
- Edição colaborativa, compartilhamento e versionamento de cards.
- Dashboards, métricas, gamificação e relatórios.
- Integrações com sistemas terceiros além da API da OpenAI.
- Sugestões futuras não obrigatórias além do contexto informado.

# 3. Requisitos funcionais

| ID | Requisito | Prioridade | Rastreabilidade |
|---|---|---|---|
| RF-01 | O sistema deve permitir criar um domínio de estudo com identificador único e nome. | Obrigatório | US-01, CA-01 |
| RF-02 | O sistema deve permitir consultar um domínio de estudo por identificador e listar domínios cadastrados. | Obrigatório | US-01, CA-01 |
| RF-03 | O sistema deve permitir atualizar o nome de um domínio de estudo existente. | Obrigatório | US-01, CA-01 |
| RF-04 | O sistema deve permitir excluir um domínio de estudo existente. | Obrigatório | US-01, CA-01 |
| RF-05 | O sistema deve impedir a criação de domínios duplicados por nome. | Obrigatório | US-01, CA-01 |
| RF-06 | O sistema deve permitir criar um card manual vinculado a um domínio existente. | Obrigatório | US-02, CA-02 |
| RF-07 | O sistema deve permitir consultar um card manual por identificador e listar cards por domínio. | Obrigatório | US-02, CA-02 |
| RF-08 | O sistema deve permitir atualizar os dados de um card manual existente. | Obrigatório | US-02, CA-02 |
| RF-09 | O sistema deve permitir excluir um card manual ou gerado automaticamente por identificador. | Obrigatório | US-02, US-03, CA-02, CA-06 |
| RF-10 | O sistema deve exigir que cada card possua os campos `front` e `back`, com mínimo de 3 caracteres em cada campo. | Obrigatório | US-02, US-03, CA-02, CA-03 |
| RF-11 | O sistema deve receber arquivo PDF e extrair texto para processamento posterior. | Obrigatório | US-03, CA-03 |
| RF-12 | O sistema deve receber arquivo de imagem e aplicar OCR para processamento posterior. | Obrigatório | US-03, CA-03 |
| RF-13 | O sistema deve receber texto puro para processamento posterior. | Obrigatório | US-03, CA-03 |
| RF-14 | O sistema deve aceitar apenas uma origem de conteúdo por requisição de processamento. | Obrigatório | US-03, CA-03 |
| RF-15 | O sistema deve permitir informar um domínio opcionalmente na requisição de processamento de conteúdo. | Obrigatório | US-03, US-04, CA-03, CA-04 |
| RF-16 | O sistema deve rejeitar a requisição de processamento quando o domínio informado for inválido ou inexistente. | Obrigatório | US-03, CA-03 |
| RF-17 | O sistema deve enviar o conteúdo textual obtido para a API da OpenAI. | Obrigatório | US-03, US-04, CA-03, CA-04 |
| RF-18 | O sistema deve gerar um resumo geral a partir do conteúdo enviado à API da OpenAI e retorná-lo na resposta. | Obrigatório | US-03, CA-03 |
| RF-19 | O sistema não deve persistir o resumo geral gerado. | Obrigatório | US-03, CA-03 |
| RF-20 | O sistema deve gerar cards em quantidade configurável por requisição. | Obrigatório | US-03, CA-03 |
| RF-21 | O sistema deve gerar cards considerando as abordagens definição, comparação, causa/efeito, aplicação prática, armadilha conceitual e verdadeiro/falso. | Obrigatório | US-03, CA-03 |
| RF-22 | O sistema deve persistir automaticamente os cards gerados com os campos `front`, `back`, `approach` e domínio associado apenas quando houver domínio resolvido. | Obrigatório | US-03, CA-03, CA-06 |
| RF-23 | O sistema deve associar os cards gerados ao domínio informado quando a requisição contiver um domínio válido. | Obrigatório | US-03, CA-03, CA-06 |
| RF-24 | Quando a requisição não informar domínio, o sistema deve usar classificação por IA para avaliar os domínios existentes no banco e identificar o mais aderente ao conteúdo. | Obrigatório | US-04, CA-04 |
| RF-25 | Quando houver correspondência com domínio existente, o sistema deve retornar o domínio identificado e associar os cards gerados a ele. | Obrigatório | US-04, CA-04 |
| RF-26 | Quando não houver correspondência com domínio existente, o sistema deve solicitar à API da OpenAI uma sugestão de nome de domínio. | Obrigatório | US-04, CA-04 |
| RF-27 | Quando a API da OpenAI retornar uma sugestão válida de domínio, o sistema deve retorná-la ao cliente sem criar o domínio automaticamente. | Obrigatório | US-04, CA-04 |
| RF-28 | Quando a API da OpenAI não retornar sugestão de domínio ou a operação falhar, o sistema não deve retornar sugestão. | Obrigatório | US-04, CA-04 |
| RF-29 | Quando não houver correspondência com domínio existente, o sistema deve retornar os cards e o resumo gerados, mas não deve persistir os cards no banco. | Obrigatório | US-04, CA-04 |
| RF-30 | O sistema deve rejeitar requisições de geração de cards sem conteúdo utilizável após extração/OCR. | Obrigatório | US-03, CA-03 |
| RF-31 | Quando um PDF não permitir extração textual direta por se tratar de imagem, o sistema deve enviar o conteúdo à OpenAI e aguardar o retorno do texto para continuidade do processamento. | Obrigatório | US-03, CA-03 |
| RF-32 | O projeto deve disponibilizar `.env.example` com as variáveis mínimas necessárias para execução local. | Obrigatório | |
| RF-33 | O projeto deve disponibilizar `.gitignore` adequado para evitar versionamento de segredos, artefatos temporários e dependências locais. | Obrigatório | |
| RF-34 | O projeto deve disponibilizar `README.md` com contexto do projeto, instruções de uso, orientações mínimas para execução local e lista das bibliotecas utilizadas com a função de cada uma no projeto. | Obrigatório | |
| RF-35 | O projeto deve disponibilizar `package.json` com metadados, dependências mínimas e scripts para desenvolvimento, build, testes e execução local. | Obrigatório | |
| RF-36 | O projeto deve disponibilizar `tsconfig.json` compatível com `Node.js + TypeScript` e com a estrutura modular proposta para o backend. | Obrigatório | |
| RF-37 | O projeto deve disponibilizar configuração de testes automatizados, incluindo arquivo de configuração do runner e convenção mínima para execução via script do projeto. | Obrigatório | |
| RF-38 | O projeto deve disponibilizar `docker-compose.yml` para subir ao menos o banco PostgreSQL localmente e, no MVP, preferencialmente também o serviço da API. | Obrigatório | |
| RF-39 | O projeto deve disponibilizar arquivo `LICENSE` com licença MIT. | Obrigatório | |

# 4. Requisitos não funcionais

| ID | Requisito | Prioridade | Observação |
|---|---|---|---|
| RNF-01 | A API deve expor contratos claros e consistentes para operações de CRUD e processamento de conteúdo. | Obrigatório | Formato específico: informação insuficiente |
| RNF-02 | As validações de entrada devem retornar mensagens de erro determinísticas e compreensíveis. | Obrigatório | |
| RNF-03 | Os requisitos devem permitir rastrear cada operação por identificador de requisição ou mecanismo equivalente. | Obrigatório | Tecnologia específica: informação insuficiente |
| RNF-04 | O sistema deve registrar falhas de integração com OCR, extração de texto e API da OpenAI para auditoria técnica. | Obrigatório | Ferramenta específica: informação insuficiente |
| RNF-05 | O backend deve proteger dados em trânsito entre cliente, sistema e serviços externos. | Obrigatório | Mecanismo específico: informação insuficiente |
| RNF-06 | O sistema deve tratar indisponibilidade de serviços externos sem corromper dados persistidos. | Obrigatório | |
| RNF-07 | O processamento do MVP deve ser síncrono. | Obrigatório | |
| RNF-08 | Chamadas à OpenAI com duração superior a 30 segundos devem ser canceladas e retornar exceção. | Obrigatório | |
| RNF-09 | O tempo máximo aceitável de resposta para extração, OCR e geração de cards é de 30 segundos; acima disso a operação deve falhar. | Obrigatório | |
| RNF-10 | O limite de tamanho de arquivo por requisição deve ser de 10 MB e configurável por variável de ambiente. | Obrigatório | |
| RNF-11 | O limite de volume de texto por requisição deve ser de 10.000 caracteres e configurável por variável de ambiente. | Obrigatório | |
| RNF-12 | A quantidade máxima de cards por requisição deve ser 10 e configurável por variável de ambiente. | Obrigatório | |
| RNF-13 | O sistema deve operar em PT-BR para resumo, cards e sugestão de domínio. | Obrigatório | |
| RNF-14 | Artefatos de código e contratos técnicos devem ser nomeados em inglês, enquanto a documentação explicativa do projeto deve ser mantida em PT-BR. | Obrigatório | |
| RNF-15 | O sistema deve ser estruturado para permitir evolução futura sem acoplamento explícito a tecnologia de OCR, banco ou provedor de IA. | Obrigatório | |
| RNF-16 | A resolução máxima aceita para imagens enviadas ao processamento deve ser 720p. | Obrigatório | |
| RNF-17 | Em caso de erro, a API deve retornar status code compatível com a falha e mensagem objetiva, sem incluir informação sensível. | Obrigatório | |
| RNF-18 | O projeto deve ser executável localmente de forma reprodutível a partir dos artefatos versionados de configuração, build, teste e infraestrutura. | Obrigatório | Inclui `package.json`, `tsconfig.json`, config de testes e `docker-compose.yml` |

# 5. Regras de negócio

| ID | Regra | Rastreabilidade |
|---|---|---|
| RB-01 | Todo card deve pertencer a exatamente um domínio de estudo. | RF-06 a RF-09, RF-22 |
| RB-02 | Um domínio pode possuir zero ou muitos cards. | RF-06, RF-07, RF-22 |
| RB-03 | O CRUD exposto pela API deve cobrir cards manuais; cards gerados automaticamente devem ser persistidos internamente e podem ser listados e excluídos depois. | RF-06 a RF-09, RF-22 |
| RB-04 | O conteúdo mínimo obrigatório de um card é `front` e `back`, com pelo menos 3 caracteres em cada campo. | RF-10 |
| RB-05 | O processamento de conteúdo deve aceitar uma única origem principal por requisição: PDF, imagem ou texto puro. | RF-11 a RF-14 |
| RB-06 | O número de cards a gerar deve respeitar valor mínimo 1, máximo 10 e padrão 3. | RF-20 |
| RB-07 | Cada card gerado deve ser classificado em uma das abordagens permitidas: definição, comparação, causa/efeito, aplicação prática, armadilha conceitual ou verdadeiro/falso. | RF-21 |
| RB-08 | Se o domínio informado não existir ou for inválido, a requisição de geração deve retornar exceção. | RF-15, RF-16 |
| RB-09 | Se o domínio for informado e válido, os cards gerados devem ser associados a esse domínio, sem reclassificação automática. | RF-23 |
| RB-10 | Se o domínio não for informado, a classificação deve considerar apenas os domínios já existentes no banco no momento da requisição. | RF-24, RF-25 |
| RB-11 | Se nenhum domínio existente for compatível, o sistema deve retornar sugestão de domínio em vez de vincular automaticamente a um domínio incorreto ou criá-lo internamente. | RF-26, RF-27, RF-28 |
| RB-12 | Se nenhum domínio existente for compatível, o sistema ainda deve retornar `summary` e `cards`, porém sem persistência dos cards até que exista um domínio válido associado. | RF-29 |
| RB-13 | A sugestão de domínio deve obedecer às mesmas regras de criação de domínio, com nome entre 3 e 40 caracteres. | RF-27 |
| RB-14 | Resumo geral e cards só podem ser gerados a partir de conteúdo textual efetivamente extraído; falhas de extração devem retornar exceção. | RF-18, RF-20, RF-30, RF-31 |
| RB-15 | O resumo geral não deve ser persistido. | RF-19 |
| RB-16 | Cards gerados no processo automático devem permanecer consistentes com o conteúdo de origem enviado para a API da OpenAI. | RF-17 a RF-22 |
| RB-17 | O processamento deve ocorrer em PT-BR. | RF-18, RF-21, RF-26, RNF-13 |

# 6. User stories

| ID | User story | Rastreabilidade |
|---|---|---|
| US-01 | Como gestor de conteúdo educacional, quero manter domínios de estudo cadastrados para organizar cards por assunto e evitar duplicidades. | RF-01 a RF-05 |
| US-02 | Como gestor de conteúdo educacional, quero manter cards manuais vinculados a um domínio, com frente e verso, para estruturar material de estudo por tema. | RF-06 a RF-10 |
| US-03 | Como usuário integrador do backend, quero enviar PDF, imagem ou texto para obter resumo e cards automaticamente, informando opcionalmente um domínio. | RF-11 a RF-23, RF-30, RF-31 |
| US-04 | Como usuário integrador do backend, quero que o sistema identifique o domínio mais aderente ou sugira um novo quando eu não informar domínio, sem perder o retorno dos cards gerados. | RF-24 a RF-29 |

# 7. Critérios de aceitação

| ID | Critério de aceitação | Relacionado a |
|---|---|---|
| CA-01 | Dado um domínio válido e não duplicado, quando o cliente solicitar criação, consulta, atualização ou exclusão, então a API deve refletir a operação executada com retorno compatível com o resultado. | US-01 |
| CA-02 | Dado um domínio existente, quando o cliente criar, consultar, atualizar ou excluir um card manual com `front` e `back` contendo no mínimo 3 caracteres cada, então a API deve persistir e recuperar os dados corretamente. | US-02 |
| CA-03 | Dado um PDF, imagem ou texto puro com conteúdo utilizável, quando o cliente solicitar processamento e informar quantidade de cards válida, então o sistema deve extrair texto, gerar resumo geral, gerar a quantidade solicitada de cards, classificar cada card em uma abordagem permitida e persisti-los somente quando houver domínio associado válido. | US-03 |
| CA-04 | Dado que o cliente não informou domínio, quando houver aderência com domínio existente, então o sistema deve retornar o domínio identificado e associar os cards gerados a ele; e quando não houver aderência, então deve retornar os cards e o resumo gerados, além de uma sugestão válida de domínio apenas se a OpenAI a fornecer, sem persistência dos cards. | US-04 |
| CA-05 | Dado conteúdo sem texto extraível ou reconhecível, quando o cliente solicitar processamento, então o sistema deve rejeitar a operação informando que não há conteúdo utilizável. | US-03 |
| CA-06 | Dado um domínio informado na requisição e existente no banco, quando os cards forem gerados com sucesso, então eles devem ser associados a esse domínio, listáveis posteriormente e excluíveis por endpoint. | US-03 |
| CA-07 | Dado um domínio informado inválido ou inexistente, quando o cliente solicitar processamento, então o sistema deve retornar exceção e não persistir cards. | US-03 |
| CA-08 | Dado um PDF baseado em imagem, quando a extração textual direta falhar, então o sistema deve enviar o conteúdo à OpenAI para retorno do texto antes da geração do resumo e dos cards. | US-03 |
| CA-09 | Dado falha na integração com serviço externo necessário para extração, OCR ou geração, quando a operação não puder ser concluída, então o sistema deve retornar status code compatível, mensagem objetiva sem informação sensível e não persistir dados parciais inconsistentes. | US-03, US-04 |
| CA-10 | Dada uma chamada à OpenAI com duração superior a 30 segundos, quando o limite for atingido, então a operação deve ser cancelada e deve retornar exceção. | US-03, US-04 |
| CA-11 | Dado o repositório do projeto, quando um desenvolvedor preparar o ambiente local, então deve encontrar `package.json`, `tsconfig.json`, configuração de testes, `.env.example`, `.gitignore`, `README.md`, `docker-compose.yml` e `LICENSE`, com instruções suficientes para subir ao menos o banco PostgreSQL e executar os comandos principais do projeto. | RF-32 a RF-39, RNF-18 |

# 8. Ambiguidades

- Não há ambiguidades em aberto com base nas respostas atualmente registradas no documento.

# 9. Perguntas pendentes

- Não há perguntas pendentes com base nas respostas atualmente registradas no documento.
