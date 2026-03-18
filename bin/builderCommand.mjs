import ProcaCommand from "proca/src/procaCommand.mjs";
//import { load as loadConfig } from "proca/src/config.mjs";
import path from "node:path";
import chalk from "chalk";
import fs from "node:fs";
import simpleGit from "simple-git";
export { Args, Flags } from "proca/src/index.mjs";
export class BuilderCommand extends ProcaCommand {
  fileName = undefined;
  newFile = undefined;

  static multiid() {
    return ProcaCommand.multiid();
  }

  static flagify(params = {}) {
    return ProcaCommand.flagify(params);
  }

  initGit = () => {
    if (!fs.existsSync(path.join(this.config.procaConfig.folder, "/.git"))) {
      this.warn("config not on git");
    }
    return simpleGit({ baseDir: this.config.procaConfig.folder });
  };

  commit = async () => this.git.commit(this.gitMessage(), [this.fileName]);

  checkFile = fileName => {
    if (fileName.toString().includes("..")) {
      this.error("invalid filename ", fileName);
    }
    return fileName;
  };
  // mkdir -p
  mkdirp = () => {
    fs.mkdirSync(this.getFile(), { recursive: true });
  };

  getFolder = () => {
    const mapping = { widget: "./", campaign: "campaign/", org: "org/" };
    const type = this.id.split(":")[0];
    const folder = mapping[type];
    if (!folder) this.error(`no folder defined for ${type}`);
    return folder;
  };

  setFile = name => {
    if (!name) {
      const folder = this.getFolder();
      if (folder === "./") {
        //we are dealing with widgets
        name = `${folder}${this._flags.id}`;
      } else {
        name = `${folder}${this._flags.name}`;
      }
    }
    this.fileName = path.join(
      this.config.procaConfig.folder,
      `${this.checkFile(name)}.json`
    );
    return this.fileName;
  };

  getFile = () => {
    if (!this.fileName) this.error("you need to setFile first");
    return this.fileName;
  };

  gitMessage = _obj => `proca cli ${this.id}`;

  fileExists = () => {
    return fs.existsSync(this.getFile());
  };

  uncommited = async ({ file, commit = false, exit = true }) => {
    if (!this.git) return false;
    if (!file) file = this.getFile();
    const status = await this.git.status();
    const relative = path.relative(this.config.procaConfig.folder, file);

    const hasChanges = status.modified.includes(relative);
    if (!hasChanges) return false;
    if (commit) {
      this.git.commit(this.gitMessage(data, file));
    }
    if (exit) {
      this.log(await this.diff(file));
      this.error(`Your local changes to ${file} would be overwritten`, {
        code: "git error",
        exit: 1,
        suggestions: ["run with --auto to commit the changes before pulling"],
      });
    }
    return true;
  };

  read = async ({ commit }) => {
    try {
      const file = this.getFile();
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      if (commit && this.git) {
        const status = await this.git.status();
        const hasChanges = status.modified.includes(file);
        if (hasChanges) {
          this.git.commit(this.gitMessage(data, file));
        }
      }
      return data;
    } catch (e) {
      console.error(`no local copy of ${file}: ${e.message}`);
      return null;
    }
  };

  _stringify = obj =>
    JSON.stringify(
      obj,
      (_key, value) => (value === null || value === "" ? undefined : value),
      2
    ) + "\n";

  stringify = obj =>
    JSON.stringify(
      obj,
      (_key, value) => (value === null ? undefined : value),
      2
    ) + "\n";

  diff = async file => {
    const diff = await this.git.diff([file || this.fileName]);
    const colorDiff = diff
      .split("\n")
      .map(line => {
        if (line.startsWith("+")) return chalk.green(line);
        if (line.startsWith("-")) return chalk.red(line);
        if (line.startsWith("@@")) return chalk.cyan(line);
        return line;
      })
      .join("\n");
    return colorDiff;
  };

  save = async json => {
    let needToAdd = false;
    const file = this.getFile();
    if (this.git && !this.fileExists(file)) {
      needToAdd = true;
    }
    this.uncommited({ file }); //exit if unsaved, better to always stash?
    fs.writeFileSync(file, this.stringify(json));
    if (this.git) {
      if (needToAdd) {
        await this.git.add(file);
      }
      const diff = await this.diff(file);
      const r = await this.git.commit(this.gitMessage(json), file);
      return { ...r, ...r.summary, diff };
    }
    return { file, git: false };
  };

  parse = async () => {
    const r = await super.parse();
    if (this._flags.git === false) {
      this.git = undefined;
    }
    this._flags && this.setFile();
    return r;
  };

  async init() {
    await super.init();
    this.git = this.initGit();
  }
}

export default BuilderCommand;
