const express = require('express');
const path = require('path');

const app = express();

const PORT = process.argv[2];


if (process.argv.length !== 3){
    console.log("Usage: node app.js <port>");
    process.exit(1);
}


const express_server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
});

//to serve static files such as images, CSS files, and JavaScript files from a directory named public
//app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/qr-scanner.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr-scanner.min.js'), {
        headers: {
            'Content-Type': 'application/javascript' // Set the correct MIME type
        }
    });
});
app.get('/qr-scanner-worker.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr-scanner-worker.min.js'), {
        headers: {
            'Content-Type': 'application/javascript' // Set the correct MIME type
        }
    });
});




const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
    // Process the form data
    const city = req.body.city;
    const code = req.body.code;
    console.log(`City: ${city}, Code: ${code}`);

    // Perform any necessary server-side operations (e.g., authentication, data processing)

    // Send a response back to the client
    res.json({ message: 'Form submitted successfully!' });
});

