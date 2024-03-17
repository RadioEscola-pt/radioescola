class UserNavBar {
    constructor(user) {
        this.navbarElement = document.getElementById("UserNavBar");
        document.getElementById('UserNavBarLi').style.display = 'block';
        document.getElementById('loginLinkLi').style.display = 'none';
        this.dataUrl = "users/navBar.json";
        this.loadData();
        this.setObjectInCookie('userInfo', user, 7);
    }
    setObjectInCookie(cookieName, object, daysToExpire) {
        const d = new Date();
        d.setTime(d.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cookieName + "=" + JSON.stringify(object) + ";" + expires + ";path=/";
    }

    loadData() {
        fetch(this.dataUrl)
            .then(response => response.json())
            .then(data => this.populateNavbar(data))
            .catch(error => console.error('Error loading the JSON data:', error));
    }
    clickAction(event) {

        //TODO there is somehting wrong here with the dropdowns this code is hacking an issue with taiwindcss
        const dropdownID = event.currentTarget.getAttribute('data-dropdown-toggle');
        let actionEvent = event.target.getAttribute('actionEvent');
        const dropdown = document.getElementById(dropdownID);

        // Close the current dropdown if it's not the one being clicked
        if (UserNavBar.currentDropdown && UserNavBar.currentDropdown !== dropdown) {
            const dropdown = document.getElementById(UserNavBar.currentDropdown);
            console.log(UserNavBar.currentDropdown);
            dropdown.classList.add('hidden');
            
        }

        UserNavBar.currentDropdown = dropdownID;
        

        // Toggle the clicked dropdown
        if (dropdown) {
        dropdown.classList.toggle('hidden');
        }
        if (actionEvent) {
            switch (actionEvent) {
                case 'artigos':
                    this.artigos();
                    break;
                case 'logout':
                    this.logout();
                    break;
                default:
                    break;
            }
        }
    }
    artigos() { new EditorApp(); }
    logout() {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "ajax/logout", true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Session destroyed successfully
                console.log("User logged out.");
                window.location.href = "index.html";

            }
        };
        xhr.send();
    }







    populateNavbar(data) {
        // Create the main ul container
        let mainUl = document.createElement('ul');
        mainUl.className = "py-2 text-sm text-gray-700 dark:text-gray-400";
        mainUl.setAttribute('aria-labelledby', "dropdownLargeButton");

        for (let i = 0; i < data.categories.length; i++) {
            const category = data.categories[i];

            // Create the li container for each category
            const categoryLi = document.createElement('li');
            categoryLi.setAttribute('aria-labelledby', this.navbarElement.id);


            let categoryButton;


            if (category.items == null) {
                categoryButton = document.createElement('a');
                categoryButton.className = "block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white";
                categoryButton.textContent = category.title;
                categoryButton.onclick = this.clickAction.bind(this);
                categoryLi.appendChild(categoryButton);     
                categoryButton.setAttribute('actionEvent', category.action);

            } else {

                categoryButton = document.createElement('button');
                categoryButton.textContent = category.title;
                categoryButton.className = 'flex items-center justify-between w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white';
                categoryButton.innerHTML = `${category.title} <img src="images/arrow-down.svg" class="w-2.5 h-2.5 ml-2.5">`;
                categoryButton.id = `${category.id}Button`;
                categoryButton.setAttribute('data-dropdown-toggle', `${category.id}Dropdown`);
                categoryButton.setAttribute('data-dropdown-placement', "right-start");
                categoryButton.setAttribute('type', "button");


                categoryButton.addEventListener('click', this.clickAction.bind(this));
            }
            if (category.items != null) {
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
                    a.onclick = this.clickAction.bind(this);
                    a.textContent = item.title;
                    a.setAttribute('actionEvent', item.action);
                    a.className = 'block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white';


                    li.appendChild(a);
                    ul.appendChild(li);
                }

                itemsDiv.appendChild(ul);
                categoryLi.appendChild(categoryButton);
                categoryLi.appendChild(itemsDiv);
            }

            // Append the button and dropdown to the categoryLi, then the categoryLi to the mainUl


            mainUl.appendChild(categoryLi);
        }

        // Append the mainUl to the navbarElement
        this.navbarElement.appendChild(mainUl);


    }
}
