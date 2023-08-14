const multer = require("multer");
const fs = require("fs");

const upload = (folder, limit = 5) => {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			const path = `./uploads/${folder}`;
			fs.mkdirSync(path, { recursive: true });

			cb(null, path); // Set the destination folder for uploaded files
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + "-" + file.originalname); // Set a unique filename for uploaded files
		},
	});

	return multer({
		storage: storage,
		limits: {
			fileSize: 1024 * 1024 * limit, // 5 MB default limit (adjust as per your requirements)
		},
	});
};

module.exports = upload;
