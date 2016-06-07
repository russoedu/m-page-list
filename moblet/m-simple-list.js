require('./m-moblet-base.scss');
var path = require('path'),
  fs = require('fs');


angular.module('uMoblets')
  .directive('mMobletBase', function() {
    return {
      restrict: 'E',
      scope: {
        moblet: "=",
        data: "="
      },
      template: fs.readFileSync(path.join(__dirname, 'm-moblet-base.html'), 'utf8'),
      link: function() {},
      controller: function($scope, $loading, $ionicPopup, $uAlert, $filter) {}
    };
  });
