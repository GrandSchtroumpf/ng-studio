# Setup

## Create the workspace
Create an nx workspace. Let's keep it empty for now and use the angular CLI.
```
npx create-nx-workspace studio
-> What to create in the new workspace: empty
-> CLI to power the Nx workspace      : Angular CLI

cd studio/
```

## Create vscode extension application

### Scaffold the app
vscode extension are node programs that run inside the ide.

We'll need `@nrwl/node` schematics for that : 
```
npm i -D @nrwl/node
ng generate @nrwl/node:application vs-code
```

### Setup vscode
This application is the empty point for your extension and requires the vsode api : 
```
npm i vscode
```

Now let's update the `main.ts` file inside our app : 
```typescript
import { commands, ExtensionContext, window } from 'vscode';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  commands.registerCommand('start', () => {
    window.showInformationMessage('Hello World');
  })
}
```

This code associates a callback that shows "Hello World" with the command "start", when the extension in activated. Now we need to : 
- Create the command.
- Activate the extension when the command is triggered.

For that vscode needs a `package.json`. Let's add it **in the same folder as `main.ts`** :
```json
{
  "name": "studio",
  "version": "0.0.0",
  "main": "main.js",
  "engines": {
    "vscode": "^1.44.0"
  },
  "contributes": {
    "commands": [{
      "command": "start",
      "title": "Start Studio Extension"
    }]
  },
  "activationEvents": [
    "onCommand:start"
  ]
}
```

Let's keep it to the bare minimum for now:
- `contributes`: This is where we create the command "start"
- `activationEvents`: This will activate the extension when command "start" is triggered.

### Build the extension
When running `ng build vs-code` it will only outputs the `main.js` files, **not the `package.json`**.

To solve that let's update `angular.json` Under `projects/vs-code/architect/build/options/assets` add the path to `package.json`: 
```json
"assets": [
  "apps/vs-code/src/assets",
  "apps/vs-code/src/package.json"
]
```

Run `ng build vs-code` again. Everything is ready !

## Setup launch.json & tasks.json
To run a vscode extension in development mode you need to create `launch.json` & `tasks.json` inside the folder `.vscode`.

I just pasted the code from the `yo` generator for vscode extension & change the `extensionDevelopmentPath` argument :

**`launch.json`**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension In Dev Mode",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}/dist/apps/vs-code"
      ],
      "trace": "false",
      "internalConsoleOptions": "openOnFirstSessionStart",
      "outFiles": [
        "${workspaceFolder}/dist/apps/vs-code"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

**`tasks.json`**
```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "npm",
			"script": "watch",
			"problemMatcher": "$tsc-watch",
			"isBackground": true,
			"presentation": {
				"reveal": "never"
			},
			"group": {
				"kind": "build",
				"isDefault": true
			}
		}
	]
}
```

> I'm pretty sure there is a bunch of improvement to do here. But it worked in my case so I didn't looked too much into details.

## Try it out
First build you node app : 
```
ng build vs-code --watch
```

Then press **F5**. It should open a new vscode window. For there hit `Ctrl+p` and write : 
```
> Start Studio Extension
```
If everything goes well, you should see a message "Hello World".

> "Start Studio Extension" is the value we gave on the command "start" in the `package.json`.



## Create Angular application
vscode extensions are powerful but the exposed API is quite limited when it comes to user interaction.
Fortunately the API can run HTML code inside a webview. Let's use an angular application for that.

```
npm i -D @nrwl/angular
ng generate @nrwl/angular:application studio
```

Will see how to 

