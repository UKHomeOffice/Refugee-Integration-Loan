'use strict';

const sections = require('../../../../../apps/apply/sections/summary-data-sections');
const pages = require('../../../../../apps/apply/translations/src/en/pages.json');
const fields = require('../../../../../apps/apply/fields/index');
const utilities = require('../../../../helpers/utilities');

const mappedSections = utilities.mapSections(sections);
const areOrderedEqual = utilities.areOrderedEqual;
const containsAll = utilities.containsAll;

describe('Apply PDF Data Sections', () => {

  // describe('Sections and Pages', () => { // todo: fix this
  //   it('should have sections and page translations that correlate', () => {
  //     const sectionsKeys = Object.keys(sections).sort();
  //     const pagesSectionsKeys = Object.keys(pages.confirm.sections).sort();
  //
  //     expect(_.isEqual(sectionsKeys, pagesSectionsKeys)).to.be.true;
  //   });
  // });

  describe('Section Primary Fields', () => {
    it('pdf-applicant-details', () => {
      const sectionFields = mappedSections['pdf-applicant-details'];
      const expectedFields = [
        'brpNumber',
        'niNumber',
        'fullName',
        'dateOfBirth',
        'homeOfficeReference'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('other-names', () => {
      const sectionFields = mappedSections['other-names'];
      const expectedFields = [
        'otherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-partner-details', () => {
      const sectionFields = mappedSections['pdf-partner-details'];
      const expectedFields = [
        'partnerBrpNumber',
        'partnerNiNumber',
        'partnerFullName',
        'partnerDateOfBirth'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('partner-other-names', () => {
      const sectionFields = mappedSections['partner-other-names'];
      const expectedFields = [
        'partnerOtherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-bank-account-details', () => {
      const sectionFields = mappedSections['pdf-bank-account-details'];
      const expectedFields = [
        'accountName',
        'sortCode',
        'accountNumber',
        'rollNumber'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-conviction-details', () => {
      const sectionFields = mappedSections['pdf-conviction-details'];
      const expectedFields = [
        'convicted',
        'detailsOfCrime',
        'convictedJoint',
        'detailsOfCrimeJoint'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-income', () => {
      const sectionFields = mappedSections['pdf-income'];
      const expectedFields = [
        'incomeTypes',
        'combinedIncomeTypes',
        'totalIncome'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-outgoings', () => {
      const sectionFields = mappedSections['pdf-outgoings'];

      const expectedFields = [
        'outgoingTypes',
        'totalOutgoings'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-savings', () => {
      const sectionFields = mappedSections['pdf-savings'];
      const expectedFields = [
        'savings',
        'savingsAmount',
        'combinedSavings',
        'combinedSavingsAmount'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-loan-details', () => {
      const sectionFields = mappedSections['pdf-loan-details'];
      const expectedFields = [
        'amount',
        'jointAmount',
        'purposeTypes',
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-address', () => {
      const sectionFields = mappedSections['pdf-address'];
      const expectedFields = [
        'building',
        'street',
        'townOrCity',
        'postcode'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-contact-details', () => {
      const sectionFields = mappedSections['pdf-contact-details'];
      const expectedFields = [
        'email',
        'phone'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('dependant-details', () => {
      const sectionFields = mappedSections['dependent-details'];
      const expectedFields = [
        'dependants'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('has-dependants', () => {
      const sectionFields = mappedSections['has-dependants'];
      const expectedFields = [
        'hasDependants'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('has-other-names', () => {
      const sectionFields = mappedSections['has-other-names'];
      const expectedFields = [
        'hasOtherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('other-names', () => {
      const sectionFields = mappedSections['other-names'];
      const expectedFields = [
        'otherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('partner=has-other-names', () => {
      const sectionFields = mappedSections['partner-has-other-names'];
      const expectedFields = [
        'partnerHasOtherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('partner-other-names', () => {
      const sectionFields = mappedSections['partner-other-names'];
      const expectedFields = [
        'partnerOtherNames'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-outcome', () => {
      const sectionFields = mappedSections['pdf-outcome'];
      const expectedFields = [
        'likelyToMove',
        'outcomeBuilding',
        'outcomeStreet',
        'outcomeTownOrCity',
        'outcomePostcode'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-help', () => {
      const sectionFields = mappedSections['pdf-help'];
      const expectedFields = [
        'hadHelp',
        'helpReasons',
        'helpFullName',
        'helpRelationship',
        'helpEmail',
        'helpPhone'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('pdf-other', () => {
      const sectionFields = mappedSections['pdf-other'];
      const expectedFields = [
        'previouslyApplied',
        'previouslyHadIntegrationLoan',
        'whoReceivedPreviousLoan',
        'partner',
        'joint'
      ];

      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });
  });

  describe('Section Derivations', () => {
    it('pdf-income totalIncome', () => {
      const fieldObj = sections['pdf-income'][2];
      const derivationFields = fieldObj.derivation.fromFields;
      const expectedFields = [
        'salaryAmount',
        'universalCreditAmount',
        'childBenefitAmount',
        'housingBenefitAmount',
        'otherIncomeAmount',
        'combinedSalaryAmount',
        'combinedUniversalCreditAmount',
        'combinedChildBenefitAmount',
        'combinedHousingBenefitAmount',
        'combinedOtherIncomeAmount'
      ];
      const result = areOrderedEqual(derivationFields, expectedFields);
      expect(fieldObj.field).to.eql('totalIncome');
      expect(result).to.be.true;
    });

    it('pdf-outgoings totalOutgoings', () => {
      const fieldObj = sections['pdf-outgoings'][1];
      const derivationFields = fieldObj.derivation.fromFields;
      const expectedFields = [
        'rentAmount',
        'householdBillsAmount',
        'foodToiletriesAndCleaningSuppliesAmount',
        'mobilePhoneAmount',
        'travelAmount',
        'clothingAndFootwearAmount',
        'universalCreditDeductionsAmount',
        'otherOutgoingAmount',
        'combinedRentAmount',
        'combinedHouseholdBillsAmount',
        'combinedFoodToiletriesAndCleaningSuppliesAmount',
        'combinedMobilePhoneAmount',
        'combinedTravelAmount',
        'combinedClothingAndFootwearAmount',
        'combinedUniversalCreditDeductionsAmount',
        'combinedOtherOutgoingAmount'
      ];
      const result = areOrderedEqual(derivationFields, expectedFields);
      expect(fieldObj.field).to.eql('totalOutgoings');
      expect(result).to.be.true;
    });
  });

  describe('Sections and Fields', () => {
    it('pdf-applicant-details', () => {
      mappedSections['pdf-applicant-details'].every(i => {
        const item = i.field || i;
        return Object.keys(fields).includes(item);
      });
    });

    // it('other-names', () => { // todo: fix
    //   expect(containsAll(
    //     Object.keys(fields),
    //     mappedSections['other-names'])
    //     ).to.be.true;
    // });

    it('pdf-partner-details', () => {
      mappedSections['pdf-partner-details'].every(i => {
        const item = i.field || i;
        return Object.keys(fields).includes(item);
      });
    });

    // it('partner-other-names', () => { // todo : fix
    //   expect(containsAll(
    //     Object.keys(fields),
    //     mappedSections['partner-other-names'])
    //   ).to.be.true;
    // });

    it('pdf-bank-account-details', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-bank-account-details'])
      ).to.be.true;
    });

    it('pdf-conviction-details', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-conviction-details'])
      ).to.be.true;
    });

    it('pdf-income', () => {
      mappedSections['pdf-income'].every(i => {
        if (typeof i === 'string') {
          return Object.keys(fields).includes(i);
        }
        return Object.keys(fields).includes(i.derivation.fromFields);
      });
    });

    it('pdf-outgoings', () => {
      mappedSections['pdf-outgoings'].every(i => {
        if (typeof i === 'string') {
          return Object.keys(fields).includes(i);
        }
        return Object.keys(fields).includes(i.derivation.fromFields);
      });
    });

    it('pdf-savings', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-savings'])
      ).to.be.true;
    });

    it('pdf-loan-details', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-loan-details'])
      ).to.be.true;
    });

    it('pdf-address', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-address'])
      ).to.be.true;
    });

    it('pdf-contact-details', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-contact-details'])
      ).to.be.true;
    });

    // it('dependant-details', () => { // todo: fix
    //   expect(containsAll(
    //     Object.keys(fields),
    //     mappedSections['dependant-details'])
    //   ).to.be.true;
    // });

    it('pdf-outcome', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-outcome'])
      ).to.be.true;
    });

    it('pdf-help', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-help'])
      ).to.be.true;
    });

    it('pdf-other', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections['pdf-other'])
      ).to.be.true;
    });
  });
});
