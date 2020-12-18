require('dotenv').config()
const express = require('express')
const session = require('express-session')
const massive = require('massive')
const authCtrl = require('./controllers/authController')
const treasureCtrl = require('./controllers/treasureController')
const auth = require('./middleware/authMiddleware')


const PORT = 4000

const { SESSION_SECRET, CONNECTION_STRING} = process.env

const app = express()

app.use(express.json())

app.use(
    session({
        resave: true,
        saveUninitialized: false,
        secret: SESSION_SECRET
    })
)
massive({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false},
    secet: SESSION_SECRET
}).then(db => {
    app.set('db', db)
    console.log('db connected')
})

//Endpoints authCtrl
app.post('/auth/register', authCtrl.register)
app.post('/auth/login', authCtrl.login)
app.get('/auth/logout', authCtrl.logout)

//Endpoints treasureCtrl
app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure)
app.get('/api/treasure/user', treasureCtrl.getUserTreasure, auth.usersOnly)
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure)
app.get('/api/treasure/all', auth.adminsOnly, auth.usersOnly, treasureCtrl.getAllTreasure)


app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`))