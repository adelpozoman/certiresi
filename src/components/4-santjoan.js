const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");

const { fromPath } = require('pdf2pic');
const { createWorker } = require('tesseract.js');

const convertTextToDate = require("./convert-text-to-date");



async function parse_pdf(destinationPath){
    const filename = "cer_santjoan_png";
    // Configure pdf2pic
    const options = {
        density: 700,           // output pixels per inch
        saveFilename: filename, // output file name without extension
        savePath: "./",         // output path
        format: "png",          // output format
        width: 2480,            // output width
        height: 3508,           // output height (A4 size)
        page: 1                 // page number
    };

    const converter = fromPath(destinationPath, options);


    //converter(1).then(async (resolve) => {
        const resolve = await converter(1);
        fs.unlink(destinationPath, err => { if (err) console.error(err); });
        //console.log("PDF conversion successful");

        // OCR setup
        const worker = await createWorker("eng")
        //https://stackoverflow.com/questions/76538019/typeerror-worker-load-is-not-a-function

        // Perform OCR on the PNG image
        //console.log(resolve);
        const { data: { text } } = await worker.recognize(resolve.path);
        //log text extracted from pdf
        //console.log("Extracted Text:", text);
        await worker.terminate();  // Terminate the worker
        //unsync delete png file
        fs.unlink(resolve.path, err => { if (err) console.error(err); });

        const lines = text.split('\n');
        //console.log(lines[7]);
        //console.log(lines[8]);
        //console.log(lines[18]);


        const regex = /~~\s*(.*)$/;

        const matchName = lines[7].match(regex);
        const matchId = lines[8].match(regex);

        const name = matchName ? matchName[1] : null;
        const id = matchId ? matchId[1] : null;
        const date = convertTextToDate(lines[18])
        return { name, id, date };
}




async function request_pdf(webUrl, destinationPath) {
    try {
        const respuesta = await axios.get(webUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/123.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            maxRedirects: 0,
            validateStatus: () => { return true }
        });
        //console.log(respuesta.data);
        const cookieHeader = respuesta.headers['set-cookie']
        //console.log("Gotten cookie is: " + cookieHeader);

        const secondResponse = await axios.get(webUrl, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/123.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            maxRedirects: 0,
            validateStatus: () => { return true }
        });
        //console.log(secondResponse.data);

        const $ = cheerio.load(secondResponse.data);
        const link = $('a').filter((index, element) => {
            const regex = /^\s*Descargar una copia\s*$/;  // Use a regular expression to match the text with flexible whitespace
            return regex.test($(element).text().trim());   //the <a> has trailing and leading whitespace
        }).first();

        const href = link.attr('href');  // Extract the href attribute from the selected link
        const pdfUrl = "https://santjoandelabritja.sedelectronica.es"+href.substring(2);
        //console.log(href);
        //console.log(pdfUrl);


        const pdfResponse = await axios.get(pdfUrl, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/123.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            responseType: 'stream',
            });

        const writer = fs.createWriteStream(destinationPath);
        pdfResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                //console.log('PDF download request success.');
                resolve();
            });

            writer.on('error', err => {
                console.error('Error downloading PDF:', err);
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error trying to request data:', error);
    }
}



async function main(webUrl){
    //console.log("webUrl: "+webUrl);
    webUrl = webUrl + ".0";  //add .0 at the end of the url
    const destinationPath = 'cer_santjoan.pdf'; // Path to save the downloaded PDF

    try {
        await request_pdf(webUrl, destinationPath);
        //console.log('PDF downloaded successfully.');
        const { name, id, date } = await parse_pdf(destinationPath);  // Parse the downloaded PDF
        //console.log("Name: ", name, "Date: ", date, "Id: ", id);
        return {name, date, id};
    } catch (error) {
        console.error('Error downloading or parsing PDF:', error);
    }
}

//main('https://santjoandelabritja.sedelectronica.es/doc/66MYS4MRRPHZFPQ3EL2PL54WD');

module.exports = main;