const axios = require('axios');
const cheerio = require('cheerio');


async function do_request(userCode) {
    try {
        const respuesta = await axios.post(userCode,
            {
            //unused
        });
        //console.log(respuesta.data);

        const $ = cheerio.load(respuesta.data);
        const name = $('#ctl00_ContentPlaceHolder2_LabelNombre');
        const date = $('#ctl00_ContentPlaceHolder2_LabelFecha');
        const id = $('#ctl00_ContentPlaceHolder2_LabelDNI');

        //console.log(name.text());
        //console.log(date.text());
        //console.log(id.text());

        //return name, date and id
        return {
            name: name.text(),
            date: date.text(),
            id: id.text()
        };
    } catch (error) {
        console.error('Error trying to request:', error);
    }
}


//do_request('https://www.santaeularia.com:4455/verifica_cert.aspx?id=80d85391e68fdc8b17c4045dd45f165e9d116431');


module.exports = do_request;