"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
exports.__esModule = true;
require("cross-fetch/polyfill");
var api_1 = require("@proca/api");
var config_1 = require("./config");
var lodash_1 = require("lodash");
require("dotenv").config();
var api = config_1.apiLink();
var checkError = function (errors) {
    if (errors) {
        throw new Error(JSON.stringify(errors));
    }
};
var pickName = function (fromName, partner) {
    var parts = fromName.split('/');
    parts.unshift(partner);
    return parts.join('/');
};
var copy = function (fn, org, tn) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, errors, data, path, _b, errors_1, data_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, api_1.request(api, api_1.admin.CopyActionPageDocument, { fromName: fn, toName: tn, toOrg: org })];
            case 1:
                _a = _d.sent(), errors = _a.errors, data = _a.data;
                if (!errors) return [3 /*break*/, 4];
                path = errors[0].path;
                if (!lodash_1.isEqual(path, ["copyActionPage", "name"])) return [3 /*break*/, 3];
                return [4 /*yield*/, api_1.request(api, api_1.admin.GetActionPageDocument, { org: org, name: tn })];
            case 2:
                _b = _d.sent(), errors_1 = _b.errors, data_1 = _b.data;
                checkError(errors_1);
                if ((_c = data_1 === null || data_1 === void 0 ? void 0 : data_1.org) === null || _c === void 0 ? void 0 : _c.actionPage) {
                    return [2 /*return*/, __assign(__assign({}, data_1.org.actionPage), { config: JSON.parse(data_1.org.actionPage.config) })];
                }
                else {
                    throw new Error("didn't fetch page data for " + org + " " + tn + "}");
                }
                return [3 /*break*/, 4];
            case 3:
                checkError(errors);
                _d.label = 4;
            case 4:
                if (data && data.copyActionPage) {
                    //console.log("copied page config type", typeof data.copyActionPage.config);
                    return [2 /*return*/, __assign(__assign({}, data.copyActionPage), { config: JSON.parse(data.copyActionPage.config) })];
                }
                throw new Error('no data returned');
        }
    });
}); };
var getOrg = function (org) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, errors, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, api_1.request(api, api_1.admin.DashOrgOverviewDocument, { org: org })];
            case 1:
                _a = _b.sent(), errors = _a.errors, data = _a.data;
                checkError(errors);
                if (data && data.org) {
                    return [2 /*return*/, __assign(__assign({}, data.org), { config: JSON.parse(data.org.config) })];
                }
                return [2 /*return*/];
        }
    });
}); };
var updateConfig = function (apId, cfg) { return __awaiter(void 0, void 0, void 0, function () {
    var cfgJSON, _a, errors, data;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                cfgJSON = JSON.stringify(cfg);
                return [4 /*yield*/, api_1.request(api, api_1.admin.UpdateActionPageDocument, { id: apId, actionPage: { config: cfgJSON } })];
            case 1:
                _a = _d.sent(), errors = _a.errors, data = _a.data;
                checkError(errors);
                if (data && ((_b = data.updateActionPage) === null || _b === void 0 ? void 0 : _b.id)) {
                    console.log('Updated the ap id ', (_c = data.updateActionPage) === null || _c === void 0 ? void 0 : _c.id);
                }
                else {
                    console.error('not updated?', data);
                }
                return [2 /*return*/];
        }
    });
}); };
var addPartner = function (genericPage, partnerOrg) { return __awaiter(void 0, void 0, void 0, function () {
    var newAp, org, cfg;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, copy(genericPage, partnerOrg, pickName(genericPage, partnerOrg))];
            case 1:
                newAp = _c.sent();
                return [4 /*yield*/, getOrg(partnerOrg)];
            case 2:
                org = _c.sent();
                cfg = newAp.config;
                if (!cfg || !cfg.component || !cfg.component.consent || !cfg.layout) {
                    console.error('this config does not have component.consent or layout', cfg);
                    throw new Error("ad config for AP " + newAp.id);
                }
                //split consent
                cfg.component.consent.split = true;
                // priv policy
                if ((_a = org.config.privacy) === null || _a === void 0 ? void 0 : _a.policyUrl)
                    cfg.component.consent.privacyPolicy = org.config.privacy.policyUrl;
                // color
                if ((_b = org.config.brand) === null || _b === void 0 ? void 0 : _b.primaryColor)
                    cfg.layout.primaryColor = org.config.brand.primaryColor;
                // something else?
                return [4 /*yield*/, updateConfig(newAp.id, cfg)];
            case 3:
                // something else?
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
// console.log('argv', process.argv);
var _a = process.argv, _node = _a[0], script = _a[1], page = _a[2], partner = _a[3];
if (!page || !partner) {
    console.error(script + " page partner");
}
else {
    addPartner(page, partner);
}
