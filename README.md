# A História Cantada da AIDS no Brasil

Uma Progressive Web App (PWA) educacional que apresenta a história da AIDS no Brasil através de músicas temáticas, parte do projeto "A História Cantada da AIDS".

## 📋 Sobre o Projeto

Este aplicativo apresenta uma coleção de músicas brasileiras que abordam o tema HIV/AIDS, oferecendo contexto histórico, análises culturais e transcrições das letras. O projeto visa promover educação e conscientização através da música, documentando como artistas brasileiros abordaram a epidemia de AIDS ao longo das décadas.

## ✨ Características

- **Progressive Web App (PWA)** - Funciona offline e pode ser instalado como app nativo
- **Biblioteca Musical** - Coleção de músicas temáticas sobre HIV/AIDS
- **YouTube Video Embeds** - Vídeos incorporados com reprodução em loop e sem vídeos relacionados
- **Sistema de Temas** - Suporte para temas claro e escuro com persistência
- **Conteúdo Rico** - Para cada música: sinopse, vídeo, letra, referências e fontes
- **Design Responsivo** - Interface adaptável para mobile e desktop
- **Busca Integrada** - Pesquisa por artista, música, tema ou tags
- **Hash Routing** - Navegação client-side sem recarregamento de página
- **Google Analytics** - Rastreamento detalhado de visualizações e interações com músicas

## 🛠️ Tecnologias

- **React** (via CDN) - Framework UI sem build step
- **Howler.js** - Gerenciamento avançado de áudio
- **Vanilla JavaScript** - Sem dependências de build
- **Service Workers** - Suporte offline robusto
- **CSS Custom Properties** - Sistema de temas dinâmico
- **Google Analytics 4 (GA4)** - Rastreamento de métricas e engajamento

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
  "preview": { "src": "https://www.youtube.com/watch?v=VIDEO_ID", "durationSec": 240 },
  "audioDescription": { "src": "/assets/audio/ad1.wav", "durationSec": 2 },
  "synopsisHtml": "<p>Contexto histórico e análise...</p>",
  "transcriptHtml": "<p>Letra da música...</p>",
  "analysisHtml": "<p>Referências e citações...</p>",
  "sources": [{ "label": "YouTube", "url": "https://..." }],
  "tags": ["anos-80", "rock", "aids"]
}
```

### Campos de Conteúdo

- **preview.src** - URL do YouTube (convertida automaticamente para embed com loop e sem vídeos relacionados)
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

### Sistema de Vídeo YouTube

- **Embed Responsivo**: Vídeos em iframe com aspect ratio 16:9
- **Loop Automático**: Vídeos reproduzem em loop contínuo (`loop=1&playlist=videoId`)
- **Sem Vídeos Relacionados**: Parâmetro `rel=0` previne sugestões de outros canais
- **Conversão Automática**: URLs do YouTube convertidas para formato embed
- **Suporte a Formatos**: `youtube.com/watch?v=ID` e `youtu.be/ID`
- **Graceful Fallback**: Mensagem amigável quando vídeo não está disponível

### Navegação

- **Hash Routing**: URLs amigáveis com `#apresentacao`, `#faixas`, `#faixas/song1`
- **Back Navigation**: Botão "Voltar" em todas as páginas secundárias
- **Deep Linking**: Links diretos para músicas específicas

### Tabs de Conteúdo

Cada música tem até 5 tabs organizadas:

1. **Sobre** - Sinopse e contexto histórico
2. **Vídeo** - YouTube embed com loop (apenas se disponível)
3. **Letra** - Transcrição completa da letra
4. **Referência** - Citações e referências bibliográficas
5. **Fontes** - Links para recursos externos

**Visual Feedback**: Tab selecionada destacada com fundo verde (`--color-brand-accent`)

**Comportamento Padrão**: Ao abrir uma música, a tab "Vídeo" é exibida por padrão (quando disponível)

### Hero Images

- **Dimensões**: 400px × 400px (quadrado)
- **Alinhamento**: Centralizado horizontalmente
- **Object-fit**: Cover (mantém proporções)
- **Border**: Borda sutil com border-radius de 12px

## 📊 Google Analytics

### Configuração

O aplicativo está configurado com Google Analytics 4 (GA4) para rastreamento detalhado de uso e engajamento.

- **Measurement ID**: `G-PEL22VN6SD`
- **Implementação**: Google Tag (gtag.js) no `index.html:8-15`
- **Utility**: `AnalyticsTracker` no `app.js:66-233`

### Eventos Rastreados

O aplicativo rastreia os seguintes eventos automaticamente:

#### 1. Visualizações de Página (`page_view`)
Rastreado automaticamente ao navegar entre páginas.

**Parâmetros**:
- `page_name`: Nome da página (home, apresentacao, faixas, faixas/song-id)
- `page_title`: Título da página
- `page_location`: URL completa
- `page_path`: Caminho com hash

**Implementação**: `app.js:863-881`

#### 2. Visualizações de Músicas (`view_item` + `song_view`)
Rastreado quando um usuário abre a página de detalhes de uma música.

**Parâmetros**:
- `song_id`: ID único da música (ex: "song1")
- `song_title`: Título da música
- `artist`: Nome do artista
- `year`: Ano de lançamento
- `item_category`: "song"

**Implementação**: `app.js:687-692`

**Uso para relatórios**: Este evento permite identificar as **músicas mais visualizadas** através do parâmetro `song_id` ou `song_title`.

#### 3. Reprodução de Vídeos/Áudio (`audio_play`)
Rastreado quando:
- Um vídeo do YouTube é exibido (ao clicar na tab "Vídeo")
- O áudio de apresentação é reproduzido

**Parâmetros**:
- `song_id`: ID da música (para vídeos)
- `song_title`: Título da música
- `audio_type`: Tipo de mídia ("video", "preview", "audio_description")
- `event_category`: "engagement"
- `event_label`: "{song_title} - {audio_type}"

**Implementação**:
- Vídeos: `app.js:718-721`
- Apresentação: `app.js:587-592`

**Uso para relatórios**: Este evento permite identificar as **músicas mais ouvidas/assistidas** através dos parâmetros `song_id`, `song_title` e `audio_type`.

#### 4. Visualizações de Tabs (`tab_view`)
Rastreado quando um usuário alterna entre tabs de conteúdo (Sobre, Vídeo, Letra, Referência, Fontes).

**Parâmetros**:
- `song_id`: ID da música
- `song_title`: Título da música
- `tab_name`: Nome da tab ("video", "letra", "sobre", "referencia", "fontes")
- `event_category`: "engagement"

**Implementação**: `app.js:715-717`

#### 5. Buscas (`search`)
Rastreado quando um usuário realiza uma busca na página de músicas.

**Parâmetros**:
- `search_term`: Termo pesquisado
- `result_count`: Número de resultados encontrados
- `event_category`: "engagement"

**Implementação**: `app.js:613-616`

#### 6. Navegação (`navigation`)
Rastreado ao navegar entre páginas (de uma página para outra).

**Parâmetros**:
- `from_page`: Página de origem
- `to_page`: Página de destino
- `event_category`: "navigation"

**Implementação**: `app.js:877-879`

#### 7. Alteração de Tema (`theme_toggle`)
Rastreado quando um usuário alterna entre tema claro e escuro.

**Parâmetros**:
- `theme`: Tema aplicado ("light" ou "dark")
- `event_category`: "user_preference"

**Implementação**: `app.js:845-846`

### Como Acessar as Métricas no Google Analytics 4

#### Passo 1: Acessar o Google Analytics

1. Acesse [analytics.google.com](https://analytics.google.com)
2. Faça login com sua conta Google
3. Selecione a propriedade **História Cantada** (ID: G-PEL22VN6SD)

#### Passo 2: Visualização em Tempo Real

Para ver dados em tempo real (eventos acontecendo agora):

1. No menu lateral esquerdo, clique em **Reports** (Relatórios)
2. Clique em **Realtime** (Tempo Real)
3. Você verá:
   - Usuários ativos agora
   - Visualizações de página nos últimos 30 minutos
   - Eventos personalizados em tempo real

**Nota**: Dados em tempo real aparecem instantaneamente. Dados completos podem levar 24-48 horas.

#### Passo 3: Relatórios de Eventos

Para ver todos os eventos rastreados:

1. No menu lateral, vá para **Reports** → **Engagement** → **Events**
2. Você verá uma lista de eventos:
   - `page_view`
   - `song_view` ← Visualizações de músicas
   - `audio_play` ← Reproduções de vídeo/áudio
   - `tab_view`
   - `search`
   - `navigation`
   - `theme_toggle`
3. Clique em qualquer evento para ver detalhes

### Relatórios Personalizados Recomendados

#### 🎵 Músicas Mais Visualizadas

**Objetivo**: Descobrir quais músicas têm mais visualizações de página.

**Passo a passo**:

1. Vá para **Reports** → **Engagement** → **Events**
2. Na tabela de eventos, clique no evento **`song_view`**
3. Clique no botão **"+"** ao lado de "Event name" para adicionar uma dimensão secundária
4. Selecione **"Event parameter: song_title"** (ou crie um parâmetro personalizado se necessário)
5. A tabela agora mostrará:
   - Coluna 1: Título da música
   - Coluna 2: Event count (número de visualizações)
6. Clique no cabeçalho "Event count" para ordenar do maior para o menor

**Alternativa usando Exploração**:

1. No menu lateral, clique em **Explore** (Explorar)
2. Clique em **"Free form"** (Forma livre) ou **"Blank"** (Em branco)
3. Configure:
   - **Dimensions** (Dimensões): Arraste `Event name` e adicione parâmetros customizados
   - No canto direito, clique em **"+"** próximo a Dimensions
   - Digite "song" na busca
   - Adicione: `song_title`, `song_id`, `artist`, `year`
4. Configure:
   - **Metrics** (Métricas): `Event count`
5. Construa a tabela:
   - Arraste `song_title` para **Rows** (Linhas)
   - Arraste `Event count` para **Values** (Valores)
6. No painel **Filters** (Filtros):
   - Adicione um filtro: `Event name` = `song_view`
7. Clique em **Apply** (Aplicar)

**Resultado**: Tabela ordenada com as músicas mais visualizadas.

#### 🎬 Músicas Mais Ouvidas/Assistidas

**Objetivo**: Descobrir quais músicas têm mais reproduções de vídeo/áudio.

**Passo a passo usando Exploração**:

1. Vá para **Explore** → **Free form**
2. Adicione dimensões:
   - Clique no **"+"** próximo a Dimensions
   - Busque e adicione: `song_title`, `audio_type`, `event_name`
3. Adicione métrica:
   - `Event count`
4. Construa a tabela:
   - Arraste `song_title` para **Rows**
   - Arraste `audio_type` para **Rows** (abaixo de song_title)
   - Arraste `Event count` para **Values**
5. Configure filtros:
   - Filtro 1: `Event name` = `audio_play`
   - (Opcional) Filtro 2: `audio_type` = `video` (para ver apenas vídeos)
6. Clique em **Apply**

**Resultado**: Você verá uma tabela hierárquica mostrando:
- Cada música
- Tipos de reprodução (video, audio_description)
- Contagem total de reproduções

**Para exportar**:
- Clique no botão **"Share"** (Compartilhar) no canto superior direito
- Escolha **"Download file"** (Baixar arquivo)
- Selecione formato: CSV ou PDF

#### 📊 Top 10 Músicas - Dashboard Completo

**Criar um relatório customizado combinando visualizações e reproduções**:

1. Vá para **Explore** → **Free form**
2. Adicione dimensões:
   - `song_title`
   - `artist`
   - `year`
3. Adicione métricas customizadas:
   - `Event count` (total de eventos)
4. Configure duas tabs ou segmentos:

   **Tab 1: Visualizações**
   - Filtro: `Event name` = `song_view`
   - Mostra: Top músicas por visualizações

   **Tab 2: Reproduções**
   - Filtro: `Event name` = `audio_play`
   - Mostra: Top músicas por reproduções

5. Salve o relatório:
   - Clique em **"Save"** no canto superior direito
   - Nomeie: "Top Músicas - História Cantada"
   - Escolha onde salvar (Library compartilhada ou pessoal)

#### 🔍 Relatório de Busca

**Ver termos mais pesquisados**:

1. **Explore** → **Free form**
2. Dimensões: `search_term`, `event_name`
3. Métricas: `Event count`, `result_count` (média)
4. Filtro: `Event name` = `search`
5. Ordene por `Event count` decrescente

**Resultado**: Lista de termos de busca mais populares e quantos resultados cada busca retornou em média.

#### 📈 Funil de Engajamento

**Ver a jornada do usuário: Navegação → Visualização → Reprodução**:

1. No menu lateral, vá para **Explore**
2. Selecione template **"Funnel exploration"** (Exploração de funil)
3. Configure as etapas:
   - **Etapa 1**: `page_view` onde `page_name` contém "faixas"
   - **Etapa 2**: `song_view` (visualização de música)
   - **Etapa 3**: `audio_play` (reprodução)
4. Adicione breakdown (opcional):
   - Por `song_title` para ver funil por música
   - Por `device_category` para ver desktop vs mobile

**Resultado**: Visualização gráfica mostrando:
- Quantos usuários visitam a lista de músicas
- Quantos abrem uma música específica
- Quantos reproduzem o vídeo/áudio
- Taxa de conversão entre etapas

#### 🎨 Análise de Engajamento por Conteúdo

**Ver quais tabs (Sobre, Vídeo, Letra, etc.) são mais acessadas**:

1. **Explore** → **Free form**
2. Dimensões: `tab_name`, `song_title`
3. Métrica: `Event count`
4. Filtro: `Event name` = `tab_view`
5. Construção:
   - Rows: `tab_name` (principal), `song_title` (secundário)
   - Values: `Event count`

**Resultado**: Mostra quais tipos de conteúdo (letra, vídeo, sobre) são mais consumidos.

### Dicas para Uso Avançado

#### Criar Dashboards Personalizados

1. No menu lateral, clique em **Library** (Biblioteca)
2. Clique em **Create new** (Criar novo) → **Dashboard**
3. Adicione widgets de seus relatórios salvos
4. Organize visualmente para ter uma visão geral

#### Agendar Relatórios por Email

1. Em qualquer relatório de Exploração salvo
2. Clique em **Share** → **Schedule email**
3. Configure:
   - Frequência: Diária, Semanal, Mensal
   - Destinatários
   - Formato: PDF ou CSV

#### Comparar Períodos

Em qualquer relatório:
1. Clique no seletor de data no canto superior direito
2. Ative **"Compare to"** (Comparar com)
3. Escolha período de comparação (semana anterior, mês anterior, etc.)

### Métricas-Chave para Acompanhar

**Semanalmente**:
- Top 5 músicas mais visualizadas (`song_view`)
- Top 5 músicas mais reproduzidas (`audio_play`)
- Termos de busca mais populares (`search`)

**Mensalmente**:
- Taxa de conversão: visualizações → reproduções
- Distribuição de uso por tema (claro vs escuro)
- Análise de engajamento por tipo de conteúdo (tabs)

**Trimestralmente**:
- Tendências de crescimento de audiência
- Músicas "evergreen" (consistentemente populares)
- Padrões de navegação e jornada do usuário

### Privacidade

O rastreamento é implementado de forma a respeitar a privacidade do usuário:
- Nenhuma informação pessoal identificável é coletada
- Apenas dados de interação com o aplicativo são rastreados
- Cookies são gerenciados pelo Google Analytics conforme suas políticas

## 🔄 Atualizações Recentes

### v2.1.0 - Google Analytics Integration (2025-11-23)

**Analytics Implementation**:
- Adicionado Google Analytics 4 (GA4) com ID `G-PEL22VN6SD` (index.html:8-15)
- Implementado `AnalyticsTracker` utility class para eventos customizados (app.js:66-233)
- Rastreamento automático de visualizações de página em todas as rotas (app.js:863-881)
- Rastreamento de visualizações de músicas com metadados completos (app.js:687-692)
- Rastreamento de reprodução de vídeos e áudio (app.js:718-721, 587-592)

**Event Tracking**:
- `song_view`: Rastreia músicas mais visualizadas com song_id, título, artista e ano
- `audio_play`: Rastreia reprodução de vídeos/áudio com tipo de mídia (video, audio_description)
- `tab_view`: Rastreia engajamento com tabs de conteúdo (Sobre, Vídeo, Letra, etc.)
- `search`: Rastreia termos de busca e número de resultados
- `navigation`: Rastreia fluxo de navegação entre páginas
- `theme_toggle`: Rastreia preferências de tema (light/dark)

**Reporting Capabilities**:
- Identificação de músicas mais visualizadas via evento `song_view`
- Identificação de músicas mais ouvidas/assistidas via evento `audio_play`
- Análise de engajamento por tipo de conteúdo (tabs)
- Funil de conversão: visualização → engajamento → reprodução
- Insights sobre comportamento de busca e navegação

### v2.0.0 - YouTube Video Integration (2025-11-22)

**Video Embed System**:
- Adicionado suporte completo para vídeos do YouTube (app.js:28-48)
- Conversão automática de URLs para formato embed com parâmetros otimizados
- Loop automático (`loop=1&playlist=videoId`) para reprodução contínua
- Remoção de vídeos relacionados (`rel=0`) para experiência focada
- Iframe responsivo com aspect ratio 16:9 (app.js:532-562)

**UI Improvements**:
- Nova tab "Vídeo" como segunda opção (após "Sobre")
- Botões "Trecho" renomeados para "Vídeo" na lista de músicas
- Remoção completa dos botões "Audiodescrição"
- Tab "Vídeo" como padrão ao abrir músicas (app.js:509)
- Hero images centralizadas horizontalmente (theme.css:476-478)

**Data Structure**:
- Campo `videoUrl` extraído automaticamente do `preview.src`
- Suporte para URLs nos formatos `youtube.com/watch?v=` e `youtu.be/`
- Detecção inteligente: URLs do YouTube vão para vídeo, outros para áudio
- 18 de 20 músicas com vídeos do YouTube disponíveis

**Navigation Flow**:
- Botão "Vídeo" na lista leva direto para a página da música
- Página abre automaticamente na tab de vídeo
- Experiência de usuário mais direta e intuitiva

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
