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
var crypto = require("crypto");
var fs = require("fs");
var nock = require("nock");
var path = require("path");
var qs = require("querystring");
var url = require("url");
var src_1 = require("../src");
var loginticket_1 = require("../src/auth/loginticket");
nock.disableNetConnect();
var CLIENT_ID = 'CLIENT_ID';
var CLIENT_SECRET = 'CLIENT_SECRET';
var REDIRECT_URI = 'REDIRECT';
var ACCESS_TYPE = 'offline';
var SCOPE = 'scopex';
var SCOPE_ARRAY = ['scopex', 'scopey'];
var publicKey = fs.readFileSync('./test/fixtures/public.pem', 'utf-8');
var privateKey = fs.readFileSync('./test/fixtures/private.pem', 'utf-8');
var baseUrl = 'https://www.googleapis.com';
var certsPath = '/oauth2/v1/certs';
var certsResPath = path.join(__dirname, '../../test/fixtures/oauthcerts.json');
var client;
beforeEach(function () {
    client = new src_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
});
afterEach(function () {
    nock.cleanAll();
});
it('should generate a valid consent page url', function (done) {
    var opts = {
        access_type: ACCESS_TYPE,
        scope: SCOPE,
        response_type: 'code token'
    };
    var oauth2client = new src_1.OAuth2Client({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        redirectUri: REDIRECT_URI
    });
    var generated = oauth2client.generateAuthUrl(opts);
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.response_type, 'code token');
    assert.equal(query.access_type, ACCESS_TYPE);
    assert.equal(query.scope, SCOPE);
    assert.equal(query.client_id, CLIENT_ID);
    assert.equal(query.redirect_uri, REDIRECT_URI);
    done();
});
it('should throw an error if generateAuthUrl is called with invalid parameters', function () {
    var opts = {
        access_type: ACCESS_TYPE,
        scope: SCOPE,
        code_challenge_method: src_1.CodeChallengeMethod.S256
    };
    try {
        var generated = client.generateAuthUrl(opts);
        assert.fail('Expected to throw');
    }
    catch (e) {
        assert.equal(e.message, 'If a code_challenge_method is provided, code_challenge must be included.');
    }
});
it('should generate a valid code verifier and resulting challenge', function () {
    var codes = client.generateCodeVerifier();
    // ensure the code_verifier matches all requirements
    assert.equal(codes.codeVerifier.length, 128);
    var match = codes.codeVerifier.match(/[a-zA-Z0-9\-\.~_]*/);
    assert(match);
    if (!match)
        return;
    assert(match.length > 0 && match[0] === codes.codeVerifier);
});
it('should include code challenge and method in the url', function () {
    var codes = client.generateCodeVerifier();
    var authUrl = client.generateAuthUrl({
        code_challenge: codes.codeChallenge,
        code_challenge_method: src_1.CodeChallengeMethod.S256
    });
    var parsed = url.parse(authUrl);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var props = qs.parse(parsed.query);
    assert.equal(props.code_challenge, codes.codeChallenge);
    assert.equal(props.code_challenge_method, src_1.CodeChallengeMethod.S256);
});
it('should verifyIdToken properly', function () { return __awaiter(_this, void 0, void 0, function () {
    var fakeCerts, idToken, audience, maxExpiry, payload, scope, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fakeCerts = { a: 'a', b: 'b' };
                idToken = 'idToken';
                audience = 'fakeAudience';
                maxExpiry = 5;
                payload = { aud: 'aud', sub: 'sub', iss: 'iss', iat: 1514162443, exp: 1514166043 };
                scope = nock(baseUrl).get('/oauth2/v1/certs').reply(200, fakeCerts);
                client.verifySignedJwtWithCerts =
                    function (jwt, certs, requiredAudience, issuers, theMaxExpiry) {
                        assert.equal(jwt, idToken);
                        assert.equal(JSON.stringify(certs), JSON.stringify(fakeCerts));
                        assert.equal(requiredAudience, audience);
                        assert.equal(theMaxExpiry, maxExpiry);
                        return new loginticket_1.LoginTicket('c', payload);
                    };
                return [4 /*yield*/, client.verifyIdToken({ idToken: idToken, audience: audience, maxExpiry: maxExpiry })];
            case 1:
                result = _a.sent();
                scope.done();
                assert.notEqual(result, null);
                if (result) {
                    assert.equal(result.getEnvelope(), 'c');
                    assert.equal(result.getPayload(), payload);
                }
                return [2 /*return*/];
        }
    });
}); });
it('should provide a reasonable error in verifyIdToken with wrong parameters', function () { return __awaiter(_this, void 0, void 0, function () {
    var fakeCerts, idToken, audience, payload, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fakeCerts = { a: 'a', b: 'b' };
                idToken = 'idToken';
                audience = 'fakeAudience';
                payload = { aud: 'aud', sub: 'sub', iss: 'iss', iat: 1514162443, exp: 1514166043 };
                client.verifySignedJwtWithCerts =
                    function (jwt, certs, requiredAudience, issuers, theMaxExpiry) {
                        assert.equal(jwt, idToken);
                        assert.equal(JSON.stringify(certs), JSON.stringify(fakeCerts));
                        assert.equal(requiredAudience, audience);
                        return new loginticket_1.LoginTicket('c', payload);
                    };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                // tslint:disable-next-line no-any
                return [4 /*yield*/, client.verifyIdToken(idToken, audience)];
            case 2:
                // tslint:disable-next-line no-any
                _a.sent();
                throw new Error('Expected to throw');
            case 3:
                e_1 = _a.sent();
                assert.equal(e_1.message, 'This method accepts an options object as the first parameter, which includes the idToken, audience, and maxExpiry.');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
it('should allow scopes to be specified as array', function () {
    var opts = {
        access_type: ACCESS_TYPE,
        scope: SCOPE_ARRAY,
        response_type: 'code token'
    };
    var generated = client.generateAuthUrl(opts);
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.scope, SCOPE_ARRAY.join(' '));
});
it('should set response_type param to code if none is given while generating the consent page url', function () {
    var generated = client.generateAuthUrl();
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.response_type, 'code');
});
it('should verify a valid certificate against a jwt', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = JSON.stringify({ kid: 'keyid', alg: 'RS256' });
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    var login = client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    assert.equal(login.getUserId(), '123456789');
});
it('should fail due to invalid audience', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"wrongaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Wrong recipient/);
});
it('should fail due to invalid array of audiences', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"wrongaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    var validAudiences = ['testaudience', 'extra-audience'];
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, validAudiences);
    }, /Wrong recipient/);
});
it('should fail due to invalid signature', function () {
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":1393241597,' +
        '"exp":1393245497' +
        '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    // Originally: data += '.'+signature;
    data += signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Wrong number of segments/);
});
it('should fail due to invalid envelope', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid"' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Can\'t parse token envelope/);
});
it('should fail due to invalid payload', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer"' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Can\'t parse token payload/);
});
it('should fail due to invalid signature', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64') + '.' +
        'broken-signature';
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Invalid token signature/);
});
it('should fail due to no expiration date', function () {
    var now = new Date().getTime() / 1000;
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /No expiration time/);
});
it('should fail due to no issue time', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /No issue time/);
});
it('should fail due to certificate with expiration date in future', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (2 * maxLifetimeSecs);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Expiration time too far in future/);
});
it('should pass due to expiration date in future with adjusted max expiry', function () {
    var maxLifetimeSecs = 86400;
    var now = new Date().getTime() / 1000;
    var expiry = now + (2 * maxLifetimeSecs);
    var maxExpiry = (3 * maxLifetimeSecs);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience', ['testissuer'], maxExpiry);
});
it('should fail due to token being used to early', function () {
    var maxLifetimeSecs = 86400;
    var clockSkews = 300;
    var now = (new Date().getTime() / 1000);
    var expiry = now + (maxLifetimeSecs / 2);
    var issueTime = now + (clockSkews * 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + issueTime + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Token used too early/);
});
it('should fail due to token being used to late', function () {
    var maxLifetimeSecs = 86400;
    var clockSkews = 300;
    var now = (new Date().getTime() / 1000);
    var expiry = now - (maxLifetimeSecs / 2);
    var issueTime = now - (clockSkews * 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + issueTime + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience');
    }, /Token used too late/);
});
it('should fail due to invalid issuer', function () {
    var maxLifetimeSecs = 86400;
    var now = (new Date().getTime() / 1000);
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"invalidissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    assert.throws(function () {
        client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience', ['testissuer']);
    }, /Invalid issuer/);
});
it('should pass due to valid issuer', function () {
    var maxLifetimeSecs = 86400;
    var now = (new Date().getTime() / 1000);
    var expiry = now + (maxLifetimeSecs / 2);
    var idToken = '{' +
        '"iss":"testissuer",' +
        '"aud":"testaudience",' +
        '"azp":"testauthorisedparty",' +
        '"email_verified":"true",' +
        '"id":"123456789",' +
        '"sub":"123456789",' +
        '"email":"test@test.com",' +
        '"iat":' + now + ',' +
        '"exp":' + expiry + '}';
    var envelope = '{' +
        '"kid":"keyid",' +
        '"alg":"RS256"' +
        '}';
    var data = new Buffer(envelope).toString('base64') + '.' +
        new Buffer(idToken).toString('base64');
    var signer = crypto.createSign('sha256');
    signer.update(data);
    var signature = signer.sign(privateKey, 'base64');
    data += '.' + signature;
    client.verifySignedJwtWithCerts(data, { keyid: publicKey }, 'testaudience', ['testissuer']);
});
it('should be able to retrieve a list of Google certificates', function (done) {
    var scope = nock(baseUrl).get(certsPath).replyWithFile(200, certsResPath);
    client.getFederatedSignonCerts(function (err, certs) {
        assert.equal(err, null);
        assert.equal(Object.keys(certs).length, 2);
        assert.notEqual(certs.a15eea964ab9cce480e5ef4f47cb17b9fa7d0b21, null);
        assert.notEqual(certs['39596dc3a3f12aa74b481579e4ec944f86d24b95'], null);
        scope.done();
        done();
    });
});
it('should be able to retrieve a list of Google certificates from cache again', function (done) {
    var scope = nock(baseUrl)
        .defaultReplyHeaders({
        'Cache-Control': 'public, max-age=23641, must-revalidate, no-transform',
        'Content-Type': 'application/json'
    })
        .get(certsPath)
        .replyWithFile(200, certsResPath);
    client.getFederatedSignonCerts(function (err, certs) {
        assert.equal(err, null);
        assert.equal(Object.keys(certs).length, 2);
        scope.done(); // has retrieved from nock... nock no longer will reply
        client.getFederatedSignonCerts(function (err2, certs2) {
            assert.equal(err2, null);
            assert.equal(Object.keys(certs2).length, 2);
            scope.done();
            done();
        });
    });
});
it('should set redirect_uri if not provided in options', function () {
    var generated = client.generateAuthUrl({});
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.redirect_uri, REDIRECT_URI);
});
it('should set client_id if not provided in options', function () {
    var generated = client.generateAuthUrl({});
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.client_id, CLIENT_ID);
});
it('should override redirect_uri if provided in options', function () {
    var generated = client.generateAuthUrl({ redirect_uri: 'overridden' });
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.redirect_uri, 'overridden');
});
it('should override client_id if provided in options', function () {
    var generated = client.generateAuthUrl({ client_id: 'client_override' });
    var parsed = url.parse(generated);
    if (typeof parsed.query !== 'string') {
        throw new Error('Unable to parse querystring');
    }
    var query = qs.parse(parsed.query);
    assert.equal(query.client_id, 'client_override');
});
it('should return error in callback on request', function (done) {
    client.request({}, function (err, result) {
        assert.equal(err.message, 'No access, refresh token or API key is set.');
        assert.equal(result, null);
        done();
    });
});
it('should return error in callback on refreshAccessToken', function (done) {
    client.refreshAccessToken(function (err, result) {
        assert.equal(err.message, 'No refresh token is set.');
        assert.equal(result, null);
        done();
    });
});
function mockExample() {
    return [
        nock(baseUrl)
            .post('/oauth2/v4/token', undefined, { reqheaders: { 'content-type': 'application/x-www-form-urlencoded' } })
            .reply(200, { access_token: 'abc123', expires_in: 1 }),
        nock('http://example.com').get('/').reply(200)
    ];
}
it('should refresh token if missing access token', function (done) {
    var scopes = mockExample();
    var accessToken = 'abc123';
    var raisedEvent = false;
    var refreshToken = 'refresh-token-placeholder';
    client.credentials = { refresh_token: refreshToken };
    // ensure the tokens event is raised
    client.on('tokens', function (tokens) {
        assert.equal(tokens.access_token, accessToken);
        raisedEvent = true;
    });
    client.request({ url: 'http://example.com' }, function (err) {
        scopes.forEach(function (s) { return s.done(); });
        assert(raisedEvent);
        assert.equal(accessToken, client.credentials.access_token);
        done();
    });
});
it('should unify the promise when refreshing the token', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    nock(baseUrl)
                        .post('/oauth2/v4/token', undefined, { reqheaders: { 'content-type': 'application/x-www-form-urlencoded' } })
                        .reply(200, { access_token: 'abc123', expires_in: 1 }),
                    nock('http://example.com').get('/').thrice().reply(200)
                ];
                client.credentials = { refresh_token: 'refresh-token-placeholder' };
                return [4 /*yield*/, Promise.all([
                        client.request({ url: 'http://example.com' }),
                        client.request({ url: 'http://example.com' }),
                        client.request({ url: 'http://example.com' })
                    ])];
            case 1:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal('abc123', client.credentials.access_token);
                return [2 /*return*/];
        }
    });
}); });
it('should clear the cached refresh token promise after completion', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    nock(baseUrl)
                        .post('/oauth2/v4/token', undefined, {
                        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
                    })
                        .twice()
                        .reply(200, { access_token: 'abc123', expires_in: 100000 }),
                    nock('http://example.com').get('/').twice().reply(200)
                ];
                client.credentials = { refresh_token: 'refresh-token-placeholder' };
                return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 1:
                _a.sent();
                client.credentials.access_token = null;
                return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 2:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal('abc123', client.credentials.access_token);
                return [2 /*return*/];
        }
    });
}); });
it('should clear the cached refresh token promise after throw', function () { return __awaiter(_this, void 0, void 0, function () {
    var scopes, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scopes = [
                    nock(baseUrl)
                        .post('/oauth2/v4/token', undefined, { reqheaders: { 'content-type': 'application/x-www-form-urlencoded' } })
                        .reply(500)
                        .post('/oauth2/v4/token', undefined, { reqheaders: { 'content-type': 'application/x-www-form-urlencoded' } })
                        .reply(200, { access_token: 'abc123', expires_in: 100000 }),
                    nock('http://example.com').get('/').reply(200)
                ];
                client.credentials = { refresh_token: 'refresh-token-placeholder' };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 5:
                _a.sent();
                scopes.forEach(function (s) { return s.done(); });
                assert.equal('abc123', client.credentials.access_token);
                return [2 /*return*/];
        }
    });
}); });
it('should refresh if access token is expired', function (done) {
    client.setCredentials({
        access_token: 'initial-access-token',
        refresh_token: 'refresh-token-placeholder',
        expiry_date: (new Date()).getTime() - 1000
    });
    var scopes = mockExample();
    client.request({ url: 'http://example.com' }, function () {
        scopes.forEach(function (s) { return s.done(); });
        assert.equal('abc123', client.credentials.access_token);
        done();
    });
});
it('should refresh if access token will expired soon and time to refresh before expiration is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var client, scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = new src_1.OAuth2Client({
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    redirectUri: REDIRECT_URI,
                    eagerRefreshThresholdMillis: 5000
                });
                client.credentials = {
                    access_token: 'initial-access-token',
                    refresh_token: 'refresh-token-placeholder',
                    expiry_date: (new Date()).getTime() + 3000
                };
                scopes = mockExample();
                return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 1:
                _a.sent();
                assert.equal('abc123', client.credentials.access_token);
                scopes.forEach(function (s) { return s.done(); });
                return [2 /*return*/];
        }
    });
}); });
it('should not refresh if access token will not expire soon and time to refresh before expiration is set', function () { return __awaiter(_this, void 0, void 0, function () {
    var client, scopes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = new src_1.OAuth2Client({
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    redirectUri: REDIRECT_URI,
                    eagerRefreshThresholdMillis: 5000
                });
                client.credentials = {
                    access_token: 'initial-access-token',
                    refresh_token: 'refresh-token-placeholder',
                    expiry_date: (new Date()).getTime() + 10000,
                };
                scopes = mockExample();
                return [4 /*yield*/, client.request({ url: 'http://example.com' })];
            case 1:
                _a.sent();
                assert.equal('initial-access-token', client.credentials.access_token);
                assert.equal(false, scopes[0].isDone());
                scopes[1].done();
                return [2 /*return*/];
        }
    });
}); });
it('should not refresh if not expired', function (done) {
    client.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'refresh-token-placeholder',
        expiry_date: (new Date()).getTime() + 500000
    };
    var scopes = mockExample();
    client.request({ url: 'http://example.com' }, function () {
        assert.equal('initial-access-token', client.credentials.access_token);
        assert.equal(false, scopes[0].isDone());
        scopes[1].done();
        done();
    });
});
it('should assume access token is not expired', function (done) {
    client.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'refresh-token-placeholder'
    };
    var scopes = mockExample();
    client.request({ url: 'http://example.com' }, function () {
        assert.equal('initial-access-token', client.credentials.access_token);
        assert.equal(false, scopes[0].isDone());
        scopes[1].done();
        done();
    });
});
[401, 403].forEach(function (code) {
    it("should refresh token if the server returns " + code, function (done) {
        var scope = nock('http://example.com').get('/access').reply(code, {
            error: { code: code, message: 'Invalid Credentials' }
        });
        var scopes = mockExample();
        client.credentials = {
            access_token: 'initial-access-token',
            refresh_token: 'refresh-token-placeholder'
        };
        client.request({ url: 'http://example.com/access' }, function (err) {
            scope.done();
            scopes[0].done();
            assert.equal('abc123', client.credentials.access_token);
            done();
        });
    });
});
it('should not retry requests with streaming data', function (done) {
    var s = fs.createReadStream('./test/fixtures/public.pem');
    var scope = nock('http://example.com').post('/').reply(401);
    client.credentials = {
        access_token: 'initial-access-token',
        refresh_token: 'refresh-token-placeholder'
    };
    client.request({ method: 'POST', url: 'http://example.com', data: s }, function (err) {
        scope.done();
        var e = err;
        assert(e);
        assert.equal(e.response.status, 401);
        done();
    });
});
it('should revoke credentials if access token present', function (done) {
    var scope = nock('https://accounts.google.com')
        .get('/o/oauth2/revoke?token=abc')
        .reply(200, { success: true });
    client.credentials = { access_token: 'abc', refresh_token: 'abc' };
    client.revokeCredentials(function (err, result) {
        assert.equal(err, null);
        assert.equal(result.data.success, true);
        assert.equal(JSON.stringify(client.credentials), '{}');
        scope.done();
        done();
    });
});
it('should clear credentials and return error if no access token to revoke', function (done) {
    client.credentials = { refresh_token: 'abc' };
    client.revokeCredentials(function (err, result) {
        assert.equal(err.message, 'No access token to revoke.');
        assert.equal(result, null);
        assert.equal(JSON.stringify(client.credentials), '{}');
        done();
    });
});
it('getToken should allow a code_verifier to be passed', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(baseUrl)
                    .post('/oauth2/v4/token', undefined, {
                    reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
                return [4 /*yield*/, client.getToken({ code: 'code here', codeVerifier: 'its_verified' })];
            case 1:
                res = _a.sent();
                scope.done();
                assert(res.res);
                if (!res.res)
                    return [2 /*return*/];
                params = qs.parse(res.res.config.data);
                assert(params.code_verifier === 'its_verified');
                return [2 /*return*/];
        }
    });
}); });
it('getToken should set redirect_uri if not provided in options', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(baseUrl)
                    .post('/oauth2/v4/token', undefined, {
                    reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
                return [4 /*yield*/, client.getToken({ code: 'code here' })];
            case 1:
                res = _a.sent();
                scope.done();
                assert(res.res);
                if (!res.res)
                    return [2 /*return*/];
                params = qs.parse(res.res.config.data);
                assert.equal(params.redirect_uri, REDIRECT_URI);
                return [2 /*return*/];
        }
    });
}); });
it('getToken should set client_id if not provided in options', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(baseUrl)
                    .post('/oauth2/v4/token', undefined, {
                    reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
                return [4 /*yield*/, client.getToken({ code: 'code here' })];
            case 1:
                res = _a.sent();
                scope.done();
                assert(res.res);
                if (!res.res)
                    return [2 /*return*/];
                params = qs.parse(res.res.config.data);
                assert.equal(params.client_id, CLIENT_ID);
                return [2 /*return*/];
        }
    });
}); });
it('getToken should override redirect_uri if provided in options', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(baseUrl)
                    .post('/oauth2/v4/token', undefined, {
                    reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
                return [4 /*yield*/, client.getToken({ code: 'code here', redirect_uri: 'overridden' })];
            case 1:
                res = _a.sent();
                scope.done();
                assert(res.res);
                if (!res.res)
                    return [2 /*return*/];
                params = qs.parse(res.res.config.data);
                assert.equal(params.redirect_uri, 'overridden');
                return [2 /*return*/];
        }
    });
}); });
it('getToken should override client_id if provided in options', function () { return __awaiter(_this, void 0, void 0, function () {
    var scope, res, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scope = nock(baseUrl)
                    .post('/oauth2/v4/token', undefined, {
                    reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
                return [4 /*yield*/, client.getToken({ code: 'code here', client_id: 'overridden' })];
            case 1:
                res = _a.sent();
                scope.done();
                assert(res.res);
                if (!res.res)
                    return [2 /*return*/];
                params = qs.parse(res.res.config.data);
                assert.equal(params.client_id, 'overridden');
                return [2 /*return*/];
        }
    });
}); });
it('should return expiry_date', function (done) {
    var now = (new Date()).getTime();
    var scope = nock(baseUrl)
        .post('/oauth2/v4/token', undefined, {
        reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .reply(200, { access_token: 'abc', refresh_token: '123', expires_in: 10 });
    client.getToken('code here', function (err, tokens) {
        assert(tokens.expiry_date >= now + (10 * 1000));
        assert(tokens.expiry_date <= now + (15 * 1000));
        scope.done();
        done();
    });
});
it('should accept custom authBaseUrl and tokenUrl', function () { return __awaiter(_this, void 0, void 0, function () {
    var authBaseUrl, tokenUrl, client, authUrl, authUrlParts, scope, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                authBaseUrl = 'http://authBaseUrl.com';
                tokenUrl = 'http://tokenUrl.com';
                client = new src_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, { authBaseUrl: authBaseUrl, tokenUrl: tokenUrl });
                authUrl = client.generateAuthUrl();
                authUrlParts = url.parse(authUrl);
                assert.equal(authBaseUrl.toLowerCase(), authUrlParts.protocol + '//' + authUrlParts.hostname);
                scope = nock(tokenUrl).post('/').reply(200, {});
                return [4 /*yield*/, client.getToken('12345')];
            case 1:
                result = _a.sent();
                scope.done();
                return [2 /*return*/];
        }
    });
}); });
it('should obtain token info', function () { return __awaiter(_this, void 0, void 0, function () {
    var accessToken, tokenInfo, scope, info;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                accessToken = 'abc';
                tokenInfo = {
                    aud: 'naudience',
                    user_id: '12345',
                    scope: 'scope1 scope2',
                    expires_in: 1234
                };
                scope = nock(baseUrl)
                    .get("/oauth2/v3/tokeninfo?access_token=" + accessToken)
                    .reply(200, tokenInfo);
                return [4 /*yield*/, client.getTokenInfo(accessToken)];
            case 1:
                info = _a.sent();
                scope.done();
                assert.equal(info.aud, tokenInfo.aud);
                assert.equal(info.user_id, tokenInfo.user_id);
                assert.deepEqual(info.scopes, tokenInfo.scope.split(' '));
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=test.oauth2.js.map