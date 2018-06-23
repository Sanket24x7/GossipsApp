var moment = require("moment");

var generateMessage = (from, text) => {
	return {
		from,
		text,
		on: moment().valueOf()
	}
}

var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    on: moment().valueOf()
  };
};


module.exports = { generateMessage, generateLocationMessage };