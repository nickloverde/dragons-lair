const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) =>{
        //Destructure username, password, isAdmin
        const {username, password, isAdmin} = req.body
        
        //Always required to connect to db
        const db = req.app.get('db')

        //Check to see if username is already taken
        const result = await db.get_user([username])
        const existingUser = result[0]

        //What to do if the username is taken
        if(existingUser) {
            return res.status(409).send('Username taken')
        }

        //Salt password
       const salt= bcrypt.genSaltSync(10)

        //hash password
        const hash= bcrypt.hashSync(password, salt)

        //Order is important because it references sql; needs await to mount
        const registeredUser = await db.register_user([isAdmin, username, hash])

        const user = registeredUser[0]
        req.session.user = {isAdmin: user.is_admin, username: user.username, id: user.id}
        return res.status(200).send(req.session.user)

    },

    login: async (req, res) => {
        //destructure username, password from req.bdoy
        const {username, password} = req.body

        //Connect to db
        const foundUser = await req.app.get('db').
        
        //Access get_user from db to match body username
        get_user([username])
        const user = foundUser[0]

        //If user is falsy return error
        if(!user){
            return res.status(400).send('User not found. Please register as a new user before logging in')
        }

        //Compare password to stored hashed password
        const isAuthenticated = bcrypt.compareSync(password, user.hash)

        //If isAuthenticated is falsy return error
        if(!isAuthenticated){
            return res.status(403).send('Incorrect password')
        }

        req.session.user = {isAdmin: user.is_admin, id: user.id, username: user.username}
        return res.send(req.session.user)
    },
    logout: (req, res)=> {
        req.session.destroy();
        return res.sendStatus(200);
    }
    
}