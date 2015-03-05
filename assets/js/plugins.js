$.fn.isBound = function(type, fn) {

	if(!this.data('events'))
		 return false;

    var data = this.data('events')[type];

    if (data === undefined || data.length === 0) {
        return false;
    }

    return (-1 !== $.inArray(fn, data));
};