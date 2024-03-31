class AllUsers {

    constructor() {
        this.xhrWelcome = new XMLHttpRequest();
        this.xhrWelcome.onreadystatechange = this.handleWelcomeStateChange.bind(this);
        this.xhrWelcome.open('GET', 'ajax/allUsers');
        this.xhrWelcome.send();
    }

    handleWelcomeStateChange() {
        if (this.xhrWelcome.status == 200 && this.xhrWelcome.readyState == 4) {
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

        // Dynamically creating headers
        const headerRow = document.createElement('tr');
        const userKeys = Object.keys(users[0]);
        for (let i = 0; i < userKeys.length; i++) {
            const th = document.createElement('th');
            th.textContent = userKeys[i].replace(/_/g, ' ').toUpperCase();
            headerRow.appendChild(th);
        }
        const th = document.createElement('th');
        th.textContent = "Save";
        headerRow.appendChild(th);

        th.textContent = "Delete";
        headerRow.appendChild(th);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Populate table rows
        for (let i = 0; i < users.length; i++) {
          const  tr=this.adduser(users[i], userKeys);
          const td = document.createElement('td');

            td.textContent = "Save";
            tr.appendChild(td);
    
            td.textContent = "Delete";
            tr.appendChild(td);
            tbody.appendChild(tr);
        }


        table.appendChild(tbody);
        container.appendChild(table);
    }

    adduser(user, userKeys) {
        const tr = document.createElement('tr');
        for (let i = 0; i < userKeys.length; i++) {
            const key = userKeys[i];
            const td = document.createElement('td');

            if (key === 'is_certified' || key === 'verified') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = user[key];
                checkbox.name = `${key}[${user.id}]`;
                td.appendChild(checkbox);
            } else if (key === 'role') {
                const select = document.createElement('select');
                select.name = `${key}[${user.id}]`;
                const roles = ['pupil', 'contributor', 'admin'];
                for (let j = 0; j < roles.length; j++) {
                    const option = document.createElement('option');
                    option.value = roles[j];
                    option.text = roles[j];
                    option.selected = user[key] === roles[j];
                    select.appendChild(option);
                }
                td.appendChild(select);
            } else if (key === 'certification_level') {
                const select = document.createElement('select');
                select.name = `${key}[${user.id}]`;
                const levels = ['NOHAM', 'cat 3', 'cat 2', 'cat 1'];
                for (let j = 0; j < levels.length; j++) {
                    const option = document.createElement('option');
                    option.value = levels[j];
                    option.text = levels[j];
                    option.selected = user[key] === levels[j];
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
            tr.appendChild(td);
        }

        return tr;
    }
}
