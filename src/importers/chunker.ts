/**
 * Split the given string into chunks of size only breaking at newlines
 * @param text
 * @param chunkSize
 * @returns
 */
export function splitTextIntoChunksOnLines(
  text: string,
  chunkSize: number,
): string[] {
  const lines = text.split('\n').filter((t) => t.length > 0);
  const lineCount = lines.length;

  const chunks = [];

  let chunk = '';
  let lineIdx = 0;

  while (lineIdx < lineCount) {
    const line = lines[lineIdx];
    chunk = chunk + line + '\n';
    lineIdx++;

    if (chunk.length >= chunkSize) {
      // If a line is reaaaaaaaaallly long, then further split the chunk
      if (chunk.length > chunkSize * 1.5) {
        const splitChunks = chunk.match(
          new RegExp(`(.|[\r\n]){1,${chunkSize}}`, 'g'),
        );
        for (const splitChunk of splitChunks) {
          chunks.push(splitChunk);
        }
      } else {
        chunks.push(chunk);
      }
      chunk = '';
    }
  }

  if (chunk.length !== 0) {
    chunks.push(chunk);
  }

  return chunks;
}
