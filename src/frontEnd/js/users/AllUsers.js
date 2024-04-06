class AllUsers {
    constructor() {
        this.xhrWelcome = new XMLHttpRequest();
        this.xhrWelcome.onreadystatechange = this.handleWelcomeStateChange.bind(this);
        this.xhrWelcome.open('GET', 'ajax/allUsers');
        this.xhrWelcome.send();
    }

    handleWelcomeStateChange() {
        if (this.xhrWelcome.readyState == 4 && this.xhrWelcome.status == 200) {
            const response = JSON.parse(this.xhrWelcome.responseText);
            if (response.success && response.users) {
                this.createUsersTable(response.users);
            } else {
                console.log('Failed to load users:', response.message);
            }
        }
    }

    createUsersTable(users) {
        if (users.length === 0) {
            console.error('No users to display.');
            return;
        }

        let container = document.getElementById("welcome");
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        container.innerHTML = ''; // Clear previous contents

        // Creating headers dynamically
        const headerRow = document.createElement('tr');
        const userKeys = Object.keys(users[0]);
        for (let i = 0; i < userKeys.length; i++) {
            const th = document.createElement('th');
            th.textContent = userKeys[i].replace(/_/g, ' ').toUpperCase();
            headerRow.appendChild(th);
        }

        const actions = ["Save", "Delete"];
        for (let i = 0; i < actions.length; i++) {
            const th = document.createElement('th');
            th.textContent = actions[i];
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Populate table rows
        for (let i = 0; i < users.length; i++) {
            const tr = this.addUser(users[i], userKeys);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.appendChild(table);
    }

    addUser(user, userKeys) {
        const tr = document.createElement('tr');
        tr.setAttribute('data-user-id', user.id);

        for (let i = 0; i < userKeys.length; i++) {
            const td = this.createCell(user, userKeys[i]);
            tr.appendChild(td);
        }

        const actions = ["Save", "Delete"];
        for (let i = 0; i < actions.length; i++) {
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.textContent = actions[i];
            button.onclick = this[actions[i].toLowerCase() + 'UserData'].bind(this, user);
            td.appendChild(button);
            tr.appendChild(td);
        }

        return tr;
    }

    createCell(user, key) {
        const td = document.createElement('td');
        if (key === 'is_certified' || key === 'verified') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = user[key];
            checkbox.name = `${key}[${user.id}]`;
            td.appendChild(checkbox);
        } else if (key === 'role' || key === 'certification_level') {
            const select = document.createElement('select');
            select.name = `${key}[${user.id}]`;
            const options = key === 'role' ? ['pupil', 'contributor', 'admin'] : ['NOHAM', 'cat 3', 'cat 2', 'cat 1'];
            for (let j = 0; j < options.length; j++) {
                const option = document.createElement('option');
                option.value = options[j];
                option.text = options[j];
                option.selected = user[key] === options[j];
                select.appendChild(option);
            }
            td.appendChild(select);
        } else if (key === 'UserDocuments') {
            for (let j = 0; j < user[key].length; j++) {
                const doc = user[key][j];
                const a = document.createElement('a');
                a.href = `/image?id=${doc.documentId}`;
                a.textContent = doc.fileName;
                a.target = "_blank";
                td.appendChild(a);
                if (j < user[key].length - 1) {
                    td.appendChild(document.createElement('br'));
                }
            }
        } else {
            td.textContent = user[key];
        }
        return td;
    }

    saveUserData(user) {
        console.log(`Saving data for user ID ${user.id}`);
        // Add AJAX request logic here
    }

    deleteUserData(user) {
        console.log(`Deleting user ID ${user.id}`);
        // Add AJAX request logic here
    }
}
