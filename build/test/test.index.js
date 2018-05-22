"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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
var assert = require("assert");
var gal = require("../src");
it('should publicly export GoogleAuth', function () {
    var cjs = require('../src/');
    assert.strictEqual(cjs.GoogleAuth, gal.GoogleAuth);
});
it('should publicly export DefaultTransporter', function () {
    var cjs = require('../src');
    assert.strictEqual(cjs.DefaultTransporter, gal.DefaultTransporter);
});
it('should export all the things', function () {
    assert(gal.CodeChallengeMethod);
    assert(gal.Compute);
    assert(gal.DefaultTransporter);
    assert(gal.IAMAuth);
    assert(gal.JWT);
    assert(gal.JWTAccess);
    assert(gal.OAuth2Client);
    assert(gal.UserRefreshClient);
    assert(gal.GoogleAuth);
});
//# sourceMappingURL=test.index.js.map