
class LocalStorageManager {
    constructor() {
        this.setupClickEvents();
    }

    setupClickEvents() {
        document.getElementById('exportButton').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearStorageButton').addEventListener('click', () => {
            if (confirm('Tem a certeza que deseja limpar as suas respostas? Esta ação não pode ser desfeita.')) {
                localStorage.clear();
            }
        });

        document.getElementById('fileInput').addEventListener('change', () => {
            this.importData();
        });
    }

    exportData() {
        const itemCount = localStorage.length;
        if (itemCount > 0) {
            const allVariables = {};
            for (let i = 0; i < itemCount; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                allVariables[key] = value;
            }
            const jsonData = JSON.stringify(allVariables);
            const dataURL = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonData);
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'localStorageData.json';
            a.click();
        } else {
            alert('Local storage is empty.');
        }
    }

    importData() {
        const fileInput = document.getElementById('fileInput');
        const selectedFile = fileInput.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const fileContent = event.target.result;
                    const importedData = JSON.parse(fileContent);
                    for (const key in importedData) {
                        localStorage.setItem(key, importedData[key]);
                    }
                    alert('Data imported successfully!');
                    location.reload();

                } catch (error) {
                    alert('Error parsing or importing data: ' + error);
                }
            };
            reader.readAsText(selectedFile);
        } else {
            alert('Please select a file to import.');
        }
    }
}


