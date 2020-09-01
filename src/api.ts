import express from 'express';
import _ from 'lodash';
import cors from 'cors';
import {createStorageComponent} from 'lisk-framework/src/components/storage';
import {createLoggerComponent} from 'lisk-framework/src/components/logger';
import {bootstrapStorage} from './init_steps/bootstrap_storage';

const app = express();
app.use(cors());

export class ExtendedHTTPApi {

    public channel;
    public options;
    public logger;
    public scope;

    constructor(channel, options) {
        this.channel = channel;
        this.options = options;
        this.logger = null;
        this.scope = null;
    }

    async bootstrap() {
        // Logger
        const loggerConfig = await this.channel.invoke(
            'app:getComponentConfig',
            'logger',
        );
        this.logger = createLoggerComponent({
            ...loggerConfig,
            module: 'http_api',
        });

        // Storage
        this.logger.debug('Initiating storage...');
        const storageConfig = await this.channel.invoke(
            'app:getComponentConfig',
            'storage',
        );
        const dbLogger = {};
        const storage = createStorageComponent(storageConfig, dbLogger);

        // Setup scope
        this.scope = {
            components: {
                logger: this.logger,
                storage,
            },
            channel: this.channel,
        };

        // Bootstrap Storage component
        await bootstrapStorage(this.scope, this.options.limit || 100);
        this.scope.components.storage.entities.Transaction.filters.asset_contains = "asset @> '${asset_contains:value}'::jsonb";
        this.scope.components.storage.entities.Transaction.filters.asset_exists = "asset ? '${asset_exists:value}'";
        this.scope.components.storage.entities.Account.filters.asset_contains = "asset @> '${asset_contains:value}'::jsonb";
        this.scope.components.storage.entities.Account.filters.asset_exists = "asset ? '${asset_exists:value}'";

        app.get('/extended-api/:type', async (req, res) => {
            const limit = req.query.limit || 10;
            const offset = req.query.offset || 0;
            const transactionType = Number(req.query.type) || -1;
            const type = req.params.type === "accounts" ? "Account" : req.params.type === "transactions" ? "Transaction" : null;
            if (!type) {
                res.send({
                    "description": "Page not found, use /extended-api/accounts or /extended-api/transactions"
                })
            } else {
                if (this.options.assets && this.options.assets.indexOf(req.query.asset) > -1) {
                    let filters: Array<any> = [];
                    if (req.query.asset) {
                        if (!req.query.contains) {
                            const filter: any = { asset_exists: req.query.asset };
                            if (transactionType > -1){
                                filter.type = transactionType;
                            }
                            filters.push(filter);
                        }
                        if (req.query.contains) {
                            let obj = {};
                            const contains = !isNaN(req.query.contains) ? Number(req.query.contains) : req.query.contains;
                            _.set(obj, req.query.asset, contains);
                            const filter: any = { asset_contains: JSON.stringify(obj) };
                            if (transactionType > -1){
                                filter.type = transactionType;
                            }
                            filters.push(filter);
                        }
                    }

                    const result = await this.scope.components.storage.entities[type].get(filters, {
                        limit,
                        offset,
                        extended: true,
                    })
                    res.send({
                        "meta": {
                            limit: limit,
                            offset: offset,
                        },
                        "data": result,
                        "links": {},
                    });
                } else {
                    res.status(400).send({
                        "description": "Asset not allowed",
                        "allowedAssets": this.options.assets || []
                    })
                }

            }
        });

        app.listen(this.options.port || 2020);
    }

    async cleanup() {
        const {components} = this.scope;

        this.logger.info('Cleaning extended HTTP API...');

        try {
            if (components !== undefined) {
                for (const key of Object.keys(components)) {
                    if (components[key].cleanup) {
                        await components[key].cleanup();
                    }
                }
            }
        } catch (componentCleanupError) {
            this.logger.error(componentCleanupError);
        }
        this.logger.info('Cleaned up extended HTTP API successfully');
    }
};

