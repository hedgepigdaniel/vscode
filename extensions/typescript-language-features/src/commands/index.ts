/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ActiveJsTsEditorTracker } from '../utils/activeJsTsEditorTracker';
import { HostFactory } from "../lazyClientHost";
import { PluginManager } from '../utils/plugins';
import { CommandManager } from './commandManager';
import { ConfigurePluginCommand } from './configurePlugin';
import { JavaScriptGoToProjectConfigCommand, TypeScriptGoToProjectConfigCommand } from './goToProjectConfiguration';
import { LearnMoreAboutRefactoringsCommand } from './learnMoreAboutRefactorings';
import { OpenTsServerLogCommand } from './openTsServerLog';
import { ReloadJavaScriptProjectsCommand, ReloadTypeScriptProjectsCommand } from './reloadProject';
import { RestartTsServerCommand } from './restartTsServer';
import { SelectTypeScriptVersionCommand } from './selectTypeScriptVersion';
import { TSServerRequestCommand } from './tsserverRequests';

export function registerBaseCommands(
	commandManager: CommandManager,
	hostFactory: HostFactory,
	pluginManager: PluginManager,
	activeJsTsEditorTracker: ActiveJsTsEditorTracker,
): void {
	commandManager.register(new ReloadTypeScriptProjectsCommand(hostFactory));
	commandManager.register(new ReloadJavaScriptProjectsCommand(hostFactory));
	commandManager.register(new SelectTypeScriptVersionCommand(hostFactory));
	commandManager.register(new OpenTsServerLogCommand(hostFactory));
	commandManager.register(new RestartTsServerCommand(hostFactory));
	commandManager.register(new TypeScriptGoToProjectConfigCommand(activeJsTsEditorTracker, hostFactory));
	commandManager.register(new JavaScriptGoToProjectConfigCommand(activeJsTsEditorTracker, hostFactory));
	commandManager.register(new ConfigurePluginCommand(pluginManager));
	commandManager.register(new LearnMoreAboutRefactoringsCommand());
	commandManager.register(new TSServerRequestCommand(hostFactory));
}
