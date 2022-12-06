@feature @accept
Feature: Accept Application
  A user should be able to accept a valid application

  @smoke_test_email
  Scenario: Complete Application - Email Only with Real Test Submission
    Given I start the 'accept' application journey
    Then I should be on the 'reference-number' page showing 'What is your loan reference number?'
    Then I fill 'loanReference' with '12345'
    Then I click the 'Continue' button
    Then I should be on the 'your-details' page showing 'What are your details?'
    Then I fill 'name' with 'Peter Pennywhacker'
    Then I enter a date of birth for a 30 year old
    Then I click the 'Continue' button
    Then I should be on the 'contact' page showing 'How would you like us to contact you?'
    Then I select 'Email'
    Then I fill 'email' with 'sas-hof-test@digital.homeoffice.gov.uk'
    Then I click the 'Continue' button
    Then I should be on the 'confirm' page showing 'Accept your offer'
    Then I should see 'Loan reference: 12345' on the page
    Then I submit the application

  Scenario: Complete Application - Phone Only
    Given I start the 'accept' application journey
    Then I should be on the 'reference-number' page showing 'What is your loan reference number?'
    Then I fill 'loanReference' with '12345'
    Then I click the 'Continue' button
    Then I should be on the 'your-details' page showing 'What are your details?'
    Then I fill 'name' with 'Peter Pennywhacker'
    Then I enter a date of birth for a 30 year old
    Then I click the 'Continue' button
    Then I should be on the 'contact' page showing 'How would you like us to contact you?'
    Then I select 'Phone'
    Then I fill 'phone' with '07955555555'
