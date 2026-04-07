import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-burgundy hover:bg-burgundy/90 text-sm font-bold',
            card: 'shadow-2xl border border-gray-100 rounded-3xl',
          }
        }}
      />
    </div>
  );
}
