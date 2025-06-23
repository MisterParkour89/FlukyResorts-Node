import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function convertirHtml(markdownRelativePath, datos = {}) {
  try {
    const absolutePath = resolve(__dirname, markdownRelativePath); 
    let markdownContent = await readFile(absolutePath, 'utf8');

    for (const [clave, valor] of Object.entries(datos)) {
      const regex = new RegExp(`{{\\s*${clave}\\s*}}`, 'g');
      markdownContent = markdownContent.replace(regex, valor);
    }

    const html = marked.parse(markdownContent);
    return html;
  } catch (error) {
    console.error('Error al convertir Markdown a HTML:', error.message);
    throw new Error('No se pudo procesar la plantilla Markdown.');
  }
}
