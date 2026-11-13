# STACK — Roadmap de Chamados

Retrato técnico atualizado em **13/11/2026**. Visão de produto no `README.md`.

## 1. Visão geral

SPA estática em React; sem servidor próprio.

```
  Navegador (React 19 + Vite)
     ├── Firestore (SDK web)  ← quando as variáveis VITE_FIREBASE_* existem
     │      coleções: protocols, notes (onSnapshot em tempo real)
     └── localStorage         ← contingência sem Firebase (e preferências do operador)
```

## 2. Tecnologias (package.json)

| Item | Tecnologia |
|---|---|
| UI | **React ^19.2** (JSX, ESM `"type": "module"`) |
| Build/dev | **Vite ^8.1** + `@vitejs/plugin-react ^6` |
| Estilo | CSS puro com variáveis (`src/index.css`) |
| Ícones | `lucide-react ^1.24` |
| Dados | `firebase ^12.16` (Firestore) |
| Lint | `oxlint ^1.71` |
| Testes | nenhum |

## 3. Fontes de dados

- Firestore: coleção `protocols` (um documento por chamado) e `notes/volatile`.
- localStorage: `sp_roadmap_protocols`, `sp_volatile_notes`, `sp_operator`.

## 4. Ambientes e deploy

- Dev: `npm run dev` (porta padrão do Vite, 5173).
- Deploy como site estático (há `vercel.json` com reescrita para `index.html`); saída do build em `dist/`.

## 5. Comandos

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`.

## 6. Variáveis de ambiente (só os nomes)

`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Arquivo `.env` não é versionado (há `.env.example`).

## 7. Restrições conhecidas

- Não há autenticação no app; o acesso aos dados depende das regras do Firestore do projeto (não versionadas neste repositório).
- Sem testes automatizados.
- Projeto no Google Drive: `npm install` pode corromper pacotes (arquivos de 0 byte); instalar em pasta temporária em `C:` e copiar de volta.

## 8. Manter atualizado

Atualize ao mudar tecnologia, dependência, fonte de dados ou deploy.
