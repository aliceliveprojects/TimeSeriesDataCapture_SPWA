app.service('searchService', ['$log', '$http','$rootScope', function ($log, $http,$rootScope) {

    var self = this;

    // tags must be delimited by a %20(space)
    self.searchRequest = function (query) {
       

        var config = {
            params: {},
            responseType: 'json',
            headers: {}
        }

        var url = $rootScope.url + '/apis/search';
        config.headers.Authorization = 'Bearer ' + localStorage.getItem('idToken');
        config.params.query = query;
        
     
        return $http.get(url, config);
    }

    self.queryParamArray = function(param){
        var parseParam = '';
        for(var i=0,n=param.length-1;i<n;i++){
            parseParam += param[i] + ',';
        }
        parseParam += param[param.length-1];
        return parseParam;
    }

    
}])