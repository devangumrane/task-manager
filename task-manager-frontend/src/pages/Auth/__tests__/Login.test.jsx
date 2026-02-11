import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import Login from '../Login';
import * as useAuthHook from '../../../hooks/useAuth';

// Initialize mock
const mockLoginMutate = vi.fn();

// Mock useAuth
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        login: {
            mutate: mockLoginMutate,
            isPending: false
        }
    })
}));

describe('Login Component', () => {
    it('renders login form correctly', () => {
        render(<Login />);

        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText(/don't have an account\? sign up/i)).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        render(<Login />);

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
            // Password validation might explicitly say "required" or min length
            // Schema says: z.string().min(8, "Password must be at least 8 characters")
            // Zod usually returns "Required" for empty string if not refined? No, min(8) on empty string fails min(8).
            expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid data', async () => {
        render(<Login />);

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLoginMutate).toHaveBeenCalledWith(
                { email: 'test@example.com', password: 'password123' },
                expect.any(Object) // options object
            );
        });
    });
});
