class PluginManager {
    constructor() {
        this.apiBase = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadModules();
        this.initializeUI();
    }

    initializeUI() {
        // Initialize browse button visibility based on default type
        const typeSelect = document.getElementById('moduleType');
        const browseButton = document.getElementById('browseButton');

        if (typeSelect.value === 'local') {
            browseButton.style.display = 'block';
        } else {
            browseButton.style.display = 'none';
        }
    }

    bindEvents() {
        const form = document.getElementById('addModuleForm');
        form.addEventListener('submit', (e) => this.handleAddModule(e));

        const typeSelect = document.getElementById('moduleType');
        typeSelect.addEventListener('change', (e) => this.handleTypeChange(e));

        const browseButton = document.getElementById('browseButton');
        browseButton.addEventListener('click', () => this.handleBrowseClick());

        const folderInput = document.getElementById('folderInput');
        folderInput.addEventListener('change', (e) => this.handleFolderSelect(e));
    }

    handleTypeChange(e) {
        const locationInput = document.getElementById('moduleLocation');
        const browseButton = document.getElementById('browseButton');

        if (e.target.value === 'url') {
            locationInput.placeholder = 'https://example.com/remoteEntry.json';
            browseButton.style.display = 'none';
        } else {
            locationInput.placeholder = '/path/to/module or click Browse...';
            browseButton.style.display = 'block';
        }
    }

    async handleAddModule(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const type = formData.get('type');
        const location = formData.get('location');

        const payload = {
            name: name,
            ...(type === 'url' ? { url: location } : { path: location })
        };

        try {
            const response = await fetch(`${this.apiBase}/api/add-module`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Module added successfully!', 'success');
                e.target.reset();
                this.loadModules();
            } else {
                this.showAlert(result.error || 'Failed to add module', 'error');
            }
        } catch (error) {
            this.showAlert('Network error: ' + error.message, 'error');
        }
    }

    async loadModules() {
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBase}/api/modules`);
            const result = await response.json();

            if (result.success) {
                this.renderModules(result.data);
            } else {
                this.showAlert(result.error || 'Failed to load modules', 'error');
                this.showEmptyState();
            }
        } catch (error) {
            this.showAlert('Network error: ' + error.message, 'error');
            this.showEmptyState();
        } finally {
            this.showLoading(false);
        }
    }

    renderModules(modules) {
        const tbody = document.getElementById('modulesTableBody');
        const table = document.getElementById('modulesTable');
        const emptyState = document.getElementById('emptyState');

        if (!modules || modules.length === 0) {
            this.showEmptyState();
            return;
        }

        tbody.innerHTML = '';
        
        modules.forEach(module => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${this.escapeHtml(module.name)}</strong></td>
                <td><span class="badge badge-${module.type}">${module.type}</span></td>
                <td class="location">${this.escapeHtml(module.url || module.path || 'N/A')}</td>
                <td>${new Date(module.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small btn-danger" onclick="pluginManager.removeModule('${module.name}')">
                            Remove
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        table.classList.remove('hidden');
        emptyState.classList.add('hidden');
    }

    async removeModule(name) {
        if (!confirm(`Are you sure you want to remove the module "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/remove-module`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });

            const result = await response.json();

            if (result.success) {
                this.showAlert('Module removed successfully!', 'success');
                this.loadModules();
            } else {
                this.showAlert(result.error || 'Failed to remove module', 'error');
            }
        } catch (error) {
            this.showAlert('Network error: ' + error.message, 'error');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const table = document.getElementById('modulesTable');
        const emptyState = document.getElementById('emptyState');

        if (show) {
            loading.classList.remove('hidden');
            table.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showEmptyState() {
        const table = document.getElementById('modulesTable');
        const emptyState = document.getElementById('emptyState');
        
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }

    showAlert(message, type) {
        const alertsContainer = document.getElementById('alerts');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertsContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    handleBrowseClick() {
        const folderInput = document.getElementById('folderInput');
        folderInput.click();
    }

    handleFolderSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            // Get the path from the first file and extract the directory
            const firstFile = files[0];
            const fullPath = firstFile.webkitRelativePath;

            // Extract the root folder name (first part of the path)
            const pathParts = fullPath.split('/');
            const rootFolder = pathParts[0];

            // Set the location input to the folder path
            const locationInput = document.getElementById('moduleLocation');
            locationInput.value = rootFolder;

            this.showAlert(`Selected folder: ${rootFolder} (${files.length} files)`, 'success');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the plugin manager
const pluginManager = new PluginManager();
