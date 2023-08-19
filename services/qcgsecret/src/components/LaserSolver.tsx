import React, { useState } from 'react';
import '../styles/LaserSolver.css';
import Alert from './Alert';

const isValidNumber = (num: string): boolean => /^[1-4]*$/.test(num);
const hasUniqueDigits = (num: string): boolean => new Set(num.split('')).size === num.length;

// Reference
// Number 1 = control
// Number 2 = mid

const LaserSolver: React.FC = () => {
	const [number1, setNumber1] = useState<string>('');
	const [number2, setNumber2] = useState<string>('');
	const [result, setResult] = useState<string>('');

	const handleNumber1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		if (isValidNumber(newValue) && newValue.length <= 4 && hasUniqueDigits(newValue)) {
			setNumber1(newValue);
		}
	};

	const handleNumber2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		if (isValidNumber(newValue) && newValue.length <= 4 && hasUniqueDigits(newValue)) {
			setNumber2(newValue);
		}
	};

	const handleCalculate = () => {
		if (number1.length === 4 && number2.length === 4) {
			const paddedNumber1 = number1.padStart(4, '0');
			const paddedNumber2 = number2.padStart(4, '0');
			const roomNumbers = ('' + paddedNumber1).split('');
			const midNumbers = ('' + paddedNumber2).split('');

			const finalOrder = [0, 0, 0, 0];
			for (let i = 0; i < 4; i++) {
				const int = parseInt(midNumbers[i]!);
				const pos = parseInt(roomNumbers[i]!) - 1;
				finalOrder[pos] = int;
			}
			const sum = finalOrder.join('');
			setResult(sum.toString());
		} else {
			setResult('Invalid numbers');
		}
	};

	return (
		<Alert title="Laser Solver" type="info">
			<div className="laser-input-container">
				<input
					className="laser-input-field"
					type="text"
					maxLength={4}
					value={number1}
					onChange={handleNumber1Change}
					placeholder="Enter the control room laser order"
				/>
				<input
					className="laser-input-field"
					type="text"
					maxLength={4}
					value={number2}
					onChange={handleNumber2Change}
					placeholder="Enter the middle laser order"
				/>
				<button className="laser-button" onClick={handleCalculate}>
					Calculate
				</button>
				<div className="laser-result">
					<p>Result: {result}</p>
				</div>
			</div>
		</Alert>
	);
};

export default LaserSolver;
