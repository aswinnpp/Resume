// Skills Input Handling
document.addEventListener('DOMContentLoaded', function() {
    const skillsInput = document.querySelector('.skills-input');
    if (skillsInput) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = 'Add a skill and press Enter';
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const skill = this.value.trim();
                if (skill) {
                    addSkillTag(skill);
                    this.value = '';
                }
            }
        });
        
        skillsInput.appendChild(input);
    }
});

function addSkillTag(skill) {
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `
        ${skill}
        <span class="remove" onclick="this.parentElement.remove()">&times;</span>
        <input type="hidden" name="skills[]" value="${skill}">
    `;
    
    const skillsInput = document.querySelector('.skills-input');
    skillsInput.insertBefore(tag, skillsInput.lastElementChild);
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Date Input Handling
document.addEventListener('DOMContentLoaded', function() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', function() {
            const startDate = this.closest('form').querySelector('[name="startDate"]');
            const endDate = this.closest('form').querySelector('[name="endDate"]');
            
            if (startDate && endDate) {
                if (new Date(startDate.value) > new Date(endDate.value)) {
                    endDate.classList.add('is-invalid');
                } else {
                    endDate.classList.remove('is-invalid');
                }
            }
        });
    });
});

// Template Selection
function selectTemplate(templateId) {
    const templates = document.querySelectorAll('.template-card');
    templates.forEach(template => {
        template.classList.remove('selected');
        if (template.dataset.templateId === templateId) {
            template.classList.add('selected');
        }
    });
}

// AJAX Form Submission
function submitFormAjax(formId, successCallback) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm(formId)) {
            return;
        }

        const formData = new FormData(form);
        
        fetch(form.action, {
            method: form.method,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (successCallback) {
                    successCallback(data);
                }
                showAlert('success', data.message || 'Operation successful');
            } else {
                showAlert('danger', data.error || 'Operation failed');
            }
        })
        .catch(error => {
            showAlert('danger', 'An error occurred. Please try again.');
        });
    });
}

// Alert Handling
function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertContainer, container.firstChild);
    
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
}

// Dynamic Form Fields
function addFormField(containerId, template) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const field = document.createElement('div');
    field.className = 'form-field mb-3';
    field.innerHTML = template;
    
    container.appendChild(field);
}

function removeFormField(button) {
    const field = button.closest('.form-field');
    if (field) {
        field.remove();
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}); 