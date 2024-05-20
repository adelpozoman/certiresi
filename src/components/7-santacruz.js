const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");

const convertTextToDate = require("./convert-text-to-date");



async function do_request(userCode) {
    const destinationPath = "cer_santacruz.pdf"
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


        const pdfRequest = await axios.get(pdfLink, {  //axios get to obtain the pdf
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/124.0',
                'Cookie': cookieHeader,
            },
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(destinationPath);
        pdfRequest.data.pipe(writer);

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

        //parse PDF to obtain name, date and id
        const pdfParse = require('pdf-parse');

        const dataBuffer = fs.readFileSync(destinationPath);
        const pdfData = await pdfParse(dataBuffer);
        //console.log(pdfData.text);
        fs.unlink(destinationPath, err => { if (err) console.error(err); } );



        const lines = pdfData.text.split('\n');

        const name = lines[14].trimStart();
        const id = lines[16].trimStart();
        const dateString = lines[33].split(",")[1].trimStart();  //En SANTA CRUZ DE TENERIFE, 17 de febrero de 2019
        const date = convertTextToDate(dateString)

        console.log("Name: " + name + " Date: " + date + " Id: " + id);
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