import { BaseModule } from 'lisk-framework';
export declare class ExtendedHTTPApiModule extends BaseModule {
    extendedHttpApi: any;
    options: any;
    constructor(options: any);
    static get alias(): string;
    static get info(): {
        author: string;
        version: string;
        name: string;
    };
    static get defaults(): {
        type: string;
        properties: {
            httpPort: {
                type: string;
                minimum: number;
                maximum: number;
                env: string;
                arg: string;
            };
            address: {
                type: string;
                format: string;
                env: string;
                arg: string;
            };
            trustProxy: {
                type: string;
            };
            enabled: {
                type: string;
            };
            access: {
                type: string;
                properties: {
                    public: {
                        type: string;
                        env: string;
                    };
                    whiteList: {
                        type: string;
                        env: {
                            variable: string;
                            formatter: string;
                        };
                    };
                };
                required: string[];
            };
            ssl: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    options: {
                        type: string;
                        properties: {
                            port: {
                                type: string;
                            };
                            address: {
                                type: string;
                                format: string;
                            };
                            key: {
                                type: string;
                            };
                            cert: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            options: {
                type: string;
                properties: {
                    limits: {
                        type: string;
                        properties: {
                            max: {
                                type: string;
                            };
                            delayMs: {
                                type: string;
                            };
                            delayAfter: {
                                type: string;
                            };
                            windowMs: {
                                type: string;
                            };
                            headersTimeout: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            serverSetTimeout: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                    cors: {
                        type: string;
                        properties: {
                            origin: {
                                anyOf: {
                                    type: string;
                                }[];
                            };
                            methods: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            forging: {
                type: string;
                properties: {
                    access: {
                        type: string;
                        properties: {
                            whiteList: {
                                type: string;
                                env: {
                                    variable: string;
                                    formatter: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            apm: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    options: {
                        type: string;
                        properties: {
                            name: {
                                type: string;
                            };
                            uriPath: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
        };
        required: string[];
        default: {
            enabled: boolean;
            httpPort: number;
            address: string;
            trustProxy: boolean;
            access: {
                public: boolean;
                whiteList: string[];
            };
            ssl: {
                enabled: boolean;
                options: {
                    port: number;
                    address: string;
                    key: string;
                    cert: string;
                };
            };
            options: {
                limits: {
                    max: number;
                    delayMs: number;
                    delayAfter: number;
                    windowMs: number;
                    headersTimeout: number;
                    serverSetTimeout: number;
                };
                cors: {
                    origin: string;
                    methods: string[];
                };
            };
            forging: {
                access: {
                    whiteList: string[];
                };
            };
            apm: {
                enabled: boolean;
                options: {
                    name: string;
                    uriPath: string;
                };
            };
        };
    };
    get events(): never[];
    get actions(): {};
    load(channel: any): Promise<void>;
    unload(): Promise<any>;
}
