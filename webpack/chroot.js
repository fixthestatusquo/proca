const chroot = require('chroot');

module.exports = (conf) => {
  if (process.env.CHROOT_USER) {
    console.log(`SECURITY: chroot() to ${process.cwd()}`);
    chroot(process.cwd(), process.env.CHROOT_USER);
  } else {
    console.log("no chroot");
  }

  return conf;
}
