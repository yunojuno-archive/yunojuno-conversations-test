/* global YJ */

// Utils etc
require('./core/Polyfills.js'); // Polyfills for older browsers.

// Components
var Conversation = require('./components/Conversations.js').constructor;

var targetPartials = document.getElementsByClassName('js-conversationPartial');

for(var i=0; i < targetPartials.length; i++) {
    new Conversation(targetPartials[i]);
}

module.exports = {};