app.directive("parsedate", function () {
    return {
        require: "ngModel", link: function (scope, element, attr, ngModel) {

            function parsedate(text, format) {
                return kendo.toString(text, attr.parsedate);
            }

            ngModel.$parsers.push(parsedate);
        }
    };
});