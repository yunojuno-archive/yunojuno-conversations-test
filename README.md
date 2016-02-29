# Yunojuno Conversations test

What you will find below is an isolated piece of functionality from our platform. This is how freelancers and employers communicate with each other.

The platform backend runs on Django (which isn’t required for this test). The application talks to an ajax endpoint and returns HTML which we replace the contents of the conversation with.

The form is also replaced, which with it brings validation from the server.

On the platform the conversations take place with multiple parties. In this scenario there is only one participant. You. Your browser will also need to support localStorage.

As with most modern front-end systems we require Node to be installed.

## Sources
In the `yunojuno-conversations` directory you will see a package.json, run `npm install` from this directory to install the required packages.

## Tooling
You will also need Gulp, which if you haven’t already needs to be installed via `npm install -g gulp-cli`.

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