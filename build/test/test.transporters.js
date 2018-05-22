"use strict";
/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var nock = require("nock");
var transporters_1 = require("../src/transporters");
// tslint:disable-next-line no-var-requires
var version = require('../../package.json').version;
var savedEnv = process.env;
afterEach(function () {
    process.env = savedEnv;
});
nock.disableNetConnect();
var defaultUserAgentRE = 'google-api-nodejs-client/\\d+.\\d+.\\d+';
var transporter = new transporters_1.DefaultTransporter();
it('should set default client user agent if none is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var url, scope, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = 'http://example.com';
                scope = nock(url).get('/').reply(200, {});
                return [4 /*yield*/, transporter.request({ url: url })];
            case 1:
                res = _a.sent();
                assert.strictEqual(typeof res.config.adapter, 'function');
                assert.deepStrictEqual(res.config.adapter, require('axios/lib/adapters/http'));
                return [2 /*return*/];
        }
    });
}); });
it('should set default adapter to node.js', function () {
    var opts = transporter.configure();
    var re = new RegExp(defaultUserAgentRE);
    assert(re.test(opts.headers['User-Agent']));
});
it('should append default client user agent to the existing user agent', function () {
    var applicationName = 'MyTestApplication-1.0';
    var opts = transporter.configure({ headers: { 'User-Agent': applicationName }, url: '' });
    var re = new RegExp(applicationName + ' ' + defaultUserAgentRE);
    assert(re.test(opts.headers['User-Agent']));
});
it('should not append default client user agent to the existing user agent more than once', function () {
    var appName = 'MyTestApplication-1.0 google-api-nodejs-client/foobear';
    var opts = transporter.configure({ headers: { 'User-Agent': appName }, url: '' });
    assert.equal(opts.headers['User-Agent'], appName);
});
it('should create a single error from multiple response errors', function (done) {
    var firstError = { message: 'Error 1' };
    var secondError = { message: 'Error 2' };
    var url = 'http://example.com';
    var scope = nock(url).get('/').reply(400, { error: { code: 500, errors: [firstError, secondError] } });
    transporter.request({ url: url }, function (error) {
        scope.done();
        assert.strictEqual(error.message, 'Error 1\nError 2');
        assert.equal(error.code, 500);
        assert.equal(error.errors.length, 2);
        done();
    });
});
it('should return an error for a 404 response', function (done) {
    var url = 'http://example.com';
    var scope = nock(url).get('/').reply(404, 'Not found');
    transporter.request({ url: url }, function (error) {
        scope.done();
        assert.strictEqual(error.message, 'Not found');
        assert.equal(error.code, 404);
        done();
    });
});
it('should return an error if you try to use request config options', function (done) {
    var expected = '\'uri\' is not a valid configuration option. Please use \'url\' instead. This library is using Axios for requests. Please see https://github.com/axios/axios to learn more about the valid request options.';
    transporter.request({
        uri: 'http://example.com/api',
    }, function (error) {
        assert.equal(error.message, expected);
        done();
    });
});
it('should return an error if you try to use request config options with a promise', function () { return __awaiter(_this, void 0, void 0, function () {
    var expected, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                expected = '\'uri\' is not a valid configuration option. Please use \'url\' instead. This library is using Axios for requests. Please see https://github.com/axios/axios to learn more about the valid request options.';
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.request({
                        uri: 'http://example.com/api',
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                assert.equal(e_1.message, expected);
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('should support invocation with async/await', function () { return __awaiter(_this, void 0, void 0, function () {
    var url, scope, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = 'http://example.com';
                scope = nock(url).get('/').reply(200);
                return [4 /*yield*/, transporter.request({ url: url })];
            case 1:
                res = _a.sent();
                scope.done();
                assert.equal(res.status, 200);
                return [2 /*return*/];
        }
    });
}); });
it('should throw if using async/await', function () { return __awaiter(_this, void 0, void 0, function () {
    var url, scope, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = 'http://example.com';
                scope = nock(url).get('/').reply(500, 'florg');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.request({ url: url })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                assert.equal(e_2.message, 'florg');
                scope.done();
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('should work with a callback', function (done) {
    var url = 'http://example.com';
    var scope = nock(url).get('/').reply(200);
    transporter.request({ url: url }, function (err, res) {
        scope.done();
        assert.equal(err, null);
        assert.equal(res.status, 200);
        done();
    });
});
it('should use the http proxy if one is configured', function () { return __awaiter(_this, void 0, void 0, function () {
    var transporter, scope, url, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                process.env['http_proxy'] = 'http://han:solo@proxy-server:1234';
                transporter = new transporters_1.DefaultTransporter();
                scope = nock('http://proxy-server:1234')
                    .get('http://example.com/fake', undefined, {
                    reqheaders: {
                        'host': 'example.com',
                        'accept': /.*/g,
                        'user-agent': /google-api-nodejs-client\/.*/g,
                        'proxy-authorization': /.*/g
                    }
                })
                    .reply(200);
                url = 'http://example.com/fake';
                return [4 /*yield*/, transporter.request({ url: url })];
            case 1:
                result = _a.sent();
                scope.done();
                assert.equal(result.status, 200);
                return [2 /*return*/];
        }
    });
}); });
it('should use the https proxy if one is configured', function () { return __awaiter(_this, void 0, void 0, function () {
    var transporter, scope, url, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                process.env['https_proxy'] = 'https://han:solo@proxy-server:1234';
                transporter = new transporters_1.DefaultTransporter();
                scope = nock('https://proxy-server:1234')
                    .get('https://example.com/fake', undefined, {
                    reqheaders: {
                        'host': 'example.com',
                        'accept': /.*/g,
                        'user-agent': /google-api-nodejs-client\/.*/g,
                        'proxy-authorization': /.*/g
                    }
                })
                    .reply(200);
                url = 'https://example.com/fake';
                return [4 /*yield*/, transporter.request({ url: url })];
            case 1:
                result = _a.sent();
                scope.done();
                assert.equal(result.status, 200);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=test.transporters.js.map