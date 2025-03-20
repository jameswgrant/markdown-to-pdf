const fs = require("fs-extra");
const path = require("path");
const showdown = require("showdown");
const puppeteer = require("puppeteer");

const converter = new showdown.Converter();

async function markdownToPDF(mdFilePath) {
    try {
        const mdContent = await fs.readfile(mdFilePath, "utf-8");
        const htmlContent = converter.makeHtml(mdContent);

        const html = `
      <html >
      <head>
        <meta charset="utf-8">
        <title>Markdown to PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; }
          h1, h2, h3, h4 { color: #333; }
          pre { background: #f4f4f4; padding: 10px; }
          code { font-family: monospace; }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

        const pdfPath = path.join(path.dirname(mdFilePath), path.basename(mdFilePath, ".md") + ".pdf");

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.pdf({ path: pdfPath, format: "A4" });

        await browser.close();
        console.log(`✅ PDF saved: ${pdfPath}`);
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Run with command-line argument
const mdFile = process.argv[2];
if (!mdFile) {
    console.error("❌ Please provide a Markdown file.");
    process.exit(1);
}

markdownToPDF(mdFile);
