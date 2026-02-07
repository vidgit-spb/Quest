import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIMER_SECONDS,
  calculateTimePoints,
  getFiftyCost,
  getPlacementReward,
  applyPlacementBonus
} from '../public/game-logic.js';

test('calculateTimePoints uses speed bonus and clamps at zero', () => {
  assert.equal(calculateTimePoints(0, TIMER_SECONDS), 15);
  assert.equal(calculateTimePoints(3.2, TIMER_SECONDS), 11);
  assert.equal(calculateTimePoints(14.9, TIMER_SECONDS), 0);
  assert.equal(calculateTimePoints(22, TIMER_SECONDS), 0);
});

test('placement rewards follow rules', () => {
  assert.equal(getPlacementReward(1), 100);
  assert.equal(getPlacementReward(2), 50);
  assert.equal(getPlacementReward(3), -50);
  assert.equal(getPlacementReward(4), -100);
  assert.equal(getPlacementReward(5), 0);
});

test('applyPlacementBonus never drops below zero', () => {
  assert.equal(applyPlacementBonus(20, 4), 0);
  assert.equal(applyPlacementBonus(200, 1), 300);
});

test('50/50 cost grows exponentially after free use', () => {
  assert.equal(getFiftyCost({ dailyFreeUsed: false, paidUses: 0 }), 0);
  assert.equal(getFiftyCost({ dailyFreeUsed: true, paidUses: 0 }), 10);
  assert.equal(getFiftyCost({ dailyFreeUsed: true, paidUses: 1 }), 20);
  assert.equal(getFiftyCost({ dailyFreeUsed: true, paidUses: 2 }), 40);
});
