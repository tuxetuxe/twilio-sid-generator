// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {Md5} from 'ts-md5/dist/md5';
import * as crypto from "crypto";
import { BUILTIN_ID_PREFIXES } from './sid_prefixes';
import * as _ from "lodash";

let allSidPrefixes = BUILTIN_ID_PREFIXES;

export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	var commands = [
		vscode.commands.registerCommand('extension.twilio.sid', insertSid),
		vscode.commands.registerCommand('extension.twilio.sid.account', () => insertSidInEditor('AC') ),
		vscode.commands.registerCommand('extension.twilio.sid.address', () => insertSidInEditor('AD') ),
		vscode.commands.registerCommand('extension.twilio.sid.Identity', () => insertSidInEditor('RI') ),
		vscode.commands.registerCommand('extension.twilio.sid.phoneNumber', () => insertSidInEditor('PN') ),
		vscode.commands.registerCommand('extension.twilio.sid.request', () => insertSidInEditor('RQ') ),
		vscode.commands.registerCommand('extension.twilio.sid.MessagingApplication', () => insertSidInEditor('MG') ),
		vscode.commands.registerCommand('extension.twilio.sid.mms', () => insertSidInEditor('MM') ),
		vscode.commands.registerCommand('extension.twilio.sid.sms', () => insertSidInEditor('SM') ),
		vscode.commands.registerCommand('extension.twilio.sid.call', () => insertSidInEditor('CA') ),
		vscode.commands.registerCommand('extension.twilio.sid.conference', () => insertSidInEditor('CF') ),
		vscode.commands.registerCommand('extension.twilio.sid.authorizationDocument', () => insertSidInEditor('PX') ),
		vscode.commands.registerCommand('extension.twilio.sid.Queue', () => insertSidInEditor('QU') ),
		vscode.commands.registerCommand('extension.twilio.sid.user', () => insertSidInEditor('US') )
	];

	commands.forEach(function (command) {
		context.subscriptions.push(command);
	});
	
	const userSidPrefixes = vscode.workspace.getConfiguration().get<string[]>('twilio-sid-generator.sidsPrefixes');

	if (userSidPrefixes) {
		
		const userSidPrefixesLabels = userSidPrefixes.map((usp: string) => {
			const stringTokens = usp.split(',');
			return {label: stringTokens[0], description: stringTokens[1]}
		});
		allSidPrefixes = BUILTIN_ID_PREFIXES.concat(userSidPrefixesLabels);

		allSidPrefixes = allSidPrefixes.filter((elem, index, self) => {
			return index === self.indexOf(elem);
		});
	}

	allSidPrefixes = _.orderBy(allSidPrefixes, ['label'], ['asc']);
	allSidPrefixes = _.sortedUniqBy(allSidPrefixes,'label');

}

async function insertSid() {
	const sidPrefix = await vscode.window.showQuickPick(allSidPrefixes, { canPickMany: false, matchOnDescription: true });
	if (sidPrefix) {
		insertSidInEditor(sidPrefix.label);
	}
}

function insertSidInEditor(sidPrefix: string) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	const sid = computeSid(sidPrefix);
	editor.edit(
	  edit => editor.selections.forEach(
		selection => {
		  edit.delete(selection);
		  edit.insert(selection.start, sid);
		}
	  )
	);
}

function computeSid(sidPrefix: string) {
	const bytes = crypto.randomBytes(64);
	return sidPrefix + new Md5().appendByteArray(bytes).end();
}

// this method is called when your extension is deactivated
export function deactivate() {}
