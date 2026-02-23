// components/pages/devices/devices-list.tsx
'use client';

import { useState } from 'react';
import { DEVICE_TYPE } from '@/lib/const';
import { getDeviceName, normalizeDeviceType } from '@/lib/utils';
import { RefreshIcon, DisconnectIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
	CreditCard,
	Watch,
	Tag,
	Cog,
	Pencil,
	ArrowLeft,
	Plus,
	Link2,
	Unlink,
	ChevronDown,
	User,
} from 'lucide-react';
import { DevicesListSkeleton } from '@/components/shared/skeleton/deviceList';
import { toast } from 'sonner';
import { removeDevice } from '@/lib/services/device';
import UpdateDeviceModal from '@/components/shared/models/updateDeviceModel';
import Link from 'next/link';
import {
	linkDeviceToProfile,
	unlinkDeviceFromProfile,
	type DeviceBinding,
} from '@/lib/services/device-profile';
import Image from 'next/image';

type Device = DeviceInterface;

interface ProfileInfo {
	id: string;
	name: string;
	slug: string | null;
	profilePhoto: string | null;
}

export default function DevicesList({
	devices: initialDevices,
	userId,
	accessToken,
	profiles: initialProfiles,
	bindings: initialBindings,
}: {
	devices: Device[];
	userId: string;
	accessToken: string;
	profiles: ProfileInfo[];
	bindings: DeviceBinding[];
}) {
	const [devices, setDevices] = useState<Device[]>(initialDevices);
	const [selected, setSelected] = useState<string | null>(null);
	const [activeModal, setActiveModal] = useState<Device | null>(null);
	const [profiles] = useState<ProfileInfo[]>(initialProfiles);
	const [bindings, setBindings] = useState<DeviceBinding[]>(initialBindings);
	const [linkingDevice, setLinkingDevice] = useState<string | null>(null);
	const [actionInProgress, setActionInProgress] = useState<string | null>(
		null,
	);

	const [loading, setLoading] = useState(false);

	/** Get the profile a device is currently linked to */
	const getBoundProfile = (deviceId: string): DeviceBinding | undefined =>
		bindings.find((b) => b.deviceId === deviceId);

	const handleRemoveDevice = async (device: Device) => {
		const confirmed = window.confirm(
			`Remove "${device.label || device.productId}" from your account? You can re-add it later.`,
		);
		if (!confirmed) return;

		setActionInProgress(device.id);
		try {
			const res = await removeDevice(device.id, accessToken);
			if (res.ok) {
				toast.success('Device removed from your account');
				setDevices((prev) => prev.filter((d) => d.id !== device.id));
				setBindings((prev) =>
					prev.filter((b) => b.deviceId !== device.id),
				);
				setSelected(null);
			} else {
				toast.error(res.data?.message || 'Failed to remove device');
			}
		} catch {
			toast.error('Failed to remove device');
		}
		setActionInProgress(null);
	};

	const handleRefresh = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/device?userId=${userId}`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			const json = await res.json();
			setDevices(json?.data ?? []);

			// Also refresh bindings
			const bindingsRes = await fetch('/api/connect/device-bindings', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (bindingsRes.ok) {
				const bindingsJson = await bindingsRes.json();
				setBindings(bindingsJson?.data?.bindings ?? []);
			}
		} catch {
			toast.error('Failed to refresh devices');
		}
		setLoading(false);
	};

	const handleLink = async (deviceId: string, profileId: string) => {
		setActionInProgress(deviceId);
		const result = await linkDeviceToProfile(profileId, deviceId);
		if (result.success) {
			toast.success(result.message || 'Device linked to profile');
			// Optimistic update
			setBindings((prev) => {
				const filtered = prev.filter((b) => b.deviceId !== deviceId);
				const profile = profiles.find((p) => p.id === profileId);
				return [
					...filtered,
					{
						id: `temp-${Date.now()}`,
						deviceId,
						profileId,
						linkedAt: new Date().toISOString(),
						profile: profile ?? undefined,
					},
				];
			});
		} else {
			toast.error(result.message || 'Failed to link device');
		}
		setLinkingDevice(null);
		setActionInProgress(null);
	};

	const handleUnlink = async (deviceId: string) => {
		const binding = getBoundProfile(deviceId);
		if (!binding) return;

		setActionInProgress(deviceId);
		const result = await unlinkDeviceFromProfile(
			binding.profileId,
			deviceId,
		);
		if (result.success) {
			toast.success(result.message || 'Device unlinked');
			setBindings((prev) => prev.filter((b) => b.deviceId !== deviceId));
		} else {
			toast.error(result.message || 'Failed to unlink device');
		}
		setActionInProgress(null);
	};

	const getDeviceIcon = (type: string, productId: string) => {
		const normalizedType = normalizeDeviceType(type, productId);
		if (normalizedType === DEVICE_TYPE.CARD)
			return <CreditCard className='h-5 w-5' />;
		if (normalizedType === DEVICE_TYPE.WRISTBAND)
			return <Watch className='h-5 w-5' />;
		if (normalizedType === DEVICE_TYPE.STICKER)
			return <Tag className='h-5 w-5' />;
		return <Cog className='h-5 w-5' />;
	};

	return (
		<>
			{activeModal && (
				<UpdateDeviceModal
					open={!!activeModal}
					onClose={() => setActiveModal(null)}
					device={activeModal}
					accessToken={accessToken}
					onUpdated={handleRefresh}
				/>
			)}

			<div className='flex items-center justify-between mb-6'>
				<Link
					href='/settings'
					className='inline-flex items-center gap-2 text-white/90 hover:text-white'
				>
					<ArrowLeft className='w-5 h-5' />
				</Link>
				<div className='flex items-center gap-2'>
					<Button
						asChild
						variant='secondary'
						className='rounded-full px-4'
					>
						<Link href='/connect'>
							<Plus className='w-4 h-4 mr-1' />
							Add new device
						</Link>
					</Button>
					<Button
						onClick={handleRefresh}
						variant='ghost'
					>
						<RefreshIcon className='w-4 h-4' /> Refresh
					</Button>
				</div>
			</div>

			<div className='mb-6'>
				<h1 className='text-2xl font-semibold'>My Devices</h1>
				<p className='text-sm text-white/50 mt-1'>
					Link each device to a profile to control which card it
					shares.
				</p>
			</div>

			{loading ?
				<DevicesListSkeleton />
			: devices.length === 0 ?
				<div className='flex flex-col items-center justify-center py-20'>
					<p className='text-white/70 mb-4'>
						No connected devices found.
					</p>
					<Button
						asChild
						className='rounded-full px-6 py-2'
					>
						<Link href='/connect'>Connect a device</Link>
					</Button>
				</div>
			:	<div className='space-y-4'>
					{devices.map((device) => {
						const isExpanded = selected === device.id;
						const binding = getBoundProfile(device.productId);
						const isLinking = linkingDevice === device.productId;
						const isBusy = actionInProgress === device.productId;

						return (
							<div
								key={device.id}
								className='border border-white/10 rounded-2xl overflow-hidden'
							>
								{/* Device header */}
								<button
									onClick={() =>
										setSelected(
											isExpanded ? null : device.id,
										)
									}
									className='flex items-center justify-between w-full text-left p-4'
								>
									<div className='flex items-center gap-3'>
										<div className='w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center'>
											{getDeviceIcon(
												device.type,
												device.productId,
											)}
										</div>
										<div>
											<h2 className='text-sm font-medium'>
												{device.label || 'Unlabelled'}
											</h2>
											<p className='text-[10px] text-white/50'>
												{getDeviceName(
													device.type,
													device.productId,
												)}{' '}
												· •••
												{device.productId?.slice(-5)}
											</p>
											<p className='text-xs text-white/60 mt-0.5'>
												Added{' '}
												{(
													device.assignedAt ||
													device.createdAt
												) ?
													new Date(
														device.assignedAt ||
															device.createdAt!,
													).toLocaleDateString(
														'en-GB',
														{
															day: 'numeric',
															month: 'short',
															year: 'numeric',
														},
													)
												:	'—'}
											</p>
										</div>
									</div>

									<div className='flex items-center gap-2'>
										{/* Binding badge */}
										{binding?.profile ?
											<span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 text-xs'>
												<Link2 className='w-3 h-3' />
												{binding.profile.name}
											</span>
										:	<span className='inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-400 px-2.5 py-0.5 text-xs'>
												<Unlink className='w-3 h-3' />
												Unlinked
											</span>
										}
										<ChevronDown
											className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
										/>
									</div>
								</button>

								{/* Expanded content */}
								{isExpanded && (
									<div className='border-t border-white/5 px-4 pb-4'>
										{/* Profile Binding Section */}
										<div className='mt-4'>
											<h3 className='text-xs font-semibold uppercase tracking-wider text-white/40 mb-3'>
												Profile Binding
											</h3>

											{binding?.profile ?
												<div className='flex items-center justify-between bg-white/[0.04] rounded-xl p-3'>
													<div className='flex items-center gap-3'>
														{(
															binding.profile
																.profilePhoto
														) ?
															<Image
																src={
																	binding
																		.profile
																		.profilePhoto
																}
																alt={
																	binding
																		.profile
																		.name
																}
																width={36}
																height={36}
																className='rounded-full object-cover'
															/>
														:	<div className='w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center'>
																<User className='w-4 h-4 text-white/60' />
															</div>
														}
														<div>
															<p className='text-sm font-medium'>
																{
																	binding
																		.profile
																		.name
																}
															</p>
															{binding.profile
																.slug && (
																<p className='text-xs text-white/50'>
																	/
																	{
																		binding
																			.profile
																			.slug
																	}
																</p>
															)}
														</div>
													</div>
													<Button
														size='sm'
														variant='ghost'
														className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
														disabled={isBusy}
														onClick={() =>
															handleUnlink(
																device.productId,
															)
														}
													>
														<Unlink className='w-3.5 h-3.5 mr-1' />
														Unlink
													</Button>
												</div>
											: isLinking ?
												<div className='space-y-2'>
													<p className='text-xs text-white/60 mb-2'>
														Select a profile to link
														this device to:
													</p>
													{profiles.length === 0 ?
														<p className='text-sm text-white/40 py-2'>
															No profiles found.{' '}
															<Link
																href='/settings/account/create'
																className='text-sky-400 hover:underline'
															>
																Create one
															</Link>
														</p>
													:	profiles.map((profile) => (
															<button
																key={profile.id}
																disabled={
																	isBusy
																}
																onClick={() =>
																	handleLink(
																		device.productId,
																		profile.id,
																	)
																}
																className='flex items-center gap-3 w-full rounded-xl bg-white/[0.04] hover:bg-white/[0.08] p-3 transition text-left disabled:opacity-50'
															>
																{(
																	profile.profilePhoto
																) ?
																	<Image
																		src={
																			profile.profilePhoto
																		}
																		alt={
																			profile.name
																		}
																		width={
																			32
																		}
																		height={
																			32
																		}
																		className='rounded-full object-cover'
																	/>
																:	<div className='w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center'>
																		<User className='w-3.5 h-3.5 text-white/60' />
																	</div>
																}
																<div>
																	<p className='text-sm font-medium'>
																		{
																			profile.name
																		}
																	</p>
																	{profile.slug && (
																		<p className='text-xs text-white/50'>
																			/
																			{
																				profile.slug
																			}
																		</p>
																	)}
																</div>
															</button>
														))
													}
													<Button
														size='sm'
														variant='ghost'
														className='text-white/50 mt-1'
														onClick={() =>
															setLinkingDevice(
																null,
															)
														}
													>
														Cancel
													</Button>
												</div>
											:	<button
													disabled={isBusy}
													onClick={() =>
														setLinkingDevice(
															device.productId,
														)
													}
													className='flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] p-3 w-full text-left transition disabled:opacity-50'
												>
													<Link2 className='w-4 h-4 text-white/40' />
													<span className='text-sm text-white/60'>
														Link to a profile
													</span>
												</button>
											}
										</div>

										{/* Actions */}
										<div className='grid grid-cols-3 gap-3 text-center mt-5'>
											<button
												disabled={!!actionInProgress}
												onClick={() =>
													handleRemoveDevice(device)
												}
												className='flex flex-col items-center gap-2 disabled:opacity-50'
											>
												<span className='w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center'>
													<DisconnectIcon className='w-5 h-5' />
												</span>
												<span className='text-xs'>
													Disconnect
												</span>
											</button>
											<button
												onClick={handleRefresh}
												className='flex flex-col items-center gap-2'
											>
												<span className='w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center'>
													<RefreshIcon className='w-5 h-5' />
												</span>
												<span className='text-xs'>
													Refresh
												</span>
											</button>
											<button
												onClick={() =>
													setActiveModal(device)
												}
												className='flex flex-col items-center gap-2'
											>
												<span className='w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center'>
													<Pencil className='w-5 h-5' />
												</span>
												<span className='text-xs'>
													Update
												</span>
											</button>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			}
		</>
	);
}
