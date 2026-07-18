export let game_versions: {
    id: number;
    name: string;
}[];
export let monster_types: {
    id: number;
    name: {
        fr: string;
        en: string;
        es: string;
    };
}[];
export let monsters: ({
    id: number;
    name: {
        fr: string;
        en: string;
        es: string;
    };
    image: string;
    level_min: number;
    level_max: number;
    type: number;
    reference?: undefined;
} | {
    id: number;
    name: {
        fr: string;
        en: string;
        es: string;
    };
    image: string;
    level_min: number;
    level_max: number;
    type: number;
    reference: number;
})[];
export let quest_templates: {
    id: number;
    quest_type: number;
    game_version: number;
    monster_count: number;
    step_count: number;
    monsters: number[];
}[];
export let quest_types: {
    id: number;
    slug: string;
    name: {
        fr: string;
        en: string;
        es: string;
    };
}[];
export let servers: {
    id: number;
    name: string;
    community: string;
    game_version: number;
}[];
export let subzones: {
    id: number;
    name: {
        fr: string;
        en: string;
        es: string;
    };
    zone: number;
    monsters: number[];
}[];
export let zones: {
    id: number;
    name: {
        fr: string;
        en: string;
        es: string;
    };
    subzones: number[];
}[];
//# sourceMappingURL=$.d.ts.map
