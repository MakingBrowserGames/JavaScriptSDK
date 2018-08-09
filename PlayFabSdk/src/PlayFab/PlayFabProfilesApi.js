/// <reference path="../typings/PlayFab/PlayFabProfilesApi.d.ts" />

var PlayFab = typeof PlayFab != "undefined" ? PlayFab : {};

if(!PlayFab.settings) {
    PlayFab.settings = {
        titleId: null, // You must set this value for PlayFabSdk to work properly (Found in the Game Manager for your title, at the PlayFab Website)
        developerSecretKey: null, // For security reasons you must never expose this value to the client or players - You must set this value for Server-APIs to work properly (Found in the Game Manager for your title, at the PlayFab Website)
        advertisingIdType: null,
        advertisingIdValue: null,
        GlobalHeaderInjection: null,

        // disableAdvertising is provided for completeness, but changing it is not suggested
        // Disabling this may prevent your advertising-related PlayFab marketplace partners from working correctly
        disableAdvertising: false,
        AD_TYPE_IDFA: "Idfa",
        AD_TYPE_ANDROID_ID: "Adid"
    }
}

if(!PlayFab._internalSettings) {
    PlayFab._internalSettings = {
        entityToken: null,
        sdkVersion: "1.28.180809",
        requestGetParams: {
            sdk: "JavaScriptSDK-1.28.180809"
        },
        sessionTicket: null,
        productionServerUrl: ".playfabapi.com",
        errorTitleId: "Must be have PlayFab.settings.titleId set to call this method",
        errorLoggedIn: "Must be logged in to call this method",
        errorEntityToken: "You must successfully call GetEntityToken before calling this",
        errorSecretKey: "Must have PlayFab.settings.developerSecretKey set to call this method",

        GetServerUrl: function () {
            return "https://" + PlayFab.settings.titleId + PlayFab._internalSettings.productionServerUrl;
        },

        InjectHeaders: function (xhr, headersObj) {
            if (!headersObj)
                return;

            for (var headerKey in headersObj)
            {
                try {
                    xhr.setRequestHeader(gHeaderKey, headersObj[headerKey]);
                } catch (e) {
                    console.log("Failed to append header: " + headerKey + " = " + headersObj[headerKey] + "Error: " + e);
                }
            }
        },

        ExecuteRequest: function (url, request, authkey, authValue, callback, customData, extraHeaders) {
            if (callback != null && typeof (callback) != "function")
                throw "Callback must be null of a function";

            if (request == null)
                request = {};

            var startTime = new Date();
            var requestBody = JSON.stringify(request);

            var completeUrl = url;
            var getParams = PlayFab._internalSettings.requestGetParams;
            if (getParams != null) {
                var firstParam = true;
                for (var key in getParams) {
                    if (firstParam) {
                        completeUrl += "?";
                        firstParam = false;
                    } else {
                        completeUrl += "&";
                    }
                    completeUrl += key + "=" + getParams[key];
                }
            }

            var xhr = new XMLHttpRequest();
            // window.console.log("URL: " + completeUrl);
            xhr.open("POST", completeUrl, true);

            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-PlayFabSDK", "JavaScriptSDK-" + PlayFab._internalSettings.sdkVersion);
            if (authkey != null)
                xhr.setRequestHeader(authkey, authValue);
            PlayFab._internalSettings.InjectHeaders(xhr, PlayFab.settings.GlobalHeaderInjection);
            PlayFab._internalSettings.InjectHeaders(xhr, extraHeaders);

            xhr.onloadend = function () {
                if (callback == null)
                    return;

                var result;
                try {
                    // window.console.log("parsing json result: " + xhr.responseText);
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    result = {
                        code: 503, // Service Unavailable
                        status: "Service Unavailable",
                        error: "Connection error",
                        errorCode: 2, // PlayFabErrorCode.ConnectionError
                        errorMessage: xhr.responseText
                    };
                }

                result.CallBackTimeMS = new Date() - startTime;
                result.Request = request;
                result.CustomData = customData;

                if (result.code === 200)
                    callback(result, null);
                else
                    callback(null, result);
            }

            xhr.onerror = function () {
                if (callback == null)
                    return;

                var result;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    result = {
                        code: 503, // Service Unavailable
                        status: "Service Unavailable",
                        error: "Connection error",
                        errorCode: 2, // PlayFabErrorCode.ConnectionError
                        errorMessage: xhr.responseText
                    };
                }

                result.CallBackTimeMS = new Date() - startTime;
                result.Request = request;
                result.CustomData = customData;

                callback(null, result);
            }

            xhr.send(requestBody);
        }
    }
}

PlayFab.buildIdentifier = "jbuild_javascriptsdk_1";
PlayFab.sdkVersion = "1.28.180809";
PlayFab.GenerateErrorReport = function (error) {
    if (error == null)
        return "";
    var fullErrors = error.errorMessage;
    for (var paramName in error.errorDetails)
        for (var msgIdx in error.errorDetails[paramName])
            fullErrors += "\n" + paramName + ": " + error.errorDetails[paramName][msgIdx];
    return fullErrors;
};

PlayFab.ProfilesApi = {
    ForgetAllCredentials: function () {
        PlayFab._internalSettings.sessionTicket = null;
        PlayFab._internalSettings.entityToken = null;
    },

    GetGlobalPolicy: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/GetGlobalPolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },

    GetProfile: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/GetProfile", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },

    GetProfiles: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/GetProfiles", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },

    SetGlobalPolicy: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/SetGlobalPolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },

    SetProfileLanguage: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/SetProfileLanguage", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },

    SetProfilePolicy: function (request, callback, customData, extraHeaders) {
        if (!PlayFab._internalSettings.entityToken) throw PlayFab._internalSettings.errorEntityToken;
        PlayFab._internalSettings.ExecuteRequest(PlayFab._internalSettings.GetServerUrl() + "/Profile/SetProfilePolicy", request, "X-EntityToken", PlayFab._internalSettings.entityToken, callback, customData, extraHeaders);
    },
};

var PlayFabProfilesSDK = PlayFab.ProfilesApi;

