const normalizeEmail = (email) => {
  if (!email) return '';
  const emailNormalized = email.replace(/\./g, '');
  return emailNormalized;
};

export default normalizeEmail;
