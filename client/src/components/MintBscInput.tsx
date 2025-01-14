import React, { useState } from 'react';
import styled from 'styled-components';
import { Contract } from 'ethers';
import { BSC_CLAIM } from 'core/constants';
import type { Web3Provider } from '@ethersproject/providers';

import abi from '../contracts/NFTMerkleDistributor.json';
import { useWeb3React } from '@web3-react/core';

const StyledMintInput = styled.div`
	display: flex;
	flex-direction: column;

	margin-top: 3rem;
	@media (max-width: 768px) {
		margin-top: 1rem;
	}
`;

const InputContainer = styled.div`
	display: flex;
	height: 4.5rem;
`;

const Input = styled.input`
	height: 100%;
	border: solid 2px var(--bg-03);
	transition: all 1s;
	background: rgba(255, 255, 255, 0.5);
	width: 21rem;
	font-size: 1.6rem;
	padding: 0 1rem;
	color: var(--text-primary);
	-moz-appearance: textfield;

	::-webkit-outer-spin-button {
		display: none;
	}
	::-webkit-inner-spin-button {
		display: none;
	}

	@media (max-width: 768px) {
		width: 100%;
		flex: 1;
	}
`;

interface ButtonProps {
	disabled: boolean;
}

const Button = styled.button`
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 2rem;
	background-color: var(--bg-03);
	transition: all 1s;
	color: white;
	font-size: 1.8rem;
	text-transform: uppercase;
	cursor: pointer;
	pointer-events: ${(props: ButtonProps) => (props.disabled ? 'none' : 'auto')};

	@media (max-width: 768px) {
		padding: 0 1rem;
	}
`;

const Error = styled.div`
	font-weight: 500;
	color: red;
	max-width: 64rem;
	line-height: 2.3rem;
	margin-top: 0.3rem;

	font-size: 1.4rem;
	@media (max-width: 768px) {
		font-size: 1.2rem;
		max-width: 80vw;
	}
`;

interface Props {
	balance: number;
	total: number;
	index: number;
	proof: string[];
	address: string;
	refresh: () => void;
}

const MintBscInput = ({ balance, total, refresh, index, proof, address }: Props) => {
	const { library } = useWeb3React<Web3Provider>();
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');
	const [error, setError] = useState('');

	const validate = (input: string): boolean => {
		if (balance === 0) {
			setError('You do not have any to claim');
			return false;
		}
		let value = 0;
		try {
			value = Number(input);
		} catch {
			setError('Invalid number');
			return false;
		}
		if (value <= 0) {
			setError('Must be 1 or more');
			return false;
		}
		if (value % 1 !== 0) {
			setError('Must be an integer');
			return false;
		}
		if (value > balance) {
			setError(`You only have ${balance} to claim`);
			return false;
		}
		setError('');
		return true;
	};

	const mint = () => {
		if (loading || balance === 0 || !validate(amount) || !library) return;

		const contract = new Contract(BSC_CLAIM, abi, library?.getSigner());

		contract
			.claim(index, address, total, amount, proof)
			.then((receipt: any) => {
				setLoading(true);
				receipt
					.wait()
					.then(() => {
						console.log('Mint submitted');
					})
					.catch((err: any) => {
						console.log('Error');
						console.log(err);
					})
					.finally(() => {
						setLoading(false);
						refresh();
					});
			})
			.catch((err: any) => {
				setError('Not enough ETH to cover gas');
				console.log('Error');
				console.log(err);
			});
	};

	return (
		<StyledMintInput>
			<InputContainer>
				<Input
					placeholder={`Enter amount (e.g. ${balance})`}
					type="number"
					value={amount}
					onChange={(e) => {
						validate(e.target.value);
						setAmount(e.target.value);
					}}
				/>
				<Button onClick={() => mint()} disabled={balance === 0}>
					{loading ? 'Loading' : 'Mint uwus'}
				</Button>
			</InputContainer>
			{error && <Error>{error}</Error>}
		</StyledMintInput>
	);
};

export default MintBscInput;
