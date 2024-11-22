## An example implementation of the Refugee Integration Loans Application using HOF

## Setup

### NPM Local Development Setup
```
nvm install 18.12.1
nvm use 18.12.1
yarn
brew install redis
brew services start redis
yarn start #OR yarn run start:dev
```
To use the mock notification service locally, set the NOTIFY_KEY environment variable to USE_MOCK:
```export NOTIFY_KEY=USE_MOCK```

To set the RIL logging level, set the LOG_LEVEL environment variable to either error, warn, or info:
```export LOG_LEVEL="info"```

To set the HOF logging level, set the LOG_LEVEL environment variable to either error, warn, or info:
```export LOG_LEVEL="warn"```

or for redis
```
docker run --name some-redis -d redis
```

### Docker
```
yarn && docker-compose build && docker-compose up
```

Then navigate to <http://localhost:8080/apply>
or to <http://localhost:8080/accept>

### Kubenetes
Defaults in ACP are:

            Requests - cpu: 50m, memory: 200Mi
            Limits - cpu: 400m, memory: 400Mi

### Acceptance Testing
You can run the following to run all acceptance tests. These use the `@feature` tag by default:
```
yarn run test:acceptance
```
You can also run this in browser mode slowed down for visibility when debugging:
```
yarn run test:acceptance_browser
```
Additionally, you can place your own tag (@<name>), e.g. @test, above a Feature or Scenario section to run just that feature or scenario:
```
  @test
  Scenario: Simple application - Mobile Only with new address
    Given I start the 'apply' application journey
```
And then you can run your tests using the `TAGS` environmental variable to use it:
```
TAGS=@test yarn run test:acceptance
```

### Pa11y CI Accessibility test runner

Pa11y CI is a CI-centric accessibility test runner, built using [Pa11y](https://github.com/pa11y/pa11y).

Pa11y CI runs accessibility tests against multiple URLs and reports on any issues. This used during automated testing of the application and can act as a gatekeeper to stop common WCAG a11y issues from making it to live.

```bash
yarn run test:_accessibility          // requires app to be running
```
### BRP Number Validations
BRP Numbers should contain 2 letters, followed by either an 'X' or a digit, and then 6 digits:

- for example, ZUX123456 or ZU1234567

### Anchore/Snyk image testing

When the Drone pipeline runs, Anchore will check if the Docker image has any security vulnerabilities. Anything raised can be downloaded via the Drone UI as a manifest detailing the dependencies needing investigation and either needs whitelisting or updating.   

Anything whitelisted should be added to this git repo where a check is carried out against it in Drone:
https://github.com/UKHomeOfficeForms/hof-cve-exceptions

### Local Snyk setup
For anything needing fixing, you can use Snyk on your local machine to debug vulnerability issues. They tend to align with what Anchore has raised and are more detailed in how to fix issues.
Just `export SNYK_TOKEN=<your_token>` in your `~/.bashrc` or bash_profile or before executing the following command:
```
yarn run test:snyk
```
This will run Snyk tests just against the code base. You can also run `snyk wizard` to assist with repo level fixes. This will also generate/update the `.snyk` policy which others in the project can reuse for focusing on new errors and ignoring previously audited issues.

### Dockerfile image scanning with Snyk & Anchore
However, the following creates a test Docker image from the repo and run Snyk and Anchore tests against the Docker image dependencies. This should help you debug any issues found with Anchore APK package issues as opposed to npm modules which might have security flaws:
```
./image_check.sh
```
<strong>You need to ensure you have snyk globally installed using npm `npm install snyk -g`, setup a SNYK_TOKEN for snyk authentication, and Docker for this to work.</strong>

This will create a Snyk report in your terminal for assessing vulnerabilities and will also create an Anchore report in this project's `anchore-reports` directory for your reference.

### Updating vulnerable dependencies
#### Docker Image APK
This should be as simple as extending what apk packages to upgrade to. The registry is already being updated in the Dockerfile, so if anything is raised by Anchore you just need to add the dependency to the following line in it:
```
apk add --upgrade gnutls <dependency1_to_update> <dependency2_to_update> etc etc...
```

#### NPM
One can use npm to update individual dependencies if they have been flagged due to security updates. These can be done like this:
```
yarn upgrade express@"<15.0.0"
```
In this example we have updated just the `express` npm package to the latest version before 15.0.0. So for instance, if it was set to `14.16.0` prior, this might update to the latest minor/patch fix version `14.17.1`. This is a safe way to get the latest minor/patch version before the next major/minor respectively to mitigate bringing in a breaking change.
Here is an example for updating a dev_dependency bringing in the latest patch fix for version `8.2.x`
```
yarn upgrade mocha@"<8.3.0" 
```
