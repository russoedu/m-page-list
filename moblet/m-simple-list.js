/* eslint no-undef: [0]*/
module.exports = {
  title: "mSimpleList",
  style: "m-simple-list.scss",
  template: 'm-simple-list.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $mMoblet,
    $mDataLoader,
    $filter
  ) {
    var init = function() {
      $scope.isLoading = true;
      $scope.moblet = $mMoblet.load();
      var options = {
        offset: 1,
        items: 25,
        itemsArray: "items"
      };
      $mDataLoader.load($scope.moblet, false, options)
        .then(function(data) {
          // Put the data from the feed in the $scope object
          for (var i = 0; i < data.items.length; i++) {
            data.items[i].description = unescape(data.items[i].description);
          }
          $scope.data = data;
        });
    };

    init();
  }
};
