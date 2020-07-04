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
    console.log(this.scope.components.storage.entities.Transaction)
    if (this.options.arrays && this.options.arrays.length > 0) {
      this.options.arrays.map(a => {
        this.scope.components.storage.entities.Account.filters[`array_${a}`] = `asset->'${a}' ? '\$\{array_${a}:value\}'`;
      })
    }
    app.get('/extended-api/username/:username', async (req, res) => {
      const result = await this.scope.components.storage.entities.Account.get({
        // asset_contains: `{"username": "${req.params.username}"}`
        username_like: `%${req.params.username}%`
      });
      res.send(result);
    });

    app.get('/extended-api/array/:type', async (req, res) => {
      const limit = req.query.limit || 10;
      const offset = req.query.offset || 0;
      const type = req.params.type === "accounts" ? "Account" : req.params.type === "transactions" ? "Transaction" : null;
      if (!type) {
        res.send({
          "description": "Page not found, use /extended-api/array/accounts or /extended-api/array/transactions"
        })
      } else {
        if (this.options.arrays && this.options.arrays.indexOf(req.query.asset) > -1) {
          let filters: Array<any> = [];
          if (req.query.asset) {
            if (!req.query.contains) {
              res.send({
                "description": "Array query needs a contains argument e.g. `?contains=abc`"
              })
            } else {
              // let obj = {};
              const contains = !isNaN(req.query.contains) ? Number(req.query.contains) : req.query.contains;
              filters.push({[`array_${req.query.asset}`]: contains});

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
            }
          } else {
            res.status(400).send({
              "description": "Asset not allowed",
              "allowedAssets": this.options.assets || []
            });
          }
        }
      }
    });

    app.get('/extended-api/:type', async (req, res) => {
        const limit = req.query.limit || 10;
        const offset = req.query.offset || 0;
        const type = req.params.type === "accounts" ? "Account" : req.params.type === "transactions" ? "Transaction" : null;
        if (!type) {
          res.send({
            "description": "Page not found, use /extended-api/accounts or /extended-api/transactions"
          })
        } else {
          if (this.options.assets && this.options.assets.indexOf(req.query.asset) > -1) {
            let filters: Array<any> = [];
            if (req.query.asset) {
              if (!req.query.contains && !req.query.array) {
                filters.push({asset_exists: req.query.asset});
              }
              if (req.query.contains && !req.query.array) {
                let obj = {};
                const contains = !isNaN(req.query.contains) ? Number(req.query.contains) : req.query.contains;
                _.set(obj, req.query.asset, contains);
                filters.push({asset_contains: JSON.stringify(obj)});
              }
              if (req.query.contains && req.query.array) {
                let obj = {};
                const contains = !isNaN(req.query.contains) ? Number(req.query.contains) : req.query.contains;
                _.set(obj, req.query.asset, contains);
                filters.push({asset_array: req.query.asset, asset_contains: req.query.contains});
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
            }

          } else {
            res.status(400).send({
              "description": "Asset not allowed",
              "allowedAssets": this.options.assets || []
            });
          }
        }

      }
    );

    app
      .listen(this.options.port || 2020);
  }

  async cleanup() {
    const {components} = this.scope;

    this.scope.logger.info('Cleaning extended HTTP API...');

    try {
      if (components !== undefined) {
        for (const key of Object.keys(components)) {
          if (components[key].cleanup) {
            await components[key].cleanup();
          }
        }
      }
    } catch (componentCleanupError) {
      this.scope.logger.error(componentCleanupError);
    }
    this.scope.ogger.info('Cleaned up extended HTTP API successfully');
  }
}
