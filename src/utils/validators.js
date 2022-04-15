const validateEmail = email => {
	const emailRegex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	const emailValidateResult = emailRegex.test(email);
	return emailValidateResult;
};

const validateRegisterInput = (username, email, password, confirmPassword) => {
	const errors = {};
	if (username.trim() === '') errors.username = 'Username must not be empty';
	if (email.trim() === '') errors.email = 'Email must not be empty';
	if (!validateEmail(email.trim()))
		errors.email = 'Email must be a valid email address';
	if (password.trim() === '') errors.password = 'Password must not be empty';
	if (password !== confirmPassword)
		errors.confirmPassword = 'Passwords must match';

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

const validateLoginInput = (username, password) => {
	const errors = {};
	if (username.trim() === '') errors.username = 'Username must not be empty';
	if (password.trim() === '') errors.email = 'Password must not be empty';

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

module.exports = { validateRegisterInput, validateLoginInput };
