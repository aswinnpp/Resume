const puppeteer = require('puppeteer');

exports.generatePDF = async (resume, renderedTemplate) => {
  let browser;
  try {
    // Launch browser with additional arguments for better compatibility
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // Set content and wait for network to be idle
    await page.setContent(renderedTemplate, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load']
    });

    // Generate PDF with proper formatting
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
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