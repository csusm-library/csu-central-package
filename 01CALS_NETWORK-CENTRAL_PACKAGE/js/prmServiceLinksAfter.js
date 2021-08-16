/**
 * Links to show
 */

app.value('linksToKeep',[]).component('prmServiceLinksAfter', {
  bindings: {
    parentCtrl: '<'
  },
  controller: function($document, linksToKeep) {
    angular.element(function () {
      console.log(linksToKeep);
      if (linksToKeep.length > 0) {
        var lNodes = $document[0].querySelectorAll("prm-service-links > div > div > div");
        console.log(lNodes);
        for (var i =0;  i < lNodes.length; i++) {
          var eNode = lNodes[i];
          var span = eNode.querySelector("a > span");
          if (span != null) {
            if (!linksToKeep.includes(span.textContent)) {
              eNode.style.display = "none";
            }
          }
        }
      }
    });
  }
});
