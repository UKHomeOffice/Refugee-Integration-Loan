
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('../../../config');
const utilities = require('../../../lib/utilities');
const _ = require('lodash');
const NotifyClient = utilities.NotifyClient;
const libPhoneNumber = require('libphonenumber-js/max');
const PDFModel = require('hof').apis.pdfConverter;

module.exports = class UploadPDFBase {
  constructor(behaviourConfig) {
    this.behaviourConfig = behaviourConfig;
  }

  readCss() {
    return new Promise((resolve, reject) => {
      const cssFile = path.resolve(__dirname, '../../../public/css/app.css');
      fs.readFile(cssFile, (err, data) => err ? reject(err) : resolve(data));
    });
  }

  readHOLogo() {
    return new Promise((resolve, reject) => {
      const hoLogoFile = path.resolve(__dirname, '../../../assets/images/ho-logo.png');
      fs.readFile(hoLogoFile, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(`data:image/png;base64,${data.toString('base64')}`);
      });
    });
  }

  async renderHTML(req, res, locs) {
    let locals = locs;

    if (this.behaviourConfig.sortSections) {
      locals = this.sortSections(locs);
    }

    locals.title = `Refugee integration loan ${this.behaviourConfig.component}`;
    locals.dateTime = moment().format(config.dateTimeFormat);
    locals.values = req.sessionModel.toJSON();
    locals.htmlLang = res.locals.htmlLang || 'en';

    locals.css = await this.readCss(req);
    locals['ho-logo'] = await this.readHOLogo();
    return new Promise((resolve, reject) => {
      res.render('pdf.html', locals, (err, html) => err ? reject(err) : resolve(html));
    });
  }

  async sendEmailWithAttachment(req, pdfData) {
    console.log('*************** BEHAVIOUR CONFIG ', this.behaviourConfig);
    const personalisations = this.behaviourConfig.notifyPersonalisations;
    const appName = this.behaviourConfig.app;
    const appComponent = this.behaviourConfig.component;
    const caseworkerEmail = config.govukNotify.caseworkerEmail;
    const notifyKey = config.govukNotify.notifyApiKey;

    try {
      const notifyClient = new NotifyClient(notifyKey);

      if (notifyKey === 'USE_MOCK') {
        req.log('warn', '*** Notify API Key set to USE_MOCK. Ensure disabled in production! ***');
      }

      console.log(notifyClient.prepareUpload(pdfData, { confirmEmailBeforeDownload: false }));

      await notifyClient.sendEmail(config.govukNotify.templateForm[appName], caseworkerEmail, {
        personalisation: Object.assign({}, personalisations, {
          'form id': notifyClient.prepareUpload(pdfData, { confirmEmailBeforeDownload: false })
        })
      });

      const trackedPageStartTime = Number(req.sessionModel.get('session.started.timestamp'));
      const timeSpentOnForm = utilities.secondsBetween(trackedPageStartTime, new Date());

      req.log('info', `ril.form.${appName}.submit_form.create_email_with_file_notify.successful`);
      req.log('info', `ril.${appComponent}.submission.duration=[${timeSpentOnForm}] seconds`);

      return await this.sendReceipt(req, notifyClient);
    } catch (err) {
      console.log('********************* PDF ERROR ', err);
      const error = _.get(err, 'response.data.errors[0]', err.message || err);
      req.log('error', `ril.form.${appName}.submit_form.create_email_with_file_notify.error`, error);
      throw new Error(error);
    }
  }

  async sendReceipt(req, notifyClient) {
    if (!this.behaviourConfig.sendReceipt) {
      return;
    }

    const applicantEmail = req.sessionModel.get('email');
    const applicantPhone = req.sessionModel.get('phone');
    const parsedPhone = libPhoneNumber.parsePhoneNumberFromString(req.sessionModel.get('phone'), 'GB');
    const appName = this.behaviourConfig.app;

    const emailReceiptTemplateId = this.getEmailReceiptTemplateId(appName);
    const textReceiptTemplateId = this.getTextReceiptTemplateId(appName);

    if (applicantEmail) {
      await this.notifyByEmail(req, notifyClient, emailReceiptTemplateId, applicantEmail, appName);
    }

    if (applicantPhone && parsedPhone.getType() === 'MOBILE') {
      await this.notifyBySms(req, notifyClient, textReceiptTemplateId, applicantPhone, appName);
    }
  }

  async notifyBySms(req, notifyClient, textReceiptTemplateId, applicantPhone, appName) {
    try {
      await notifyClient.sendSms(textReceiptTemplateId, applicantPhone, {});
      req.log('info', `ril.form.${appName}.send_receipt.create_text_notify.successful`);
    } catch (err) {
      req.log('error', `ril.form.${appName}.send_receipt.create_text_notify.error`, err.message || err);
      throw err;
    }
  }

  async notifyByEmail(req, notifyClient, emailReceiptTemplateId, applicantEmail, appName) {
    try {
      await notifyClient.sendEmail(emailReceiptTemplateId, applicantEmail, {});
      req.log('info', `ril.form.${appName}.send_receipt.create_email_notify.successful`);
    } catch (err) {
      req.log('error', `ril.form.${appName}.send_receipt.create_email_notify.error`, err.message || err);
      throw err;
    }
  }

  getEmailReceiptTemplateId(appName) {
    if (appName === 'apply') {
      return config.govukNotify.templateEmailReceipt;
    } else if (appName === 'accept') {
      return config.govukNotify.templateAcceptEmailReceipt;
    }
    return '';
  }

  getTextReceiptTemplateId(appName) {
    if (appName === 'apply') {
      return config.govukNotify.templateTextReceipt;
    } else if (appName === 'accept') {
      return config.govukNotify.templateAcceptTextReceipt;
    }
    return '';
  }

  async send(req, res, locals) {
    // try{
    const html = await this.renderHTML(req, res, locals);

    const pdfModel = new PDFModel();
    pdfModel.set({ template: html });
    const pdfData = await pdfModel.save();
    console.log('*******************PDF DATA ', pdfData);

    return await this.sendEmailWithAttachment(req, pdfData);
  // } catch (err){
  //   req.log('error', `ERROR SAVING AND SENDING PDF DATA ${JSON.stringify(err, null, 2)}`);
  // }
  }

  sortSections(locals) {
    const appName = this.behaviourConfig.app;

    const translations = require(`../../${appName}/translations/src/en/pages.json`);
    const sectionHeaders = Object.values(translations.confirm.sections);
    const orderedSections = _.map(sectionHeaders, obj => obj.header);
    let rows = locals.rows;

    rows = rows.slice().sort((a, b) => orderedSections.indexOf(a.section) - orderedSections.indexOf(b.section));

    locals.rows = rows;
    return locals;
  }
};
