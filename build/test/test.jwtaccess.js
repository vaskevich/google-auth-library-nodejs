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
var src_1 = require("../src");
var keypair = require('keypair');
// Creates a standard JSON credentials object for testing.
var json = {
    private_key_id: 'key123',
    private_key: 'privatekey',
    client_email: 'hello@youarecool.com',
    client_id: 'client123',
    type: 'service_account'
};
var keys = keypair(1024 /* bitsize of private key */);
var testUri = 'http:/example.com/my_test_service';
var email = 'foo@serviceaccount.com';
var client;
beforeEach(function () {
    client = new src_1.JWTAccess();
});
it('getRequestMetadata should create a signed JWT token as the access token', function () {
    var client = new src_1.JWTAccess(email, keys.private);
    var res = client.getRequestMetadata(testUri);
    assert.notStrictEqual(null, res.headers, 'an creds object should be present');
    var decoded = jws.decode(res.headers.Authorization.replace('Bearer ', ''));
    var payload = JSON.parse(decoded.payload);
    assert.strictEqual(email, payload.iss);
    assert.strictEqual(email, payload.sub);
    assert.strictEqual(testUri, payload.aud);
});
it('getRequestMetadata should not allow overriding with additionalClaims', function () {
    var client = new src_1.JWTAccess(email, keys.private);
    var additionalClaims = { iss: 'not-the-email' };
    assert.throws(function () {
        client.getRequestMetadata(testUri, additionalClaims);
    }, /^Error: The 'iss' property is not allowed when passing additionalClaims. This claim is included in the JWT by default.$/);
});
it('getRequestMetadata should return a cached token on the second request', function () {
    var client = new src_1.JWTAccess(email, keys.private);
    var res = client.getRequestMetadata(testUri);
    var res2 = client.getRequestMetadata(testUri);
    assert.strictEqual(res, res2);
});
it('getRequestMetadata should not return cached tokens older than an hour', function () {
    var client = new src_1.JWTAccess(email, keys.private);
    var res = client.getRequestMetadata(testUri);
    var realDateNow = Date.now;
    try {
        // go forward in time one hour (plus a little)
        Date.now = function () { return realDateNow() + (1000 * 60 * 60) + 10; };
        var res2 = client.getRequestMetadata(testUri);
        assert.notEqual(res, res2);
    }
    finally {
        // return date.now to it's normally scheduled programming
        Date.now = realDateNow;
    }
});
it('createScopedRequired should return false', function () {
    var client = new src_1.JWTAccess('foo@serviceaccount.com', null);
    assert.equal(false, client.createScopedRequired());
});
it('fromJson should error on null json', function () {
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        client.fromJSON(null);
    });
});
it('fromJson should error on empty json', function () {
    assert.throws(function () {
        client.fromJSON({});
    });
});
it('fromJson should error on missing client_email', function () {
    var j = Object.assign({}, json);
    delete j.client_email;
    assert.throws(function () {
        client.fromJSON(j);
    });
});
it('fromJson should error on missing private_key', function () {
    var j = Object.assign({}, json);
    delete j.private_key;
    assert.throws(function () {
        client.fromJSON(j);
    });
});
it('fromJson should create JWT with client_email', function () {
    client.fromJSON(json);
    assert.equal(json.client_email, client.email);
});
it('fromJson should create JWT with private_key', function () {
    client.fromJSON(json);
    assert.equal(json.private_key, client.key);
});
it('fromStream should error on null stream', function (done) {
    // Test verifies invalid parameter tests, which requires cast to any.
    // tslint:disable-next-line no-any
    client.fromStream(null, function (err) {
        assert.equal(true, err instanceof Error);
        done();
    });
});
it('fromStream should construct a JWT Header instance from a stream', function () { return __awaiter(_this, void 0, void 0, function () {
    var fileContents, json, stream;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileContents = fs.readFileSync('./test/fixtures/private.json', 'utf-8');
                json = JSON.parse(fileContents);
                stream = fs.createReadStream('./test/fixtures/private.json');
                // And pass it into the fromStream method.
                return [4 /*yield*/, client.fromStream(stream)];
            case 1:
                // And pass it into the fromStream method.
                _a.sent();
                // Ensure that the correct bits were pulled from the stream.
                assert.equal(json.private_key, client.key);
                assert.equal(json.client_email, client.email);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=test.jwtaccess.js.map