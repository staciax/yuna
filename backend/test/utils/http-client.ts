export type HTTPMethod =
    | (string & {})
    | 'GET'
    | 'OPTIONS'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE';

class BaseClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    handleRequest(request: Request): Promise<Response> {
        return fetch(request);
    }

    buildRequest(method: HTTPMethod, path: string, options?: RequestInit) {
        const url = `${this.baseUrl}${path}`;
        const request = new Request(url, {
            method,
            ...options,
        });
        return request;
    }

    request(method: HTTPMethod, path: string, options?: RequestInit) {
        const request = this.buildRequest(method, path, options);
        return this.handleRequest(request);
    }
}

class Client extends BaseClient {
    get(path: string, options?: RequestInit) {
        return this.request('GET', path, options);
    }

    options(path: string, options?: RequestInit) {
        return this.request('OPTIONS', path, options);
    }

    head(path: string, options?: RequestInit) {
        return this.request('HEAD', path, options);
    }

    post(path: string, options?: RequestInit) {
        return this.request('POST', path, options);
    }

    put(path: string, options?: RequestInit) {
        return this.request('PUT', path, options);
    }

    patch(path: string, options?: RequestInit) {
        return this.request('PATCH', path, options);
    }

    delete(path: string, options?: RequestInit) {
        return this.request('DELETE', path, options);
    }
}

// A basic client for testing purposes

// type MaybePromise<T> = T | Promise<T>;
export type RequestHandler = (request: Request) => Promise<Response>;

export class TestClient extends Client {
    private readonly handle: RequestHandler;

    constructor(handle: RequestHandler, baseUrl = 'http://localhost') {
        super(baseUrl);
        this.handle = handle;
    }

    override handleRequest(request: Request) {
        return this.handle(request);
    }
}
