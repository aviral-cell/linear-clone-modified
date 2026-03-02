export const normalizeUpdateStatus = (status) => {
  if (!status) return status;

  const mapping = {
    behind: 'off_track',
    blocked: 'off_track',
  };

  return mapping[status] || status;
};
