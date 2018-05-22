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
var fs = require("fs");
var jws = require("jws");
var nock = require("nock");
var index_1 = require("../src/index");
var keypair = require('keypair');
var PEM_PATH = './test/fixtures/private.pem';
var PEM_CONTENTS = fs.readFileSync(PEM_PATH, 'utf8');
var P12_PATH = './test/fixtures/key.p12';
nock.disableNetConnect();
// Creates a standard JSON credentials object for testing.
function createJSON() {
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
function createGTokenMock(body) {
    return nock('https://www.googleapis.com')
        .post('/oauth2/v4/token')
        .reply(200, body);
}
// set up the test json and the jwt instance being tested.
var jwt;
var json;
beforeEach(function () {
    json = createJSON();
    jwt = new index_1.JWT();
});
afterEach(function () {
    nock.cleanAll();
});
it('should create a dummy refresh token string', function () {
    // It is important that the compute client is created with a refresh token
    // value filled in, or else the rest of the logic will not work.
    var jwt = new index_1.JWT();
    assert.equal('jwt-placeholder', jwt.credentials.refresh_token);
});
it('should get an initial access token', function (done) {
    var jwt = new index_1.JWT('foo@serviceaccount.com', PEM_PATH, undefined, ['http://bar', 'http://foo'], 'bar@subjectaccount.com');
    var scope = createGTokenMock({ access_token: 'initial-access-token' });
    jwt.authorize(function (err, creds) {
        scope.done();
        assert.equal(err, null);
        assert.notEqual(creds, null);
        assert.equal('foo@serviceaccount.com', jwt.gtoken.iss);
        assert.equal(PEM_PATH, jwt.gtoken.keyFile);
        assert.equal(['http://bar', 'http://foo'].join(' '), jwt.gtoken.scope);
        assert.equal('bar@subjectaccount.com', jwt.gtoken.sub);
        assert.equal('initial-access-token', jwt.credentials.access_token);
        assert.equal(creds.access_token, jwt.credentials.access_token);
        assert.equal(creds.refresh_token, jwt.credentials.refresh_token);
        assert.equal(creds.token_type, jwt.credentials.token_type);
        assert.equal('jwt-placeholder', jwt.credentials.refresh_token);
        assert.equal(PEM_CONTENTS, jwt.key);
        assert.equal('foo@serviceaccount.com', jwt.email);
        done();
    });
});
it('should accept scope as string', function (done) {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: 'http://foo',
        subject: 'bar@subjectaccount.com'
    });
    var scope = createGTokenMock({ access_token: 'initial-access-token' });
    jwt.authorize(function (err, creds) {
        scope.done();
        assert.equal('http://foo', jwt.gtoken.scope);
        done();
    });
});
it('can get obtain new access token when scopes are set', function (done) {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = { refresh_token: 'jwt-placeholder' };
    var scope = createGTokenMock({ access_token: 'initial-access-token' });
    jwt.getAccessToken(function (err, got) {
        scope.done();
        assert.strictEqual(null, err, 'no error was expected: got\n' + err);
        assert.strictEqual('initial-access-token', got, 'the access token was wrong: ' + got);
        done();
    });
});
it('should emit an event for tokens', function (done) {
    var accessToken = 'initial-access-token';
    var scope = createGTokenMock({ access_token: accessToken });
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.on('tokens', function (tokens) {
        assert.equal(tokens.access_token, accessToken);
        scope.done();
        done();
    }).getAccessToken();
});
it('can obtain new access token when scopes are set', function (done) {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = { refresh_token: 'jwt-placeholder' };
    var wantedToken = 'abc123';
    var want = 'Bearer ' + wantedToken;
    var scope = createGTokenMock({ access_token: wantedToken });
    jwt.getRequestMetadata(null, function (err, result) {
        scope.done();
        assert.strictEqual(null, err, 'no error was expected: got\n' + err);
        var got = result;
        assert.strictEqual(want, got.Authorization, 'the authorization header was wrong: ' + got.Authorization);
        done();
    });
});
it('gets a jwt header access token', function (done) {
    var keys = keypair(1024 /* bitsize of private key */);
    var email = 'foo@serviceaccount.com';
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        key: keys.private,
        subject: 'ignored@subjectaccount.com'
    });
    jwt.credentials = { refresh_token: 'jwt-placeholder' };
    var testUri = 'http:/example.com/my_test_service';
    jwt.getRequestMetadata(testUri, function (err, result) {
        var got = result;
        assert.strictEqual(null, err, 'no error was expected: got\n' + err);
        assert.notStrictEqual(null, got, 'the creds should be present');
        var decoded = jws.decode(got.Authorization.replace('Bearer ', ''));
        var payload = JSON.parse(decoded.payload);
        assert.strictEqual(email, payload.iss);
        assert.strictEqual(email, payload.sub);
        assert.strictEqual(testUri, payload.aud);
        done();
    });
});
it('should accept additionalClaims', function () { return __awaiter(_this, void 0, void 0, function () {
    var keys, email, someClaim, jwt, testUri, headers, got, decoded, payload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                keys = keypair(1024 /* bitsize of private key */);
                email = 'foo@serviceaccount.com';
                someClaim = 'cat-on-my-desk';
                jwt = new index_1.JWT({
                    email: 'foo@serviceaccount.com',
                    key: keys.private,
                    subject: 'ignored@subjectaccount.com',
                    additionalClaims: { someClaim: someClaim }
                });
                jwt.credentials = { refresh_token: 'jwt-placeholder' };
                testUri = 'http:/example.com/my_test_service';
                return [4 /*yield*/, jwt.getRequestMetadata(testUri)];
            case 1:
                headers = (_a.sent()).headers;
                got = headers;
                assert.notStrictEqual(null, got, 'the creds should be present');
                decoded = jws.decode(got.Authorization.replace('Bearer ', ''));
                payload = JSON.parse(decoded.payload);
                assert.strictEqual(testUri, payload.aud);
                assert.strictEqual(someClaim, payload.someClaim);
                return [2 /*return*/];
        }
    });
}); });
it('should accept additionalClaims that include a target_audience', function () { return __awaiter(_this, void 0, void 0, function () {
    var keys, email, jwt, testUri, scope, headers, got, decoded;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                keys = keypair(1024 /* bitsize of private key */);
                email = 'foo@serviceaccount.com';
                jwt = new index_1.JWT({
                    email: 'foo@serviceaccount.com',
                    key: keys.private,
                    subject: 'ignored@subjectaccount.com',
                    additionalClaims: { target_audience: 'applause' }
                });
                jwt.credentials = { refresh_token: 'jwt-placeholder' };
                testUri = 'http:/example.com/my_test_service';
                scope = createGTokenMock({ id_token: 'abc123' });
                return [4 /*yield*/, jwt.getRequestMetadata(testUri)];
            case 1:
                headers = (_a.sent()).headers;
                scope.done();
                got = headers;
                assert.notStrictEqual(null, got, 'the creds should be present');
                decoded = got.Authorization.replace('Bearer ', '');
                assert.strictEqual(decoded, 'abc123');
                return [2 /*return*/];
        }
    });
}); });
it('should refresh token if missing access token', function (done) {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = { refresh_token: 'jwt-placeholder' };
    var scope = createGTokenMock({ access_token: 'abc123' });
    jwt.request({ url: 'http://bar' }, function () {
        scope.done();
        assert.equal('abc123', jwt.credentials.access_token);
        done();
    });
});
it('should unify the promise when refreshing the token', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    createGTokenMock({ access_token: 'abc123' }),
                    nock('http://example.com').get('/').thrice().reply(200)
                ];
                jwt = new index_1.JWT({
                    email: 'foo@serviceaccount.com',
                    keyFile: PEM_PATH,
                    scopes: ['http://bar', 'http://foo'],
                    subject: 'bar@subjectaccount.com'
                });
                jwt.credentials = { refresh_token: 'jwt-placeholder' };
                return [4 /*yield*/, Promise.all([
                        jwt.request({ url: 'http://example.com' }),
                        jwt.request({ url: 'http://example.com' }),
                        jwt.request({ url: 'http://example.com' })
                    ])];
            case 1:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal('abc123', jwt.credentials.access_token);
                return [2 /*return*/];
        }
    });
}); });
it('should clear the cached refresh token promise after completion', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, jwt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    createGTokenMock({ access_token: 'abc123' }),
                    createGTokenMock({ access_token: 'abc123' }),
                    nock('http://example.com').get('/').twice().reply(200)
                ];
                jwt = new index_1.JWT({
                    email: 'foo@serviceaccount.com',
                    keyFile: PEM_PATH,
                    scopes: ['http://bar', 'http://foo'],
                    subject: 'bar@subjectaccount.com'
                });
                jwt.credentials = { refresh_token: 'refresh-token-placeholder' };
                return [4 /*yield*/, jwt.request({ url: 'http://example.com' })];
            case 1:
                _a.sent();
                jwt.credentials.access_token = null;
                return [4 /*yield*/, jwt.request({ url: 'http://example.com' })];
            case 2:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal('abc123', jwt.credentials.access_token);
                return [2 /*return*/];
        }
    });
}); });
it('should refresh token if expired', function (done) {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = {
        access_token: 'woot',
        refresh_token: 'jwt-placeholder',
        expiry_date: (new Date()).getTime() - 1000
    };
    var scope = createGTokenMock({ access_token: 'abc123' });
    jwt.request({ url: 'http://bar' }, function () {
        scope.done();
        assert.equal('abc123', jwt.credentials.access_token);
        done();
    });
});
it('should refresh if access token will expired soon and time to refresh before expiration is set', function (done) {
    var auth = new index_1.GoogleAuth();
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com',
        eagerRefreshThresholdMillis: 1000
    });
    jwt.credentials = {
        access_token: 'woot',
        refresh_token: 'jwt-placeholder',
        expiry_date: (new Date()).getTime() + 800
    };
    var scope = createGTokenMock({ access_token: 'abc123' });
    jwt.request({ url: 'http://bar' }, function () {
        scope.done();
        assert.equal('abc123', jwt.credentials.access_token);
        done();
    });
});
it('should not refresh if access token will not expire soon and time to refresh before expiration is set', function (done) {
    var scope = createGTokenMock({ access_token: 'abc123', expires_in: 10000 });
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com',
        eagerRefreshThresholdMillis: 1000
    });
    jwt.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'jwt-placeholder',
        expiry_date: (new Date()).getTime() + 5000
    };
    jwt.request({ url: 'http://bar' }, function () {
        assert.equal('initial-access-token', jwt.credentials.access_token);
        assert.equal(false, scope.isDone());
        done();
    });
});
it('should refresh token if the server returns 403', function (done) {
    nock('http://example.com').get('/access').twice().reply(403);
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: PEM_PATH,
        scopes: ['http://example.com'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = {
        access_token: 'woot',
        refresh_token: 'jwt-placeholder',
        expiry_date: (new Date()).getTime() + 5000
    };
    var scope = createGTokenMock({ access_token: 'abc123' });
    jwt.request({ url: 'http://example.com/access' }, function () {
        scope.done();
        assert.equal('abc123', jwt.credentials.access_token);
        done();
    });
});
it('should not refresh if not expired', function (done) {
    var scope = createGTokenMock({ access_token: 'abc123', expires_in: 10000 });
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'jwt-placeholder',
        expiry_date: (new Date()).getTime() + 5000
    };
    jwt.request({ url: 'http://bar' }, function () {
        assert.equal('initial-access-token', jwt.credentials.access_token);
        assert.equal(false, scope.isDone());
        done();
    });
});
it('should assume access token is not expired', function (done) {
    var scope = createGTokenMock({ access_token: 'abc123', expires_in: 10000 });
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    jwt.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'jwt-placeholder'
    };
    jwt.request({ url: 'http://bar' }, function () {
        assert.equal('initial-access-token', jwt.credentials.access_token);
        assert.equal(false, scope.isDone());
        done();
    });
});
it('should return expiry_date in milliseconds', function () { return __awaiter(_this, void 0, void 0, function () {
    var jwt, scope, result, dateInMillis, expiryDate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt = new index_1.JWT({
                    email: 'foo@serviceaccount.com',
                    keyFile: PEM_PATH,
                    scopes: ['http://bar', 'http://foo'],
                    subject: 'bar@subjectaccount.com'
                });
                jwt.credentials = { refresh_token: 'jwt-placeholder' };
                scope = createGTokenMock({ access_token: 'token', expires_in: 100 });
                jwt.credentials.access_token = null;
                return [4 /*yield*/, jwt.getRequestMetadata()];
            case 1:
                result = _a.sent();
                scope.done();
                dateInMillis = (new Date()).getTime();
                expiryDate = new Date(jwt.credentials.expiry_date);
                assert.equal(dateInMillis.toString().length, jwt.credentials.expiry_date.toString().length);
                return [2 /*return*/];
        }
    });
}); });
it('createScoped should clone stuff', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped('x');
    assert.equal(jwt.email, clone.email);
    assert.equal(jwt.keyFile, clone.keyFile);
    assert.equal(jwt.key, clone.key);
    assert.equal(jwt.subject, clone.subject);
});
it('createScoped should handle string scope', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped('newscope');
    assert.equal('newscope', clone.scopes);
});
it('createScoped should handle array scope', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped(['gorilla', 'chimpanzee', 'orangutan']);
    assert.equal(3, clone.scopes.length);
    assert.equal('gorilla', clone.scopes[0]);
    assert.equal('chimpanzee', clone.scopes[1]);
    assert.equal('orangutan', clone.scopes[2]);
});
it('createScoped should handle null scope', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped();
    assert.equal(null, clone.scopes);
});
it('createScoped should set scope when scope was null', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped('hi');
    assert.equal('hi', clone.scopes);
});
it('createScoped should handle nulls', function () {
    var jwt = new index_1.JWT();
    var clone = jwt.createScoped('hi');
    assert.equal(jwt.email, null);
    assert.equal(jwt.keyFile, null);
    assert.equal(jwt.key, null);
    assert.equal(jwt.subject, null);
    assert.equal('hi', clone.scopes);
});
it('createScoped should not return the original instance', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    var clone = jwt.createScoped('hi');
    assert.notEqual(jwt, clone);
});
it('createScopedRequired should return true when scopes is null', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(true, jwt.createScopedRequired());
});
it('createScopedRequired should return true when scopes is an empty array', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: [],
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(true, jwt.createScopedRequired());
});
it('createScopedRequired should return true when scopes is an empty string', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: '',
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(true, jwt.createScopedRequired());
});
it('createScopedRequired should return false when scopes is a filled-in string', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: 'http://foo',
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(false, jwt.createScopedRequired());
});
it('createScopedRequired should return false when scopes is a filled-in array', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: ['http://bar', 'http://foo'],
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(false, jwt.createScopedRequired());
});
it('createScopedRequired should return false when scopes is not an array or a string, but can be used as a string', function () {
    var jwt = new index_1.JWT({
        email: 'foo@serviceaccount.com',
        keyFile: '/path/to/key.pem',
        scopes: '2',
        subject: 'bar@subjectaccount.com'
    });
    assert.equal(false, jwt.createScopedRequired());
});
it('fromJson should error on null json', function () {
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        jwt.fromJSON(null);
    });
});
it('fromJson should error on empty json', function () {
    assert.throws(function () {
        jwt.fromJSON({});
    });
});
it('fromJson should error on missing client_email', function () {
    delete json.client_email;
    assert.throws(function () {
        jwt.fromJSON(json);
    });
});
it('fromJson should error on missing private_key', function () {
    delete json.private_key;
    assert.throws(function () {
        jwt.fromJSON(json);
    });
});
it('fromJson should create JWT with client_email', function () {
    var result = jwt.fromJSON(json);
    assert.equal(json.client_email, jwt.email);
});
it('fromJson should create JWT with private_key', function () {
    var result = jwt.fromJSON(json);
    assert.equal(json.private_key, jwt.key);
});
it('fromJson should create JWT with null scopes', function () {
    var result = jwt.fromJSON(json);
    assert.equal(null, jwt.scopes);
});
it('fromJson should create JWT with null subject', function () {
    var result = jwt.fromJSON(json);
    assert.equal(null, jwt.subject);
});
it('fromJson should create JWT with null keyFile', function () {
    var result = jwt.fromJSON(json);
    assert.equal(null, jwt.keyFile);
});
it('should error on missing client_id', function () {
    var json = createRefreshJSON();
    delete json.client_id;
    var jwt = new index_1.JWT();
    assert.throws(function () {
        jwt.fromJSON(json);
    });
});
it('should error on missing client_secret', function () {
    var json = createRefreshJSON();
    delete json.client_secret;
    var jwt = new index_1.JWT();
    assert.throws(function () {
        jwt.fromJSON(json);
    });
});
it('should error on missing refresh_token', function () {
    var json = createRefreshJSON();
    delete json.refresh_token;
    var jwt = new index_1.JWT();
    assert.throws(function () {
        jwt.fromJSON(json);
    });
});
it('fromStream should error on null stream', function (done) {
    // Test verifies invalid parameter tests, which requires cast to any.
    // tslint:disable-next-line no-any
    jwt.fromStream(null, function (err) {
        assert.equal(true, err instanceof Error);
        done();
    });
});
it('fromStream should read the stream and create a jwt', function (done) {
    // Read the contents of the file into a json object.
    var fileContents = fs.readFileSync('./test/fixtures/private.json', 'utf-8');
    var json = JSON.parse(fileContents);
    // Now open a stream on the same file.
    var stream = fs.createReadStream('./test/fixtures/private.json');
    // And pass it into the fromStream method.
    jwt.fromStream(stream, function (err) {
        assert.equal(null, err);
        // Ensure that the correct bits were pulled from the stream.
        assert.equal(json.private_key, jwt.key);
        assert.equal(json.client_email, jwt.email);
        assert.equal(null, jwt.keyFile);
        assert.equal(null, jwt.subject);
        assert.equal(null, jwt.scopes);
        done();
    });
});
it('fromAPIKey should error without api key', function () {
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        jwt.fromAPIKey(undefined);
    });
});
it('fromAPIKey should error with invalid api key type', function () {
    var KEY = 'test';
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        jwt.fromAPIKey({ key: KEY });
    });
});
it('fromAPIKey should set the .apiKey property on the instance', function () {
    var KEY = 'test';
    var result = jwt.fromAPIKey(KEY);
    assert.strictEqual(jwt.apiKey, KEY);
});
it('getCredentials should handle a key', function () { return __awaiter(_this, void 0, void 0, function () {
    var jwt, private_key;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                jwt = new index_1.JWT({ key: PEM_CONTENTS });
                return [4 /*yield*/, jwt.getCredentials()];
            case 1:
                private_key = (_a.sent()).private_key;
                assert.equal(private_key, PEM_CONTENTS);
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should handle a p12 keyFile', function () { return __awaiter(_this, void 0, void 0, function () {
    var jwt, _a, private_key, client_email;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                jwt = new index_1.JWT({ keyFile: P12_PATH });
                return [4 /*yield*/, jwt.getCredentials()];
            case 1:
                _a = _b.sent(), private_key = _a.private_key, client_email = _a.client_email;
                assert(private_key);
                assert.equal(client_email, undefined);
                return [2 /*return*/];
        }
    });
}); });
it('getCredentials should handle a json keyFile', function () { return __awaiter(_this, void 0, void 0, function () {
    var jwt, _a, private_key, client_email;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                jwt = new index_1.JWT();
                jwt.fromJSON(json);
                return [4 /*yield*/, jwt.getCredentials()];
            case 1:
                _a = _b.sent(), private_key = _a.private_key, client_email = _a.client_email;
                assert.equal(private_key, json.private_key);
                assert.equal(client_email, json.client_email);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=test.jwt.js.map