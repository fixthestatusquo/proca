import { fileURLToPath } from "node:url";
import { dirname, resolve, sep, join } from "node:path";

import { promises as fs } from "node:fs";
import { simpleGit } from "simple-git";
import Command from "../../builderCommand.mjs";

export { Args, Flags } from "../../builderCommand.mjs ";

export default class Locale extends Command {
  static description = "Reads and writes config files from the locale/cache";

  static hidden = true;

  constructor(argv, config) {
    super(argv, config);
    this.filePath = undefined;
    this.git = undefined;
  }

  async init() {
    await super.init();
    this.git = simpleGit(this.configFolder);
  }
  get configFolder() {
    if (!this.procaConfig?.folder) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      this.warn("missing config folder, run $proca config ?");
      return resolve(__dirname, "../../../config") + sep;
    }
    return this.procaConfig.folder + sep;
  }

  resolveFilePath(relativePath, extension) {
    let fullPath = join(this.configFolder, relativePath);
    if (!fullPath.endsWith(`.${extension}`)) {
      fullPath += `.${extension}`;
    }
    return fullPath;
  }

  async read(relativePath) {
    return JSON.parse(await this.readFile(relativePath, "json"));
  }

  async readFile(relativePath, extension) {
    const filePath = this.resolveFilePath(relativePath, extension);
    this.log(`Reading from: ${filePath}`);
    try {
      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      this.error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  async write(relativePath, data) {
    return this.writeFile(relativePath, JSON.stringify(data, null, 2), "json");
  }

  async writeFile(relativePath, content, extension) {
    const filePath = this.resolveFilePath(relativePath, extension);
    this.log(`Writing to: ${filePath}`);
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf8");
      this.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
      this.error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  async add(filePath) {
    try {
      await this.git.add(filePath);
      this.log(`Added ${filePath} to git staging area.`);
    } catch (error) {
      this.error(`Failed to add ${filePath} to git: ${error.message}`);
    }
  }

  async pull(remote = "origin", branch = "main") {
    try {
      const result = await this.git.pull(remote, branch);
      this.log(`✓ Pulled from ${remote}/${branch}`);
      return result;
    } catch (err) {
      this.error(`Failed to pull: ${err.message}`, { exit: 1 });
    }
  }

  async push(remote = "origin", branch = "main", options = []) {
    try {
      const result = await this.git.push(remote, branch, options);
      this.log(`✓ Pushed to ${remote}/${branch}`);
      console.log(result);
      return result;
    } catch (err) {
      this.error(`Failed to push: ${err.message}`, { exit: 1 });
    }
  }
  async status(filePath) {
    const statuses = {
      M: "modified",
      "?": "not_added",
      A: "added",
      U: "conflicted",
      D: "deleted",
    };
    try {
      const status = await this.git.status(filePath ? [filePath] : []);
      //      this.log("git status:", status.isClean());
      return status.files.map(d => {
        d.status = statuses[d.working_dir] || "missing code";
        return d;
      });
    } catch (error) {
      this.error(`Failed to get git status: ${error.message}`);
    }
  }

  async commit(filePath, message) {
    try {
      const commitResult = await this.git.commit(message, filePath);
      this.log("Git commit successful:", commitResult);
      return commitResult;
    } catch (error) {
      this.error(`Failed to commit to git: ${error.message}`);
    }
  }
}
