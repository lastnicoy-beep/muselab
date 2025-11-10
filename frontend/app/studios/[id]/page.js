'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../../components/Navbar.jsx';
import Canvas from '../../../components/Canvas.jsx';
import FilePanel from '../../../components/FilePanel.jsx';
import CommentPanel from '../../../components/CommentPanel.jsx';
import ChatBox from '../../../components/ChatBox.jsx';
import Loader from '../../../components/Loader.jsx';
import { del, get, post } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { getSocket } from '../../../lib/socket';

export default function StudioView({ params }) {
	const { loading: authLoading, isAuthenticated, user, token } = useAuth();
	const { pushToast } = useToast();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [studio, setStudio] = useState(null);
	const [assets, setAssets] = useState([]);
	const [comments, setComments] = useState([]);
	const notesKey = `studio_notes_${params.id}`;
	const [notes, setNotes] = useState('');
	const [presence, setPresence] = useState([]);
	const [socket, setSocket] = useState(null);
	const colorsRef = useRef(new Map());
	const colorPalette = ['#F97316', '#0EA5E9', '#A855F7', '#22C55E', '#FACC15', '#EC4899', '#14B8A6'];

	const assignColor = (userId) => {
		if (!userId) return '#F97316';
		if (!colorsRef.current.has(userId)) {
			const color = colorPalette[colorsRef.current.size % colorPalette.length];
			colorsRef.current.set(userId, color);
		}
		return colorsRef.current.get(userId);
	};

	const formatPresenceUser = (entry) => ({
		userId: entry.userId,
		name: entry.name,
		initials: getInitials(entry.name),
		color: assignColor(entry.userId)
	});

	useEffect(() => {
		if (authLoading || !isAuthenticated) return;
		async function fetchStudio() {
			try {
				setLoading(true);
				const result = await get(`/api/studios/${params.id}`, { auth: true, token });
				setStudio(result);
				setAssets(result.assets || []);
				setComments(result.comments || []);
				if (typeof window !== 'undefined') {
					setNotes(localStorage.getItem(notesKey) || '');
				}
				const basePresence = new Map();
				if (result.owner) {
					basePresence.set(result.owner.id, {
						userId: result.owner.id,
						name: result.owner.name,
						initials: getInitials(result.owner.name),
						color: assignColor(result.owner.id)
					});
				}
				if (result.members?.length) {
					result.members.forEach((member) => {
						if (!member.user) return;
						basePresence.set(member.user.id, {
							userId: member.user.id,
							name: member.user.name,
							initials: getInitials(member.user.name),
							color: assignColor(member.user.id)
						});
					});
				}
				setPresence(Array.from(basePresence.values()));
			} catch (err) {
				const message = err?.data?.message || 'Gagal memuat data studio.';
				setError(typeof message === 'string' ? message : 'Gagal memuat data studio.');
			} finally {
				setLoading(false);
			}
		}
		fetchStudio();
	}, [authLoading, isAuthenticated, token, params.id]);

	useEffect(() => {
		if (authLoading || !isAuthenticated || !user) return undefined;
		const instance = getSocket(token);
		const userPayload = { id: user.id, name: user.name };
		setSocket(instance);
		setPresence((prev) => {
			const exists = prev.some((member) => member.userId === userPayload.id);
			return exists
				? prev
				: [
						...prev,
						{
							userId: userPayload.id,
							name: userPayload.name,
							initials: getInitials(userPayload.name),
							color: assignColor(userPayload.id)
						}
					];
		});

		instance.emit('join_studio', { studioId: params.id, user: userPayload });

		const handleActiveUsers = (users = []) => {
			setPresence(users.map(formatPresenceUser));
		};

		const handleUserJoined = ({ userId, name }) => {
			setPresence((prev) => {
				if (prev.some((member) => member.userId === userId)) return prev;
				return [
					...prev,
					{
						userId,
						name,
						initials: getInitials(name),
						color: assignColor(userId)
					}
				];
			});
		};

		const handleUserLeft = ({ userId }) => {
			setPresence((prev) => prev.filter((member) => member.userId !== userId));
		};

		const handleAssetUpdated = (payload) => {
			if (!payload) return;
			setAssets((prev) => {
				const exists = prev.some((asset) => asset.id === payload.id);
				if (exists) {
					return prev.map((asset) => (asset.id === payload.id ? payload : asset));
				}
				return [payload, ...prev];
			});
		};

		const handleAssetDeleted = ({ assetId }) => {
			setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
		};

		const handleCommentAdded = (payload) => {
			if (!payload) return;
			setComments((prev) => [...prev, payload]);
		};

		const handleCanvasNotes = ({ content }) => {
			setNotes(content);
			if (typeof window !== 'undefined') {
				localStorage.setItem(notesKey, content);
			}
		};

		instance.on('active_users', handleActiveUsers);
		instance.on('user_joined', handleUserJoined);
		instance.on('user_left', handleUserLeft);
		instance.on('asset_updated', handleAssetUpdated);
		instance.on('asset_deleted', handleAssetDeleted);
		instance.on('comment_added', handleCommentAdded);
		instance.on('canvas_note_updated', handleCanvasNotes);

		return () => {
			instance.emit('leave_studio', { studioId: params.id, user: userPayload });
			instance.off('active_users', handleActiveUsers);
			instance.off('user_joined', handleUserJoined);
			instance.off('user_left', handleUserLeft);
			instance.off('asset_updated', handleAssetUpdated);
			instance.off('asset_deleted', handleAssetDeleted);
			instance.off('comment_added', handleCommentAdded);
			instance.off('canvas_note_updated', handleCanvasNotes);
		};
	}, [authLoading, isAuthenticated, user, token, params.id, notesKey]);

	const sortedAssets = useMemo(
		() => [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
		[assets]
	);

	async function handleCreateComment(content) {
		const created = await post('/api/comments', { studioId: studio.id, content }, { auth: true, token });
		setComments((prev) => [...prev, created]);
		socket?.emit('comment_added', { studioId: studio.id, payload: created });
		pushToast({
			title: 'Komentar dikirim',
			description: 'Pesanmu sudah tersimpan di timeline.',
			variant: 'success'
		});
	}

	async function handleAssetUploaded(newAsset) {
		setAssets((prev) => [newAsset, ...prev]);
		socket?.emit('update_asset', { studioId: studio.id, payload: newAsset });
	}

	async function handleAssetRemoved(asset) {
		try {
			await del(`/api/assets/${asset.id}`, { auth: true, token });
			setAssets((prev) => prev.filter((item) => item.id !== asset.id));
			socket?.emit('delete_asset', { studioId: studio.id, assetId: asset.id });
			pushToast({
				title: 'Asset dihapus',
				description: asset.filename,
				variant: 'info'
			});
		} catch (err) {
			const message = err?.data?.message || 'Gagal menghapus asset.';
			pushToast({
				title: 'Gagal menghapus asset',
				description: typeof message === 'string' ? message : 'Coba lagi nanti.',
				variant: 'error'
			});
		}
	}

	function handleNotesChange(next) {
		setNotes(next);
		if (typeof window !== 'undefined') {
			localStorage.setItem(notesKey, next);
		}
		socket?.emit('canvas_note_update', { studioId: studio.id, payload: { content: next, user: user?.name } });
	}

	if (loading || !studio) {
		return (
			<div className="min-h-screen bg-neutral-950 text-white">
				<Navbar />
				<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
					{error ? (
						<div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-200">
							{error}
						</div>
					) : (
						<Loader label="Memuat studio..." />
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-neutral-950 text-white">
			<Navbar />
			<div className="grid flex-1 grid-cols-1 divide-y divide-white/5 lg:grid-cols-[320px_1fr_320px] lg:divide-x lg:divide-y-0">
				<FilePanel
					studioId={studio.id}
					assets={sortedAssets}
					onAssetUploaded={handleAssetUploaded}
					onAssetRemoved={handleAssetRemoved}
				/>
				<Canvas
					studio={studio}
					assets={sortedAssets}
					notes={notes}
					onNotesChange={handleNotesChange}
					presence={presence}
				/>
				<div className="flex h-full flex-col">
					<CommentPanel
						comments={comments}
						onSendComment={handleCreateComment}
					/>
					<ChatBox
						studioId={studio.id}
						socket={socket}
						currentUser={user}
					/>
				</div>
			</div>
		</div>
	);
}

function getInitials(name = '') {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

