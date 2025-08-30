"use client";

import { usePathname, useRouter } from "next-intl/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <select
      className="select select-bordered select-sm"
      onChange={onSelectChange}
      disabled={isPending}
      defaultValue={pathname.startsWith("/fr") ? "fr" : "en"}
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}
