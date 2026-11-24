export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const FRAME_RATE = 30;
export const VIDEO_DURATION = 30;

export const REQUIRED_KEYWORDS = [
  "online income skills Nigeria",
  "how to earn money online as a Nigerian student",
  "best digital skills to learn 2026",
  "Wisdom Online Income Hub",
  "how to make money online in Nigeria",
];

export const PROHIBITED_TERMS = [
  "Buy",
  "Purchase",
  "GUARANTEED",
  "100%",
  "Risk-free",
  "Make money fast",
  "Get rich",
  "MLM",
  "Double your money",
];

export const DEFAULT_SCRIPT =
  "Learn online income skills Nigeria by starting with one useful digital skill. If you ask how to earn money online as a Nigerian student, begin by practising a service people need. The best digital skills to learn 2026 include design, writing, and video editing. Wisdom Online Income Hub shares honest guidance on how to make money online in Nigeria. Pick one skill, practise it, and build a simple portfolio.";

export interface CaptionScene {
  text: string;
  broll: boolean;
}

export function getScriptChecks(script: string) {
  const normalized = script.toLocaleLowerCase();
  const missingKeywords = REQUIRED_KEYWORDS.filter(
    (keyword) => !normalized.includes(keyword.toLocaleLowerCase()),
  );
  const foundProhibitedTerms = PROHIBITED_TERMS.filter((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(script);
  });

  return { missingKeywords, foundProhibitedTerms };
}

export function parseScript(script: string): CaptionScene[] {
  let markNextScene = false;
  const scenes: CaptionScene[] = [];

  for (const rawLine of script.split(/\r?\n/)) {
    const marked = /\[B-ROLL\]/i.test(rawLine);
    const line = rawLine.replace(/\[B-ROLL\]/gi, "").trim();
    if (!line) {
      markNextScene ||= marked;
      continue;
    }

    const parts = line.match(/[^.!?]+[.!?]?/g) ?? [line];
    for (let index = 0; index < parts.length; index += 1) {
      const text = parts[index].trim();
      if (!text) continue;
      scenes.push({
        text,
        broll: markNextScene || (marked && index === 0),
      });
      markNextScene = false;
    }
  }

  return scenes;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function drawVideoFrame(
  canvas: HTMLCanvasElement,
  time: number,
  scenes: CaptionScene[],
  logo: HTMLImageElement | null,
  sourceVideo: HTMLVideoElement | null,
  duration = VIDEO_DURATION,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const { width, height } = canvas;
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#102547");
  background.addColorStop(0.52, "#0A1931");
  background.addColorStop(1, "#071326");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const activeSceneIndex = Math.min(
    scenes.length - 1,
    Math.floor((time / duration) * scenes.length),
  );
  const activeScene = scenes[activeSceneIndex];
  if (activeScene?.broll && sourceVideo?.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
    const videoAspect = sourceVideo.videoWidth / sourceVideo.videoHeight;
    const canvasAspect = width / height;
    let drawWidth = width;
    let drawHeight = height;
    if (videoAspect > canvasAspect) {
      drawWidth = height * videoAspect;
    } else {
      drawHeight = width / videoAspect;
    }
    context.save();
    context.globalAlpha = 0.38;
    context.drawImage(
      sourceVideo,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
    context.restore();
  }

  const shade = context.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(5, 15, 31, 0.12)");
  shade.addColorStop(0.45, "rgba(5, 15, 31, 0.22)");
  shade.addColorStop(1, "rgba(5, 15, 31, 0.88)");
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.12;
  context.strokeStyle = "#D4AF37";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(width / 2, height / 2, 410, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  if (logo?.complete && logo.naturalWidth > 0) {
    const scale = Math.min(90 / logo.naturalWidth, 90 / logo.naturalHeight, 1);
    const logoWidth = logo.naturalWidth * scale;
    const logoHeight = logo.naturalHeight * scale;
    context.save();
    context.globalAlpha = 0.9;
    context.drawImage(
      logo,
      width - logoWidth - 68,
      72,
      logoWidth,
      logoHeight,
    );
    context.restore();
  } else {
    context.save();
    context.globalAlpha = 0.92;
    context.fillStyle = "rgba(212, 175, 55, 0.18)";
    roundedRect(context, width - 162, 62, 94, 94, 20);
    context.fill();
    context.strokeStyle = "rgba(212, 175, 55, 0.65)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#F0D47A";
    context.font = "700 48px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("W", width - 115, 109);
    context.textBaseline = "alphabetic";
    context.restore();
  }

  const followOpacity = time >= duration - 5 ? 0.7 : 0.5;
  context.textAlign = "left";
  context.fillStyle = `rgba(255, 255, 255, ${followOpacity})`;
  context.font = "500 22px Inter, Arial, sans-serif";
  context.letterSpacing = "4px";
  context.fillText("WISDOM ONLINE INCOME HUB", 70, 115);
  context.letterSpacing = "0px";

  if (activeScene) {
    const sceneDuration = duration / scenes.length;
    const sceneProgress = Math.min(
      1,
      Math.max(0, (time - activeSceneIndex * sceneDuration) / Math.max(sceneDuration, 0.1)),
    );
    const visibleCharacters = Math.max(
      1,
      Math.floor(activeScene.text.length * Math.min(1, sceneProgress * 2.8 + 0.15)),
    );
    const caption = activeScene.text.slice(0, visibleCharacters);
    context.font = "700 74px Inter, Arial, sans-serif";
    const lines = wrapText(context, caption, 830);
    const lineHeight = 104;
    const firstLineY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    context.textAlign = "center";
    context.shadowColor = "rgba(0, 0, 0, 0.42)";
    context.shadowBlur = 28;
    context.shadowOffsetY = 8;
    context.fillStyle = activeSceneIndex === 0 ? "#D4AF37" : "#FFFFFF";
    lines.forEach((line, index) => {
      context.fillText(line, width / 2, firstLineY + index * lineHeight);
    });
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
  }

  context.textAlign = "left";
  context.fillStyle = "rgba(255, 255, 255, 0.56)";
  context.font = "400 24px Inter, Arial, sans-serif";
  context.fillText("Wisdom Online Income Hub", 70, height - 108);
  context.fillStyle = "rgba(255, 255, 255, 0.48)";
  context.font = "500 24px Inter, Arial, sans-serif";
  context.fillText("f     ▶     in", 70, height - 66);

  const progress = Math.min(1, time / duration);
  context.fillStyle = "rgba(255, 255, 255, 0.12)";
  roundedRect(context, 70, height - 30, width - 140, 4, 2);
  context.fill();
  context.fillStyle = "#D4AF37";
  roundedRect(context, 70, height - 30, (width - 140) * progress, 4, 2);
  context.fill();
}

function getRecorderMimeType() {
  const options = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return options.find((type) => MediaRecorder.isTypeSupported(type));
}

export async function exportVideo(
  canvas: HTMLCanvasElement,
  scenes: CaptionScene[],
  logo: HTMLImageElement | null,
  sourceVideo: HTMLVideoElement | null,
  voiceUrl?: string,
  musicUrl?: string,
  onProgress?: (progress: number) => void,
) {
  if (!canvas.captureStream) {
    throw new Error("This browser does not support canvas video recording.");
  }
  const mimeType = getRecorderMimeType();
  if (!mimeType) {
    throw new Error("This browser does not support WebM video export.");
  }

  const stream = canvas.captureStream(FRAME_RATE);
  const audioContext = new AudioContext();
  const audioDestination = audioContext.createMediaStreamDestination();
  const audioElements: HTMLAudioElement[] = [];

  const addAudio = async (url: string, volume: number, loop: boolean) => {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = volume;
    audio.loop = loop;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(audioDestination);
    audioElements.push(audio);
    await audio.play();
  };

  try {
    await audioContext.resume();
    if (voiceUrl) await addAudio(voiceUrl, 1, false);
    if (musicUrl) await addAudio(musicUrl, 0.1, true);
    audioDestination.stream
      .getAudioTracks()
      .forEach((track) => stream.addTrack(track));

    if (sourceVideo) {
      sourceVideo.currentTime = 0;
      await sourceVideo.play();
    }

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    const recording = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error("The video recording failed."));
      recorder.onstop = () =>
        resolve(new Blob(chunks, { type: recorder.mimeType }));
    });

    recorder.start(1000);
    const startTime = performance.now();
    await new Promise<void>((resolve) => {
      const frame = (now: number) => {
        const time = Math.min(VIDEO_DURATION, (now - startTime) / 1000);
        drawVideoFrame(
          canvas,
          time,
          scenes,
          logo,
          sourceVideo,
          VIDEO_DURATION,
        );
        onProgress?.(time / VIDEO_DURATION);
        if (time >= VIDEO_DURATION) {
          recorder.stop();
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      };
      requestAnimationFrame(frame);
    });
    return await recording;
  } finally {
    audioElements.forEach((audio) => {
      audio.pause();
      audio.removeAttribute("src");
    });
    stream.getTracks().forEach((track) => track.stop());
    await audioContext.close();
  }
}
