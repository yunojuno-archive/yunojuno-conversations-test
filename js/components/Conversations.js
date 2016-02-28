/* global YJ */
/* global initButtonSpinners */ // from buttons.js
/* global displayNewAlert */ // from alerts.js
/* global buildMessageHTML */ // from alerts.js
/* global getCookie */

var YJEvent = require('../core/Events.js'),
    gen_uuid = require('../core/Utils.js').gen_uuid,
    defaultError = '';

// Add Conversation level scope to the YJ global namespace
YJ.Conversation = {};

function ConversationModel() {
    // We store a list of the messages within a conversation
    this._messages = [];

    // Gets emitted when a new message is sent by the user (form get submitted)
    this.messageAdded = new YJEvent(this);
}

ConversationModel.prototype = {
    addItem: function(message) {
        this._messages.unshift(message);
        this.messageAdded.notify(message);
    },

    getItem: function(index) {
        return this._messages[index];
    },

    getItems: function() {
        return this._messages;
    }
};

function ConversationView(model, partial) {
    this.view = partial;
    this.identifier = gen_uuid();
    this.textarea = $(this.view).find('textarea');
    this.form = $(this.view).find('form');
    this.submitButton = $(this.view).find('button[type="submit"]');

    // Detect messages
    try {
        this.conversationMessages = JSON.parse(localStorage.getItem('messages'));
    } catch (e) {
        this.conversationMessages = {
            count: 0,
            items: []
        };
    }

    // Set uuid on form
    $(this.view).attr('id', this.identifier);

    this.totalConversationMessages = this.conversationMessages.count;

    YJ.Conversation.conversationUpdated = new YJEvent(this);

    this.eventAddMessage = new YJEvent(this);
    this.eventSubmitMessage = new YJEvent(this);
}

ConversationView.prototype = {
    template: `
        <div class="ChatMessage">
            <div class="ChatMessage-inner">
                <div class="Grid">
                    <div class="Grid-cell u-size3of12 u-md-size2of12 u-lg-size2of12">
                        <div class="ChatMessage-avatar">
                            <div class="Avatar Avatar--noImage Avatar--chatMessage ">
                                <div class="Avatar-inner">
                                    <div class="Avatar-body">{{ AVATAR_INITIALS }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="Grid-cell u-size9of12 u-md-size10of12 u-lg-size10of12">
                        <div class="ChatMessage-content">
                            <div class="ChatMessage-body">
                                <p>{{ CHAT_MESSAGE }}</p>
                                {{ CHAT_MESSAGE_ATTACHMENT }}
                            </div>

                            <div class="ChatMessage-meta">
                                {{ DATE_TIME }}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    attachmentTemplate: '<p><a class="ChatMessage-attachment" target="_blank" href="#">{{ ATTACHMENT }}</a></p>',
    bindEventListeners: function() {
        $(document)
            .off('submit', '#' + this.identifier +' .js-conversationForm')
            .on('submit', '#' + this.identifier +' .js-conversationForm', this.onSubmitForm.bind(this));
        $(document)
            .off('focus', '#' + this.identifier +' .js-conversationForm textarea')
            .on('focus', '#' + this.identifier +' .js-conversationForm textarea', this.onExpandForm.bind(this));
        $(document)
            .off('keydown', '#' + this.identifier +' .js-conversationForm textarea')
            .on('keydown', '#' + this.identifier +' .js-conversationForm textarea', this.onKeyDown.bind(this));
        $(document)
            .off('click', '#' + this.identifier +' .js-conversationForm button[type="submit"]')
            .on('click', '#' + this.identifier +' .js-conversationForm button[type="submit"]', this.onClickSubmitButton.bind(this));
        $(document)
            .off('change', '#' + this.identifier +' .js-conversationForm input[type="file"]')
            .on('change', '#' + this.identifier +' .js-conversationForm input[type="file"]', this.onChangeFilepicker);
    },

    detectAndRemoveAttachment: function() {
        if(!YJ.canUseAjaxFileUploads()) {
            // Remove attachment
            $('.js-conversationForm input[type="file"], .js-conversationForm .js-uploadFile-trigger').remove();
        }
    },

    buildMessages: function() {
        for(var i=0; i < this.totalConversationMessages; i++) {
            this.eventAddMessage.notify(this.conversationMessages.items[i]);
        }
    },

    buildTemplate: function(avatar, chat_message, datetime, attachment = false) {
        // Replace avatar initials

        // Make copy of template.
        var tpl = this.template.toString(),
            attachTpl = '';

        tpl = tpl.replace('{{ AVATAR_INITIALS }}', avatar);
        tpl = tpl.replace('{{ CHAT_MESSAGE }}', chat_message);
        tpl = tpl.replace('{{ DATE_TIME }}', datetime);

        if(attachment) {
            // Add attachment filename to the template
            attachTpl = this.attachmentTemplate.toString().replace('{{ ATTACHMENT }}', attachment);
        }

        // If there is an attachment, we replace the contents with the template, else with an empty string.
        tpl = tpl.replace('{{ CHAT_MESSAGE_ATTACHMENT }}', attachTpl);

        return tpl;
    },

    emptyForm: function() {
        // Clear textarea, filepicker and remove class which expands the form to show the attachment.
        this.textarea.val('');
        this.form.find('input[type=file]').val('');
        $(this.view).removeClass('expand');
    },

    renderTemplate: function(items) {
        var item,
            html = '';

        for(var i=0; i < items.length; i++) {
            var attachment = false;
            if(items[i].attachment) {
                attachment = items[i].attachment;
            }
            html += this.buildTemplate(items[i].avatar, items[i].message, items[i].date, attachment);
        }

        document.getElementsByClassName('js-conversationBody')[0].innerHTML = html;
    },

    init: function() {
        // Controller driven initialisation function
        this.buildMessages();
        this.bindEventListeners();
        this.detectAndRemoveAttachment();
    },

    onChangeFilepicker: function(ev) {
        var $relevantStatus = $(this).parent().next('.js-uploadFile-name').first(),
            summaryString = "File selected: " + $(this).val().split('\\').pop();
        $relevantStatus.addClass('Form-item--fileInputWrapper--clear');
        $relevantStatus.html(summaryString);

        if($(this).parent().hasClass('js-clearableFileInput')) {
            $(this).parent().hide();
            $(this).parent().parent().find('.js-clearableFileInput-trigger').show();
            $(this).parent().parent().find('.js-uploadFile-trigger').hide();
        }
    },

    // User Event driven methods
    onClickSubmitButton: function(ev) {
        return this.triggerSubmitForm(ev.currentTarget.form);
    },
    /**
     * Clicking on textarea adds class of expand which shows the controls
     * and expands the textarea.
     *
     */
    onExpandForm: function() {
        $(this.view).addClass('expand');
    },

    /**
     * When user types into textarea, if they hit ctrl/cmd+enter
     * In older versions of browsers ctrl+enter returned keyCode 10 instead of 13.
     * @param ev (MouseEvent)
     */
    onKeyDown: function(ev) {
        var keyCode = ev.keyCode;
        if ((keyCode === 10 || keyCode === 13) && (ev.ctrlKey || ev.metaKey)) {
            ev.target.blur();
            return this.triggerSubmitForm(ev.target.form);
        }
    },

    /*
     * Bind jquery.form.js to the form. HOWEVER, don't do it simply the way
     * the jquery.form.js docs say, because we are using the js-spinnerButton
     * behaviour here, which disables the button after first click,
     * which in turn blocks $form.submit from really happening. So, instead
     * we make sure that form.submit is blocked (as per recommended way,
     * which turns out to be a bit belt-and-braces as it's not triggered)
     * and bind a separate click handler to the submit button to ensure
     * our call to ajaxSubmit happens,
     */
    onSubmitForm: function() {
        // token safety catch to deny standard POST -- though this
        // won't get called due to the spinner button being made disabled.
        return false;
    },

    // View driven form submit. Actually an AJAX request
    triggerSubmitForm: function(form) {
        this.eventSubmitMessage.notify(form);
    }
};

function ConversationController(model, view, init = true) {
    this._model = model;
    this._view = view;

    if(init) this.init();
}

ConversationController.prototype = {
    init: function() {
        var controller = this;

        this._view.eventAddMessage.attach(function ConversationControllerAddMessage(view, item) {
            // From Controller: view asks model to add item to store
            controller._model.addItem(item);
        });

        this._model.messageAdded.attach(function ConversationControllerMessageAdded(model, item) {
            // From Model model added item. Tell controller.
            controller._view.renderTemplate(controller._model.getItems());
        });

        this._view.eventSubmitMessage.attach(this.sendMessage.bind(this));

        // Initialise the view once the listeners are bound
        this._view.init();
    },

    sendMessage: function(callee, conversationForm) {
        $(this._view.view).find('button[type="submit"]').trigger('spin');

        var key,
            data = {
                avatar: 'YOU',
                message: conversationForm.elements.message.value,
                date: new Date()
            };

        // Detect if there is an attachment.
        if(conversationForm.elements.attachment.value) {
            data.attachment = conversationForm.elements.attachment.value.split('\\').pop();
        }


        // Tell model to add item.
        this._model.addItem(data);

        this.submitSuccess({}, {
            status: {
                'success': true,
                'feedback_message': false
            }
        });

        var messages = JSON.parse(localStorage.getItem('messages'));

        messages.count++;
        messages.items.push(data);

        localStorage.setItem('messages', JSON.stringify(messages));
    },
    submitJquerySuccess: function(responseObj, statusText, xhr, $wrappedForm) {
      // Reshuffle the arguments
      this.submitSuccess(xhr, responseObj);
    },
    submitSuccess: function(xhr, responseObj) {
        // responseObj is a payload with two keys:
        // 'html' is intended to replace the entire conversation panel
        // 'status' is a dict of {'success':true|false, 'feedback_message': "..."}

        var wasSuccessful = responseObj.status.success,
            feedbackMessage = responseObj.status.feedback_message,
            alertState = (wasSuccessful === true) ? 'success' : 'error',
            alertMessage;

        // Empty for as we have now submitted
        this._view.emptyForm();

        // If IE9 remove attachment
        this._view.detectAndRemoveAttachment();

        // also set an alert based on the results
        if (feedbackMessage) {
            alertMessage = (feedbackMessage === undefined) ? defaultError : buildMessageHTML(feedbackMessage, alertState);
            displayNewAlert(alertMessage);
        }

        // Notify global listeners that the conversation has updated.
        YJ.Conversation.conversationUpdated.notify(responseObj);
    },
    submitFail: function() {
        displayNewAlert(defaultError);
    }
};

// The initialiser that ties them together
function Conversation(conversationPartial) {
    // Check localStorage exists, if not. Create it.
    if(localStorage.getItem('messages') === null) localStorage.setItem('messages', JSON.stringify({count: 0, items: []}));


    var model = new ConversationModel(),
        view = new ConversationView(model, conversationPartial);
    return new ConversationController(model, view);
}

YJ.Conversation.constructor = Conversation;

module.exports = {
    ConversationModel: ConversationModel,
    ConversationView: ConversationView,
    ConversationController: ConversationController,
    constructor: Conversation
};