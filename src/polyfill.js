if (!String.prototype.replaceAll) {
    //to disable String prototype is read only, properties should not be added  no-extend-native
  String.prototype.replaceAll = function (target, payload) {
    let regex = new RegExp(target, "g");
    return this.valueOf().replace(regex, payload);
  };
}
