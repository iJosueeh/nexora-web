import { gql } from 'apollo-angular';

export const NOTIFICATION_HISTORY_QUERY = gql`
	query NotificationHistory($limit: Int!, $offset: Int!) {
		notificationHistory(limit: $limit, offset: $offset) {
			id
			type
			content
			isRead
			createdAt
			sender {
				id
				username
				fullName
				avatarUrl
			}
			post {
				id
				titulo
				imageUrl
			}
		}
	}
`;

export const UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
	query UnreadNotificationsCount {
		unreadNotificationsCount
	}
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
	mutation MarkNotificationAsRead($notificationId: ID!) {
		markNotificationAsRead(notificationId: $notificationId)
	}
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
	mutation MarkAllNotificationsAsRead {
		markAllNotificationsAsRead
	}
`;
