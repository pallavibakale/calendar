<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Modal
		class="import-modal"
		size="large"
		:name="$t('calendar', 'Import destination selection')"
		@close="cancelImport">
		<template v-if="isSelecting">
			<h2 class="import-modal__title">
				{{ $t('calendar', 'Import calendars') }}
			</h2>
			<h4 class="import-modal__subtitle">
				{{ $t('calendar', 'Please select a calendar to import into …') }}
			</h4>

			<transition-group class="import-modal__file-list" tag="ul">
				<li key="import-header-row" class="import-modal-file-item import-modal-file-item--header">
					<div class="import-modal-file-item__filename">
						{{ $t('calendar', 'Filename') }}
					</div>
					<div class="import-modal-file-item__calendar-select">
						{{ $t('calendar', 'Calendar to import into') }}
					</div>
				</li>
				<ImportScreenRow v-for="(file, index) in files" :key="`import-file-${index}`" :file="file" />
			</transition-group>

			<div class="import-modal__actions">
				<NcButton @click="cancelImport">
					{{ $t('calendar', 'Cancel') }}
				</NcButton>
				<NcButton class="primary" @click="importCalendar">
					{{ $n('calendar', 'Import calendar', 'Import calendars', files.length) }}
				</NcButton>
			</div>
		</template>

		<template v-else>
			<h2 class="import-modal__title">
				{{ $t('calendar', 'Importing calendars') }}
			</h2>
			<h4 class="import-modal__subtitle">
				{{ activeFileLabel }}
			</h4>

			<progress
				class="settings-fieldset-interior-item__import-progress-bar"
				:value="totals.processed"
				:max="Math.max(totals.discovered, 1)" />

			<div class="import-modal__counters">
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<ProgressQuestionIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.discovered }}</strong>
						<span>{{ $t('calendar', 'Discovered') }}</span>
					</div>
				</div>
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<ProgressClockIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.processed }}</strong>
						<span>{{ $t('calendar', 'Processed') }}</span>
					</div>
				</div>
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<CheckBoldIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.created }}</strong>
						<span>{{ $t('calendar', 'Created') }}</span>
					</div>
				</div>
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<ReloadIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.updated }}</strong>
						<span>{{ $t('calendar', 'Updated') }}</span>
					</div>
				</div>
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<CloseIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.exists }}</strong>
						<span>{{ $t('calendar', 'Skipped') }}</span>
					</div>
				</div>
				<div class="import-modal__counter">
					<span class="import-modal__counter-icon" aria-hidden="true">
						<AlertCircleOutlineIcon :size="18" decorative />
					</span>
					<div class="import-modal__counter-content">
						<strong>{{ totals.error }}</strong>
						<span>{{ $t('calendar', 'Errors') }}</span>
					</div>
				</div>
			</div>
		</template>
	</Modal>
</template>

<script>
import { NcModal as Modal, NcButton } from '@nextcloud/vue'
import AlertCircleOutlineIcon from 'vue-material-design-icons/AlertCircleOutline'
import CheckBoldIcon from 'vue-material-design-icons/CheckBold'
import CloseIcon from 'vue-material-design-icons/Close'
import ProgressClockIcon from 'vue-material-design-icons/ProgressClock'
import ProgressQuestionIcon from 'vue-material-design-icons/ProgressQuestion'
import ReloadIcon from 'vue-material-design-icons/Reload'
import ImportScreenRow from './ImportScreenRow.vue'

export default {
	name: 'ImportScreen',
	components: {
		AlertCircleOutlineIcon,
		CheckBoldIcon,
		CloseIcon,
		NcButton,
		ImportScreenRow,
		Modal,
		ProgressClockIcon,
		ProgressQuestionIcon,
		ReloadIcon,
	},

	props: {
		files: {
			type: Array,
			required: true,
		},

		stage: {
			type: String,
			required: true,
		},

		totals: {
			type: Object,
			required: true,
		},

		activeSession: {
			type: Object,
			default: null,
		},
	},

	emits: ['cancelImport', 'importCalendar'],

	computed: {
		isSelecting() {
			return this.stage === 'selecting'
		},

		activeFileLabel() {
			if (!this.activeSession) {
				return this.$t('calendar', 'Preparing import…')
			}

			return this.$t('calendar', 'Importing {fileName} into {calendar}', {
				fileName: this.activeSession.fileName,
				calendar: this.activeSession.targetDisplayName || this.$t('calendar', 'selected calendar'),
			})
		},
	},

	methods: {
		importCalendar() {
			this.$emit('importCalendar')
		},

		cancelImport() {
			this.$emit('cancelImport')
		},
	},
}
</script>
