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
    /**
     * Add message to top of stack to order in DESC.
     */
    addItem: function(message) {
        this._messages.unshift(message);
        this.messageAdded.notify(message);
    },

    /**
     * Get single item from local store. This is an unused helper function
     */ 
    getItem: function(index) {
        return this._messages[index];
    },

    /**
     * Get all messages from our local store.
     */
    getItems: function() {
        return this._messages;
    }
};

function ConversationView(model, partial) {
    // Set accessors for the partial.
    this.view = $(partial);
    this.identifier = gen_uuid();
    this.form = $(this.view).find('form');
    this.textarea = $(this.view).find('textarea');
    this.attachment = $(this.view).find('input[type="file"]');
    this.relevantStatus = $(this.view).find('.js-clearableFileInput');
    this.clearButton = $(this.view).find('.js-clearableFileInput-trigger');
    this.submitButton = $(this.view).find('button[type="submit"]');
    this.uploadFileWrapper = $(this.view).find('.js-uploadFile-wrapper');

    var messages = JSON.parse(localStorage.getItem('messages'));

    // Detect messages
    if(messages !== null) {
        this.conversationMessages = messages;
    } else {
        this.conversationMessages = {
            count: 0,
            items: []
        };
    }

    // Set uuid on form
    $(this.view).attr('id', this.identifier);

    // Make global event for other parts of the platform to subscribe to.
    YJ.Conversation.conversationUpdated = new YJEvent(this);

    // Add local evnets for controller to subscribe to
    this.eventAddMessage = new YJEvent(this);
    this.eventSubmitMessage = new YJEvent(this);
}

ConversationView.prototype = {
    /**
     * Chat message template with variables replaced by buildTemplate()
     */
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
    /**
     * Template for showing an attachment within a conversation message,
     * replaces CHAT_MESSAGE_ATTACHMENT above.
     */
    attachmentTemplate: '<p><a class="ChatMessage-attachment" target="_blank" href="#">{{ ATTACHMENT }}</a></p>',
    /**
     * All the bindings to our document happen here
     * 
     * - onSubmitForm() stops sync form submit
     * - onExpandForm() shows the attachment field
     * - onKeyDown() determines if user has used form submit shortcuts while focused on the textarea
     * - validateForm() toggles the submit button between disabled/enabled if the textarea contains a message
     * - onClickSubmitButton() submits our form over AJAX
     * - onChangeFilePicker() gives user UI feedback on which file they picked
     *
     */
    bindEventListeners: function() {
        $(this.form).off('submit').on('submit', this.onSubmitForm.bind(this));
        $(this.textarea).off('focus').on('focus', this.onExpandForm.bind(this));
        $(this.textarea).off('keydown').on('keydown', this.onKeyDown.bind(this));
        $(this.textarea).off('keyup').on('keyup', this.validateForm.bind(this));
        $(this.textarea).off('change').on('change', this.validateForm.bind(this));
        $(this.submitButton).off('click').on('click', this.onClickSubmitButton.bind(this));
        $(this.attachment).off('change').on('change', function () {
            this.onChangeFilepicker.call(this, $(this.attachment).val());
        }.bind(this));
        $(this.clearButton).off('click').on('click', this.onClearFileAttachment.bind(this));

        //example of transitionend event
        this.uploadFileWrapper.off('transitionend').on('transitionend', function (ev) {
            console.log("'File attachment' wrapper animated");
            if ($(this).css("opacity") === "1"){
                console.log("--------FADED IN--------");
            } else {
                console.log("--------FADED OUT--------");
            }
        });
    },

    /**
     * The global function canUseAjaxFileUploads() determines whether we can send file data through AJAX.
     * It is unsupported in < IE9
     * Remove it if necessary
     */
    detectAndRemoveAttachment: function() {
        if(!YJ.canUseAjaxFileUploads()) {
            // Remove attachment
            $('.js-conversationForm input[type="file"], .js-conversationForm .js-uploadFile-trigger').remove();
        }
    },

    /**
     * Tell anyone attached to our events
     * about all our messages.
     */
    buildMessages: function() {
        for(var i=0; i < this.conversationMessages.items.length; i++) {
            this.eventAddMessage.notify(this.conversationMessages.items[i]);
        }
    },

    /**
     * Take our template strings and replace
     * the vars with our dynamic data.
     * Returns the resulting template
     */
    buildTemplate: function(avatar, chat_message, datetime, attachment) {
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

    /**
     * Clear textarea, filepicker and remove class which expands
     * the form to show the attachment.
     */
    emptyForm: function() {
        $(this.textarea).val('');
        $(this.view).removeClass('expand');
        this.onClearFileAttachment();
        
        //if transition is not supported, trigger transitionend event
        if(!this.checkCSSTransformSupported()) {
            $(this.uploadFileWrapper).trigger('transitionend');
        }
    },

    /**
     * Loop through items and build a template, 
     * eventually replacing the contents with our template string.
     */
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
        $('.js-conversationBody', document).html(html);
    },

    /**
     * Initialise the Conversations view. Integral to tests.
     */
    init: function() {
        this.buildMessages();
        this.bindEventListeners();
        this.detectAndRemoveAttachment();
    },

    /**
     * When a user clicks the 'clear attachment' link after adding an
     * attachment it should trigger this method and clear the value.
     */
    onClearFileAttachment: function (ev) {
        $(this.relevantStatus).removeClass('Form-item--fileInputWrapper--clear');
        $(this.relevantStatus).html('');
        $(this.attachment).val('');
        $(this.clearButton).hide();
        this.validateForm();
        if (ev){
            ev.preventDefault();
        }
    },

    /**
     * When user clicks our filepicker and chooses a file, take 
     * the filename and place in an element next to the picker.
     */
    onChangeFilepicker: function (filepath) {
        var summaryString;
        if ((typeof filepath === "string") && (filepath)) {
            summaryString = "File selected: " + filepath.split('\\').pop().split('/').pop();
            $(this.relevantStatus).addClass('Form-item--fileInputWrapper--clear');
            $(this.relevantStatus).html(summaryString);
            $(this.clearButton).show();
            this.validateForm();
        } else {
            this.onClearFileAttachment();
        }
    },

    /**
     * Submit form over ajax
     */
    onClickSubmitButton: function (ev) {
        return this.triggerSubmitForm(ev.currentTarget.form);
    },
    
    /**
     * Checks browser support of the css transform property,
     * used to establish if the javascript transitionend event
     * will not be trigger and thus if a fallback is required
     */
    checkCSSTransformSupported: function() {
        if (('WebkitTransform' in document.body.style) || 
            ('MozTransform' in document.body.style) || 
            ('OTransform' in document.body.style) || 
            ('transform' in document.body.style)) {
            return true;
        } else {
            return false; 
       }
    },
    
    /**
     * Clicking on textarea adds class of expand which shows the controls
     * and expands the textarea.
     *
     */
    onExpandForm: function() {
        $(this.view).addClass('expand');

        //if transition is not supported, trigger transitionend event
        if(!this.checkCSSTransformSupported()) {
            $(this.uploadFileWrapper).trigger('transitionend');
        }
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

    /**
     * When user types into textarea, pastes from the clipboard, or adds and attachment file
     * then we update the submitButtons enabled/disabled state if the textarea contains a message
     * @param ev (MouseEvent)
     */
    validateForm: function () {
        if (($(this.textarea).val()) || ($(this.attachment).val())) {
            $(this.submitButton).removeClass("is-disabled");
        } else {
            $(this.submitButton).addClass("is-disabled");
            $(this.submitButton).blur();
        }
    },

    /**
     *  Catch to deny standard POST
     */
    onSubmitForm: function() {
        return false;
    },

    /**
     * View driven form submit. Normally an AJAX request, in our case this is bypassed.
     * Notify the controller event to store our message in localStorage.
     */
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
    /**
     * Initialise the Conversations controller. Integral to tests.
     */
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

    /*
     * Performs the action of sending a message to another user. 
     * In this case we are only sending a single strand from ourselves. 
     * So another party will never 'receive' a message.
     */
    sendMessage: function(callee, conversationForm) {
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

        // if message data and attachment data don't exist, or the message length is too long, don't submit
        if (((!data.message) && (!data.attachment)) ||
            ((!data.message) && (data.message.length > Number(conversationForm.elements.message.getAttribute("maxlength"))))) {
            return;
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
    /**
     * Proxies the submitSuccess function as jQuery returns different arguments to our 'qwest' AJAX package.
     * Is not used for this implementation.
     */
    submitJquerySuccess: function(responseObj, statusText, xhr, $wrappedForm) {
      // Reshuffle the arguments
      this.submitSuccess(xhr, responseObj);
    },
    /**
     * On a successful post the responseObj will be packaged with
     * - status(obj)
     *  - success: (true/false)
     *  - feedback: (string/null)
     */ 
    submitSuccess: function(xhr, responseObj) {
        var wasSuccessful = responseObj.status.success,
            feedbackMessage = responseObj.status.feedback_message,
            alertMessage;

        var alertState = (wasSuccessful === true) ? 'success' : 'error';

        // Empty for as we have now submitted
        this._view.emptyForm();

        // If IE9 remove attachment
        this._view.detectAndRemoveAttachment();

        // also set an alert based on the results
        if (feedbackMessage) {
            alertMessage = buildMessageHTML(feedbackMessage, alertState);
            displayNewAlert(alertMessage);
        }

        // Notify global listeners that the conversation has updated.
        YJ.Conversation.conversationUpdated.notify(responseObj);
    },
    /**
     * In a real world scenario we get instances of failed requests.
     * This handles the failure gracefully and notifies the user.
     */
    submitFail: function() {
        displayNewAlert(defaultError);
    }
};

/**
 * Conversation.
 * This is the constructor used to initialise our Conversations application.
 */
function Conversation(conversationPartial) {
    // Check localStorage exists, if not. Create it.
    if(localStorage.getItem('messages') === null) localStorage.setItem('messages', JSON.stringify({count: 0, items: []}));


    var model = new ConversationModel(),
        view = new ConversationView(model, conversationPartial);
    return new ConversationController(model, view);
}

module.exports = {
    // Individual exports are made for testing
    ConversationModel: ConversationModel,
    ConversationView: ConversationView,
    ConversationController: ConversationController,
    // Constructor is invoked on the platform.
    constructor: Conversation
};
