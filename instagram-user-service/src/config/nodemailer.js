import nodemailer from 'nodemailer'
import * as handlebars from "handlebars"
import * as fs from "fs"
import * as path from "path"

const nodemailerInit = async (filePath, email, subject, OTP, text) => {
    const __dirname = path.resolve();
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        OTP: OTP ? OTP : "",
        email
    };
    const htmlToSend = template(replacements);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: "nghiadoan23102002@gmail.com",
            pass: "vbwy vjuj psqm mwia",
        },
        from: "nghiadoan23102002@gmail.com"
    });

    try {        
        const info = await transporter.sendMail({
            from: `"Instagram clone" <${email}>`, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            //text: text, // plain text body
            html: htmlToSend, // html body
            attachments: [
                {
                    filename: 'logo_email.png',
                    path: path.join(__dirname, '/src/utils/img/logo_email.png'),
                    cid: 'logo_email' // same cid as in the html img tag
                },
                {
                    filename: 'logo_email_1.png',
                    path: path.join(__dirname, '/src/utils/img/logo_email_1.png'),
                    cid: 'logo_email_1' // same cid as in the html img tag
                }
            ]
        });

        return info
    } catch (error) {
        return false
    }

}

export default nodemailerInit;
