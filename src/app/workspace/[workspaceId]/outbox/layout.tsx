import { Header } from './header';

export default function OutboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      {children}
    </div>
  );
}
