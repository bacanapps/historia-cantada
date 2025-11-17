# A História Cantada da AIDS no Brasil

Uma Progressive Web App (PWA) educacional que apresenta a história da AIDS no Brasil através de músicas temáticas, parte do projeto "A História Cantada da AIDS".

## 📋 Sobre o Projeto

Este aplicativo apresenta uma coleção de músicas brasileiras que abordam o tema HIV/AIDS, oferecendo contexto histórico, análises culturais e transcrições das letras. O projeto visa promover educação e conscientização através da música, documentando como artistas brasileiros abordaram a epidemia de AIDS ao longo das décadas.

## ✨ Características

- **Progressive Web App (PWA)** - Funciona offline e pode ser instalado como app nativo
- **Biblioteca Musical** - Coleção de músicas temáticas sobre HIV/AIDS
- **Audiodescrição** - Trechos de áudio e audiodescrição para cada música
- **Sistema de Temas** - Suporte para temas claro e escuro com persistência
- **Conteúdo Rico** - Para cada música: sinopse, letra, referências e fontes
- **Design Responsivo** - Interface adaptável para mobile e desktop
- **Busca Integrada** - Pesquisa por artista, música, tema ou tags
- **Hash Routing** - Navegação client-side sem recarregamento de página

## 🛠️ Tecnologias

- **React** (via CDN) - Framework UI sem build step
- **Howler.js** - Gerenciamento avançado de áudio
- **Vanilla JavaScript** - Sem dependências de build
- **Service Workers** - Suporte offline robusto
- **CSS Custom Properties** - Sistema de temas dinâmico

## 🚀 Como Usar

### Desenvolvimento Local

O aplicativo não requer build step. Basta servir com um servidor HTTP simples:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve
```

Depois acesse `http://localhost:8000` no navegador.

### Instalação como PWA

1. Abra o app em um navegador compatível (Chrome, Edge, Safari)
2. Procure o ícone de instalação na barra de endereços
3. Clique em "Instalar" para adicionar à tela inicial

## 📁 Estrutura do Projeto

```
historia-cantada/
├── index.html              # Página principal
├── app.js                  # Aplicação React principal
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker
├── data/
│   ├── songs.json          # Dados das músicas
│   └── presentation.json   # Conteúdo da apresentação
├── assets/
│   ├── css/
│   │   ├── theme.css       # Temas e estilos principais
│   │   ├── app.css         # Estilos da aplicação
│   │   └── books-detail.css # Estilos de detalhes
│   ├── audio/              # Arquivos de áudio
│   ├── covers/             # Capas dos álbuns (400x400px)
│   ├── img/                # Imagens gerais
│   └── vendor/             # React, ReactDOM, Howler.js
```

## 🎵 Estrutura de Dados

Cada música em `data/songs.json` contém:

```json
{
  "id": "song1",
  "title": "Título da Música",
  "artist": "Nome do Artista",
  "year": 1983,
  "genres": ["rock", "pop"],
  "cover": "/assets/covers/song1.jpeg",
  "preview": { "src": "url_preview", "durationSec": 240 },
  "audioDescription": { "src": "/assets/audio/ad1.wav", "durationSec": 2 },
  "synopsisHtml": "<p>Contexto histórico e análise...</p>",
  "transcriptHtml": "<p>Letra da música...</p>",
  "analysisHtml": "<p>Referências e citações...</p>",
  "sources": [{ "label": "YouTube", "url": "https://..." }],
  "tags": ["anos-80", "rock", "aids"]
}
```

### Campos de Conteúdo

- **synopsisHtml** - Contexto histórico e análise cultural (tab "Sobre")
- **transcriptHtml** - Letra completa da música (tab "Letra")
- **analysisHtml** / **referenciaHtml** - Referências bibliográficas (tab "Referência")
- **sources** / **fontes** - Links para fontes externas (tab "Fontes")

## 🎨 Sistema de Temas

Dois temas disponíveis:
- **Light**: Tema claro com fundo branco
- **Dark**: Tema escuro com fundo preto (padrão)

A preferência é salva em `localStorage` e sincronizada com URL parameters.

### Customização de Temas

Edite as variáveis CSS em `assets/css/theme.css`:

```css
:root[data-theme="dark"] {
  --color-bg-page: #0a0f1a;
  --color-text-primary: #ffffff;
  --color-brand-accent: #10b981;
  /* ... mais tokens */
}
```

## 🔧 Funcionalidades Principais

### Sistema de Áudio

- **Instância Única**: Apenas um áudio toca por vez (preview ou audiodescrição)
- **Controle Global**: Estado de áudio sincronizado em toda a aplicação
- **Auto-Stop**: Áudio para automaticamente ao navegar entre páginas
- **Play/Pause**: Controles intuitivos com feedback visual

### Navegação

- **Hash Routing**: URLs amigáveis com `#apresentacao`, `#faixas`, `#faixas/song1`
- **Back Navigation**: Botão "Voltar" em todas as páginas secundárias
- **Deep Linking**: Links diretos para músicas específicas

### Tabs de Conteúdo

Cada música tem 4 tabs organizadas:

1. **Sobre** - Sinopse e contexto histórico (padrão)
2. **Letra** - Transcrição completa da letra
3. **Referência** - Citações e referências bibliográficas
4. **Fontes** - Links para recursos externos

**Visual Feedback**: Tab selecionada destacada com fundo verde (`--color-brand-accent`)

### Hero Images

- **Dimensões**: 400px × 400px (quadrado)
- **Alinhamento**: Centralizado horizontalmente
- **Object-fit**: Cover (mantém proporções)
- **Border**: Borda sutil com border-radius de 12px

## 🔄 Atualizações Recentes

### v1.3.0 - Layout e UI Refinements (2025-11-17)

**Hero Image Improvements**:
- Redimensionadas para 400px × 400px (app.js, theme.css:401)
- Centralizadas horizontalmente com `margin: 0 auto`
- Melhor apresentação visual em todos os tamanhos de tela

### v1.2.0 - Tab System Improvements (2025-11-17)

**Tab Reordering**:
- Nova ordem: Sobre, Letra, Referência, Fontes (app.js:520-523)
- "Sobre" como tab padrão ao abrir uma música

**Visual Feedback**:
- Tab selecionada com fundo verde usando CSS variables (app.js:440)
- Removidas classes conflitantes que afetavam tamanho
- Estilo consistente usando `backgroundColor` e `color` inline

### v1.1.0 - Data Structure Refactoring (2025-11-17)

**Field Renaming**:
- "Análise" renomeada para "Referência" (app.js:522)
- Atualização da estrutura de dados normalizada (app.js:212-217, 232)

**Tab Content Mapping**:
- Letra → `transcriptHtml` (app.js:465)
- Sobre → `synopsisHtml` (app.js:470)
- Referência → `referenciaHtml` / `analysisHtml` (app.js:475)

**Backward Compatibility**:
- Mantidos fallbacks para campos antigos (`letraHtml`, `sobreHtml`, `analiseHtml`)
- Migração suave sem quebrar dados existentes

## 📊 Conteúdo Musical

O aplicativo apresenta músicas de artistas brasileiros renomados que abordaram HIV/AIDS:

- **Anos 80**: Leo Jaime, Rita Lee, Caetano Veloso, Cazuza
- **Anos 90-2000**: Renato Russo, Barão Vermelho, RPM
- **Diversos Gêneros**: Rock, MPB, Pop, Tropicalismo

Cada música oferece:
- Contexto histórico da época
- Análise cultural e social
- Letra completa com transcrição
- Referências bibliográficas acadêmicas

## 🔄 Atualizando o Service Worker

Ao fazer alterações significativas:

1. Abra `sw.js`
2. Incremente a constante `VERSION` (ex: `v1` → `v2`)
3. Caches antigos serão limpos automaticamente no próximo carregamento

## 🧪 Testando PWA

Para testar funcionalidades PWA:

1. Servir via HTTPS ou localhost
2. DevTools → Application → Service Workers para verificar registro
3. DevTools → Network → Throttling → Offline para testar offline
4. Procurar prompt de instalação na barra de endereços

## 📱 Compatibilidade

- Chrome/Edge: ✅ Suporte completo
- Safari: ✅ Suporte completo (iOS 11.3+)
- Firefox: ✅ Funcional (PWA limitado)
- Mobile: ✅ Design responsivo otimizado

## 🤝 Contribuindo

Este projeto faz parte do projeto educacional "A História Cantada da AIDS". Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças usando os padrões do projeto
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use `React.createElement` (aliased como `h`) - sem JSX
- Mantenha consistência com o estilo existente
- Teste em múltiplos navegadores e dispositivos
- Verifique que PWA funciona offline antes de commitar

## 📄 Licença

Este projeto é parte do projeto educacional "A História Cantada da AIDS" desenvolvido para promover conhecimento sobre a história da epidemia de AIDS no Brasil através da música.

## 🙏 Agradecimentos

Desenvolvido como ferramenta educacional para preservar a memória cultural da resposta brasileira à epidemia de AIDS e promover educação através da arte e da música.

---

**Desenvolvido com ❤️ para educação, cultura e memória**
