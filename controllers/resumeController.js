const User = require('../dataBase/models/User');
const puppeteer = require('puppeteer');
const path = require('path');
const Resume = require('../dataBase/models/Resume');
const pdfService = require('../services/pdfService');
const ejs = require('ejs');

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

// Preview resume
exports.previewResume = async (req, res) => {
  try {
    console.log("Preview resume called with ID:", req.params.id);
    console.log("User ID:", req.user._id);
    
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    console.log("Resume found:", resume ? "Yes" : "No");
    
    if (!resume) {
      console.log("Resume not found, redirecting to dashboard");
      req.flash('error', 'Resume not found');
      return res.redirect('/dashboard');
    }

    // Render the appropriate template
    const templatePath = path.join(__dirname, '..', 'views', 'templates', `${resume.template}.ejs`);
    console.log("Template path:", templatePath);
    
    const template = await ejs.renderFile(templatePath, { resume });
    console.log("Template rendered successfully");
    
    // Render the preview page with the template
    return res.render('resume/preview', { 
      title: 'Preview Resume',
      resume,
      template
    });
  } catch (error) {
    console.error('Preview resume error:', error);
    req.flash('error', 'Error previewing resume: ' + error.message);
    return res.redirect('/dashboard');
  }
};

// Download PDF
exports.downloadPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      req.flash('error', 'Resume not found');
      return res.redirect('/dashboard');
    }

    // Render the template
    const templatePath = path.join(__dirname, '..', 'views', 'templates', `${resume.template}.ejs`);
    const template = await ejs.renderFile(templatePath, { resume });

    // Generate PDF
    const pdf = await pdfService.generatePDF(resume, template);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${resume.personalInfo.fullName.replace(/\s+/g, '_')}_resume.pdf`);
    
    // Send the PDF
    return res.send(pdf);
  } catch (error) {
    console.error('Download PDF error:', error);
    req.flash('error', 'Error generating PDF');
    return res.redirect('/dashboard');
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const userId = req.user._id;

        // Find and delete the resume, ensuring it belongs to the user
        const resume = await Resume.findOneAndDelete({
            _id: resumeId,
            user: userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the resume'
        });
    }
}; 