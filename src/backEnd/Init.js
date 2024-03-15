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

        
                    userModel.createUser(res, email, pass);



                }
                else {
                    res.status(200).send({ success: false, message: "User registration failed." });
                }
                break;
            case '/check_session':
                if (method === 'GET') {
                    
                }
                break;
            case '/login':  
                if (method === 'POST') {
                    const userModel=new UserModel();
                    const { email, pass } = req.body;
        
                    userModel.findUserByEmailAndPassword(res,email, pass);
                }
                break;
            case '/deleteUser':  
                if (method === 'POST') {
                    const userModel=new UserModel();
                    const { email, pass } = req.body;
        
                    userModel.deleteUser(res,email, pass);
                }
                break;

                
            default:
                // Handle other AJAX requests or default handler
                console.log('This is the default handler!');
                return { success: false, message: "Error deleting user." };

                return false
        }
        return true;

    }
}

module.exports = Init;
