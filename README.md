# Roadmap de Chamados (Cockpit de T.I.)

Painel Kanban para acompanhar o **onboarding de sistemas e a evolução de chamados técnicos** da San Paolo Gelato & Café.
Troca planilhas por uma visão limpa de o que está aberto, em execução ou executado.

Para quem: equipe de T.I. (uso interno).

## Funcionalidades

- Quadro com três colunas: **Aberto**, **Em Execução** e **Executado**, com contadores por coluna.
- Cards com sistema, número do protocolo, responsável, descrição, prioridade (Baixa, Média, Alta) e tipo (Onboarding ou Atendimento).
- Criar, editar e excluir chamados em modal; mover entre colunas com as setas do card.
- Busca textual e filtros por prioridade e por sistema.
- Checklist por chamado, linha do tempo/histórico de alterações e **lembretes** (data de lembrete; chamados vencidos aparecem em destaque).
- Bloco de notas volátil e identificação do operador (nome guardado no navegador).
- Persistência no **Firebase Firestore** quando configurado; sem configuração, usa **localStorage** como contingência.
- Identidade visual do brandbook San Paolo (Red Velvet, Ninho, Ao Leite, Laranja, Pistache).

## Como instalar e rodar

Pré-requisito: Node.js 20+.

```bash
npm install
cp .env.example .env     # opcional: preencha as chaves do Firebase; sem elas, roda só com localStorage
npm run dev
```

Outros comandos: `npm run build`, `npm run preview`, `npm run lint` (oxlint).

## Estrutura de pastas

```
src/
  App.jsx                 estado global, cabeçalho, lembretes, notas, persistência
  firebase.js             inicialização opcional do Firestore (via variáveis VITE_*)
  components/             RoadmapBoard, ProtocolCard, ProtocolModal, ProtocolTimeline
  index.css               estilos globais
public/                   ícones
vercel.json               reescrita de rotas para SPA
```

Modelo de um chamado: `id`, `systemName`, `protocolNumber`, `description`, `responsible`, `priority`, `status`, `type`,
`openedDate`, `reminderDate`, `checklist[]`, `history[]`. Coleções do Firestore: `protocols` e `notes`.

## Status

Em uso/validação interna. Mais detalhes técnicos em [STACK.md](STACK.md).
