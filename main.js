// ==UserScript==
// @name         Melvor Combat Calculator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Calculates how many levels you need to reach the next combat level!
// @author       martijnd
// @match		 https://*.melvoridle.com/*
// @exclude		 https://wiki.melvoridle.com*
// @noframes
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const COMBAT_SKILLS = [
    CONSTANTS.skill.Attack,
    CONSTANTS.skill.Strength,
    CONSTANTS.skill.Defence,
    CONSTANTS.skill.Hitpoints,
    CONSTANTS.skill.Ranged,
    CONSTANTS.skill.Magic,
    CONSTANTS.skill.Prayer,
  ];
  document
    .getElementById("nav-skill-tooltip-69")
    .addEventListener("mouseenter", () => {
      COMBAT_SKILLS.forEach((skillId) => {
        appendLvlEl(skillId);
      });
    });

  document
    .getElementById("nav-skill-tooltip-69")
    .addEventListener("mouseleave", () => {
      COMBAT_SKILLS.forEach((skillId) => {
        removeLvlEl(skillId);
      });
    });
})();

const lvlToXp = Array.from({ length: 200 }, (_, i) => exp.level_to_xp(i));

function appendLvlEl(skillId) {
  const span = document.createElement("span");
  span.innerText = " +" + getLevelsNeeded(skillId);
  span.id = `skill-togo-${skillId}`;
  span.style.color = "#eb4b36";
  document.getElementById(`skill-nav-name-${skillId}`).append(span);
}

function removeLvlEl(skillId) {
  const id = `skill-togo-${skillId}`;
  const el = document.getElementById(id);
  if (el) {
    el.remove();
  }
}

function calculateCombatLevel(skillId = null, level = null) {
  function getLevel(id) {
    return skillId === id ? level : convertXpToLvl(skillXP[id]);
  }

  const attackLevel = getLevel(CONSTANTS.skill.Attack);
  const strengthLevel = getLevel(CONSTANTS.skill.Strength);
  const defenceLevel = getLevel(CONSTANTS.skill.Defence);
  const prayerLevel = getLevel(CONSTANTS.skill.Prayer);
  const hitpointsLevel = getLevel(CONSTANTS.skill.Hitpoints);
  const rangedLevel = getLevel(CONSTANTS.skill.Ranged);
  const magicLevel = getLevel(CONSTANTS.skill.Magic);

  const baseCombatLevel =
    0.25 * (defenceLevel + hitpointsLevel + prayerLevel / 2);
  const meleeCombatLevel = 0.325 * (attackLevel + strengthLevel);
  const rangedCombatLevel = 0.325 * ((3 * rangedLevel) / 2);
  const magicCombatLevel = 0.325 * ((3 * magicLevel) / 2);

  return Math.floor(
    baseCombatLevel +
      Math.max(meleeCombatLevel, rangedCombatLevel, magicCombatLevel)
  );
}

function getLevelsNeeded(skillId) {
  const nextCombatLevel = calculateCombatLevel() + 1;

  for (let i = 0; i < 99; i++) {
    const combatLevel = calculateCombatLevel(
      skillId,
      convertXpToLvl(skillXP[skillId]) + i
    );
    if (combatLevel === nextCombatLevel) {
      return i;
    }
  }
}

/**
 * Thanks to Melvor ETA for this function
 * @see https://github.com/gmiclotte/Melvor-ETA
 */
function binarySearch(array, pred) {
  let lo = -1,
    hi = array.length;
  while (1 + lo < hi) {
    const mi = lo + ((hi - lo) >> 1);
    if (pred(array[mi])) {
      hi = mi;
    } else {
      lo = mi;
    }
  }
  return hi;
}

/**
 * Thanks to Melvor ETA for this function
 * @see https://github.com/gmiclotte/Melvor-ETA
 */
function convertXpToLvl(xp, noCap = false) {
  let level = binarySearch(lvlToXp, (t) => xp <= t) - 1;
  if (level < 1) {
    level = 1;
  } else if (!noCap && level > 99) {
    level = 99;
  }
  return level;
}
