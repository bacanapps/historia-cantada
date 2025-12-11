(() => {
  const { createElement: h, useEffect, useMemo, useState, useCallback, useRef } = React;

  /* ---------------- APP VERSION ---------------- */
  // Update this manually when deploying to reflect last GitHub update
  const APP_VERSION = '11/12/2025, 13:13';
  const getAppVersion = () => {
    return `(v. ${APP_VERSION})`;
  };

  /* ---------------- Utilities ---------------- */
  const toRel = (input) => {
    if (input == null) return null;
    let val = input;
    for (let i = 0; i < 3 && typeof val === "object"; i++) {
      if (val instanceof URL) { val = val.toString(); break; }
      if (Array.isArray(val)) { val = val.find(Boolean); continue; }
      val =
        val.file ??
        val.url ??
        val.href ??
        val.src ??
        val.path ??
        (typeof val.toString === "function" ? val.toString() : "");
    }
    const s = String(val ?? "").trim();
    if (!s) return null;
    if (/^(https?:)?\/\//i.test(s)) return s;
    if (s.startsWith("//")) return (self.location?.protocol || "https:") + s;
    if (s[0] === "/" && s[1] !== "/") return `.${s}`;
    return s;
  };

  // Convert YouTube watch URL to embed URL with loop and no related videos
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      let videoId = null;

      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }

      if (videoId) {
        // Parameters:
        // - loop=1: Enable looping
        // - playlist=videoId: Required for loop to work
        // - rel=0: No related videos from other channels
        // - modestbranding=1: Minimal YouTube branding
        // - disablekb=1: Disable keyboard controls
        // - fs=0: Disable fullscreen button (keeps users in kiosk)
        return `https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}&rel=0&modestbranding=1&disablekb=1&fs=0`;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Avoid stale SW in local dev
  (function unregisterSWOnLocalhost() {
    try {
      const host = location.hostname;
      if ((host === "localhost" || host === "127.0.0.1") && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
      }
    } catch (_) {}
  })();

  /* --------------- Analytics Tracker --------------- */
  const AnalyticsTracker = {
    /**
     * Check if gtag is available
     */
    isAvailable() {
      return typeof window.gtag === 'function';
    },

    /**
     * Track page views
     * @param {string} pageName - Name of the page (e.g., 'home', 'faixas', 'apresentacao')
     * @param {string} pageTitle - Title of the page
     */
    trackPageView(pageName, pageTitle) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'page_view', {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: window.location.pathname + window.location.hash,
          page_name: pageName
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track song views (when user opens a song detail page)
     * @param {string} songId - Unique identifier of the song
     * @param {string} songTitle - Title of the song
     * @param {string} artist - Artist name
     * @param {string} year - Year of the song
     */
    trackSongView(songId, songTitle, artist, year) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'view_item', {
          item_id: songId,
          item_name: songTitle,
          item_category: 'song',
          artist: artist,
          year: year
        });
        // Also send a custom event for easier filtering
        window.gtag('event', 'song_view', {
          song_id: songId,
          song_title: songTitle,
          artist: artist,
          year: year
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track audio plays (video or audio preview)
     * @param {string} songId - Unique identifier of the song
     * @param {string} songTitle - Title of the song
     * @param {string} audioType - Type of audio ('video', 'preview', 'audio_description')
     */
    trackAudioPlay(songId, songTitle, audioType) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'audio_play', {
          song_id: songId,
          song_title: songTitle,
          audio_type: audioType,
          event_category: 'engagement',
          event_label: `${songTitle} - ${audioType}`
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track presentation audio plays
     * @param {string} contentTitle - Title of the content
     */
    trackPresentationAudio(contentTitle) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'audio_play', {
          content_type: 'presentation',
          content_title: contentTitle,
          audio_type: 'audio_description',
          event_category: 'engagement'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track search queries
     * @param {string} searchTerm - The search term entered by user
     * @param {number} resultCount - Number of results returned
     */
    trackSearch(searchTerm, resultCount) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'search', {
          search_term: searchTerm,
          result_count: resultCount,
          event_category: 'engagement'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track tab changes in song detail page
     * @param {string} songId - Unique identifier of the song
     * @param {string} songTitle - Title of the song
     * @param {string} tabName - Name of the tab ('video', 'letra', 'sobre', 'referencia', 'fontes')
     */
    trackTabChange(songId, songTitle, tabName) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'tab_view', {
          song_id: songId,
          song_title: songTitle,
          tab_name: tabName,
          event_category: 'engagement'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track theme toggle
     * @param {string} newTheme - The new theme applied
     */
    trackThemeToggle(newTheme) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'theme_toggle', {
          theme: newTheme,
          event_category: 'user_preference'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track language toggle
     * @param {string} newLanguage - The new language applied ('en' or 'pt-br')
     */
    trackLanguageToggle(newLanguage) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'language_toggle', {
          language: newLanguage,
          event_category: 'user_preference'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    },

    /**
     * Track navigation events
     * @param {string} from - Source page
     * @param {string} to - Destination page
     */
    trackNavigation(from, to) {
      if (!this.isAvailable()) return;
      try {
        window.gtag('event', 'navigation', {
          from_page: from,
          to_page: to,
          event_category: 'navigation'
        });
      } catch (e) {
        console.error('Analytics tracking error:', e);
      }
    }
  };

  function showFatalError(message, err) {
    try {
      const root = document.getElementById("root");
      if (!root) return;
      root.innerHTML = "";
      const box = document.createElement("div");
      box.style.cssText =
        "background:#111;color:#fff;padding:20px;font-family:monospace;white-space:pre-wrap;";
      const title = document.createElement("div");
      title.textContent = "Erro fatal ao carregar a aplicação";
      title.style.fontWeight = "700";
      title.style.marginBottom = "8px";
      const msg = document.createElement("div");
      msg.textContent = message;
      const pre = document.createElement("pre");
      pre.textContent = (err && err.stack) || String(err || "");
      pre.style.marginTop = "12px";
      pre.style.maxHeight = "60vh";
      pre.style.overflow = "auto";
      box.appendChild(title);
      box.appendChild(msg);
      box.appendChild(pre);
      root.appendChild(box);
    } catch (_) {}
  }
  addEventListener("error", (ev) =>
    showFatalError(ev.message || "Script error.", ev.error || ev)
  );
  addEventListener("unhandledrejection", (ev) =>
    showFatalError(
      ev?.reason ? ev.reason.message || String(ev.reason) : "Unhandled promise rejection",
      ev?.reason || ev
    )
  );

  /* --------------- Routing (hash) --------------- */
  const ROUTES = { home: "home", apresentacao: "apresentacao", faixas: "faixas" };
  const normalizeHash = (hash) => String(hash || "").replace(/^#/, "").trim().toLowerCase();

  function parseRoute(hash) {
    const v = normalizeHash(hash);
    if (!v) return { name: ROUTES.home };
    if (v === ROUTES.apresentacao || v === "apresentação") return { name: ROUTES.apresentacao };
    if (v === ROUTES.faixas) return { name: ROUTES.faixas };
    if (v.startsWith("faixas/")) {
      const slug = v.slice("faixas/".length).trim();
      return { name: "faixas-detail", slug };
    }
    return { name: ROUTES.home };
  }

  function useHashRoute(defaultRoute) {
    const [route, setRoute] = useState(() => parseRoute(location.hash) || { name: defaultRoute });
    useEffect(() => {
      const onHash = () => setRoute(parseRoute(location.hash));
      addEventListener("hashchange", onHash);
      return () => removeEventListener("hashchange", onHash);
    }, []);
    const navigate = useCallback((r) => { location.hash = r; }, []);
    return [route, navigate];
  }

  /* --------------- Audio (Howler) --------------- */
  function useAudio() {
    const [state, setState] = useState({ id: null, playing: false });
    const ref = useRef({ id: null, howl: null });

    const teardown = useCallback((stop = true) => {
      const cur = ref.current;
      if (cur.howl) {
        try { if (stop) cur.howl.stop(); } catch {}
        try { cur.howl.unload(); } catch {}
      }
      ref.current = { id: null, howl: null };
      setState({ id: null, playing: false });
    }, []);

    const toggle = useCallback((id, src) => {
      const HowlCtor = window.Howl || (window.Howler && window.Howler.Howl);
      if (!HowlCtor || !id || !src) return;
      src = toRel(src);
      const cur = ref.current;

      if (cur.id === id && cur.howl) {
        if (cur.howl.playing()) { cur.howl.pause(); setState({ id, playing: false }); }
        else { cur.howl.play(); setState({ id, playing: true }); }
        return;
      }

      teardown();
      const howl = new HowlCtor({
        src: [src],
        html5: true,
        onend: () => teardown(false),
        onstop: () => teardown(false),
      });
      ref.current = { id, howl };
      setState({ id, playing: true });
      howl.play();
    }, [teardown]);

    return { id: state.id, playing: state.playing, toggle, stopAll: teardown };
  }

  /* --------------- Translations --------------- */
  const TRANSLATIONS = {
    'pt-br': {
      nav: {
        home: 'Home',
        apresentacao: 'Apresentação',
        musicas: 'Músicas',
        voltar: 'Voltar'
      },
      home: {
        heroTitle: 'A História Cantada da Aids no Brasil',
        heroDesc: 'Descubra músicas temáticas sobre a aids no Brasil, suas histórias e análises.',
        cardApresentacao: {
          title: 'Apresentação',
          button: 'Explorar'
        },
        cardMusicas: {
          title: 'Músicas',
          button: 'Explorar'
        }
      },
      apresentacao: {
        title: 'Apresentação',
        subtitle: 'A História Cantada',
        loading: 'Carregando…',
        audioBtnPlay: '▶️ Audiodescrição',
        audioBtnPause: '⏸️ Pausar'
      },
      faixas: {
        title: 'Músicas',
        subtitle: 'Biblioteca',
        searchPlaceholder: 'Buscar por artista, música, tema…',
        clearBtn: 'Limpar busca',
        loading: 'Carregando…',
        noResults: 'Nenhuma música encontrada.',
        videoBtn: '▶️ Vídeo'
      },
      faixasDetail: {
        loading: 'Carregando…',
        notFound: 'Música não encontrada.',
        tabs: {
          sobre: 'Sobre',
          video: 'Vídeo',
          letra: 'Letra',
          referencia: 'Referência',
          fontes: 'Fontes'
        },
        emptyStates: {
          video: 'Vídeo não disponível.',
          letra: 'Sem letra disponível.',
          sobre: 'Sem conteúdo.',
          referencia: 'Sem conteúdo.',
          fontes: 'Sem fontes.'
        },
        audioBtnPlay: '▶️ Reproduzir',
        audioBtnPause: '⏸️ Pausar',
        audioBtnAd: '▶️ Audiodescrição'
      },
      common: {
        themeToggleAria: 'Alternar tema visual',
        languageToggleAria: 'Alternar idioma',
        languageLabel: 'Português',
        footer: '© 2025 Dezembro Vermelho • Ministério da Saúde'
      },
      errors: {
        fatalTitle: 'Erro fatal ao carregar a aplicação',
        scriptError: 'Script error.',
        promiseRejection: 'Unhandled promise rejection'
      }
    },
    'en': {
      nav: {
        home: 'Home',
        apresentacao: 'Introduction',
        musicas: 'Songs',
        voltar: 'Back'
      },
      home: {
        heroTitle: 'The Musical History of AIDS',
        heroDesc: 'Discover songs about AIDS in Brazil, their stories, and analyses.',
        cardApresentacao: {
          title: 'Introduction',
          button: 'Explore'
        },
        cardMusicas: {
          title: 'Songs',
          button: 'Explore'
        }
      },
      apresentacao: {
        title: 'Introduction',
        subtitle: 'The Musical History',
        loading: 'Loading…',
        audioBtnPlay: '▶️ Audio Description',
        audioBtnPause: '⏸️ Pause'
      },
      faixas: {
        title: 'Songs',
        subtitle: 'Library',
        searchPlaceholder: 'Search by artist, song, theme…',
        clearBtn: 'Clear search',
        loading: 'Loading…',
        noResults: 'No songs found.',
        videoBtn: '▶️ Video'
      },
      faixasDetail: {
        loading: 'Loading…',
        notFound: 'Song not found.',
        tabs: {
          sobre: 'About',
          video: 'Video',
          letra: 'Lyrics',
          referencia: 'Reference',
          fontes: 'Sources'
        },
        emptyStates: {
          video: 'Video not available.',
          letra: 'No lyrics available.',
          sobre: 'No content.',
          referencia: 'No content.',
          fontes: 'No sources.'
        },
        audioBtnPlay: '▶️ Play',
        audioBtnPause: '⏸️ Pause',
        audioBtnAd: '▶️ Audio Description'
      },
      common: {
        themeToggleAria: 'Toggle visual theme',
        languageToggleAria: 'Toggle language',
        languageLabel: 'English',
        footer: '© 2025 Red December • Ministry of Health'
      },
      errors: {
        fatalTitle: 'Fatal error loading application',
        scriptError: 'Script error.',
        promiseRejection: 'Unhandled promise rejection'
      }
    }
  };

  /**
   * Translation helper function
   * @param {string} language - The current language ('en' or 'pt-br')
   * @param {string} key - The translation key path (e.g., 'home.heroTitle')
   * @returns {string} The translated string
   */
  function t(language, key) {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to Portuguese if key not found
        value = TRANSLATIONS['pt-br'];
        for (const k2 of keys) {
          if (value && typeof value === 'object') {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return value || key;
  }

  /* --------------- Data --------------- */
  async function tryJson(url) {
    try {
      console.log("Fetching JSON from:", url);
      const res = await fetch(url, { cache: "no-store" });
      console.log("Response status:", res.status, res.ok);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      console.log("JSON loaded successfully:", data);
      return data;
    } catch (err) {
      console.error("Failed to load JSON from", url, "Error:", err);
      return null;
    }
  }

  function usePresentation() {
    // Embedded fallback data - same as presentation.json
    const FALLBACK = {
      title: {
        "pt-br": "A História Cantada da Aids no Brasil",
        "en": "The Musical History of AIDS in Brazil"
      },
      introHtml: {
        "pt-br": "<p>A década de 1980 foi marcada pelo surgimento da epidemia de aids e pelo auge do pop rock brasileiro. O samba também fez contribuições ao tema neste período. Não por acaso, diversos artistas, bandas e até escolas de samba abordaram a temática em suas canções e enredos. Convidamos você a conhecer \u201cA História Cantada da Aids\u201d e as possíveis relações síncronas entre cultura e epidemia. </p><p>Parte-se do pressuposto que as músicas possuem potencialidades de interpretação e reflexão social, pois, ao mesmo tempo em que expressam sentimentos individuais, revelam e problematizam questões coletivas, culturais e históricas da resposta brasileira à aids.</p>",
        "en": "<p>The 1980s were marked by the emergence of AIDS and the heyday of Brazilian pop rock. Samba also contributed to the theme during this period. It is no coincidence that several artists, bands, and even samba schools addressed the epidemic in their songs and storylines. We invite you to learn about \"The Musical History of AIDS\" and the possible synchronous relationships between culture and the epidemic.</p><p>We start from the premise that these songs have potential for interpretation and social reflection, because, while expressing individual feelings, they reveal and problematize collective, cultural, and historical issues in Brazil's response to AIDS.</p>"
      },
      audioDescription: {
        "pt-br": { src: "./assets/audio/presentation.mp3", durationSec: 2 }
      },
      heroImage: "./assets/img/logo_aids_40anos.png",
      credits: [{ role: "Curadoria", name: "Nome do Curador" }],
      language: "multi"
    };

    const [data, setData] = useState(FALLBACK);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      (async () => {
        const url = new URL("./data/presentation.json", location.href).toString();
        console.log("Loading presentation from:", url);
        const json = await tryJson(url);
        console.log("Presentation data loaded:", json);
        if (json) {
          setData(json);
        }
        setLoading(false);
      })();
    }, []);
    return { data, loading };
  }

  async function loadAllSongs() {
    const candidates = [
      "./data/songs.json",
      "./data/fsongs.json",
      "./data/tracks.json",
    ].map((p) => new URL(p, location.href).toString());

    let raw = null;
    for (const url of candidates) {
      raw = await tryJson(url);
      if (Array.isArray(raw)) break;
    }

    if (!Array.isArray(raw) && raw && typeof raw === "object") {
      if (Array.isArray(raw.tracks)) raw = raw.tracks;
      else if (Array.isArray(raw.songs)) raw = raw.songs;
      else if (Array.isArray(raw.items)) raw = raw.items;
    }
    if (!Array.isArray(raw)) return [];

    const norm = (t, i) => {
      if (!t || typeof t !== "object") return null;

      const id = String(t.slug || t.id || `track-${i + 1}`).trim();
      const title = (t.title || t.name || `Faixa ${i + 1}`).toString().trim();
      const artist = (t.artist || t.author || (t.meta && t.meta.artist) || "").toString();
      const year = (t.year || (t.meta && t.meta.year) || "")?.toString() || "";

      const cover = toRel(
        (t.cover) ||
        (t.assets && (t.assets.coverImage || t.assets.cover)) ||
        "./assets/img/hero.png"
      );

      let previewAudio = null;
      let videoUrl = null;

      // Extract video URL and audio from preview field
      if (t.preview) {
        if (typeof t.preview === 'object') {
          const src = t.preview.src || t.preview.file || t.preview.url;
          if (src && src.includes('youtube.com')) {
            videoUrl = src;
          } else {
            previewAudio = toRel(src);
          }
        } else {
          const src = t.preview;
          if (src && src.includes('youtube.com')) {
            videoUrl = src;
          } else {
            previewAudio = toRel(src);
          }
        }
      }

      // Fallback for audio
      if (!previewAudio) {
        previewAudio = toRel(
          (t.previewSrc) ||
          (t.assets && t.assets.preview && (t.assets.preview.file || t.assets.preview.src)) ||
          t.audio || t.src || `./assets/audio/${id}.mp3`
        );
      }

      const adAudio = toRel(
        (t.audioDescription) ||
        (t.adSrc) ||
        (t.assets && t.assets.audioDescription && (t.assets.audioDescription.file || t.assets.audioDescription.src)) ||
        ""
      );

      const transcriptHtml = t.transcriptHtml || t.letraHtml || t.lyricsHtml || null;
      const transcript = t.transcript || t.lyrics || t.letra || null;
      const synopsisHtml = t.synopsisHtml || t.sobreHtml || t.aboutHtml || null;
      const synopsis = t.synopsis || t.sobre || t.about || null;
      const referenciaHtml = t.referenciaHtml || t.analiseHtml || t.analysisHtml || null;
      const referencia = t.referencia || t.analise || t.analysis || null;

      const fontesArr = Array.isArray(t.fontes) ? t.fontes : (Array.isArray(t.sources) ? t.sources : []);
      const fontes = (fontesArr || []).map((s) => {
        if (!s) return null;
        if (typeof s === "string") return { label: s, url: s };
        if (typeof s === "object") {
          return { label: s.label || s.title || s.url || s.href || "Fonte", url: s.url || s.href || "#" };
        }
        return null;
      }).filter(Boolean);

      return {
        id, title, artist, year, cover,
        previewAudio, adAudio, videoUrl,
        transcriptHtml, transcript, synopsisHtml, synopsis, referenciaHtml, referencia, fontes,
        meta: [artist, year && String(year)].filter(Boolean).join(" • "),
      };
    };

    return raw.map(norm).filter(Boolean).filter((x) => x.title && x.id);
  }

  function useTracks() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      (async () => { setTracks(await loadAllSongs()); setLoading(false); })();
    }, []);
    return { tracks, loading };
  }

  function useTrackById(slug) {
    const [state, setState] = useState({ loading: true, item: null });
    useEffect(() => {
      let alive = true;
      (async () => {
        const list = await loadAllSongs();
        const found = list.find((x) => x.id.toLowerCase() === String(slug || "").toLowerCase());
        if (!alive) return;
        setState({ loading: false, item: found || null });
      })();
      return () => { alive = false; };
    }, [slug]);
    return state;
  }

  /* --------------- UI Bits --------------- */
  function BackBtn({ onClick, language }) {
    return h(
      "button",
      { className: "back-button", type: "button", onClick },
      h("span", { "aria-hidden": "true" }, "← "),
      t(language, 'nav.voltar')
    );
  }

  /* --------------- Pages --------------- */
function Home({ onGo, theme, toggleTheme, language, toggleLanguage }) {
  return h("div", { className: "page fade-in" },
    h("button", {
      className: "theme-toggle-btn",
      onClick: toggleTheme,
      "aria-label": t(language, 'common.themeToggleAria')
    }, theme === 'dark' ? '☀️' : '🌙'),

    h("button", {
      className: "language-toggle-btn",
      onClick: toggleLanguage,
      "aria-label": t(language, 'common.languageToggleAria')
    }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN'),

    h("section", { className: "hero hero-gradient glass-card" },
      h("div", { className: "hero-header" },
        h("div", { className: "hero-content" },
          h("h1", { className: "hero-title" }, t(language, 'home.heroTitle')),
          h("p", { className: "hero-lede" },
            t(language, 'home.heroDesc')
          )
        )
      )
    ),

    h("section", { className: "home-cards" },
      h("div", { className: "cards-2col" },

        h("article", {
          className: "choice-card glass-card",
          role: "button",
          tabIndex: 0,
          onClick: () => onGo("apresentacao")
        },
          h("div", { className: "choice-icon" }, "📘"),
          h("h2", { className: "choice-title" }, t(language, 'home.cardApresentacao.title')),
          h("p", { className: "choice-desc" }, ""),
          h("button", { type: "button", className: "btn btn-primary" }, t(language, 'home.cardApresentacao.button'))
        ),

        h("article", {
          className: "choice-card glass-card",
          role: "button",
          tabIndex: 0,
          onClick: () => onGo("faixas")
        },
          h("div", { className: "choice-icon" }, "🎵"),
          h("h2", { className: "choice-title" }, t(language, 'home.cardMusicas.title')),
          h("p", { className: "choice-desc" }, ""),
          h("button", { type: "button", className: "btn btn-green" }, t(language, 'home.cardMusicas.button'))
        )
      )
    ),

    h("div", { className: "app-footer-line" },
      h("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
      h("button", {
        className: "footer-lang-toggle",
        onClick: toggleLanguage,
        "aria-label": t(language, 'common.languageToggleAria'),
        style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
      }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
    )
  );
}

  function Presentation({ onBack, audio, theme, toggleTheme, language, toggleLanguage }) {
    const { data, loading } = usePresentation();
    const hero = toRel((data && data.heroImage) || "./assets/img/hero.png");

    // Extract language-specific content
    const text = data && data.introHtml
      ? (typeof data.introHtml === 'object' ? (data.introHtml[language] || data.introHtml['pt-br']) : data.introHtml)
      : "Bem-vindo(a) à História Cantada.";

    // Extract language-specific audio (if available)
    const audioData = data && data.audioDescription
      ? (typeof data.audioDescription === 'object' && data.audioDescription[language]
          ? data.audioDescription[language]
          : (typeof data.audioDescription === 'object' && data.audioDescription['pt-br']
              ? data.audioDescription['pt-br']
              : data.audioDescription))
      : null;
    const audioSrc = toRel(audioData && audioData.src ? audioData.src : "./assets/audio/presentation.mp3");

    const isActive = audio.id === "presentation";
    const btnLabel = isActive && audio.playing
      ? t(language, 'apresentacao.audioBtnPause')
      : t(language, 'apresentacao.audioBtnPlay');

    // Hide audio button when English selected (audio not ready yet)
    const showAudioButton = language === 'pt-br';

    return h("div", { className: "page fade-in" },
      h("header", { className: "page-header" },
        h(BackBtn, { onClick: onBack, language }),
        h("div", { className: "page-header-content" },
          h("h1", { className: "page-title" }, t(language, 'apresentacao.title')),
          h("p", { className: "page-subtle" }, t(language, 'apresentacao.subtitle'))
        ),
        h("button", {
          className: "theme-toggle-btn",
          onClick: toggleTheme,
          "aria-label": t(language, 'common.themeToggleAria')
        }, theme === 'dark' ? '☀️' : '🌙'),
        h("button", {
          className: "language-toggle-btn",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria')
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      ),
      h("section", { className: "panel glass-card" },
        h("div", { className: "presentation-heroimg-wrapper" },
          h("img", { className: "hero-image", src: hero, alt: t(language, 'apresentacao.subtitle') })
        ),
        loading
          ? h("p", null, t(language, 'apresentacao.loading'))
          : h("div", { className: "copy", dangerouslySetInnerHTML: { __html: text } }),
        showAudioButton && h("div", { className: "audio-row" },
          h("button", {
            className: "audio-btn",
            type: "button",
            onClick: () => {
              audio.toggle("presentation", audioSrc);
              if (!isActive || !audio.playing) {
                AnalyticsTracker.trackPresentationAudio(t(language, 'apresentacao.title'));
              }
            },
            "aria-pressed": String(isActive && audio.playing),
          }, btnLabel)
        )
      ),

      h("div", { className: "app-footer-line" },
        h("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        h("button", {
          className: "footer-lang-toggle",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  function Tracks({ onBack, audio, onOpenTrack, theme, toggleTheme, language, toggleLanguage }) {
    const { tracks, loading } = useTracks();
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
      const needle = q.trim().toLowerCase();
      if (!needle) return tracks;
      const results = tracks.filter((track) =>
        [track.title, track.artist, track.meta, ...(track.tags || [])].join(" ").toLowerCase().includes(needle)
      );
      // Track search when there's a query
      if (needle) {
        AnalyticsTracker.trackSearch(needle, results.length);
      }
      return results;
    }, [q, tracks]);

    return h("div", { className: "page fade-in" },
      h("header", { className: "page-header" },
        h(BackBtn, { onClick: onBack, language }),
        h("div", { className: "page-header-content" },
          h("h1", { className: "page-title" }, t(language, 'faixas.title')),
          h("p", { className: "page-subtle" }, t(language, 'faixas.subtitle'))
        ),
        h("button", {
          className: "theme-toggle-btn",
          onClick: toggleTheme,
          "aria-label": t(language, 'common.themeToggleAria')
        }, theme === 'dark' ? '☀️' : '🌙'),
        h("button", {
          className: "language-toggle-btn",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria')
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      ),
      h("section", { className: "toolbar" },
        h("div", { className: "search-input-wrapper" },
          h("input", {
            className: "input search",
            type: "text",
            placeholder: t(language, 'faixas.searchPlaceholder'),
            value: q,
            onInput: (e) => setQ(e.target.value),
          }),
          q && h("button", {
            className: "search-clear-btn",
            onClick: () => setQ(""),
            "aria-label": t(language, 'faixas.clearBtn')
          }, "✕")
        )
      ),
      loading
        ? h("section", { className: "center" }, h("p", null, t(language, 'faixas.loading')))
        : (filtered.length === 0
            ? h("section", { className: "center" }, h("p", null, t(language, 'faixas.noResults')))
            : h("section", { className: "cards-grid" },
                ...filtered.map((track) =>
                  h("article", {
                      key: track.id,
                      className: "music-card glass-card",
                      onClick: () => onOpenTrack(track.id),
                      role: "button", tabIndex: 0,
                    },
                    h("img", { className: "music-cover", src: track.cover, alt: "" }),
                    h("div", { className: "music-meta" },
                      h("h3", { className: "music-title" }, track.title),
                      h("p", { className: "music-line" }, track.meta)
                    ),
                    h("div", { className: "actions" },
                      h("button", {
                        type: "button",
                        className: "btn btn-primary",
                        onClick: (ev) => { ev.stopPropagation(); onOpenTrack(track.id); }
                      }, t(language, 'faixas.videoBtn'))
                    )
                  )
                )
              )
          ),

      h("div", { className: "app-footer-line" },
        h("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        h("button", {
          className: "footer-lang-toggle",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  function Pill({ active, onClick, children }) {
    return h("button", {
      type: "button",
      className: `tag-chip ${active ? "filter-chip-active" : ""}`,
      style: active ? { backgroundColor: "var(--color-brand-accent)", color: "white" } : {},
      onClick,
    }, children);
  }

  function TrackDetail({ slug, onBack, audio, theme, toggleTheme, language, toggleLanguage }) {
    const { loading, item } = useTrackById(slug);
    const [tab, setTab] = useState("video");            // hooks must be at top

    // Track song view when item loads
    useEffect(() => {
      if (item) {
        AnalyticsTracker.trackSongView(item.id, item.title, item.artist, item.year);
      }
    }, [item]);

    useEffect(() => () => audio.stopAll(false), [slug]); // stop when leaving

    if (loading) {
      return h("div", { className: "page center" }, h("p", null, t(language, 'faixasDetail.loading')));
    }
    if (!item) {
      return h("div", { className: "page center" },
        h(BackBtn, { onClick: onBack, language }),
        h("p", null, t(language, 'faixasDetail.notFound'))
      );
    }

    const isPrev = audio.id === (item.id + ":preview");
    const isAd = audio.id === (item.id + ":ad");

    // Function to handle tab changes with analytics
    const handleTabChange = (newTab) => {
      setTab(newTab);
      AnalyticsTracker.trackTabChange(item.id, item.title, newTab);
      // Track video play when video tab is selected (video auto-plays)
      if (newTab === "video" && item.videoUrl) {
        AnalyticsTracker.trackAudioPlay(item.id, item.title, "video");
      }
    };

    const TabContent = () => {
      if (tab === "video") {
        const embedUrl = getYouTubeEmbedUrl(item.videoUrl);
        if (!embedUrl) return h("p", { className: "copy" }, t(language, 'faixasDetail.emptyStates.video'));
        return h("div", {
          className: "video-wrapper",
          style: {
            position: "relative",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            height: 0,
            overflow: "hidden",
            maxWidth: "100%",
            background: "#000",
            borderRadius: "8px",
            marginTop: "4px"
          }
        },
          h("iframe", {
            src: embedUrl,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none"
            },
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true,
            title: `${t(language, 'faixasDetail.tabs.video')}: ${item.title}`
          })
        );
      }
      if (tab === "letra") {
        if (item.transcriptHtml) return h("div", { className: "copy prose prose-invert", dangerouslySetInnerHTML: { __html: item.transcriptHtml } });
        if (item.transcript) return h("pre", { className: "copy" }, item.transcript);
        return h("p", { className: "copy" }, t(language, 'faixasDetail.emptyStates.letra'));
      }
      if (tab === "sobre") {
        if (item.synopsisHtml) {
          // Handle multilingual synopsisHtml (object with pt-br/en keys) or fallback to string
          const content = typeof item.synopsisHtml === 'object'
            ? (item.synopsisHtml[language] || item.synopsisHtml['pt-br'])
            : item.synopsisHtml;
          return h("div", { className: "copy prose prose-invert", dangerouslySetInnerHTML: { __html: content } });
        }
        if (item.synopsis) return h("p", { className: "copy" }, item.synopsis);
        return h("p", { className: "copy" }, t(language, 'faixasDetail.emptyStates.sobre'));
      }
      if (tab === "referencia") {
        if (item.referenciaHtml) {
          // Handle multilingual referenciaHtml/analysisHtml (object with pt-br/en keys) or fallback to string
          const content = typeof item.referenciaHtml === 'object'
            ? (item.referenciaHtml[language] || item.referenciaHtml['pt-br'])
            : item.referenciaHtml;
          return h("div", { className: "copy prose prose-invert", dangerouslySetInnerHTML: { __html: content } });
        }
        if (item.referencia) return h("p", { className: "copy" }, item.referencia);
        return h("p", { className: "copy" }, t(language, 'faixasDetail.emptyStates.referencia'));
      }
      if (tab === "fontes") {
        if (!item.fontes || !item.fontes.length) return h("p", { className: "copy" }, t(language, 'faixasDetail.emptyStates.fontes'));
        return h("ul", { className: "copy" },
          ...item.fontes.map((s, i) =>
            h("li", { key: i },
              h("a", { href: s.url || s.href || "#", target: "_blank", rel: "noopener noreferrer" }, s.label || s.title || s.url || t(language, 'faixasDetail.emptyStates.fontes'))
            )
          )
        );
      }
      return null;
    };

    return h("div", { className: "page fade-in" },
      h("header", { className: "page-header" },
        h(BackBtn, { onClick: onBack, language }),
        h("h1", { className: "page-title" }, `${item.title}`),
        h("button", {
          className: "theme-toggle-btn",
          onClick: toggleTheme,
          "aria-label": t(language, 'common.themeToggleAria')
        }, theme === 'dark' ? '☀️' : '🌙'),
        h("button", {
          className: "language-toggle-btn",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria')
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      ),
      h("section", { className: "panel glass-card", style: { padding: "16px" } },
        h("img", { className: "hero-image", src: item.cover, alt: "" }),
        h("div", { style: { padding: "12px 8px 0" } },
          h("h2", { style: { margin: "6px 0 4px", fontWeight: 800 } }, item.title),
          h("p", { className: "page-subtle", style: { margin: 0 } }, item.meta),
          h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" } },
            h(Pill, { active: tab === "sobre", onClick: () => handleTabChange("sobre") }, t(language, 'faixasDetail.tabs.sobre')),
            item.videoUrl ? h(Pill, { active: tab === "video", onClick: () => handleTabChange("video") }, t(language, 'faixasDetail.tabs.video')) : null,
            h(Pill, { active: tab === "letra", onClick: () => handleTabChange("letra") }, t(language, 'faixasDetail.tabs.letra')),
            h(Pill, { active: tab === "referencia", onClick: () => handleTabChange("referencia") }, t(language, 'faixasDetail.tabs.referencia')),
            h(Pill, { active: tab === "fontes", onClick: () => handleTabChange("fontes") }, t(language, 'faixasDetail.tabs.fontes')),
          ),
          h("div", { style: { marginTop: "10px" } }, h(TabContent))
        )
      ),

      h("div", { className: "app-footer-line" },
        h("span", null, `${t(language, 'common.footer')} • ${getAppVersion()}`),
        h("button", {
          className: "footer-lang-toggle",
          onClick: toggleLanguage,
          "aria-label": t(language, 'common.languageToggleAria'),
          style: { marginLeft: '12px', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }
        }, language === 'en' ? '🇧🇷 PT' : '🇬🇧 EN')
      )
    );
  }

  /* --------------- Theme Management --------------- */
  function useTheme() {
    const [theme, setTheme] = useState(() => {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get('theme');
      if (themeParam === 'light' || themeParam === 'dark') {
        return themeParam;
      }
      // Then check localStorage
      const saved = localStorage.getItem('historia-cantada-theme');
      return saved === 'dark' ? 'dark' : 'light'; // Default to light
    });

    const toggleTheme = useCallback(() => {
      setTheme(current => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('historia-cantada-theme', next);
        document.documentElement.setAttribute('data-theme', next);
        // Update URL parameter
        const url = new URL(window.location);
        url.searchParams.set('theme', next);
        window.history.pushState({}, '', url);
        // Track theme toggle
        AnalyticsTracker.trackThemeToggle(next);
        return next;
      });
    }, []);

    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
  }

  /* --------------- Language Management --------------- */
  function useLanguage() {
    const [language, setLanguage] = useState(() => {
      // 1. Check URL parameter first (?lang=en)
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang');
      if (langParam === 'en' || langParam === 'pt-br' || langParam === 'pt') {
        return langParam === 'en' ? 'en' : 'pt-br';
      }

      // 2. Check localStorage
      const saved = localStorage.getItem('historia-cantada-language');
      if (saved === 'en' || saved === 'pt-br') {
        return saved;
      }

      // 3. Browser language detection (default)
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.toLowerCase().startsWith('en')) {
        return 'en';
      }

      // 4. Default to Portuguese
      return 'pt-br';
    });

    const toggleLanguage = useCallback(() => {
      setLanguage(current => {
        const next = current === 'en' ? 'pt-br' : 'en';
        localStorage.setItem('historia-cantada-language', next);
        document.documentElement.setAttribute('lang', next);

        // Update URL parameter
        const url = new URL(window.location);
        url.searchParams.set('lang', next);
        window.history.pushState({}, '', url);

        // Track language change
        AnalyticsTracker.trackLanguageToggle(next);

        return next;
      });
    }, []);

    // Apply language on mount
    useEffect(() => {
      document.documentElement.setAttribute('lang', language);
    }, [language]);

    return { language, toggleLanguage };
  }

  /* --------------- App shell --------------- */
  function App() {
    const [route, navigate] = useHashRoute(ROUTES.home);
    const audio = useAudio();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const prevRouteRef = useRef(null);

    // Track page views when route changes
    useEffect(() => {
      const pageName = route.name === "faixas-detail" ? `faixas/${route.slug}` : route.name;
      const pageTitle = route.name === "faixas-detail"
        ? `Música: ${route.slug}`
        : route.name === ROUTES.home
          ? "Home"
          : route.name === ROUTES.apresentacao
            ? "Apresentação"
            : "Músicas";

      AnalyticsTracker.trackPageView(pageName, pageTitle);

      // Track navigation if there was a previous route
      if (prevRouteRef.current) {
        AnalyticsTracker.trackNavigation(prevRouteRef.current, pageName);
      }
      prevRouteRef.current = pageName;
    }, [route]);

    useEffect(() => { audio.stopAll(false); }, [route]); // stop current when route changes

    const go = (r) => navigate(r);
    if (route.name === ROUTES.apresentacao) {
      return h(Presentation, { onBack: () => go(ROUTES.home), audio, theme, toggleTheme, language, toggleLanguage });
    }
    if (route.name === ROUTES.faixas) {
      return h(Tracks, {
        onBack: () => go(ROUTES.home),
        audio,
        onOpenTrack: (id) => navigate(`faixas/${id}`),
        theme, toggleTheme, language, toggleLanguage
      });
    }
    if (route.name === "faixas-detail") {
      return h(TrackDetail, { slug: route.slug, onBack: () => go(ROUTES.faixas), audio, theme, toggleTheme, language, toggleLanguage });
    }
    return h(Home, { onGo: (name) => navigate(name), theme, toggleTheme, language, toggleLanguage });
  }

  const root = document.getElementById("root");
  ReactDOM.createRoot(root).render(h(App));
})();