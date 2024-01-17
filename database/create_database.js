const fs = require('fs')
const { connectDatabase } = require('./database')

connectDatabase(null, (sqlConnection) => {
    const query = fs.readFileSync('database/sql/create_database.sql', 'utf8').toString()

    sqlConnection.query(query, (err) => {
        if (err) throw err

        console.log("Created database.")
        sqlConnection.end()
    })
})