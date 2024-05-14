const axios = require('axios');
const cheerio = require('cheerio');
const fs = require("fs");
const pdfParse = require("pdf-parse");
const readline = require("readline");



async function alaior_captcha(userCode) {
    let respuesta;
    try {
        respuesta = await axios.get(userCode, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Host': 'www.carpetaciutadana.org',
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return true; // Always resolve promise for any status code
            }
            //validateStatus: (status) => { return true }
        });
        // process response here
        //console.log(respuesta.data);
        const cookieHeader = respuesta.headers['set-cookie'];
        //console.log(cookieHeader);

        const secondResponse = await axios.get(userCode, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
                'Host': 'www.carpetaciutadana.org',
            },
            maxRedirects: 1,
            validateStatus: function (status) {
                return true; // Always resolve promise for any status code
            }
        });
        //console.log(secondResponse.data);

        try {
            // Make a GET request to fetch the image
            const imageResponse = await axios.get("https://www.carpetaciutadana.org/alaior/captcha.ashx", {
                headers: {
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
                },
                responseType: 'stream' // Tell Axios to treat the response as a stream
            });

            // Pipe the image data to a file stream
            const writer = fs.createWriteStream('captcha.gif');
            imageResponse.data.pipe(writer);

            // Return a promise that resolves when the image is fully downloaded
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return cookieHeader;
        } catch (error) {
            console.error('Error downloading image:', error);
        }

    } catch (error) {
        console.error('Error trying to request:', error);
    }
}


async function alaior_pdf(userCode, destinationPath, captchaCode, cookieHeader) {
    console.log("start difficult request")
    //log captchaCode

    try {
        let respuestaFinal = await axios.post(userCode,
            {
                __EVENTTARGET: '',
                __EVENTARGUMENT: '',
                __VIEWSTATE: '/wEPDwUJMTM3NzQzNjM0D2QWAmYPZBYCAgMPZBY2AgEPDxYCHgRUZXh0BQVJbmljaWRkAgMPDxYCHwAFB0NhdGFsw6BkZAIFDw8WAh8ABQlDYXN0ZWxsw6BkZAIHDw8WAh8ABQ5UYW5jYXIgc2Vzc2nDs2RkAgsPFgIfAAWHATxpbWcgYWx0PSJBanVudGFtZW50IGRlIEFsYWlvciIgc3JjPSJodHRwczovL3d3dy5jYXJwZXRhY2l1dGFkYW5hLm9yZy93ZWIvV2ViRWRpdG9yL1BhZ2luZXMvSW1hZ2UvQ2FycGV0YUNpdXRhZGFuYS9JbWFDYXBBbGFpb3IucG5nIiAvPmQCDw8PFgIfAAUwQWNjZWRlaXggYSBjYWRhIHVuYSBkZSBsZXMgZW50aXRhdHMgZGVzIGQnYXF1w606ZGQCEQ8WBB4Lb25tb3VzZW92ZXIFIHRoaXMuc3JjPSdpbWFzL2dlbmVyYWwvY29uNC5wbmcnHgpvbm1vdXNlb3V0BSB0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2NvbjMucG5nJ2QCEw8WBB8BBSB0aGlzLnNyYz0naW1hcy9nZW5lcmFsL21hbzQucG5nJx8CBSB0aGlzLnNyYz0naW1hcy9nZW5lcmFsL21hbzMucG5nJ2QCFQ8WBB8BBSJ0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2NpdXRhNC5wbmcnHwIFInRoaXMuc3JjPSdpbWFzL2dlbmVyYWwvY2l1dGEzLnBuZydkAhcPFgQfAQUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9hbGE0LnBuZycfAgUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9hbGEzLnBuZydkAhkPFgQfAQUidGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9tZXJjYTQucG5nJx8CBSJ0aGlzLnNyYz0naW1hcy9nZW5lcmFsL21lcmNhMy5wbmcnZAIbDxYEHwEFIXRoaXMuc3JjPSdpbWFzL2dlbmVyYWwvbGx1aTQucG5nJx8CBSF0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2xsdWkzLnBuZydkAh0PFgQfAQUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9taWc0LnBuZycfAgUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9taWczLnBuZydkAh8PFgQfAQUidGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9jYXN0ZTQucG5nJx8CBSJ0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2Nhc3RlMy5wbmcnZAIhDxYEHwEFInRoaXMuc3JjPSdpbWFzL2dlbmVyYWwvZmVycmU0LnBuZycfAgUidGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9mZXJyZTMucG5nJ2QCJQ8WBB8BBSN0aGlzLnNyYz0naW1hcy9nZW5lcmFsL3J1c3RpYzQucG5nJx8CBSN0aGlzLnNyYz0naW1hcy9nZW5lcmFsL3J1c3RpYzMucG5nJ2QCJw8WBB8BBSN0aGlzLnNyYz0naW1hcy9nZW5lcmFsL3Jlc2lkdTQucG5nJx8CBSN0aGlzLnNyYz0naW1hcy9nZW5lcmFsL3Jlc2lkdTMucG5nJ2QCKQ8WBB8BBSB0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2NzbTQucG5nJx8CBSB0aGlzLnNyYz0naW1hcy9nZW5lcmFsL2NzbTMucG5nJ2QCKw8WBB8BBSJ0aGlzLnNyYz0naW1hcy9nZW5lcmFsL3NpbG1lNC5wbmcnHwIFInRoaXMuc3JjPSdpbWFzL2dlbmVyYWwvc2lsbWUzLnBuZydkAi0PFgQfAQUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9pbWU0LnBuZycfAgUgdGhpcy5zcmM9J2ltYXMvZ2VuZXJhbC9pbWUzLnBuZydkAjMPDxYCHwAFE0FqdW50YW1lbnQgZCdBbGFpb3JkZAI1D2QWAgIbDw8WAh4HVmlzaWJsZWdkFgICAQ8PFgIfAAUeVGV4dGUgZGUgdmFsaWRhY2nDsyBpbmNvcnJlY3RlZGQCOQ8WAh8ABbUGPGJyLz48YnIvPkNvbXVuaWNhY2nDsyBkJ2luY2lkw6huY2llczogU2kgZHVyYW50IGxhIHRyYW1pdGFjacOzIGRlIGxhIHZvc3RyYSBzb2zCt2xpY2l0dWQgZXMgcHJvZHVlaXggYWxndW5hIGluY2lkw6huY2lhIG8gYWxndW4gZXJyb3IgcXVlIGltcGVkZWl4IHF1ZSBzJ2VudmnDryBjb3JyZWN0YW1lbnQsIHJldmlzZXUgcHJpbWVyIGxhIHNlY2Npw7MgPGEgaHJlZj0naHR0cHM6Ly93d3cuY2FycGV0YWNpdXRhZGFuYS5vcmcvd2ViL3B1YmxpY2FjaW9ucy9wdWJsaWNhY2lvbnMuYXNweD90aXBvPUZBUSZDb249Q29uZXhpb24wMDEnIHRhcmdldD0nX2JsYW5rJz5QcmVndW50ZXMgRnJlccO8ZW50cyAoRkFRKTwvYT4uIFNpIGNvbnRpbnVldSBzZW5zZSBwb2RlciBmaW5hbGl0emFyIGwnZW52aWFtZW50IGFncmHDr20gcXVlIGVucyBobyBjb211bmlxdWV1IGEgbCdhZHJlw6dhIGluZm8uc2FjQGNpbWUuZXMgaSBlbnMgZXhwbGlxdWV1IGVsIHByb2JsZW1hIGFtYiBlbCBtw6B4aW0gZGV0YWxsIHBvc3NpYmxlLjwvYnI+PC9icj5BVEVOQ0nDkzogQSBwYXJ0aXIgZGUgZGlhIDEgZGUgZmVicmVyIGRlIDIwMTksIGphIG5vIGVzIHBvZHJhbiBzaWduYXIgbGVzIHBldGljaW9ucyB0ZWxlbcOgdGlxdWVzIGFtYiBvcmRpbmFkb3JzIGFtYiBzaXN0ZW1hIG9wZXJhdGl1IFdpbmRvd3MgWFAgaSBlcyBuZWNlc3NpdGEgdGVuaXIgaW5zdGFswrdsYWRhIGwnYXBsaWNhY2nDsyA8YSBocmVmPSdodHRwczovL2Zpcm1hZWxlY3Ryb25pY2EuZ29iLmVzL0hvbWUvRGVzY2FyZ2FzLmh0bWwnIHRhcmdldD0nX2JsYW5rJz5BVVRPRklSTUE8L2E+PC9icj48L2JyPiBkAjsPDxYCHwAFC0F2w61zIExlZ2FsZGQCPQ8PFgIfAAUOQWNjZXNzaWJpbGl0YXRkZAI/Dw8WAh4LTmF2aWdhdGVVcmwFmQFodHRwOi8vdmFsaWRhdG9yLnczLm9yZy9jaGVjaz92ZXJib3NlPTEmdXJpPWh0dHBzOi8vd3d3LmNhcnBldGFjaXV0YWRhbmEub3JnL2FsYWlvci92YWxpZGFyZG9jLmFzcHg/SUQ9RVMtMDcwMDItMjAyMy1kNDgxNmU3MS03Y2M3LTQzZWEtODE0NS02MmY1YjhlODY0NzNkZAJBDw8WAh8EBbYBaHR0cDovL2ppZ3Nhdy53My5vcmcvY3NzLXZhbGlkYXRvci92YWxpZGF0b3I/cHJvZmlsZT1jc3MyMSZ3YXJuaW5nPTAmdXJpPWh0dHBzOi8vd3d3LmNhcnBldGFjaXV0YWRhbmEub3JnL2FsYWlvci92YWxpZGFyZG9jLmFzcHg/SUQ9RVMtMDcwMDItMjAyMy1kNDgxNmU3MS03Y2M3LTQzZWEtODE0NS02MmY1YjhlODY0NzNkZGQ6+FXejmwGKl38ORtAwGRBN8iAIDFgPBvYeCnwWSphPA==',
                __VIEWSTATEGENERATOR: '84952516',
                __EVENTVALIDATION: '/wEdAAlOgyujlc8nGvsJ+TGXU7PvyMsrpp3dZQJL06FzQr49yYFBZYDVNXrnB/9WmjDFKj7M0Ez3y2uyxeV3l0Pve+BBgdI8SZ08h6zN/3B+c0M9EqzqKW1hlJkEFP1L9q5TVPITossI3xKgjliBJ0c6PwKPUxMwjDfxd4KMzgWLpY0TvBAyuoi+RXoJYAH4XF/06Moi3Uunlypq6wKLcJWfNeTQ5Qi17z+ywwmM6cVHzBorWw==',
                ctl00$Content1$txtcodiValidacio: 'ES-07002-2023-d4816e71-7cc7-43ea-8145-62f5b8e86473',
                ctl00$Content1$txtCaptcha: captchaCode,
                ctl00$Content1$btValidar: 'Validar',
                ctl00$Content1$txtIgDocVerM: '',
                DXScript: '1_11,1_252,1_12,1_23,1_64,1_13,1_14,1_15,1_49',
                DXCss: '1_74,1_68,1_69,1_70,1_73,Stils/General.css,Stils/noie6.css,Stils/menu.css,Stils/media.css,Stils/tramits.css,stils/media2.css',
        },
            {
                headers: {
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.7,es-ES;q=0.3',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.carpetaciutadana.org/alaior/validardoc.aspx?ID=ES-07002-2023-d4816e71-7cc7-43ea-8145-62f5b8e86473',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': 4615,
                    'Origin': 'https://www.carpetaciutadana.org',
                    'DNT': 1,
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': 1,
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'TE': 'trailers',
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return true; // Always resolve promise for any status code
                }
        }
        );
        //console.log(respuestaFinal.data);



        const $ = cheerio.load(respuestaFinal.data);

        const href = "https://www.carpetaciutadana.org/alaior/" + $('#ctl00_Content1_lnkDescarregar').attr('href');
        //console.log("el enlace es " + href);



        //PDF download
        const pdfResponse = await axios.get(href, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0',
            },
            responseType: 'stream',
        });

        // Pipe the response stream to a file
        const writer = fs.createWriteStream(destinationPath);
        pdfResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                //console.log('PDF downloaded successfully.');
                resolve();
            });

            writer.on('error', err => {
                console.error('Error downloading PDF:', err);
                reject(err);
            });
        });



    }
    catch (error) {
        console.error('Error trying to request:', error);
    }
}






async function alaior_parse(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        //console.log(pdfData.text);

        const lines = pdfData.text.split('\n');
        const name = lines[18].match(/Que(.*?),/)[1].trimStart();
        const id = lines[18].match(/conDNInúm\.(.*?)G/)[1].trimStart();
        const date = lines[27].split(',')[1].trim().trimStart();
        //console.log("Name: ", name, "Date: ", date, "Id: ", id);


        // Return the extracted name, date, and ID
        return { name, date, id };
    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}



async function main(pdfUrl){
    const destinationPath = 'downloaded_file_alaior.pdf'; // Path to save the downloaded PDF

    // Download the PDF
    try {
        const cookieHeader = await alaior_captcha(pdfUrl);

        //await user input to solve captcha, request user input now
        const readline = require('node:readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const question = (query) => new Promise((resolve) => rl.question(query, resolve));  // Promisify rl.question to make it awaitable
        const captchaCode = await question("What's the captcha code???? ");  // Ask for user input
        rl.close();  // Close readline interface

        await alaior_pdf(pdfUrl, destinationPath, captchaCode, cookieHeader);


        // Parse the downloaded PDF
        const { name, date, id } = await alaior_parse(destinationPath);
        return { name, date, id };

    } catch (error) {
        console.error('Error downloading or parsing PDF:', error);
    }

}

//main();

module.exports = {alaior_captcha, alaior_pdf, alaior_parse}