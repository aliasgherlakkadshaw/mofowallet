(function() {
  'use strict';
  var module = angular.module('fim.base');
  module.factory('SoldGoodsProvider', function(nxt, $q, IndexedEntityProvider) {

    function SoldGoodsProvider(api, $scope, pageSize, account) {
      this.init(api, $scope, pageSize, account);
      this.filter = null;
      this.account = account;
    }
    angular.extend(SoldGoodsProvider.prototype, IndexedEntityProvider.prototype, {

      uniqueKey: function(good) {
        return good.purchase;
      },
      sortFunction: function(a, b) {
        return a.index - b.index;
      },

      getData: function(firstIndex) {
        var deferred = $q.defer();
        var args = {
          firstIndex: firstIndex,
          lastIndex: firstIndex + this.pageSize,
          includeCounts: true,
          requestType: 'getDGSPendingPurchases',
          seller: this.account
        }
        this.api.engine.socket().callAPIFunction(args).then(deferred.resolve, deferred.reject);
        return deferred.promise;
      },

      dataIterator: function(data) {
        var goods = data.purchases;
        var index = this.entities.length > 0 ? this.entities[this.entities.length - 1].index : 0;
        for (var i = 0; i < goods.length; i++) {
          var a = goods[i];
          a.index = index;
          a.priceNXT = nxt.util.convertNQT(a.priceNQT);
          a.deliveryTime = String(nxt.util.convertToEpochTimestamp(Date.now()) + 60 * 60 * 168);
          a.totalTime = a.deliveryTime - a.deliveryDeadlineTimestamp;
          a.totalDeliveryDeadlineTimestamp = Math.floor(a.totalTime / 3600);
        }
        return new Iterator(goods);
      }
    });
    return SoldGoodsProvider;
  });
})();