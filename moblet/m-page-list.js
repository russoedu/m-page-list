/* eslint no-undef: [0]*/
module.exports = {
  title: "mPageList",
  style: "m-page-list.less",
  template: 'm-page-list.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json",
    es: "lang/es-ES.json"
  },
  link: function() {},
  controller: function(
    $scope,
    $rootScope,
    $filter,
    $mAppDef,
    $mState,
    $mWebview,
    $stateParams,
    $mPlatform,
    $mDataLoader,
    $state,
    $sce
  ) {
    var dataLoadOptions;
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
          $scope.emptyData = false;

          // If it was called from the "more" function, concatenate the items
          $scope.items = (more) ? $scope.items.concat(data.items) : data.items;

          // Set "noContent" if the items lenght = 0
          $scope.moblet.noContent = $scope.items === undefined ||
                             $scope.items.length === 0;

          // set empty itens if no content
          if ($scope.moblet.noContent) {
            $scope.items = [];
          }

          // Check if the page is loading the list or a detail
          $scope.isDetail = list.isDetail();

          // Disable the "more" function if the API don't have more items
          $scope.more = (data.hasMoreItems) ? list.more : undefined;
        } else {
          $scope.error = true;
          $scope.emptyData = true;
        }

        // Broadcast complete refresh and infinite scroll
        $rootScope.$broadcast('scroll.refreshComplete');
        $rootScope.$broadcast('scroll.infiniteScrollComplete');

        // If the view is showing the detail, call showDetail
        if ($scope.isDetail) {
          list.showDetail();
        }

        // Remove the loading animation
        $scope.moblet.isLoading = false;
      },
      /**
       * Check if the view is showing a detail or the list. The function checks
       * if $stateParams.detail is set.
       * @return {boolean} True if the view must show a detail.
       */
      isDetail: function() {
        var isDetail = false;
        if ($scope.items.length === 1) {
          $stateParams.detail = data.items[0].id;
          isDetail = true;
        } else if ($stateParams.detail !== "") {
          isDetail = true;
        }
        return isDetail;
      },
      /**
       * Show the detail getting the index from $stateParams.detail. Set "item"
       * to the selected detail
       */
      showDetail: function() {
        if (isDefined($stateParams.detail) && $stateParams.detail !== "") {
          var itemIndex = _.findIndex($scope.items, function(item) {
            return item.id.toString() === $stateParams.detail;
          });
          if (itemIndex === -1) {
            dataLoadOptions = {
              offset: $scope.items === undefined ? 0 : $scope.items.length,
              items: 25,
              cache: false
            };
            list.load(false, function() {
              list.showDetail();
            });
          } else {
            $scope.title = $scope.items[itemIndex].title;
            $scope.detail = $scope.items[itemIndex];
            $scope.detail.url = $sce.trustAsResourceUrl($scope.detail.url);
          }
        }
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
       * @param {function} callback Callback
       */
      load: function(showLoader, callback) {
        $scope.moblet.isLoading = showLoader || false;
        // Reset the pagination
        if (showLoader === true || showLoader === undefined) {
          dataLoadOptions.offset = 0;
        }
        // mDataLoader also saves the response in the local cache. It will be
        // used by the "showDetail" function
        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            list.setView(data);
            if (typeof callback === 'function') {
              callback();
            }
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

        $mDataLoader.load($scope.moblet, dataLoadOptions)
          .then(function(data) {
            list.setView(data, true);
          });
      },
      /**
       * Initiate the list moblet:
       * - put the list.load function in the $scope
       * - run list.load function
       */
      /*
       * TODO go to detail if url is called
       */
      init: function() {
        $scope.title = null;
        dataLoadOptions = {
          offset: 0,
          items: 25,
          listKey: 'items',
          cache: false
        };
        $scope.load(true);
        $scope.reload = function() {
          list.load();
        };
      }
    };

    var listItem = {
      goTo: function(detail) {
        if ($mPlatform.isWebView()) {
          var id = $stateParams.pageId;
          var url = detail.url;
          var colors = $mAppDef.color();
          var name = detail.title;
          var params = $stateParams;
          $mWebview.open(id, url, "_web", undefined, name,
              colors.navigation_color, colors.header_color, $filter('translate')("loading"), false, {
                state: $state.current.name,
                params: params
              });
        } else {
          console.log(detail);
          $stateParams.detail = detail.id;
          $mState.go('u-moblets', 'page', {
            detail: detail.id
          });
        }
      }
    };

    $scope.stripHtml = function(str) {
      return str.replace(/<[^>]+>/ig, " ");
    };

    $scope.load = list.load;
    $scope.init = list.init;
    $scope.goTo = listItem.goTo;
    list.init();
  }
};
