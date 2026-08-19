export interface MediaStorage {
  upload(key: string, data: Buffer, contentType: string): Promise<void>;
  // URL temporal (firmada) para leer el objeto — el bucket no es público, así
  // que esto es la única forma de mostrar/enviar el medio.
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
