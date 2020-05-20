import { Account, Transacton } from "lisk-framework/src/components/storage/entities";

export const bootstrapStorage =  async ({ components: { storage, logger } }, accountLimit) => {
    try {
        console.log(Account, Transacton)
        storage.registerEntity('Account', Account, {
            replaceExisting: true,
        });

        const status = await storage.bootstrap();
        if (!status) {
            throw new Error('Can not bootstrap the storage component');
        }
        storage.entities.Account.extendDefaultOptions({
            limit: accountLimit,
        });
    } catch (err) {
        logger.error(err);
        throw err;
    }
};
