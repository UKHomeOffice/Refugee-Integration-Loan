
const moment = require('moment');

describe('validation checks of the accept journey', () => {
  let testApp;
  let passStep;
  let initSession;
  let getUrl;
  let parseHtml;

  const SUBAPP = 'accept';
  let now;

  before(() => {
    testApp = getSupertestApp(SUBAPP);
    passStep = testApp.passStep;
    initSession = testApp.initSession;
    getUrl = testApp.getUrl;
    parseHtml = testApp.parseHtml;
  });

  beforeEach(() => {
    now = moment();
  });

  describe('Reference Number Validations', () => {
    it('does not pass the Reference Number page if nothing entered', async () => {
      const URI = '/reference-number';
      await initSession(URI);
      await passStep(URI, {});

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Enter your loan reference number in the correct format/);
    });

    it('does not pass the Reference Number page if the loan reference field contains a letter', async () => {
      const URI = '/reference-number';
      await initSession(URI);
      await passStep(URI, {
        loanReference: '1234a'
      });
      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Your loan reference number must be a number/);
    });
    it('does not pass the Reference Number page if the loan reference field contains 4 numbers', async () => {
      const URI = '/reference-number';
      await initSession(URI);
      await passStep(URI, {
        loanReference: '1234'
      });
      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Your loan reference number must be five digits/);
    });
    it('does not pass the Reference Number page if the loan reference field contains 6 numbers', async () => {
      const URI = '/reference-number';
      await initSession(URI);
      await passStep(URI, {
        loanReference: '123456'
      });
      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Your loan reference number must be five digits/);
    });
  });

  describe('BRP Validations', () => {
    it('does not pass the your details page if name and DOB are not entered', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {});

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Enter your full name/);
      expect(validationSummary.html())
        .to.match(/Enter your date of birth in the correct format; for example, 31 3 1980/);
    });

    it('does not pass the your details page if DOB younger than 18 years old', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {
        name: 'Ron Johnson',
        dateOfBirth: now.subtract(18, 'years').add(1, 'days').format('YYYY-MM-DD')
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Enter a valid date of birth. You must be over 18 to accept/);
    });

    it('does pass the your details page if DOB is 18 years old or older', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {
        name: 'Ron Johnson',
        dateOfBirth: now.subtract(18, 'years').format('YYYY-MM-DD')
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.false;
    });

    it('does not pass the your details page if DOB earlier than 1900-01-01', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {
        name: 'Ron Johnson',
        dateOfBirth: '1900-01-01'
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Enter a date after 1 1 1900/);
    });

    it('does not pass the BRP page if DOB is in the future', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {
        name: 'Ron Johnson',
        dateOfBirth: now.add(1, 'days').format('YYYY-MM-DD')
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.match(/Enter a date that is in the past/);
    });

    it('does pass the your details page if DOB later than 1900-01-02', async () => {
      const URI = '/your-details';
      await initSession(URI);
      await passStep(URI, {
        name: 'Ron Johnson',
        dateOfBirth: '1900-01-02'
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.false;
    });
  });

  describe('Contact Validations', () => {
    it('does not pass the Contact page if nothing entered', async () => {
      const URI = '/contact';
      await initSession(URI);
      await passStep(URI, {});

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.contain('Select how we can contact you');
    });

    it('does not pass the Contact page if email and phone selected but not entered', async () => {
      const URI = '/contact';
      await initSession(URI);
      await passStep(URI, {
        contactTypes: [
          'email',
          'phone'
        ]
      });

      const res = await getUrl(URI);
      const docu = await parseHtml(res);
      const validationSummary = docu.find('.validation-summary');

      expect(validationSummary.length === 1).to.be.true;
      expect(validationSummary.html())
        .to.contain('Enter your email address in the correct format');
      expect(validationSummary.html())
        .to.contain('Enter your phone number in the correct format');
    });
  });
});
