exports.mPublicKey = process.env.mPublicKey;
exports.mPrivateKey = process.env.mPrivateKey;
exports.mAPI = process.env.mAPI;
// exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/bookwormAPI";
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb+srv://lightsage88:<password>@my-first-atlas-db-obkbt.mongodb.net/marvelousBookworm?retryWrites=true&w=majority"

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-bookwormAPI";
exports.PORT = process.env.PORT || 8000;
exports.JWT_SECRET = process.env.JWT_SECRET || 'EDITH'
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '1d';