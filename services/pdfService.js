const puppeteer = require('puppeteer');

exports.generatePDF = async (resume, renderedTemplate) => {
  let browser;
  try {


    const page = await browser.newPage();

    // Inject CSS to shrink content to fit one A4 page
    const fittedTemplate = `
      <style>
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0;
          padding: 10mm;
          overflow: hidden;
          font-size: 10px; /* Reduce font-size to fit more content */
          transform: scale(0.85); /* Adjust this if needed */
          transform-origin: top left;
        }
      </style>
      ${renderedTemplate}
    `;

    await page.setContent(fittedTemplate, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    // Use exact width and height to lock content into one page
    const pdf = await page.pdf({
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true
    });

    return pdf;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  } finally {  
    if (browser) {
      await browser.close();
    }
  }
};
