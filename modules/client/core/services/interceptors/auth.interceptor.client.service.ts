'use strict';
import angular from '../../../../../node_modules/angular'

import {coreModule} from "../../core.client.module";

export const authInterceptorSerivce = 'authInterceptor'
angular.module(coreModule).factory(authInterceptorSerivce, ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);
