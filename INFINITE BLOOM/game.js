let turn = 1;

// DHALIA
let dhaliaMaxHP = 200;
let dhaliaHP = 200;
let dhaliaForm = 1; // 1 = Seed, 2 = Anthroflora, 3 = Human Plant
let bloomingReady = false;
let bloomingCounter = 0;
let dhaliaDamageMultiplier = 1.0;
let dhaliaStunnedTurns = 0;

// DHALIA STATUS
let regenTurns = 0;
let regenAmountPerTurn = 0;
let damageReductionPercent = 0;
let damageReductionTurns = 0;
let thornsPercent = 0;
let thornsTurns = 0;

// COOLDOWNS
let defendCD = 0;
let shieldCD = 0;
let aegisCD = 0;
let focusedCD = 0;
let thumbCD = 0;

// EMBER
let emberMaxHP = 150;
let emberHP = 150;
let emberPhase = 1;
let emberDamageMultiplier = 1.0;
let emberDoubleAttackTurns = 0;
let emberUltCharge = 0;
let ashTurns = 0;
let moltenAshTurns = 0;
let lightningBuff = false;

// INIT
updateButtons();
updateUI();
log("Dhalia faces Ember. The battle begins.");

// GAME LOOP
function nextTurn() {
    turn++;
    document.getElementById("turn").innerText = `Turn: ${turn} / 60`;

    // Blooming cooldown
    bloomingCounter++;
    if (bloomingCounter >= 5) bloomingReady = true;

    // Cooldowns tick
    if (defendCD > 0) defendCD--;
    if (shieldCD > 0) shieldCD--;
    if (aegisCD > 0) aegisCD--;
    if (focusedCD > 0) focusedCD--;
    if (thumbCD > 0) thumbCD--;

    // Ember Phase 2 HP loss
    if (emberPhase === 2) {
        let loss = emberMaxHP * 0.10;
        emberHP -= loss;
        log(`Blue Ember loses ${loss.toFixed(1)} HP from instability.`);
    }

    // Status effects
    if (moltenAshTurns > 0) {
        let dmg = dhaliaMaxHP * 0.03;
        applyDamageToDhalia(dmg, "Molten Ash");
        moltenAshTurns--;
        log(`Molten Ash deals ${dmg.toFixed(1)} damage.`);
    }

    if (ashTurns > 0) ashTurns--;

    if (regenTurns > 0) {
        let heal = regenAmountPerTurn;
        applyHealingToDhalia(heal, "Regeneration");
        regenTurns--;
        log(`Regeneration heals ${heal.toFixed(1)} HP.`);
    }

    if (damageReductionTurns > 0) {
        damageReductionTurns--;
        if (damageReductionTurns <= 0) {
            damageReductionPercent = 0;
            log("Dhalia's damage reduction fades.");
        }
    }

    if (thornsTurns > 0) {
        thornsTurns--;
        if (thornsTurns <= 0) {
            thornsPercent = 0;
            log("Dhalia's thorns fade.");
        }
    }

    // Ember acts
    emberTurn();

    // Check evolutions
    checkEvolution();

    // Update UI
    updateUI();
    updateButtons();

    // End game
    if (turn >= 60 || dhaliaHP <= 0 || emberHP <= 0) endGame();
}

function useSkill1() {
    if (dhaliaStunnedTurns > 0) {
        log("Dhalia is stunned and cannot act.");
        dhaliaStunnedTurns--;
        nextTurn();
        return;
    }

    if (dhaliaForm === 1) {
        // Stage 1 Plant Attack
        let base = 15 * dhaliaDamageMultiplier;
        let crit = Math.random() < 0.12;
        let dmg = crit ? base * 2 : base;
        emberHP -= dmg;
        log(`Dhalia uses Plant Attack for ${dmg.toFixed(1)} damage${crit ? " (CRIT!)" : ""}.`);
    } else if (dhaliaForm === 2) {
        // Stage 2 Plant Attack with lifesteal
        let dmg = 15 * dhaliaDamageMultiplier;
        emberHP -= dmg;
        let heal = 10;
        applyHealingToDhalia(heal, "Lifesteal");
        log(`Dhalia uses Plant Attack for ${dmg.toFixed(1)} damage and heals 10 HP.`);
    } else if (dhaliaForm === 3) {
        // Stage 3 Double Attack
        let dmg1 = 15 * dhaliaDamageMultiplier;
        let dmg2 = 15 * dhaliaDamageMultiplier;
        emberHP -= (dmg1 + dmg2);
        let heal = 20;
        applyHealingToDhalia(heal, "Double Lifesteal");
        log(`Dhalia uses Double Attack for ${(dmg1 + dmg2).toFixed(1)} damage and heals 20 HP.`);
    }

    nextTurn();
}

function useSkill2() {
    if (dhaliaStunnedTurns > 0) {
        log("Dhalia is stunned and cannot act.");
        dhaliaStunnedTurns--;
        nextTurn();
        return;
    }

    if (dhaliaForm === 1) {
        // Plant Defend
        if (defendCD > 0) {
            log("Plant Defend is on cooldown.");
            return;
        }
        damageReductionPercent = 0.10;
        damageReductionTurns = 1;
        defendCD = 1;
        cleanseAsh();
        log("Dhalia uses Plant Defend: 10% damage reduction for 1 turn and cleanses ASH.");
    } else if (dhaliaForm === 2) {
        // Plant Shield
        if (shieldCD > 0) {
            log("Plant Shield is on cooldown.");
            return;
        }
        regenAmountPerTurn = dhaliaMaxHP * 0.05;
        regenTurns = 2;
        damageReductionPercent = 0.15;
        damageReductionTurns = 2;
        shieldCD = 2;
        cleanseAsh();
        log("Dhalia uses Plant Shield: regen + 15% damage reduction for 2 turns and cleanses ASH.");
    } else if (dhaliaForm === 3) {
        // Plant Aegis
        if (aegisCD > 0) {
            log("Plant Aegis is on cooldown.");
            return;
        }
        regenAmountPerTurn = dhaliaMaxHP * 0.05;
        regenTurns = 2;
        damageReductionPercent = 0.20;
        damageReductionTurns = 3;
        aegisCD = 2;
        cleanseAsh();
        log("Dhalia uses Plant Aegis: regen + 20% damage reduction for 3 turns and cleanses ASH.");
    }

    nextTurn();
}

function useSkill3() {
    if (dhaliaStunnedTurns > 0) {
        log("Dhalia is stunned and cannot act.");
        dhaliaStunnedTurns--;
        nextTurn();
        return;
    }

    if (dhaliaForm === 1) {
        // Growth
        let heal = dhaliaMaxHP * 0.10;
        applyHealingToDhalia(heal, "Growth");
        log(`Dhalia uses Growth and heals ${heal.toFixed(1)} HP.`);
    } else if (dhaliaForm === 2) {
        // Focused Attack
        if (focusedCD > 0) {
            log("Focused Attack is on cooldown.");
            return;
        }
        let dmg = emberMaxHP * 0.05;
        emberHP -= dmg;
        focusedCD = 2;
        log(`Dhalia uses Focused Attack for ${dmg.toFixed(1)} damage (5% of Ember's max HP).`);
    } else if (dhaliaForm === 3) {
        // Plant Thumb
        if (thumbCD > 0) {
            log("Plant Thumb is on cooldown.");
            return;
        }
        let dmg = emberMaxHP * 0.15;
        emberHP -= dmg;
        thornsPercent = 0.10;
        thornsTurns = 3;
        thumbCD = 3;
        log(`Dhalia uses Plant Thumb for ${dmg.toFixed(1)} damage (15% of Ember's max HP) and gains Thorns.`);
    }

    nextTurn();
}

function useBlooming() {
    if (dhaliaStunnedTurns > 0) {
        log("Dhalia is stunned and cannot act.");
        dhaliaStunnedTurns--;
        nextTurn();
        return;
    }

    if (!bloomingReady || dhaliaForm < 3) {
        log("Blooming is not ready or Dhalia is not in final form.");
        return;
    }

    dhaliaHP = dhaliaMaxHP;
    dhaliaDamageMultiplier = 1.15;
    bloomingReady = false;
    bloomingCounter = 0;

    log("Dhalia uses BLOOMING! Full heal + 15% damage.");
    nextTurn();
}

// EMBER TURN
function emberTurn() {
    if (emberDoubleAttackTurns > 0) {
        emberAttack();
        emberAttack();
        emberDoubleAttackTurns--;
        return;
    }

    // Ult charge
    emberUltCharge++;
    if (emberPhase === 1 && emberUltCharge >= 6) {
        emberWhiteFlame();
        emberUltCharge = 0;
        return;
    }
    if (emberPhase === 2 && emberUltCharge >= 6) {
        emberBlueNirvana();
        emberUltCharge = 0;
        return;
    }

    // Random attack
    let choice = Math.random();
    if (choice < 0.5) emberFlameBurn();
    else emberFlameCharge();
}

function emberAttack() {
    let base = 15 * emberDamageMultiplier;
    let dmg = applyDamageToDhalia(base, "Ember Attack");
    log(`Ember hits for ${dmg.toFixed(1)} damage.`);

    if (lightningBuff && Math.random() < 0.12) {
        dhaliaStunnedTurns = 1;
        log("Dhalia is stunned by Blue Nirvana's lightning!");
    }
}

function emberFlameBurn() {
    let base = 15 * emberDamageMultiplier;
    let dmg = applyDamageToDhalia(base, "Flame Burn");
    ashTurns = 2;
    log(`Ember uses Flame Burn for ${dmg.toFixed(1)} damage. ASH applied.`);
}

function emberFlameCharge() {
    emberDoubleAttackTurns = 2;
    log("Ember charges up! She will attack twice for 2 turns.");
}

function emberWhiteFlame() {
    emberDamageMultiplier = 1.2;
    log("Ember uses WHITE FLAME OF DIVINE! +20% damage.");

    if (ashTurns > 0) {
        moltenAshTurns = 3;
        ashTurns = 0;
        log("ASH becomes MOLTEN ASH!");
    }
}

function emberBlueNirvana() {
    let heal = emberMaxHP * 0.20;
    emberHP = Math.min(emberHP + heal, emberMaxHP);
    lightningBuff = true;
    log(`Blue Ember uses BLUE NIRVANA! Heals ${heal.toFixed(1)} HP and gains Lightning Stun.`);
}

// DAMAGE / HEAL HELPERS
function applyDamageToDhalia(amount, source) {
    let dmg = amount;
    if (damageReductionPercent > 0) {
        dmg = amount * (1 - damageReductionPercent);
    }
    dhaliaHP -= dmg;

    if (thornsPercent > 0) {
        let reflect = dmg * thornsPercent;
        emberHP -= reflect;
        log(`Thorns reflect ${reflect.toFixed(1)} damage back to Ember.`);
    }

    return dmg;
}

function applyHealingToDhalia(amount, source) {
    let heal = amount;
    if (ashTurns > 0) heal *= 0.9;
    if (moltenAshTurns > 0) heal *= 0.8;
    dhaliaHP = Math.min(dhaliaHP + heal, dhaliaMaxHP);
    return heal;
}

function cleanseAsh() {
    ashTurns = 0;
    moltenAshTurns = 0;
    log("ASH and MOLTEN ASH are cleansed.");
}

// EVOLUTIONS
function checkEvolution() {
    if (dhaliaHP >= 120 && dhaliaForm === 1) {
        dhaliaForm = 2;
        dhaliaHP = dhaliaMaxHP;
        log("Dhalia evolves into Anthroflora and fully heals!");
        updateButtons();
    }
    if (dhaliaHP >= 160 && dhaliaForm === 2) {
        dhaliaForm = 3;
        dhaliaHP = dhaliaMaxHP;
        log("Dhalia evolves into Human‑Plant and fully heals!");
        updateButtons();
    }

    if (emberHP <= emberMaxHP * 0.5 && emberPhase === 1) {
        emberPhase = 2;
        emberDamageMultiplier = 1.5;
        log("EMBER REBIRTHS INTO BLUE EMBER!");
    }
}

// UI
function updateUI() {
    document.getElementById("dhalia-hp").innerText = `HP: ${dhaliaHP.toFixed(1)} / ${dhaliaMaxHP}`;
    document.getElementById("dhalia-form").innerText = `Form: ${["Seed","Anthroflora","Human Plant"][dhaliaForm-1]}`;
    document.getElementById("ember-hp").innerText = `HP: ${emberHP.toFixed(1)} / ${emberMaxHP}`;
    document.getElementById("ember-phase").innerText = `Phase: ${emberPhase === 1 ? "1 (Fire)" : "2 (Blue Ember)"}`;
}

function updateButtons() {
    const b1 = document.getElementById("btn1");
    const b2 = document.getElementById("btn2");
    const b3 = document.getElementById("btn3");
    const b4 = document.getElementById("btn4");

    if (dhaliaForm === 1) {
        b1.innerText = "Plant Attack";
        b2.innerText = "Plant Defend";
        b3.innerText = "Growth";
    } else if (dhaliaForm === 2) {
        b1.innerText = "Plant Attack (Lifesteal)";
        b2.innerText = "Plant Shield";
        b3.innerText = "Focused Attack";
    } else if (dhaliaForm === 3) {
        b1.innerText = "Double Attack";
        b2.innerText = "Plant Aegis";
        b3.innerText = "Plant Thumb";
    }

    // Cooldown visual
    b2.classList.toggle("cooldown",
        (dhaliaForm === 1 && defendCD > 0) ||
        (dhaliaForm === 2 && shieldCD > 0) ||
        (dhaliaForm === 3 && aegisCD > 0)
    );

    b3.classList.toggle("cooldown",
        (dhaliaForm === 2 && focusedCD > 0) ||
        (dhaliaForm === 3 && thumbCD > 0)
    );

    b4.classList.toggle("cooldown", !bloomingReady || dhaliaForm < 3);
}

function log(text) {
    let logBox = document.getElementById("log");
    logBox.innerHTML += text + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
}

function endGame() {
    if (dhaliaHP <= 0) log("Dhalia has burned. Ember wins.");
    else if (emberHP <= 0) log("Ember extinguished. Dhalia blooms.");
    else log("Time’s up. Final bloom achieved.");
}
