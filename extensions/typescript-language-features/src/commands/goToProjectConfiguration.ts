/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ActiveJsTsEditorTracker } from '../utils/activeJsTsEditorTracker';
import { HostFactory } from "../lazyClientHost";
import { getCurrentDocumentUri } from "../utils/getCurrentDocumentUri";
import { openProjectConfigForFile, ProjectType } from '../utils/tsconfig';
import { Command } from './commandManager';

export class TypeScriptGoToProjectConfigCommand implements Command {
	public readonly id = 'typescript.goToProjectConfig';

	public constructor(
		private readonly activeJsTsEditorTracker: ActiveJsTsEditorTracker,
		private readonly hostFactory: HostFactory
	) { }

	public execute() {
		const editor = this.activeJsTsEditorTracker.activeJsTsEditor;
		if (editor) {
			const uri = getCurrentDocumentUri();
			if (!uri) {
				return;
			}
			const host = this.hostFactory.getHostForUri(uri);
			openProjectConfigForFile(ProjectType.TypeScript, host.serviceClient, editor.document.uri);
		}
	}
}

export class JavaScriptGoToProjectConfigCommand implements Command {
	public readonly id = 'javascript.goToProjectConfig';

	public constructor(
		private readonly activeJsTsEditorTracker: ActiveJsTsEditorTracker,
		private readonly hostFactory: HostFactory,
	) { }

	public execute() {
		const editor = this.activeJsTsEditorTracker.activeJsTsEditor;
		if (editor) {
			const uri = getCurrentDocumentUri();
			if (!uri) {
				return;
			}
			const host = this.hostFactory.getHostForUri(uri);
			openProjectConfigForFile(ProjectType.JavaScript, host.serviceClient, editor.document.uri);
		}
	}
}
