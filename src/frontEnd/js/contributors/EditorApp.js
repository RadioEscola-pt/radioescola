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

          this.editor = tinymce.init({
            selector: '#editor',
            height: 500,
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount'
            ],
            style_formats: [
                // Adds a h1 format to style_formats that applies a class of heading
                { title: 'H1', block: 'h1', classes: 'text-2xl mb-4' }
              ]
          });
          this.fileListSelect = document.getElementById('fileList');
          this.fileListSelect.onclick= this.loadFile.bind(this);
          this.save = document.getElementById("editorSave");
          this.save.onclick = this.saveChanges.bind(this);
          this.loadFileList();
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
            try {
                tinyMCE.activeEditor.setContent(xhr.responseText);
              } catch (error) {
                console.error('Error setting content:', error);
              }
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
          if (item.title!=null)
          {
            const option = document.createElement('option');

            option.value = item.action;
            option.textContent = item.title;
            this.fileListSelect.appendChild(option);
          }

        }
      }

    }
  
    loadFile() {
      const selectedFile = "capitulos/"+this.fileListSelect.value+"/index.html";
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => this.handleLoadFileStateChange(xhr);
      xhr.open('GET', selectedFile);
      xhr.send();
    }

    saveChanges() {
        
      const selectedFile = this.fileListSelect.value;
      const content = this.editor.getContent();
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => this.handleSaveChangesStateChange(xhr);
      xhr.open('POST', 'save_changes.php');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send('file=' + encodeURIComponent(selectedFile) + '&content=' + encodeURIComponent(content));
    }
  }
  

  
