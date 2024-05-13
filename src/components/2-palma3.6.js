const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');

// Function to download a PDF file
async function downloadPDF(url, destination) {
    let parts = url.split('?id=');
    let newUrl = "https://seuelectronica.palma.es/redosefront/mostrarDocumento.do?id=" + parts[1];
    console.log(newUrl);


    const writer = fs.createWriteStream(destination);

    const responseBase = await axios.post(url, {
        //
    });
    const cookie = responseBase.headers['set-cookie'];
    console.log(cookie);

    const response = await axios({
        method: 'GET',
        headers:
        {
            'Cookie': cookie
        },
        url: newUrl,
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Function to parse the downloaded PDF
async function parsePDF(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);


        const lines = pdfData.text.split('\n');
        const idLine = lines[39].trim();
        const dateLine = lines[40].trim();
        const nameLine = lines[43].trim();

        console.log(pdfData)
        console.log(idLine)
        console.log(dateLine)
        console.log(nameLine)
        return { idLine, dateLine, nameLine };

    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

// Example usage
async function do_request(argument) {
    const pdfUrl = argument; // URL of the PDF to download
    const destinationPath = 'example.pdf'; // Path to save the downloaded PDF

    // Download the PDF
    try {
        await downloadPDF(pdfUrl, destinationPath);
        await console.log('PDF downloaded successfully.');
        // Parse the downloaded PDF
        return await parsePDF(destinationPath);
    } catch (error) {
        console.error('Error downloading or parsing PDF:', error);
    }
}

//do_request('https://seuelectronica.palma.es/redosefront/init.do?id=8360501-6119AEB38E-504446-6573');

module.exports = do_request;