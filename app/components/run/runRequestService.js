angular.module('app').service('runRequestService', runRequestService);

runRequestService.$inject = [
    '$rootScope',
    '$log',
    '$http'
]

function runRequestService(
    $rootScope,
    $log,
    $http
) {

    var self = this;

    self.getRunPreview = function (componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');

            var url = $rootScope.url + '/apis/components/' + componentId + '/preview';


            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }



    self.getRun = function (componentId) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
                responseType: 'json'
            }

            var accessToken = localStorage.getItem('idToken');
            if (accessToken != null) {
                config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');
            }

            var url = $rootScope.url + '/apis/components/' + componentId;


            $http.get(url, config).then(function (result) {
                resolve(result);
            });
        })
    }



    self.getRuns = function (componentIds) {
        return new Promise(function (resolve, reject) {

            if (!componentIds) { reject('componentIds not specified') }


            var getRunPromises = componentIds.map(self.getRun);
            Promise.all(getRunPromises).then(function (result) {
                resolve(result)
            })

        });
    }




    self.deleteRun = function (components) {
        return new Promise(function (resolve, reject) {
            var config = {
                headers: {},
            }

            config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');


            var url = $rootScope.url + '/apis/components/' + components[0];


            $http.delete(url, config).then(function (result) {
                resolve(result);
            });
        })

    }

    self.deleteRuns = function (componentIds) {
        return new Promise(function (resolve, reject) {
            var deleteRunPomises = componentIds.map(self.deleteRun);
            Promise.all(deleteRunPomises).then(function (resolve) {
                resolve(result);
            }).catch(function (error) {
                reject(error);
            })
        })

    }

}