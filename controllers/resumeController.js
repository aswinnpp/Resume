const User = require('../dataBase/models/User');
const puppeteer = require('puppeteer');
const path = require('path');
const Resume = require('../dataBase/models/Resume');
const Template = require('../dataBase/models/Template');
const pdfService = require('../services/pdfService');
const ejs = require('ejs');
const mongoose = require('mongoose');

// Create new resume
exports.createNewResume = async (req, res) => {
  try {
    const templateId = req.query.template;
    
    if (!templateId) {
      req.flash('error', 'Please select a template first');
      return res.redirect('/templates');
    }

    // Validate template ID
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      req.flash('error', 'Invalid template selected');
      return res.redirect('/templates');
    }

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template) {
      req.flash('error', 'Template not found');
      return res.redirect('/templates');
    }

    // Create a new resume with default values
    const resume = new Resume({
      user: req.user._id,
      title: 'My Resume',
      template: templateId,
      personalInfo: {
        fullName: req.user.name || '',
        email: req.user.email || '',
        phone: '',
        location: ''
      },
      completionStatus: 0
    });

    await resume.save();

    res.redirect(`/resume/edit/${resume._id}`);
  } catch (error) {
    console.error('Create resume error:', error);
    req.flash('error', 'Error creating resume');
    res.redirect('/templates');
  }
};

// Update resume data
exports.updateResumeData = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Update resume fields
    resume.personalInfo = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone || '',
      location: req.body.location || ''
    };
    resume.summary = req.body.summary || '';
    resume.education = req.body.education || [];
    resume.experience = req.body.experience || [];
    resume.skills = req.body.skills || [];
    resume.projects = req.body.projects || [];

    // Calculate completion status
    let completedFields = 0;
    let totalFields = 0;

    // Personal Info (4 fields)
    totalFields += 4;
    if (resume.personalInfo.fullName) completedFields++;
    if (resume.personalInfo.email) completedFields++;
    if (resume.personalInfo.phone) completedFields++;
    if (resume.personalInfo.location) completedFields++;

    // Summary (1 field)
    totalFields++;
    if (resume.summary) completedFields++;

    // Education (at least 1 entry with 4 required fields)
    if (resume.education.length > 0) {
      totalFields += 4;
      const hasRequiredFields = resume.education.some(edu => 
        edu.school && edu.degree && edu.startDate && edu.endDate
      );
      if (hasRequiredFields) completedFields += 4;
    }

    // Experience (at least 1 entry with 4 required fields)
    if (resume.experience.length > 0) {
      totalFields += 4;
      const hasRequiredFields = resume.experience.some(exp => 
        exp.company && exp.position && exp.startDate && exp.endDate
      );
      if (hasRequiredFields) completedFields += 4;
    }

    // Skills (at least 1 skill)
    totalFields++;
    if (resume.skills.length > 0) completedFields++;

    // Projects (at least 1 project with name)
    if (resume.projects.length > 0) {
      totalFields++;
      const hasRequiredFields = resume.projects.some(proj => proj.name);
      if (hasRequiredFields) completedFields++;
    }

    // Calculate completion percentage
    resume.completionStatus = Math.round((completedFields / totalFields) * 100);
    await resume.save();

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ success: false, error: 'Error updating resume' });
  }
};

// Select template
exports.selectTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    const userId = req.user._id;

    // Validate template ID
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update the resume's template
    const resume = await Resume.findOne({ user: userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    resume.template = templateId;
    await resume.save();

    res.json({ success: true, message: 'Template selected successfully' });
  } catch (error) {
    console.error('Select template error:', error);
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
    const templates = await Template.find().select('name description thumbnail');
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
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

    // Get the template from the database
    const template = await Template.findById(resume.template);
    if (!template) {
      console.log("Template not found");
      req.flash('error', 'Template not found');
      return res.redirect('/dashboard');
    }

    // Create a style tag with the template's CSS
    const styleTag = `<style>${template.css}</style>`;

    // Render the template with resume data
    res.render('resume/preview', {
      title: 'Preview Resume',
      resume: resume,
      template: template,
      styleTag: styleTag,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Preview resume error:', error);
    req.flash('error', 'Error previewing resume');
    res.redirect('/dashboard');
  }
};

// Download PDF
exports.downloadPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
      .populate('template');
    
    if (!resume) {
      req.flash('error', 'Resume not found');
      return res.redirect('/dashboard');
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Create HTML content with template CSS and resume data
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${resume.template.css}</style>
        </head>
        <body>
          ${resume.template.html}
        </body>
      </html>
    `;

    // Replace template variables with actual resume data
    const renderedHtml = await ejs.render(htmlContent, { resume: resume }, { async: true });
    
    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume-${resume._id}.pdf`);
    
    res.send(pdf);
  } catch (error) {
    console.error('Download PDF error:', error);
    req.flash('error', 'Error generating PDF');
    res.redirect('/dashboard');
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    await Resume.deleteOne({ _id: req.params.id });
    
    req.flash('success', 'Resume deleted successfully');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Delete resume error:', error);
    req.flash('error', 'Error deleting resume');
    res.redirect('/dashboard');
  }
}; 