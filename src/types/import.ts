export type ImportFormat = 'ical' | 'jcal' | 'xcal'
export type ImportDisposition = 'created' | 'updated' | 'exists' | 'error'
export type ImportSessionStage = 'idle' | 'preparing' | 'selecting' | 'importing' | 'completed' | 'error'

export interface ImportStreamRequest {
	transaction: string
	target: string
	options: {
		format: ImportFormat
		validation: number
		errors: number
		supersede: boolean
	}
	data: string
	user?: string
}

export interface ImportStreamStartResponse {
	type: 'control'
	transaction: string
	disposition: 'start'
}

export interface ImportStreamEndResponse {
	type: 'control'
	transaction: string
	disposition: 'end'
}

export interface ImportStreamCountResponse {
	type: 'count'
	transaction: string
	vevent: number
	vtodo: number
	vjournal: number
}

export interface ImportStreamObjectResponse {
	type: 'object'
	transaction: string
	identifier: string | null
	disposition: ImportDisposition
	errors: string[]
}

export type ImportStreamDataResponse = ImportStreamCountResponse | ImportStreamObjectResponse

export type ImportStreamResponse
	= | ImportStreamStartResponse
		| ImportStreamEndResponse
		| ImportStreamCountResponse
		| ImportStreamObjectResponse

export type ImportRequest = Omit<ImportStreamRequest, 'transaction'>

export interface ImportCounters {
	discovered: number
	processed: number
	created: number
	updated: number
	exists: number
	error: number
}

export interface ImportFileSession {
	fileId: number
	fileName: string
	targetDisplayName: string
	targetUri: string | null
	status: 'pending' | 'importing' | 'completed' | 'error'
	counters: ImportCounters
	recentResults: ImportStreamObjectResponse[]
	lastError: string | null
}