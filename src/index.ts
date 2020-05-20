import { BaseModule } from 'lisk-framework';
import { ExtendedHTTPApi } from './api';
import { defaultConfig } from "./defaults";

export class ExtendedHTTPApiModule extends BaseModule {

    public extendedHttpApi;
    public options;

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
        return defaultConfig;
    }

    get events() {
        return [];
    }

    get actions() {
        return {};
    }

    async load(channel) {
        this.extendedHttpApi = new ExtendedHTTPApi(channel, this.options);

        channel.once('app:ready', async () => {
            await this.extendedHttpApi.bootstrap();
        });
    }

    async unload() {
        return this.extendedHttpApi ? this.extendedHttpApi.cleanup() : true;
    }
}
