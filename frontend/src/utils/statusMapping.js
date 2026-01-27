export const normalizeUpdateStatus = (status) => {
  if (!status) return status;

  const mapping = {
    behind: 'off_track',
    blocked: 'off_track',
  };

  return mapping[status] || status;
};

export const isLegacyUpdateStatus = (status) => {
  return status === 'behind' || status === 'blocked';
};

export const getDisplayUpdateStatus = (status) => {
  return normalizeUpdateStatus(status);
};
