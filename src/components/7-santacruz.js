const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");


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








async function do_request(userCode) {
    try {
        const baseUrl = "https://ovc.santacruzdetenerife.es/sta/CarpetaPublic/Public?APP_CODE=STA&PAGE_CODE=VALDOCS";
        const response = await axios.get(baseUrl,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/124.0',
                    //'Cookie': cookieHeader,
                }
            });

        const cookieHeader = response.headers['set-cookie']
        //console.log(cookieHeader);



        const payload = {
            aaxmlrequest: true,
            eventScreenId: 'VALDOCS',
            eventComponent: '',
            eventObject: '',
            eventAction: 'VERIFICAR',
            eventArguments: '',
            PAGE_CODE: 'VALDOCS',
            APP_CODE: 'STA',
            PAGE_COMPLETE: '',
            ROOTID: 1,
            HFC: 'HEADER#FOOTER',
            SESSION_REQUIRED: false,
            codigo: userCode,
        };


        const querystring = require('querystring');
        // Convert payload to x-www-form-urlencoded format
        const formData = querystring.stringify(payload);




        const response2 = await axios.post('https://ovc.santacruzdetenerife.es/sta/CarpetaPublic/submitAjax.aa',
            formData,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/124.0',
                    'Cookie': cookieHeader,
                    }
            }
        );

        //console.log(response2.data);


        //cheerio to obtain pdfLink class and obtain the href
        const $ = cheerio.load(response2.data);
        const pdfLink = "https://ovc.santacruzdetenerife.es" + $('.pdfLink').attr('href');
        //console.log(pdfLink);


        //axios get to obtain the pdf
        const pdfRequest = await axios.get(pdfLink, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/124.0',
                'Cookie': cookieHeader,
            },
            responseType: 'stream',
        });

        const writer = fs.createWriteStream("santacruz.pdf");
        pdfRequest.data.pipe(writer);

        writer.on('finish', () => {
            //console.log('PDF download request success.');
        });

        writer.on('error', err => {
            console.error('Error downloading PDF:', err);
        });

        //parse PDF to obtain name, date and id
        const pdfParse = require('pdf-parse');

        const dataBuffer = fs.readFileSync("santacruz.pdf");
        const pdfData = await pdfParse(dataBuffer);

        //console.log(pdfData.text);

        const lines = pdfData.text.split('\n');

        const name = lines[14].trimStart();
        const id = lines[16].trimStart();
        const dateString = lines[33].split(",")[1].trimStart();  //En SANTA CRUZ DE TENERIFE, 17 de febrero de 2019
        const date = convertTextDateToDDMMYYYY(dateString)

        //console.log("Name: " + name + " Date: " + date + " Id: " + id);

        return {
            name: name,
            date: date,
            id: id
        };

    } catch (error) {
        console.error('Error trying to request:', error);
    }
}

//do_request("12440533771117456152");

module.exports = do_request;