/* eslint-disable */
import { Vagrant, Assist, Billposter, Ringmaster, Acrobat, Jester, Ranger, Magician, Psykeeper, Elementor, Mercenary, Blade, Knight } from "./jobs.js";
import { jobsjson } from "../assets/flyff/jobs.js";
import { setsjson } from "../assets/flyff/sets.js";
import { itemsjson } from "../assets/flyff/items.js";
import { skillsjson } from "../assets/flyff/skills.js";
import { monstersjson } from "../assets/flyff/monsters.js";
import { upgradesjson } from "../assets/flyff/upgradeBonus.js";

export class Utils {
    constructor() {
        this.character = new Vagrant();
        this.monsters = monstersjson.sort((a, b) => a.level < b.level ? -1 : a.level > b.level ? 1 : 0);
    }

    static skills = skillsjson;
    static items = itemsjson;
    static jobs = jobsjson;
    static sets = setsjson;
    static upgradeBonus = upgradesjson;

    static addedStr = 0;
    static addedSta = 0;
    static addedDex = 0;
    static addedInt = 0;
    
    static assistInt = 300;
    static assistBuffs = false;
    static classBuffs = false;
    static premiumItems = false;

    static maxLevel = 120;

    // These parameters come in different names, so this object describes those. Used in getExtraParam() etc. in mover.js
    static globalParams = {
        "attack": [ // attack appears as
            "damage",   // damage
            "attack"    // attack
        ],
        "str": [
            "str",
            "allstats"
        ],
        "sta": [
            "sta",
            "allstats"
        ],
        "dex": [
            "dex",
            "allstats"
        ],
        "int": [
            "int",
            "allstats"
        ]
    }

    static getItemByName(name)  { return this.items.find(item => item.name.en.toLowerCase() == name.toLowerCase()); }
    static getItemById(id)      { return this.items.find(item => item.id == id); }
    static getArmorByName(name) { return this.sets.find(set => set.name.en.toLowerCase() == name.toLowerCase()); }
    static getSkillByName(name) { return this.skills.find(skill => skill.name.en.toLowerCase() == name.toLowerCase()); }
    static getSkillById(id)     { return this.skills.find(skill => skill.id == id); }
    
    static getJobId(jobName) { return this.jobs.find(job => job.name.en == jobName).id || 9686; }   // 9686 = vagrant
    static getParentJobId(jobId) { return this.jobs.find(job => job.id == jobId).parent || 9686; }
    static getJobName(jobId) { return this.jobs.find(job => job.id == jobId).name.en || "Vagrant"; }
    
    static getJewelery(subcategory) {
        const deprecated = [
            2746	, // Arek Ring +0
            9239	, // Arek Ring +1
            8620	, // Arek Ring +2
            4760	, // Arek Ring +3
            9494	, // Arek Ring +4
            9640	, // Arek Ring +5
            9213	, // Arek Ring +6
            1460	, // Demol Earring +1
            3563	, // Demol Earring +2
            8953	, // Demol Earring +3
            4872	, // Demol Earring +4
            9005	, // Demol Earring +5
            6059	, // Demol Earring +6
            7665	, // Gore Necklace +1
            4397	, // Gore Necklace +2
            2503	, // Gore Necklace +3
            4765	, // Gore Necklace +4
            3677	, // Gore Necklace +5
            8772	, // Gore Necklace +6
            6687	, // Mental Necklace +1
            1898	, // Mental Necklace +2
            2004	, // Mental Necklace +3
            9481	, // Mental Necklace +4
            9297	, // Mental Necklace +5
            1770	, // Mental Necklace +6
            8290	, // Peision Necklace +1
            4919	, // Peision Necklace +2
            9406	, // Peision Necklace +3
            5708	, // Peision Necklace +4
            2829	, // Peision Necklace +5
            2125	, // Peision Necklace +6
            9883	, // Plug Earring +1
            4786	, // Plug Earring +2
            2771	, // Plug Earring +3
            8362	, // Plug Earring +4
            633	    , // Plug Earring +5
            6163	, // Plug Earring +6
            3231	, // Stam Ring +0
            4771	, // Stam Ring +1
            2540	, // Stam Ring +2
            4871	, // Stam Ring +3
            8588	, // Stam Ring +4
            3075	, // Stam Ring +5
            905	    , // Stam Ring +6
            1957	, // Vigor Ring +0
            5750	, // Vigor Ring +1
            4850	, // Vigor Ring +2
            2057	, // Vigor Ring +3
            5638	, // Vigor Ring +4
            4612	, // Vigor Ring +5
            3739	, // Vigor Ring +6
        ]

        let filtered = this.items
        .filter(item => item.category == "jewelry" && item.subcategory == subcategory)
        .filter(item => item.upgradeLevels || (deprecated.every(x => item.id !== x)));
        
        let result = filtered;

        filtered.forEach(item => {
            if (!item.upgradeLevels) {return;}
            item.upgradeLevels.slice(1).forEach(upgrade => {
                let clone = JSON.parse(JSON.stringify(item));
                // We cheat here. This way we don't need to modify save/load code
                clone.id = clone.id * 10000 + upgrade.upgradeLevel;
                clone.level = upgrade.requiredLevel;
                clone.abilities = upgrade.abilities;
                clone.name.en += ` +${upgrade.upgradeLevel}`;
                result.push(clone);
            })
        });

        return result;
    }
    static getPiercingCards() { return this.items.filter(item => item.subcategory == "piercingcard"); }
    static getShields() { return this.items.filter(item => item.subcategory == "shield"); }
    static getCloaks() { return this.items.filter(item => item.subcategory == "cloak" && item.abilities); }

    static getUpgradeBonus(upgradeLevel) { return this.upgradeBonus[upgradeLevel - 1] || null; }
    
    static getJobWeapons(jobId) {
        const jobs = [jobId, this.getParentJobId(jobId)]
        return this.items.filter(item => item.category == "weapon" && jobs.includes(item.class)); 
    }
    static getJobArmors(jobId) {
        const jobs = [jobId, this.getParentJobId(jobId)]
        return this.sets.filter(set => jobs.includes(this.getItemById(set.parts[0]).class)); 
    }


    static getWeaponSpeed(weapon) {
        if (!weapon) return 0;
        switch (weapon.subcategory) {
            case 'knuckle':
                return 0.07;
            case 'axe':
                return weapon.twoHanded ? 0.03 : 0.06;
            case 'sword':
                return weapon.twoHanded ? 0.035 : 0.085;
            case 'bow':
                return 0.07;
            case 'yoyo':
                return 0.075;
            case 'stick':
                return 0.05;
            case 'staff':
                return 0.045;
            case 'wand':
                return 0.025;
            default:
                return 0.075;
        }
    }

    static clamp(num, min, max) { return Math.min(Math.max(num, min), max); }

    static getJobFromId(jobId) { return JobFactory.createJobFromId(jobId); }

    static sortByName(a, b) {
        let aname = a.name.en.match(/([a-zA-Z ]+)/);
        let bname = b.name.en.match(/([a-zA-Z ]+)/);

        aname = (aname && aname[1]) || a.name.en;
        bname = (bname && bname[1]) || b.name.en;

        const alvl = a.name.en.match(/([\d]+)/);
        const blvl = b.name.en.match(/([\d]+)/);

        const aitemUpLvl = (alvl && Number.parseInt(alvl[1])) || 0;
        const bitemUpLvl = (blvl && Number.parseInt(blvl[1])) || 0;

        if (aname < bname) {
            return -1;
        }
        if (aname > bname) {
            return 1;
        }

        if (aitemUpLvl < bitemUpLvl) {
            return -1;
        }
        if (aitemUpLvl > bitemUpLvl) {
            return 1;
        }

        return 0;
    }

    static sortByLevel(a, b) {
        if (a.level < b.level) {
            return -1;
        }
        if (a.level > b.level) {
            return 1;
        }

        return 0;
    }

    updateJob(character, job) {
        if (character.constructor.name != job) { 
            let stats = {
                str: character.str,
                sta: character.sta,
                dex: character.dex,
                int: character.int,
                level: character.level
            };
            let c = JobFactory.createJobFromName(job, stats);
            return c;
        }

        return false;
    }

    getMonstersAtLevel(level, skill=null) {
        level = parseInt(level);
        let ignoreRanks = ['super', 'boss', 'giant', 'violet'];
        
        let index = this.monsters.findIndex(monster => monster.level >= level + 1)
        
        // Could not find monsters that are higher level than you, use the highest level monster
        if (index === null || index < 0) { index = this.monsters.length - 1 }
        
        let res = this.monsters.slice(Math.max(index - 10, 0), Math.min(index + 20, this.monsters.length))
        res = res.filter(function(monster) {
            return !ignoreRanks.includes(monster.rank) && monster.experience > 0 
                && !monster.name.en.includes("Criminal")
                && monster.spawns != undefined
                && monster.spawns.length > 0;
        });
        
        res.forEach(monster => {
            monster.playerDamage = this.character.getDamage(monster, skill);
            monster.playerDamage = monster.playerDamage <= 0 ? 1 : monster.playerDamage;
        });

        return res;
    }
    
    static newGuid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}

class JobFactory {
    static createJobFromName(job, stats) {
        switch (job) {
            case 'Vagrant': return new Vagrant(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Assist': return new Assist(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Billposter': return new Billposter(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Ringmaster': return new Ringmaster(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Acrobat': return new Acrobat(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Jester': return new Jester(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Ranger': return new Ranger(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Magician': return new Magician(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Psykeeper': return new Psykeeper(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Elementor': return new Elementor(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Mercenary': return new Mercenary(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Blade': return new Blade(stats.str, stats.sta, stats.int, stats.dex, stats.level);
            case 'Knight': return new Knight(stats.str, stats.sta, stats.int, stats.dex, stats.level);
        }
    }

    static createJobFromId(jobId) {
        switch (jobId) {
            case 9686: return new Vagrant();
            case 8962: return new Assist();
            case 7424: return new Billposter();
            case 9389: return new Ringmaster();
            case 9098: return new Acrobat();
            case 3545: return new Jester();
            case 9295: return new Ranger();
            case 9581: return new Magician();
            case 5709: return new Psykeeper();
            case 9150: return new Elementor();
            case 764: return new Mercenary();
            case 2246: return new Blade();
            case 5330: return new Knight();
        }
    }
}