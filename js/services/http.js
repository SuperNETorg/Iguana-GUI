//'use strict';
// TODO: fix Uncaught SyntaxError: Unexpected eval or arguments in strict mode, line 17

angular.module('IguanaGUIApp')
.service('http', [
  '$q',
  '$http',
  'vars',
  'error',
  '$timeout',
  function($q, $http, vars, error, $timeout) {

    var intervalUpdate, firstTimeout;
    vars.first = true;

    return {
      get: get,
      post: post
    };

    function get() {
      $timeout.cancel(intervalUpdate);
      loader(true);

      var deferred = $q.defer();
      $http
        .get.apply(null, arguments)
        .then(onResolve.bind(this, deferred), onReject.bind(this, deferred));

      return deferred.promise;
    }

    function post() {
      $timeout.cancel(intervalUpdate);
      loader(true);

      var deferred = $q.defer();
      $http
        .post.apply(null, arguments)
        .then(onResolve.bind(this, deferred), onReject.bind(this, deferred));

      return deferred.promise;
    }

    function onResolve(deferred, response) {
      $timeout.cancel(intervalUpdate);
      loader(false);
      error.check(response);
      deferred.resolve(response)
    }

    function onReject(deferred, response) {
      $timeout.cancel(intervalUpdate);
      loader(false);
      error.check(response);
      deferred.reject(response)
    }

    function loader(status) {
      intervalUpdate = $timeout(function() {
        vars.loading = status;
        if (!vars.effect) {
          vars.effect = true;
          angular.element(document.querySelector('.loader-image')).css('display','none');
          firstTimeout = $timeout(function() {
            vars.first = false;
          }, 700)
        } else if (!vars.first) {
          $timeout.cancel(firstTimeout);
          angular.element(document.querySelector('.loader-image')).css('display','block');
          angular.element(document.querySelector('.loader-image-head')).removeClass('loader-image-effect');
        }
      });
    }
  }
]);

