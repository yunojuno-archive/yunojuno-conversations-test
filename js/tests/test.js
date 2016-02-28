// Put our global namespace on the global level.
window.YJ = {};
// and jQuery
window.$ = require('../test_libs/jquery.js');

var Conversations = require('../components/Conversations.js');

// Manually mock out the attachment support detection.
YJ.canUseAjaxFileUploads = function () {
    return true;
};

describe('User loads the page', function() {
	var conversation;
	beforeAll(function() {
		conversation = new Conversations.constructor();
	});

	it('loads the conversation component', function() {
		// Conversations.constructor returns an instance of ConversationController
		expect(conversation instanceof Conversations.ConversationController).toBe(true);
	});
});