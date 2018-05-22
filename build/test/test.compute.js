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
var gcp_metadata_1 = require("gcp-metadata");
var nock = require("nock");
var src_1 = require("../src");
nock.disableNetConnect();
var url = 'http://example.com';
var tokenPath = gcp_metadata_1.BASE_PATH + "/instance/service-accounts/default/token";
function mockToken() {
    return nock(gcp_metadata_1.HOST_ADDRESS).get(tokenPath).reply(200, {
        access_token: 'abc123',
        expires_in: 10000
    });
}
function mockExample() {
    return nock(url).get('/').reply(200);
}
// set up compute client.
var compute;
beforeEach(function () {
    compute = new src_1.Compute();
});
afterEach(function () {
    nock.cleanAll();
});
it('should create a dummy refresh token string', function () {
    // It is important that the compute client is created with a refresh token
    // value filled in, or else the rest of the logic will not work.
    var compute = new src_1.Compute();
    assert.equal('compute-placeholder', compute.credentials.refresh_token);
});
it('should get an access token for the first request', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [mockToken(), mockExample()];
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal(compute.credentials.access_token, 'abc123');
                return [2 /*return*/];
        }
    });
}); });
it('should refresh if access token has expired', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [mockToken(), mockExample()];
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() - 10000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'abc123');
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should emit an event for a new access token', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, raisedEvent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [mockToken(), mockExample()];
                raisedEvent = false;
                compute.on('tokens', function (tokens) {
                    assert.equal(tokens.access_token, 'abc123');
                    raisedEvent = true;
                });
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'abc123');
                scopes.forEach(function (s) { return s.done(); });
                assert(raisedEvent);
                return [2 /*return*/];
        }
    });
}); });
it('should refresh if access token will expired soon and time to refresh before expiration is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [mockToken(), mockExample()];
                compute = new src_1.Compute({ eagerRefreshThresholdMillis: 10000 });
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() + 5000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'abc123');
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should not refresh if access token will not expire soon and time to refresh before expiration is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = mockExample();
                compute = new src_1.Compute({ eagerRefreshThresholdMillis: 1000 });
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() + 12000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'initial-access-token');
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should not refresh if access token has not expired', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = mockExample();
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() + 10 * 60 * 1000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'initial-access-token');
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should retry calls to the metadata service if there are network errors', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    nock(gcp_metadata_1.HOST_ADDRESS)
                        .get(tokenPath)
                        .times(2)
                        .replyWithError({ code: 'ENOTFOUND' })
                        .get(tokenPath)
                        .reply(200, { access_token: 'abc123', expires_in: 10000 }),
                    mockExample()
                ];
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() - 10000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'abc123');
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should retry calls to the metadata service if it returns non-200 errors', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    nock(gcp_metadata_1.HOST_ADDRESS)
                        .get(tokenPath)
                        .times(2)
                        .reply(500)
                        .get(tokenPath)
                        .reply(200, { access_token: 'abc123', expires_in: 10000 }),
                    mockExample()
                ];
                compute.credentials.access_token = 'initial-access-token';
                compute.credentials.expiry_date = (new Date()).getTime() - 10000;
                return [4 /*yield*/, compute.request({ url: url })];
            case 1:
                _a.sent();
                assert.equal(compute.credentials.access_token, 'abc123');
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should return false for createScopedRequired', function () {
    assert.equal(false, compute.createScopedRequired());
});
it('should return a helpful message on request response.statusCode 403', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, e_1, err, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Mock the credentials object.  Make sure there's no expiry_date set.
                compute.credentials = {
                    refresh_token: 'hello',
                    access_token: 'goodbye',
                };
                scopes = [
                    nock(url).get('/').reply(403), nock(gcp_metadata_1.HOST_ADDRESS).get(tokenPath).reply(403)
                ];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, compute.request({ url: url })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                err = e_1;
                assert.equal(403, err.response.status);
                expected = 'A Forbidden error was returned while attempting to retrieve an access ' +
                    'token for the Compute Engine built-in service account. This may be because the ' +
                    'Compute Engine instance does not have the correct permission scopes specified. ' +
                    'Could not refresh access token.';
                assert.equal(expected, err.message);
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('should return a helpful message on request response.statusCode 404', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, e_2, err;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Mock the credentials object.
                compute.credentials = {
                    refresh_token: 'hello',
                    access_token: 'goodbye',
                    expiry_date: (new Date(9999, 1, 1)).getTime()
                };
                scope = nock(url).get('/').reply(404);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, compute.request({ url: url })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                scope.done();
                err = e_2;
                assert.equal(404, e_2.response.status);
                assert.equal('A Not Found error was returned while attempting to retrieve an access' +
                    'token for the Compute Engine built-in service account. This may be because the ' +
                    'Compute Engine instance does not have any permission scopes specified.', err.message);
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('should return a helpful message on token refresh response.statusCode 403', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, e_3, err, expected;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(gcp_metadata_1.HOST_ADDRESS).get(tokenPath).twice().reply(403);
                // Mock the credentials object with a null access token, to force a
                // refresh.
                compute.credentials = {
                    refresh_token: 'hello',
                    access_token: undefined,
                    expiry_date: 1
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, compute.request({})];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                err = e_3;
                assert.equal(403, err.response.status);
                expected = 'A Forbidden error was returned while attempting to retrieve an access ' +
                    'token for the Compute Engine built-in service account. This may be because the ' +
                    'Compute Engine instance does not have the correct permission scopes specified. ' +
                    'Could not refresh access token.';
                assert.equal(expected, err.message);
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
it('should return a helpful message on token refresh response.statusCode 404', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, e_4, err;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(gcp_metadata_1.HOST_ADDRESS).get(tokenPath).reply(404);
                // Mock the credentials object with a null access token, to force
                // a refresh.
                compute.credentials = {
                    refresh_token: 'hello',
                    access_token: undefined,
                    expiry_date: 1
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, compute.request({})];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                err = e_4;
                assert.equal(404, e_4.response.status);
                assert.equal('A Not Found error was returned while attempting to retrieve an access' +
                    'token for the Compute Engine built-in service account. This may be because the ' +
                    'Compute Engine instance does not have any permission scopes specified. Could not ' +
                    'refresh access token.', err.message);
                return [2 /*return*/];
            case 4: throw new Error('Expected to throw');
        }
    });
}); });
//# sourceMappingURL=test.compute.js.map