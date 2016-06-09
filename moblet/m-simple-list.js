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
    $rootScope,
    $mMoblet,
    $mDataLoader,
    $filter,
    $timeout,
    $state,
    $stateParams
  ) {
    var dataLoadOptions = {
      offset: 0,
      items: 25
    };

    var list = {
      /**
       * Set the view and update the needed parameters
       * @param  {object} data Data received from Moblets backend
       * @param  {boolean} more If called by "more" function, it will add the
       * data to the items array
       */
      setView: function(data, more) {
        if (isDefined(data)) {
          $scope.error = false;
          $scope.style = data.style;

          // If it was called from the "more" function, concatenate the items
          $scope.items = (more) ? $scope.items.concat(data.items) : data.items;

          // Disable the "more" function if the API don't have more items
          $scope.more = (data.hasMoreItems) ? list.more : undefined;
        // $scope.detail = $stateParams.detail;
        // $scope.isDetail = utils.checkDetail();
        } else {
          $scope.error = true;
        }
        $scope.isLoading = false;
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');
        $scope.data = data;
      },
      /**
       * Load data from the Moblets backend:
       * - show the page loader if it's called by init (sets showLoader to true)
       * - Use $mDataLoader.load to get the moblet data from Moblets backend.
       * 	 The parameters passed to $mDataLoader.load are:
       * 	 - $scope.moblet - the moblet created in the init function
       * 	 - false - A boolean that sets if you want to load data from the
       * 	   device storage or from the Moblets API
       * 	 - dataLoadOptions - An object with parameters for pagination
       * @param  {boolean} showLoader Boolean to determine if the page loader
       * is active
       */
      load: function(showLoader) {
        $scope.isLoading = showLoader || false;
        // Reset the pagination
        dataLoadOptions.offset = 0;
        $mDataLoader.load($scope.moblet, false, dataLoadOptions)
          .then(function(data) {
            list.setView(data)
          }
        );
      },
      /**
       * Load more data from the backend if there are more items.
       * - Update the offset summing the number of items
       - Use $mDataLoader.load to get the moblet data from Moblets backend.
       * 	 The parameters passed to $mDataLoader.load are:
       * 	 - $scope.moblet - the moblet created in the init function
       * 	 - false - A boolean that sets if you want to load data from the
       * 	   device storage or from the Moblets API
       * 	 - dataLoadOptions - An object with parameters for pagination
       */
      more: function() {
        // Add the items to the offset
        dataLoadOptions.offset += dataLoadOptions.items;
        $mDataLoader.load($scope.moblet, false, dataLoadOptions)
          .then(function(data) {
            list.setView(data, true);
          });
      },
      /**
       * Initiate the list moblet:
       * - Create a moblet with $mMoblet.load()
       * - put the list.load function in the $scope
       * - run list.load function
       */
      init: function() {
        $scope.moblet = $mMoblet.load();
        $scope.load = list.load;
        $scope.load(true);
      }
    }

    var item = {
      goTo: function(id) {
        $stateParams.detail = id;
        console.log(id);
        console.log($state);
        console.log($stateParams);
        $state.go('moblet', $stateParams);
      }
    };

    $scope.load = list.load;
    $scope.goTo = item.goTo;
    list.init();
  }
};
