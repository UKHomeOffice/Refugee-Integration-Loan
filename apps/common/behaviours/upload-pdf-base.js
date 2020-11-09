'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const pdfPuppeteer = require('../../common/behaviours/pdf-puppeteer');
const uuid = require('uuid');
const config = require('../../../config');
const utilities = require('../../../lib/utilities');
const _ = require('lodash');
const NotifyClient = utilities.NotifyClient;

const tempLocation = path.resolve(config.pdf.tempLocation);

module.exports = class UploadPDFBase {
  constructor(behaviourConfig) {
    this.behaviourConfig = behaviourConfig;
  }

  async createPDF(req, html) {
    try {
      const applicationUuid = uuid.v1();
      const appName = this.behaviourConfig.app;
      const file = await pdfPuppeteer.generate(req, html, tempLocation, `${applicationUuid}.pdf`, appName);

      req.log('info', `ril.form.${appName}.submit_form.create_pdf.successful with uuid: ${applicationUuid}`);

      return file;
    } catch (err) {
      throw err;
    }
  }

  deleteFile(req, fileToDelete) {
    const appName = this.behaviourConfig.app;

    fs.unlink(fileToDelete, err => {
      if (err) {
        req.log('error', `ril.form.${appName}.submit_form.delete_pdf.error [${fileToDelete}]`, err.message || err);
      } else {
        req.log('info', `ril.form.${appName}.submit_form.delete_pdf.successful [${fileToDelete}]`);
      }
    });
  }

  readCss() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, '../../../public/css/app.css'), (err, data) => {
        return err ? reject(err) : resolve(data);
      });
    });
  }

  readHOLogo() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, '../../../assets/images/ho-logo.png'), (err, data) => {
        return err ? reject(err) : resolve(`data:image/png;base64,${data.toString('base64')}`);
      });
    });
  }

  readPdf(pdfFile) {
    return new Promise((resolve, reject) => {
      fs.readFile(pdfFile, (err, data) => err ? reject(err) : resolve(data));
    });
  }

  async renderHTML(req, res, locals) {
    if (this.behaviourConfig.sortSections) {
      locals = this.sortSections(locals);
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

  async sendEmailWithAttachment(req, pdfFile) {
    const personalisations = this.behaviourConfig.notifyPersonalisations;
    const appName = this.behaviourConfig.app;
    const appComponent = this.behaviourConfig.component;
    const caseworkerEmail = config.govukNotify.caseworkerEmail;
    const notifyKey = config.govukNotify.notifyApiKey;

    try {
      const notifyClient = new NotifyClient(notifyKey);

      if (notifyKey === 'USE-MOCK') {
        req.log('warn', '*** Notify API Key set to USE-MOCK. Ensure disabled in production! ***');
      }

      const data = await this.readPdf(pdfFile);

      await notifyClient.sendEmail(config.govukNotify.templateForm[appName], caseworkerEmail, {
        personalisation: Object.assign({}, personalisations, {
          'form id': notifyClient.prepareUpload(data)
        })
      });

      const trackedPageStartTime = Number(req.sessionModel.get('session.started.timestamp'));
      const timeSpentOnForm = utilities.secondsBetween(trackedPageStartTime, new Date());

      req.log('info', `ril.form.${appName}.submit_form.create_email_with_file_notify.successful`);
      req.log('info', `ril.${appComponent}.submission.duration=[${timeSpentOnForm}] seconds`);

      return await this.sendReceipt(req, notifyClient);
    } catch (err) {
      req.log('error', `ril.form.${appName}.submit_form.create_email_with_file_notify.error`, err.message || err);
      // **Important** - this is here to ensure no accidental logging of file data in production
      throw new Error(err.message || err);
    } finally {
      this.deleteFile(req, pdfFile);
    }
  }

  async sendReceipt(req, notifyClient) {
    if (!this.behaviourConfig.sendReceipt) {
      return;
    }

    let applicantEmail = req.sessionModel.get('email');
    let applicantPhone = req.sessionModel.get('phone');
    const appName = this.behaviourConfig.app;

    const emailReceiptTemplateId = this.getEmailReceiptTemplateId(appName);
    const textReceiptTemplateId = this.getTextReceiptTemplateId(appName);

    if (applicantEmail) {
      await this.notifyByEmail(req, notifyClient, emailReceiptTemplateId, applicantEmail, appName);
    }

    if (applicantPhone) {
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

  sortSections(locals) {
    const appName = this.behaviourConfig.app;

    const translations = require(`../../${appName}/translations/src/en/pages.json`);
    const sectionHeaders = Object.values(translations.confirm.sections);
    const orderedSections = _.map(sectionHeaders, obj => obj.header);
    let rows = locals.rows;

    rows = rows.slice().sort((a, b) => {
      return orderedSections.indexOf(a.section) - orderedSections.indexOf(b.section);
    });

    locals.rows = rows;
    return locals;
  }

};
