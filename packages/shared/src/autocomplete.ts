import Fuse from 'fuse.js';

export type AutocompleteChoices = {
	name: string;
	value: string;
}[];

const options = {
	isCaseSensitive: false,
	includeScore: true,
	shouldSort: true,
	findAllMatches: true,
	keys: ['name', 'value'],
};

export const getAutocompleteResults = (choices: AutocompleteChoices, focusedValue: string) => {
	if (!focusedValue) return choices.slice(0, 25);
	else
		return new Fuse(choices, options)
			.search(focusedValue)
			.slice(0, 25)
			.map((item) => item.item);
};
