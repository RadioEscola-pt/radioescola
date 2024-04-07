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
        tr.setAttribute('data-user-id', user.userId);

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
            checkbox.name = `${key}[${user.userId}]`;
            td.appendChild(checkbox);
        } else if (key === 'role' || key === 'certification_level') {
            const select = document.createElement('select');
            select.name = `${key}[${user.userId}]`;
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
        const userId = user.userId;
        const data = new FormData();  // Use FormData to easily encode data as form fields
        data.append('userId', userId);

        // Collect inputs for "is_certified" and "verified" checkboxes
        const certified = document.getElementsByName(`is_certified[${userId}]`)[0];
        const verified = document.getElementsByName(`verified[${userId}]`)[0];
        if (certified) {
            data.append('is_certified', certified.checked ? 'true' : 'false');  // Convert boolean to '1' or '0'
        }
        if (verified) {
            data.append('verified', verified.checked ? 'true' : 'false');
        }

        // Collect inputs for "role" and "certification_level" dropdowns
        const role = document.getElementsByName(`role[${userId}]`)[0];
        const certificationLevel = document.getElementsByName(`certification_level[${userId}]`)[0];
        if (role) {
            data.append('role', role.value);
        }
        if (certificationLevel) {
            data.append('certification_level', certificationLevel.value);
        }

        // Perform the AJAX request to save data
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'ajax/updateUser');
        // No need to set 'Content-Type' for FormData; the browser will set it with the correct boundary
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('User data saved successfully:', xhr.responseText);
            } else {
                console.error('Error saving user data:', xhr.status);
            }
        };
        xhr.onerror = function() {
            console.error('Request failed');
        };
        xhr.send(data);  // Send the FormData object
    }

    deleteUserData(user) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'ajax/deleteUser');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('User deleted successfully');
            } else {
                console.log('Error deleting user');
            }
        };
        xhr.send(JSON.stringify({ userId: user.userId }));
    }
}
