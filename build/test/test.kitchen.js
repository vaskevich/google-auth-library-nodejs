"use strict";
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
var cp = require("child_process");
var mv = require("mv");
var ncp_1 = require("ncp");
var pify = require("pify");
var tmp = require("tmp");
var mvp = pify(mv);
var ncpp = pify(ncp_1.ncp);
var keep = !!process.env.GALN_KEEP_TEMPDIRS;
var stagingDir = tmp.dirSync({ keep: keep, unsafeCleanup: true });
var stagingPath = stagingDir.name;
var pkg = require('../../package.json');
var spawnp = function (command, args, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        cp.spawn(command, args, Object.assign(options, { stdio: 'inherit' }))
            .on('close', function (code, signal) {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error("Spawn failed with an exit code of " + code));
            }
        })
            .on('error', function (err) {
            reject(err);
        });
    });
};
/**
 * Create a staging directory with temp fixtures used
 * to test on a fresh application.
 */
it('should be able to use the d.ts', function () { return __awaiter(_this, void 0, void 0, function () {
    var tarball;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(__filename + " staging area: " + stagingPath);
                return [4 /*yield*/, spawnp('npm', ['pack'])];
            case 1:
                _a.sent();
                tarball = pkg.name + "-" + pkg.version + ".tgz";
                // stagingPath can be on another filesystem so fs.rename() will fail
                // with EXDEV, hence we use `mv` module here.
                return [4 /*yield*/, mvp(tarball, stagingPath + "/google-auth-library.tgz")];
            case 2:
                // stagingPath can be on another filesystem so fs.rename() will fail
                // with EXDEV, hence we use `mv` module here.
                _a.sent();
                return [4 /*yield*/, ncpp('test/fixtures/kitchen', stagingPath + "/")];
            case 3:
                _a.sent();
                return [4 /*yield*/, spawnp('npm', ['install'], { cwd: stagingPath + "/" })];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }).timeout(40000);
/**
 * CLEAN UP - remove the staging directory when done.
 */
after('cleanup staging', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!keep) {
            stagingDir.removeCallback();
        }
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=test.kitchen.js.map