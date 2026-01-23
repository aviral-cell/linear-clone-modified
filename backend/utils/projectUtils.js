import crypto from 'crypto';

export const generateProjectIdentifier = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50) || 'project';
  const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  return `${slug}-${uuid}`;
};
