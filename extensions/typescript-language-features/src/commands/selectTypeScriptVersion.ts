/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HostFactory } from "../lazyClientHost";
import { getCurrentDocumentUri } from "../utils/getCurrentDocumentUri";
import { Command } from './commandManager';

export class SelectTypeScriptVersionCommand implements Command {
	public static readonly id = 'typescript.selectTypeScriptVersion';
	public readonly id = SelectTypeScriptVersionCommand.id;

	public constructor(
		private readonly hostFactory: HostFactory
	) { }

	public execute() {
		const uri = getCurrentDocumentUri();
		if (!uri) {
			return;
		}
		const host = this.hostFactory.getHostForUri(uri);
		if (!host) {
			return;
		}
			host.serviceClient.showVersionPicker();
	}
}
