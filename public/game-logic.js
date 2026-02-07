export const TIMER_SECONDS = 15;

export const getPlacementReward = (place) => {
  const rewards = [100, 50, -50, -100];
  return rewards[place - 1] || 0;
};

export const applyPlacementBonus = (currentPoints, place) =>
  Math.max(0, currentPoints + getPlacementReward(place));

export const calculateTimePoints = (elapsedSeconds, timerSeconds = TIMER_SECONDS) => {
  const clamped = Math.min(timerSeconds, Math.max(0, elapsedSeconds));
  return Math.max(0, Math.floor(timerSeconds - clamped));
};

export const getFiftyCost = ({ dailyFreeUsed, paidUses }) =>
  dailyFreeUsed ? 10 * Math.pow(2, paidUses) : 0;
