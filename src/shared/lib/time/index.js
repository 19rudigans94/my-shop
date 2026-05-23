export const getTimePlus30Minutes = () => {
  const now = new Date();
  const futureTime = new Date(now);
  futureTime.setMinutes(futureTime.getMinutes() + 30);
  return futureTime.toISOString();
};
