const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");





const { fromPath } = require('pdf2pic');
const { createWorker } = require('tesseract.js');



function convertTextDateToDDMMYYYY(textDate) {
    // Define month names mapping
    const monthNames = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04', 'mayo': '05',
        'junio': '06', 'julio': '07', 'agosto': '08', 'septiembre': '09', 'octubre': '10',
        'noviembre': '11', 'diciembre': '12'
    };

    // Extract day, month, and year using regular expression
    const [, day, monthName, year] = textDate.match(/(\d{1,2}) de (\w+) de (\d{4})/);

    // Get numerical representation of the month
    const month = monthNames[monthName.toLowerCase()];

    // Format the date as DD/MM/YYYY
    const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;

    return formattedDate;
}


async function main2(){
    // Configure pdf2pic
    const options = {
        density: 700,           // output pixels per inch
        saveFilename: "output", // output file name without extension
        savePath: "./",         // output path
        format: "png",          // output format
        width: 2480,            // output width
        height: 3508,           // output height (A4 size)
        page: 1                 // page number
    };

    // Convert PDF to PNG
    const converter = fromPath('src/components/downloaded_file2.pdf', options);


    //converter(1).then(async (resolve) => {
        const resolve = await converter(1);
        console.log("PDF conversion successful");

        // OCR setup
        const worker = await createWorker("eng")
        //https://stackoverflow.com/questions/76538019/typeerror-worker-load-is-not-a-function

        // Perform OCR on the PNG image
        //console.log(resolve);
        const { data: { text } } = await worker.recognize(resolve.path);
        //log text extracted from pdf
        //console.log("Extracted Text:", text);
        // Terminate the worker
        await worker.terminate();

        const lines = text.split('\n');
        //console.log(lines[7]);
        //console.log(lines[8]);
        //console.log(lines[18]);


        const regex = /~~\s*(.*)$/;

        const matchName = lines[7].match(regex);
        const matchId = lines[8].match(regex);

        const name = matchName ? matchName[1] : null;
        const id = matchId ? matchId[1] : null;
        const date = convertTextDateToDDMMYYYY(lines[18])

        //console.log(name);
        //console.log(id);
        //console.log(date);

        return { name, id, date };

}





















































async function do_request(userCode, destinationPath) {
    let respuesta;
    try {
        respuesta = await axios.get(userCode, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/124.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return true; // Always resolve promise for any status code
            }
            //validateStatus: (status) => { return true }
        });
        // process response here
        await console.log(respuesta.data);
        const cookieHeader = respuesta.headers['set-cookie']
        //console.log("AAAAAAAAA");
        //console.log(cookieHeader);

        const secondResponse = await axios.get(userCode, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return true; // Always resolve promise for any status code
            }
        });

        //console.log(secondResponse.data);

        const $ = cheerio.load(secondResponse.data);

        const link = $('a').filter((index, element) => {
            // Use a regular expression to match the text with flexible whitespace
            const regex = /^\s*Descargar una copia\s*$/;
            return regex.test($(element).text().trim());   //the <a> has trailing and leading whitespace
        }).first();

        // Extract the href attribute from the selected link
        const href = link.attr('href');

        console.log(href);
        const finalUrl = "https://santjoandelabritja.sedelectronica.es"+href.substring(2);
        console.log(finalUrl);




        axios.get(finalUrl, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Host': 'santjoandelabritja.sedelectronica.es',
            },
            responseType: 'stream',
            }
            )
            .then(response => {
                // Pipe the response stream to a file
                const writer = fs.createWriteStream(destinationPath);
                response.data.pipe(writer);

                writer.on('finish', () => {
                    //console.log('PDF download request success.');
                });

                writer.on('error', err => {
                    console.error('Error downloading PDF:', err);
                });
            })
            .catch(error => {
                console.error('Error fetching PDF:', error);
            });



    } catch (error) {
        console.error('Error trying to request:', error);
    }
    console.log("AAAAA");
    //console.log(respuesta);
}



async function main(pdfUrl){
    console.log("pdfUrl: "+pdfUrl);
    //add .0 at the end of the url
    //pdfUrl = pdfUrl + ".0";
    const destinationPath = 'downloaded_file2.pdf'; // Path to save the downloaded PDF

    // Download the PDF
    try {
        await do_request(pdfUrl, destinationPath);
        //console.log('PDF downloaded successfully.');


        // Parse the downloaded PDF
        //save the 3 values given back by PDFI()
        const { name, id, date } = await main2();
        //console.log("Name: ", name, "Date: ", date, "Id: ", id);
        return {name, date, id};



        //await parsePDF(destinationPath);
    } catch (error) {
        console.error('Error downloading or parsing PDF:', error);
    }

}

//main('https://santjoandelabritja.sedelectronica.es/doc/66MYS4MRRPHZFPQ3EL2PL54WD.0');

module.exports = main;