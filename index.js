const express = require('express')
const mysql = require('mysql2')
const { connectDatabase } = require('./database/database')

const databaseName = "nodepostapp"
const port = 3000

function getExistingUserQuery(escapedUsername) {
    return `select username, password from account where username = ${escapedUsername}`
}

function getAddUserQuery(escapedUsername, escapedPassword) {
    return `insert into account (username, password) values (${escapedUsername}, ${escapedPassword})`
}

function startApp(sqlConnection) {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.set('view engine', 'ejs')

    app.use('/css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`))

    app.get('/', (req, res) => {
    res.render('index')
    })

    app.get('/login', (req, res) => {
        res.render('login', {
            body: {},
            errors: []
        })
    })

    app.post('/login', (req, res) => {
        const errors = []

        const endForm = () => {
            if (errors.length == 0) {
                console.log(req.body)
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
    })

    app.get('/register', (req, res) => {
        res.render('register', {
            body: {},
            errors: []
        })
    })

    app.post('/register', (req, res) => {
        const errors = []

        const endForm = () => {
            if (errors.length == 0) {
                console.log(req.body)
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
    })

    app.listen(port, () => {
        console.log(`Hosting on port ${port}.`)
    })
}

connectDatabase(databaseName, (sqlConnection) => {
    startApp(sqlConnection)
})