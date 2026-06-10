/**
 * Calendar import service
 */
import { getRequestToken } from '@nextcloud/auth'
import { generateOcsUrl } from '@nextcloud/router'

import type {
	ImportRequest,
	ImportStreamDataResponse,
	ImportStreamRequest,
	ImportStreamResponse,
} from '@/types/import'

const API_URL = generateOcsUrl('/calendar/import')
const OPERATION = 'calendar import'

function getRequestUrl(): string {
	if (typeof window === 'undefined') {
		return API_URL
	}

	const url = new URL(API_URL, window.location.origin)
	return `${url.pathname}${url.search}`
}

export function generateTransactionId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function processStreamMessage(
	message: ImportStreamResponse,
	onData: (data: ImportStreamDataResponse) => void,
	): void {
	if (message.type === 'control') {
		return
	}

	onData(message)
}

async function transceiveStream(
	request: ImportRequest,
	onData: (data: ImportStreamDataResponse) => void,
): Promise<void> {
	const streamRequest: ImportStreamRequest = {
		transaction: generateTransactionId(),
		...request,
	}

	const response = await fetch(getRequestUrl(), {
		method: 'POST',
		credentials: 'same-origin',
		headers: {
			Accept: 'application/x-ndjson',
			'Content-Type': 'application/json',
			'OCS-APIRequest': 'true',
			'X-Requested-With': 'XMLHttpRequest',
			requesttoken: getRequestToken() ?? '',
		},
		body: JSON.stringify(streamRequest),
	})

	if (!response.ok) {
		throw new Error(`[${OPERATION}] Request failed with status ${response.status}`)
	}

	const stream = response.body
	if (!stream || typeof stream.getReader !== 'function') {
		throw new Error(`[${OPERATION}] Response body is not readable`)
	}

	const reader = stream.getReader()
	const decoder = new TextDecoder()
	let buffer = ''

	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) {
				break
			}

			buffer += decoder.decode(value, { stream: true })
			const lines = buffer.split('\n')
			buffer = lines.pop() ?? ''

			for (const line of lines) {
				if (!line.trim()) {
					continue
				}

				processStreamMessage(JSON.parse(line) as ImportStreamResponse, onData)
			}
		}

		buffer += decoder.decode()
		if (buffer.trim()) {
			processStreamMessage(JSON.parse(buffer) as ImportStreamResponse, onData)
		}
	} finally {
		reader.releaseLock()
	}
}

export const importService = {
	async import(request: ImportRequest, onData: (data: ImportStreamDataResponse) => void): Promise<void> {
		return transceiveStream(request, onData)
	},
}

export default importService
