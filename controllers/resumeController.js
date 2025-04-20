const User = require('../dataBase/models/User');
const puppeteer = require('puppeteer');
const path = require('path');

// Update resume data
exports.updateResumeData = async (req, res) => {
  try {
    const { section, data } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update specific section of resume data
    user.resumeData[section] = data;
    await user.save();

    res.json({ success: true, message: 'Resume data updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resume data' });
  }
};

// Select template
exports.selectTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.resumeData.selectedTemplate = templateId;
    await user.save();

    res.json({ success: true, message: 'Template selected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to select template' });
  }
};

// Generate PDF
exports.generatePDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load the appropriate template
    const templatePath = path.join(__dirname, `../views/templates/${user.resumeData.selectedTemplate}.ejs`);
    
    // Render the template with user data
    const html = await require('ejs').renderFile(templatePath, {
      data: user.resumeData
    });

    await page.setContent(html);
    
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

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-${user.name}.pdf`);
    
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// Get available templates
exports.getTemplates = async (req, res) => {
  try {
    // This would typically come from a database or configuration
    const templates = [
      {
        id: 'template1',
        name: 'Professional Classic',
        thumbnail: '/images/templates/template1-thumb.jpg',
        description: 'A clean and professional template suitable for all industries'
      },
      {
        id: 'template2',
        name: 'Modern Minimal',
        thumbnail: '/images/templates/template2-thumb.jpg',
        description: 'A modern and minimal design for creative professionals'
      },
      {
        id: 'template3',
        name: 'Executive Style',
        thumbnail: '/images/templates/template3-thumb.jpg',
        description: 'An executive-style template for senior professionals'
      }
    ];

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}; 