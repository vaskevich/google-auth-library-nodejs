"use strict";
/**
 * Copyright 2014 Google Inc. All Rights Reserved.
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
var child_process = require("child_process");
var fs = require("fs");
var gcp_metadata_1 = require("gcp-metadata");
var nock = require("nock");
var path = require("path");
var sinon = require("sinon");
var src_1 = require("../src");
var envDetect = require("../src/auth/envDetect");
nock.disableNetConnect();
var tokenPath = gcp_metadata_1.BASE_PATH + "/instance/service-accounts/default/token";
var host = gcp_metadata_1.HOST_ADDRESS;
var instancePath = gcp_metadata_1.BASE_PATH + "/instance";
var svcAccountPath = instancePath + "/service-accounts/?recursive=true";
var API_KEY = 'test-123';
var STUB_PROJECT = 'my-awesome-project';
var ENDPOINT = '/events:report';
var RESPONSE_BODY = 'RESPONSE_BODY';
var BASE_URL = [
    'https://clouderrorreporting.googleapis.com/v1beta1/projects', STUB_PROJECT
].join('/');
var privateJSON = require('../../test/fixtures/private.json');
var private2JSON = require('../../test/fixtures/private2.json');
var refreshJSON = require('../../test/fixtures/refresh.json');
var fixedProjectId = 'my-awesome-project';
var auth;
var sandbox;
beforeEach(function () {
    auth = new src_1.GoogleAuth();
});
afterEach(function () {
    nock.cleanAll();
    // after each test, reset the env vars
    if (sandbox) {
        sandbox.restore();
        sandbox = undefined;
    }
});
function nockIsGCE() {
    return nock(host).get(instancePath).reply(200, {}, {
        'metadata-flavor': 'Google'
    });
}
function nockNotGCE() {
    return nock(host).get(instancePath).replyWithError({ code: 'ETIMEDOUT' });
}
function nockENOTFOUND() {
    return nock(host).get(instancePath).replyWithError({ code: 'ENOTFOUND' });
}
function nockErrGCE() {
    return nock(host).get(instancePath).reply(500);
}
function nock404GCE() {
    return nock(host).get(instancePath).reply(404);
}
function createGetProjectIdNock(projectId) {
    return nock(host)
        .get(gcp_metadata_1.BASE_PATH + "/project/project-id")
        .reply(200, projectId, { 'metadata-flavor': 'Google' });
}
// Creates a standard JSON auth object for testing.
function createJwtJSON() {
    return {
        private_key_id: 'key123',
        private_key: 'privatekey',
        client_email: 'hello@youarecool.com',
        client_id: 'client123',
        type: 'service_account'
    };
}
function createRefreshJSON() {
    return {
        client_secret: 'privatekey',
        client_id: 'client123',
        refresh_token: 'refreshtoken',
        type: 'authorized_user'
    };
}
// Pretend that we're GCE, and mock an access token.
function mockGCE() {
    var scope1 = nockIsGCE();
    blockGoogleApplicationCredentialEnvironmentVariable();
    var auth = new src_1.GoogleAuth();
    auth._fileExists = function () { return false; };
    var scope2 = nock(gcp_metadata_1.HOST_ADDRESS).get(tokenPath).reply(200, {
        access_token: 'abc123',
        expires_in: 10000
    });
    return { auth: auth, scopes: [scope1, scope2] };
}
// Matches the ending of a string.
function stringEndsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
// Simulates a path join.
function pathJoin(item1, item2) {
    return item1 + ':' + item2;
}
// Blocks the GOOGLE_APPLICATION_CREDENTIALS by default. This is necessary in
// case it is actually set on the host machine executing the test.
function blockGoogleApplicationCredentialEnvironmentVariable() {
    return mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS');
}
// Intercepts the specified environment variable, returning the specified value.
function mockEnvVar(name, value) {
    if (value === void 0) { value = ''; }
    if (!sandbox) {
        sandbox = sinon.createSandbox();
    }
    var envVars = Object.assign({}, process.env, (_a = {}, _a[name] = value, _a));
    var stub = sandbox.stub(process, 'env').value(envVars);
    return stub;
    var _a;
}
// Intercepts the specified file path and inserts the mock file path.
function insertWellKnownFilePathIntoAuth(auth, filePath, mockFilePath) {
    var originalMockWellKnownFilePathFunction = auth._mockWellKnownFilePath;
    auth._mockWellKnownFilePath = function (kfpath) {
        if (kfpath === filePath) {
            return mockFilePath;
        }
        return originalMockWellKnownFilePathFunction(filePath);
    };
}
it('fromJSON should support the instantiated named export', function () {
    var result = auth.fromJSON(createJwtJSON());
    assert(result);
});
it('fromJson should error on null json', function () {
    var auth = new src_1.GoogleAuth();
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        auth.fromJSON(null);
    });
});
it('fromAPIKey should error given an invalid api key', function () {
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        auth.fromAPIKey(null);
    });
});
it('should make a request with the api key', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, client, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(BASE_URL).post(ENDPOINT).query({ key: API_KEY }).reply(function (uri) {
                    assert(uri.indexOf('key=' + API_KEY) > -1);
                    return [200, RESPONSE_BODY];
                });
                client = auth.fromAPIKey(API_KEY);
                return [4 /*yield*/, client.request({ url: BASE_URL + ENDPOINT, method: 'POST', data: { 'test': true } })];
            case 1:
                res = _a.sent();
                assert.strictEqual(RESPONSE_BODY, res.data);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should make a request while preserving original parameters', function () { return __awaiter(_this, void 0, void 0, function () {
    var OTHER_QS_PARAM, scope, client, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                OTHER_QS_PARAM = { test: 'abc' };
                scope = nock(BASE_URL)
                    .post(ENDPOINT)
                    .query({ test: OTHER_QS_PARAM.test, key: API_KEY })
                    .reply(function (uri) {
                    assert(uri.indexOf('key=' + API_KEY) > -1);
                    assert(uri.indexOf('test=' + OTHER_QS_PARAM.test) > -1);
                    return [200, RESPONSE_BODY];
                });
                client = auth.fromAPIKey(API_KEY);
                return [4 /*yield*/, client.request({
                        url: BASE_URL + ENDPOINT,
                        method: 'POST',
                        data: { 'test': true },
                        params: OTHER_QS_PARAM
                    })];
            case 1:
                res = _a.sent();
                assert.strictEqual(RESPONSE_BODY, res.data);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should make client with eagerRetryThresholdMillis set', function () {
    var client = auth.fromAPIKey(API_KEY, { eagerRefreshThresholdMillis: 100 });
    assert.equal(100, client.eagerRefreshThresholdMillis);
});
it('fromJSON should error on empty json', function () {
    var auth = new src_1.GoogleAuth();
    assert.throws(function () {
        auth.fromJSON({});
    });
});
it('fromJSON should error on missing client_email', function () {
    var json = createJwtJSON();
    delete json.client_email;
    assert.throws(function () {
        auth.fromJSON(json);
    });
});
it('fromJSON should error on missing private_key', function () {
    var json = createJwtJSON();
    delete json.private_key;
    assert.throws(function () {
        auth.fromJSON(json);
    });
});
it('fromJSON should create JWT with client_email', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(json.client_email, result.email);
});
it('fromJSON should create JWT with private_key', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(json.private_key, result.key);
});
it('fromJSON should create JWT with null scopes', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(null, result.scopes);
});
it('fromJSON should create JWT with null subject', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(null, result.subject);
});
it('fromJSON should create JWT with null keyFile', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(null, result.keyFile);
});
it('fromJSON should create JWT which eagerRefreshThresholdMillisset when this is set for GoogleAuth', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json, { eagerRefreshThresholdMillis: 5000 });
    assert.equal(5000, result.eagerRefreshThresholdMillis);
});
it('fromJSON should create JWT with 5min as value for eagerRefreshThresholdMillis', function () {
    var json = createJwtJSON();
    var result = auth.fromJSON(json);
    assert.equal(300000, result.eagerRefreshThresholdMillis);
});
it('fromStream should error on null stream', function (done) {
    // Test verifies invalid parameter tests, which requires cast to any.
    // tslint:disable-next-line no-any
    auth.fromStream(null, function (err) {
        assert.equal(true, err instanceof Error);
        done();
    });
});
it('fromStream should read the stream and create a jwt', function () { return __awaiter(_this, void 0, void 0, function () {
    var stream, res, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stream = fs.createReadStream('./test/fixtures/private.json');
                return [4 /*yield*/, auth.fromStream(stream)];
            case 1:
                res = _a.sent();
                jwt = res;
                // Ensure that the correct bits were pulled from the stream.
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                return [2 /*return*/];
        }
    });
}); });
it('fromStream should read the stream and create a jwt with eager refresh', function () { return __awaiter(_this, void 0, void 0, function () {
    var stream, auth, result, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stream = fs.createReadStream('./test/fixtures/private.json');
                auth = new src_1.GoogleAuth();
                return [4 /*yield*/, auth.fromStream(stream, { eagerRefreshThresholdMillis: 1000 * 60 * 60 })];
            case 1:
                result = _a.sent();
                jwt = result;
                // Ensure that the correct bits were pulled from the stream.
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                assert.equal(1000 * 60 * 60, jwt.eagerRefreshThresholdMillis);
                return [2 /*return*/];
        }
    });
}); });
it('should read another stream and create a UserRefreshClient', function () { return __awaiter(_this, void 0, void 0, function () {
    var stream, auth, res, rc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stream = fs.createReadStream('./test/fixtures/refresh.json');
                auth = new src_1.GoogleAuth();
                return [4 /*yield*/, auth.fromStream(stream)];
            case 1:
                res = _a.sent();
                rc = res;
                assert.equal(refreshJSON.client_id, rc._clientId);
                assert.equal(refreshJSON.client_secret, rc._clientSecret);
                assert.equal(refreshJSON.refresh_token, rc._refreshToken);
                return [2 /*return*/];
        }
    });
}); });
it('should read another stream and create a UserRefreshClient with eager refresh', function () { return __awaiter(_this, void 0, void 0, function () {
    var stream, auth, result, rc;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stream = fs.createReadStream('./test/fixtures/refresh.json');
                auth = new src_1.GoogleAuth();
                return [4 /*yield*/, auth.fromStream(stream, { eagerRefreshThresholdMillis: 100 })];
            case 1:
                result = _a.sent();
                rc = result;
                assert.equal(refreshJSON.client_id, rc._clientId);
                assert.equal(refreshJSON.client_secret, rc._clientSecret);
                assert.equal(refreshJSON.refresh_token, rc._refreshToken);
                assert.equal(100, rc.eagerRefreshThresholdMillis);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should not error on valid symlink', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/goodlink')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on invalid symlink', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/badlink')];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on valid link to invalid data', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/emptylink')];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on null file path', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath(null)];
            case 1:
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_3 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on empty file path', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('')];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_4 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on non-string file path', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath(2)];
            case 1:
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on invalid file path', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./nonexistantfile.json')];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_6 = _a.sent();
                return [2 /*return*/];
            case 3:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should error on directory', function () { return __awaiter(_this, void 0, void 0, function () {
    var directory, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                directory = './test/fixtures';
                assert.equal(true, fs.lstatSync(directory).isDirectory());
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath(directory)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_7 = _a.sent();
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should handle errors thrown from createReadStream', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to throw from the createReadStream method.
                auth._createReadStream = function () {
                    throw new Error('Han and Chewbacca');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/private.json')];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_8 = _a.sent();
                assert.equal(true, stringEndsWith(e_8.message, 'Han and Chewbacca'));
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should handle errors thrown from fromStream', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to throw from the fromStream method.
                auth.fromStream = function () {
                    throw new Error('Darth Maul');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/private.json')];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_9 = _a.sent();
                assert(stringEndsWith(e_9.message, 'Darth Maul'));
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should handle errors passed from fromStream', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return an error from the fromStream method.
                auth.fromStream = function (streamInput) {
                    throw new Error('Princess Leia');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/private.json')];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_10 = _a.sent();
                assert(stringEndsWith(e_10.message, 'Princess Leia'));
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should correctly read the file and create a valid JWT', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/private.json')];
            case 1:
                result = _a.sent();
                assert(result);
                jwt = result;
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationCredentialsFromFilePath should correctly read the file and create a valid JWT with eager refresh', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, auth._getApplicationCredentialsFromFilePath('./test/fixtures/private.json', { eagerRefreshThresholdMillis: 7000 })];
            case 1:
                result = _a.sent();
                assert(result);
                jwt = result;
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                assert.equal(7000, jwt.eagerRefreshThresholdMillis);
                return [2 /*return*/];
        }
    });
}); });
it('tryGetApplicationCredentialsFromEnvironmentVariable should return null when env const is not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return a null path string.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 1:
                client = _a.sent();
                assert.equal(client, null);
                return [2 /*return*/];
        }
    });
}); });
it('tryGetApplicationCredentialsFromEnvironmentVariable should return null when env const is empty string', function () { return __awaiter(_this, void 0, void 0, function () {
    var stub, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stub = mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 1:
                client = _a.sent();
                assert.equal(client, null);
                return [2 /*return*/];
        }
    });
}); });
it('tryGetApplicationCredentialsFromEnvironmentVariable should handle invalid environment variable', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return a path to an invalid file.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './nonexistantfile.json');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_11 = _a.sent();
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('tryGetApplicationCredentialsFromEnvironmentVariable should handle valid environment variable', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return path to a valid credentials file.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 1:
                result = _a.sent();
                jwt = result;
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                return [2 /*return*/];
        }
    });
}); });
it('tryGetApplicationCredentialsFromEnvironmentVariable should handle valid environment variable when there is eager refresh set', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return path to a valid credentials file.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable({ eagerRefreshThresholdMillis: 60 * 60 * 1000 })];
            case 1:
                result = _a.sent();
                jwt = result;
                assert.equal(privateJSON.private_key, jwt.key);
                assert.equal(privateJSON.client_email, jwt.email);
                assert.equal(null, jwt.keyFile);
                assert.equal(null, jwt.subject);
                assert.equal(null, jwt.scope);
                assert.equal(60 * 60 * 1000, jwt.eagerRefreshThresholdMillis);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should build the correct directory for Windows', function () { return __awaiter(_this, void 0, void 0, function () {
    var correctLocation, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                correctLocation = false;
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath = function (filePath) {
                    if (filePath === 'foo:gcloud:application_default_credentials.json') {
                        correctLocation = true;
                    }
                    return Promise.resolve({});
                };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert(result);
                assert(correctLocation);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should build the correct directory for non-Windows', function () {
    var correctLocation = false;
    blockGoogleApplicationCredentialEnvironmentVariable();
    mockEnvVar('HOME', 'foo');
    auth._pathJoin = pathJoin;
    auth._osPlatform = function () { return 'linux'; };
    auth._fileExists = function () { return true; };
    auth._getApplicationCredentialsFromFilePath = function (filePath) {
        if (filePath ===
            'foo:.config:gcloud:application_default_credentials.json') {
            correctLocation = true;
        }
        return Promise.resolve({});
    };
    var client = auth._tryGetApplicationCredentialsFromWellKnownFile();
    assert(client);
    assert(correctLocation);
});
it('_tryGetApplicationCredentialsFromWellKnownFile should fail on Windows when APPDATA is not defined', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath =
                    function (filePath) {
                        return Promise.resolve({});
                    };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal(null, result);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should fail on non-Windows when HOME is not defined', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('HOME');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'linux'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath =
                    function (filePath) {
                        return Promise.resolve({});
                    };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal(null, result);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should fail on Windows when file does not exist', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return false; };
                auth._getApplicationCredentialsFromFilePath =
                    function (filePath) {
                        return Promise.resolve({});
                    };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal(null, result);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should fail on non-Windows when file does not exist', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('HOME', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'linux'; };
                auth._fileExists = function () { return false; };
                auth._getApplicationCredentialsFromFilePath =
                    function (filePath) {
                        return Promise.resolve({});
                    };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal(null, result);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should succeeds on Windows', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath = function (filePath) {
                    return Promise.resolve(new src_1.JWT('hello'));
                };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal('hello', result.email);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should succeeds on non-Windows', function () { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('HOME', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'linux'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath = function (filePath) {
                    return Promise.resolve(new src_1.JWT('hello'));
                };
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 1:
                result = _a.sent();
                assert.equal('hello', result.email);
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should pass along a failure on Windows', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath = function (filePath) {
                    throw new Error('hello');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_12 = _a.sent();
                assert(e_12);
                assert.equal('hello', e_12.message);
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('_tryGetApplicationCredentialsFromWellKnownFile should pass along a failure on non-Windows', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('HOME', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'linux'; };
                auth._fileExists = function () { return true; };
                auth._getApplicationCredentialsFromFilePath = function (filePath) {
                    throw new Error('hello');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromWellKnownFile()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_13 = _a.sent();
                assert.equal('hello', e_13.message);
                return [2 /*return*/];
            case 4:
                assert.fail('failed to throw');
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should return a new projectId the first time and a cached projectId the second time', function () { return __awaiter(_this, void 0, void 0, function () {
    var setUpAuthForEnvironmentVariable, projectIdPromise, projectId, anyd, projectId2, auth2, getProjectIdPromise;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                setUpAuthForEnvironmentVariable = function (creds) {
                    mockEnvVar('GCLOUD_PROJECT', fixedProjectId);
                    creds._fileExists = function () { return false; };
                };
                setUpAuthForEnvironmentVariable(auth);
                projectIdPromise = auth.getDefaultProjectId();
                return [4 /*yield*/, projectIdPromise];
            case 1:
                projectId = _a.sent();
                assert.equal(projectId, fixedProjectId);
                anyd = auth;
                anyd.getProductionProjectId = null;
                anyd.getFileProjectId = null;
                anyd.getDefaultServiceProjectId = null;
                anyd.getGCEProjectId = null;
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 2:
                projectId2 = _a.sent();
                // Make sure we get the original cached projectId back
                assert.equal(fixedProjectId, projectId2);
                auth2 = new src_1.GoogleAuth();
                setUpAuthForEnvironmentVariable(auth2);
                getProjectIdPromise = auth2.getDefaultProjectId();
                assert.notEqual(getProjectIdPromise, projectIdPromise);
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should use GCLOUD_PROJECT environment variable when it is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var projectId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mockEnvVar('GCLOUD_PROJECT', fixedProjectId);
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 1:
                projectId = _a.sent();
                assert.equal(projectId, fixedProjectId);
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should use GOOGLE_CLOUD_PROJECT environment variable when it is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var projectId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mockEnvVar('GOOGLE_CLOUD_PROJECT', fixedProjectId);
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 1:
                projectId = _a.sent();
                assert.equal(projectId, fixedProjectId);
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should use GOOGLE_APPLICATION_CREDENTIALS file when it is available', function () { return __awaiter(_this, void 0, void 0, function () {
    var projectId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', path.join(__dirname, '../../test/fixtures/private2.json'));
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 1:
                projectId = _a.sent();
                assert.equal(projectId, fixedProjectId);
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should use Cloud SDK when it is available and env vars are not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var stdout, stub, projectId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is not set.
                // * Well-known file is set up to point to private2.json
                // * Running on GCE is set to true.
                sandbox = sinon.createSandbox();
                blockGoogleApplicationCredentialEnvironmentVariable();
                stdout = JSON.stringify({ configuration: { properties: { core: { project: fixedProjectId } } } });
                stub = sandbox.stub(child_process, 'exec')
                    .callsArgWith(1, null, stdout, null);
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 1:
                projectId = _a.sent();
                assert(stub.calledOnce);
                assert.equal(projectId, fixedProjectId);
                return [2 /*return*/];
        }
    });
}); });
it('getDefaultProjectId should use GCE when well-known file and env const are not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var stub, scope, projectId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                sandbox = sinon.createSandbox();
                stub = sandbox.stub(child_process, 'exec').callsArgWith(1, null, '', null);
                scope = createGetProjectIdNock(fixedProjectId);
                return [4 /*yield*/, auth.getDefaultProjectId()];
            case 1:
                projectId = _a.sent();
                assert(stub.calledOnce);
                assert.equal(projectId, fixedProjectId);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationDefault should return a new credential the first time and a cached credential the second time', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, result, cachedCredential, result2, auth2, result3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nockNotGCE();
                // Create a function which will set up a GoogleAuth instance to match
                // on an environment variable json file, but not on anything else.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                auth._fileExists = function () { return false; };
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                result = _a.sent();
                assert.notEqual(null, result);
                cachedCredential = result.credential;
                // Make sure our special test bit is not set yet, indicating that
                // this is a new credentials instance.
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                assert.equal(null, cachedCredential.specialTestBit);
                // Now set the special test bit.
                // Test verifies invalid parameter tests, which requires cast to any.
                // tslint:disable-next-line no-any
                cachedCredential.specialTestBit = 'monkey';
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 2:
                result2 = (_a.sent()).credential;
                assert.notEqual(null, result2);
                // Make sure the special test bit is set on the credentials we got
                // back, indicating that we got cached credentials. Also make sure
                // the object instance is the same.
                // Test verifies invalid parameter tests, which requires cast to
                // any.
                // tslint:disable-next-line no-any
                assert.equal('monkey', result2.specialTestBit);
                assert.equal(cachedCredential, result2);
                auth2 = new src_1.GoogleAuth();
                auth2._fileExists = function () { return false; };
                return [4 /*yield*/, auth2.getApplicationDefault()];
            case 3:
                result3 = (_a.sent()).credential;
                assert.notEqual(null, result3);
                // Make sure we get a new (non-cached) credential instance back.
                // Test verifies invalid parameter tests, which requires cast to
                // any.
                // tslint:disable-next-line no-any
                assert.equal(null, result3.specialTestBit);
                assert.notEqual(cachedCredential, result3);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationDefault should cache the credential when using GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, result, cachedCredential, result2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                blockGoogleApplicationCredentialEnvironmentVariable();
                auth._fileExists = function () { return false; };
                scope = nockIsGCE();
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                result = _a.sent();
                scope.done();
                assert.notEqual(null, result);
                cachedCredential = result.credential;
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 2:
                result2 = (_a.sent()).credential;
                assert.notEqual(null, result2);
                // Make sure it's the same object
                assert.equal(cachedCredential, result2);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationDefault should use environment variable when it is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var res, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is set up to point to private.json
                // * Well-known file is set up to point to private2.json
                // * Running on GCE is set to true.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                nockIsGCE();
                insertWellKnownFilePathIntoAuth(auth, 'foo:gcloud:application_default_credentials.json', './test/fixtures/private2.json');
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                res = _a.sent();
                client = res.credential;
                assert.equal(privateJSON.private_key, client.key);
                assert.equal(privateJSON.client_email, client.email);
                assert.equal(null, client.keyFile);
                assert.equal(null, client.subject);
                assert.equal(null, client.scope);
                return [2 /*return*/];
        }
    });
}); });
it('should use well-known file when it is available and env const is not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var res, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is not set.
                // * Well-known file is set up to point to private2.json
                // * Running on GCE is set to true.
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                nockIsGCE();
                insertWellKnownFilePathIntoAuth(auth, 'foo:gcloud:application_default_credentials.json', './test/fixtures/private2.json');
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                res = _a.sent();
                client = res.credential;
                assert.equal(private2JSON.private_key, client.key);
                assert.equal(private2JSON.client_email, client.email);
                assert.equal(null, client.keyFile);
                assert.equal(null, client.subject);
                assert.equal(null, client.scope);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationDefault should use GCE when well-known file and env const are not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is not set.
                // * Well-known file is not set.
                // * Running on GCE is set to true.
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return false; };
                scope = nockIsGCE();
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                res = _a.sent();
                scope.done();
                // This indicates that we got a ComputeClient instance back, rather than a
                // JWTClient.
                assert.equal('compute-placeholder', res.credential.credentials.refresh_token);
                return [2 /*return*/];
        }
    });
}); });
it('getApplicationDefault should report GCE error when checking for GCE fails', function () { return __awaiter(_this, void 0, void 0, function () {
    var e_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is not set.
                // * Well-known file is not set.
                // * Running on GCE is set to true.
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return false; };
                auth._checkIsGCE = function () {
                    throw new Error('fake error');
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_14 = _a.sent();
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('getApplicationDefault should also get project ID', function () { return __awaiter(_this, void 0, void 0, function () {
    var res, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up the creds.
                // * Environment variable is set up to point to private.json
                // * Well-known file is set up to point to private2.json
                // * Running on GCE is set to true.
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                mockEnvVar('GCLOUD_PROJECT', fixedProjectId);
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._checkIsGCE = function () { return Promise.resolve(true); };
                insertWellKnownFilePathIntoAuth(auth, 'foo:gcloud:application_default_credentials.json', './test/fixtures/private2.json');
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                res = _a.sent();
                client = res.credential;
                assert.equal(privateJSON.private_key, client.key);
                assert.equal(privateJSON.client_email, client.email);
                assert.equal(res.projectId, fixedProjectId);
                assert.equal(null, client.keyFile);
                assert.equal(null, client.subject);
                assert.equal(null, client.scope);
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE should set the _isGCE flag when running on GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, isGCE;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scope = nockIsGCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.equal(true, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE should not set the _isGCE flag when not running on GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, isGCE;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nockNotGCE();
                assert.notEqual(true, auth.isGCE);
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.equal(false, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE should retry the check for isGCE if it fails the first time', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, isGCE;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scopes = [nockErrGCE(), nockIsGCE()];
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.equal(true, auth.isGCE);
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should not retry the check for isGCE if it fails with a 404', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, isGCE;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scope = nock404GCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.notEqual(true, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE should not retry the check for isGCE if it fails with an ENOTFOUND', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, isGCE;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scope = nockENOTFOUND();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.notEqual(true, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE does not execute the second time when running on GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, isGCE2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // This test relies on the nock mock only getting called once.
                assert.notEqual(true, auth.isGCE);
                scope = nockIsGCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                _a.sent();
                assert.equal(true, auth.isGCE);
                return [4 /*yield*/, auth._checkIsGCE()];
            case 2:
                isGCE2 = _a.sent();
                assert.equal(true, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE does not execute the second time when not running on GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scope = nockNotGCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                _a.sent();
                assert.equal(false, auth.isGCE);
                return [4 /*yield*/, auth._checkIsGCE()];
            case 2:
                _a.sent();
                assert.equal(false, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('_checkIsGCE returns false on transport error', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.notEqual(true, auth.isGCE);
                scope = nockErrGCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                _a.sent();
                assert.equal(false, auth.isGCE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should get metadata from the server when running on GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var isGCE, response, scope, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nockIsGCE();
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                isGCE = _a.sent();
                assert.equal(true, auth.isGCE);
                response = {
                    default: {
                        email: 'test-creds@test-creds.iam.gserviceaccount.com',
                        private_key: null
                    }
                };
                nock.cleanAll();
                scope = nock(host).get(svcAccountPath).reply(200, response, {
                    'Metadata-Flavor': 'Google'
                });
                return [4 /*yield*/, auth.getCredentials()];
            case 2:
                body = _a.sent();
                assert(body);
                assert.equal(body.client_email, 'test-creds@test-creds.iam.gserviceaccount.com');
                assert.equal(body.private_key, null);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should error if metadata server is not reachable', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, e_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [nockIsGCE(), nock(gcp_metadata_1.HOST_ADDRESS).get(svcAccountPath).reply(404)];
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                _a.sent();
                assert.equal(true, auth.isGCE);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, auth.getCredentials()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_15 = _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
            case 5: throw new Error('Expected to throw');
        }
    });
}); });
it('getCredentials should error if body is empty', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, e_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [nockIsGCE(), nock(gcp_metadata_1.HOST_ADDRESS).get(svcAccountPath).reply(200, {})];
                return [4 /*yield*/, auth._checkIsGCE()];
            case 1:
                _a.sent();
                assert.equal(true, auth.isGCE);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, auth.getCredentials()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_16 = _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
            case 5: throw new Error('Expected to throw');
        }
    });
}); });
it('getCredentials should handle valid environment variable', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return path to a valid credentials file.
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS', './test/fixtures/private.json');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 1:
                result = _a.sent();
                assert(result);
                jwt = result;
                return [4 /*yield*/, auth.getCredentials()];
            case 2:
                body = _a.sent();
                assert.notEqual(null, body);
                assert.equal(jwt.email, body.client_email);
                assert.equal(jwt.key, body.private_key);
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should handle valid file path', function () { return __awaiter(_this, void 0, void 0, function () {
    var result, jwt, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return path to a valid credentials file.
                blockGoogleApplicationCredentialEnvironmentVariable();
                mockEnvVar('APPDATA', 'foo');
                auth._pathJoin = pathJoin;
                auth._osPlatform = function () { return 'win32'; };
                auth._fileExists = function () { return true; };
                auth._checkIsGCE = function () { return Promise.resolve(true); };
                insertWellKnownFilePathIntoAuth(auth, 'foo:gcloud:application_default_credentials.json', './test/fixtures/private2.json');
                return [4 /*yield*/, auth.getApplicationDefault()];
            case 1:
                result = _a.sent();
                assert(result);
                jwt = result.credential;
                return [4 /*yield*/, auth.getCredentials()];
            case 2:
                body = _a.sent();
                assert.notEqual(null, body);
                assert.equal(jwt.email, body.client_email);
                assert.equal(jwt.key, body.private_key);
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should return error when env const is not set', function () { return __awaiter(_this, void 0, void 0, function () {
    var client, e_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up a mock to return a null path string
                mockEnvVar('GOOGLE_APPLICATION_CREDENTIALS');
                return [4 /*yield*/, auth._tryGetApplicationCredentialsFromEnvironmentVariable()];
            case 1:
                client = _a.sent();
                assert.equal(null, client);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, auth.getCredentials()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_17 = _a.sent();
                return [2 /*return*/];
            case 5: throw new Error('Expected to throw');
        }
    });
}); });
it('should use jsonContent if available', function () { return __awaiter(_this, void 0, void 0, function () {
    var json, result, body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                json = createJwtJSON();
                result = auth.fromJSON(json);
                return [4 /*yield*/, auth.getCredentials()];
            case 1:
                body = _a.sent();
                assert.notEqual(body, null);
                assert.equal(body.client_email, 'hello@youarecool.com');
                return [2 /*return*/];
        }
    });
}); });
it('should accept keyFilename to get a client', function () { return __awaiter(_this, void 0, void 0, function () {
    var auth, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                auth = new src_1.GoogleAuth({ keyFilename: './test/fixtures/private.json' });
                return [4 /*yield*/, auth.getClient()];
            case 1:
                client = _a.sent();
                assert.equal(client.email, 'hello@youarecool.com');
                return [2 /*return*/];
        }
    });
}); });
it('should accept credentials to get a client', function () { return __awaiter(_this, void 0, void 0, function () {
    var credentials, auth, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                credentials = require('../../test/fixtures/private.json');
                auth = new src_1.GoogleAuth({ credentials: credentials });
                return [4 /*yield*/, auth.getClient()];
            case 1:
                client = _a.sent();
                assert.equal(client.email, 'hello@youarecool.com');
                return [2 /*return*/];
        }
    });
}); });
it('should prefer credentials over keyFilename', function () { return __awaiter(_this, void 0, void 0, function () {
    var credentials, auth, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                credentials = Object.assign(require('../../test/fixtures/private.json'), { client_email: 'hello@butiamcooler.com' });
                auth = new src_1.GoogleAuth({ credentials: credentials, keyFilename: './test/fixtures/private.json' });
                return [4 /*yield*/, auth.getClient()];
            case 1:
                client = _a.sent();
                assert.equal(client.email, credentials.client_email);
                return [2 /*return*/];
        }
    });
}); });
it('should allow passing scopes to get a client', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, keyFilename, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = ['http://examples.com/is/a/scope'];
                keyFilename = './test/fixtures/private.json';
                return [4 /*yield*/, auth.getClient({ scopes: scopes, keyFilename: keyFilename })];
            case 1:
                client = _a.sent();
                assert.equal(client.scopes, scopes);
                return [2 /*return*/];
        }
    });
}); });
it('should allow passing a scope to get a client', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, keyFilename, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = 'http://examples.com/is/a/scope';
                keyFilename = './test/fixtures/private.json';
                return [4 /*yield*/, auth.getClient({ scopes: scopes, keyFilename: keyFilename })];
            case 1:
                client = _a.sent();
                assert.equal(client.scopes, scopes);
                return [2 /*return*/];
        }
    });
}); });
it('should get an access token', function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, auth, scopes, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                return [4 /*yield*/, auth.getAccessToken()];
            case 1:
                token = _b.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal(token, 'abc123');
                return [2 /*return*/];
        }
    });
}); });
it('should get request headers', function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, auth, scopes, headers;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                return [4 /*yield*/, auth.getRequestHeaders()];
            case 1:
                headers = _b.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.deepEqual(headers, { Authorization: 'Bearer abc123' });
                return [2 /*return*/];
        }
    });
}); });
it('should authorize the request', function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, auth, scopes, opts;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                return [4 /*yield*/, auth.authorizeRequest({ url: 'http://example.com' })];
            case 1:
                opts = _b.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.deepEqual(opts.headers, { Authorization: 'Bearer abc123' });
                return [2 /*return*/];
        }
    });
}); });
it('should get the current environment if GCE', function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, auth, scopes, env;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                envDetect.clear();
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                return [4 /*yield*/, auth.getEnv()];
            case 1:
                env = _b.sent();
                assert.equal(env, envDetect.GCPEnv.COMPUTE_ENGINE);
                return [2 /*return*/];
        }
    });
}); });
it('should get the current environment if GKE', function () { return __awaiter(_this, void 0, void 0, function () {
    var _a, auth, scopes, scope, env, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                envDetect.clear();
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                scope = nock(host)
                    .get(instancePath + "/attributes/cluster-name")
                    .reply(200, {}, (_b = {}, _b[gcp_metadata_1.HEADER_NAME.toLowerCase()] = 'Google', _b));
                return [4 /*yield*/, auth.getEnv()];
            case 1:
                env = _c.sent();
                assert.equal(env, envDetect.GCPEnv.KUBERNETES_ENGINE);
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should get the current environment if GCF', function () { return __awaiter(_this, void 0, void 0, function () {
    var env;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                envDetect.clear();
                mockEnvVar('FUNCTION_NAME', 'DOGGY');
                return [4 /*yield*/, auth.getEnv()];
            case 1:
                env = _a.sent();
                assert.equal(env, envDetect.GCPEnv.CLOUD_FUNCTIONS);
                return [2 /*return*/];
        }
    });
}); });
it('should get the current environment if GAE', function () { return __awaiter(_this, void 0, void 0, function () {
    var env;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                envDetect.clear();
                mockEnvVar('GAE_SERVICE', 'KITTY');
                return [4 /*yield*/, auth.getEnv()];
            case 1:
                env = _a.sent();
                assert.equal(env, envDetect.GCPEnv.APP_ENGINE);
                return [2 /*return*/];
        }
    });
}); });
it('should make the request', function () { return __awaiter(_this, void 0, void 0, function () {
    var url, _a, auth, scopes, data, scope, res;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                url = 'http://example.com';
                _a = mockGCE(), auth = _a.auth, scopes = _a.scopes;
                data = { breakfast: 'coffee' };
                scope = nock(url).get('/').reply(200, data);
                scopes.push(scope);
                return [4 /*yield*/, auth.request({ url: url })];
            case 1:
                res = _b.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.deepEqual(res.data, data);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=test.googleauth.js.map