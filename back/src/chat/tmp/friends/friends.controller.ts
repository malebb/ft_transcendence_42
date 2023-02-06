const User = require('../../user/user.service');

module.exports.getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find({ userId: { $ne: req.params.id } }).select([
			"email",
			"username",
			"userId",
		]);
	return res.json(users);
	} catch (ex) {
		next(ex);
	}
};