import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-taze-green">
          Yerel üretici platformu
        </p>
        <h1 className="text-4xl font-bold text-taze-green sm:text-5xl">
          Taze
        </h1>
        <p className="mx-auto mt-4 text-balance text-2xl font-semibold text-taze-soil">
          Üret. Görünür ol.
        </p>
      </div>

      <div>
        <Link
          href="/uretici-kayit"
          className="rounded-full bg-taze-green px-10 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-taze-green/90"
        >
          Üreticiyim, kayıt olmak istiyorum
        </Link>
      </div>
    </main>
  );
}
