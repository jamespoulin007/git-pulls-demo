const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport')
const Email = require('email-templates');
const path = require('path');

class Nodemailer {
  constructor(data, to, from, subject, auth) {
    this.data = data;
    this.to = to;
    this.from = from;
    this.subject = subject;
    this.AUTH = auth;
  }

  newTransport() {
    return nodemailer.createTransport(mailgunTransport(this.AUTH));
  }

  async send(template) {
    const Template = path.join(__dirname, './emailTemplates', `${template}`);
    const emailTemplate = new Email({ views: { root: Template } });
    const locals = {
      data: this.data,
    };

    const html = await emailTemplate.render(template, locals);
    
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: this.subject,
      html,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendMail() {
    await this.send('welcome');
  }
}

module.exports = Nodemailer;
