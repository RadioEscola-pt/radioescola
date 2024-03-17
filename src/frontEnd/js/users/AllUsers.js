class AllUsers {

    constructor() {
       
        this.xhrWelcome = new XMLHttpRequest();
        this.xhrWelcome.onreadystatechange = this.handleWelcomeStateChange.bind(this);
        this.xhrWelcome.open('GET', 'ajax/allUsers');
        this.xhrWelcome.send();
    }

    handleWelcomeStateChange() {
        if (this.xhrWelcome.status == 200 && this.xhrWelcome.readyState ==4) {
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
        thead.appendChild(headerRow);

        // Populate table rows
        for (let i = 0; i < users.length; i++) {
            const tr = document.createElement('tr');
            for (let j = 0; j < userKeys.length; j++) {
                const td = document.createElement('td');
                td.textContent = users[i][userKeys[j]];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
    }

}