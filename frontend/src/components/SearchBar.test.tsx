import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
    it('renders correctly', () => {
        render(
            <BrowserRouter>
                <SearchBar />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText(/search for nigerian foods/i)).toBeInTheDocument();
    });

    it('updates input value on change', () => {
        render(
            <BrowserRouter>
                <SearchBar />
            </BrowserRouter>
        );
        const input = screen.getByPlaceholderText(/search for nigerian foods/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Mangoes' } });
        expect(input.value).toBe('Mangoes');
    });
});
