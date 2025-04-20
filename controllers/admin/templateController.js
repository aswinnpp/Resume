const Template = require('../../dataBase/models/Template');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/uploads/templates');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'preview', maxCount: 1 }
]);

// Display template list
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find().sort({ createdAt: -1 });
        res.render('admin/templates/list', {
            templates,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Get templates error:', error);
        req.flash('error', 'Error loading templates');
        res.redirect('/admin/dashboard');
    }
};

// Display add template form
exports.getAddTemplate = (req, res) => {
    res.render('admin/templates/add', {
        messages: req.flash()
    });
};

// Handle template creation
exports.createTemplate = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                req.flash('error', err.message || 'Error uploading files');
                return res.redirect('/admin/templates/add');
            }

            try {
                const templateData = {
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    html: req.body.html,
                    css: req.body.css,
                    isActive: req.body.isActive === 'on',
                    createdBy: req.user._id
                };

                // Add file paths if files were uploaded
                if (req.files) {
                    if (req.files.thumbnail) {
                        templateData.thumbnail = '/uploads/templates/' + req.files.thumbnail[0].filename;
                    }
                    if (req.files.preview) {
                        templateData.preview = '/uploads/templates/' + req.files.preview[0].filename;
                    }
                }

                const template = new Template(templateData);
                await template.save();

                req.flash('success', 'Template created successfully');
                res.redirect('/admin/templates');
            } catch (error) {
                // Clean up uploaded files if template creation fails
                if (req.files) {
                    for (const field in req.files) {
                        for (const file of req.files[field]) {
                            await fs.unlink(file.path).catch(console.error);
                        }
                    }
                }
                throw error;
            }
        });
    } catch (error) {
        console.error('Create template error:', error);
        req.flash('error', 'Error creating template: ' + error.message);
        res.redirect('/admin/templates/add');
    }
};

// Display edit template form
exports.getEditTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) {
            req.flash('error', 'Template not found');
            return res.redirect('/admin/templates');
        }
        res.render('admin/templates/edit', {
            template,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Get edit template error:', error);
        req.flash('error', 'Error loading template');
        res.redirect('/admin/templates');
    }
};

// Handle template update
exports.updateTemplate = async (req, res) => {
    try {
        upload(req, res, async function(err) {
            if (err) {
                console.error('Upload error:', err);
                req.flash('error', err.message || 'Error uploading files');
                return res.redirect(`/admin/templates/edit/${req.params.id}`);
            }

            try {
                const templateData = {
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    html: req.body.html,
                    css: req.body.css,
                    isActive: req.body.isActive === 'on'
                };

                // Add file paths if new files were uploaded
                if (req.files) {
                    if (req.files.thumbnail) {
                        templateData.thumbnail = '/uploads/templates/' + req.files.thumbnail[0].filename;
                    }
                    if (req.files.preview) {
                        templateData.preview = '/uploads/templates/' + req.files.preview[0].filename;
                    }
                }

                const template = await Template.findByIdAndUpdate(
                    req.params.id,
                    templateData,
                    { new: true }
                );

                req.flash('success', 'Template updated successfully');
                res.redirect('/admin/templates');
            } catch (error) {
                // Clean up uploaded files if template update fails
                if (req.files) {
                    for (const field in req.files) {
                        for (const file of req.files[field]) {
                            await fs.unlink(file.path).catch(console.error);
                        }
                    }
                }
                throw error;
            }
        });
    } catch (error) {
        console.error('Update template error:', error);
        req.flash('error', 'Error updating template: ' + error.message);
        res.redirect(`/admin/templates/edit/${req.params.id}`);
    }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }

        // Delete associated files
        if (template.thumbnail) {
            await fs.unlink(path.join(__dirname, '../../public', template.thumbnail)).catch(console.error);
        }
        if (template.preview) {
            await fs.unlink(path.join(__dirname, '../../public', template.preview)).catch(console.error);
        }

        await Template.deleteOne({ _id: req.params.id });
        
        req.flash('success', 'Template deleted successfully');
        res.redirect('/admin/templates');
    } catch (error) {
        console.error('Delete template error:', error);
        req.flash('error', 'Error deleting template');
        res.redirect('/admin/templates');
    }
}; 