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
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var fs = require("fs");
var _1 = require("../src/");
// Creates a standard JSON credentials object for testing.
function createJSON() {
    return {
        client_secret: 'privatekey',
        client_id: 'client123',
        refresh_token: 'refreshtoken',
        type: 'authorized_user'
    };
}
it('fromJSON should error on null json', function () {
    var refresh = new _1.UserRefreshClient();
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        refresh.fromJSON(null);
    });
});
it('fromJSON should error on empty json', function () {
    var refresh = new _1.UserRefreshClient();
    assert.throws(function () {
        // Test verifies invalid parameter tests, which requires cast to any.
        // tslint:disable-next-line no-any
        refresh.fromJSON({});
    });
});
it('fromJSON should error on missing client_id', function () {
    var json = createJSON();
    delete json.client_id;
    var refresh = new _1.UserRefreshClient();
    assert.throws(function () {
        refresh.fromJSON(json);
    });
});
it('fromJSON should error on missing client_secret', function () {
    var json = createJSON();
    delete json.client_secret;
    var refresh = new _1.UserRefreshClient();
    assert.throws(function () {
        refresh.fromJSON(json);
    });
});
it('fromJSON should error on missing refresh_token', function () {
    var json = createJSON();
    delete json.refresh_token;
    var refresh = new _1.UserRefreshClient();
    assert.throws(function () {
        refresh.fromJSON(json);
    });
});
it('fromJSON should create UserRefreshClient with clientId_', function () {
    var json = createJSON();
    var refresh = new _1.UserRefreshClient();
    var result = refresh.fromJSON(json);
    assert.equal(json.client_id, refresh._clientId);
});
it('fromJSON should create UserRefreshClient with clientSecret_', function () {
    var json = createJSON();
    var refresh = new _1.UserRefreshClient();
    var result = refresh.fromJSON(json);
    assert.equal(json.client_secret, refresh._clientSecret);
});
it('fromJSON should create UserRefreshClient with _refreshToken', function () {
    var json = createJSON();
    var refresh = new _1.UserRefreshClient();
    var result = refresh.fromJSON(json);
    assert.equal(json.refresh_token, refresh._refreshToken);
});
it('fromStream should error on null stream', function (done) {
    var refresh = new _1.UserRefreshClient();
    // Test verifies invalid parameter tests, which requires cast to any.
    // tslint:disable-next-line no-any
    refresh.fromStream(null, function (err) {
        assert.equal(true, err instanceof Error);
        done();
    });
});
it('fromStream should read the stream and create a UserRefreshClient', function (done) {
    // Read the contents of the file into a json object.
    var fileContents = fs.readFileSync('./test/fixtures/refresh.json', 'utf-8');
    var json = JSON.parse(fileContents);
    // Now open a stream on the same file.
    var stream = fs.createReadStream('./test/fixtures/refresh.json');
    // And pass it into the fromStream method.
    var refresh = new _1.UserRefreshClient();
    refresh.fromStream(stream, function (err) {
        assert.ifError(err);
        // Ensure that the correct bits were pulled from the stream.
        assert.equal(json.client_id, refresh._clientId);
        assert.equal(json.client_secret, refresh._clientSecret);
        assert.equal(json.refresh_token, refresh._refreshToken);
        done();
    });
});
//# sourceMappingURL=test.refresh.js.map