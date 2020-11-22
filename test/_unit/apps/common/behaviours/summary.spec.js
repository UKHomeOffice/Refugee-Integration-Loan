'use strict';

const request = require('../../../../helpers/request');
const response = require('../../../../helpers/response');
const SummaryBehaviour = require('../../../../../apps/common/behaviours/summary');
const mockTranslations = require('./translations/en/default');
const Model = require('hof-model');
const moment = require('moment');

describe('summary behaviour', () => {
  class Base {
  }

  let behaviour;
  let Behaviour;
  let req;
  let res;
  let lastResult;
  let superLocalsStub;
  let translateMock;

  beforeEach(() => {
    req = request();
    res = response();

    translateMock = sinon.stub();
    translateMock.callsFake(itemNames => {
      if (Array.isArray(itemNames)) {
        for (const index in itemNames) {
          const item = _.get(mockTranslations, itemNames[index]);
          if (item) {
            return item;
          }
        }
        return itemNames[0];
      }
      return _.get(mockTranslations, itemNames, itemNames);
    });
    req.translate = translateMock;

    superLocalsStub = sinon.stub();
    superLocalsStub.returns({ superlocals: 'superlocals' });
    Base.prototype.locals = superLocalsStub;

    req.sessionModel = new Model({});
    req.baseUrl = 'test';

    req.form.options = {
      fieldsConfig: {
        'hasOtherNames': { mixin: 'radio-group' }
      },
      sections: {
        'pdf-applicant-details': [
          'brpNumber',
          {
            field: 'dateOfBirth',
            parse: d => d && moment(d).format(config.PRETTY_DATE_FORMAT)
          }
        ],
        'has-other-names': [
          {
            step: '/has-other-names',
            field: 'hasOtherNames',
            omitFromPdf: true
          },
        ],
        'other-names': [
          {
            step: '/other-names',
            field: 'otherNames',
            dependsOn: 'hasOtherNames',
            addElementSeparators: true
          },
        ]
      },
      steps: {
        '/pdf-applicant-details':
          { 'fields': ['brpNumber', 'dateOfBirth'] },
        '/has-other-names':
          { 'fields': ['hasOtherNames'] },
        '/other-names':
          { 'fields': ['otherNames'] }
      }
    };

    // applicant details
    req.sessionModel.set('brpNumber', '12345678');
    req.sessionModel.set('dateOfBirth', '1980-01-01');
    // other names radio button
    req.sessionModel.set('hasOtherNames', 'yes');
    // other names values
    req.sessionModel.set('otherNames', {
      aggregatedValues: [
        { itemTitle: 'Jane', fields: [{ field: 'firstName', value: 'Jane' }, { field: 'surname', value: 'Smith' }] },
        { itemTitle: 'Steve', fields: [{ field: 'firstName', value: 'Steve' }, { field: 'surname', value: 'Adams' }] }
      ]
    });


    Behaviour = SummaryBehaviour(Base);
    behaviour = new Behaviour(req.form.options);
  });

  describe('#getRowsForSummarySections', () => {
    beforeEach(() => {
      lastResult = behaviour.getRowsForSummarySections(req, res);
    });

    it('should trigger parser functions provided in sections.js', () => {
      lastResult.should.containSubset([
        {
          'section': 'Applicant’s details',
          'fields': [
            {
              'value': '1st January 1980'
            }
          ]
        }
      ]);
    });

    it('should supply translated changeLinkDescriptions', () => {
        lastResult.should.containSubset([
          {
            'fields': [
              {
                'changeLinkDescription': 'Your date of birth'
              },
            ]
          },
          {
            'fields': [
              {
                'changeLinkDescription': 'A first name'
              },
            ]
          },
          {
            'fields': [
              {
                'changeLinkDescription': 'A surname'
              }
            ]
          }
        ]);
      }
    );

    it('should translate the value for a radio button group', () => {
      lastResult.should.containSubset([{ 'fields': [{ 'value': 'Yes' }] }]);
    });

    it('should output the correct value for a yes/no radio button group', () => {
      lastResult.should.containSubset(
        [{
          'fields': [
            {
              'field': 'hasOtherNames',
              'label': 'Have you been known by any other names?',
              'step': '/has-other-names',
              'value': 'Yes',
            }
          ],
          'section': 'Have you been known by any other names?',
        }]
      );
    });

    it('expands aggregated fields into individual entries for summary display', () => {
      lastResult.should.containSubset(
        [{
          'section': 'Does the applicant have other names?',
          'fields': [
            {
              'label': 'First name',
              'value': 'Jane',
              'changeLink': 'test/other-names/edit/0/firstName?returnToSummary=true'
            },
            {
              'label': 'Surname',
              'value': 'Smith',
              'changeLink': 'test/other-names/edit/0/surname?returnToSummary=true'
            },
            {
              'label': 'First name',
              'value': 'Steve',
              'changeLink': 'test/other-names/edit/1/firstName?returnToSummary=true'
            }
          ]
        }]
      );
    });

    it('should add separators when specified', () => {
      lastResult.should.containSubset([
        {
          'fields': [
            {
              'label': '',
              'value': 'separator',
              'changeLink': '',
              'isSeparator': true
            }
          ]
        }
      ]);
    });
  });

  describe('#getStepForField', () => {
    it('returns the correct step', () => {
      behaviour.getStepForField('hasOtherNames', req.form.options.steps)
        .should.be.eql('/has-other-names');
    });
  });

  describe('#expandAggregatedFields', () => {
    it('returns expanded fields', () => {
      const inputObj =
        {
          'changeLinkDescription': 'Other name',
          'label': 'Full name',
          'value': {
            aggregatedValues: [
              {
                'itemTitle': 'John',
                'fields': [
                  {
                    'field': 'otherName',
                    'value': 'John',
                  }
                ],
                'index': 0
              },
              {
                'itemTitle': 'Jane',
                'fields': [
                  {
                    'field': 'otherName',
                    'value': 'Jane',
                  }
                ],
                'index': 1
              }
            ]
          },
          'step': '/other-names',
          'field': 'otherNames',
        };

      behaviour.expandAggregatedFields(inputObj, req)
        .should.be.eql([
        {
          'changeLinkDescription': 'Your other name',
          'label': 'Other name',
          'value': 'John',
          'changeLink': 'test/other-names/edit/0/otherName?returnToSummary=true',
          'field': 'otherName'
        },
        {
          'changeLinkDescription': 'Your other name',
          'label': 'Other name',
          'value': 'Jane',
          'changeLink': 'test/other-names/edit/1/otherName?returnToSummary=true',
          'field': 'otherName'
        }
      ]);
    });
  });

  describe('#getFieldData', () => {
    it('should return the correct result for simple fields', () => {
      behaviour.getFieldData('brpNumber', req).should.eql({
        'changeLinkDescription': 'Your Biometric residence permit (BRP) number',
        'label': 'Biometric residence permit (BRP) number',
        'value': '12345678',
        'step': '/pdf-applicant-details',
        'field': 'brpNumber'
      });
    });

    it('should return the correct result for aggregated fields', () => {
      behaviour.getFieldData('otherNames', req).should.eql(
        {
          'changeLinkDescription': 'Your other names',
          'field': 'otherNames',
          'label': 'Other names',
          'step': '/other-names',
          'value': {
            'aggregatedValues': [
              {
                'fields': [
                  {
                    'field': 'firstName',
                    'value': 'Jane'
                  },
                  {
                    'field': 'surname',
                    'value': 'Smith',
                  }
                ],
                'itemTitle': 'Jane'
              },
              {
                'fields': [
                  {
                    'field': 'firstName',
                    'value': 'Steve'
                  },
                  {
                    'field': 'surname',
                    'value': 'Adams'
                  }
                ],
                'itemTitle': 'Steve',
              }
            ]
          }
        }
      );
    });
  });
});
