// Put our global namespace on the global level.
window.YJ = {};
// and jQuery
window.$ = require('../test_libs/jquery.js');

var conversationMessages = {
    "count":12,
    "items":[
        {"avatar":"CUSTOMER","message":"Here's one -- nine pence.","date":"2016-02-26T12:12:53.640Z"},
        {"avatar":"DEAD PERSON","message":"I'm not dead!","date":"2016-02-26T12:13:02.695Z","attachment":"fl private brief req.png"},
        {"avatar":"MORTICIAN","message":"What?","date":"2016-02-26T12:13:06.476Z"},
        {"avatar":"CUSTOMER","message":"Nothing -- here's your nine pence.","date":"2016-02-26T12:56:22.910Z"},
        {"avatar":"DEAD PERSON","message":"I'm not dead!","date":"2016-02-26T12:56:28.732Z","attachment":"fl private brief req.png"},
        {"avatar":"MORTICIAN","message":"Here -- he says he's not dead!","date":"2016-02-26T13:00:47.619Z","attachment":"fl brief applied.png"},
        {"avatar":"CUSTOMER","message":"Yes, he is.","date":"2016-02-26T13:01:50.226Z","attachment":"fl conversation offered contract.png"},
        {"avatar":"DEAD PERSON","message":"I'm not!","date":"2016-02-26T13:02:07.280Z"},
        {"avatar":"MORTICIAN","message":"He isn't.","date":"2016-02-26T13:02:08.213Z"},
        {"avatar":"CUSTOMER","message":"Well, he will be soon, he's very ill.","date":"2016-02-26T13:02:12.469Z","attachment":"file.txt"},
        {"avatar":"DEAD PERSON","message":"I'm getting better!","date":"2016-02-26T14:08:37.894Z"},
        {"avatar":"CUSTOMER","message":"No, you're not -- you'll be stone dead in a moment.","date":"2016-02-29T17:05:33.923Z"}
    ]
};

var Conversations = require('../components/Conversations.js'),
    conversationMockResponse = {"status": {"feedback_message": false, "success": true}, "html": "", "meta": {"total_messages": conversationMessages.count}},
    conversationHTML = `
<div class="Conversation js-conversationPartial" id="conversation">
    <form class="Form Form--chat js-conversationForm" method="post" action="/conversations/availabilityrequest/32956/">
        <input type="hidden" name="csrfmiddlewaretoken" value="o1tPCkVyapCcTjBmpP5u0xk1xrjdgwsl">
        <div class="Grid">
            <div class="Grid-cell u-size3of12 u-md-size2of12 u-lg-size1of12">
                <div class="Form-avatar">
                    <div class="Avatar Avatar--chatMessage " title="Gerry Moss">
                        <div class="Avatar-inner" style="

                              background-image: url('/media/images/static_pages/biff_tannen.jpg');

                        "></div>
                    </div>
                </div>
            </div>
            <div class="Grid-cell u-size9of12 u-md-size10of12 u-lg-size8of12">
                <div class="Form-itemGroup Form-item-section-message">
                    <label class="Form-label Form-label-for-message" for="id_message">
                            Send private message
                    </label>
                    <div class="Form-item">
                        <textarea class="js-activateMessage" cols="40" id="id_message" maxlength="2000" name="message" placeholder="Click here to add a message or attach a file..."></textarea>
                    </div>
                </div>
                <div class="Form-item-wrapper--controlGroup">
                    <div class="Form-item-wrapper">
                        <div class="Form-item--fileInputWrapper">
                            <a class="js-uploadFile-trigger" href="#">Add an attachment</a>
                            <input class="js-uploadFile-trigger" id="id_attachment" name="attachment" type="file">
                        </div>
                        <div class="Form-item--fileInputWrapper js-clearableFileInput Form-item--fileInputWrapper--status u-textMuted js-uploadFile-name"></div><div class="Form-item--fileInputWrapper Form-item--fileInputWrapper--status Form-item--fileInputWrapper--clear"><a href="#" class="js-clearableFileInput-trigger" style="display: none;"> Clear</a></div>
                    </div>
                </div>
                <div class="Form-button">
                    <button class="Button Button--primary js-spinnerButton" type="submit">
                        <span class="Button-inner">
                            Send message
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </form>
    <div class="Conversation-body js-conversationBody">
    </div>
</div>
`;

// Manually mock out the attachment support detection.
YJ.canUseAjaxFileUploads = function () {
    return true;
};

window.initButtonSpinners = jasmine.createSpy();
window.buildMessageHTML = jasmine.createSpy();
window.displayNewAlert = jasmine.createSpy();

// Stub ajaxSubmit
$.fn.ajaxSubmit = function() {};

describe('Load conversations', function () {
	var model,
		view,
		controller,
		$conversationObj,
		callableFunc = {},
		conversationInitialiser;

	beforeAll(function () {
		$conversationObj = $(conversationHTML).get(0);
		document.body.appendChild($conversationObj);

		YJ.canUseAjaxFileUploads = function () {
			return true;
		};

        // Clear local storage
        localStorage.clear();

        // Add some fake items to localStorage.
        localStorage.setItem('messages', JSON.stringify(conversationMessages));

		conversationInitialiser = Conversations.constructor($conversationObj);

		model = new Conversations.ConversationModel();
		view = new Conversations.ConversationView(model, $conversationObj);

		spyOn(view, 'onClickSubmitButton').and.callThrough();
		spyOn(view, 'onKeyDown').and.callThrough();
		spyOn(view, 'onSubmitForm').and.callThrough();
		spyOn(view, 'onChangeFilepicker').and.callThrough();
		spyOn(view, 'onExpandForm').and.callThrough();
		spyOn(view, 'init').and.callThrough();
		spyOn(view, 'triggerSubmitForm').and.callThrough();

		callableFunc.eventViewCallback = function() {};
		callableFunc.eventModelMessageAddedCallback = function() {};

		spyOn(callableFunc, 'eventViewCallback').and.callThrough();
		spyOn(callableFunc, 'eventModelMessageAddedCallback').and.callThrough();
		view.eventSubmitMessage.attach(callableFunc.eventViewCallback);
		model.messageAdded.attach(callableFunc.eventModelMessageAddedCallback);
		controller = new Conversations.ConversationController(model, view, false);
		spyOn(controller, 'sendMessage').and.callThrough(); // Stop it calling through
		controller.init();

		buildMessageHTML.calls.reset();
	});

	afterAll(function () {
		document.removeChild($conversationObj);
        controller = null;
        view = null;
        model = null;
	});

	beforeEach(function () {
		jasmine.Ajax.install();
	});

	afterEach(function () {
		jasmine.Ajax.uninstall();
	});

	it('checks our instances are as expected', function() {
		expect(model instanceof Conversations.ConversationModel).toBe(true);
		expect(view instanceof Conversations.ConversationView).toBe(true);
		expect(controller instanceof Conversations.ConversationController).toBe(true);
	});

	it('calls the function initialiser', function() {
		expect(conversationInitialiser instanceof Conversations.ConversationController).toBe(true);
	});

	it('expects controller to have called view.init', function () {
		expect(view.init).toHaveBeenCalled();
	});

	it('has the correct amount of messages', function () {
		expect(model.getItems().length).toBe(12);
	});

	it('has an attachment field', function () {
		expect(view.form[0].querySelector('input[type=file]').name).toBe('attachment');
	});

	it('Getting the first message returns the correct fixture', function () {
        var fixture = conversationMessages.items[conversationMessages.items.length-1];

        expect(model.getItem(0).avatar).toBe(fixture.avatar);
        expect(model.getItem(0).message).toBe(fixture.message);
        expect(model.getItem(0).date).toBe(fixture.date);
	});

	it('has emitted message added events', function () {

	});

	it('expects clicking button to trigger triggerSubmitForm', function () {
		$(view.form).find('button[type=submit]').trigger('click');

		expect(view.onClickSubmitButton).toHaveBeenCalled();
	});

	it('triggers the submitForm spy', function () {
		view.form.submit();
		expect(view.onSubmitForm).toHaveBeenCalled();
	});

	it('triggers the keydown event', function () {
		var e = $.Event('keydown');
		e.keyCode = 65; // Character 'A'
		e.which = 65;

		view.textarea.trigger(e);

		expect(view.onKeyDown).toHaveBeenCalled();
	});

    // We can only trigger the change event, it is impossible to set a value.
    // That would be a huge security hole in browsers.
    it('triggers the onchange event for filepicker', function() {
        $(view.view).find('input[type="file"]').trigger('change');

        expect(view.onChangeFilepicker).toHaveBeenCalled();
        expect($(view.view).find('.js-uploadFile-name').html()).toBe('File selected: ');
    });

	it('triggers the keydown event (which causes a submit through ctrlKey)', function () {
		var e = $.Event('keydown');
		e.keyCode = 10; // Character 'A'
		e.ctrlKey = true;

		view.textarea.trigger(e);

		expect(view.onKeyDown).toHaveBeenCalled();
		expect(view.triggerSubmitForm).toHaveBeenCalled();
	});


	it('triggers the keydown event (which causes a submit through metaKey)', function () {
		var e = $.Event('keydown');
		e.keyCode = 10; // Character 'A'
		e.metaKey = true;

		view.textarea.trigger(e);

		expect(view.onKeyDown).toHaveBeenCalled();
		expect(view.triggerSubmitForm).toHaveBeenCalled();
	});

	it('has added a class to the partial on textarea focus', function () {
		view.textarea.focus();

		expect($(view.view).attr('class')).toContain('expand');
	});

	it('triggers a submit which in turn triggers to submit form YJ event', function() {
		// Set spy to also callthrough.
		view.triggerSubmitForm.calls.reset(); // Reset Mock calls.

		var e = $.Event('keydown');
		e.keyCode = 10; // Character 'A'
		e.ctrlKey = true;

		view.textarea.trigger(e);

		expect(view.onKeyDown).toHaveBeenCalled();
		expect(view.triggerSubmitForm).toHaveBeenCalled();
		expect(callableFunc.eventViewCallback).toHaveBeenCalled();
		expect(controller.sendMessage).toHaveBeenCalled();
	});

	it('simulates a success response and adds message to the stack', function() {
		// Splurge fake response into conversation response and check responseObj performs correctly.
		displayNewAlert.calls.reset();
		buildMessageHTML.calls.reset();
		controller.submitSuccess({}, conversationMockResponse);

		expect(model.getItems().length).toBe(16);
		expect(callableFunc.eventModelMessageAddedCallback).toHaveBeenCalled();

		expect(buildMessageHTML).not.toHaveBeenCalled();
		expect(displayNewAlert).not.toHaveBeenCalled();
	});

	it('simulates a jQuery success response and adds message to the stack', function() {
		buildMessageHTML.calls.reset();

		// Splurge fake response into conversation response and check responseObj performs correctly.
		controller.submitJquerySuccess(conversationMockResponse, '', {}, false);

		expect(model.getItems().length).toBe(16);
		expect(callableFunc.eventModelMessageAddedCallback).toHaveBeenCalled();

		expect(buildMessageHTML).not.toHaveBeenCalled();
		expect(displayNewAlert).not.toHaveBeenCalled();
	});

	it('simulates a success response with a feeback message', function() {
		conversationMockResponse.status.feedback_message = "Clever girl.";

		buildMessageHTML.calls.reset();

		// Splurge fake response into conversation response and check responseObj performs correctly.
		controller.submitSuccess({}, conversationMockResponse);

		expect(model.getItems().length).toBe(16);
		expect(callableFunc.eventModelMessageAddedCallback).toHaveBeenCalled();

		expect(buildMessageHTML).toHaveBeenCalled();
		expect(displayNewAlert).toHaveBeenCalled();
	});

	it('simulates a fail response', function() {
		conversationMockResponse.status.feedback_message = null;

		displayNewAlert.calls.reset();

		// Splurge fake response into conversation response and check responseObj performs correctly.
		controller.submitFail();

		expect(displayNewAlert).toHaveBeenCalled();
	});
});

describe('Load conversations in a client which doesn\'t support ajax file uploads (> IE9)', function () {
	var controller, model, view, $conversationObj;

	beforeAll(function () {
        $(conversationHTML).find('.js-conversationBody').html('');
		$conversationObj = $(conversationHTML).get(0);
		document.body.appendChild($conversationObj);

		YJ.canUseAjaxFileUploads = function () {
			return false;
		};

        // Clear local storage
        localStorage.clear();

        // Add some fake items to localStorage.
        localStorage.setItem('messages', JSON.stringify({count: 0, items: []}));
        localStorage.setItem('messages', JSON.stringify(conversationMessages));

		model = new Conversations.ConversationModel();
		view = new Conversations.ConversationView(model, $conversationObj);
		controller = new Conversations.ConversationController(model, view);
	});

	afterAll(function () {
		document.removeChild($conversationObj);
	});

	it('has the correct amount of messages', function () {
		expect(model.getItems().length).toBe(12);
	});

	it('has no attachment field', function () {
		expect(view.form[0].querySelector('input[type=file]')).toBe(null);
	});

	it('Getting the first message returns the correct fixture', function () {
        var fixture = conversationMessages.items[conversationMessages.items.length-1];

		expect(model.getItem(0).avatar).toBe(fixture.avatar);
		expect(model.getItem(0).message).toBe(fixture.message);
		expect(model.getItem(0).date).toBe(fixture.date);
	});

	it('has emitted 2 message added events', function () {
	});

	it('has added a class to the partial on textarea focus', function () {
		view.textarea.focus();
		expect($(view.view).attr('class')).toContain('expand');
	});
});

describe('Load conversations with empty localStorage', function () {
    var controller, model, view, $conversationObj;

    beforeAll(function () {
        $(conversationHTML).find('.js-conversationBody').html('');
        $conversationObj = $(conversationHTML).get(0);
        document.body.appendChild($conversationObj);


        // Clear local storage
        localStorage.clear();

        model = new Conversations.ConversationModel();
        view = new Conversations.ConversationView(model, $conversationObj);
        controller = new Conversations.ConversationController(model, view);
    });

    afterAll(function () {
        document.removeChild($conversationObj);
    });

    it('Will catch the try and set conversationMessages to count: 0, items: []', function() {
        expect(view.conversationMessages.count).toBe(0);
        expect(view.conversationMessages.items.length).toBe(0);
    });

    it('Will empty the form', function() {
        view.textarea.val("Oh, I can't take him like that -- it's against regulations.");
        view.textarea.trigger('focus');

        expect($(view.view).attr('class')).toContain('expand');

        view.emptyForm();
        expect($(view.view).attr('class')).not.toContain('expand');
        expect(view.textarea.val()).toBe('');
    });
});