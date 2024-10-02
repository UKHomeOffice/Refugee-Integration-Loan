
const UploadPdfShared = require('../../common/behaviours/upload-pdf-base');

module.exports = superclass => class extends superclass {
  async successHandler(req, res, next) {
    try {
      const uploadPdfShared = new UploadPdfShared({
        app: 'accept',
        component: 'acceptance',
        sendReceipt: true,
        sortSections: false,
        notifyPersonalisations: {
          'loan reference': req.sessionModel.get('loanReference')
        }
      });

      await uploadPdfShared.send(req, res, super.locals(req, res));

      req.log('info', 'ril.form.accept.submit_form.successful');
      return super.successHandler(req, res, next);
    } catch (err) {
      console.log('********************* SUBMIT ERROR ', err);
      req.log('error', 'ril.form.accept.submit_form.error', err.message || err);
      return next(err);
    }
  }
};
