import Command from 'proca/src/procaCommand.mjs';

export default class HelloCommand extends Command {
  async run() {
    this.log('Hello world from my Oclif plugin!');
  }
}
