# Yunojuno Conversations test

At YunoJuno we have a conversations application which enables freelancers and employers to talk to each other, whether that be  about a brief, a contract or a catch up. It all goes through conversations.

The platform backend runs on Django (which isn’t required for this test). The application talks to an ajax endpoint and returns HTML which we replace the contents of the conversation with (this has been replaced with a localStorage solution to negate the need for endpoints).

A conversation thread is made of many messages. Each message contains the message (obviously), possibly an attachment and the date/time it was sent. 

In practice, the form is also replaced, which with it brings validation from the server. However as we are using localStorage the form isn't replaced and instead is only emptied.

What you will find when you checkout the source is an isolated piece of functionality from our platform.

On the platform, conversations take place with multiple parties. In this scenario there is only one participant. You. 

Your browser will also need to support localStorage.

As with most modern front-end systems we require Node to be installed.

## Sources
In the `yunojuno-conversations` directory you will see a package.json, run `npm install` from this directory to install the required packages.

## Tooling
You will also need Gulp, which if you haven’t already needs to be installed via `npm install -g gulp-cli`.

We use karma test-runner and the jasmine test framework, you will find a starter test in `js/tests/`

To compile the conversations component into the `dist` folder run `gulp scripts`

## Running the tests
To run the tests run `gulp karma`
There is also `gulp karma_watch` which will watch for your tests being updated and run karma (it is a little faster).

### Test coverage
Once you have run the above command once it will generate a coverage directory with your current coverage.
Use this to guide your tests. Or don’t, your choice.

## Issue

We would like you to do four things:

- Add validation to the form (and associated tests)
- Add clear button to remove attachment (and associated tests)
- Demonstrate the ability to add a javascript trigger to the CSS animation
- Add commentary to CSS go guide on best practice

Submission of the test will only be accepted via pull-request.