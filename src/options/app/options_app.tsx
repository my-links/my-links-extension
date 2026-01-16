import { ErrorDisplay, LoadingSpinner } from '../../components';
import { useOptionsState } from '../../hooks';
import { AddLinkView } from '../../popup/views/add_link';
import { InitializationView } from '../../popup/views/initialization';
import { SettingsView } from '../../popup/views/settings';

export function OptionsApp() {
	const {
		settings,
		collections,
		pendingLink,
		loading,
		error,
		handleInitialize,
		handleSettingsUpdate,
		handleAddLink,
		setPendingLink,
	} = useOptionsState();

	if (loading) {
		return <LoadingSpinner visible={loading} />;
	}

	if (error) {
		return <ErrorDisplay error={error} />;
	}

	if (!settings?.isInitialized) {
		return (
			<div className="mx-auto max-w-2xl py-8">
				<InitializationView onInitialize={handleInitialize} />
			</div>
		);
	}

	if (pendingLink) {
		return (
			<div className="mx-auto max-w-2xl py-8">
				<AddLinkView
					link={pendingLink}
					collections={collections}
					onAddLink={handleAddLink}
					onCancel={() => setPendingLink(null)}
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl py-8">
			<SettingsView
				settings={settings}
				onSettingsUpdate={handleSettingsUpdate}
			/>
		</div>
	);
}
