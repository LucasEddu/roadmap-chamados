# Documentação do Projeto - Painel de Roadmap de Chamados e Onboarding

Esta documentação descreve de forma abrangente o escopo **Macro** (visão de negócio, objetivos e identidade) e **Micro** (detalhes técnicos, arquitetura de componentes, fluxo de dados e estilização) do sistema de Roadmap de Chamados desenvolvido para a **San Paolo Gelato e Café**.

---

## 1. Escopo Macro (Visão Geral e Negócio)

### Objetivo do Projeto
Centralizar e facilitar o acompanhamento visual do onboarding de novos sistemas e da evolução de chamados técnicos dentro da empresa. O sistema visa eliminar a complexidade de planilhas e dashboards poluídos, oferecendo uma visão limpa, direta e intuitiva de quais integrações ou manutenções estão pendentes, em andamento ou finalizadas.

### Fluxo de Trabalho (Roadmap/Kanban)
Os chamados transitam por três fases principais de onboarding:
1.  **Aberto**: Chamados criados, aguardando triagem, início do desenvolvimento ou liberação de credenciais.
2.  **Em Execução**: Integrações em desenvolvimento ativo, em fase de testes ou em homologação com os parceiros.
3.  **Executado**: Sistemas totalmente integrados, homologados e em ambiente de produção (Live).

### Alinhamento de Marca (Brandbook San Paolo v05)
A identidade visual do painel foi inteiramente inspirada no brandbook oficial da marca para proporcionar consistência corporativa:
*   **Cores Principais**:
    *   Fundo clássico da marca: `#E8E1D0` (Ninho) e variações suaves de creme para evitar fadiga visual.
    *   Ações e destaques do cabeçalho: `#DA0D17` (Red Velvet).
*   **Identificação Semântica das Fases (Status)**:
    *   *Aberto*: `#265D7C` (Ao Leite - Azul sóbrio)
    *   *Em Execução*: `#DA5513` (Laranja San Paolo - Atenção/Construção)
    *   *Executado*: `#4F7043` (Pistache - Conclusão/Segurança)
*   **Tipografia**:
    *   Títulos e branding: Fonte Serifada (fallback Lora/Georgia, inspirada na fonte *Rocky*).
    *   Corpo e Inputs: Fonte Sans-serif geométrica (fallback Outfit/Inter, inspirada na fonte *Arboria*).

---

## 2. Escopo Micro (Arquitetura Técnica)

### Tecnologias Utilizadas
*   **Framework**: React 18+ (via Vite para build rápido).
*   **Estilização**: Vanilla CSS (CSS puro moderno com variáveis para customização facilitada).
*   **Ícones**: `lucide-react`.
*   **Persistência**: `localStorage` (sem necessidade de banco de dados externo ou servidor ativo).

### Estrutura de Pastas e Componentes
```
roadmap-chamados/
├── src/
│   ├── components/
│   │   ├── RoadmapBoard.jsx    # Quadro Kanban, busca e filtros
│   │   ├── ProtocolCard.jsx    # Card individual de exibição do chamado
│   │   └── ProtocolModal.jsx   # Modal de formulário para criar/editar
│   ├── App.jsx                 # Estado global, cabeçalho e persistência
│   ├── index.css               # Design System, reset e estilos globais
│   └── main.jsx                # Inicializador do React
├── index.html                  # Ponto de entrada do navegador
└── package.json                # Gerenciador de dependências
```

---

## 3. Estrutura de Dados (Schema)

Cada chamado/protocolo é tratado como um objeto JSON estruturado da seguinte forma:

```json
{
  "id": "string (timestamp)",
  "systemName": "string",
  "protocolNumber": "string",
  "description": "string",
  "responsible": "string",
  "priority": "Baixa | Média | Alta",
  "status": "Aberto | Em Execução | Executado",
  "openedDate": "string (ISO Date)"
}
```

---

## 4. Detalhamento dos Componentes

### A. App.jsx (Orquestrador)
*   **Função**: Centraliza o estado da lista de chamados (`protocols`). Lê e escreve as alterações no `localStorage` sob a chave `sp_roadmap_protocols`.
*   **Visual**: Renderiza a barra de navegação superior com o logo oficial estilizado da San Paolo (formato do bigodinho em vetor) e o banner principal de informações.
*   **Funções internas**:
    *   `handleSaveProtocol(data)`: Adiciona um novo chamado ao início da lista ou atualiza o chamado existente em caso de edição.
    *   `handleMoveStatus(id, newStatus)`: Altera diretamente a coluna de um card ao navegar pelo painel.
    *   `handleDeleteProtocol(id)`: Remove o protocolo da lista com confirmação prévia.

### B. RoadmapBoard.jsx (Quadro Kanban e Filtros)
*   **Função**: Fornece os controles de busca textual (por sistema, responsável, descrição ou número do protocolo) e filtros rápidos (por prioridade ou sistema específico).
*   **Visual**: Renderiza as três colunas paralelas responsivas, distribuindo os cards correspondentes a cada status. Exibe contadores de chamados por coluna.

### C. ProtocolCard.jsx (Cartão de Exibição)
*   **Função**: Exibe todos os metadados do chamado de forma limpa e em alta legibilidade.
*   **Visual**:
    *   O número do protocolo exibe um badge colorido de acordo com o status atual.
    *   A prioridade do chamado altera a cor do texto do badge indicador (`Alta` em Vermelho, `Média` em Laranja, `Baixa` em Azul).
    *   Controles integrados para abrir edição rápida, deletar e setas (`Voltar` / `Avançar`) para mover o chamado entre as colunas sem esforço.

### D. ProtocolModal.jsx (Formulário)
*   **Função**: Modal interativo acionado para cadastrar ou editar chamados.
*   **Campos**: Nome do Sistema (Obrigatório), Número do Protocolo (Opcional), Responsável (Opcional), Descrição (Obrigatório), Prioridade (Select) e Status (Select).

---

## 5. Como Iniciar o Desenvolvimento

1.  **Instalar dependências**:
    ```bash
    npm install
    ```
2.  **Iniciar servidor de desenvolvimento local**:
    ```bash
    npm run dev
    ```
3.  **Compilar para Produção (Build)**:
    ```bash
    npm run build
    ```
