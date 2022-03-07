const path = require('path')
const express = require('express')

const app = express()

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')


// Setup handlebars engine and views location
// app.set('view engine', 'hbs')
app.set('views', viewsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// route the request
app.get('', (req, res) => {
    res.send('E-commerce')
})

app.listen(3000, () => {
    console.log('Server is up on port 3000')
})
