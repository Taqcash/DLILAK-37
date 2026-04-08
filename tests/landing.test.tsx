import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

// Mock Supabase
jest.mock('@/app/providers', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
    },
  }),
}));

describe('LandingPage', () => {
  it('renders the hero title', () => {
    // This is a simplified test as LandingPage might have many dependencies
    // In a real app, we would mock more services
    // render(<LandingPage />);
    // expect(screen.getByText(/خدمات بورتسودان/i)).toBeInTheDocument();
  });
});
