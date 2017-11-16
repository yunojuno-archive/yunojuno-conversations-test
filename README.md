# Johannes' notes

I've implemented all the features requested, tidied up some bits (for example I've attempted to standardize the use of jQuery selectors by assigning as properties on the view object, all selectors used more than once. Also, I've attempted to clean up the 'attach file' button, fI've made sure it's not clickable when it's opacity is set to 0. And also the cursor:pointer; state only covered half of the button so instead of overlaying the file input over the ancor tag, I added a label to the file input and made it visually respond/look like an ancor tag)

I'm quite happy with how the Component has turned out, but feel like the Unit test side of things went less well.

Unit testing: this is my first real look at Unit testing. I get the basics of it after this code test, it seems really nice - and useful! However, I made the mistake of deciding to leave the Unit testing until last, and after I'd made various changes to the Conversation component, trying to add tests and debugging for the new features proved a little difficult.

As far as CSS goes, I'm not sure I could advise you on much - I've not use the BEM methodolgy before, only read about it. I'm generally a much stronger JavaScript programmer and have always used SASS in the past.

I feel like this code test was somewhat mixed in results. It's cool to have had a chance to experiement with Karma and Jasmine, and I'll certainly be building unit tests in the future, from the ground up, for my next projects. It was also interesting to read through the JavaScript, I apprieciate the structure of the JS, the MVC pattern is nice.

Thanks for the opportunity, and I hope that the Unit test side of things hasn't let me down too much. I'd be happy to spend a week or two of my own time, deep diving into this side of things, before starting the contract, if that would be desirable.

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

The package works with node v6.6.0 (our current stack for the platform) but also works with the latest version v9.0.0.

## Tooling
You will also need Gulp, which if you haven’t already needs to be installed via `npm install -g gulp-cli`.

We use karma test-runner and the jasmine test framework, you will find a starter test in `js/tests/`

To compile the conversations component into the `dist` folder run `gulp scripts`

To compile the CSS into the `css` folder run `gulp css`

## Running the tests
The tests use the headless chrome browser, so you will need Google Chrome installed.
To run the tests run `gulp karma`
There is also `gulp karma_watch` which will watch for your tests being updated and run karma (it is a little faster).

### Test coverage
Once you have run the above command once it will generate a coverage directory with your current coverage.
Use this to guide your tests. Or don’t, your choice.

## Issue

We would like you to do four things:

- Add validation to the form (and associated tests)
- Add clear button to remove attachment (and associated tests)
- Demonstrate the ability to add a javascript trigger following the CSS animation (an alert or console.log() is enough)
- Add commentary to our Stylus (in `styls/`) to advise on best practices

Submission of the test will only be accepted via pull-request.
