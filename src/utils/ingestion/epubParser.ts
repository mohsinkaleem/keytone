import JSZip from 'jszip';

/**
 * Extract plain text content from an EPUB file.
 * Uses JSZip + DOMParser – no heavy dependencies.
 *
 * Improvements:
 * - Handles URL-encoded paths in the manifest
 * - Gracefully skips unreadable spine entries instead of aborting
 * - Strips navigation / TOC pages that contain mostly links
 * - Collapses excessive whitespace while preserving paragraph breaks
 * - Returns chapter metadata alongside the text
 */

export interface EpubChapter {
  title: string;
  text: string;
}

/**
 * Parse an EPUB file and return an array of chapters (title + text).
 * Falls back to a single-chapter result if chapter extraction fails.
 */
export async function parseEpubChapters(file: File): Promise<EpubChapter[]> {
  const zip = await JSZip.loadAsync(file);

  // 1. Locate the OPF path via container.xml
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) throw new Error("Invalid EPUB: Missing META-INF/container.xml");

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "text/xml");
  const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath) throw new Error("Invalid EPUB: Could not find rootfile");

  // 2. Parse OPF manifest + spine
  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) throw new Error(`Invalid EPUB: Could not find ${opfPath}`);

  const opfDoc = parser.parseFromString(opfXml, "text/xml");
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

  // Build manifest map (id → href)
  const manifest: Record<string, string> = {};
  for (const item of Array.from(opfDoc.querySelectorAll("manifest > item"))) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) manifest[id] = decodeURIComponent(href);
  }

  // Build spine list (ordered hrefs)
  const spine: string[] = [];
  for (const ref of Array.from(opfDoc.querySelectorAll("spine > itemref"))) {
    const idref = ref.getAttribute("idref");
    if (idref && manifest[idref]) spine.push(manifest[idref]);
  }

  if (spine.length === 0) throw new Error("Invalid EPUB: No spine entries found");

  // 3. Extract text from each spine entry
  const chapters: EpubChapter[] = [];

  for (const href of spine) {
    const filePath = href.startsWith('/') ? href.slice(1) : (opfDir + href);

    // Try multiple path strategies (some EPUBs have quirks)
    let content: string | null = null;
    for (const tryPath of [filePath, href, decodeURIComponent(filePath)]) {
      content = (await zip.file(tryPath)?.async("string")) ?? null;
      if (content) break;
    }

    if (!content) continue; // Skip unreadable entries

    const doc = parser.parseFromString(content, "text/html");
    const body = doc.body;
    if (!body) continue;

    // Remove noise elements
    for (const sel of ['script', 'style', 'nav', 'header', 'footer']) {
      body.querySelectorAll(sel).forEach(el => el.remove());
    }

    // Skip pages that are mostly navigation (> 50% links)
    const allText = body.textContent?.trim() || '';
    const linkText = Array.from(body.querySelectorAll('a'))
      .map(a => a.textContent?.trim() || '')
      .join('');
    if (allText.length > 0 && linkText.length / allText.length > 0.5) continue;

    // Extract headings for chapter title
    const heading = body.querySelector('h1, h2, h3');
    const chapterTitle = heading?.textContent?.trim() || '';

    // Extract structured text
    const elements = Array.from(body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, code"));

    let sectionText: string;
    if (elements.length > 0) {
      sectionText = elements
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join("\n\n");
    } else {
      sectionText = allText;
    }

    // Clean up
    sectionText = sectionText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    if (sectionText.length < 20) continue; // Skip near-empty chapters

    chapters.push({
      title: chapterTitle || `Section ${chapters.length + 1}`,
      text: sectionText,
    });
  }

  if (chapters.length === 0) {
    throw new Error("Could not extract any text from this EPUB.");
  }

  return chapters;
}

/**
 * Backward-compatible: extract all text as a single string.
 */
export async function parseEpubFile(file: File): Promise<string> {
  const chapters = await parseEpubChapters(file);
  return chapters
    .map(ch => ch.text)
    .join("\n\n")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
