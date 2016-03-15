/**
 * Custom events
 * - In the future this would be a utility layer which is pulled in before any component, not live on a single component.
 */
function YJEvent(sender) {
    this._sender = sender;
    this._listeners = [];
}

YJEvent.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};

module.exports = YJEvent;
