const UserModel = require('./UserModel'); 

class Init {
    constructor(req, res) {
        // Use req and res as needed
        this.routeRequest(req, res);
    }


    routeRequest(req, res) {
        const urlPath = req.path;
        const method = req.method;

        // Check if the request is POST to /ajax/register
        switch (urlPath) {
            case '/register':
                if (method === 'POST') {
                    const userModel=new UserModel();
                    const { email, pass } = req.body;
        
                    userModel.createUser(email, pass);
                }
                break;
            case '/login':  
                if (method === 'POST') {
                    const userModel=new UserModel();
                    const { email, pass } = req.body;
        
                    userModel.findUserByEmailAndPassword(email, pass);
                }
                break;

            default:
                // Handle other AJAX requests or default handler
                console.log('This is the default handler!');
        }

    }
}

module.exports = Init;
