angular.module('ui.bootstrap.collapse',['ui.bootstrap.transition'])

// The collapsible directive indicates a block of html that will expand and collapse
.directive('collapse', ['$transition', function($transition) {

  var setHeight = function(element, height) {
    element.css({ height: height });
    // It appears that  reading offsetWidth makes the browser realise that we have changed the
    // height already :-/
    var x = element[0].offsetWidth;
    return element;
  };

  var currentTransition;
  var doTransition = function(element, change) {
    if ( currentTransition ) {
      currentTransition.cancel();
    }
    currentTransition = $transition(element, change);
    currentTransition.then(
      function() { currentTransition = undefined; },
      function() { currentTransition = undefined; }
    );
    return currentTransition;
  };


  return {
    link: function(scope, element, attrs) {

      var initialAnimSkipped = false, isCollapsed;

      function expand(skipAnim) {
        setHeight(element, 0)
          .removeClass('collapse')
          .addClass('collapsing');

        var elHeight = element[0].scrollHeight;

        if (skipAnim) {
          initialAnimSkipped = true;
          setHeight(element, elHeight);
        } else {
          doTransition(element, {height: elHeight})
            .then(function() {
              element.removeClass('collapsing');
              setHeight(element, 'auto').addClass('in');
              isCollapsed = false;
            });
        }
      }

      function collapse(skipAnim) {
        isCollapsed = true;
        var elHeight = element[0].scrollHeight;

        if (skipAnim) {
          initialAnimSkipped = true;
          element
            .removeClass('in')
            .addClass('collapse');
        } else {
          setHeight(element, elHeight)
            .removeClass('in')
            .addClass('collapsing');

          doTransition(element, { height: 0 })
            .then(function() {
              setHeight(element, 0)
                .removeClass('collapsing')
                .addClass('collapse');
            });
        }
      }

      // The listener is called when scollHeight changes
      // It actually does on 2 scenarios:
      //   1. Parent is set to display none
      //   2. angular bindings inside are resolved
      // When we have a change of scrollHeight we are setting
      // again the correct height if the group is opened
      // scope.$watch(
      //   function (){
      //     return element[0].scrollHeight;
      //   },
      //   function (value) {
      //     var elHeight = element[0].scrollHeight;
      //     if (element[0].scrollHeight !== 0) {
      //       if (!isCollapsed) {
      //         if (!initialAnimSkipped) {
      //           setHeight(element, elHeight);
      //         } else {
      //           setHeight(element, 'auto');
      //         }
      //       }
      //     }
      //   }
      // );

      scope.$watch(attrs.collapse, function(value) {
        var animate = initialAnimSkipped ? false : true;
        if (value) {
          collapse(animate);
        } else {
          expand(animate);
        }
      });

    }
  };
}]);
