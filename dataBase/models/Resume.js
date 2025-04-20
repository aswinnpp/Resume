const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    personalInfo: {
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        summary: {
            type: String,
            trim: true
        }
    },
    education: [{
        school: {
            type: String,
            required: true,
            trim: true
        },
        degree: {
            type: String,
            required: true,
            trim: true
        },
        fieldOfStudy: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            trim: true
        }
    }],
    experience: [{
        company: {
            type: String,
            required: true,
            trim: true
        },
        position: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            trim: true
        }
    }],
    skills: [{
        type: String,
        trim: true
    }],
    projects: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        }
    }],
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume; 