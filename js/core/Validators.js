// define field validator methods
var validators = {
    required : function(data) {
        return (data.trim().length <= 0);
    },

    maxLength : function(data, maxLength) {
        if (maxLength === undefined) maxLength = 255;

        return (data.length > maxLength);
    }
}

// loop through all the defined validation criteria for a field and run the corresponding methods
function Validator(data, criteria) {
    var validationErrors = [];

    criteria.forEach(function(criterion, index){
        var validator = validators[criterion.name];

        if (validator(data, criterion.contraints)) {
            validationErrors.push({
                error : criterion.name,
                message : criterion.message
            })
        }
    });

    return validationErrors;
}

module.exports = Validator;