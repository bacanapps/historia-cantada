const toRel = (input) => {
  if (input == null) return input;

  // If it's already a URL object, stringify it
  if (typeof input === 'object' && input instanceof URL) {
    input = input.toString();
  } else if (typeof input === 'object') {
    // Common shapes from JSON: {file}, {url}, {href}, {src}, {path}
    if (Array.isArray(input)) {
      input = input.length ? input[0] : '';
    } else {
      input =
        input.file ??
        input.url ??
        input.href ??
        input.src ??
        input.path ??
        (typeof input.toString === 'function' ? input.toString() : '');
    }
  }

  // Ensure string
  let url = String(input ?? '').trim();
  if (!url) return url;

  // Leave absolute URLs as-is
  if (/^(https?:)?\/\//i.test(url)) return url;

  // Make leading-slash paths relative for GitHub Pages subpaths + file:// dev
  if (url.startsWith('/')) return `.${url}`;

  return url;
};

function loadAllSongs() {
  // ...
  // assume raw is fetched or passed in somewhere above
  if (!Array.isArray(raw)) {
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.tracks)) raw = raw.tracks;
      else if (Array.isArray(raw.songs)) raw = raw.songs;
      else if (Array.isArray(raw.items)) raw = raw.items;
    }
    if (!Array.isArray(raw)) return [];
  }
  // ...
  function norm(t) {
    // ...
    const fontesArr = Array.isArray(t.fontes) ? t.fontes : (Array.isArray(t.sources) ? t.sources : []);
    const fontes = fontesArr.map((s) => {
      if (!s) return null;
      if (typeof s === 'string') return { label: s, url: s };
      if (typeof s === 'object') {
        return { label: s.label || s.title || s.url || s.href || 'Fonte', url: s.url || s.href || '#' };
      }
      return null;
    }).filter(Boolean);

    const cover = toRel(
      (t.cover) ||
      (t.assets && (t.assets.coverImage || t.assets.cover)) ||
      './assets/img/hero.png'
    );

    const previewAudio = toRel(
      (t.preview) ||
      (t.previewSrc) ||
      (t.assets && t.assets.preview && (t.assets.preview.file || t.assets.preview.src)) ||
      t.audio || t.src || `./assets/audio/${id}.mp3`
    );

    const adAudio = toRel(
      (t.audioDescription) ||
      (t.adSrc) ||
      (t.assets && t.assets.audioDescription && (t.assets.audioDescription.file || t.assets.audioDescription.src)) ||
      ''
    );

    // ... rest of norm function, returning an object that uses fontes, cover, previewAudio, adAudio
  }
  // ...
}