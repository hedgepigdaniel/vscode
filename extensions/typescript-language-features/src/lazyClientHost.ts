/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { CommandManager } from './commands/commandManager';
import { OngoingRequestCancellerFactory } from './tsServer/cancellation';
import { ILogDirectoryProvider } from './tsServer/logDirectoryProvider';
import { TsServerProcessFactory } from './tsServer/server';
import { ITypeScriptVersionProvider } from './tsServer/versionProvider';
import TypeScriptServiceClient from './typescriptServiceClient';
import TypeScriptServiceClientHost from './typeScriptServiceClientHost';
import { ActiveJsTsEditorTracker } from './utils/activeJsTsEditorTracker';
import { ServiceConfigurationProvider } from './utils/configuration';
import * as fileSchemes from './utils/fileSchemes';
import { standardLanguageDescriptions } from './utils/languageDescription';
import ManagedFileContextManager from './utils/managedFileContext';
import { PluginManager } from './utils/plugins';

const tsHosts: Map<string, TypeScriptServiceClientHost> = new Map();

export interface HostFactory {
	getHostForWorkspaceFolder(
		workspaceFolder: vscode.WorkspaceFolder
	): TypeScriptServiceClientHost;
	getHostForUri(uri: vscode.Uri): TypeScriptServiceClientHost;
	reloadProjects(): void;
}

export function createHostFactory(
	context: vscode.ExtensionContext,
	onCaseInsensitiveFileSystem: boolean,
	services: {
		pluginManager: PluginManager;
		commandManager: CommandManager;
		logDirectoryProvider: ILogDirectoryProvider;
		cancellerFactory: OngoingRequestCancellerFactory;
		versionProvider: ITypeScriptVersionProvider;
		processFactory: TsServerProcessFactory;
		activeJsTsEditorTracker: ActiveJsTsEditorTracker;
		serviceConfigurationProvider: ServiceConfigurationProvider;
	},
	onCompletionAccepted: (item: vscode.CompletionItem) => void
): HostFactory {
	const getHostForWorkspaceFolder: HostFactory["getHostForWorkspaceFolder"] = (
		workspaceFolder
	) => {
		const uriStr = workspaceFolder.uri.toString();
		if (tsHosts.has(uriStr)) {
			return tsHosts.get(uriStr)!;
		}
		const clientHost = new TypeScriptServiceClientHost(
			standardLanguageDescriptions,
			context,
			onCaseInsensitiveFileSystem,
			services,
			onCompletionAccepted
		);

		context.subscriptions.push(clientHost);
		tsHosts.set(uriStr, clientHost);
		context.subscriptions.push(
			new ManagedFileContextManager(services.activeJsTsEditorTracker, (resource) => {
				return clientHost.serviceClient.toPath(resource);
			})
		);
		return clientHost;
	};
	return {
		getHostForWorkspaceFolder,
		getHostForUri: (uri) => {
			let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			if (!workspaceFolder) {
				workspaceFolder = {
					index: 0,
					name: "DEFAULT",
					uri: vscode.Uri.parse("unititled://"),
				};
			}
			return getHostForWorkspaceFolder(workspaceFolder);
		},
		reloadProjects: () => {
			[...tsHosts.values()].forEach((host) => host.reloadProjects());
		},
	};
}

export function lazilyActivateClient(
	context: vscode.ExtensionContext,
	hostFactory: HostFactory,
	pluginManager: PluginManager,
): vscode.Disposable {
	const disposables: vscode.Disposable[] = [];

	const supportedLanguage = [
		...standardLanguageDescriptions.map(x => x.languageIds),
		...pluginManager.plugins.map(x => x.languages)
	].flat();

	const initHostForDocument = (doc: vscode.TextDocument): void => {
		if (isSupportedDocument(supportedLanguage, doc)) {
			hostFactory.getHostForUri(doc.uri);
		}
	};

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(initHostForDocument)
	);

	vscode.workspace.textDocuments.forEach(initHostForDocument);

	return vscode.Disposable.from(...disposables);
}

function isSupportedDocument(
	supportedLanguage: readonly string[],
	document: vscode.TextDocument
): boolean {
	return supportedLanguage.indexOf(document.languageId) >= 0
		&& !fileSchemes.disabledSchemes.has(document.uri.scheme);
}
