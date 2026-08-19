import { PassThrough } from "node:stream";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

// Las notas de voz de WhatsApp (ptt=true) solo se reproducen si el archivo
// REALMENTE es OGG/Opus mono a 16kHz — no alcanza con declarar el mimetype,
// WhatsApp valida el contenedor/códec real. Un MP3 subido a mano o el WebM
// que graba el navegador (MediaRecorder) llegan con otro formato, por eso
// el receptor mostraba "este audio no está disponible". Esto convierte
// cualquier audio de entrada al formato exacto que espera una nota de voz.
export function transcodeToOggOpus(input: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(input);

    const chunks: Buffer[] = [];
    const outputStream = new PassThrough();
    outputStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    outputStream.on("end", () => resolve(Buffer.concat(chunks)));
    outputStream.on("error", reject);

    ffmpeg(inputStream)
      .audioCodec("libopus")
      .audioChannels(1)
      .audioFrequency(16000)
      .format("ogg")
      .on("error", (error: Error) => reject(error))
      .pipe(outputStream, { end: true });
  });
}
