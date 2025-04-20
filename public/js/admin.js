// Admin Dashboard JavaScript

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Handle settings form submission
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(settingsForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/admin/settings/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Settings updated successfully');
            } else {
                showAlert('danger', result.message || 'Failed to update settings');
            }
        } catch (error) {
            showAlert('danger', 'An error occurred while updating settings');
            console.error('Error:', error);
        }
    });
}

// Handle email test
const testEmailBtn = document.getElementById('testEmailBtn');
if (testEmailBtn) {
    testEmailBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/admin/settings/test-email', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Test email sent successfully');
            } else {
                showAlert('danger', result.message || 'Failed to send test email');
            }
        } catch (error) {
            showAlert('danger', 'An error occurred while sending test email');
            console.error('Error:', error);
        }
    });
}

// Handle backup creation
const createBackupBtn = document.getElementById('createBackupBtn');
if (createBackupBtn) {
    createBackupBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/admin/settings/backup', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Backup created successfully');
            } else {
                showAlert('danger', result.message || 'Failed to create backup');
            }
        } catch (error) {
            showAlert('danger', 'An error occurred while creating backup');
            console.error('Error:', error);
        }
    });
}

// Show alert message
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.appendChild(alertDiv);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Handle maintenance mode toggle
const maintenanceToggle = document.getElementById('maintenanceMode');
if (maintenanceToggle) {
    maintenanceToggle.addEventListener('change', async function() {
        try {
            const response = await fetch('/admin/settings/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maintenanceMode: this.checked
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', `Maintenance mode ${this.checked ? 'enabled' : 'disabled'}`);
            } else {
                showAlert('danger', result.message || 'Failed to update maintenance mode');
                this.checked = !this.checked; // Revert the toggle
            }
        } catch (error) {
            showAlert('danger', 'An error occurred while updating maintenance mode');
            console.error('Error:', error);
            this.checked = !this.checked; // Revert the toggle
        }
    });
} 