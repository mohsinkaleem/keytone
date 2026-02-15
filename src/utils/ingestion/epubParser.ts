import JSZip from 'jszip';

/**
 * Extract plain text content from an EPUB file
 * This approach uses JSZip + DOMParser to avoid large dependencies like epub.js
 */
export async function parseEpubFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  
  // 1. Find the content.opf path from container.xml
  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) throw new Error("Invalid EPUB: Missing META-INF/container.xml");
  
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "text/xml");
  const opfPath = containerDoc.querySelector("rootfile")?.getAttribute("full-path");
  if (!opfPath) throw new Error("Invalid EPUB: Could not find rootfile in container.xml");

  // 2. Parse the OPF to get the spine (reading order)
  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) throw new Error(`Invalid EPUB: Could not find ${opfPath}`);
  
  const opfDoc = parser.parseFromString(opfXml, "text/xml");
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);
  
  // Get manifest and spine
  const manifestItems = Array.from(opfDoc.querySelectorAll("manifest > item"));
  const manifest = manifestItems.reduce((acc, item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) acc[id] = href;
    return acc;
  }, {} as Record<string, string>);
  
  const spineItems = Array.from(opfDoc.querySelectorAll("spine > itemref"));
  const spine = spineItems.map(ref => {
    const idref = ref.getAttribute("idref");
    return idref ? manifest[idref] : null;
  }).filter((href): href is string => !!href);

  // 3. Extract text from each file in spine order
  const fullTextChunks: string[] = [];
  
  for (const href of spine) {
    // Handling relative paths correctly
    const filePath = href.startsWith('/') ? href.slice(1) : (opfDir + href);
    const content = await zip.file(filePath)?.async("string");
    
    if (content) {
      const doc = parser.parseFromString(content, "text/html");
      
      // Select common text-containing elements
      // We prioritize specific content tags to avoid navigation/metadata noise if present
      const body = doc.body;
      if (body) {
        // Remove script and style tags
        const scripts = body.querySelectorAll('script, style');
        scripts.forEach(s => s.remove());

        // Extract text from paragraphs and headings
        const elements = Array.from(body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote"));
        
        if (elements.length > 0) {
          const sectionText = elements
            .map(el => el.textContent?.trim())
            .filter(Boolean)
            .join("\n\n");
          if (sectionText) fullTextChunks.push(sectionText);
        } else {
          // Fallback to textContent if no structured elements found
          const fallbackText = body.textContent?.trim();
          if (fallbackText) fullTextChunks.push(fallbackText);
        }
      }
    }
  }

  // Final cleanup: join chapters and normalize spacing
  return fullTextChunks
    .join("\n\n")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
