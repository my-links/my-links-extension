import { Button } from '@minimalstuff/ui';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export function NewTabApp() {
	const [mylinksUrl, setMylinksUrl] = useState<string>(
		'https://www.mylinks.app'
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const response = await chrome.runtime.sendMessage({
				type: 'GET_SETTINGS',
			});
			if (response && response.success && response.data?.mylinksUrl) {
				setMylinksUrl(response.data.mylinksUrl);
			}
		} catch (err) {
			console.error('Failed to load settings', err);
			setError('Failed to load settings');
		} finally {
			setLoading(false);
		}
	};

	const generateRandomParam = () => {
		return Math.random().toString(36).substring(2, 15);
	};

	const getMyLinksUrl = () => {
		const randomParam = generateRandomParam();
		return `${mylinksUrl}/dashboard?cache=${randomParam}`;
	};

	const handleRefresh = () => {
		const iframe = document.getElementById(
			'mylinks-frame'
		) as HTMLIFrameElement;
		if (iframe) {
			iframe.src = getMyLinksUrl();
		}
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-sm py-8">
				<p className="text-center text-lg text-gray-900 dark:text-white">
					{chrome.i18n.getMessage('loadingMyLinks')}
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-sm py-8">
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
					<div className="flex items-start gap-3">
						<IconAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
						<div className="flex-1">
							<h3 className="mb-1 text-sm font-semibold text-red-800 dark:text-red-200">
								{chrome.i18n.getMessage('error')}
							</h3>
							<p className="mb-3 text-sm text-red-700 dark:text-red-300">
								{error}
							</p>
							<Button
								variant="danger"
								onClick={handleRefresh}
								className="gap-2"
							>
								<IconRefresh size={16} />
								{chrome.i18n.getMessage('retry')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-screen w-screen">
			<iframe
				id="mylinks-frame"
				src={getMyLinksUrl()}
				title="MyLinks Dashboard"
				className="block h-full w-full border-0"
				onLoad={() => setLoading(false)}
				onError={() =>
					setError(chrome.i18n.getMessage('failedToLoadDashboard'))
				}
			/>
		</div>
	);
}
