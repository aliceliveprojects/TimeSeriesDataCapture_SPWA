

angular.module('app').service('authenticationService', authenticationService);

authenticationService.$inject = [
    '$log',
    '$state',
    'authenticationNotifyService',
    'angularAuth0'
];

function authenticationService(
    $log,
    $state,
    authenticationNotifyService,
    angularAuth0
) {
    var self = this;

    self.setSession = setSession;

    self.isAuthenticated = isAuthenticated;

    self.handleAuthentication = handleAuthentication;
    self.renewTokens = renewTokens;

    self.login = login;
    self.logout = logout;

    

    function setSession(sessionParams) {

        
        localStorage.setItem('isLoggedIn', sessionParams.isLoggedIn);
        localStorage.setItem('idToken', sessionParams.idToken);
        localStorage.setItem('expiresAt', sessionParams.expiresAt);
        localStorage.setItem('profileId', sessionParams.profileId);
        authenticationNotifyService.publishAuth0();
        $state.go('.', {
        }, {
                reload: true
            });
    }

    function isAuthenticated() {
        try {
            var expiresAt = JSON.parse(localStorage.getItem('expiresAt'));
            return new Date().getTime() < expiresAt;
        } catch (error) {
            return false;
        }
       
    }

    function login() {
        //lock.show();
        angularAuth0.authorize();
    }


    function handleAuthentication() {
        console.log('go')
        angularAuth0.parseHash(function (err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                var expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
                var sessionParams = {
                    isLoggedIn: false,
                    idToken: authResult.idToken,
                    expiresAt: expiresAt,
                    profileId: null
                };
                angularAuth0.client.userInfo(authResult.accessToken, function(err, profile){
                    if(!err){
                        sessionParams.profileId  = profile.sub;
                        sessionParams.isLoggedIn = true;
                        setSession(sessionParams);
                    }else{
                        console.log(err);
                    }
                });

                
            } else if (err) {
                console.log(err);
            }
            
            
        });
    }

    function logout() {
        localStorage.setItem('expiresAt', 0);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('idToken');
    }


    function renewTokens() {
        angularAuth0.checkSession({},
            function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    setSession(result);
                }
            }
        );
    }





}

