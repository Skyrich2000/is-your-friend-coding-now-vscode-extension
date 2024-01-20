import * as vscode from "vscode";
import { getUser, createUser, deleteUser } from "./api";
import { Credentials } from "./credentials";

export async function activate(context: vscode.ExtensionContext) {
  const credentials = new Credentials();
  await credentials.initialize(context);

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1
  );

  const setStatusBar = async () => {
    const result = await getUser();

    statusBarItem.text = result;
    statusBarItem.show();
  };

  /**
   * @description
   * if interval is already running, do not run it again.
   * if interval is not running, run it.
   */
  const pulling = () => {
    const globalTimer = context.globalState.get("interval", undefined);

    if (!globalTimer) {
      setStatusBar();
      const timer = setInterval(async () => {
        vscode.window.showInformationMessage("pulling...");
        await setStatusBar();
      }, 1500);
      context.globalState.update("interval", timer);
    } else {
      vscode.window.showInformationMessage("Already pulling...");
    }
  };

  vscode.window.onDidChangeWindowState(async (e) => {
    if (e.focused) {
      pulling();
    } else {
      vscode.window.showInformationMessage("Clearing interval...");
      const globalTimer = context.globalState.get("interval", undefined);
      if (globalTimer) {
        clearInterval(globalTimer);
        context.globalState.update("interval", undefined);
      }
    }
  });

  const disposable = vscode.commands.registerCommand(
    "is-your-friend-coding-now.start",
    async () => {
      /**
       * Octokit (https://github.com/octokit/rest.js#readme) is a library for making REST API
       * calls to GitHub. It provides convenient typings that can be helpful for using the API.
       *
       * Documentation on GitHub's REST API can be found here: https://docs.github.com/en/rest
       */
      const octokit = await credentials.getOctokit();
      const userInfo = await octokit.users.getAuthenticated();

      console.log(userInfo);
      console.log(userInfo.data.login);

      vscode.window.showInformationMessage(
        `Logged into GitHub as ${userInfo.data.login}`
      );
      // github user name 바꾸고 싶다!!
      const user = userInfo.data.login;
      if (!user) {
        vscode.window.showInformationMessage("Not a valid name");
        return;
      }

      vscode.window.showInformationMessage(`User Name: ${user}`);

      await createUser(user);

      pulling();

      /**
       * @description
       * VScode focus event
       * When the vscode window is focused, the user is added to the list.
       * When the vscode window is not focused, the user is deleted from the list.
       */
      vscode.window.onDidChangeWindowState(async (e) => {
        if (e.focused) {
          await createUser(user);
        } else {
          await deleteUser(user);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  const globalTimer = vscode.workspace
    .getConfiguration()
    .get("is-your-friend-coding-now.interval", undefined);

  if (globalTimer) {
    clearInterval(globalTimer);
  }
}
