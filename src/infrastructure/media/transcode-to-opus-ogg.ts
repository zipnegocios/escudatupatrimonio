import { PassThrough } from "node:stream";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const TRANSCODE_TIMEOUT_MS = 30_000;

// ffmpeg no siempre puede autodetectar el contenedor leyendo desde un pipe
// no-seekable (que es lo que le mandamos, un Buffer en memoria) — sin este
// hint, un WebM grabado por el navegador puede quedar colgado esperando
// poder "adivinar" el formato en vez de fallar con un error claro.
function guessInputFormat(mimeType: string | undefined): string | undefined {
  if (!mimeType) return undefined;
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  return undefined;
}

// Las notas de voz de WhatsApp (ptt=true) solo se reproducen si el archivo
// REALMENTE es OGG/Opus mono a 16kHz — no alcanza con declarar el mimetype,
// WhatsApp valida el contenedor/códec real. Un MP3 subido a mano o el WebM
// que graba el navegador (MediaRecorder) llegan con otro formato, por eso
// el receptor mostraba "este audio no está disponible". Esto convierte
// cualquier audio de entrada al formato exacto que espera una nota de voz.
export function transcodeToOggOpus(input: Buffer, inputMimeType?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(input);

    const chunks: Buffer[] = [];
    const outputStream = new PassThrough();
    let stderrLog = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      command.kill("SIGKILL");
      reject(new Error(`ffmpeg no terminó en ${TRANSCODE_TIMEOUT_MS}ms — último stderr: ${stderrLog.slice(-500)}`));
    }, TRANSCODE_TIMEOUT_MS);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      fn();
    };

    outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    outputStream.on("end", () => finish(() => resolve(Buffer.concat(chunks))));
    outputStream.on("error", (error: Error) => finish(() => reject(error)));

    const command = ffmpeg(inputStream);
    const formatHint = guessInputFormat(inputMimeType);
    if (formatHint) {
      command.inputFormat(formatHint);
    }

    command
      .audioCodec("libopus")
      .audioChannels(1)
      .audioFrequency(16000)
      .format("ogg")
      .on("stderr", (line: string) => {
        stderrLog += `${line}\n`;
      })
      .on("error", (error: Error) =>
        finish(() => reject(new Error(`${error.message} — stderr: ${stderrLog.slice(-500)}`))),
      )
      .pipe(outputStream, { end: true });
  });
}
