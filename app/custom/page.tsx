import CustomBuilder from './Builder';

export const metadata = {
  title: 'Custom Package | Precision Details',
};

export default function CustomPackagePage() {
  return (
    <main className="min-h-svh bg-background px-6 py-14">
      <CustomBuilder />
    </main>
  );
}
