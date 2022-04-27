const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
// const PDFKit = require('pdfkitjs');
// const pdf = require('pdf-creator-node');
// const axios = require('axios');
const FormData = require('form-data');

const checkFileExists = (filePath) => fs.existsSync(filePath);

const createFilePath = (filePath) => {
    console.log('===createFilePath==========>', filePath);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    // eslint-disable-next-line no-useless-return
    return filePath;
};
const deleteFileByPath = (filePath) => {
    // eslint-disable-next-line no-console
    console.log('Deleting file', filePath);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    // eslint-disable-next-line no-useless-return
    return;
};

const renderFile = async(path, params) => new Promise((resolve) => {
    ejs.renderFile(path, { tempdata: params }, (err, result) => {
        if (err) {
            console.log('renderFile===>', err);
        }
        resolve(result);
    });
});

const generatePdf = async(data, fileName, storePath = '') => new Promise((resolve) => {
    const options = {
        height: '11.25in',
        width: '8.5in',
        header: {
            height: '20mm',
        },
        footer: {
            height: '20mm',
        },
    };
    const storeFilePath = createFilePath(storePath);
    const templateName = `${fileName}.html`;
    const generation = {
        html: templateName,
    };
    const body = new FormData();
    body.append(templateName, data, { filename: templateName });
    body.append('generation', JSON.stringify(generation));
    const fileName1 = `${storeFilePath}${fileName}.pdf`;
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:8083';
    // (async() => {
    //     const response = await axios.post('http://localhost:5000/process', body, {
    //         headers: body.getHeaders(),
    //         responseType: 'stream',
    //     });
    //     await response.data.pipe(fs.createWriteStream('invoice.pdf'));
    // })();
    // console.log('========fileName1========>', fileName1);
    // const document = {
    //     html: fs.readFileSync(invoiceTemplatePath, 'utf8'),
    //     data: {
    //         tempdata: invoiceParams,
    //     },
    //     path: fileName1,
    //     type: '',
    // };
    // pdf.create(document, options)
    //     .then((res) => {
    //         console.log(res);
    //         resolve(res);
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

    // const pdf = new PDFKit('url', 'http://google.com');

    // pdf.toFile('google.pdf', (err, file) => {
    //     console.log(`File ${file} written`);
    // });

    // console.log('========data========>', data);
    // console.log('=====__dirname=======>', `${__dirname}/${storePath}`);
    // console.log('=====storePath=======>', storePath);
    // // return;
    // const storeFilePath = createFilePath(storePath);
    // const fileName1 = `${storeFilePath}${fileName}.pdf`;
    // console.log('========fileName1========>', fileName1);
    // console.log('========storeFilePath========>', storeFilePath);
    // const pdfGenerate = new pdfKit(dataType, '<h1>Hello</h1>');
    // pdfGenerate.toFile(`${fileName}.pdf`, (err, file) => {
    //     console.log(`File ${file} written`);
    //     if (err) {
    //         console.log(err);
    //     }
    //     console.log('========response========>', file);
    //     resolve(file);
    // });

    // return data;
    pdf.create(data, options).toFile(fileName1, (err, response) => {
        if (err) {
            console.log(err);
        }
        console.log('========response========>', response);
        resolve(response);
    });
});

module.exports = {
    checkFileExists,
    createFilePath,
    deleteFileByPath,
    renderFile,
    generatePdf,
};