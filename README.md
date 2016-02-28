# Yunojuno Conversations test

What you will find below is an isolated piece of functionality from our platform. This is how freelancers and employers communicate with each other.

## Taking part

You will need NodeJS installed on your system. In addition to that 
## Sources
In the `yunojuno-conversations` directory you will see a package.json, run `npm install` from this directory to install the required packages.

## Tooling
You will also need Gulp, which if you haven’t already needs to be installed via `nam install -g gulp-cli`.

We use karma test-runner and the jasmine test framework, you will find a starter test in `js/tests/`

To compile the conversations component into the `dist` folder run `gulp scripts`

## Running the tests
To run the tests run `gulp test`

### Test coverage
Once you have ran the above command once it will generate a coverage directory with your current coverage.
Use this to guide your tests. Or don’t, your choice.

## Issue

We would like you to three things:

- Write tests for the code in `js/components/Conversations.js`.
- Add validation to the form
- Add clear button to remove attachment

Submission of the test will only be accepted via pull-request.