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
			if (response.success && response.settings.mylinksUrl) {
				setMylinksUrl(response.settings.mylinksUrl);
			}
		} catch (err) {
			console.error('Failed to load settings:', err);
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
					Loading MyLinks...
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
								Error
							</h3>
							<p className="mb-3 text-sm text-red-700 dark:text-red-300">
								{error}
							</p>
							<button
								type="button"
								onClick={handleRefresh}
								className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
							>
								<IconRefresh size={16} />
								Retry
							</button>
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
				onError={() => setError('Failed to load MyLinks dashboard')}
			/>
		</div>
	);
}
