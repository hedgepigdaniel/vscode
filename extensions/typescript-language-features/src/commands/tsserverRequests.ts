/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TypeScriptRequests } from '../typescriptService';
import { HostFactory } from "../lazyClientHost";
import { nulToken } from '../utils/cancellation';
import { Command } from './commandManager';
import { getCurrentDocumentUri } from '../utils/getCurrentDocumentUri';

export class TSServerRequestCommand implements Command {
	public readonly id = 'typescript.tsserverRequest';

	public constructor(
		private readonly hostFactory: HostFactory
	) { }

	public execute(requestID: keyof TypeScriptRequests, args?: any, config?: any) {
		// A cancellation token cannot be passed through the command infrastructure
		const token = nulToken;

		// The list can be found in the TypeScript compiler as `const enum CommandTypes`,
		// to avoid extensions making calls which could affect the internal tsserver state
		// these are only read-y sorts of commands
		const allowList = [
			// Seeing the JS/DTS output for a file
			'emit-output',
			// Grabbing a file's diagnostics
			'semanticDiagnosticsSync',
			'syntacticDiagnosticsSync',
			'suggestionDiagnosticsSync',
			// Introspecting code at a position
			'quickinfo',
			'quickinfo-full',
			'completionInfo'
		];

		if (!allowList.includes(requestID)) { return; }

		const uri = getCurrentDocumentUri();
		if (!uri) {
			return;
		}
		const host = this.hostFactory.getHostForUri(uri);
		host.serviceClient.restartTsServer(true);

		return host.serviceClient.execute(requestID, args, token, config);
	}
}

