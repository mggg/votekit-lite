export function randomRunName(): string {
	const adjectives = ['Swift', 'Crimson', 'Emerald', 'Silent', 'Lucky', 'Brave', 'Neon', 'Clever'];
	const animals = ['Falcon', 'Otter', 'Lion', 'Fox', 'Panda', 'Eagle', 'Whale', 'Cobra'];
	const a = adjectives[Math.floor(Math.random() * adjectives.length)];
	const b = animals[Math.floor(Math.random() * animals.length)];
	const n = Math.floor(Math.random() * 900 + 100);
	return `${a} ${b} ${n}`;
}
