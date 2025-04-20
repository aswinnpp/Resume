const puppeteer = require('puppeteer');
const path = require('path');

const generatePDF = async (resume, template) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // Set content
    await page.setContent(template, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

module.exports = {
  generatePDF
}; 