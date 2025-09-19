interface BalanceRemainingValueProps {
	maxValue: number;
	newValue: number;
	newIndex: number;
	currentValues: number[];
}

export const balanceRemainingValue = ({
	maxValue = 1,
	newValue,
	newIndex,
	currentValues
}: BalanceRemainingValueProps) => {
	const count = currentValues.length;
	const prevRemaining = maxValue - currentValues[newIndex];
	const newRemaining = maxValue - newValue;
	const newShares = currentValues.map((share, i) => {
		if (newIndex === i) {
			return newValue;
		} else {
			const shareOfRemaining =
				prevRemaining === 0 ? newRemaining / (count - 1) : newRemaining * (share / prevRemaining);

			return shareOfRemaining;
		}
	});
	return newShares;
};
