"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedHTTPApiModule = void 0;
const lisk_framework_1 = require("lisk-framework");
const api_1 = require("./api");
const defaults_1 = require("./defaults");
class ExtendedHTTPApiModule extends lisk_framework_1.BaseModule {
    constructor(options) {
        super(options);
        this.options = options;
        this.extendedHttpApi = null;
    }
    static get alias() {
        return 'extended_http_api';
    }
    static get info() {
        return {
            author: 'Moosty',
            version: '0.0.1',
            name: 'extended-http-api',
        };
    }
    static get defaults() {
        return defaults_1.defaultConfig;
    }
    get events() {
        return [];
    }
    get actions() {
        return {};
    }
    async load(channel) {
        this.extendedHttpApi = new api_1.ExtendedHTTPApi(channel, this.options);
        channel.once('app:ready', async () => {
            await this.extendedHttpApi.bootstrap();
        });
    }
    async unload() {
        return this.extendedHttpApi ? this.extendedHttpApi.cleanup() : true;
    }
}
exports.ExtendedHTTPApiModule = ExtendedHTTPApiModule;
//# sourceMappingURL=index.js.map