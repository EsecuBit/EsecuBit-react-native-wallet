
let EsAccountHelper = (function(){
  let esAccount = null
  let instance = null

  function Init() {
    return {
      bindAccount: function(account) {
        esAccount = account
      },
      getAccount: function() {
        if (!esAccount) {
          throw 'call getAccount method after bind account'
        }
        return esAccount
      }
    }
  }
  return {
    getInstance: function () {
      if (!instance) {
        instance = new Init()
      }
      return instance
    }
  }
})();
export default EsAccountHelper