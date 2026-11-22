import "server-only";

export class BodyTooLargeError extends SyntaxError {}

// Check bytes as they arrive; Content-Length alone can be absent or misleading.
export async function readBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new BodyTooLargeError();
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function readJson(request: Request, limit = 16000) {
  return JSON.parse(new TextDecoder().decode(await readBody(request, limit)));
}

export async function readForm(request: Request) {
  const bytes = await readBody(request, 26 * 1024 * 1024);
  return new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
}
