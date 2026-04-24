export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
};
