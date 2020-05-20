"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedHTTPApi = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const storage_1 = require("lisk-framework/src/components/storage");
const logger_1 = require("lisk-framework/src/components/logger");
const bootstrap_storage_1 = require("./init_steps/bootstrap_storage");
const app = express_1.default();
app.use(cors_1.default());
class ExtendedHTTPApi {
    constructor(channel, options) {
        options.root = __dirname;
        this.channel = channel;
        this.options = options;
        this.logger = null;
        this.scope = null;
    }
    async bootstrap() {
        const loggerConfig = await this.channel.invoke('app:getComponentConfig', 'logger');
        this.logger = logger_1.createLoggerComponent({
            ...loggerConfig,
            module: 'http_api',
        });
        this.logger.debug('Initiating storage...');
        const storageConfig = await this.channel.invoke('app:getComponentConfig', 'storage');
        const dbLogger = {};
        const storage = storage_1.createStorageComponent(storageConfig, dbLogger);
        const applicationState = await this.channel.invoke('app:getApplicationState');
        this.scope = {
            components: {
                logger: this.logger,
                storage,
            },
            channel: this.channel,
            config: this.options,
            lastCommitId: this.options.lastCommitId,
            buildVersion: this.options.buildVersion,
            applicationState,
        };
        await bootstrap_storage_1.bootstrapStorage(this.scope, this.options.constants.activeDelegates);
        this.scope.components.storage.entities.Transaction.filters.asset_contains = "asset @> '${asset_contains:value}'::jsonb";
        this.scope.components.storage.entities.Transaction.filters.asset_exists = "asset ? '${asset_exists:value}'";
        console.log(await this.scope.components.storage.entities.Transaction.get({
            asset_contains: `{"username": "developer"}`
        }));
        console.log(this.scope.components.storage.entities.Account);
        app.get('/extended/username/:username', async (req, res) => {
            const result = await this.scope.components.storage.entities.Account.get({
                username_like: `%${req.params.username}%`
            });
            res.send(result);
        });
        app.get('/extended/accounts/:publicKey', async (req, res) => {
            res.send(req.params.publicKey);
        });
        app.get('/extended/contracts/:publicKey', async (req, res) => {
            const result = await this.scope.components.storage.entities.Account.get([
                { asset_contains: `{"senderPublicKey": "${req.params.publicKey}"}` },
                { asset_contains: `{"recipientPublicKey": "${req.params.publicKey}"}` },
            ]);
            res.send(result);
        });
        app.get('/extended/transactions/:contractPublicKey', async (req, res) => {
            const contract = await this.scope.components.storage.entities.Account.get({ publicKey: req.params.contractPublicKey });
            if (contract[0].asset.initialTx) {
                const result = await this.scope.components.storage.entities.Transaction.get([
                    { asset_contains: `{"contractPublicKey": "${req.params.contractPublicKey}"}` },
                    { id: contract[0].asset.initialTx },
                ], { limit: 100, extended: true });
                res.send(result);
            }
            else {
                res.send([]);
            }
        });
        app.listen(2020);
    }
    async cleanup() {
        const { components } = this.scope;
        this.logger.info('Cleaning HTTP API...');
        try {
            if (components !== undefined) {
                for (const key of Object.keys(components)) {
                    if (components[key].cleanup) {
                        await components[key].cleanup();
                    }
                }
            }
        }
        catch (componentCleanupError) {
            this.logger.error(componentCleanupError);
        }
        this.logger.info('Cleaned up successfully');
    }
}
exports.ExtendedHTTPApi = ExtendedHTTPApi;
;
//# sourceMappingURL=api.js.map