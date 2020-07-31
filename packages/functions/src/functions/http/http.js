/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the 
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const { convert } = require('@cedalo/commons');
const { AsyncRequest, runFunction, terms: { getCellRangeFromTerm, hasValue } } = require('../../utils');
const { addHTTPResponseToInbox, addHTTPResponseToCell, addHTTPResponseToRange } = require('./utils');
const { getInstance } = require('@cedalo/http-client');
const { FunctionErrors } = require('@cedalo/error-codes');

const ERROR = FunctionErrors.code;

const asString = (value) => value ? convert.toString(value) : '';
const asBoolean = (value) => value ? convert.toBoolean(value) : false;

const createDefaultCallback = (parse = false) => (context, response, error) => {
	const term = context.term;

	// add to inbox
	const inbox = context.term.scope.streamsheet.inbox;
	addHTTPResponseToInbox(response, context, error, parse);

	const err = error || response.error;
	if (term && !term.isDisposed) {
		term.cellValue = err ? ERROR.RESPONSE : undefined;
	}
	return err ? AsyncRequest.STATE.REJECTED : undefined;
};

const request = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(2)
		.withMaxArgs(5)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((method) => asString(method.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.mapNextArg((target) => hasValue(target) ? target.value : {})
		.mapNextArg((parse) => asBoolean(parse.value, ERROR.VALUE))
		.run((url, method, config, target, parse) => {
			config.url = url;
			config.method = method;
			return AsyncRequest.create(sheet, request.context)
				.request(() => getInstance().request(config))
				.response(createDefaultCallback(parse))
				.reqId();
		});
request.displayName = true;

const get = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(3)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.mapNextArg((parse) => hasValue(parse) ? asBoolean(parse.value, ERROR.VALUE) : false)
		.run((url, config, parse) => {
			return AsyncRequest.create(sheet, get.context)
				.request(() => getInstance().get(url, config))
				.response(createDefaultCallback(parse))
				.reqId()
		});
get.displayName = true;

const post = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(3)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((data) => hasValue(data) ? data.value : '')
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, data, config) => {
			if (typeof data === 'object') {
				// handle JSON
			}
			return AsyncRequest.create(sheet, post.context)
				.request(() => getInstance().post(url, data, config))
				.reqId()
		});
post.displayName = true;

const put = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(3)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((data) => hasValue(data) ? data.value : '')
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, data, config) => {
			return AsyncRequest.create(sheet, put.context)
				.request(() => getInstance().put(url, data, config))
				.response(createDefaultCallback())
				.reqId()
		});
put.displayName = true;

const patch = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(3)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((data) => hasValue(data) ? data.value : '')
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, data, config) => {
			return AsyncRequest.create(sheet, patch.context)
				.request(() => getInstance().patch(url, data, config))
				.response(createDefaultCallback())
				.reqId()
		});
patch.displayName = true;

const deleteFunction = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(2)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, config) =>
			AsyncRequest.create(sheet, deleteFunction.context)
				.request(() => getInstance().delete(url, config))
				.response(createDefaultCallback())
				.reqId()
		);
deleteFunction.displayName = true;

const trace = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(2)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, config) => {
			config.url = url;
			config.method = 'TRACE';
			return AsyncRequest.create(sheet, request.context)
				.request(() => getInstance().request(config))
				.response(createDefaultCallback())
				.reqId();
		});
trace.displayName = true;

const head = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(2)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, config) =>
			AsyncRequest.create(sheet, head.context)
				.request(() => getInstance().head(url, config))
				.response(createDefaultCallback())
				.reqId()
		);
head.displayName = true;

const options = (sheet, ...terms) =>
	runFunction(sheet, terms)
		.onSheetCalculation()
		.withMinArgs(1)
		.withMaxArgs(2)
		.mapNextArg((url) => asString(url.value, ERROR.VALUE))
		.mapNextArg((config) => hasValue(config) ? config.value : {})
		.run((url, config) =>
			AsyncRequest.create(sheet, options.context)
				.request(() => getInstance().options(url, config))
				.response(defaultCallback)
				.response(createDefaultCallback())
				.reqId()
		);
options.displayName = true;

module.exports = {
	'HTTP.REQUEST2': request,
	'HTTP.GET': get,
	'HTTP.POST': post,
	'HTTP.PUT': put,
	'HTTP.PATCH': patch,
	'HTTP.DELETE': deleteFunction,
	'HTTP.TRACE': trace,
	'HTTP.HEAD': head,
	'HTTP.OPTIONS': options
};
