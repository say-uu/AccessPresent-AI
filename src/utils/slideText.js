// Builds a quick "what am I supposed to say" cue from the current slide's
// own text, for the presentation page's "I'm Stuck" rescue button. Pure
// text extraction plus a simple heuristic — no AI model, no network call —
// so it always works instantly regardless of connectivity.

/**
 * Extracts a PDF page's text as reading-order lines, by grouping pdf.js's
 * individual text runs into rows using their y-position (runs on the same
 * row share the same baseline) and ordering rows top-to-bottom, then
 * left-to-right within each row.
 */
export async function extractPageLines(pdfDoc, pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const content = await page.getTextContent();

  const rows = new Map(); // rounded baseline y -> text runs on that row
  for (const item of content.items) {
    if (!item.str || !item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(item);
  }

  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0]) // PDF y-axis increases upward: top of page first
    .map(([, items]) =>
      items
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

/**
 * Turns a slide's text lines into a ready-to-speak cue: the first line
 * (almost always the slide's own heading, since it sits at the top) as a
 * "say this" opener, plus the next few lines as reminders of what else is
 * on the slide.
 */
export function buildRescueCue(lines) {
  if (lines.length === 0) {
    return {
      suggestion: "This slide doesn't have readable text — describe what's on screen in your own words.",
      points: [],
    };
  }

  const [title, ...rest] = lines;
  return {
    suggestion: `So, the main idea behind this slide is: ${title}`,
    points: rest.slice(0, 4),
  };
}
