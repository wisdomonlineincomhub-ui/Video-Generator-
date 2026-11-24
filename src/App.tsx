import {
  AudioLines,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  Clock3,
  Cloud,
  Download,
  Film,
  FolderOpen,
  ImagePlus,
  Instagram,
  Layers3,
  Music2,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  DEFAULT_SCRIPT,
  drawVideoFrame,
  exportVideo,
  FRAME_RATE,
  getScriptChecks,
  parseScript,
  VIDEO_DURATION,
} from "./video";

type TemplateId = "income" | "scam" | "list" | "social" | "story" | "quote";
type AssetKey = "screenRecording" | "voiceover" | "music";
type Asset = { file: File; url: string };

const templates: {
  id: TemplateId;
  name: string;
  category: string;
  structure: string;
  icon: string;
}[] = [
  { id: "income", name: "Income basics", category: "Income education", structure: "Hook → Problem → Solution → Proof → CTA", icon: "↗" },
  { id: "scam", name: "Spot the scam", category: "Scam awareness", structure: "Hook → Story → Clue → Verdict", icon: "◎" },
  { id: "list", name: "Quick how-to", category: "Common how-to tips", structure: "Hook → Point 1 → Point 2 → Point 3 → CTA", icon: "☷" },
  { id: "social", name: "Grow your socials", category: "Social media success", structure: "Hook → Mistake → Fix → Result → CTA", icon: "⌁" },
  { id: "story", name: "A short story", category: "Income education", structure: "Hook → Story → Lesson → CTA", icon: "◷" },
  { id: "quote", name: "A little reminder", category: "Common how-to tips", structure: "Quote → Meaning → CTA", icon: "“" },
];

const assetLabels: Record<AssetKey, { title: string; detail: string; icon: typeof Video; accept: string }> = {
  screenRecording: { title: "Screen recording", detail: "MP4 or MOV · used for [B-ROLL] scenes", icon: Video, accept: "video/mp4,video/quicktime,video/webm" },
  voiceover: { title: "Voiceover", detail: "MP3, WAV or M4A · your narration", icon: AudioLines, accept: "audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/aac" },
  music: { title: "Background music", detail: "MP3 or WAV · mixed quietly under voice", icon: Music2, accept: "audio/mpeg,audio/wav,audio/mp4" },
};

const draftStorageKey = "wisdom-video-studio-draft-v1";

function loadDraft() {
  try {
    const value = localStorage.getItem(draftStorageKey);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "script" in parsed &&
      typeof parsed.script === "string" &&
      "template" in parsed &&
      typeof parsed.template === "string"
    ) {
      return {
        script: parsed.script,
        template: parsed.template as TemplateId,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function App() {
  const savedDraft = useMemo(loadDraft, []);
  const [templateId, setTemplateId] = useState<TemplateId>(
    savedDraft?.template ?? "income",
  );
  const [script, setScript] = useState(savedDraft?.script ?? DEFAULT_SCRIPT);
  const [assets, setAssets] = useState<Partial<Record<AssetKey, Asset>>>({});
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [toast, setToast] = useState("");
  const [activeNav, setActiveNav] = useState("studio");
  const [dragging, setDragging] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(true);
  const [previewTime, setPreviewTime] = useState(4.2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const assetsRef = useRef(assets);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const assetInputs = useRef<Partial<Record<AssetKey, HTMLInputElement | null>>>({});
  const toastTimeoutRef = useRef<number | null>(null);
  assetsRef.current = assets;

  const scenes = useMemo(() => parseScript(script), [script]);
  const checks = useMemo(() => getScriptChecks(script), [script]);
  const selectedTemplate =
    templates.find((template) => template.id === templateId) ?? templates[0];
  const isScriptValid =
    scenes.length > 0 &&
    checks.missingKeywords.length === 0 &&
    checks.foundProhibitedTerms.length === 0;
  const canExport = isScriptValid && !isExporting;

  useEffect(() => {
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ script, template: templateId }),
      );
    } catch {
      setToast("This browser could not save your draft on this device.");
    }
  }, [script, templateId]);

  useEffect(() => {
    return () => {
      Object.values(assetsRef.current).forEach((asset) => {
        if (asset) URL.revokeObjectURL(asset.url);
      });
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let lastDraw = 0;
    const startTime = performance.now() - previewTime * 1000;
    let animationId = 0;
    const frame = (now: number) => {
      const time = ((now - startTime) / 1000) % VIDEO_DURATION;
      if (now - lastDraw >= 1000 / FRAME_RATE) {
        drawVideoFrame(
          canvas,
          time,
          scenes,
          logo,
          sourceVideoRef.current,
          VIDEO_DURATION,
        );
        setPreviewTime(time);
        lastDraw = now;
      }
      if (previewPlaying) animationId = requestAnimationFrame(frame);
    };
    frame(performance.now());
    if (!previewPlaying) return;
    return () => cancelAnimationFrame(animationId);
  }, [previewPlaying, scenes, logo]);

  useEffect(() => {
    const video = sourceVideoRef.current;
    const screenRecording = assets.screenRecording;
    if (!video) return;
    if (!screenRecording) {
      video.removeAttribute("src");
      video.load();
      return;
    }
    video.src = screenRecording.url;
    video.loop = true;
    video.muted = true;
    video.play().catch(() => undefined);
  }, [assets.screenRecording]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(""), 3800);
  }, []);

  const setAsset = useCallback((key: AssetKey, file?: File) => {
    const nextAsset = file
      ? { file, url: URL.createObjectURL(file) }
      : undefined;
    setAssets((current) => {
      const previous = current[key];
      if (previous) URL.revokeObjectURL(previous.url);
      if (!nextAsset) {
        const updated = { ...current };
        delete updated[key];
        return updated;
      }
      return { ...current, [key]: nextAsset };
    });
  }, []);

  const handleAssetChange = (key: AssetKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAsset(key, file);
    event.target.value = "";
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      setLogo(image);
      setLogoReady(true);
      showToast("Logo loaded for this video.");
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      showToast("That image could not be opened. Try a PNG or JPG.");
    };
    image.src = imageUrl;
    event.target.value = "";
  };

  const receiveDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    const videoFile = files.find((file) => file.type.startsWith("video/"));
    const voiceFile = files.find((file) => file.type.startsWith("audio/"));
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (videoFile) setAsset("screenRecording", videoFile);
    if (voiceFile) setAsset("voiceover", voiceFile);
    if (imageFile) {
      const input = logoInputRef.current;
      if (input) {
        const transfer = new DataTransfer();
        transfer.items.add(imageFile);
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  const exportProject = async () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportVideo(
        canvas,
        scenes,
        logo,
        sourceVideoRef.current,
        assets.voiceover?.url,
        assets.music?.url,
        setExportProgress,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wisdom-video-${new Date().toISOString().slice(0, 10)}.webm`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      showToast("Your video is ready. The download has started.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "The video could not be exported.");
    } finally {
      setIsExporting(false);
    }
  };

  const insertBrollMarker = () => {
    setScript((value) => `${value.trimEnd()}\n[B-ROLL] `);
    showToast("B-roll marker added to your script.");
  };

  const useStarterScript = () => {
    setScript(DEFAULT_SCRIPT);
    setTemplateId("income");
    showToast("Starter script restored.");
  };

  const selectNav = (id: string) => {
    setActiveNav(id);
    if (id !== "studio") {
      showToast(
        id === "projects"
          ? "Your latest draft is saved on this device."
          : "Brand settings are ready below in the video assets section.",
      );
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`app-shell${mobileMenuOpen ? " menu-open" : ""}`}>
      {mobileMenuOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className="sidebar">
        <a className="brand-lockup" href="#" onClick={(event) => event.preventDefault()}>
          <div className="brand-mark">W</div>
          <span>
            <strong>Wisdom</strong>
            <small>VIDEO STUDIO</small>
          </span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">W</div>
          <span><b>Wisdom Online</b><small>Personal workspace</small></span>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activeNav === "studio" ? "nav-item active" : "nav-item"} onClick={() => selectNav("studio")}>
            <Clapperboard size={18} /><span>Video studio</span><span className="nav-indicator" />
          </button>
          <button className={activeNav === "projects" ? "nav-item active" : "nav-item"} onClick={() => selectNav("projects")}>
            <FolderOpen size={18} /><span>My projects</span><span className="nav-count">1</span>
          </button>
          <button className={activeNav === "brand" ? "nav-item active" : "nav-item"} onClick={() => selectNav("brand")}>
            <Layers3 size={18} /><span>Brand kit</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={16} /></div>
            <b>One good idea can go far.</b>
            <p>Make it clear, useful, and yours.</p>
            <div className="tip-dots"><i /><i /><i /></div>
          </div>
          <button className="help-button" onClick={() => showToast("Tip: mark a line [B-ROLL] to show your screen recording under that caption.")}>
            <CircleHelp size={17} /> Help & tips
          </button>
          <div className="profile-row">
            <div className="profile-avatar">W</div>
            <div><b>Wisdom</b><small>Creator</small></div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><b>Video studio</b></div>
          <div className="topbar-actions">
            <div className="save-state"><Cloud size={15} /><span>Saved on this device</span></div>
            <div className="top-avatar">W</div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR CREATOR STUDIO</div>
              <h1>Make a video <span className="heading-sparkle">✳</span></h1>
              <p>Turn a useful idea into a short video your audience can learn from.</p>
            </div>
            <button className="quiet-button" onClick={useStarterScript}><RefreshCw size={15} /> Reset draft</button>
          </div>

          <div
            className={`studio-grid${dragging ? " drag-active" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
            }}
            onDrop={receiveDrop}
          >
            <div className="editor-column">
              <section className="panel template-panel">
                <div className="section-heading">
                  <div className="section-icon icon-gold"><Film size={18} /></div>
                  <div><h2>Start with a format</h2><p>Choose the shape of your story.</p></div>
                  <span className="step-number">01</span>
                </div>
                <div className="template-grid">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      className={`template-card${template.id === templateId ? " selected" : ""}`}
                      onClick={() => setTemplateId(template.id)}
                    >
                      <span className="template-icon">{template.icon}</span>
                      <span className="template-copy">
                        <b>{template.name}</b>
                        <small>{template.category}</small>
                      </span>
                      {template.id === templateId && <span className="template-check"><Check size={12} /></span>}
                    </button>
                  ))}
                </div>
                <div className="template-structure">
                  <span>FLOW</span><span>{selectedTemplate.structure}</span>
                </div>
              </section>

              <section className="panel script-panel">
                <div className="section-heading script-heading">
                  <div className="section-icon icon-lilac"><Sparkles size={17} /></div>
                  <div><h2>Your script</h2><p>Write it how you would say it out loud.</p></div>
                  <span className="step-number">02</span>
                </div>
                <label className="script-label" htmlFor="script-input">VIDEO SCRIPT <span>· Add [B-ROLL] on a line to show your screen recording</span></label>
                <textarea
                  id="script-input"
                  className="script-input"
                  value={script}
                  onChange={(event) => setScript(event.target.value)}
                  spellCheck
                />
                <div className="script-meta">
                  <span>{script.trim() ? script.trim().split(/\s+/).length : 0} words <i /> About 30 sec</span>
                  <button className="inline-action" onClick={insertBrollMarker}><Plus size={14} /> Add B-roll marker</button>
                </div>
                <div className={`compliance-card${checks.foundProhibitedTerms.length > 0 ? " has-warning" : ""}`}>
                  <div className="compliance-top">
                    <div className={`compliance-icon${checks.foundProhibitedTerms.length > 0 ? " warning" : ""}`}>
                      {checks.foundProhibitedTerms.length ? <X size={14} /> : <BadgeCheck size={15} />}
                    </div>
                    <div className="compliance-title">
                      <b>{checks.foundProhibitedTerms.length ? "Review this wording" : "Platform-safe checklist"}</b>
                      <small>{checks.foundProhibitedTerms.length ? `Please remove: ${checks.foundProhibitedTerms.join(", ")}` : "No restricted claims or phrases found"}</small>
                    </div>
                    {!checks.foundProhibitedTerms.length && <span className="safe-pill"><Check size={11} /> LOOKS GOOD</span>}
                  </div>
                  <div className="keyword-line">
                    <span className="keyword-label">REQUIRED KEYWORDS</span>
                    <span className={`keyword-count${checks.missingKeywords.length ? " incomplete" : ""}`}>
                      {5 - checks.missingKeywords.length}<i>/</i>5 included
                    </span>
                  </div>
                  <div className="keyword-progress"><span style={{ width: `${((5 - checks.missingKeywords.length) / 5) * 100}%` }} /></div>
                  {checks.missingKeywords.length > 0 && (
                    <p className="missing-terms">Still needed: {checks.missingKeywords.join(" · ")}</p>
                  )}
                </div>
              </section>

              <section className="panel assets-panel">
                <div className="section-heading assets-heading">
                  <div className="section-icon icon-blue"><Upload size={17} /></div>
                  <div><h2>Bring your footage</h2><p>Add your recording and voice. Drop files anywhere in this panel.</p></div>
                  <span className="step-number">03</span>
                </div>
                <div className="asset-list">
                  {(Object.keys(assetLabels) as AssetKey[]).map((key) => {
                    const item = assetLabels[key];
                    const Icon = item.icon;
                    const file = assets[key]?.file;
                    return (
                      <div className={`asset-row${file ? " uploaded" : ""}`} key={key}>
                        <div className={`asset-icon asset-${key}`}><Icon size={17} /></div>
                        <div className="asset-copy"><b>{item.title}</b><small>{file ? file.name : item.detail}</small></div>
                        {file && <span className="file-size">{formatFileSize(file.size)}</span>}
                        <input
                          ref={(element) => { assetInputs.current[key] = element; }}
                          type="file"
                          accept={item.accept}
                          onChange={handleAssetChange(key)}
                          hidden
                        />
                        {file ? (
                          <button className="asset-remove" aria-label={`Remove ${item.title}`} onClick={() => setAsset(key)}>
                            <X size={15} />
                          </button>
                        ) : (
                          <button className="asset-add" onClick={() => assetInputs.current[key]?.click()}>
                            <Plus size={15} /><span>Add file</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div className="logo-row">
                    <div className={`logo-mini${logoReady ? " logo-ok" : ""}`}>
                      {logoReady ? <span className="logo-placeholder">W</span> : <ImagePlus size={17} />}
                    </div>
                    <div className="asset-copy"><b>Wisdom brand logo</b><small>{logo ? "Logo ready · shown top-right for the full video" : "Using placeholder “W” · upload to replace"}</small></div>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} hidden />
                    <button className={`asset-add${logoReady ? " asset-added" : ""}`} onClick={() => logoInputRef.current?.click()}>
                      {logo ? <Check size={15} /> : <Plus size={15} />}<span>{logo ? "Replace" : "Add logo"}</span>
                    </button>
                  </div>
                </div>
                <div className="drop-note"><Upload size={14} /><span>MP4, MOV, MP3, WAV, PNG or JPG</span><span className="drop-note-separator">·</span><span>Files stay on your device</span></div>
              </section>
            </div>

            <aside className="preview-column">
              <section className="preview-card">
                <div className="preview-card-heading">
                  <div><h2>Live preview</h2><p>Your video, as it will appear.</p></div>
                  <button className="preview-badge" title="Portrait 9:16"><span /> 9:16</button>
                </div>
                <div className="phone-frame">
                  <canvas
                    ref={canvasRef}
                    className="preview-canvas"
                    width={1080}
                    height={1920}
                    aria-label="Video preview with animated captions and logo"
                  />
                  <canvas
                    ref={exportCanvasRef}
                    className="export-canvas"
                    width={1080}
                    height={1920}
                    aria-hidden="true"
                  />
                  <video ref={sourceVideoRef} className="hidden-video" playsInline />
                  <span className="preview-frame-label"><span /> PREVIEW</span>
                </div>
                <div className="preview-controls">
                  <button className="preview-play" aria-label={previewPlaying ? "Pause preview" : "Play preview"} onClick={() => setPreviewPlaying((value) => !value)}>
                    {previewPlaying ? <span className="pause-symbol">Ⅱ</span> : <Play size={14} fill="currentColor" />}
                  </button>
                  <div className="preview-timeline">
                    <div className="timeline-bar"><span style={{ width: `${(previewTime / VIDEO_DURATION) * 100}%` }} /></div>
                    <small>{formatTime(previewTime)} <i>/</i> 00:30</small>
                  </div>
                  <span className="preview-fps">{FRAME_RATE} FPS</span>
                </div>
                <div className="preview-specs">
                  <span><Clapperboard size={13} /> 1080 × 1920</span><i /><span><Clock3 size={13} /> 30 seconds</span>
                </div>
              </section>

              <section className="export-card">
                <div className="export-heading">
                  <div className="export-icon"><Download size={18} /></div>
                  <div><h2>Ready to make it?</h2><p>Your video is rendered in this browser.</p></div>
                </div>
                <button className="export-button" disabled={!canExport} onClick={exportProject}>
                  {isExporting ? (
                    <><span className="button-spinner" /> Rendering {Math.round(exportProgress * 100)}%</>
                  ) : (
                    <><Download size={17} /> Export video <span className="export-format">WEBM</span></>
                  )}
                </button>
                <p className={`export-hint${!isScriptValid ? " export-incomplete" : ""}`}>
                  {!isScriptValid
                    ? <><BadgeCheck size={13} /> Complete the keyword and safe-language checks to export.</>
                    : <><BadgeCheck size={13} /> Brand-safe · no watermark · ready to share</>}
                </p>
              </section>

              <div className="brand-note">
                <div className="brand-note-icon"><Instagram size={15} /></div>
                <p><b>Made for your community</b><span>One video, ready for TikTok, Reels & Shorts.</span></p>
                <span className="brand-note-arrow">↗</span>
              </div>
            </aside>
          </div>
        </div>

        <footer className="page-footer">
          <span>WISDOM ONLINE INCOME HUB</span><span className="footer-dot" /><span>Made for learning, growing & earning online.</span>
        </footer>
      </main>

      <div className={`toast${toast ? " toast-visible" : ""}`} role="status" aria-live="polite">
        <span className="toast-check"><Check size={13} /></span>{toast}
        <button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={14} /></button>
      </div>
      <div className="mobile-drop-target" aria-hidden="true"><Upload size={17} /> Drop your files here</div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds: number) {
  const rounded = Math.floor(seconds);
  return `00:${String(rounded % 60).padStart(2, "0")}`;
}

export default App;
