const UserModel = require('./UserModel');
const fs = require('fs').promises; // Node's fs module with promise support


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
                    const userModel = new UserModel();
                    const { email, pass } = req.body;
                    userModel.createUser(res, email, pass);
                }
                else {
                    res.status(200).send({ success: false, message: "User registration failed." });
                }
                break;
            case '/check_session':
                if (method === 'GET') {
                    if (req.session.loggedIn === true) {
                        let userSessionData = {
                            userId: req.session.userId,
                            email: req.session.email,
                            role: req.session.role,
                            certification_level: req.session.certification_level,
                            is_certified: req.session.is_certified,
                            verified: req.session.verified,
                            role: req.session.role,
                            certification_level: req.session.certification_level,
                            birthday: req.session.birthday,
                            call_sign: req.session.call_sign,
                            
                            
                          };
                        res.status(200).send({ success: true, message: "Session is valid", user: userSessionData});
                    } 
                    else
                    {
                        res.status(200).send({ success: false, message: "Session is not valid" });
                    }   

                }
                break;
            case '/login':
                if (method === 'POST') {
                    const userModel = new UserModel();
                    const { email, pass } = req.body;
                    userModel.findUserByEmailAndPassword(req, res, email, pass);
                }
                break;
            case '/deleteUser':
                if ((method === 'POST') && (req.session.loggedIn === true) ) {
                    const userModel = new UserModel();
                    const { email, pass } = req.body;
                    userModel.deleteUser(res, email, pass);
                }
                break;
            case '/logout':
                console.log("logou out user");
                if (method === 'GET') {

                    req.session.destroy();
                    res.status(200).send({ success: true, message: "User logged out." });
                }
                break;
            case '/allUsers':
                if ((method === 'GET') && (req.session.loggedIn === true) ) {
                    const userModel = new UserModel();
                    userModel.getAllUsers(req,res);
                }
                break;
            case '/changePassword':
                if  ((method === 'POST') && (req.session.loggedIn === true) ) {
                    const userModel = new UserModel();
                    const { currentPassword, newPassword } = req.body;
                    userModel.changeUserPassword(req, res, currentPassword, newPassword);
                }
                break;



            default:
                // Handle other AJAX requests or default handler
                console.log('This is the default handler!'+urlPath+ method);
                

                break
        }
        return true;

    }
}

module.exports = Init;
