import axios from "axios";
import * as vscode from "vscode";

const host = "http://skyrich3.iptime.org:8003/users/coding";

const getUser = async () => {
  const { data } = await axios.get(host);

  console.log("getUser", data);
  return data.join(", ");
};

const createUser = async (name: string) => {
  const { data } = await axios.post(host, {
    user: name,
  });

  console.log("createUser", data);
  return data;
};

const deleteUser = async (name: string) => {
  const { data } = await axios.request({
    method: "delete",
    url: host,
    data: {
      user: name,
    },
  });

  console.log("deleteUser", data);
  return data;
};

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

  let disposable = vscode.commands.registerCommand(
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

      // if user is focused on vscode
      vscode.window.onDidChangeWindowState(async (e) => {
        if (e.focused) {
          await createUser(user);
        } else {
          await deleteUser(user);
        }
        await setStatusBar();
      });

      await setStatusBar();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
