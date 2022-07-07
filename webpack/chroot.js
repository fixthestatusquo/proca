const posix = require('posix')
const path = require('path');
const fs = require('fs');

module.exports = (conf) => {
  if (process.env.CHROOT_USER) {

    const pw = posix.getpwnam(process.env.CHROOT_USER);
    const dir = process.cwd();
    console.log(`SECURITY: chroot to ${dir} as UID:${pw.uid} GID:${pw.gid}`);
    posix.chroot(dir)
    process.chdir('.')

    posix.setgid(pw.gid);
    posix.setuid(pw.uid);
  }
  return conf;
}
