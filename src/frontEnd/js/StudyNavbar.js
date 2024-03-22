class StudyNavbar {
    constructor() {
        this.navbarElement = document.getElementById("studyNavbar");
        this.dataUrl = "capitulos/tuturiais.json";
        this.loadData();
    }

    loadData() {
        fetch(this.dataUrl)
            .then(response => response.json())
            .then(data => this.populateNavbar(data))
            .catch(error => console.error('Error loading the JSON data:', error));
    }



    populateNavbar(data) {
        // Create the main ul container
        const mainUl = document.createElement('ul');
        mainUl.className = "py-2 text-sm text-gray-700 dark:text-gray-400";
        mainUl.setAttribute('aria-labelledby', "dropdownLargeButton");

        for (let i = 0; i < data.categories.length; i++) {
            const category = data.categories[i];

            // Create the li container for each category
            const categoryLi = document.createElement('li');
            categoryLi.setAttribute('aria-labelledby', this.navbarElement.id);

            const categoryButton = document.createElement('button');
            categoryButton.textContent = category.title;
            categoryButton.className = 'flex items-center justify-between w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white';
            categoryButton.innerHTML = `${category.title} <img src="images/arrow-down.svg" class="w-2.5 h-2.5 ml-2.5">`;
            categoryButton.id = `${category.id}Button`;
            categoryButton.setAttribute('data-dropdown-toggle', `${category.id}Dropdown`);
            categoryButton.setAttribute('data-dropdown-placement', "right-start");
            categoryButton.setAttribute('type', "button");

categoryButton.addEventListener('click', (event) => {
                //TODO there is somehting wrong here with the dropdowns this code is hacking an issue with taiwindcss
                const dropdownID = event.currentTarget.getAttribute('data-dropdown-toggle');
                const dropdown = document.getElementById(dropdownID);

                // Close the current dropdown if it's not the one being clicked
                if (this.currentDropdown && this.currentDropdown !== dropdown) {
                    this.currentDropdown.classList.add('hidden');
                }

                // Toggle the clicked dropdown
                dropdown.classList.toggle('hidden');

                // Update the currentDropdown property
                this.currentDropdown = dropdown.classList.contains('hidden') ? null : dropdown;
            });




            const itemsDiv = document.createElement('div');
            itemsDiv.id = `${category.id}Dropdown`;
            itemsDiv.className = 'z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 block';
            itemsDiv.setAttribute('data-dropdown-placement', "right-start");

            itemsDiv.style = "position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate(186px, 8px);"




            const ul = document.createElement('ul');
            ul.className = 'py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer';
            ul.setAttribute('aria-labelledby', `${category.id}Button`);

            for (let j = 0; j < category.items.length; j++) {
                const item = category.items[j];
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = item.title;
                if (item.action == null) {

                    // Set the href attribute to the URL
                    a.href = item.newTab;

                    // Set target to '_blank' to open in a new tab
                    a.target = '_blank';
                }
                else {
                    a.href = '?LoadChapter=' + item.action;
                }
                a.className = 'block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white';


                li.appendChild(a);
                ul.appendChild(li);
            }

            itemsDiv.appendChild(ul);

            // Append the button and dropdown to the categoryLi, then the categoryLi to the mainUl
            categoryLi.appendChild(categoryButton);
            categoryLi.appendChild(itemsDiv);
            mainUl.appendChild(categoryLi);
        }

        // Append the mainUl to the navbarElement
        this.navbarElement.appendChild(mainUl);


    }
}