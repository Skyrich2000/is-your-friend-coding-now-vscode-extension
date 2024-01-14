import * as vscode from "vscode";
import { getUser, createUser, deleteUser } from "./api";

export function activate(context: vscode.ExtensionContext) {
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
      const timer = setInterval(async () => {
        vscode.window.showInformationMessage("pulling...");
        await setStatusBar();
      }, 1500);
      context.globalState.update("interval", timer);
    } else {
      vscode.window.showInformationMessage("Already pulling...");
    }
  };

  pulling();

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
      const user = await vscode.window.showInputBox({
        title: "ENTER YOUR NAME",
      });
      if (!user) {
        vscode.window.showInformationMessage("Not a valid name");
        return;
      }

      vscode.window.showInformationMessage(`User Name: ${user}`);

      await createUser(user);
      await setStatusBar();

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
