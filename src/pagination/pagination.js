angular.module('ui.bootstrap.pagination', [])

.controller('PaginationController', ['$scope', function ($scope) {

  this.currentPage = 1;

  this.noPrevious = function() {
    return this.currentPage === 1;
  };
  this.noNext = function() {
    return this.currentPage === $scope.numPages;
  };

  this.isActive = function(page) {
    return this.currentPage === page;
  };

  this.reset = function() {
    $scope.pages = [];
    this.currentPage = parseInt($scope.currentPage, 10);

    if ( this.currentPage > $scope.numPages ) {
      $scope.selectPage($scope.numPages);
    }
  };

  var self = this;
  $scope.selectPage = function(page) {
    if ( ! self.isActive(page) && page > 0 && page <= $scope.numPages) {
      $scope.currentPage = page;
      $scope.onSelectPage({ page: page });
    }
  };
}])

.constant('paginationConfig', {
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
})

.directive('pagination', ['paginationConfig', function(paginationConfig) {
  return {
    restrict: 'EA',
    scope: {
      numPages: '=',
      currentPage: '=',
      maxSize: '=',
      onSelectPage: '&'
    },
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pagination.html',
    replace: true,
    link: function(scope, element, attrs, paginationCtrl) {

      // Setup configuration parameters
      var boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
      var directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$eval(attrs.directionLinks) : paginationConfig.directionLinks;
      var firstText = angular.isDefined(attrs.firstText) ? scope.$parent.$eval(attrs.firstText) : paginationConfig.firstText;
      var previousText = angular.isDefined(attrs.previousText) ? scope.$parent.$eval(attrs.previousText) : paginationConfig.previousText;
      var nextText = angular.isDefined(attrs.nextText) ? scope.$parent.$eval(attrs.nextText) : paginationConfig.nextText;
      var lastText = angular.isDefined(attrs.lastText) ? scope.$parent.$eval(attrs.lastText) : paginationConfig.lastText;
      var rotate = angular.isDefined(attrs.rotate) ? scope.$eval(attrs.rotate) : paginationConfig.rotate;

      // Create page object used in template
      function makePage(number, text, isActive, isDisabled) {
        return {
          number: number,
          text: text,
          active: isActive,
          disabled: isDisabled
        };
      }

      scope.$watch('numPages + currentPage + maxSize', function() {
        paginationCtrl.reset();

        // Default page limits
        var startPage = 1, endPage = scope.numPages;
        var isMaxSized = ( angular.isDefined(scope.maxSize) && scope.maxSize < scope.numPages );

        // recompute if maxSize
        if ( isMaxSized ) {
          if ( rotate ) {
            // Current page is displayed in the middle of the visible ones
            startPage = Math.max(paginationCtrl.currentPage - Math.floor(scope.maxSize/2), 1);
            endPage   = startPage + scope.maxSize - 1;

            // Adjust if limit is exceeded
            if (endPage > scope.numPages) {
              endPage   = scope.numPages;
              startPage = endPage - scope.maxSize + 1;
            }
          } else {
            // Visible pages are paginated with maxSize
            startPage = ((Math.ceil(paginationCtrl.currentPage / scope.maxSize) - 1) * scope.maxSize) + 1;

            // Adjust last page if limit is exceeded
            endPage = Math.min(startPage + scope.maxSize - 1, scope.numPages);
          }
        }

        // Add page number links
        for (var number = startPage; number <= endPage; number++) {
          var page = makePage(number, number, paginationCtrl.isActive(number), false);
          scope.pages.push(page);
        }

        // Add links to move between page sets
        if ( isMaxSized && ! rotate ) {
          if ( startPage > 1 ) {
            var previousPageSet = makePage(startPage - 1, '...', false, false);
            scope.pages.unshift(previousPageSet);
          }

          if ( endPage < scope.numPages ) {
            var nextPageSet = makePage(endPage + 1, '...', false, false);
            scope.pages.push(nextPageSet);
          }
        }

        // Add previous & next links
        if (directionLinks) {
          var previousPage = makePage(paginationCtrl.currentPage - 1, previousText, false, paginationCtrl.noPrevious());
          scope.pages.unshift(previousPage);

          var nextPage = makePage(paginationCtrl.currentPage + 1, nextText, false, paginationCtrl.noNext());
          scope.pages.push(nextPage);
        }

        // Add first & last links
        if (boundaryLinks) {
          var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
          scope.pages.unshift(firstPage);

          var lastPage = makePage(scope.numPages, lastText, false, paginationCtrl.noNext());
          scope.pages.push(lastPage);
        }
      });
    }
  };
}])

.constant('pagerConfig', {
  previousText: '« Previous',
  nextText: 'Next »',
  align: true
})

.directive('pager', ['pagerConfig', function(config) {
  return {
    restrict: 'EA',
    scope: {
      numPages: '=',
      currentPage: '=',
      onSelectPage: '&'
    },
    controller: 'PaginationController',
    templateUrl: 'template/pagination/pager.html',
    replace: true,
    link: function(scope, element, attrs, paginationCtrl) {

      // Setup configuration parameters
      var previousText = angular.isDefined(attrs.previousText) ? scope.$parent.$eval(attrs.previousText) : config.previousText;
      var nextText = angular.isDefined(attrs.nextText) ? scope.$parent.$eval(attrs.nextText) : config.nextText;
      var align = angular.isDefined(attrs.align) ? scope.$parent.$eval(attrs.align) : config.align;

      // Create page object used in template
      function makePage(number, text, isDisabled, isPrevious, isNext) {
        return {
          number: number,
          text: text,
          disabled: isDisabled,
          previous: ( align && isPrevious ),
          next: ( align && isNext )
        };
      }

      scope.$watch('numPages + currentPage', function() {
        paginationCtrl.reset();

        // Add previous & next links
        var previousPage = makePage(paginationCtrl.currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false);
        scope.pages.unshift(previousPage);

        var nextPage = makePage(paginationCtrl.currentPage + 1, nextText, paginationCtrl.noNext(), false, true);
        scope.pages.push(nextPage);
      });
    }
  };
}]);
