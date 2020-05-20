"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapStorage = void 0;
const entities_1 = require("lisk-framework/src/components/storage/entities");
exports.bootstrapStorage = async ({ components: { storage, logger } }, accountLimit) => {
    try {
        console.log(entities_1.Account, entities_1.Transacton);
        storage.registerEntity('Account', entities_1.Account, {
            replaceExisting: true,
        });
        const status = await storage.bootstrap();
        if (!status) {
            throw new Error('Can not bootstrap the storage component');
        }
        storage.entities.Account.extendDefaultOptions({
            limit: accountLimit,
        });
    }
    catch (err) {
        logger.error(err);
        throw err;
    }
};
//# sourceMappingURL=bootstrap_storage.js.map