import type { Config } from 'release-it';

export default {
	git: {
		commitMessage: 'chore: release v${version}',
		commit: true,
		tag: true,
		push: true,
	},
	github: {
		release: true,
		releaseName: 'Release ${version}',
		autoGenerate: true,
	},
} satisfies Config;
