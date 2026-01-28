const generateBaseURL = () => {
  const currentHost = window?.location?.host || 'localhost:8000';
  const currentProtocol = window?.location?.protocol || 'http:';
  const baseURL = `${currentProtocol}//${currentHost.replace('8000', '8080')}`;
  return baseURL;
};

export const baseURL = generateBaseURL();

const avatarColors = [
  'bg-purple-600',
  'bg-blue-600',
  'bg-green-600',
  'bg-yellow-600',
  'bg-red-600',
  'bg-pink-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-orange-600',
];

export const getAvatarColor = (userId) => {
  if (!userId) return 'bg-gray-600';
  const index = userId.charCodeAt(userId.length - 1) % avatarColors.length;
  return avatarColors[index];
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (options.relative) {
    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
  }

  const timezone = options.timezone || 'local';

  if (timezone === 'GMT' || timezone === 'UTC') {
    return date.toUTCString().replace('GMT', 'UTC');
  }

  const formatOptions = {
    year: options.showYear !== false ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  Object.keys(formatOptions).forEach((key) => {
    if (formatOptions[key] === undefined) {
      delete formatOptions[key];
    }
  });

  return date.toLocaleString(undefined, formatOptions);
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (options.relative) {
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
  }

  const timezone = options.timezone || 'local';

  if (timezone === 'GMT' || timezone === 'UTC') {
    return date.toUTCString().split(' ').slice(0, 4).join(' ');
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString, options = {}) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const timezone = options.timezone || 'local';

  if (timezone === 'GMT' || timezone === 'UTC') {
    return date.toUTCString().split(' ')[4];
  }

  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};
