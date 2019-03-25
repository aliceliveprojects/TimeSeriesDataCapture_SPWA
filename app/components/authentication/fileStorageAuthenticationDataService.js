
angular.module('app').service('fileStorageAuthenticationDataService',fileStorageAuthenticationDataService);

fileStorageAuthenticationDataService.$inject = [
    '$rootScope', 
    '$log', 
    '$http'
]

function fileStorageAuthenticationDataService(
    $rootScope, 
    $log, 
    $http
){
    var self = this;

    self.postAuthentication = function (authentication) {

        var config = {
            headers: {}
        }
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');

        var url = $rootScope.url + '/apis/authenticate';


        return $http.post(url, authentication, config)
    }

    self.deleteAuthentication = function(){
        var profileId = (localStorage.getItem('profileId'));


        var config = {
            headers: {},
            data: {
                profileID : profileId
            }
        }

        config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');

        var url = $rootScope.url + '/apis/authenticate';
        return $http.delete(url,config);
    }





}