export const STATUS_COLORS = {
    completed: {
        bg: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        stripe: 'bg-emerald-500'
    },
    in_progress: {
        bg: 'bg-blue-500',
        badgeBg: 'bg-blue-500/20',
        text: 'text-blue-400',
        stripe: 'bg-blue-500'
    },
    pending: {
        bg: 'bg-orange-500',
        badgeBg: 'bg-orange-500/20',
        text: 'text-orange-400',
        stripe: 'bg-orange-500'
    },
    default: {
        bg: 'bg-gray-500',
        badgeBg: 'bg-gray-500/20',
        text: 'text-gray-400',
        stripe: 'bg-gray-500'
    }
};

export const PRIORITY_COLORS = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
    default: 'text-muted-foreground'
};

export const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

export const getPriorityColor = (priority) => {
    const key = priority?.toLowerCase() || 'default';
    return PRIORITY_COLORS[key] || PRIORITY_COLORS.default;
};
