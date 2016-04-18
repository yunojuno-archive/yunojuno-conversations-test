var gen_uuid = function gen_uuid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

var sanitizeString = function sanitizeString(string) {
    if (typeof string === 'string') {
        return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        return string;
    }
}

module.exports = {
    gen_uuid: gen_uuid,
    sanitizeString: sanitizeString
};
