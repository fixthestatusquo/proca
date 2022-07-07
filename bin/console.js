var clc = require("cli-color");

const styles = {
  error: clc.red.bold,
  warning: clc.yellow,
  notice: clc.blue,
  success: clc.green,
};

function log(args) {
  const style = args[0];
  if (!styles[style]) {
    console.log(styles.error("missing style", style));
  }
  console.log(styles[style](args.slice(1)));
}

function warning() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("warning");
  return log(args);
}

function notice() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("notice");
  return log(args);
}

function error() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("error");
  return log(args);
}

function success() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift("success");
  return log(args);
}
warning("hello", "dolly", { test: false, blue: "yes" });
notice("hello", "dolly");
error("hello", "dolly");
success("hello", "dolly");
