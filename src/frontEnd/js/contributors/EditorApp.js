class EditorApp {
  constructor() {
      const xhrWelcome = new XMLHttpRequest();
      xhrWelcome.onreadystatechange = () => this.handleWelcomeStateChange(xhrWelcome);
      xhrWelcome.open('GET', 'capitulos/editor/index.html');
      xhrWelcome.send();
  }

  handleWelcomeStateChange(xhr) {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              var welcomeDiv = document.getElementById("welcome");
              welcomeDiv.innerHTML = xhr.responseText;

              this.htmlInput = document.getElementById('htmlInput');
              this.preview = document.getElementById('preview');
              this.fileListSelect = document.getElementById('fileList');
              this.fileListSelect.onclick = this.loadFile.bind(this);
              this.save = document.getElementById("editorSave");
              this.save.onclick = this.saveChanges.bind(this);
              this.loadFileList();

              // Add event listeners for custom buttons
              document.getElementById('addHeadingButton').addEventListener('click', () => this.addHeading());
              document.getElementById('addLinkButton').addEventListener('click', () => this.addLink());

              // Update preview on input change
              this.htmlInput.addEventListener('input', () => this.updatePreview());
          }
      }
  }

  handleFileListStateChange(xhr) {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              const files = JSON.parse(xhr.responseText);
              this.populateFileList(files);
              this.loadFile();
          }
      }
  }

  handleLoadFileStateChange(xhr) {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              this.htmlInput.value = xhr.responseText;
              this.updatePreview();
          }
      }
  }

  handleSaveChangesStateChange(xhr) {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              alert(xhr.responseText);
          }
      }
  }

  loadFileList() {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => this.handleFileListStateChange(xhr);
      xhr.open('GET', 'capitulos/tuturiais.json');
      xhr.send();
  }

  populateFileList(data) {
      for (let i = 0; i < data.categories.length; i++) {
          const category = data.categories[i];
          console.log(`Category: ${category.title}`);

          for (let j = 0; j < category.items.length; j++) {
              const item = category.items[j];
              console.log(`  Title: ${item.title}, Action: ${item.action}`);
              if (item.title != null) {
                  const option = document.createElement('option');
                  option.value = item.action;
                  option.textContent = item.title;
                  this.fileListSelect.appendChild(option);
              }
          }
      }
  }

  loadFile() {
      const selectedFile = "capitulos/" + this.fileListSelect.value + "/index.html";
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => this.handleLoadFileStateChange(xhr);
      xhr.open('GET', selectedFile);
      xhr.send();
  }

  saveChanges() {
      const selectedFile = this.fileListSelect.value;
      const content = this.htmlInput.value;
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => this.handleSaveChangesStateChange(xhr);
      xhr.open('POST', 'save_changes.php');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send('file=' + encodeURIComponent(selectedFile) + '&content=' + encodeURIComponent(content));
  }

  addHeading() {
      const heading = '<h2 class="text-xl mb-4 mt-12 text-orange-800">text</h2>';
      this.insertAtCursor(heading);
      this.updatePreview();
  }

  addLink() {
      const link = '<a href="#" linkeddiv="resposta2" class="text-gray-600 italic decoration-dashed underline cursor-help dark:text-gray-200">Resposta</a>';
      this.insertAtCursor(link);
      this.updatePreview();
  }

  insertAtCursor(text) {
      const start = this.htmlInput.selectionStart;
      const end = this.htmlInput.selectionEnd;
      const before = this.htmlInput.value.substring(0, start);
      const after = this.htmlInput.value.substring(end);
      this.htmlInput.value = before + text + after;
      this.htmlInput.selectionStart = this.htmlInput.selectionEnd = start + text.length;
      this.htmlInput.focus();
  }

  updatePreview() {
      const htmlContent = this.htmlInput.value;
      this.preview.srcdoc = htmlContent;
  }
}
