const express = require('express')
const session = require('express-session')
const mysql = require('mysql2')
const { connectDatabase } = require('./database/database')

const databaseName = "nodepostapp"
const port = 3000

var sqlConnection = null

function getExistingUserQuery(escapedUsername) {
    return `select username, password from account where username = ${escapedUsername}`
}

function getAddUserQuery(escapedUsername, escapedPassword) {
    return `insert into account (username, password) values (${escapedUsername}, ${escapedPassword})`
}

function getIndex(req, res) {
    sqlConnection.query('select username from account', (err, usersResult) => {
        if (err) throw err

        res.render('index', { 'users': usersResult })
    })
}

function getLogin(req, res) {
    res.render('login', {
        body: {},
        errors: []
    })
}

function postLogin(req, res) {
    const errors = []

    const endForm = () => {
        if (errors.length == 0) {
            res.redirect('/')
        }
        else {
            res.render('login', {
                body: req.body,
                errors: errors
            });
        }
    }

    const escapedUsername = mysql.escape(req.body.username)
    const existingUserQuery = getExistingUserQuery(escapedUsername)

    sqlConnection.query(existingUserQuery, (err, existingUserResult) => {
        if (err) throw err

        if (existingUserResult.length == 0) {
            errors.push('An account with that name does not exist.')
        }
        else if (existingUserResult[0].password != req.body.password) {
            errors.push('The password is not correct for this account.')
        }

        endForm()
    })
}

function getRegister(req, res) {
    res.render('register', {
        body: {},
        errors: []
    })
}

function postRegister(req, res) {
    const errors = []

    const endForm = () => {
        if (errors.length == 0) {
            res.redirect('/')
        }
        else {
            res.render('register', {
                body: req.body,
                errors: errors
            });
        }
    }

    if (!req.body.username) {
        errors.push('Username required.')
    }

    if (!req.body.password) {
        errors.push('Password required.')
    }

    if (errors.length > 0) {
        endForm()
    }
    else {
        const escapedUsername = mysql.escape(req.body.username)
        const escapedPassword = mysql.escape(req.body.password)

        const existingUserQuery = getExistingUserQuery(escapedUsername)

        sqlConnection.query(existingUserQuery, (err, existingUserResult) => {
            if (err) throw err

            if (existingUserResult.length > 0) {
                errors.push('An account with that name already exists.')

                endForm()
            }
            else {
                const addUserQuery = getAddUserQuery(escapedUsername, escapedPassword)

                sqlConnection.query(addUserQuery, (err) => {
                    if (err) throw err

                    endForm()
                })
            }
        })
    }
}

function getUser(req, res) {
    res.render('user', {
        username: req.params.username
    })
}

function startApp() {
    const expressApp = express()

    expressApp.use(express.json())
    expressApp.use(express.urlencoded({ extended: true }))

    expressApp.set('view engine', 'ejs')

    expressApp.set('trust proxy', 1)
    expressApp.use(session({
        secret: 'abc',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }))

    expressApp.get('/', getIndex)

    expressApp.get('/login', getLogin)
    expressApp.post('/login', postLogin)

    expressApp.get('/register', getRegister)
    expressApp.post('/register', postRegister)

    expressApp.get('/user/:username', getUser)

    expressApp.listen(port, () => {
        console.log(`Hosting on port ${port}.`)
    })
}

connectDatabase(databaseName, (newSqlConnection) => {
    sqlConnection = newSqlConnection

    startApp()
})