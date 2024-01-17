const mysql = require('mysql2')
const fs = require('fs')

function connectDatabase(database, next) {
    const sqlConnection = mysql.createConnection({
        multipleStatements: true,
        host: "localhost",
        user: "root",
        password: "password",
        database: database
    })
    
    sqlConnection.connect(function(err) {
        if (err) throw err
    
        console.log("Connected to database.")
        next(sqlConnection)
    })
}

module.exports = { connectDatabase }